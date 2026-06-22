from pydantic import BaseModel


class PromoCodeValidateRequest(BaseModel):
    code: str


class PromoCodeValidateResponse(BaseModel):
    code: str
    discount_percent: int
    valid: bool
    message: str
