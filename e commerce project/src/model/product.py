from database.database import Base
from sqlalchemy import Column,String,Integer,ForeignKey,Boolean,DateTime
from datetime import datetime
import uuid
from sqlalchemy.orm import relationship

class Product(Base):
    __tablename__ = "product"

    id = Column(String(50), primary_key=True)
    category_id = Column(String(50), ForeignKey("category.id"), nullable=False)
    name = Column(String(100), nullable=False)
    price = Column(Integer, nullable=False)
    stock = Column(Integer, nullable=False)
    description = Column(String(250), nullable=True)
    image = Column(String(255), nullable=True)
    is_deleted = Column(Boolean, default=False)

    category = relationship("Category", back_populates="products")
    carts = relationship("Cart", back_populates="product")
    wishlists = relationship("Wishlist", back_populates="product")
    orders = relationship("Order", back_populates="product")