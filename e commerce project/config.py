from dotenv import load_dotenv
import os
load_dotenv()

DB_URL = os.environ.get("DB_URL")

SECRET_KEY=os.environ.get("SECRET_KEY")
ALGORITHM=os.environ.get("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES=int(os.environ.get("ACCESS_TOKEN_EXPIRE_MINUTES"))

SMTP_SERVER=os.environ.get("SMTP_SERVER")
SMTP_PORT=os.environ.get("SMTP_PORT")
SMTP_USER=os.environ.get("SMTP_USER")
SMTP_PASS=os.environ.get("SMTP_PASS")