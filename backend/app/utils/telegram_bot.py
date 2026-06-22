import httpx

from app.config import settings

BOT_API = f"https://api.telegram.org/bot{settings.bot_token}"


async def send_message(chat_id: int, text: str) -> bool:
    if not settings.bot_token:
        return False
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.post(f"{BOT_API}/sendMessage", json={
                "chat_id": chat_id,
                "text": text,
                "parse_mode": "HTML",
            })
            return resp.status_code == 200
    except httpx.HTTPError:
        return False
