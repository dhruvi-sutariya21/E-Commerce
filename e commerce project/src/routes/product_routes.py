from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    UploadFile,
    File,
    Form
)

from sqlalchemy.orm import Session

from src.model.category import Category
from src.model.product import Product
from src.model.user import User

from src.schemas.user_schemas import (
    ProductReturn,
    Product_Update
)

from src.utils.user_utils import (
    admin_user,
    customer_user
)

from database.database import get_db

from uuid import uuid4
import shutil
import os


product_routes = APIRouter()


@product_routes.post(
    "/add_product",
    response_model=ProductReturn
)
def add_product(
    category_id: str = Form(...),
    name: str = Form(...),
    price: int = Form(...),
    stock: int = Form(...),
    description: str = Form(...),
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    admin: User = Depends(admin_user)
):

    # Category Required
    if not category_id.strip():
        raise HTTPException(
            status_code=400,
            detail="Category ID is required"
        )

    # Check Category
    category = db.query(Category).filter(
        Category.id == category_id
    ).first()

    if not category:
        raise HTTPException(
            status_code=404,
            detail="Category not found"
        )

    # Product Name Required
    if not name.strip():
        raise HTTPException(
            status_code=400,
            detail="Product name is required"
        )

    # Product Name Length
    if len(name.strip()) < 3:
        raise HTTPException(
            status_code=400,
            detail="Product name must be at least 3 characters"
        )

    if len(name.strip()) > 100:
        raise HTTPException(
            status_code=400,
            detail="Product name cannot exceed 100 characters"
        )

    # Duplicate Product
    duplicate = db.query(Product).filter(
        Product.name.ilike(name.strip())
    ).first()

    if duplicate:
        raise HTTPException(
            status_code=400,
            detail="Product already exists"
        )

    # Price Validation
    if price <= 0:
        raise HTTPException(
            status_code=400,
            detail="Price must be greater than 0"
        )

    if price > 1000000:
        raise HTTPException(
            status_code=400,
            detail="Price is too high"
        )

    # Stock Validation
    if stock < 0:
        raise HTTPException(
            status_code=400,
            detail="Stock cannot be negative"
        )

    if stock > 10000:
        raise HTTPException(
            status_code=400,
            detail="Stock cannot exceed 10000"
        )

    # Description Validation
    if not description.strip():
        raise HTTPException(
            status_code=400,
            detail="Description is required"
        )

    if len(description.strip()) < 10:
        raise HTTPException(
            status_code=400,
            detail="Description must be at least 10 characters"
        )

    if len(description.strip()) > 500:
        raise HTTPException(
            status_code=400,
            detail="Description cannot exceed 500 characters"
        )

    # Image Required
    if not image.filename:
        raise HTTPException(
            status_code=400,
            detail="Product image is required"
        )

    # Image Extension Validation
    allowed_extensions = [
        ".jpg",
        ".jpeg",
        ".png"
    ]

    extension = os.path.splitext(
        image.filename
    )[1].lower()

    if extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail="Only JPG, JPEG and PNG images are allowed"
        )

    # Image Size Validation (5MB)
    image.file.seek(0, 2)
    size = image.file.tell()
    image.file.seek(0)

    if size > 5 * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail="Image size must be less than 5 MB"
        )

    # Upload Folder
    os.makedirs("uploads", exist_ok=True)

    filename = f"{uuid4()}_{image.filename}"
    filepath = os.path.join("uploads", filename)

    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)

    # Create Product
    new_product = Product(
        id=str(uuid4()),
        category_id=category_id,
        name=name.strip(),
        price=price,
        stock=stock,
        description=description.strip(),
        image=filepath
    )

    db.add(new_product)
    db.commit()
    db.refresh(new_product)

    return new_product

@product_routes.get(
    "/all_products",
    response_model=list[ProductReturn]
)
def all_products(
    db: Session = Depends(get_db)
):
    products = db.query(Product).all()

    if not products:
        raise HTTPException(
            status_code=404,
            detail="No products found"
        )

    return products


@product_routes.get(
    "/single_product/{id}",
    response_model=ProductReturn
)
def single_product(
    id: str,
    db: Session = Depends(get_db),
    customer: User = Depends(customer_user)
):

    # Product ID Required
    if not id.strip():
        raise HTTPException(
            status_code=400,
            detail="Product ID is required"
        )

    # Check Product
    product = db.query(Product).filter(
        Product.id == id
    ).first()

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    # Invalid Price
    if product.price <= 0:
        raise HTTPException(
            status_code=400,
            detail="Invalid product price"
        )

    # Invalid Stock
    if product.stock < 0:
        raise HTTPException(
            status_code=400,
            detail="Invalid product stock"
        )

    return product

