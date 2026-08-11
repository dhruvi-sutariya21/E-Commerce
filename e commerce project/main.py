# E-Commerce FastAPI Application (Auth & Token Fix)
from fastapi import FastAPI

from src.routes.user_routes import user_routes
from src.routes.category_routes import category_routes
from src.routes.product_routes import product_routes
from src.routes.cart_routes import cart_routes
from src.routes.wishlist_routes import wishlist_routes
from src.routes.order_routes import order_routes
from src.routes.payment_routes import payment_routes

app = FastAPI()

app.include_router(user_routes)
app.include_router(category_routes)
app.include_router(product_routes)
app.include_router(cart_routes)
app.include_router(wishlist_routes)
app.include_router(order_routes)
app.include_router(payment_routes)