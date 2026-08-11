from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from uuid import uuid4
import re

from database.database import get_db
from config import ACCESS_TOKEN_EXPIRE_MINUTES

from src.model.user import User, OTP, Role
from src.model.cart import Cart
from src.model.wishlist import Wishlist
from src.model.order import Order

from src.schemas.user_schemas import (
    RoleCreate,
    User_Create,
    User_Return,
    User_Login,
    Token,
    ResetPassword,
    User_Update,OTP_Generate,OTP_Verify
)

from src.utils.user_utils import (
    hash_password,
    duplicate_email,
    serach_id,
    otp_verified,
    get_current_user,
    admin_user,
    customer_user,
    verify_password,
    search_user as search_user_utils,
    send_email,
    create_token,
)

user_routes = APIRouter()


# ===========================
# Add Role
# ===========================

@user_routes.post("/add_role")
def add_role(role_data: RoleCreate, db: Session = Depends(get_db)):

    duplicate = db.query(Role).filter(
        Role.name.ilike(role_data.name.strip())
    ).first()

    if duplicate:
        raise HTTPException(
            status_code=400,
            detail="Role already exists"
        )

    new_role = Role(
        id=str(uuid4()),
        name=role_data.name.strip()
    )

    db.add(new_role)
    db.commit()
    db.refresh(new_role)

    return {
        "message": "Role created successfully",
        "data": new_role
    }


# ===========================
# Admin Register
# ===========================

@user_routes.post("/admin_register", response_model=User_Return)
def admin_register(
    user_data: User_Create,
    db: Session = Depends(get_db)
):

    admin_role = db.query(Role).filter(
        Role.name == "admin"
    ).first()

    if not admin_role:
        raise HTTPException(
            status_code=404,
            detail="Admin role not found"
        )

    if not user_data.name.strip():
        raise HTTPException(
            status_code=400,
            detail="Name is required"
        )

    if len(user_data.name.strip()) < 3:
        raise HTTPException(
            status_code=400,
            detail="Name must be at least 3 characters"
        )

    email_pattern = r'^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'

    if not re.match(email_pattern, user_data.email):
        raise HTTPException(
            status_code=400,
            detail="Invalid email format"
        )

    duplicate = db.query(User).filter(
        User.email == user_data.email
    ).first()

    if duplicate:
        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    if len(str(user_data.mobile_no)) != 10:
        raise HTTPException(
            status_code=400,
            detail="Mobile number must be 10 digits"
        )

    password = user_data.password

    if len(password) < 8:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 8 characters"
        )

    if not any(c.isupper() for c in password):
        raise HTTPException(
            status_code=400,
            detail="Password must contain one uppercase letter"
        )

    if not any(c.islower() for c in password):
        raise HTTPException(
            status_code=400,
            detail="Password must contain one lowercase letter"
        )

    if not any(c.isdigit() for c in password):
        raise HTTPException(
            status_code=400,
            detail="Password must contain one number"
        )

    special = "!@#$%^&*()_-+=[]{}|\\:;\"'<>,.?/"

    if not any(c in special for c in password):
        raise HTTPException(
            status_code=400,
            detail="Password must contain one special character"
        )

    new_admin = User(
        id=str(uuid4()),
        role_id=admin_role.id,
        name=user_data.name.strip(),
        email=user_data.email.lower(),
        password=hash_password(password),
        mobile_no=user_data.mobile_no
    )

    db.add(new_admin)
    db.commit()
    db.refresh(new_admin)

    return new_admin

# ===========================
# User Register
# ===========================

