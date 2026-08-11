from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import uuid4

from src.model.wishlist import Wishlist
from src.model.user import User
from src.model.product import Product

from src.schemas.user_schemas import Wishlist_Create

from src.utils.user_utils import customer_user
from database.database import get_db


wishlist_routes = APIRouter()



# =====================================================
# Add Wishlist
# =====================================================

@wishlist_routes.post("/add_wishlist")
def add_wishlist(
    wishlist_data: Wishlist_Create,
    db: Session = Depends(get_db),
    customer: User = Depends(customer_user)
):

    # Check Product Exists

    product = db.query(Product).filter(
        Product.id == wishlist_data.product_id
    ).first()


    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )


    # Duplicate Wishlist Check

    existing_wishlist = db.query(Wishlist).filter(
        Wishlist.user_id == customer.id,
        Wishlist.product_id == wishlist_data.product_id
    ).first()


    if existing_wishlist:
        raise HTTPException(
            status_code=400,
            detail="Product already exists in wishlist"
        )


    # Create Wishlist

    new_wishlist = Wishlist(
        id=str(uuid4()),
        user_id=customer.id,
        product_id=wishlist_data.product_id
    )


    db.add(new_wishlist)
    db.commit()
    db.refresh(new_wishlist)


    return {
        "message":"Product added to wishlist successfully",
        "data":new_wishlist
    }





# =====================================================
# Get All Wishlist (Admin)
# =====================================================

@wishlist_routes.get("/all_wishlist")
def all_wishlist(
    db: Session = Depends(get_db)
):

    wishlist = db.query(Wishlist).all()


    if not wishlist:
        raise HTTPException(
            status_code=404,
            detail="Wishlist is empty"
        )


    return {
        "message":"All wishlist fetched successfully",
        "total_items":len(wishlist),
        "data":wishlist
    }





# =====================================================
# Get Single Wishlist
# =====================================================

@wishlist_routes.get("/single_wishlist/{id}")
def single_wishlist(
    id:str,
    db:Session = Depends(get_db)
):

    wishlist = db.query(Wishlist).filter(
        Wishlist.id == id
    ).first()


    if not wishlist:
        raise HTTPException(
            status_code=404,
            detail="Wishlist not found"
        )


    return {
        "message":"Wishlist found successfully",
        "data":wishlist
    }





# =====================================================
# Get User Wishlist
# =====================================================

@wishlist_routes.get("/user_wishlist")
def user_wishlist(
    db:Session = Depends(get_db),
    customer:User = Depends(customer_user)
):


    wishlist = db.query(Wishlist).filter(
        Wishlist.user_id == customer.id
    ).all()


    if not wishlist:
        raise HTTPException(
            status_code=404,
            detail="Wishlist is empty"
        )


    return {
        "message":"User wishlist fetched successfully",
        "total_items":len(wishlist),
        "data":wishlist
    }





# =====================================================
# Remove Wishlist
# =====================================================

@wishlist_routes.delete("/remove_wishlist/{id}")
def remove_wishlist(
    id:str,
    db:Session = Depends(get_db),
    customer:User = Depends(customer_user)
):


    wishlist = db.query(Wishlist).filter(
        Wishlist.id == id
    ).first()


    if not wishlist:
        raise HTTPException(
            status_code=404,
            detail="Wishlist not found"
        )


    # Check Ownership

    if wishlist.user_id != customer.id:
        raise HTTPException(
            status_code=403,
            detail="You cannot remove this wishlist item"
        )

#Soft Delete
    wishlist.is_deleted = True


    db.delete(wishlist)
    db.commit()


    return {
        "message":"Wishlist item removed successfully"
    }