from flask_restful import Resource, Api

api = Api(prefix= "/api")


class UserApi(Resource):
    def get(self):
        return {"message" : "everything is fine"}
    
api.add_resource(UserApi, "/user")