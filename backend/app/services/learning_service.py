"""
Learning service with spaced repetition algorithm
Implements a simple version of the SM-2 (SuperMemo 2) algorithm
"""
from datetime import datetime, timedelta, timezone
from typing import List, Dict
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from app.models import UserProgress, HanziWord, User


class LearningService:
    """Service for managing learning progress and spaced repetition"""

    # Spaced repetition intervals (in days)
    INTERVALS = [1, 3, 7, 14, 30, 90, 180]

    @staticmethod
    def get_words_for_learning(
        db: Session,
        user: User,
        hsk_level: int,
        limit: int = 20,
        category: str = None
    ) -> List[HanziWord]:
        """
        Get words for initial learning (never seen before)
        """
        # Get words user hasn't started learning yet
        learned_word_ids = db.query(UserProgress.word_id).filter(
            UserProgress.user_id == user.id
        ).subquery()

        query = db.query(HanziWord).filter(
            HanziWord.hsk_level == hsk_level,
            ~HanziWord.id.in_(learned_word_ids)
        )

        if category:
            query = query.filter(HanziWord.category == category)

        return query.limit(limit).all()

    @staticmethod
    def get_words_for_review(
        db: Session,
        user: User,
        hsk_level: int = None
    ) -> List[Dict]:
        """
        Get words that are due for review based on spaced repetition
        """
        now = datetime.now(timezone.utc)

        query = db.query(UserProgress, HanziWord).join(
            HanziWord, UserProgress.word_id == HanziWord.id
        ).filter(
            UserProgress.user_id == user.id,
            UserProgress.next_review <= now
        )

        if hsk_level:
            query = query.filter(HanziWord.hsk_level == hsk_level)

        # Order by next_review (most overdue first)
        query = query.order_by(UserProgress.next_review.asc())

        results = query.limit(50).all()

        return [
            {
                "word": word,
                "progress": progress,
                "days_overdue": (now - progress.next_review).days
            }
            for progress, word in results
        ]

    @staticmethod
    def get_words_for_test(
        db: Session,
        user: User,
        hsk_level: int,
        limit: int = 20,
        category: str = None
    ) -> List[Dict]:
        """
        Get words for testing (mix of learned and mastered words)
        """
        query = db.query(UserProgress, HanziWord).join(
            HanziWord, UserProgress.word_id == HanziWord.id
        ).filter(
            UserProgress.user_id == user.id,
            HanziWord.hsk_level == hsk_level,
            UserProgress.mastery_level >= 1  # At least started learning
        )

        if category:
            query = query.filter(HanziWord.category == category)

        results = query.order_by(UserProgress.last_reviewed.desc()).limit(limit).all()

        return [
            {
                "word": word,
                "progress": progress
            }
            for progress, word in results
        ]

    @staticmethod
    def record_review(
        db: Session,
        user: User,
        word_id: int,
        quality: int  # 0-5 rating (0=complete failure, 5=perfect recall)
    ) -> UserProgress:
        """
        Record a review and update spaced repetition schedule
        Based on SM-2 algorithm
        """
        # Get or create progress record
        progress = db.query(UserProgress).filter(
            UserProgress.user_id == user.id,
            UserProgress.word_id == word_id
        ).first()

        if not progress:
            progress = UserProgress(
                user_id=user.id,
                word_id=word_id,
                mastery_level=0,
                correct_count=0,
                incorrect_count=0,
                easiness_factor=2.5,
                interval=1,
                repetitions=0
            )
            db.add(progress)

        # Update counts
        if quality >= 3:  # Correct response
            progress.correct_count += 1
        else:  # Incorrect response
            progress.incorrect_count += 1

        # Calculate new easiness factor (SM-2 formula)
        progress.easiness_factor = max(
            1.3,
            progress.easiness_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
        )

        # Update interval and repetitions
        if quality < 3:  # Failed recall
            progress.repetitions = 0
            progress.interval = 1
        else:  # Successful recall
            progress.repetitions += 1
            if progress.repetitions == 1:
                progress.interval = 1
            elif progress.repetitions == 2:
                progress.interval = 6
            else:
                progress.interval = int(progress.interval * progress.easiness_factor)

        # Update mastery level (0-10 scale)
        total_reviews = progress.correct_count + progress.incorrect_count
        if total_reviews > 0:
            accuracy = progress.correct_count / total_reviews
            progress.mastery_level = min(10, int(accuracy * 10 * (progress.repetitions / 5 + 1)))

        # Set next review date
        progress.next_review = datetime.now(timezone.utc) + timedelta(days=progress.interval)
        progress.last_reviewed = datetime.now(timezone.utc)

        db.commit()
        db.refresh(progress)

        return progress

    @staticmethod
    def get_learning_stats(db: Session, user: User, hsk_level: int = None) -> Dict:
        """
        Get learning statistics for a user
        """
        query = db.query(UserProgress).filter(
            UserProgress.user_id == user.id
        )

        if hsk_level:
            query = query.join(HanziWord).filter(HanziWord.hsk_level == hsk_level)

        all_progress = query.all()

        if not all_progress:
            return {
                "total_words_learning": 0,
                "mastered_words": 0,
                "due_for_review": 0,
                "average_mastery": 0,
                "total_reviews": 0,
                "accuracy": 0
            }

        now = datetime.now(timezone.utc)
        mastered = sum(1 for p in all_progress if p.mastery_level >= 8)
        due_for_review = sum(1 for p in all_progress if p.next_review and p.next_review <= now)
        total_correct = sum(p.correct_count for p in all_progress)
        total_incorrect = sum(p.incorrect_count for p in all_progress)
        total_reviews = total_correct + total_incorrect

        return {
            "total_words_learning": len(all_progress),
            "mastered_words": mastered,
            "due_for_review": due_for_review,
            "average_mastery": sum(p.mastery_level for p in all_progress) / len(all_progress),
            "total_reviews": total_reviews,
            "accuracy": (total_correct / total_reviews * 100) if total_reviews > 0 else 0
        }
