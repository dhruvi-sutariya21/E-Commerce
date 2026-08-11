from pydantic import BaseModel, ConfigDict
from typing import Optional
from uuid import UUID
from datetime import datetime

class OTP_Generate(BaseModel):
    email:str

class OTP_Verify(BaseModel):
    email:str
    otp: str

class RoleCreate(BaseModel):
    name: str

class RoleReturn(BaseModel):
    id: str
    name: str

class User_Create(BaseModel):
    name:str
    email:str
    password:str
    mobile_no:int

class User_Return(BaseModel):
    name:str
    email:str

class User_Login(BaseModel):
    email:str
    password:str

class ResetPassword(BaseModel):
    email:str
    new_password: str
    confirm_password: str

class Token(BaseModel):
    access_token:str
    token_type:str

class ResetPassword(BaseModel):
    email:str
    old_password:str
    new_password:str
    con_password:str

class TokenData(BaseModel):
    email:Optional[str]=None

class User_Update(BaseModel):
    name:Optional[str]=None
    email:Optional[str]=None
    mobile_no:Optional[str]=None

class category_create(BaseModel):
    c_name:str
    description:str

class category_update(BaseModel):
    c_name: Optional[str] = None
    description: Optional[str] = None

class ProductCreate(BaseModel):
    category_id: str
    name: str
    price: int
    stock: int
    description: str

class Product_Update(BaseModel):
    category_id:str
    name:str
    price:int
    stock:int
    description:str
 
class ProductReturn(BaseModel):
    id: str
    category_id: str
    name: str
    price: int
    stock: int
    description: str
    image: str 

class Cart_Create(BaseModel):
    product_id: str
    quantity: int
    
class Cart_Return(BaseModel):
    id:str
    user_id:str
    product_id:str
    quantity:int

class Cart_Update(BaseModel):
    quantity:int


class Wishlist_Create(BaseModel):
    user_id:str
    product_id:str


class Wishlist_Return(BaseModel):
    id:str
    user_id:str
    product_id:str

class Order_Create(BaseModel):
    user_id: str
    product_id: str
    quantity: int
    shipping_address: str
    payment_method: str

class Order_Return(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    product_id: str
    quantity: int
    total_price: float
    shipping_address: str
    payment_method: str
    order_status: str
    created_at: datetime

class Order_Update(BaseModel):
    order_status: str

class Return_Order(BaseModel):
    return_reason: str

class Payment_Create(BaseModel):
    order_id: str
    payment_method: str     
    amount: float

class Payment_Return(BaseModel):
    id: UUID
    order_id: UUID
    payment_method: str
    payment_status: str
    transaction_id: Optional[str] = None
    amount: float
    paid_at: Optional[datetime] = None

class Payment_Update(BaseModel):
    payment_status: Optional[str] = None


