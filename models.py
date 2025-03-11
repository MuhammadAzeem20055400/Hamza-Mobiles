from extensions import db
from flask_login import UserMixin

# Admin Model
class Admin(UserMixin, db.Model):
    __tablename__ = 'admin'  
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)

# Customer (User) Model
class Customer(UserMixin, db.Model):
    __tablename__ = 'customer'  
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    phone_number = db.Column(db.String(15), nullable=False)

# Product Model (Inventory)
class Product(db.Model):
    __tablename__ = 'products' 
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    price = db.Column(db.Float, nullable=False)
    stock_quantity = db.Column(db.Integer, nullable=False)

# Sales Transactions Model
class SalesTransaction(db.Model):
    __tablename__ = 'sales_transactions' 
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'))
    customer_id = db.Column(db.Integer, db.ForeignKey('customer.id'))
    quantity = db.Column(db.Integer, nullable=False)
    total_amount = db.Column(db.Float, nullable=False)
    date_of_purchase = db.Column(db.Date, nullable=False)
    
    product = db.relationship('Product', backref=db.backref('sales', lazy=True))
    customer = db.relationship('Customer', backref=db.backref('purchases', lazy=True))
