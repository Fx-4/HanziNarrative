"""
Gamification Service for XP, Streaks, and Achievements
"""
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from app.models import User, UserGamification

# XP Rewards
XP_REWARDS = {
    'review_word': 10,
    'correct_answer': 5,
    'perfect_answer': 15,
    'complete_story': 20,
    'daily_login': 10,
    'maintain_streak': 20,
}

# Achievements
ACHIEVEMENTS = {
    # Onboarding & First Steps
    'onboarding_complete': {'id': 'onboarding_complete', 'name': 'Journey Begins! 🎓', 'description': 'Complete the onboarding process', 'xp': 100},
    'first_review': {'id': 'first_review', 'name': 'First Steps 👣', 'description': 'Complete your first word review', 'xp': 50},
    'first_story': {'id': 'first_story', 'name': 'Story Explorer 📖', 'description': 'Read your first story', 'xp': 50},
    
    # Streak Achievements
    'streak_3': {'id': 'streak_3', 'name': '3-Day Streak 🔥', 'description': 'Maintain a 3-day learning streak', 'xp': 100},
    'streak_7': {'id': 'streak_7', 'name': 'Week Warrior ⚔️', 'description': 'Maintain a 7-day streak', 'xp': 200},
    'streak_14': {'id': 'streak_14', 'name': 'Fortnight Fighter 💪', 'description': 'Maintain a 14-day streak', 'xp': 300},
    'streak_30': {'id': 'streak_30', 'name': 'Month Master 👑', 'description': 'Maintain a 30-day streak', 'xp': 500},
    'streak_50': {'id': 'streak_50', 'name': 'Unstoppable 🚀', 'description': 'Maintain a 50-day streak', 'xp': 800},
    'streak_100': {'id': 'streak_100', 'name': 'Legendary 🌟', 'description': 'Maintain a 100-day streak', 'xp': 1500},
    
    # Word Review Milestones
    'words_10': {'id': 'words_10', 'name': 'Getting Started 📚', 'description': 'Review 10 words', 'xp': 50},
    'words_50': {'id': 'words_50', 'name': 'Vocabulary Builder 📝', 'description': 'Review 50 words', 'xp': 150},
    'words_100': {'id': 'words_100', 'name': 'Century Scholar 🎓', 'description': 'Review 100 words', 'xp': 300},
    'words_250': {'id': 'words_250', 'name': 'Word Enthusiast ✨', 'description': 'Review 250 words', 'xp': 500},
    'words_500': {'id': 'words_500', 'name': 'Word Wizard 🧙', 'description': 'Review 500 words', 'xp': 1000},
    'words_1000': {'id': 'words_1000', 'name': 'Vocabulary Master 👨‍🎓', 'description': 'Review 1000 words', 'xp': 2000},
    'words_2000': {'id': 'words_2000', 'name': 'Character Expert 🏆', 'description': 'Review 2000 words', 'xp': 3500},
    
    # Level Achievements
    'level_5': {'id': 'level_5', 'name': 'Novice 🌱', 'description': 'Reach level 5', 'xp': 100},
    'level_10': {'id': 'level_10', 'name': 'Apprentice 🎯', 'description': 'Reach level 10', 'xp': 250},
    'level_15': {'id': 'level_15', 'name': 'Intermediate 📈', 'description': 'Reach level 15', 'xp': 400},
    'level_20': {'id': 'level_20', 'name': 'Advanced 🎖️', 'description': 'Reach level 20', 'xp': 600},
    'level_25': {'id': 'level_25', 'name': 'Expert 💎', 'description': 'Reach level 25', 'xp': 900},
    'level_30': {'id': 'level_30', 'name': 'Master 🏅', 'description': 'Reach level 30', 'xp': 1200},
    
    # Accuracy & Performance
    'perfect_10': {'id': 'perfect_10', 'name': 'Perfectionist ⭐', 'description': '10 perfect answers in a row', 'xp': 150},
    'perfect_25': {'id': 'perfect_25', 'name': 'Flawless 💯', 'description': '25 perfect answers in a row', 'xp': 400},
    'accuracy_80': {'id': 'accuracy_80', 'name': 'Sharp Mind 🧠', 'description': 'Maintain 80% accuracy over 100 reviews', 'xp': 300},
    'accuracy_90': {'id': 'accuracy_90', 'name': 'Near Perfect 🎯', 'description': 'Maintain 90% accuracy over 100 reviews', 'xp': 500},
    'accuracy_95': {'id': 'accuracy_95', 'name': 'Excellence 👑', 'description': 'Maintain 95% accuracy over 100 reviews', 'xp': 800},
    
    # Story Reading
    'stories_5': {'id': 'stories_5', 'name': 'Bookworm 🐛', 'description': 'Complete 5 stories', 'xp': 100},
    'stories_10': {'id': 'stories_10', 'name': 'Avid Reader 📚', 'description': 'Complete 10 stories', 'xp': 200},
    'stories_25': {'id': 'stories_25', 'name': 'Story Collector 📖', 'description': 'Complete 25 stories', 'xp': 400},
    'stories_50': {'id': 'stories_50', 'name': 'Literary Scholar 🎭', 'description': 'Complete 50 stories', 'xp': 800},
    
    # HSK Progression
    'hsk_1_complete': {'id': 'hsk_1_complete', 'name': 'HSK 1 Graduate 🎓', 'description': 'Master all HSK 1 words', 'xp': 300},
    'hsk_2_complete': {'id': 'hsk_2_complete', 'name': 'HSK 2 Graduate 📜', 'description': 'Master all HSK 2 words', 'xp': 500},
    'hsk_3_complete': {'id': 'hsk_3_complete', 'name': 'HSK 3 Graduate 🏆', 'description': 'Master all HSK 3 words', 'xp': 800},
    'hsk_4_complete': {'id': 'hsk_4_complete', 'name': 'HSK 4 Graduate 👑', 'description': 'Master all HSK 4 words', 'xp': 1200},
    
    # Special Achievements
    'early_bird': {'id': 'early_bird', 'name': 'Early Bird 🌅', 'description': 'Study before 8 AM for 7 days', 'xp': 200},
    'night_owl': {'id': 'night_owl', 'name': 'Night Owl 🦉', 'description': 'Study after 10 PM for 7 days', 'xp': 200},
    'speed_demon': {'id': 'speed_demon', 'name': 'Speed Demon ⚡', 'description': 'Complete 50 reviews in one session', 'xp': 250},
    'marathon': {'id': 'marathon', 'name': 'Marathon Learner 🏃', 'description': 'Study for 2+ hours in one day', 'xp': 300},
    'comeback': {'id': 'comeback', 'name': 'Comeback Kid 🔄', 'description': 'Return after 30+ day break', 'xp': 150},

    # Typing Practice Achievements
    'typing_first': {'id': 'typing_first', 'name': 'First Type ⌨️', 'description': 'Complete your first typing practice', 'xp': 50},
    'typing_speed_30': {'id': 'typing_speed_30', 'name': 'Speed Typer ⚡', 'description': 'Achieve 30 WPM in speed mode', 'xp': 100},
    'typing_speed_50': {'id': 'typing_speed_50', 'name': 'Lightning Fingers ⚡⚡', 'description': 'Achieve 50 WPM in speed mode', 'xp': 200},
    'typing_speed_70': {'id': 'typing_speed_70', 'name': 'Typing Master 🚀', 'description': 'Achieve 70 WPM in speed mode', 'xp': 400},
    'typing_perfect_pinyin': {'id': 'typing_perfect_pinyin', 'name': 'Tone Master 🎵', 'description': '20 perfect pinyin attempts with correct tones', 'xp': 150},
    'typing_ime_master': {'id': 'typing_ime_master', 'name': 'IME Expert 🎯', 'description': 'Select correct character on first try 30 times', 'xp': 150},
    'typing_100_words': {'id': 'typing_100_words', 'name': 'Typing Enthusiast 📝', 'description': 'Practice typing 100 words', 'xp': 200},
    'typing_500_words': {'id': 'typing_500_words', 'name': 'Typing Pro 💻', 'description': 'Practice typing 500 words', 'xp': 500},
}


