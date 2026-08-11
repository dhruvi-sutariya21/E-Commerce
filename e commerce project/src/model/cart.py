from database.database import Base
from sqlalchemy import Column,String,Integer,ForeignKey,Boolean,DateTime
from datetime import datetime
import uuid
from sqlalchemy.orm import relationship

class Cart(Base):
    __tablename__ = "cart"

    id = Column(String(50), primary_key=True)
    user_id = Column(String(50), ForeignKey("users.id"), nullable=False)
    product_id = Column(String(50), ForeignKey("product.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    total_price = Column(Integer, nullable=False)
    is_deleted = Column(Boolean, default=False)

    user = relationship("User", back_populates="carts")
    product = relationship("Product", back_populates="carts")