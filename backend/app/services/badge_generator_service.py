"""
Badge Generator Service using Gemini AI
Generates personalized achievement badge images
"""
import base64
from io import BytesIO
from typing import Optional
import google.generativeai as genai
from app.config import settings

# Configure Gemini
genai.configure(api_key=settings.GEMINI_API_KEY)

# Badge generation limits
BADGE_DAILY_LIMIT = 10
BADGE_HOURLY_LIMIT = 3


def generate_achievement_badge(
    achievement_name: str,
    achievement_description: str,
    user_name: str,
    style: str = "modern"
) -> Optional[str]:
    """
    Generate a personalized achievement badge image using Imagen/Gemini
    
    Args:
        achievement_name: Name of the achievement
        achievement_description: Description of the achievement
        user_name: User's name to personalize
        style: Visual style (modern, traditional, minimalist, vibrant)
        
    Returns:
        Base64 encoded image string or None if failed
    """
    
    try:
        # Use Gemini Pro Vision with image generation capabilities
        # Note: As of now, Gemini doesn't have direct image generation
        # We'll use a text-to-image prompt that can be used with Imagen
        # or return a generated SVG badge as base64
        
        # For now, we'll generate an SVG badge programmatically
        # In production, you'd integrate with Imagen API when available
        
        svg_badge = generate_svg_badge(
            achievement_name,
            achievement_description,
            user_name,
            style
        )
        
        # Convert SVG to base64
        svg_bytes = svg_badge.encode('utf-8')
        base64_svg = base64.b64encode(svg_bytes).decode('utf-8')
        
        return f"data:image/svg+xml;base64,{base64_svg}"
        
    except Exception as e:
        print(f"Failed to generate badge: {e}")
        return None


def generate_svg_badge(
    name: str,
    description: str,
    user_name: str,
    style: str
) -> str:
    """Generate SVG badge with achievement details"""
    
    # Color schemes based on style
    color_schemes = {
        "modern": {
            "bg": "#DC2626",  # primary-600 (red)
            "accent": "#991B1B",  # primary-800
            "text": "#FFFFFF",
            "glow": "#FCA5A5"  # primary-300
        },
        "traditional": {
            "bg": "#B91C1C",  # primary-700
            "accent": "#7F1D1D",  # primary-900
            "text": "#FEF2F2",  # primary-50
            "glow": "#F87171"  # primary-400
        },
        "minimalist": {
            "bg": "#FFFFFF",
            "accent": "#DC2626",
            "text": "#1F2937",
            "glow": "#FEE2E2"  # primary-100
        },
        "vibrant": {
            "bg": "#EF4444",  # primary-500
            "accent": "#DC2626",  # primary-600
            "text": "#FFFFFF",
            "glow": "#FECACA"  # primary-200
        }
    }
    
    colors = color_schemes.get(style, color_schemes["modern"])

    # Clean up emoji from name (remove emoji characters, keep text and spaces)
    import re
    # Remove emoji and other pictographs but keep regular text and spaces
    clean_name = re.sub(r'[^\w\s\-\!\?\.\,]', '', name, flags=re.UNICODE)
    clean_name = clean_name.strip()
    
    svg = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg width="400" height="500" viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:{colors['bg']};stop-opacity:1" />
      <stop offset="100%" style="stop-color:{colors['accent']};stop-opacity:1" />
    </linearGradient>
    
    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    
    <clipPath id="badgeClip">
      <rect x="20" y="20" width="360" height="460" rx="20"/>
    </clipPath>
  </defs>
  
  <!-- Background -->
  <rect width="400" height="500" fill="url(#bgGradient)" />
  
  <!-- Decorative elements -->
  <circle cx="350" cy="50" r="30" fill="{colors['glow']}" opacity="0.3" />
  <circle cx="50" cy="450" r="40" fill="{colors['glow']}" opacity="0.2" />
  
  <!-- Main content area -->
  <rect x="20" y="20" width="360" height="460" rx="20" fill="white" opacity="0.95" />
  
  <!-- Trophy Icon -->
  <g transform="translate(200, 100)" filter="url(#glow)">
    <circle cx="0" cy="0" r="50" fill="{colors['bg']}" opacity="0.2" />
    <text x="0" y="20" font-size="60" text-anchor="middle" fill="{colors['accent']}">🏆</text>
  </g>
  
  <!-- Achievement Name -->
  <text x="200" y="200" font-family="Arial, sans-serif" font-size="24" font-weight="bold" 
        text-anchor="middle" fill="{colors['accent']}">{clean_name}</text>
  
  <!-- Description -->
  <text x="200" y="240" font-family="Arial, sans-serif" font-size="16" 
        text-anchor="middle" fill="#6B7280" opacity="0.8">{description}</text>
  
  <!-- Awarded to -->
  <text x="200" y="310" font-family="Arial, sans-serif" font-size="14" 
        text-anchor="middle" fill="#9CA3AF">Awarded to</text>
  
  <!-- User name -->
  <text x="200" y="345" font-family="Arial, sans-serif" font-size="22" font-weight="bold"
        text-anchor="middle" fill="{colors['accent']}">{user_name}</text>
  
  <!-- Decorative line -->
  <line x1="100" y1="380" x2="300" y2="380" stroke="{colors['glow']}" stroke-width="2" />
  
  <!-- HanziNarrative branding -->
  <text x="200" y="430" font-family="Arial, sans-serif" font-size="14" 
        text-anchor="middle" fill="#9CA3AF" opacity="0.6">HanziNarrative</text>
  
  <!-- Chinese characters decoration -->
  <text x="30" y="460" font-family="Noto Sans SC, sans-serif" font-size="20" 
        fill="{colors['glow']}" opacity="0.3">汉字</text>
  <text x="340" y="460" font-family="Noto Sans SC, sans-serif" font-size="20" 
        fill="{colors['glow']}" opacity="0.3">成就</text>
</svg>'''
    
    return svg


def generate_badge_with_ai_prompt(achievement_name: str, description: str) -> str:
    """
    Generate a text prompt for AI image generation (for future Imagen integration)
    """
    prompt = f"""Create a beautiful achievement badge certificate with:
- Title: "{achievement_name}"
- Description: "{description}"
- Style: Modern, clean design with Chinese cultural elements
- Colors: Red and white color scheme (traditional Chinese colors)
- Include: Trophy or medal icon, decorative borders
- Format: Digital certificate/badge style
- Add subtle Chinese character decorations (汉字)
- Professional and celebratory appearance
"""
    return prompt
