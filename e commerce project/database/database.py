from config import DB_URL

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

engine=create_engine(DB_URL)
Base=declarative_base()
sessionLocal=sessionmaker(bind=engine)

def get_db():
    db=sessionLocal()
    try:
        yield db
    finally:
        db.close()