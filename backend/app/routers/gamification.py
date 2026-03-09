"""
Gamification routes for XP, streaks, and achievements
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth import get_current_user
from app.models import User
from app.services.gamification_service import get_gamification_stats, update_streak
from app.services.badge_generator_service import generate_achievement_badge
from app.rate_limit import check_rate_limit, record_ai_usage

router = APIRouter(prefix="/gamification", tags=["gamification"])


@router.get("/stats")
def get_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get gamification stats for current user"""
    return get_gamification_stats(db, current_user)


@router.post("/daily-checkin")
def daily_checkin(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Record daily check-in and update streak"""
    return update_streak(db, current_user)


@router.post("/generate-badge/{achievement_id}")
def generate_badge(
    achievement_id: str,
    style: str = "modern",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate a personalized achievement badge image
    
    Styles: modern, traditional, minimalist, vibrant
    Rate limits: 10/day, 3/hour
    """
    
    # Check rate limit
    check_rate_limit(db, current_user, 'badge_generation')
    
    # Get user's gamification stats
    stats = get_gamification_stats(db, current_user)
    
    # Find the achievement
    achievement = next(
        (ach for ach in stats['achievements'] if ach['id'] == achievement_id),
        None
    )
    
    if not achievement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Achievement '{achievement_id}' not found or not unlocked"
        )
    
    # Validate style
    valid_styles = ["modern", "traditional", "minimalist", "vibrant"]
    if style not in valid_styles:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid style. Choose from: {', '.join(valid_styles)}"
        )
    
    try:
        # Generate badge
        badge_data = generate_achievement_badge(
            achievement_name=achievement['name'],
            achievement_description=achievement['description'],
            user_name=current_user.full_name or current_user.username,
            style=style
        )
        
        if not badge_data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to generate badge image"
            )
        
        # Record usage
        record_ai_usage(db, current_user, 'badge_generation')
        
        return {
            "achievement_id": achievement_id,
            "achievement_name": achievement['name'],
            "badge_image": badge_data,
            "style": style,
            "format": "svg"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating badge: {str(e)}"
        )


@router.get("/badge-usage-stats")
def get_badge_usage(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get badge generation usage statistics"""
    from app.rate_limit import get_usage_stats

    stats = get_usage_stats(db, current_user)

    return {
        "badge_generation": stats.get('badge_generation', {
            "used_today": 0,
            "limit_daily": 10,
            "used_this_hour": 0,
            "limit_hourly": 3
        })
    }


@router.get("/leaderboard")
def get_leaderboard(
    limit: int = 50,
    metric: str = "total_xp",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get leaderboard rankings

    Args:
        limit: Number of users to return (default: 50, max: 100)
        metric: Ranking metric - total_xp, current_streak, accuracy_rate, total_words_reviewed
    """
    from app.models import UserGamification
    from sqlalchemy import desc, case

    # Limit validation
    if limit > 100:
        limit = 100
    elif limit < 1:
        limit = 10

    # Determine sort column — accuracy_rate computed fully in SQL (no Python sort)
    valid_metrics = {
        "total_xp": UserGamification.total_xp,
        "current_streak": UserGamification.current_streak,
        "total_words_reviewed": UserGamification.total_words_reviewed,
        "accuracy_rate": case(
            (UserGamification.total_words_reviewed > 0,
             UserGamification.total_correct_answers * 1.0 / UserGamification.total_words_reviewed),
            else_=0.0
        ),
    }

    if metric not in valid_metrics:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid metric. Choose from: {', '.join(valid_metrics.keys())}"
        )

    sort_expr = valid_metrics[metric]

    # Single DB query — no full-table Python sort
    query = (
        db.query(UserGamification, User)
        .join(User, UserGamification.user_id == User.id)
    )

    leaderboard_data = (
        query
        .order_by(desc(sort_expr))
        .limit(limit)
        .all()
    )

    # Format response
    leaderboard = []
    current_user_rank = None

    for idx, (gamif, user) in enumerate(leaderboard_data, start=1):
        # Calculate accuracy rate dynamically
        accuracy = 0.0
        if gamif.total_words_reviewed > 0:
            accuracy = (gamif.total_correct_answers / gamif.total_words_reviewed) * 100

        entry = {
            "rank": idx,
            "user_id": user.id,
            "username": user.username,
            "full_name": user.full_name,
            "profile_picture": user.profile_picture,
            "level": gamif.level,
            "total_xp": gamif.total_xp,
            "current_streak": gamif.current_streak,
            "accuracy_rate": round(accuracy, 1),
            "total_words_reviewed": gamif.total_words_reviewed,
            "total_stories_read": gamif.total_stories_read,
        }

        leaderboard.append(entry)

        # Track current user's rank
        if user.id == current_user.id:
            current_user_rank = idx

    # If current user not in top results, approximate their rank via SQL
    if current_user_rank is None:
        current_user_gamif = (
            db.query(UserGamification)
            .filter(UserGamification.user_id == current_user.id)
            .first()
        )
        if current_user_gamif:
            if metric == "accuracy_rate":
                user_accuracy = (
                    current_user_gamif.total_correct_answers / current_user_gamif.total_words_reviewed
                    if current_user_gamif.total_words_reviewed > 0 else 0.0
                )
                higher_ranked = (
                    db.query(UserGamification)
                    .filter(
                        case(
                            (UserGamification.total_words_reviewed > 0,
                             UserGamification.total_correct_answers * 1.0 / UserGamification.total_words_reviewed),
                            else_=0.0
                        ) > user_accuracy
                    )
                    .count()
                )
            else:
                col = getattr(UserGamification, metric)
                user_val = getattr(current_user_gamif, metric)
                higher_ranked = (
                    db.query(UserGamification)
                    .filter(col > user_val)
                    .count()
                )
            current_user_rank = higher_ranked + 1

    return {
        "metric": metric,
        "leaderboard": leaderboard,
        "current_user_rank": current_user_rank,
        "total_users": db.query(UserGamification).count()
    }
