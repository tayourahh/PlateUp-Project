import os
from dotenv import load_dotenv
load_dotenv()

class Config:
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
    SUPABASE_URL = os.getenv("SUPABASE_URL")
    SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")