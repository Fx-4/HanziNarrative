"""
Multi-Provider AI Service — Cascading fallback chain.

Priority order (free first, paid last):
  1. Gemini 2.5-flash  (Google, free tier  — 15 RPM,  1M tokens/day)
  2. Groq              (free tier           — 30 RPM,  14.4K req/day)
  3. Mistral           (free tier           —  1 req/s, ~1B tokens/month)
  4. OpenRouter        (free models         — varies,  meta-llama/mistral/gemma)
  5. Cohere            (trial key           — 20 RPM,  1 000 calls/month hard cap)
  6. Claude            (Anthropic, paid     — absolute last resort)

Each provider is tried in order. If one fails, the next is attempted.
"""
import json
import logging
from typing import Optional

import httpx

from app.config import settings

logger = logging.getLogger(__name__)

# ──────────────────────────────────────────────
# Provider wrappers
# ──────────────────────────────────────────────

async def _call_gemini(prompt: str, **kwargs) -> str:
    """Call Gemini 2.5-flash via google-generativeai SDK."""
    import google.generativeai as genai
    genai.configure(api_key=settings.GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-2.5-flash')
    response = model.generate_content(prompt)
    return response.text


async def _call_groq(prompt: str, **kwargs) -> str:
    """Call Groq API (llama-3.3-70b-versatile, free tier) via httpx."""
    async with httpx.AsyncClient(timeout=60, proxy=None) as client:
        response = await client.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.GROQ_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": kwargs.get("groq_model", "llama-3.3-70b-versatile"),
                "messages": [{"role": "user", "content": prompt}],
                "temperature": kwargs.get("temperature", 0.7),
                "max_tokens": kwargs.get("max_tokens", 4096),
            },
        )
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"]


async def _call_openrouter(prompt: str, **kwargs) -> str:
    """Call OpenRouter API using free models with automatic model fallback."""
    import asyncio
    FREE_MODELS = [
        "meta-llama/llama-3.3-70b-instruct:free",
        "mistralai/mistral-small-3.1-24b-instruct:free",
        "google/gemma-3-27b-it:free",
        "nvidia/nemotron-nano-9b-v2:free",
        "nousresearch/hermes-3-llama-3.1-405b:free",
    ]
    model = kwargs.get("openrouter_model")
    models_to_try = [model] if model else FREE_MODELS

    last_error = None
    for m in models_to_try:
        try:
            async with httpx.AsyncClient(timeout=60, proxy=None) as client:
                response = await client.post(
                    "https://openrouter.ai/api/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
                        "Content-Type": "application/json",
                        "HTTP-Referer": settings.FRONTEND_URL,
                        "X-Title": "HanziNarrative",
                    },
                    json={
                        "model": m,
                        "messages": [{"role": "user", "content": prompt}],
                        "temperature": kwargs.get("temperature", 0.7),
                        "max_tokens": kwargs.get("max_tokens", 4096),
                    },
                )
                response.raise_for_status()
                data = response.json()
                return data["choices"][0]["message"]["content"]
        except Exception as e:
            last_error = e
            logger.warning(f"OpenRouter model {m} failed: {e}")
            await asyncio.sleep(1)  # Brief pause between retries
            continue

    raise last_error or RuntimeError("All OpenRouter free models failed")


async def _call_mistral(prompt: str, **kwargs) -> str:
    """Call Mistral AI API (free tier — open-mistral-7b / mistral-small-latest)."""
    async with httpx.AsyncClient(timeout=60, proxy=None) as client:
        response = await client.post(
            "https://api.mistral.ai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.MISTRAL_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": kwargs.get("mistral_model", "mistral-small-latest"),
                "messages": [{"role": "user", "content": prompt}],
                "temperature": kwargs.get("temperature", 0.7),
                "max_tokens": kwargs.get("max_tokens", 4096),
            },
        )
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"]


async def _call_cohere(prompt: str, **kwargs) -> str:
    """Call Cohere AI API (trial key — 20 RPM, 1 000 calls/month hard cap)."""
    async with httpx.AsyncClient(timeout=60, proxy=None) as client:
        response = await client.post(
            "https://api.cohere.com/v2/chat",
            headers={
                "Authorization": f"Bearer {settings.COHERE_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": kwargs.get("cohere_model", "command-a-03-2025"),
                "messages": [{"role": "user", "content": prompt}],
            },
        )
        response.raise_for_status()
        data = response.json()
        # Cohere v2 response: {"message": {"content": [{"type": "text", "text": "..."}]}}
        content_blocks = data["message"]["content"]
        text_blocks = [b["text"] for b in content_blocks if b.get("type") == "text"]
        return " ".join(text_blocks)


async def _call_claude(prompt: str, **kwargs) -> str:
    """Call Anthropic Claude API — paid, last resort."""
    import anthropic
    client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
    message = client.messages.create(
        model=kwargs.get("claude_model", "claude-sonnet-4-20250514"),
        max_tokens=kwargs.get("max_tokens", 4096),
        messages=[{"role": "user", "content": prompt}],
    )
    return message.content[0].text


