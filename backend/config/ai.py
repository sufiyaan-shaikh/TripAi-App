import os

AI_PROVIDER = os.getenv("AI_PROVIDER", "groq")

GROQ_API_KEY    = os.getenv("GROQ_API_KEY")
CLAUDE_API_KEY  = os.getenv("CLAUDE_API_KEY")

GROQ_MODEL      = "llama-3.3-70b-versatile"
CLAUDE_MODEL    = "claude-opus-4-5"
