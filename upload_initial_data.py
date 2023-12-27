from main import app
from application.models import db, Role

with app.app_context():
    db.create_all()
    admin = Role(id = "admin",name = "Admin", description = "The user is an Admin")
    str_mngr = Role(id = "str_mngr", name = "Store Manager", description = "The user is a Store Manager")
    cust = Role(id = "cust",name = "Customer", description = "The user is a Customer")
    db.session.add_all([admin, str_mngr, cust])
    db.session.commit()
