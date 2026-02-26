"""
Typing Practice Service
Handles business logic for typing practice modes (pinyin, IME, speed) and progress tracking
"""
from datetime import datetime
from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from app.models import TypingProgress, HanziWord, User


class TypingService:
    """Service for managing typing practice progress across different modes"""

    @staticmethod
    def get_words_for_practice(
        db: Session,
        user: User,
        hsk_level: int,
        mode: str,
        limit: int = 20
    ) -> List[HanziWord]:
        """
        Get words for typing practice by HSK level and mode
        Prioritizes words user hasn't practiced yet in this mode
        """
        # Get words user has already practiced in this mode
        practiced_word_ids = db.query(TypingProgress.word_id).filter(
            and_(
                TypingProgress.user_id == user.id,
                TypingProgress.mode == mode
            )
        ).subquery()

        # Get new words (not yet practiced in this mode)
        new_words = db.query(HanziWord).filter(
            HanziWord.hsk_level == hsk_level,
            ~HanziWord.id.in_(practiced_word_ids)
        ).limit(limit // 2).all()

        # If not enough new words, add some practiced ones with low mastery
        if len(new_words) < limit:
            remaining = limit - len(new_words)
            practiced_words = db.query(HanziWord).join(
                TypingProgress, TypingProgress.word_id == HanziWord.id
            ).filter(
                TypingProgress.user_id == user.id,
                TypingProgress.mode == mode,
                HanziWord.hsk_level == hsk_level,
                TypingProgress.mastery_level < 8  # Not yet mastered
            ).order_by(TypingProgress.mastery_level.asc()).limit(remaining).all()

            new_words.extend(practiced_words)

        return new_words

    @staticmethod
    def record_attempt(
        db: Session,
        user: User,
        word_id: int,
        mode: str,
        is_correct: bool,
        time_taken: float,
        typed_text: str,
        expected_text: str,
        wpm: Optional[float] = None,
        ime_attempts: Optional[int] = None,
        tone_errors: Optional[List[int]] = None
    ) -> TypingProgress:
        """
        Record a typing practice attempt and update progress
        Handles mode-specific metrics (pinyin accuracy, WPM, IME accuracy)
        """
        # Get or create progress record for this user, word, and mode
        progress = db.query(TypingProgress).filter(
            and_(
                TypingProgress.user_id == user.id,
                TypingProgress.word_id == word_id,
                TypingProgress.mode == mode
            )
        ).first()

        if not progress:
            progress = TypingProgress(
                user_id=user.id,
                word_id=word_id,
                mode=mode,
                total_attempts=0,
                successful_attempts=0,
                accuracy_score=0.0,
                pinyin_accuracy=0.0,
                best_wpm=0.0,
                average_wpm=0.0,
                average_time_per_char=0.0,
                ime_selection_accuracy=0.0,
                ime_average_attempts=0.0,
                mastery_level=0
            )
            db.add(progress)

        # Update attempt counts
        progress.total_attempts += 1
        if is_correct:
            progress.successful_attempts += 1

        # Calculate overall accuracy
        progress.accuracy_score = (
            progress.successful_attempts / progress.total_attempts
        ) * 100

        # Mode-specific updates
        if mode == 'pinyin':
            TypingService._update_pinyin_metrics(
                progress, is_correct, tone_errors, expected_text
            )
        elif mode == 'speed':
            TypingService._update_speed_metrics(
                progress, wpm, time_taken, typed_text
            )
        elif mode == 'ime':
            TypingService._update_ime_metrics(
                progress, is_correct, ime_attempts
            )

        # Calculate and update mastery level
        progress.mastery_level = TypingService.calculate_mastery_level(
            mode=mode,
            total_attempts=progress.total_attempts,
            accuracy_score=progress.accuracy_score,
            successful_attempts=progress.successful_attempts,
            pinyin_accuracy=progress.pinyin_accuracy if mode == 'pinyin' else None,
            average_wpm=progress.average_wpm if mode == 'speed' else None
        )

        # Update last practiced timestamp
        progress.last_practiced = datetime.utcnow()

        db.commit()
        db.refresh(progress)

        return progress

    @staticmethod
    def _update_pinyin_metrics(
        progress: TypingProgress,
        is_correct: bool,
        tone_errors: Optional[List[int]],
        expected_text: str
    ):
        """Update metrics specific to pinyin typing mode"""
        if tone_errors is not None:
            # Calculate tone accuracy for this attempt
            tone_accuracy = (
                (len(expected_text) - len(tone_errors)) / len(expected_text)
            ) * 100 if len(expected_text) > 0 else 0

            # Running average for pinyin accuracy
            if progress.total_attempts == 1:
                progress.pinyin_accuracy = tone_accuracy
            else:
                progress.pinyin_accuracy = (
                    progress.pinyin_accuracy * (progress.total_attempts - 1) +
                    tone_accuracy
                ) / progress.total_attempts

    @staticmethod
    def _update_speed_metrics(
        progress: TypingProgress,
        wpm: Optional[float],
        time_taken: float,
        typed_text: str
    ):
        """Update metrics specific to speed typing mode"""
        if wpm is not None:
            # Update best WPM
            if wpm > progress.best_wpm:
                progress.best_wpm = wpm

            # Running average for WPM
            if progress.total_attempts == 1:
                progress.average_wpm = wpm
            else:
                progress.average_wpm = (
                    progress.average_wpm * (progress.total_attempts - 1) + wpm
                ) / progress.total_attempts

            # Calculate average time per character
            if len(typed_text) > 0:
                time_per_char = (time_taken / len(typed_text)) * 1000  # milliseconds
                if progress.total_attempts == 1:
                    progress.average_time_per_char = time_per_char
                else:
                    progress.average_time_per_char = (
                        progress.average_time_per_char * (progress.total_attempts - 1) +
                        time_per_char
                    ) / progress.total_attempts

    @staticmethod
    def _update_ime_metrics(
        progress: TypingProgress,
        is_correct: bool,
        ime_attempts: Optional[int]
    ):
        """Update metrics specific to IME practice mode"""
        if ime_attempts is not None:
            # Calculate selection accuracy (100 if first try, 50 otherwise)
            selection_accuracy = 100 if ime_attempts == 1 else 50

            # Running average for IME selection accuracy
            if progress.total_attempts == 1:
                progress.ime_selection_accuracy = selection_accuracy
                progress.ime_average_attempts = ime_attempts
            else:
                progress.ime_selection_accuracy = (
                    progress.ime_selection_accuracy * (progress.total_attempts - 1) +
                    selection_accuracy
                ) / progress.total_attempts
                progress.ime_average_attempts = (
                    progress.ime_average_attempts * (progress.total_attempts - 1) +
                    ime_attempts
                ) / progress.total_attempts

    @staticmethod
    def calculate_mastery_level(
        mode: str,
        total_attempts: int,
        accuracy_score: float,
        successful_attempts: int,
        pinyin_accuracy: Optional[float] = None,
        average_wpm: Optional[float] = None
    ) -> int:
        """
        Calculate mastery level (0-10) based on performance and mode

        Mastery levels:
        0-2: Beginner (< 60% accuracy or < 3 attempts)
        3-5: Learning (60-80% accuracy)
        6-8: Proficient (80-90% accuracy with 3+ successes)
        9-10: Mastered (>90% accuracy with 5+ successes, plus mode-specific criteria)
        """
        # Need minimum attempts to reach higher levels
        if total_attempts < 3:
            return min(2, int(accuracy_score / 30))

        # Calculate success rate
        success_rate = successful_attempts / total_attempts if total_attempts > 0 else 0

        # Base level on accuracy
        if accuracy_score < 60:
            base_level = 0 + int(accuracy_score / 20)  # 0-2
        elif accuracy_score < 80:
            base_level = 3 + int((accuracy_score - 60) / 7)  # 3-5
        elif accuracy_score < 90:
            base_level = 6 + int((accuracy_score - 80) / 3.5)  # 6-8
        else:
            base_level = 9  # 9-10

        # Mode-specific bonuses
        if mode == 'pinyin' and pinyin_accuracy and pinyin_accuracy >= 95 and success_rate >= 0.8:
            base_level = min(10, base_level + 1)
        elif mode == 'speed' and average_wpm and average_wpm >= 40 and success_rate >= 0.8:
            base_level = min(10, base_level + 1)
        elif mode == 'ime' and success_rate >= 0.9 and successful_attempts >= 5:
            base_level = min(10, base_level + 1)

        return int(base_level)

    @staticmethod
    def get_user_progress(
        db: Session,
        user: User,
        mode: Optional[str] = None,
        hsk_level: Optional[int] = None
    ) -> List[TypingProgress]:
        """
        Get all typing progress for a user, optionally filtered by mode and/or HSK level
        """
        query = db.query(TypingProgress).filter(
            TypingProgress.user_id == user.id
        )

        if mode:
            query = query.filter(TypingProgress.mode == mode)

        if hsk_level:
            query = query.join(HanziWord).filter(
                HanziWord.hsk_level == hsk_level
            )

        return query.all()

    @staticmethod
    def get_statistics(
        db: Session,
        user: User,
        mode: Optional[str] = None,
        hsk_level: Optional[int] = None
    ) -> Dict:
        """
        Get typing practice statistics for a user
        Optionally filtered by mode and/or HSK level
        """
        query = db.query(TypingProgress).filter(
            TypingProgress.user_id == user.id
        )

        if mode:
            query = query.filter(TypingProgress.mode == mode)

        if hsk_level:
            query = query.join(HanziWord).filter(
                HanziWord.hsk_level == hsk_level
            )

        all_progress = query.all()

        if not all_progress:
            return {
                "total_words_practiced": 0,
                "total_attempts": 0,
                "average_accuracy": 0.0,
                "average_wpm": 0.0,
                "best_wpm": 0.0,
                "mastered_words": 0,
                "words_in_progress": 0,
                "new_words": 0
            }

        total_attempts = sum(p.total_attempts for p in all_progress)
        avg_accuracy = sum(p.accuracy_score for p in all_progress) / len(all_progress)

        # Calculate WPM stats (only for speed mode records)
        speed_records = [p for p in all_progress if p.mode == 'speed']
        avg_wpm = (
            sum(p.average_wpm for p in speed_records) / len(speed_records)
            if speed_records else 0
        )
        best_wpm = max((p.best_wpm for p in speed_records), default=0)

        # Count by mastery level
        mastered = sum(1 for p in all_progress if p.mastery_level >= 8)
        in_progress = sum(1 for p in all_progress if 3 <= p.mastery_level < 8)
        new = sum(1 for p in all_progress if p.mastery_level < 3)

        return {
            "total_words_practiced": len(all_progress),
            "total_attempts": total_attempts,
            "average_accuracy": round(avg_accuracy, 2),
            "average_wpm": round(avg_wpm, 2),
            "best_wpm": round(best_wpm, 2),
            "mastered_words": mastered,
            "words_in_progress": in_progress,
            "new_words": new
        }

    @staticmethod
    def get_progress_by_word(
        db: Session,
        user: User,
        word_id: int,
        mode: str
    ) -> Optional[TypingProgress]:
        """
        Get typing progress for a specific word and mode
        """
        return db.query(TypingProgress).filter(
            and_(
                TypingProgress.user_id == user.id,
                TypingProgress.word_id == word_id,
                TypingProgress.mode == mode
            )
        ).first()
