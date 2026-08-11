from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import smtplib

from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
security=HTTPBearer()
from sqlalchemy.orm import Session
from config import SMTP_USER,SMTP_PASS,SMTP_PORT,SMTP_SERVER,ACCESS_TOKEN_EXPIRE_MINUTES
from database.database import get_db
from src.model.user import User,OTP
from src.model.category import Category
from fastapi import HTTPException,Depends
import bcrypt
from bcrypt import hashpw,checkpw


import jwt
from jwt.exceptions import PyJWTError

from config import SMTP_PASS,SMTP_PORT,SMTP_SERVER,SMTP_USER,SECRET_KEY,ALGORITHM
from datetime import datetime,timedelta

def send_email(receiver, subject, body):
    print(f"Sending email to: {receiver}")

    msg = MIMEMultipart("alternative")
    msg["From"] = f"Aura Store <{SMTP_USER}>"
    msg["To"] = receiver
    msg["Subject"] = subject

    # Plain text version
    msg.attach(MIMEText(body, "plain"))

    # Extract OTP code if present in body string
    otp_code = "".join(filter(str.isdigit, body)) or ""

    # Rich HTML version for modern email clients
    html_content = f"""
    <html>
      <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9fafb; color: #111827;">
        <div style="max-width: 500px; margin: 0 auto; background: #ffffff; padding: 24px; border-radius: 16px; border: 1px solid #f3f4f6;">
          <h2 style="color: #E91E63; margin-top: 0; font-size: 20px;">Aura Store - {subject}</h2>
          <p style="font-size: 14px; color: #4b5563;">Hello,</p>
          <p style="font-size: 14px; color: #4b5563;">Your One-Time Password (OTP) for account verification is:</p>
          <div style="background-color: #fce4ec; border-radius: 12px; padding: 16px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #E91E63;">{otp_code if otp_code else body}</span>
          </div>
          <p style="font-size: 13px; color: #6b7280;">This OTP is valid for 5 minutes. Please do not share this OTP with anyone.</p>
          <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 20px 0;" />
          <p style="font-size: 11px; color: #9ca3af; text-align: center;">Aura Store &copy; 2026. All rights reserved.</p>
        </div>
      </body>
    </html>
    """
    msg.attach(MIMEText(html_content, "html"))

    try:
        port = int(SMTP_PORT) if SMTP_PORT else 587
        server = smtplib.SMTP(SMTP_SERVER, port, timeout=10)
        server.ehlo()
        server.starttls()
        server.ehlo()
        server.login(SMTP_USER, SMTP_PASS)
        server.sendmail(SMTP_USER, receiver, msg.as_string())
        server.quit()
        print(f"✅ [SMTP SUCCESS] Live OTP Email delivered to {receiver}!")
        return True
    except Exception as e:
        print(f"⚠️ [SMTP WARNING] Could not deliver email to {receiver} ({str(e)})")
        return False


def duplicate_email(email,db):
    dup_email = db.query(User).filter(User.email==email).first()

    if dup_email:
        raise HTTPException(status_code=409,detail="not duplicate email allowed")

def serach_email(email,db):
    user_email = db.query(User).filter(User.email==email).first()
    if not user_email:
        raise HTTPException(status_code=404,detail="invalid email")
    return user_email


def serach_id(id,db):
    user_id = db.query(User).filter(User.id==id).first()
    if not user_id:
        raise HTTPException(status_code=404,detail="invalid email")
    return user_id



def hash_password(password:str)->str:
    return bcrypt.hashpw(password.encode("utf-8"),bcrypt.gensalt()).decode("utf-8")    

def verify_password(plain_password: str, hashed_password: str):
    try:
        return checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception:
        return False
    
def create_token(email:str):

    data = {
        "sub": email,
        "exp": datetime.utcnow() + timedelta(
            minutes=int(ACCESS_TOKEN_EXPIRE_MINUTES))}


    return jwt.encode(data,SECRET_KEY,algorithm=ALGORITHM)


# def create_token(email: str):

#     data = {"email": email,"exp": datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)}
#     token = jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)
#     return token

def verify_token(token:str):
    try:
        pyload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return pyload
    except Exception as e:
        print("[JWT Decode Error]", type(e).__name__, str(e))
        return False


def get_current_user(creditional: HTTPAuthorizationCredentials = Depends(security),db: Session = Depends(get_db)):

    payload = verify_token(creditional.credentials)

    if not payload:
        raise HTTPException(status_code=401,detail="Invalid token")

    email = payload.get("sub")

    if not email:
        raise HTTPException(status_code=401,detail="Email not found in token")

    user = serach_email(email,db)

    if not user:
        raise HTTPException(status_code=404,detail="User not found")

    return user


def otp_verified(u_email,u_otp,db):

    otp_verify= db.query(OTP).filter(OTP.email==u_email,OTP.otp==u_otp).first()

    if not otp_verify:
        raise HTTPException(status_code=404,detail="invalid otp")
    return otp_verify

def search_user(id,db):
    user = db.query(User).filter(User.id==id).first()

    if not user:
        raise HTTPException(status_code=404,detail="no data found")
    return user 



def duplicate_category(name, db):
    category = db.query(Category).filter(Category.c_name == name).first()
    if category:
        raise HTTPException(status_code=400,detail="Category already exists")
    return category


def admin_user(user: User = Depends(get_current_user)):
    role_name = user.role.name.lower() if user.role and user.role.name else ""
    if role_name != "admin" and user.email != "admin@gmail.com":
        raise HTTPException(status_code=403, detail="Only Admin can access this API")
    return user

def customer_user(user: User = Depends(get_current_user)):

    if user.role.name != "user":
        raise HTTPException(status_code=403,detail="Only Customer can access this API")

    return user