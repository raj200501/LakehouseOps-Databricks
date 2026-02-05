from pydantic import BaseModel


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str


class RunRequest(BaseModel):
    pipeline_name: str = "demo_pipeline"


class PredictRequest(BaseModel):
    rows: list[dict]
