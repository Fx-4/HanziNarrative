"""
Writing Practice Service
Handles business logic for character writing practice and progress tracking
"""
from datetime import datetime
from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from app.models import WritingProgress, HanziWord, User


class WritingService:
    """Service for managing writing practice progress"""

    @staticmethod
    def get_characters_for_practice(
        db: Session,
        user: User,
        hsk_level: int,
        limit: int = 20
    ) -> List[HanziWord]:
        """
        Get characters for writing practice by HSK level
        Prioritizes characters user hasn't practiced yet
        """
        # Get characters user has already practiced
        practiced_word_ids = db.query(WritingProgress.word_id).filter(
            WritingProgress.user_id == user.id
        ).subquery()

        # Get new characters (not yet practiced)
        new_characters = db.query(HanziWord).filter(
            HanziWord.hsk_level == hsk_level,
            ~HanziWord.id.in_(practiced_word_ids)
        ).limit(limit // 2).all()

        # If not enough new characters, add some practiced ones with low mastery
        if len(new_characters) < limit:
            remaining = limit - len(new_characters)
            practiced_characters = db.query(HanziWord).join(
                WritingProgress, WritingProgress.word_id == HanziWord.id
            ).filter(
                WritingProgress.user_id == user.id,
                HanziWord.hsk_level == hsk_level,
                WritingProgress.mastery_level < 8  # Not yet mastered
            ).order_by(WritingProgress.mastery_level.asc()).limit(remaining).all()

            new_characters.extend(practiced_characters)

        return new_characters

    @staticmethod
    def record_attempt(
        db: Session,
        user: User,
        word_id: int,
        accuracy_score: float,
        time_taken: float,
        stroke_accuracy: Optional[List[float]] = None
    ) -> WritingProgress:
        """
        Record a writing practice attempt and update progress
        """
        # Get or create progress record
        progress = db.query(WritingProgress).filter(
            and_(
                WritingProgress.user_id == user.id,
                WritingProgress.word_id == word_id
            )
        ).first()

        if not progress:
            progress = WritingProgress(
                user_id=user.id,
                word_id=word_id,
                total_attempts=0,
                successful_attempts=0,
                accuracy_score=0.0,
                average_time=0.0,
                mastery_level=0
            )
            db.add(progress)

        # Update attempt counts
        progress.total_attempts += 1
        if accuracy_score >= 70:  # 70% threshold for success
            progress.successful_attempts += 1

        # Update average accuracy (weighted moving average)
        if progress.total_attempts == 1:
            progress.accuracy_score = accuracy_score
        else:
            # Give more weight to recent attempts
            weight = 0.3  # 30% weight to new attempt
            progress.accuracy_score = (
                progress.accuracy_score * (1 - weight) + accuracy_score * weight
            )

        # Update average time
        if progress.total_attempts == 1:
            progress.average_time = time_taken
        else:
            progress.average_time = (
                (progress.average_time * (progress.total_attempts - 1) + time_taken)
                / progress.total_attempts
            )

        # Update stroke accuracy
        if stroke_accuracy:
            progress.stroke_accuracy = stroke_accuracy

        # Calculate and update mastery level
        progress.mastery_level = WritingService.calculate_mastery_level(
            total_attempts=progress.total_attempts,
            accuracy_score=progress.accuracy_score,
            successful_attempts=progress.successful_attempts
        )

        # Update last practiced timestamp
        progress.last_practiced = datetime.utcnow()

        db.commit()
        db.refresh(progress)

        return progress

    @staticmethod
    def calculate_mastery_level(
        total_attempts: int,
        accuracy_score: float,
        successful_attempts: int
    ) -> int:
        """
        Calculate mastery level (0-10) based on performance

        Mastery levels:
        0-2: Beginner (< 60% accuracy or < 3 attempts)
        3-5: Learning (60-80% accuracy)
        6-8: Proficient (80-90% accuracy with 3+ successes)
        9-10: Mastered (>90% accuracy with 5+ successes)
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

        # Bonus for consistent success
        if success_rate >= 0.8 and successful_attempts >= 5:
            base_level = min(10, base_level + 1)

        return int(base_level)

    @staticmethod
    def get_user_progress(
        db: Session,
        user: User,
        hsk_level: Optional[int] = None
    ) -> List[WritingProgress]:
        """
        Get all writing progress for a user, optionally filtered by HSK level
        """
        query = db.query(WritingProgress).filter(
            WritingProgress.user_id == user.id
        )

        if hsk_level:
            query = query.join(HanziWord).filter(
                HanziWord.hsk_level == hsk_level
            )

        return query.all()

    @staticmethod
    def get_statistics(
        db: Session,
        user: User,
        hsk_level: Optional[int] = None
    ) -> Dict:
        """
        Get writing practice statistics for a user
        """
        query = db.query(WritingProgress).filter(
            WritingProgress.user_id == user.id
        )

        if hsk_level:
            query = query.join(HanziWord).filter(
                HanziWord.hsk_level == hsk_level
            )

        all_progress = query.all()

        if not all_progress:
            return {
                "total_characters_practiced": 0,
                "total_attempts": 0,
                "average_accuracy": 0.0,
                "mastered_characters": 0,
                "characters_in_progress": 0,
                "new_characters": 0
            }

        total_attempts = sum(p.total_attempts for p in all_progress)
        avg_accuracy = sum(p.accuracy_score for p in all_progress) / len(all_progress)

        # Count by mastery level
        mastered = sum(1 for p in all_progress if p.mastery_level >= 8)
        in_progress = sum(1 for p in all_progress if 3 <= p.mastery_level < 8)
        new = sum(1 for p in all_progress if p.mastery_level < 3)

        return {
            "total_characters_practiced": len(all_progress),
            "total_attempts": total_attempts,
            "average_accuracy": round(avg_accuracy, 2),
            "mastered_characters": mastered,
            "characters_in_progress": in_progress,
            "new_characters": new
        }

    @staticmethod
    def get_progress_by_character(
        db: Session,
        user: User,
        word_id: int
    ) -> Optional[WritingProgress]:
        """
        Get writing progress for a specific character
        """
        return db.query(WritingProgress).filter(
            and_(
                WritingProgress.user_id == user.id,
                WritingProgress.word_id == word_id
            )
        ).first()