@user_routes.post("/user_register", response_model=User_Return)
def user_register(
    user_data: User_Create,
    db: Session = Depends(get_db)
):

    # Check Customer Role
    customer_role = db.query(Role).filter(
        Role.name == "user"
    ).first()

    if not customer_role:
        raise HTTPException(
            status_code=404,
            detail="Customer role not found"
        )

    # Name Validation
    if not user_data.name.strip():
        raise HTTPException(
            status_code=400,
            detail="Name is required"
        )

    if len(user_data.name.strip()) < 3:
        raise HTTPException(
            status_code=400,
            detail="Name must be at least 3 characters"
        )

    if not user_data.name.replace(" ", "").isalpha():
        raise HTTPException(
            status_code=400,
            detail="Name should contain only alphabets"
        )

    # Email Validation
    email_pattern = r'^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'

    if not re.match(email_pattern, user_data.email):
        raise HTTPException(
            status_code=400,
            detail="Invalid email format"
        )

    # Duplicate Email
    duplicate = db.query(User).filter(
        User.email == user_data.email
    ).first()

    if duplicate:
        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    # Mobile Validation
    mobile = str(user_data.mobile_no)

    if len(mobile) != 10:
        raise HTTPException(
            status_code=400,
            detail="Mobile number must be exactly 10 digits"
        )

    if mobile[0] not in ["6", "7", "8", "9"]:
        raise HTTPException(
            status_code=400,
            detail="Invalid mobile number"
        )

    # Password Validation
    password = user_data.password

    if len(password) < 8:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 8 characters"
        )

    if not any(c.isupper() for c in password):
        raise HTTPException(
            status_code=400,
            detail="Password must contain at least one uppercase letter"
        )

    if not any(c.islower() for c in password):
        raise HTTPException(
            status_code=400,
            detail="Password must contain at least one lowercase letter"
        )

    if not any(c.isdigit() for c in password):
        raise HTTPException(
            status_code=400,
            detail="Password must contain at least one number"
        )

    special_characters = "!@#$%^&*()_-+=[]{}|\\:;\"'<>,.?/"

    if not any(c in special_characters for c in password):
        raise HTTPException(
            status_code=400,
            detail="Password must contain at least one special character"
        )

    # Create User
    new_user = User(
        id=str(uuid4()),
        role_id=customer_role.id,
        name=user_data.name.strip(),
        email=user_data.email.lower(),
        password=hash_password(password),
        mobile_no=user_data.mobile_no
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user
# ===========================
# User Login
# ===========================
# ===========================
# User Login
# ===========================

@user_routes.post("/user_login")
def login_user(
    user: User_Login,
    db: Session = Depends(get_db)
):

    # Email Required
    if not user.email.strip():
        raise HTTPException(
            status_code=400,
            detail="Email is required"
        )


    # Email Format Validation
    email_pattern = r'^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'


    if not re.match(email_pattern, user.email):
        raise HTTPException(
            status_code=400,
            detail="Invalid email format"
        )


    # Password Required
    if not user.password.strip():
        raise HTTPException(
            status_code=400,
            detail="Password is required"
        )


    # Find User

    find_user = db.query(User).filter(
        User.email == user.email.lower()
    ).first()


    if not find_user or find_user.is_deleted:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password or account deactivated"
        )


    # Verify Password

    if not verify_password(
        user.password,
        find_user.password
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )


    # Create JWT Token

    access_token = create_token(
        find_user.email
    )


    return {

        "message":"Login successfully",

        "access_token":access_token,

        "token_type":"bearer",

        "user":{

            "id":find_user.id,

            "name":find_user.name,

            "email":find_user.email,

            "role_id":find_user.role_id
        }
    }

# ===========================
# Get All Users
# ===========================

# ===========================
# Get All Users
# ===========================

@user_routes.get("/all_user")
def all_user(
    db: Session = Depends(get_db),
    admin: User = Depends(admin_user)
):

    users = db.query(User).filter(User.is_deleted == False).all()


    if not users:
        raise HTTPException(
            status_code=404,
            detail="No users found"
        )


    return {
        "message":"Users fetched successfully",
        "total_users":len(users),
        "users":users
    }
# ===========================
# Get Single User
# ===========================

# ===========================
# Get Single User
# ===========================

@user_routes.get("/single_user/{id}")
def single_user(
    id:str,
    db:Session = Depends(get_db),
    current_user:User = Depends(customer_user)
):

    user = db.query(User).filter(
        User.id == id
    ).first()


    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )


    # User can see only own profile

    if user.id != current_user.id:

        role = db.query(Role).filter(Role.id == current_user.role_id).first()

    if current_user.role_id != "admin":
            raise HTTPException(
                status_code=403,
                detail="You cannot access this user data"
            )


    return {
        "message":"User found successfully",
        "user":user
    }


# ===========================
# Update User
# ===========================

@user_routes.put("/update_user/{id}")
def update_user(
    id:str,
    user_data:User_Update,
    db:Session = Depends(get_db),
    current_user:User = Depends(customer_user)
):


    user = db.query(User).filter(
        User.id == id
    ).first()


    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )


    # User can update only own profile

    if user.id != current_user.id:

        if current_user.role_id != "admin":
            raise HTTPException(
                status_code=403,
                detail="You cannot update this user"
            )


    # Name Validation

    if user_data.name:

        if len(user_data.name.strip()) < 3:
            raise HTTPException(
                status_code=400,
                detail="Name must be minimum 3 characters"
            )


        user.name = user_data.name.strip()



    # Email Validation

    if user_data.email:


        email_pattern = r'^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'


        if not re.match(email_pattern,user_data.email):

            raise HTTPException(
                status_code=400,
                detail="Invalid email format"
            )


        duplicate_email = db.query(User).filter(
            User.email == user_data.email.lower(),
            User.id != id
        ).first()


        if duplicate_email:
            raise HTTPException(
                status_code=400,
                detail="Email already exists"
            )


        user.email = user_data.email.lower()



    # Mobile Validation

    if user_data.mobile_no:

        mobile = str(user_data.mobile_no)


        if len(mobile) != 10:

            raise HTTPException(
                status_code=400,
                detail="Mobile number must be 10 digits"
            )


        if mobile[0] not in ["6","7","8","9"]:

            raise HTTPException(
                status_code=400,
                detail="Invalid mobile number"
            )


        user.mobile_no = mobile



    db.commit()
    db.refresh(user)


    return {
        "message":"User updated successfully",
        "user":user
    }

