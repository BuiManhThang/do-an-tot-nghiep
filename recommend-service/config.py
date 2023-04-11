from pydantic import BaseSettings


class Settings(BaseSettings):
  connection_string: str = "Connection string"

  class Config:
    env_file = ".env.local"