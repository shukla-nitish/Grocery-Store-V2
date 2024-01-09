from flask_sqlalchemy import SQLAlchemy
from flask_security import UserMixin, RoleMixin

db = SQLAlchemy()

class RolesUsers(db.Model):
    __tablename__ = 'roles_users'
    id = db.Column(db.Integer(), primary_key=True)
    user_id = db.Column('user_id', db.Integer(), db.ForeignKey('user.id'))
    role_id = db.Column('role_id', db.Integer(), db.ForeignKey('role.id'))

class User(db.Model, UserMixin):
    id = db.Column(db.Integer(), primary_key = True)
    name = db.Column(db.String(50), unique = False, nullable = False)
    email = db.Column(db.String(), unique = True, nullable = False)
    password = db.Column(db.String(255), nullable = False)
    active = db.Column(db.Boolean())
    fs_uniquifier = db.Column(db.String(255), unique=True, nullable=False)  #used to generate the authentication token, used internally by flask-security

    roles = db.relationship('Role', secondary='roles_users',backref=db.backref('users', lazy='dynamic'))
    
    reviews = db.relationship("ProdReview", backref = "user", cascade = "all, delete")
    cart = db.relationship("Cart", backref = "user", cascade = "all, delete")
    orders = db.relationship("Order", backref = "user", cascade = "all, delete")
    
    def __repr__(self):
        return "<User %r>" % self.name

class Role(db.Model, RoleMixin):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True)
    description = db.Column(db.String(255))
    
class Category(db.Model):
    id = db.Column(db.Integer(), primary_key = True)
    name = db.Column(db.String(50), nullable = False)
    img_path = db.Column(db.String(), nullable = False)
    is_approved = db.Column(db.Boolean(), default = False)
    
    products = db.relationship("Product", backref = "category", cascade = "all, delete")
    
    def __repr__(self):
        return "<Category %r>" % self.name
     
class Product(db.Model):
    id = db.Column(db.Integer(), primary_key = True)
    category_id = db.Column(db.Integer, db.ForeignKey("category.id"), nullable = False)
    name = db.Column(db.String(50), nullable = False)
    description = db.Column(db.String(), nullable = False)
    unitDescription = db.Column(db.String(), nullable = False)
    img_path = db.Column(db.String(), nullable = False)
    # visible = db.Column(db.Boolean(), default = True)      # visibility ..... using this admin can stop a product to get visible to customers.
    avg_rating = db.Column(db.Float(), default = 0)

    available_stock = db.relationship("Stock",backref = "product", cascade = "all, delete")
    reviews = db.relationship("ProdReview", backref = "product", cascade = "all, delete")
    carts = db.relationship("CartItems", backref = "product", cascade = "all, delete")
    orders = db.relationship("OrderItems", backref = "product") #cascade = "all, delete"

    def __repr__(self):
        return "<Product %r %r>" % ( self.product_id,self.name )

class Stock(db.Model):
    id = db.Column(db.Integer(), primary_key = True)
    product_id = db.Column(db.Integer, db.ForeignKey("product.id"), nullable = False)
    mfd = db.Column(db.DateTime(), nullable = False)
    expiry = db.Column(db.Integer(), nullable = False)
    quantity = db.Column(db.Integer(), nullable = False)
    price = db.Column(db.Float(), nullable = False)
    threshold = db.Column(db.Integer())  #threshold is number of days to expiry after which the product can't be sold
    saleable = db.Column(db.Boolean(), default = True)

    db.UniqueConstraint(product_id,mfd)

    def __repr__(self):
        return "<Stock %r %r>" % ( self.product_id, str(self.mfd) )

class ProdReview(db.Model):
    id = db.Column(db.Integer(), primary_key = True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable = False)
    product_id = db.Column(db.Integer, db.ForeignKey("product.id"), nullable = False)
    comment = db.Column(db.String(), nullable = True)
    rating = db.Column(db.Integer(), nullable = False)
    reviewedOn = db.Column(db.DateTime(), nullable = False)

    def __repr__(self):
        return "<Review %r %r>" % ( self.product_id, self.user_id )

class Cart(db.Model):
    id = db.Column(db.Integer(), primary_key = True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable = False)
    cart_total = db.Column(db.Float(), nullable = False, default = 0)

    items = db.relationship("CartItems", backref = "cart", cascade = "all, delete")
    
    def __repr__(self):
        return "<Cart %r %r>" % ( self.id, self.user_id )

class CartItems(db.Model):
    id = db.Column(db.Integer(), primary_key = True)
    cart_id = db.Column(db.Integer, db.ForeignKey("cart.id"), nullable = False)
    product_id = db.Column(db.Integer, db.ForeignKey("product.id"), nullable = False)
    mfd = db.Column(db.DateTime(), nullable = True)  #mfd is added to cart item because it will be used along with product id to uniquely determine a stock while placing order.
    quantity = db.Column(db.Integer(), nullable = False)
    price = db.Column(db.Float(), nullable = False)
    # availability_status : in-stock, out-of-stock, insufficient-stock
    availability_status = db.Column(db.String(),nullable = False)
    # discount = db.Column(db.Integer(), nullable = True)

    db.UniqueConstraint(cart_id,product_id)

    def __repr__(self):
        return "<CartItems %r %r %r>" % ( self.cart_id, self.product_id, self.quantity )
    
class Order(db.Model):
    id = db.Column(db.Integer(), primary_key = True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable = False)
    order_total = db.Column(db.Float(), nullable = False, default = 0)
    status = db.Column(db.String(), nullable = False, default = "Order Received")
    order_date = db.Column(db.DateTime(), nullable = False)
    # Address
    items = db.relationship("OrderItems", backref = "order", cascade = "all, delete")
    

    def __repr__(self):
        return "<Order %r %r>" % ( self.id, self.user_id )

class OrderItems(db.Model):
    id = db.Column(db.Integer(), primary_key = True)
    order_id = db.Column(db.Integer, db.ForeignKey("order.id"), nullable = False)
    product_id = db.Column(db.Integer, db.ForeignKey("product.id"), nullable = True)
    product_name = db.Column(db.String, nullable = False)
    quantity = db.Column(db.Integer(), nullable = False)
    unitDescription = db.Column(db.String(), nullable = False)
    price = db.Column(db.Float(), nullable = False)
    discount = db.Column(db.Integer(), nullable = True)

    db.UniqueConstraint(order_id,product_id)

    def __repr__(self):
        return "<OrderItems %r %r %r>" % ( self.order_id, self.product_id, self.quantity )