@product_routes.put(
    "/update_product/{id}",
    response_model=ProductReturn
)
def update_product(
    id: str,
    product_data: Product_Update,
    db: Session = Depends(get_db),
    admin: User = Depends(admin_user)
):

    # Product ID Required
    if not id.strip():
        raise HTTPException(
            status_code=400,
            detail="Product ID is required"
        )

    # Check Product
    product = db.query(Product).filter(
        Product.id == id
    ).first()

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    # Category Validation
    if product_data.category_id is not None:

        category = db.query(Category).filter(
            Category.id == product_data.category_id
        ).first()

        if not category:
            raise HTTPException(
                status_code=404,
                detail="Category not found"
            )

        product.category_id = product_data.category_id

    # Product Name Validation
    if product_data.name is not None:

        if not product_data.name.strip():
            raise HTTPException(
                status_code=400,
                detail="Product name is required"
            )

        if len(product_data.name.strip()) < 3:
            raise HTTPException(
                status_code=400,
                detail="Product name must be at least 3 characters"
            )

        if len(product_data.name.strip()) > 100:
            raise HTTPException(
                status_code=400,
                detail="Product name cannot exceed 100 characters"
            )

        duplicate = db.query(Product).filter(
            Product.name.ilike(product_data.name.strip()),
            Product.id != id
        ).first()

        if duplicate:
            raise HTTPException(
                status_code=400,
                detail="Product already exists"
            )

        product.name = product_data.name.strip()

    # Price Validation
    if product_data.price is not None:

        if product_data.price <= 0:
            raise HTTPException(
                status_code=400,
                detail="Price must be greater than 0"
            )

        if product_data.price > 1000000:
            raise HTTPException(
                status_code=400,
                detail="Price is too high"
            )

        product.price = product_data.price

    # Stock Validation
    if product_data.stock is not None:

        if product_data.stock < 0:
            raise HTTPException(
                status_code=400,
                detail="Stock cannot be negative"
            )

        if product_data.stock > 10000:
            raise HTTPException(
                status_code=400,
                detail="Stock cannot exceed 10000"
            )

        product.stock = product_data.stock

    # Description Validation
    if product_data.description is not None:

        if not product_data.description.strip():
            raise HTTPException(
                status_code=400,
                detail="Description is required"
            )

        if len(product_data.description.strip()) < 10:
            raise HTTPException(
                status_code=400,
                detail="Description must be at least 10 characters"
            )

        if len(product_data.description.strip()) > 500:
            raise HTTPException(
                status_code=400,
                detail="Description cannot exceed 500 characters"
            )

        product.description = product_data.description.strip()

    db.commit()
    db.refresh(product)

    return product

@product_routes.delete("/delete_product/{id}")
def delete_product(
    id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(admin_user)
):

    # Product ID Required
    if not id.strip():
        raise HTTPException(
            status_code=400,
            detail="Product ID is required"
        )

    # Check Product
    product = db.query(Product).filter(
        Product.id == id
    ).first()

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    # Delete Image
    if product.image and os.path.exists(product.image):
        os.remove(product.image)

    #Soft Delete
    product.is_deleted = True

    db.delete(product)
    db.commit()

    return {
        "message": "Product deleted successfully"
    }


@product_routes.get(
    "/search_product",
    response_model=list[ProductReturn]
)
def search_product(
    name: str,
    db: Session = Depends(get_db),
    customer: User = Depends(customer_user)
):

    # Product Name Required
    if not name.strip():
        raise HTTPException(
            status_code=400,
            detail="Product name is required"
        )

    products = db.query(Product).filter(
        Product.name.ilike(f"%{name.strip()}%")
    ).all()

    if not products:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    return products


@product_routes.patch(
    "/update_stock/{id}",
    response_model=ProductReturn
)
def update_stock(
    id: str,
    stock: int,
    db: Session = Depends(get_db),
    admin: User = Depends(admin_user)
):

    # Product ID Required
    if not id.strip():
        raise HTTPException(
            status_code=400,
            detail="Product ID is required"
        )

    # Check Product
    product = db.query(Product).filter(
        Product.id == id
    ).first()

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    # Stock Validation
    if stock < 0:
        raise HTTPException(
            status_code=400,
            detail="Stock cannot be negative"
        )

    if stock > 10000:
        raise HTTPException(
            status_code=400,
            detail="Stock cannot exceed 10000"
        )

    if product.stock == stock:
        raise HTTPException(
            status_code=400,
            detail="Stock is already up to date"
        )

    product.stock = stock

    db.commit()
    db.refresh(product)

    return product

@product_routes.get(
    "/category_products/{category_id}",
    response_model=list[ProductReturn]
)
def category_products(
    category_id: str,
    db: Session = Depends(get_db),
    customer: User = Depends(customer_user)
):

    # Category ID Required
    if not category_id.strip():
        raise HTTPException(
            status_code=400,
            detail="Category ID is required"
        )

    # Check Category
    category = db.query(Category).filter(
        Category.id == category_id
    ).first()

    if not category:
        raise HTTPException(
            status_code=404,
            detail="Category not found"
        )

    # Get Products
    products = db.query(Product).filter(
        Product.category_id == category_id
    ).all()

    if not products:
        raise HTTPException(
            status_code=404,
            detail="No products found in this category"
        )

    return products


@product_routes.get(
    "/out_of_stock_products",
    response_model=list[ProductReturn]
)
def out_of_stock_products(
    db: Session = Depends(get_db),
    admin: User = Depends(admin_user)
):

    products = db.query(Product).filter(
        Product.stock == 0
    ).all()

    if not products:
        raise HTTPException(
            status_code=404,
            detail="No out of stock products found"
        )

    return products