# ──────────────────────────────────────────────
# Provider registry
# ──────────────────────────────────────────────

PROVIDERS = [
    {"name": "gemini",      "fn": _call_gemini,      "key_attr": "GEMINI_API_KEY"},
    {"name": "groq",        "fn": _call_groq,        "key_attr": "GROQ_API_KEY"},
    {"name": "mistral",     "fn": _call_mistral,     "key_attr": "MISTRAL_API_KEY"},
    {"name": "openrouter",  "fn": _call_openrouter,  "key_attr": "OPENROUTER_API_KEY"},
    {"name": "cohere",      "fn": _call_cohere,      "key_attr": "COHERE_API_KEY"},
    {"name": "claude",      "fn": _call_claude,      "key_attr": "ANTHROPIC_API_KEY"},
]


def _is_provider_available(provider: dict) -> bool:
    """Check if a provider has an API key configured."""
    key = getattr(settings, provider["key_attr"], "")
    return bool(key and key.strip())


# ──────────────────────────────────────────────
# Main entry point
# ──────────────────────────────────────────────

async def generate_text(
    prompt: str,
    *,
    exclude_paid: bool = False,
    preferred_provider: Optional[str] = None,
    **kwargs,
) -> tuple[str, str]:
    """
    Generate text using cascading fallback.

    Args:
        prompt: The prompt to send.
        exclude_paid: If True, skip Claude (paid provider).
        preferred_provider: Force start with this provider ("gemini", "groq", "openrouter", "claude").
        **kwargs: Extra params (temperature, max_tokens, groq_model, openrouter_model, etc.)

    Returns:
        Tuple of (generated_text, provider_name_used).

    Raises:
        RuntimeError: If ALL providers fail.
    """
    providers = list(PROVIDERS)

    # If exclude_paid, remove Claude
    if exclude_paid:
        providers = [p for p in providers if p["name"] != "claude"]

    # If preferred provider, move it to front
    if preferred_provider:
        preferred = [p for p in providers if p["name"] == preferred_provider]
        others = [p for p in providers if p["name"] != preferred_provider]
        providers = preferred + others

    errors = []
    for provider in providers:
        if not _is_provider_available(provider):
            logger.debug(f"Skipping {provider['name']} — no API key configured")
            continue

        try:
            logger.info(f"Trying AI provider: {provider['name']}")
            result = await provider["fn"](prompt, **kwargs)
            if result and result.strip():
                logger.info(f"Success with provider: {provider['name']}")
                return result, provider["name"]
            else:
                raise ValueError("Empty response from provider")
        except Exception as e:
            error_msg = f"{provider['name']} failed: {type(e).__name__}: {str(e)[:200]}"
            logger.warning(error_msg)
            errors.append(error_msg)
            continue

    all_errors = " | ".join(errors) if errors else "No providers available"
    raise RuntimeError(f"All AI providers failed. Errors: {all_errors}")


def parse_json_response(text: str) -> dict:
    """Parse JSON from AI response, stripping markdown code fences."""
    text = text.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1] if "\n" in text else text[3:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()
        if text.startswith("json"):
            text = text[4:].strip()
    return json.loads(text)


async def generate_json(
    prompt: str,
    *,
    exclude_paid: bool = False,
    preferred_provider: Optional[str] = None,
    **kwargs,
) -> tuple[dict, str]:
    """
    Generate text and parse as JSON. Falls back across providers if JSON parsing fails.

    Returns:
        Tuple of (parsed_dict, provider_name).
    """
    text, provider = await generate_text(
        prompt,
        exclude_paid=exclude_paid,
        preferred_provider=preferred_provider,
        **kwargs,
    )
    try:
        data = parse_json_response(text)
        return data, provider
    except json.JSONDecodeError as e:
        logger.warning(f"JSON parse failed from {provider}: {e}. Raw: {text[:300]}")
        raise


# ──────────────────────────────────────────────
# Test / health check
# ──────────────────────────────────────────────

async def test_provider(name: str) -> dict:
    """Test a specific provider and return status."""
    provider = next((p for p in PROVIDERS if p["name"] == name), None)
    if not provider:
        return {"provider": name, "status": "unknown", "error": "Provider not found"}

    if not _is_provider_available(provider):
        return {"provider": name, "status": "no_key", "error": "API key not configured"}

    try:
        result = await provider["fn"]("Say hello in Chinese. Reply with only the Chinese text, nothing else.")
        return {"provider": name, "status": "ok", "response": result.strip()[:100]}
    except Exception as e:
        return {"provider": name, "status": "error", "error": f"{type(e).__name__}: {str(e)[:200]}"}


async def test_all_providers() -> list[dict]:
    """Test all configured providers."""
    results = []
    for provider in PROVIDERS:
        result = await test_provider(provider["name"])
        results.append(result)
    return results
