from werkzeug.datastructures import FileStorage
from flask_restful import Resource, Api, reqparse, marshal_with, marshal, fields
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
    "img_path" : fields.String
}

class CategoryAPI(Resource):
    def __init__(self):
        self.parser_post = reqparse.RequestParser()
        self.parser_post.add_argument("name", type = str, required = True, location = "form")
        self.parser_post.add_argument("img", type = FileStorage, required = True, location='files')

        self.parser_put = reqparse.RequestParser()
        self.parser_put.add_argument("name", type = str, required = False ,location = "form")
        self.parser_put.add_argument("img", type = FileStorage, location='files')
    
    def get(self, ctg_name=None):
        if ctg_name is None:
            categories = Category.query.all()
            return marshal(categories, category_fields)
        
        ctg = Category.query.filter_by(name = ctg_name).first()
        if not ctg:
            return {"message": "category {} does not exist.".format(ctg_name)}, 404
        return marshal(ctg, category_fields)

    def post(self):
        args = self.parser_post.parse_args()
        new_ctg = Category(name = args.get("name"), img_path = "/static/veg")
        db.session.add(new_ctg)
        db.session.commit()
        return {"message" : "New category created"}, 200
    
    def put(self,ctg_name):
        args = self.parser_put.parse_args()
        ctg = Category.query.filter_by(name = ctg_name).first()
        if not ctg:
            return {"message": "category {} does not exist.".format(ctg_name)}, 404
        
        name = args.get("name")
        file = args.get("img")
        print(name, file)

        if args.get("name"):
            ctg.name = args.get("name")
        if args.get("img") != None :
            ctg.img_path = "/static/veg_new"
        
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