from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.model.category import Category
from src.model.product import Product
from src.model.user import User
from src.schemas.user_schemas import category_create, category_update
from src.utils.user_utils import duplicate_category, admin_user,customer_user
from database.database import get_db
from uuid import uuid4
import re

category_routes = APIRouter()


@category_routes.post("/add_category")
def add_category(
    category_data: category_create,
    db: Session = Depends(get_db),
    admin: User = Depends(admin_user)
):
    duplicate_category(category_data.c_name, db)

    if not category_data.c_name.strip():
        raise HTTPException(status_code=400,detail="Category name is required")

    if not re.match(r"^[A-Za-z ]+$",category_data.c_name.strip()):
        raise HTTPException(status_code=400,detail="Category name should contain only letters")

    new_category = Category(id=str(uuid4()),c_name=category_data.c_name,description=category_data.description)

    db.add(new_category)
    db.commit()
    db.refresh(new_category)

    return new_category

@category_routes.get("/all_category")
def all_category(
    db: Session = Depends(get_db)
):

    categories = db.query(Category).all()

    if not categories:
        raise HTTPException(
            status_code=404,
            detail="No Category Found"
        )

    return categories


@category_routes.get("/single_category/{id}")
def single_category(
    id: str,
    db: Session = Depends(get_db),
):

    # Category ID Required
    if not id.strip():
        raise HTTPException(
            status_code=400,
            detail="Category ID is required"
        )

    # Check Category Exists
    category = db.query(Category).filter(
        Category.id == id
    ).first()

    if not category:
        raise HTTPException(
            status_code=404,
            detail="Category not found"
        )

    return category

import re

@category_routes.put("/update_category/{id}")
def update_category(
    id: str,
    category_data: category_update,
    db: Session = Depends(get_db),
    admin: User = Depends(admin_user)
):

    # Category ID Required
    if not id.strip():
        raise HTTPException(
            status_code=400,
            detail="Category ID is required"
        )

    # Check Category Exists
    category = db.query(Category).filter(
        Category.id == id
    ).first()

    if not category:
        raise HTTPException(
            status_code=404,
            detail="Category not found"
        )

    # Category Name Validation
    if category_data.c_name is not None:

        if not category_data.c_name.strip():
            raise HTTPException(
                status_code=400,
                detail="Category name cannot be empty"
            )

        if len(category_data.c_name.strip()) < 3:
            raise HTTPException(
                status_code=400,
                detail="Category name must be at least 3 characters"
            )

        # Only letters and spaces allowed
        if not re.match(r"^[A-Za-z ]+$", category_data.c_name.strip()):
            raise HTTPException(
                status_code=400,
                detail="Category name should contain only letters"
            )

        # Duplicate Category Check
        duplicate = db.query(Category).filter(
            Category.c_name == category_data.c_name.strip(),
            Category.id != id
        ).first()

        if duplicate:
            raise HTTPException(
                status_code=400,
                detail="Category already exists"
            )

        category.c_name = category_data.c_name.strip()

    # Description Validation
    if category_data.description is not None:

        if len(category_data.description.strip()) > 200:
            raise HTTPException(
                status_code=400,
                detail="Description cannot exceed 200 characters"
            )

        category.description = category_data.description.strip()

    db.commit()
    db.refresh(category)

    return category 

@category_routes.delete("/delete_category/{id}")
def delete_category(id: str,db: Session = Depends(get_db),admin: User = Depends(admin_user)):

    if not id.strip():
        raise HTTPException(status_code=400,detail="Category ID is required")
    
    category = db.query(Category).filter(Category.id == id).first()

    if not category:
        raise HTTPException(status_code=404,detail="Category not found")

    product = db.query(Product).filter(Product.category_id == id).first()

    if product:
        raise HTTPException(status_code=400,detail="Category cannot be deleted because products exist under this category")

    #Soft Delete
    category.is_deleted = True

    db.delete(category)
    db.commit()
    return {"message": "Category deleted successfully"}


@category_routes.get("/search_category")
def search_category(
    c_name: str,
    db: Session = Depends(get_db),
    customer: User = Depends(customer_user)
):

    # Empty Validation
    if not c_name.strip():
        raise HTTPException(
            status_code=400,
            detail="Category name is required"
        )

    # Minimum Length
    if len(c_name.strip()) < 2:
        raise HTTPException(
            status_code=400,
            detail="Enter at least 2 characters to search"
        )

    # Maximum Length
    if len(c_name.strip()) > 100:
        raise HTTPException(
            status_code=400,
            detail="Category name is too long"
        )

    categories = db.query(Category).filter(
        Category.c_name.ilike(f"%{c_name.strip()}%")
    ).all()

    if not categories:
        raise HTTPException(
            status_code=404,
            detail="Category not found"
        )

    return categories