def get_or_create_gamification(db: Session, user: User) -> UserGamification:
    """Get or create gamification data for user"""
    gamification = db.query(UserGamification).filter(
        UserGamification.user_id == user.id
    ).first()

    if not gamification:
        gamification = UserGamification(
            user_id=user.id,
            total_xp=0,
            level=1,
            xp_to_next_level=100,
            current_streak=0,
            longest_streak=0,
            total_words_reviewed=0,
            total_correct_answers=0,
            total_stories_read=0,
            achievements=[]
        )
        db.add(gamification)
        db.commit()
        db.refresh(gamification)

    return gamification


def calculate_level_from_xp(xp: int) -> tuple[int, int]:
    """
    Calculate level and XP needed for next level
    Returns: (level, xp_to_next_level)
    """
    # Formula: Level N requires (N * 100) total XP
    level = 1
    total_xp_needed = 0

    while total_xp_needed <= xp:
        level += 1
        total_xp_needed += level * 100

    xp_for_current = (level - 1) * 100 * level // 2  # Total XP at start of current level
    xp_for_next = level * 100
    xp_to_next = xp_for_next - (xp - xp_for_current)

    return level, xp_to_next


def add_xp(db: Session, user: User, xp_amount: int, reason: str = '') -> dict:
    """Add XP to user and update level"""
    gamification = get_or_create_gamification(db, user)

    old_level = gamification.level
    gamification.total_xp += xp_amount

    # Calculate new level
    new_level, xp_to_next = calculate_level_from_xp(gamification.total_xp)
    gamification.level = new_level
    gamification.xp_to_next_level = xp_to_next

    db.commit()
    db.refresh(gamification)

    # Check if leveled up
    leveled_up = new_level > old_level
    new_achievements = []

    # Check for level achievements
    level_achievements = {
        5: 'level_5', 10: 'level_10', 15: 'level_15',
        20: 'level_20', 25: 'level_25', 30: 'level_30'
    }
    if new_level in level_achievements:
        achievement_id = level_achievements[new_level]
        if achievement_id not in gamification.achievements:
            new_achievements.append(unlock_achievement(db, gamification, achievement_id))

    return {
        'xp_gained': xp_amount,
        'total_xp': gamification.total_xp,
        'level': gamification.level,
        'xp_to_next_level': gamification.xp_to_next_level,
        'leveled_up': leveled_up,
        'new_level': new_level if leveled_up else None,
        'new_achievements': new_achievements,
        'reason': reason
    }


