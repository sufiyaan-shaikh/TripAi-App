from config.ai import AI_PROVIDER, GROQ_API_KEY, CLAUDE_API_KEY, GROQ_MODEL, CLAUDE_MODEL

async def chat(messages: list, system_prompt: str = "") -> str:
    if AI_PROVIDER == "groq":
        return await _groq_chat(messages, system_prompt)
    elif AI_PROVIDER == "claude":
        return await _claude_chat(messages, system_prompt)
    else:
        raise ValueError(f"Unknown AI provider: {AI_PROVIDER}")

async def _groq_chat(messages: list, system_prompt: str) -> str:
    from groq import Groq
    client = Groq(api_key=GROQ_API_KEY)

    full_messages = []
    if system_prompt:
        full_messages.append({"role": "system", "content": system_prompt})
    full_messages.extend(messages)

    response = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=full_messages,
        temperature=0.7,
        max_tokens=4096
    )
    return response.choices[0].message.content

async def _claude_chat(messages: list, system_prompt: str) -> str:
    import anthropic
    client = anthropic.Anthropic(api_key=CLAUDE_API_KEY)

    response = client.messages.create(
        model=CLAUDE_MODEL,
        max_tokens=4096,
        system=system_prompt,
        messages=messages
    )
    return response.content[0].text