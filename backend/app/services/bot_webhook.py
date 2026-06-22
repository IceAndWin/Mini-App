import logging

from sqlalchemy import select

from app.database import async_session
from app.models.user import User
from app.utils.jwt import create_access_token
from app.utils.telegram_bot import send_message

logger = logging.getLogger(__name__)

async def _api_call(chat_id: int, text: str, reply_markup: dict | None = None) -> None:
    import httpx
    from app.config import settings
    if not settings.bot_token:
        return
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            await client.post(
                f"https://api.telegram.org/bot{settings.bot_token}/sendMessage",
                json={"chat_id": chat_id, "text": text, "parse_mode": "HTML", "reply_markup": reply_markup},
            )
    except httpx.HTTPError:
        pass


async def handle_update(update: dict, base_url: str = "") -> None:
    message = update.get("message")
    if not message:
        return

    chat_id = message["chat"]["id"]
    text = (message.get("text") or "").strip()
    user_info = message.get("from", {})

    if text == "/start":
        await _api_call(chat_id,
            "👋 Добро пожаловать!\nНажмите кнопку ниже, чтобы открыть приложение.",
            reply_markup={
                "inline_keyboard": [[
                    {"text": "🚀 Открыть Mini App", "web_app": {"url": base_url}}
                ]]
            },
        )
    elif text == "/admin":
        await _handle_admin_command(chat_id, user_info, base_url=base_url)


async def _handle_admin_command(chat_id: int, user_info: dict, base_url: str = "") -> None:
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
        str(user.id), telegram_id,
        expires_minutes=5,
        extra_claims={"purpose": "admin_login"},
    )

    login_url = f"{base_url}/admin/login?token={temp_token}"
    await send_message(chat_id,
        f"🔑 <a href=\"{login_url}\">Войти в админ-панель</a>\n\nСсылка действительна 5 минут.",
    )
