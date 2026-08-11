from database.database import Base
from sqlalchemy import Column,String,Integer,ForeignKey,Boolean,DateTime
from datetime import datetime
import uuid
from sqlalchemy.orm import relationship

class Order(Base):
    __tablename__ = "orders"

    id = Column(String(50), primary_key=True)
    user_id = Column(String(50), ForeignKey("users.id"), nullable=False)
    product_id = Column(String(50), ForeignKey("product.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    total_price = Column(Integer, nullable=False)
    shipping_address = Column(String(200), nullable=False)
    payment_method = Column(String(50), nullable=False)
    order_status = Column(String(50), default="Pending")
    created_at = Column(DateTime, default=datetime.now)

    user = relationship("User", back_populates="orders")
    product = relationship("Product", back_populates="orders")
    payment = relationship("Payment", back_populates="order", uselist=False)