from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import uuid4

from database.database import get_db

from src.model.payment import Payment
from src.model.order import Order
from src.model.user import User

from src.schemas.user_schemas import (
    Payment_Create,
    Payment_Return
)

from src.utils.user_utils import (
    admin_user,
    customer_user
)

payment_routes = APIRouter()


@payment_routes.post(
    "/create_payment",
    response_model=Payment_Return
)
def create_payment(
    payment: Payment_Create,
    db: Session = Depends(get_db),
    customer: User = Depends(customer_user)
):

    # Check Order
    order = db.query(Order).filter(
        Order.id == payment.order_id
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
            detail="You are not authorized to create payment for this order"
        )

    # Duplicate Payment
    existing_payment = db.query(Payment).filter(
        Payment.order_id == payment.order_id
    ).first()

    if existing_payment:
        raise HTTPException(
            status_code=400,
            detail="Payment already exists for this order"
        )

    # Cancelled Order
    if order.order_status == "Cancelled":
        raise HTTPException(
            status_code=400,
            detail="Payment cannot be created for cancelled order"
        )

    # Amount Validation
    if payment.amount <= 0:
        raise HTTPException(
            status_code=400,
            detail="Amount must be greater than 0"
        )

    # Amount Match
    if payment.amount != order.total_price:
        raise HTTPException(
            status_code=400,
            detail="Payment amount does not match order total"
        )

    # Payment Method Validation
    valid_methods = [
        "COD",
        "UPI",
        "Card",
        "Net Banking"
    ]

    if payment.payment_method not in valid_methods:
        raise HTTPException(
            status_code=400,
            detail="Invalid payment method"
        )



    # Create Payment
    new_payment = Payment(
        id=str(uuid4()),
        order_id=payment.order_id,
        payment_method=payment.payment_method,
        payment_status="Pending",
        amount=payment.amount
    )

    db.add(new_payment)
    db.commit()
    db.refresh(new_payment)

    return new_payment

@payment_routes.get(
    "/all_payment",
    response_model=list[Payment_Return]
)
def all_payment(
    db: Session = Depends(get_db),
    admin: User = Depends(admin_user)
):

    payments = db.query(Payment).all()

    if not payments:
        raise HTTPException(
            status_code=404,
            detail="No payments found"
        )

    return payments


@payment_routes.get(
    "/payment/{id}",
    response_model=Payment_Return
)
def payment_by_id(
    id: str,
    db: Session = Depends(get_db),
    customer: User = Depends(customer_user)
):

    # Payment ID Required
    if not id.strip():
        raise HTTPException(
            status_code=400,
            detail="Payment ID is required"
        )

    # Check Payment
    payment = db.query(Payment).filter(
        Payment.id == id
    ).first()

    if not payment:
        raise HTTPException(
            status_code=404,
            detail="Payment not found"
        )

    # Check Order
    order = db.query(Order).filter(
        Order.id == payment.order_id
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
            detail="You are not authorized to view this payment"
        )

    return payment

@payment_routes.get(
    "/payment/order/{order_id}",
    response_model=Payment_Return
)
def payment_order(
    order_id: str,
    db: Session = Depends(get_db),
    customer: User = Depends(customer_user)
):

    # Order ID Required
    if not order_id.strip():
        raise HTTPException(
            status_code=400,
            detail="Order ID is required"
        )

    # Check Order
    order = db.query(Order).filter(
        Order.id == order_id
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
            detail="You are not authorized to view this payment"
        )

    # Cancelled Order
    if order.order_status == "Cancelled":
        raise HTTPException(
            status_code=400,
            detail="This order has been cancelled"
        )

    # Check Payment
    payment = db.query(Payment).filter(
        Payment.order_id == order_id
    ).first()

    if not payment:
        raise HTTPException(
            status_code=404,
            detail="Payment not found"
        )

    return payment


@payment_routes.put(
    "/verify_payment/{id}",
    response_model=Payment_Return
)
def verify_payment(
    id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(admin_user)
):

    # Payment ID Required
    if not id.strip():
        raise HTTPException(
            status_code=400,
            detail="Payment ID is required"
        )

    # Check Payment
    payment = db.query(Payment).filter(
        Payment.id == id
    ).first()

    if not payment:
        raise HTTPException(
            status_code=404,
            detail="Payment not found"
        )

    # Check Order
    order = db.query(Order).filter(
        Order.id == payment.order_id
    ).first()

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )

    # Already Verified
    if payment.payment_status == "Success":
        raise HTTPException(
            status_code=400,
            detail="Payment is already verified"
        )

    # Failed Payment
    if payment.payment_status == "Failed":
        raise HTTPException(
            status_code=400,
            detail="Failed payment cannot be verified"
        )

    # Verify Payment
    payment.payment_status = "Success"

    # Update Order Status
    order.order_status = "Confirmed"

    db.commit()
    db.refresh(payment)

    return payment