def update_streak(db: Session, user: User) -> dict:
    """Update user's daily streak"""
    gamification = get_or_create_gamification(db, user)
    now = datetime.now(timezone.utc)
    today = now.date()

    # Get last activity date
    last_activity = gamification.last_activity_date
    last_date = last_activity.date() if last_activity else None

    streak_bonus = 0
    new_achievements = []

    if last_date is None:
        # First ever activity
        gamification.current_streak = 1
        gamification.last_activity_date = now
        streak_bonus = XP_REWARDS['daily_login']
    elif last_date == today:
        # Already logged in today, no streak update
        pass
    elif last_date == today - timedelta(days=1):
        # Consecutive day - increase streak!
        gamification.current_streak += 1
        gamification.last_activity_date = now
        streak_bonus = XP_REWARDS['daily_login'] + XP_REWARDS['maintain_streak']

        # Check streak achievements
        streak_milestones = {
            3: 'streak_3', 7: 'streak_7', 14: 'streak_14',
            30: 'streak_30', 50: 'streak_50', 100: 'streak_100'
        }
        if gamification.current_streak in streak_milestones:
            achievement_id = streak_milestones[gamification.current_streak]
            if achievement_id not in gamification.achievements:
                new_achievements.append(unlock_achievement(db, gamification, achievement_id))
    else:
        # Streak broken!
        gamification.current_streak = 1
        gamification.last_activity_date = now
        streak_bonus = XP_REWARDS['daily_login']

    # Update longest streak
    if gamification.current_streak > gamification.longest_streak:
        gamification.longest_streak = gamification.current_streak

    db.commit()

    # Award streak bonus XP
    if streak_bonus > 0:
        xp_result = add_xp(db, user, streak_bonus, 'Daily streak bonus')
        new_achievements.extend(xp_result.get('new_achievements', []))

    db.refresh(gamification)

    return {
        'current_streak': gamification.current_streak,
        'longest_streak': gamification.longest_streak,
        'streak_bonus_xp': streak_bonus,
        'new_achievements': new_achievements
    }


