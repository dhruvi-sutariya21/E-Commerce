from database.database import Base

from sqlalchemy import (Column,String,Integer,ForeignKey,Boolean,DateTime)

from sqlalchemy.orm import relationship
from datetime import datetime



class Role(Base):

    __tablename__ = "roles"


    id = Column(
        String(50),
        primary_key=True
    )


    name = Column(
        String(50),
        unique=True,
        nullable=False
    )


    users = relationship(
        "User",
        back_populates="role"
    )



class User(Base):

    __tablename__ = "users"

    id = Column(String(50),primary_key=True)
    name = Column(String(50),nullable=False)
    email = Column(String(50),unique=True,nullable=False)
    password = Column(String(255),nullable=False)
    mobile_no = Column(Integer,nullable=False)
    is_deleted = Column(Boolean, default=False)

    role_id = Column(String(50),ForeignKey("roles.id"),nullable=False)
    role = relationship("Role",back_populates="users")
    otps = relationship("OTP",back_populates="user",cascade="all, delete")
    carts = relationship("Cart",back_populates="user",cascade="all, delete")
    wishlists = relationship("Wishlist",back_populates="user",cascade="all, delete")
    orders = relationship("Order",back_populates="user",cascade="all, delete")



class OTP(Base):

    __tablename__ = "otp"


    id = Column(
        String(50),
        primary_key=True
    )


    user_id = Column(
        String(50),
        ForeignKey("users.id"),
        nullable=False
    )


    email = Column(
        String(50),
        nullable=False
    )


    otp = Column(
        String(10),
        nullable=False
    )


    is_verified = Column(
        Boolean,
        default=False
    )


    created_at = Column(
        DateTime,
        default=datetime.now
    )


    modified_at = Column(
        DateTime,
        default=datetime.now,
        onupdate=datetime.now
    )


    user = relationship(
        "User",
        back_populates="otps"
    )