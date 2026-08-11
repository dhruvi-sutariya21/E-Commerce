from database.database import Base
from sqlalchemy import Column,String,Integer,ForeignKey,Boolean,DateTime
from datetime import datetime
import uuid
from sqlalchemy.orm import relationship

class Category(Base):
    __tablename__ = "category"

    id = Column(String(50), primary_key=True)
    c_name = Column(String(100), nullable=False, unique=True)
    description = Column(String(200), nullable=True)
    created_at = Column(DateTime, default=datetime.now, nullable=True)
    is_deleted = Column(Boolean, default=False)

    products = relationship("Product", back_populates="category")

