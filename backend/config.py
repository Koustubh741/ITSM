"""
Configuration settings for the application
"""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Database
    DB_HOST: str = "127.0.0.1"
    DB_PORT: int = 5432
    DB_NAME: str = "ITSM"
    DB_USER: str = "postgres"
    DB_PASSWORD: str = "Prakhyat@15"
    DATABASE_URL: Optional[str] = None
    
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = True
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440 # 24 Hours
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # CORS
    FRONTEND_URL: str = "http://localhost:3000"
    
    # File Upload
    MAX_UPLOAD_SIZE: int = 10485760  # 10MB
    UPLOAD_DIR: str = "uploads"
    
    class Config:
        env_file = ".env"
        case_sensitive = True
    
    @property
    def db_url(self) -> str:
        """Generate database URL from components or use provided URL"""
        if self.DATABASE_URL:
            return self.DATABASE_URL
        from urllib.parse import quote_plus
        encoded_password = quote_plus(self.DB_PASSWORD)
        return f"postgresql://{self.DB_USER}:{encoded_password}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"


settings = Settings()
