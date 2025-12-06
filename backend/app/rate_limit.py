from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException, status
from .models import AIUsage, User

# Rate limit configuration
RATE_LIMITS = {
    'story_generation': {'daily': 5, 'hourly': 2},
    'sentence_validation': {'daily': 15, 'hourly': 5},
    'translation': {'daily': 20, 'hourly': 10},
}

def check_rate_limit(db: Session, user: User, feature: str) -> bool:
    """
    Check if user has exceeded rate limit for a feature.
    Returns True if within limits, raises HTTPException if exceeded.
    """
    if feature not in RATE_LIMITS:
        # No limit for unknown features
        return True

    limits = RATE_LIMITS[feature]
    now = datetime.utcnow()
    
    # Check hourly limit
    if 'hourly' in limits:
        hour_ago = now - timedelta(hours=1)
        hourly_count = db.query(func.count(AIUsage.id)).filter(
            AIUsage.user_id == user.id,
            AIUsage.feature == feature,
            AIUsage.timestamp >= hour_ago
        ).scalar()
        
        if hourly_count >= limits['hourly']:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Hourly rate limit exceeded for {feature}. Limit: {limits['hourly']}/hour. Try again in a few minutes."
            )
    
    # Check daily limit
    if 'daily' in limits:
        day_ago = now - timedelta(days=1)
        daily_count = db.query(func.count(AIUsage.id)).filter(
            AIUsage.user_id == user.id,
            AIUsage.feature == feature,
            AIUsage.timestamp >= day_ago
        ).scalar()
        
        if daily_count >= limits['daily']:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Daily rate limit exceeded for {feature}. Limit: {limits['daily']}/day. Reset in 24 hours."
            )
    
    return True


def record_ai_usage(db: Session, user: User, feature: str, tokens_used: int = 0, request_data: dict = None):
    """Record AI usage in database"""
    usage = AIUsage(
        user_id=user.id,
        feature=feature,
        tokens_used=tokens_used,
        request_data=request_data
    )
    db.add(usage)
    db.commit()


def get_usage_stats(db: Session, user: User, feature: str = None) -> dict:
    """Get usage statistics for a user"""
    now = datetime.utcnow()
    day_ago = now - timedelta(days=1)
    hour_ago = now - timedelta(hours=1)
    
    query = db.query(AIUsage).filter(AIUsage.user_id == user.id)
    
    if feature:
        query = query.filter(AIUsage.feature == feature)
        limits = RATE_LIMITS.get(feature, {})
    else:
        limits = {}
    
    daily_count = query.filter(AIUsage.timestamp >= day_ago).count()
    hourly_count = query.filter(AIUsage.timestamp >= hour_ago).count()
    
    return {
        'feature': feature or 'all',
        'used_this_hour': hourly_count,
        'limit_hourly': limits.get('hourly', 'unlimited'),
        'remaining_hourly': max(0, limits.get('hourly', 999) - hourly_count) if 'hourly' in limits else 'unlimited',
        'used_today': daily_count,
        'limit_daily': limits.get('daily', 'unlimited'),
        'remaining_daily': max(0, limits.get('daily', 999) - daily_count) if 'daily' in limits else 'unlimited',
    }
