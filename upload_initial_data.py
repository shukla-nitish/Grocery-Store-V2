from main import app, datastore
from application.models import db, Role
from flask_security import hash_password
with app.app_context():
    db.create_all()
    
    datastore.find_or_create_role(name = "admin", description = "User is an Admin")
    datastore.find_or_create_role(name = "mngr", description = "User is a store manager")
    datastore.find_or_create_role(name = "cust", description = "User is a customer")
    db.session.commit()

    if not datastore.find_user(email = "admin@email.com"):
        datastore.create_user(name = "Admin", email = "admin@email.com", password = hash_password("admin"),roles = ["admin"])
    if not datastore.find_user(email = "mngr1@email.com"):
        datastore.create_user(name = "MNGR_1", email = "mngr1@email.com", password = hash_password("mngr1"), active = False, roles = ["mngr"])
    if not datastore.find_user(email = "customer@email.com"):
        datastore.create_user(name = "Customer", email = "customer@email.com", password = hash_password("customer"), roles = ["cust"])
    db.session.commit()