@user_routes.put("/reset_password")
def reset_password(
    password_data: ResetPassword,
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(
        User.email == password_data.email.lower()
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    otp = db.query(OTP).filter(
        OTP.user_id == user.id,
        OTP.is_verified == True
    ).first()

    if not otp:
        raise HTTPException(
            status_code=400,
            detail="Please verify OTP first"
        )

    if password_data.new_password != password_data.confirm_password:
        raise HTTPException(
            status_code=400,
            detail="Passwords do not match"
        )

    if len(password_data.new_password) < 8:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 8 characters"
        )

    user.password = hash_password(password_data.new_password)

    otp.is_verified = False
    otp.otp = ""

    db.commit()

    return {
        "message": "Password reset successfully"
    }


@user_routes.post("/forgot_password")
def forgot_password(
    forgot: OTP_Generate,
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(
        User.email == forgot.email.lower()
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    otp_code = str(randint(100000, 999999))

    otp = db.query(OTP).filter(
        OTP.user_id == user.id
    ).first()

    if otp:
        otp.otp = otp_code
        otp.is_verified = False
        otp.created_at = datetime.now()

    else:
        otp = OTP(
            id=str(uuid4()),
            user_id=user.id,
            email=user.email,
            otp=otp_code,
            is_verified=False
        )
        db.add(otp)

    db.commit()

    sent = send_email(
        user.email,
        "Forgot Password OTP",
        f"Your password reset OTP is: {otp_code}"
    )

    if not sent:
        print(f"\n=======================================================")
        print(f"🔑 GENERATED OTP FOR {user.email}: {otp_code}")
        print(f"⚠️ SMTP Auth Failed (535 Bad Credentials). Please update SMTP_PASS in .env for live Gmail delivery.")
        print(f"=======================================================\n")
        return {
            "message": f"OTP generated successfully. (OTP Code: {otp_code})",
            "otp_code": otp_code,
            "notice": "SMTP login failed. Please update Gmail App Password in .env for live email delivery."
        }

    return {
        "message": "OTP sent successfully to your email!"
    }




from random import randint

@user_routes.post("/otp_generate")
def otp_generate(
    otp_data: OTP_Generate,
    db: Session = Depends(get_db)
):

    # Check User
    user = db.query(User).filter(
        User.email == otp_data.email.lower()
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    # Generate 6 Digit OTP
    otp_code = str(randint(100000, 999999))

    # Check Existing OTP
    existing_otp = db.query(OTP).filter(
        OTP.user_id == user.id
    ).first()

    if existing_otp:
        existing_otp.otp = otp_code
        existing_otp.is_verified = False
        existing_otp.created_at = datetime.now()

    else:
        new_otp = OTP(
            id=str(uuid4()),
            user_id=user.id,
            email=user.email,
            otp=otp_code,
            is_verified=False
        )
        db.add(new_otp)

    db.commit()

    # Send OTP Email
    sent = send_email(
        user.email,
        "OTP Verification",
        f"Your OTP is {otp_code}"
    )

    if not sent:
        print(f"\n=======================================================")
        print(f"🔑 GENERATED OTP FOR {user.email}: {otp_code}")
        print(f"⚠️ SMTP Auth Failed (535 Bad Credentials). Please update SMTP_PASS in .env for live Gmail delivery.")
        print(f"=======================================================\n")
        return {
            "message": f"OTP generated successfully. (OTP Code: {otp_code})",
            "otp_code": otp_code,
            "notice": "SMTP login failed. Please update Gmail App Password in .env for live email delivery."
        }

    return {
        "message": "OTP sent successfully to your email!"
    }


@user_routes.post("/otp_verify")
def otp_verify(
    otp_data: OTP_Verify,
    db: Session = Depends(get_db)
):

    # Check User
    user = db.query(User).filter(
        User.email == otp_data.email.lower()
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    # Check OTP
    otp = db.query(OTP).filter(
        OTP.user_id == user.id,
        OTP.otp == otp_data.otp
    ).first()

    if not otp:
        raise HTTPException(
            status_code=400,
            detail="Invalid OTP"
        )

    # OTP Expiry (5 Minutes)
    expiry_time = otp.created_at + timedelta(minutes=5)

    if datetime.now() > expiry_time:
        raise HTTPException(
            status_code=400,
            detail="OTP has expired"
        )

    if otp.is_verified:
        raise HTTPException(
            status_code=400,
            detail="OTP already verified"
        )

    otp.is_verified = True

    db.commit()

    return {
        "message": "OTP verified successfully"
    }





@user_routes.delete("/delete_user/{id}")
def delete_user(
    id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(admin_user)
):

    # Check User
    user = db.query(User).filter(
        User.id == id,
        User.is_deleted == False
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    # Soft Delete User in Database (Keep user row for historical integrity)
    user.is_deleted = True

    db.commit()
    db.refresh(user)

    return {
        "message": "User soft deleted successfully"
    }


# ===========================
# My Profile
# ===========================

@user_routes.get("/my_profile")
def my_profile(current_user: dict = Depends(get_current_user),db: Session = Depends(get_db)):

    user = db.query(User).filter(User.id == current_user.id).first()

    if not user:
        raise HTTPException(status_code=404,detail="User not found")

    return {
        "message": "Profile fetched successfully",
        "user": user
    }