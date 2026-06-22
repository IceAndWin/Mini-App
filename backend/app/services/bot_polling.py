import asyncio
import logging

import httpx
from sqlalchemy import select

from app.config import settings
from app.database import async_session
from app.models.user import User
from app.utils.jwt import create_access_token
from app.utils.telegram_bot import send_message

logger = logging.getLogger(__name__)

BOT_API = f"https://api.telegram.org/bot{settings.bot_token}"
NGROK_URL = "https://relatable-reburial-kimono.ngrok-free.dev"
_last_update_id = 0


async def _api_call(method: str, **kwargs) -> dict | None:
    if not settings.bot_token:
        return None
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.post(f"{BOT_API}/{method}", json=kwargs)
            if resp.status_code == 200:
                return resp.json()
    except httpx.HTTPError:
        return None
    return None


async def _poll_once() -> None:
    global _last_update_id
    if not settings.bot_token:
        return

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.get(f"{BOT_API}/getUpdates", params={
                "offset": _last_update_id + 1,
                "timeout": 30,
            })
            if resp.status_code != 200:
                return
            data = resp.json()
            if not data.get("ok"):
                return
    except httpx.HTTPError:
        return

    for update in data.get("result", []):
        update_id: int = update.get("update_id", 0)
        if update_id <= _last_update_id:
            continue
        _last_update_id = update_id

        message = update.get("message")
        if not message:
            continue

        chat_id = message["chat"]["id"]
        text = (message.get("text") or "").strip()
        user_info = message.get("from", {})

        if text == "/start":
            await _handle_start(chat_id)
        elif text == "/admin":
            await _handle_admin_command(chat_id, user_info)


async def _handle_start(chat_id: int) -> None:
    """Отправляет кнопку Mini App всем пользователям."""
    await _api_call("sendMessage", chat_id=chat_id,
        text="👋 Добро пожаловать!\nНажмите кнопку ниже, чтобы открыть приложение.",
        reply_markup={
            "inline_keyboard": [[
                {
                    "text": "🚀 Открыть Mini App",
                    "web_app": {"url": f"{NGROK_URL}/app/"},
                }
            ]]
        },
    )


async def _handle_admin_command(chat_id: int, user_info: dict) -> None:
    telegram_id = user_info.get("id")
    if not telegram_id:
        return

    async with async_session() as db:
        result = await db.execute(select(User).where(User.telegram_id == telegram_id))
        user = result.scalar_one_or_none()

    if not user:
        await send_message(chat_id, "❌ Вы не зарегистрированы. Сначала откройте Mini App.")
        return

    if not user.is_admin:
        await send_message(chat_id, "❌ У вас нет прав администратора.")
        return

    temp_token = create_access_token(
        str(user.id),
        telegram_id,
        expires_minutes=5,
        extra_claims={"purpose": "admin_login"},
    )

    login_url = f"{NGROK_URL}/admin/login?token={temp_token}"
    await send_message(
        chat_id,
        f"🔑 <a href=\"{login_url}\">Войти в админ-панель</a>\n\n"
        f"Ссылка действительна 5 минут.",
    )


async def poll_forever() -> None:
    while True:
        try:
            await _poll_once()
        except Exception:
            logger.exception("Bot polling error")
        await asyncio.sleep(1)
