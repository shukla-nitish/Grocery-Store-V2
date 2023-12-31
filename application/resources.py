from werkzeug.datastructures import FileStorage
from flask_restful import Resource, Api, reqparse, marshal_with, marshal, fields
from flask_security import auth_required, roles_required, current_user
from application.models import *

api = Api(prefix= "/api")


class UserApi(Resource):
    def __init__(self):
        self.parser_get = reqparse.RequestParser()
        self.parser_get.add_argument("name", type = str, help = "", required = False)

        self.parser_post = reqparse.RequestParser()
        self.parser_post.add_argument("name", type = str, help = "", required = True)

    def get(self):
        args = self.parser_get.parse_args()   # returns a python dictionary with arguments as key
        return {"message" : "everything is fine"}
    
    def post(self):
        args = self.parser_post.parse_args()
        return {"message" : "everything is fine"}
    

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
        args = self.parser_post.parse_args()
        new_ctg = Category(name = args.get("name"), img_path = "/static/veg")
        db.session.add(new_ctg)
        db.session.commit()
        return {"message" : "New category created"}, 200
    
    @auth_required("token")
    @roles_required("admin","mngr")
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
        
        db.session.commit()
        return {"message" : "Category successfully updated"}, 200
    
    def delete(self, ctg_name):
        ctg = Category.query.filter_by(name = ctg_name).first()
        if not ctg:
            return {"message": "category {} does not exist.".format(ctg_name)}, 404
        db.session.delete(ctg)
        db.session.commit()
        return { "message" : "category successfully deleted"}

api.add_resource(CategoryAPI,"/category","/category/<ctg_name>")
api.add_resource(UserApi, "/user")