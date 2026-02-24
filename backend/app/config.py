from pydantic_settings import BaseSettings
from pydantic import ConfigDict
from typing import Optional

class Settings(BaseSettings):
    database_url: str
    secret_key: str
    algorithm: str
    access_token_expire_minutes: int

    # Optional settings
    cloudinary_cloud_name: Optional[str] = None
    cloudinary_api_key: Optional[str] = None
    cloudinary_api_secret: Optional[str] = None
    frontend_url: Optional[str] = None
    sendgrid_api_key: Optional[str] = None
    sendgrid_from_email: Optional[str] = None
    stripe_secret_key: Optional[str] = None
    stripe_publishable_key: Optional[str] = None
    super_admin_email: Optional[str] = None

    model_config = ConfigDict(env_file=".env", extra='ignore')

settings = Settings()