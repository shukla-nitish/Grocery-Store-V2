from werkzeug.datastructures import FileStorage
from flask import jsonify
from flask_restful import Resource, Api, reqparse, marshal_with, marshal, fields
from flask_security import auth_required, roles_required, roles_accepted, current_user, hash_password
from application.models import *
from .sec import datastore
from email_validator import validate_email





api = Api(prefix= "/api")

class UserRole(fields.Raw):
    def format(self,roles):
        return roles[0].name
    
user_fields = {
    "name" : fields.String,
    "email" : fields.String,
    "role" : UserRole(attribute="roles"),
    "active" : fields.Boolean
}

class UserApi(Resource):
    def __init__(self):
        self.parser_post = reqparse.RequestParser()
        self.parser_post.add_argument("name", type = str, required = True, location = "form")
        self.parser_post.add_argument("email", type = str, required = True, location = "form")
        self.parser_post.add_argument("password", type = str, required = True, location = "form")
        self.parser_post.add_argument("role", type = str, required = True, location = "form")

        self.parser_put = reqparse.RequestParser()
        self.parser_put.add_argument("name", type = str, help = "", location = "form")
        self.parser_put.add_argument("password", type = str, location = "form")

    @auth_required("token")
    def get(self):
        return marshal(current_user,user_fields)
    
    def post(self):
        if len(current_user.roles) >0 :     # if the user already exists, he would have atleast one role
            return {"message": "You already have an account."}, 400
        
        args = self.parser_post.parse_args()

        name = args.get("name")

        email = args.get("email")
        invalid_email = False
        try:
            emailObject = validate_email(email)
            email = emailObject.email
        except :
            invalid_email = True
        if invalid_email:
            return {"message" : "Invalid email ! Please enter a valid email address."}, 400
        
        user = datastore.find_user(email = email)
        if user:
            return {"message": "Email already exists! Please use different email."}, 400
        
        password = args.get("password")
        role = args.get("role")
        if role not in ["manager", "customer"]:
            return {"message" : "Please specify correct role."}, 400
        
        if role == "manager":
            datastore.create_user(name = name, email = email, password = hash_password(password), active = False, roles = ["mngr"])
        
        if role == "customer":
            datastore.create_user(name = name, email = email, password = hash_password(password), roles = ["cust"])

        try:
            db.session.commit()
            return {"message" : "Account created successfully."}
        except:
            return {"message" : "Oops! Something went wrong."} , 500
    
    @auth_required("token")
    def put(self):
        args = self.parser_put.parse_args()
        name = args.get("name")
        password = args.get("password")

        if name:
            current_user.name = name
        if password:
            current_user.password = hash_password(password)

        try:
            db.session.commit()
            return {"message" : "Account updated successfully"}
        except:
            return {"Something went wrong."} , 500
        
    @auth_required("token")
    def delete(self):
        datastore.delete_user(current_user)
        try:
            db.session.commit()
            return jsonify({"message": "Account deleted."})
        except:
            return {"message" : "something went wrong"} , 500



category_fields = {
    "name" : fields.String,
    "img_path" : fields.String,
    "is_approved" : fields.Boolean
}

class CategoryAPI(Resource):
    def __init__(self):
        self.parser_post = reqparse.RequestParser()
        self.parser_post.add_argument("name", type = str, required = True, location = "form")
        self.parser_post.add_argument("img", type = FileStorage, required = True, location='files')

        self.parser_put = reqparse.RequestParser()
        self.parser_put.add_argument("name", type = str, location = "form")
        self.parser_put.add_argument("img", type = FileStorage, location='files')
        self.parser_put.add_argument("is_approved", type = bool, location = "form")

    @auth_required("token")
    def get(self, ctg_name=None):
        if ctg_name is None:
            if "cust"in current_user.roles:
                categories = Category.query.filter_by(is_approved = True)
            else:
                categories = Category.query.all()
            if not categories:
                return { "message" : "No category found"}, 404
            return marshal(categories, category_fields)
        
        ctg = Category.query.filter_by(name = ctg_name).first()
        if not ctg or ("cust"in current_user.roles and not ctg.is_approved):
            return {"message": "category {} does not exist.".format(ctg_name)}, 404
        return marshal(ctg, category_fields)

    @auth_required("token")
    @roles_required("mngr")
    def post(self):
        args = self.parser_post.parse_args() # returns a python dictionary with arguments as key
        new_ctg = Category(name = args.get("name"), img_path = "/static/veg")

        try:
            db.session.add(new_ctg)
            db.session.commit()
            return {"message" : "New category created"}, 200
        except:
            return {"message" : "something went wrong"} , 500
    
    @auth_required("token")
    @roles_accepted("admin","mngr")
    def put(self,ctg_name):
        args = self.parser_put.parse_args()
        ctg = Category.query.filter_by(name = ctg_name).first()
        if not ctg:
            return {"message": "category {} does not exist.".format(ctg_name)}, 404
        
        name = args.get("name")
        img = args.get("img")
        is_approved = args.get("is_approved")

        if "mngr" in current_user.roles:
            if name:
                ctg.name = name
            if img != None :
                ctg.img_path = "/static/veg_new"

        if "admin" in current_user.roles:
            if is_approved != None:
                ctg.is_approved = is_approved
        try:
            db.session.commit()
            return {"message" : "Category successfully updated"}, 200
        except:
            return {"message" : "something went wrong"} , 500
    
    @auth_required("token")
    @roles_required("admin")
    def delete(self, ctg_name):
        ctg = Category.query.filter_by(name = ctg_name).first()
        if not ctg:
            return {"message": "category {} does not exist.".format(ctg_name)}, 404
        try:
            db.session.delete(ctg)
            db.session.commit()
            return { "message" : "category successfully deleted"}
        except:
            return {"message" : "something went wrong"} , 500

api.add_resource(CategoryAPI,"/category","/category/<ctg_name>")
api.add_resource(UserApi, "/user")