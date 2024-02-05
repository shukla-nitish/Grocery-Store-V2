from main import app, datastore
from application.models import db, Role
from flask_security import hash_password
from werkzeug.security import generate_password_hash
with app.app_context():
    db.create_all()
    
    datastore.find_or_create_role(name = "admin", description = "User is an Admin")
    datastore.find_or_create_role(name = "mngr", description = "User is a store manager")
    datastore.find_or_create_role(name = "cust", description = "User is a customer")
    db.session.commit()

    if not datastore.find_user(email = "admin@email.com"):
        datastore.create_user(name = "Admin", email = "admin@email.com", password = generate_password_hash("admin"),roles = ["admin"])
    db.session.commit()
