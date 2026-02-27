import logging
from ..config import settings

logger = logging.getLogger(__name__)


def send_password_reset_email(to_email: str, reset_token: str) -> bool:
    """
    Send password reset email.
    If RESEND_API_KEY is configured, sends via Resend.
    Otherwise, prints reset link to terminal (dev mode).
    """
    reset_url = f"{settings.FRONTEND_URL}/reset-password?token={reset_token}"

    if not settings.RESEND_API_KEY:
        # Dev mode: print to terminal
        logger.info("=" * 60)
        logger.info("PASSWORD RESET LINK (dev mode — no email sent):")
        logger.info(f"  To: {to_email}")
        logger.info(f"  Link: {reset_url}")
        logger.info("=" * 60)
        return True

    try:
        import resend
        resend.api_key = settings.RESEND_API_KEY
        resend.Emails.send({
            "from": "HanziNarrative <noreply@hanzinarrative.com>",
            "to": [to_email],
            "subject": "Reset your HanziNarrative password",
            "html": f"""
            <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;">
              <h2 style="color:#4f46e5;">Reset your password</h2>
              <p>Click the link below to reset your HanziNarrative password.
                 This link expires in <strong>1 hour</strong>.</p>
              <a href="{reset_url}"
                 style="display:inline-block;margin:16px 0;padding:12px 24px;
                        background:#4f46e5;color:#fff;border-radius:8px;
                        text-decoration:none;font-weight:600;">
                Reset Password
              </a>
              <p style="color:#6b7280;font-size:12px;">
                If you didn't request this, you can safely ignore this email.
              </p>
            </div>
            """,
        })
        return True
    except Exception as e:
        logger.error(f"Failed to send reset email: {e}")
        return False