def record_word_review(db: Session, user: User, is_correct: bool, is_perfect: bool = False) -> dict:
    """Record a word review for gamification"""
    gamification = get_or_create_gamification(db, user)

    gamification.total_words_reviewed += 1
    if is_correct:
        gamification.total_correct_answers += 1

    # Calculate XP
    xp = XP_REWARDS['review_word']
    if is_correct:
        xp += XP_REWARDS['correct_answer']
    if is_perfect:
        xp += XP_REWARDS['perfect_answer']

    db.commit()

    # Update streak
    streak_result = update_streak(db, user)

    # Add XP
    xp_result = add_xp(db, user, xp, 'Word review')

    # Check word review achievements
    new_achievements = []
    word_milestones = {
        1: 'first_review', 10: 'words_10', 50: 'words_50',
        100: 'words_100', 250: 'words_250', 500: 'words_500',
        1000: 'words_1000', 2000: 'words_2000'
    }
    if gamification.total_words_reviewed in word_milestones:
        achievement_id = word_milestones[gamification.total_words_reviewed]
        if achievement_id not in gamification.achievements:
            new_achievements.append(unlock_achievement(db, gamification, achievement_id))

    # Check accuracy achievements (after 100+ reviews)
    if gamification.total_words_reviewed >= 100:
        accuracy = (gamification.total_correct_answers / gamification.total_words_reviewed) * 100
        if accuracy >= 95 and 'accuracy_95' not in gamification.achievements:
            new_achievements.append(unlock_achievement(db, gamification, 'accuracy_95'))
        elif accuracy >= 90 and 'accuracy_90' not in gamification.achievements:
            new_achievements.append(unlock_achievement(db, gamification, 'accuracy_90'))
        elif accuracy >= 80 and 'accuracy_80' not in gamification.achievements:
            new_achievements.append(unlock_achievement(db, gamification, 'accuracy_80'))

    xp_result['new_achievements'].extend(new_achievements)
    xp_result['new_achievements'].extend(streak_result.get('new_achievements', []))

    return {
        **xp_result,
        'streak': streak_result
    }


def unlock_achievement(db: Session, gamification: UserGamification, achievement_id: str) -> dict:
    """Unlock an achievement and award bonus XP"""
    if achievement_id in gamification.achievements:
        return None

    achievement = ACHIEVEMENTS.get(achievement_id)
    if not achievement:
        return None

    # Add achievement
    achievements = gamification.achievements or []
    achievements.append(achievement_id)
    gamification.achievements = achievements

    # Award bonus XP
    gamification.total_xp += achievement['xp']

    db.commit()
    db.refresh(gamification)

    return achievement


def get_gamification_stats(db: Session, user: User) -> dict:
    """Get full gamification stats for user"""
    gamification = get_or_create_gamification(db, user)
    
    # Calculate current XP in level
    total_xp_for_prev_levels = sum((i * 100) for i in range(1, gamification.level))
    current_xp_in_level = gamification.total_xp - total_xp_for_prev_levels

    return {
        'total_xp': gamification.total_xp,
        'level': gamification.level,
        'xp_to_next_level': gamification.xp_to_next_level,
        'current_xp_in_level': current_xp_in_level,
        'current_streak': gamification.current_streak,
        'longest_streak': gamification.longest_streak,
        'total_words_reviewed': gamification.total_words_reviewed,
        'total_correct_answers': gamification.total_correct_answers,
        'total_stories_read': gamification.total_stories_read,
        'accuracy_rate': (gamification.total_correct_answers / gamification.total_words_reviewed * 100)
            if gamification.total_words_reviewed > 0 else 0,
        'achievements': [ACHIEVEMENTS.get(a, {'id': a, 'name': 'Unknown'})
                        for a in (gamification.achievements or [])],
        'available_achievements': list(ACHIEVEMENTS.values())
    }


def record_story_completion(db: Session, user: User, story_id: int) -> dict:
    """Record a story completion for gamification"""
    gamification = get_or_create_gamification(db, user)
    
    gamification.total_stories_read += 1
    db.commit()
    
    # Update streak
    streak_result = update_streak(db, user)
    
    # Add XP for story completion
    xp_result = add_xp(db, user, XP_REWARDS['complete_story'], 'Story completed')
    
    # Check story achievements
    new_achievements = []
    story_milestones = {
        1: 'first_story', 5: 'stories_5', 10: 'stories_10',
        25: 'stories_25', 50: 'stories_50'
    }
    if gamification.total_stories_read in story_milestones:
        achievement_id = story_milestones[gamification.total_stories_read]
        if achievement_id not in gamification.achievements:
            new_achievements.append(unlock_achievement(db, gamification, achievement_id))
    
    xp_result['new_achievements'].extend(new_achievements)
    xp_result['new_achievements'].extend(streak_result.get('new_achievements', []))
    
    return {
        **xp_result,
        'streak': streak_result
    }
