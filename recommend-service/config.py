from pydantic import BaseSettings


class Settings(BaseSettings):
  connection_string: str = "Connection string"
  client_url: str = "http://localhost:3001"

  class Config:
    env_file = ".env.local"