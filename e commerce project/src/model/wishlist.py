from database.database import Base
from sqlalchemy import Column, String, ForeignKey,Boolean
from sqlalchemy.orm import relationship


class Wishlist(Base):

    __tablename__ = "wishlist"

    id = Column(String(50),primary_key=True)
    user_id = Column(String(50),ForeignKey("users.id"),nullable=False)
    product_id = Column(String(50),ForeignKey("product.id"),nullable=False)
    user = relationship("User",back_populates="wishlists")
    product = relationship("Product",back_populates="wishlists")
    is_deleted = Column(Boolean, default=False)