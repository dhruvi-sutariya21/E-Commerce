from database.database import Base
from sqlalchemy import Column,String,Integer,ForeignKey,Boolean,DateTime
from datetime import datetime
import uuid
from sqlalchemy.orm import relationship


class Payment(Base):
    __tablename__ = "payment"

    id = Column(String(50), primary_key=True, default=lambda: str(uuid.uuid4()))
    order_id = Column(String(50), ForeignKey("orders.id"), nullable=False)
    payment_method = Column(String(30), nullable=False)
    payment_status = Column(String(30), default="Pending")
    transaction_id = Column(String(100), nullable=True)
    amount = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.now)

    order = relationship("Order", back_populates="payment")
