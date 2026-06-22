from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "MiniApp"
    debug: bool = True

    db_host: str = "127.0.0.1"
    db_port: int = 5432
    db_user: str = "postgres"
    db_password: str = ""
    db_name: str = "miniapp"
    db_ssl: str = ""

    @property
    def database_url(self) -> str:
        base = (
            f"postgresql+asyncpg://{self.db_user}:{self.db_password}"
            f"@{self.db_host}:{self.db_port}/{self.db_name}"
        )
        if self.db_ssl:
            base += f"?ssl={self.db_ssl}"
        return base

    bot_token: str = ""
    jwt_secret: str = "super-secret-key-change-me"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 1440

    model_config = {"env_file": ".env", "env_prefix": "APP_"}


settings = Settings()
