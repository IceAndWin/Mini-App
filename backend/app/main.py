import os
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from app.api.routes import admin, auth, services, masters, bookings, users
from app.config import settings


@asynccontextmanager
async def lifespan(_app: FastAPI):
    yield


app = FastAPI(title=settings.app_name, version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

uploads_dir = os.path.join(os.path.dirname(__file__), "..", "uploads")
os.makedirs(uploads_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

app.include_router(auth.router)
app.include_router(services.router)
app.include_router(masters.router)
app.include_router(bookings.router)
app.include_router(users.router)
app.include_router(admin.router)


# ── Telegram Bot Webhook ───────────────────────────────────────

@app.post("/api/bot/webhook")
async def bot_webhook(request: Request):
    from app.services.bot_webhook import handle_update
    body = await request.json()
    base_url = str(request.base_url).rstrip("/")
    await handle_update(body, base_url=base_url)
    return {"ok": True}


@app.post("/api/bot/set-webhook")
async def set_bot_webhook(request: Request):
    import httpx
    from app.config import settings
    if not settings.bot_token:
        return {"error": "no bot token"}
    base_url = str(request.base_url).rstrip("/")
    webhook_url = f"{base_url}/api/bot/webhook"
    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.post(
            f"https://api.telegram.org/bot{settings.bot_token}/setWebhook",
            json={"url": webhook_url},
        )
        data = resp.json()
    return {"webhook_url": webhook_url, "telegram_response": data}


# ── Vercel Cron: проверка напоминаний ──────────────────────────

@app.get("/api/cron/check-reminders")
async def cron_check_reminders():
    from app.services.notification_service import check_reminders
    await check_reminders()
    return {"ok": True}


# ── Static SPA serving ─────────────────────────────────────────

def _serve_spa(dist_dir: Path):
    index = dist_dir / "index.html"
    if index.exists():
        return FileResponse(str(index))
    return JSONResponse({"error": "not found"}, status_code=404)

main_dist = Path(__file__).parent.parent.parent / "dist"
admin_dist = Path(__file__).parent.parent.parent / "admin" / "dist"

if main_dist.exists():
    app.mount("/app/assets", StaticFiles(directory=str(main_dist / "assets")), name="main_assets")

    @app.get("/app/{full_path:path}")
    async def serve_main_app(full_path: str):
        return _serve_spa(main_dist)

if admin_dist.exists():
    app.mount("/admin/assets", StaticFiles(directory=str(admin_dist / "assets")), name="admin_assets")

    @app.get("/admin/{full_path:path}")
    async def serve_admin(full_path: str):
        return _serve_spa(admin_dist)


@app.get("/health")
async def health():
    return {"status": "ok"}
