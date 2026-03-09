"""Quick smoke test for all fixes applied in this session."""
import sys
sys.stdout.reconfigure(encoding='utf-8')

errors = []

# 1. Timezone fix
try:
    from app.rate_limit import check_rate_limit
    import inspect
    src = inspect.getsource(check_rate_limit)
    assert 'utcnow' not in src, "utcnow still present in rate_limit!"
    print("[OK] Timezone fix — no utcnow in rate_limit.py")
except Exception as e:
    errors.append(f"[FAIL] Timezone: {e}")

# 2. DB indexes
try:
    from app.models import UserProgress, AIUsage
    up_args = getattr(UserProgress, '__table_args__', None)
    ai_args = getattr(AIUsage, '__table_args__', None)
    assert up_args is not None, "UserProgress missing __table_args__"
    assert ai_args is not None, "AIUsage missing __table_args__"
    print("[OK] DB indexes — UserProgress and AIUsage have __table_args__")
except Exception as e:
    errors.append(f"[FAIL] DB indexes: {e}")

# 3. Schema validation
try:
    from pydantic import ValidationError
    from app.schemas import UserCreate
    try:
        UserCreate(username="ab", email="x@x.com", password="short")
        errors.append("[FAIL] Schema: short username not rejected")
    except ValidationError:
        pass
    try:
        UserCreate(username="valid_user", email="x@x.com", password="nodigits")
        errors.append("[FAIL] Schema: no-digit password not rejected")
    except ValidationError:
        pass
    # Valid case
    u = UserCreate(username="valid_user", email="x@x.com", password="Pass1234")
    print("[OK] Schema validation — password & username rules work")
except Exception as e:
    errors.append(f"[FAIL] Schema: {e}")

# 4. Goals validation
try:
    from pydantic import ValidationError
    from app.routers.onboarding import GoalsCreate
    try:
        GoalsCreate(daily_time_minutes=-5)
        errors.append("[FAIL] Goals: negative daily_time not rejected")
    except ValidationError:
        pass
    try:
        GoalsCreate(target_hsk_level=9)
        errors.append("[FAIL] Goals: hsk_level=9 not rejected")
    except ValidationError:
        pass
    print("[OK] Goals validation — range checks work")
except Exception as e:
    errors.append(f"[FAIL] Goals: {e}")

# 5. AI provider timeout
try:
    from app.services import ai_provider
    import inspect
    src = inspect.getsource(ai_provider)
    assert 'timeout=60' not in src, "Old 60s timeout still present!"
    assert 'timeout=15' in src, "New 15s timeout not found!"
    print("[OK] AI timeout — reduced from 60s to 15s")
except Exception as e:
    errors.append(f"[FAIL] AI timeout: {e}")

print()
if errors:
    print(f"FAILURES ({len(errors)}):")
    for e in errors:
        print(" ", e)
    sys.exit(1)
else:
    print("All fixes verified successfully!")
