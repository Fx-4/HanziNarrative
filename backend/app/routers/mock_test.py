"""
Mock-test helpers.

Currently exposes a single SSE endpoint that acts as a server-driven countdown
timer so the frontend doesn't need client-side setInterval for the per-question
clock.  This makes the timer accurate even when the browser tab is backgrounded
(browsers throttle JS timers in hidden tabs, which can cause early timeouts).
"""

import asyncio
import json
import logging
from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse

from ..auth import get_current_user
from .. import models

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/mock-test", tags=["mock-test"])

_MAX_SECONDS = 180  # safety cap — no question should ever need more than 3 min


@router.get("/timer-stream")
async def timer_stream(
    seconds: int = Query(..., ge=1, le=_MAX_SECONDS),
    _current_user: models.User = Depends(get_current_user),
):
    """
    SSE countdown timer.

    Streams one ``tick`` event per second (remaining time counts down to 0),
    then a final ``done`` event.  The client must abort the fetch when the
    question is answered early to stop the stream.

    Event format::

        data: {"type": "tick", "remaining": <int>}\\n\\n
        ...
        data: {"type": "done"}\\n\\n
    """

    async def event_generator():
        remaining = seconds
        try:
            while remaining > 0:
                yield f"data: {json.dumps({'type': 'tick', 'remaining': remaining})}\n\n"
                await asyncio.sleep(1)
                remaining -= 1
            yield f"data: {json.dumps({'type': 'done'})}\n\n"
        except asyncio.CancelledError:
            # Client disconnected (e.g. answered the question early) — normal.
            logger.debug("Timer stream cancelled by client (remaining=%d)", remaining)
            return

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )
