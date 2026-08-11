from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import uuid4

from database.database import get_db

from src.model.cart import Cart
from src.model.user import User
from src.model.product import Product

from src.schemas.user_schemas import (
    Cart_Create,
    Cart_Return,
    Cart_Update
)

from src.utils.user_utils import (
    customer_user,
    admin_user
)

cart_routes = APIRouter()


@cart_routes.post("/add_cart")
def add_cart(
    cart_data: Cart_Create,
    db: Session = Depends(get_db),
    customer: User = Depends(customer_user)
):

    # Product Validation
    product = db.query(Product).filter(
        Product.id == cart_data.product_id
    ).first()

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    # Quantity Validation
    if cart_data.quantity <= 0:
        raise HTTPException(
            status_code=400,
            detail="Quantity must be greater than 0"
        )

    # Out Of Stock
    if product.stock == 0:
        raise HTTPException(
            status_code=400,
            detail="Product is out of stock"
        )

    # Stock Validation
    if cart_data.quantity > product.stock:
        raise HTTPException(
            status_code=400,
            detail=f"Only {product.stock} items available"
        )

    # Duplicate Product Check
    existing_cart = db.query(Cart).filter(
        Cart.user_id == customer.id,
        Cart.product_id == cart_data.product_id
    ).first()

    if existing_cart:
        new_quantity = existing_cart.quantity + cart_data.quantity
        if new_quantity > product.stock:
            raise HTTPException(
                status_code=400,
                detail=f"Only {product.stock} items available"
            )
        existing_cart.quantity = new_quantity
        existing_cart.total_price = product.price * new_quantity
        db.commit()
        db.refresh(existing_cart)
        return existing_cart

    total_price = product.price * cart_data.quantity

    new_cart = Cart(
        id=str(uuid4()),
        user_id=customer.id,
        product_id=cart_data.product_id,
        quantity=cart_data.quantity,
        total_price=total_price
    )

    db.add(new_cart)
    db.commit()
    db.refresh(new_cart)

    return new_cart


@cart_routes.get("/all_cart", response_model=list[Cart_Return])
def all_cart(
    db: Session = Depends(get_db),
    admin: User = Depends(admin_user)
):

    cart = db.query(Cart).all()

    if not cart:
        raise HTTPException(
            status_code=404,
            detail="Cart is empty"
        )

    return cart


@cart_routes.get("/single_cart/{id}", response_model=Cart_Return)
def single_cart(
    id: str,
    db: Session = Depends(get_db),
    customer: User = Depends(customer_user)
):

    # Check Cart ID
    if not id.strip():
        raise HTTPException(
            status_code=400,
            detail="Cart ID is required"
        )

    # Find Cart
    cart = db.query(Cart).filter(
        Cart.id == id
    ).first()

    if not cart:
        raise HTTPException(
            status_code=404,
            detail="Cart not found"
        )

    # Customer can access only own cart
    if cart.user_id != customer.id:
        raise HTTPException(
            status_code=403,
            detail="You are not allowed to access this cart"
        )

    return cart

@cart_routes.put("/update_cart/{id}", response_model=Cart_Return)
def update_cart(
    id: str,
    cart_data: Cart_Update,
    db: Session = Depends(get_db),
    customer: User = Depends(customer_user)
):

    # Find Cart
    cart = db.query(Cart).filter(
        Cart.id == id
    ).first()

    if not cart:
        raise HTTPException(
            status_code=404,
            detail="Cart not found"
        )

    # Ownership Check
    if cart.user_id != customer.id:
        raise HTTPException(
            status_code=403,
            detail="You are not allowed to update this cart"
        )

    # Find Product
    product = db.query(Product).filter(
        Product.id == cart.product_id
    ).first()

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    # Quantity Validation
    if cart_data.quantity <= 0:
        raise HTTPException(
            status_code=400,
            detail="Quantity must be greater than 0"
        )

    # Out Of Stock
    if product.stock == 0:
        raise HTTPException(
            status_code=400,
            detail="Product is out of stock"
        )

    # Stock Validation
    if cart_data.quantity > product.stock:
        raise HTTPException(
            status_code=400,
            detail=f"Only {product.stock} items available"
        )

    # Update Cart
    cart.quantity = cart_data.quantity
    cart.total_price = product.price * cart_data.quantity

    db.commit()
    db.refresh(cart)

    return cart


@cart_routes.delete("/delete_cart/{id}")
def delete_cart(
    id: str,
    db: Session = Depends(get_db),
    customer: User = Depends(customer_user)
):

    # Find Cart
    cart = db.query(Cart).filter(
        Cart.id == id
    ).first()

    if not cart:
        raise HTTPException(
            status_code=404,
            detail="Cart not found"
        )

    # Ownership Check
    if cart.user_id != customer.id:
        raise HTTPException(
            status_code=403,
            detail="You are not allowed to delete this cart"
        )

    #Soft Delete
    cart.is_deleted = True

    # Delete Cart
    db.delete(cart)
    db.commit()

    return {
        "message": "Cart item deleted successfully"
    }

@cart_routes.get("/my_cart", response_model=list[Cart_Return])
def my_cart(
    db: Session = Depends(get_db),
    customer: User = Depends(customer_user)
):

    # Get Logged In User Cart
    cart_items = db.query(Cart).filter(
        Cart.user_id == customer.id
    ).all()

    # Check Cart
    if not cart_items:
        raise HTTPException(
            status_code=404,
            detail="Your cart is empty"
        )

    return cart_items