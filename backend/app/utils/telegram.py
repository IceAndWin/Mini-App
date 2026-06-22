import hashlib
import hmac
from urllib.parse import parse_qs, urlencode


def validate_telegram_init_data(init_data: str, bot_token: str) -> bool:
    parsed = parse_qs(init_data, keep_blank_values=True)
    parsed = {k: v[0] for k, v in parsed.items()}

    hash_value = parsed.pop("hash", None)
    if not hash_value:
        return False

    items = sorted(parsed.items(), key=lambda x: x[0])
    data_check_string = "\n".join(f"{k}={v}" for k, v in items)

    secret_key = hashlib.sha256(bot_token.encode()).digest()
    computed_hash = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()

    return hmac.compare_digest(computed_hash, hash_value)
