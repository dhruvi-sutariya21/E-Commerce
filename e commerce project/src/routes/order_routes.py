from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import uuid4
from datetime import datetime

from database.database import get_db

from src.model.order import Order
from src.model.user import User
from src.model.product import Product
from src.model.cart import Cart

from src.schemas.user_schemas import (
    Order_Return,
    Order_Create,
    Order_Update,
    Return_Order
)

from src.utils.user_utils import (
    get_current_user,
    admin_user,
    customer_user
)

order_routes = APIRouter()


@order_routes.post("/place_order", response_model=Order_Return)
def place_order(
    order_data: Order_Create,
    db: Session = Depends(get_db),
    customer: User = Depends(customer_user)
):

    # Logged In User
    user = db.query(User).filter(
        User.id == customer.id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    # Product Validation
    product = db.query(Product).filter(
        Product.id == order_data.product_id
    ).first()

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    # Product Price Validation
    if product.price <= 0:
        raise HTTPException(
            status_code=400,
            detail="Invalid product price"
        )

    # Quantity Required
    if order_data.quantity is None:
        raise HTTPException(
            status_code=400,
            detail="Quantity is required"
        )

    # Quantity Validation
    if order_data.quantity <= 0:
        raise HTTPException(
            status_code=400,
            detail="Quantity must be greater than 0"
        )

    # Maximum Quantity
    if order_data.quantity > 100:
        raise HTTPException(
            status_code=400,
            detail="Maximum order quantity is 100"
        )

    # Out Of Stock
    if product.stock == 0:
        raise HTTPException(
            status_code=400,
            detail="Product is out of stock"
        )

    # Stock Validation
    if order_data.quantity > product.stock:
        raise HTTPException(
            status_code=400,
            detail=f"Only {product.stock} items available"
        )

    # Shipping Address Validation
    if not order_data.shipping_address.strip():
        raise HTTPException(
            status_code=400,
            detail="Shipping address is required"
        )

    if len(order_data.shipping_address.strip()) < 10:
        raise HTTPException(
            status_code=400,
            detail="Please enter a valid shipping address"
        )

    if len(order_data.shipping_address.strip()) > 200:
        raise HTTPException(
            status_code=400,
            detail="Shipping address cannot exceed 200 characters"
        )

    # Payment Method Validation
    valid_payment_methods = [
        "COD",
        "UPI",
        "Card",
        "Net Banking"
    ]

    if order_data.payment_method not in valid_payment_methods:
        raise HTTPException(
            status_code=400,
            detail="Invalid payment method"
        )

    # Calculate Total Price
    total_price = product.price * order_data.quantity

    # Create Order
    new_order = Order(
        id=str(uuid4()),
        user_id=customer.id,
        product_id=order_data.product_id,
        quantity=order_data.quantity,
        total_price=total_price,
        shipping_address=order_data.shipping_address.strip(),
        payment_method=order_data.payment_method,
        order_status="Pending",
        created_at=datetime.now()
    )

    # Reduce Product Stock
    product.stock -= order_data.quantity

    # Clear item from user's cart if present
    cart_items = db.query(Cart).filter(
        Cart.user_id == customer.id,
        Cart.product_id == order_data.product_id
    ).all()
    for cart_item in cart_items:
        db.delete(cart_item)

    db.add(new_order)
    db.commit()
    db.refresh(new_order)

    return new_order

@order_routes.get(
    "/all_orders",
    response_model=list[Order_Return]
)
def all_orders(
    db: Session = Depends(get_db),
    admin: User = Depends(admin_user)
):

    orders = db.query(Order).all()

    if not orders:
        raise HTTPException(
            status_code=404,
            detail="No orders found"
        )

    return [Order_Return.model_validate(o) for o in orders]


@order_routes.get(
    "/single_order/{id}",
    response_model=Order_Return
)
def single_order(
    id: str,
    db: Session = Depends(get_db),
    customer: User = Depends(customer_user)
):

    # Order ID Required
    if not id.strip():
        raise HTTPException(
            status_code=400,
            detail="Order ID is required"
        )

    # Check Order Exists
    order = db.query(Order).filter(
        Order.id == id
    ).first()

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )

    # Ownership Check
    if order.user_id != customer.id:
        raise HTTPException(
            status_code=403,
            detail="You are not authorized to view this order"
        )

    return order

@order_routes.put("/update_order/{id}", response_model=Order_Return)
def update_order(
    id: str,
    order_data: Order_Update,
    db: Session = Depends(get_db),
    admin: User = Depends(admin_user)
):

    # Order ID Required
    if not id.strip():
        raise HTTPException(
            status_code=400,
            detail="Order ID is required"
        )

    # Check Order Exists
    order = db.query(Order).filter(
        Order.id == id
    ).first()

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )

    # Business Rule: Cancelled orders are final and cannot be modified
    if order.order_status == "Cancelled":
        raise HTTPException(
            status_code=400,
            detail="Cancelled orders cannot be updated."
        )

    # Valid Status
    valid_status = [
        "Pending",
        "Confirmed",
        "Packed",
        "Shipped",
        "Out For Delivery",
        "Delivered",
        "Cancelled"
    ]

    if order_data.order_status not in valid_status:
        raise HTTPException(
            status_code=400,
            detail="Invalid order status"
        )

    # If cancelling, restore product stock
    if order.order_status != "Cancelled" and order_data.order_status == "Cancelled":
        product = db.query(Product).filter(
            Product.id == order.product_id
        ).first()
        if product:
            product.stock += order.quantity

    order.order_status = order_data.order_status

    db.commit()
    db.refresh(order)

    return order


@order_routes.put("/cancel_order/{id}", response_model=Order_Return)
def cancel_order(
    id: str,
    db: Session = Depends(get_db),
    customer: User = Depends(customer_user)
):

    # Check Order Exists
    order = db.query(Order).filter(
        Order.id == id
    ).first()

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )

    # Ownership Check
    if order.user_id != customer.id:
        raise HTTPException(
            status_code=403,
            detail="You are not authorized to cancel this order"
        )

    # Already Cancelled
    if order.order_status == "Cancelled":
        raise HTTPException(
            status_code=400,
            detail="Cancelled orders cannot be updated."
        )

    # Delivered Order
    if order.order_status == "Delivered":
        raise HTTPException(
            status_code=400,
            detail="Delivered order cannot be cancelled"
        )

    # Restore Stock
    product = db.query(Product).filter(
        Product.id == order.product_id
    ).first()

    if product:
        product.stock += order.quantity

    order.order_status = "Cancelled"

    db.commit()
    db.refresh(order)

    return order


@order_routes.get("/track_order/{id}")
def track_order(
    id: str,
    db: Session = Depends(get_db),
    customer: User = Depends(customer_user)
):

    # Check Order Exists
    order = db.query(Order).filter(
        Order.id == id
    ).first()

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )

    # Ownership Check
    if order.user_id != customer.id:
        raise HTTPException(
            status_code=403,
            detail="You are not authorized to track this order"
        )

    return {
        "order_id": order.id,
        "status": order.order_status
    }

@order_routes.get("/my_orders", response_model=list[Order_Return])
def my_orders(
    db: Session = Depends(get_db),
    customer: User = Depends(customer_user)
):

    # Get Logged In User Orders
    orders = db.query(Order).filter(
        Order.user_id == customer.id
    ).all()

    # No Orders
    if not orders:
        raise HTTPException(
            status_code=404,
            detail="No orders found"
        )

    return [Order_Return.model_validate(o) for o in orders]