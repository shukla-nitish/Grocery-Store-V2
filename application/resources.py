from werkzeug.datastructures import FileStorage
from flask_restful import Resource, Api, reqparse, marshal, fields
from flask_security import auth_required, roles_required, roles_accepted, current_user
from werkzeug.security import generate_password_hash
from application.models import *
from .sec import datastore
from email_validator import validate_email
from .helpers import *
from datetime import datetime as dt
from datetime import timedelta

api = Api(prefix= "/api")

class UserRole(fields.Raw):
    def format(self,roles):
        return roles[0].name
    
user_fields = {
    "user_id" : fields.Integer(attribute = "id"),
    "name" : fields.String,
    "email" : fields.String,
    "role" : UserRole(attribute="roles"),
    "active" : fields.Boolean
}

class UserApi(Resource):
    def __init__(self):
        self.parser_post = reqparse.RequestParser()
        self.parser_post.add_argument("name", type = str, required = True, location = "json")
        self.parser_post.add_argument("email", type = str, required = True, location = "json")
        self.parser_post.add_argument("password", type = str, required = True, location = "json")
        self.parser_post.add_argument("role", type = str, required = True, location = "json")

        self.parser_put = reqparse.RequestParser()
        self.parser_put.add_argument("name", type = str, help = "", location = "json")
        self.parser_put.add_argument("password", type = str, location = "json")

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
            datastore.create_user(name = name, email = email, password = generate_password_hash(password), active = False, roles = ["mngr"])
        
        if role == "customer":
            datastore.create_user(name = name, email = email, password = generate_password_hash(password), roles = ["cust"])

        try:
            db.session.commit()
            user = datastore.find_user(email= email)
            return {"message" : "Account created successfully.",
                    "token": user.get_auth_token(),
                    "user_id":user.id,
                    "name" : user.name,
                    "email": user.email,
                    "role": user.roles[0].name}
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
            current_user.password = generate_password_hash(password)

        try:
            db.session.commit()
            return {"message" : "Account updated successfully"}
        except:
            return {"Something went wrong."} , 500
        
    @auth_required("token")
    @roles_accepted("cust")
    def delete(self):
        datastore.delete_user(current_user)
        try:
            db.session.commit()
            return {"message": "Account deleted."}
        except:
            return {"message" : "Something went wrong."} , 500

category_fields = {
    "category_id" : fields.Integer(attribute = "id"),
    "name" : fields.String,
    "img_path" : fields.String,
    "is_approved" : fields.Boolean
}
category_fields_admin= {
    "category_id" : fields.Integer(attribute = "id"),
    "name" : fields.String,
    "img_path" : fields.String,
    "is_approved" : fields.Boolean,
    "edit_request": fields.Boolean,
    "edited_name": fields.String,
    "edited_img_path": fields.String,
    "delete_request" : fields.Boolean,
}

class CategoryAPI(Resource):
    def __init__(self):
        self.parser_post = reqparse.RequestParser()
        self.parser_post.add_argument("name", type = str, required = True, location = "form")
        self.parser_post.add_argument("img", type = FileStorage, required = True, location='files')

        self.parser_put = reqparse.RequestParser()
        self.parser_put.add_argument("name", type = str, location = "form")
        self.parser_put.add_argument("img", type = FileStorage, location='files')
        # self.parser_put.add_argument("is_approved", type = bool, location = "json")

    def get(self, ctg_name=None):
        if ctg_name == None:
            if "mngr" in current_user.roles or "admin" in current_user.roles:
                categories = Category.query.all()
                if not categories:
                    return { "message" : "No category found"}, 404
                if "admin" in current_user.roles:
                    return marshal(categories, category_fields_admin)
                return marshal(categories, category_fields)
            else:
                categories = Category.query.filter_by(is_approved = True).all()
                if not categories:
                    return { "message" : "No category found"}, 404
                return marshal(categories, category_fields)
        
        ctg = Category.query.filter_by(name = ctg_name).first()
        if not ctg:
            return {"message": "Category {} does not exist.".format(ctg_name)}, 404
        if "mngr" not in current_user.roles and "admin" not in current_user.roles and not ctg.is_approved:
            return {"message": "Category {} does not exist.".format(ctg_name)}, 404
        return marshal(ctg, category_fields)

    @auth_required("token")
    @roles_required("mngr")
    def post(self):
        args = self.parser_post.parse_args() # returns a python dictionary with arguments as key
        name = args.get("name")
        file = args.get("img")

        if not name:
            return {"message": "Please provide category name."}, 400
        if file.filename == "":
            return {"message": "Please upload an image."}, 400
        
        if file and allowed_file(file.filename):
            FILENAME = save_file(file)

            existing_ctg = Category.query.filter_by(name = name).first()
            if not existing_ctg:
                new_ctg = Category(name = name, img_path = "/static/"+ FILENAME)
                try:
                    db.session.add(new_ctg)
                    db.session.commit()
                    return {"message" : "New category created"}, 200
                except:
                    return {"message" : "something went wrong"} , 500
            else:
                return {"message" : "Category already exists."}, 400
        else:
            return {"message" : "Please upload correct image file."}, 400
    
    @auth_required("token")
    @roles_accepted("mngr")
    def put(self,ctg_name):
        args = self.parser_put.parse_args()
        ctg = Category.query.filter_by(name = ctg_name).first()
        if not ctg:
            return {"message": "category {} does not exist.".format(ctg_name)}, 404
        
        name = args.get("name")
        file = args.get("img")
        if not name and not file:
            return {"message" : "Please provide values for one the fields."},400
        
        if not ctg.is_approved:
            if name:
                ctg.name = name

            if file :
                if allowed_file(file.filename):
                    FILENAME = save_file(file)

                    prev_img_path = ctg.img_path
                    new_img_path = "/static/"+ FILENAME
                    ctg.img_path = new_img_path

                    cwd = os.getcwd()
                    cwd = cwd.replace("\\","/")
                    path = cwd+prev_img_path
                    try :
                        db.session.commit()
                        os.remove(path)
                        return {"message" : "Category successfully updated"}, 200
                    except:
                        return {"message" : "Something went wrong."} , 500
                else:
                    return {"message" : "Please upload correct image file."}, 400
        else:
            if name:
                ctg.edited_name = name

            if file :
                if allowed_file(file.filename):
                    FILENAME = save_file(file)
                    prev_img_path = ctg.edited_img_path
                    ctg.edited_img_path = "/static/"+ FILENAME

                    
                    try :
                        ctg.edit_request = True
                        db.session.commit()
                        if prev_img_path != ctg.edited_img_path:
                            cwd = os.getcwd()
                            cwd = cwd.replace("\\","/")
                            path = cwd+prev_img_path
                            os.remove(path)
                        return {"message" : "Edit request sent. Changes will come into effect after approval from admin."}, 200
                    except:
                        return {"message" : "Something went wrong."} , 500
                else:
                    return {"message" : "Please upload correct image file."}, 400
            try:
                ctg.edit_request = True
                db.session.commit()
                return {"message" : "Edit request sent. Changes will come into effect after approval from admin."}, 200
            except:
                return {"message" : "something went wrong"} , 500
        
    @auth_required("token")
    @roles_accepted("mngr","admin")
    def delete(self, ctg_name):
        ctg = Category.query.filter_by(name = ctg_name).first()
        if not ctg:
            return {"message": "category {} does not exist.".format(ctg_name)}, 404
        if ctg.is_approved:
            ctg.delete_request = True
            try:
                db.session.commit()
                return {"message": "Delete request sent. Changes will come into effect after approval from admin."},200
            except:
                return {"message" : "something went wrong"} , 500
        else:
            path1 = ""
            path2 = ""

            cwd = os.getcwd()
            cwd = cwd.replace("\\","/")
            if ctg.img_path:
                path1 = cwd+ctg.img_path
            if ctg.edited_img_path:
                path2 = cwd+ctg.edited_img_path

            try:
                db.session.delete(ctg)
                db.session.commit()
                if ctg.img_path:
                    print(path1)
                    os.remove(path1)
                if ctg.edited_img_path:
                    print(path2)
                    os.remove(path2)
                
                return { "message" : "category successfully deleted"}
            except:
                return {"message" : "something went wrong"} , 500
    
class AvlQuantity(fields.Raw):
    def format(self,available_stock):
        if not available_stock:
            return 0
        prod = available_stock[0].product
        max_saleable_qty = saleable_stock(prod)["max_saleable_qty"]
        return max_saleable_qty

class Price(fields.Raw):
    def format(self,available_stock):
        if not available_stock:
            return 0
        prod = available_stock[0].product
        max_saleable_qty_price = saleable_stock(prod)["max_saleable_qty_price"]
        return max_saleable_qty_price
    
class StockId(fields.Raw):
    def format(self,available_stock):
        if not available_stock:
            return 0
        prod = available_stock[0].product
        stock_id = saleable_stock(prod)["stock_id"]
        return stock_id

product_fields = {
    "product_id" : fields.Integer(attribute = "id"),
    "name" : fields.String,
    "category" : fields.String(attribute = "category.name"),
    "description": fields.String,
    "unitDescription" : fields.String,
    "img_path" : fields.String,
    "avg_rating" : fields.Float,
    "available_quantity": AvlQuantity(attribute = "available_stock"),
    "price" : Price(attribute = "available_stock"),
    "stock_id" : StockId(attribute = "available_stock")
}

class ProductAPI(Resource):
    def __init__(self):
        self.parser_post = reqparse.RequestParser()
        self.parser_post.add_argument("category", type = str, required = True, location = "form")
        self.parser_post.add_argument("name", type = str, required = True, location = "form")
        self.parser_post.add_argument("description", type = str, required = True, location = "form")
        self.parser_post.add_argument("unitDescription", type = str, required = True, location = "form")
        self.parser_post.add_argument("img", type = FileStorage, required = True, location='files')

        self.parser_put = reqparse.RequestParser()
        self.parser_put.add_argument("category", type = str, location = "form")
        self.parser_put.add_argument("name", type = str, location = "form")
        self.parser_put.add_argument("description", type = str, location = "form")
        self.parser_put.add_argument("unitDescription", type = str, location = "form")
        self.parser_put.add_argument("img", type = FileStorage, location='files')

    def get(self,ctg,prod = None):
        category = Category.query.filter_by(name = ctg).first()
        if not category or not category.is_approved:
            if "mngr" in current_user.roles:
                return 404
            return {"message" : "Category not found."}, 404
        if prod is None:
            prods = category.products
            if not prods:
                return {"message" : "No product found."}, 404
            return marshal(prods,product_fields)
        
        product = Product.query.filter_by(name = prod).first()
        if not product or product.category != category :
            return {"message" : "Product {} not found in category {}.".format(prod, ctg)}, 404 
        return marshal(product, product_fields)
    
    @auth_required("token")
    @roles_required("mngr")
    def post(self, ctg):
        args = self.parser_post.parse_args()
        ctg = args.get("category")
        name = args.get("name")
        desc = args.get("description")
        unit_desc = args.get("unitDescription")
        file = args.get("img")

        category = Category.query.filter_by(name = ctg).first()
        if not category : 
            return {"message" : "Category {} doesn't exist.".format(ctg)}, 404
        
        existing_prod = Product.query.filter_by(name = name).first()
        if existing_prod:
            return {"message" : "Product {} already exists.".format(name)}, 400
        
        if file and allowed_file(file.filename):
            FILENAME = save_file(file)
            new_prod = Product(category_id = category.id, name = name, description = desc, unitDescription = unit_desc, img_path = "/static/"+ FILENAME)
            try:
                db.session.add(new_prod)
                db.session.commit()
                return {"message" : "Product successfully added.",
                        "product_id" : new_prod.id}
            except:
                return {"message" : "something went wrong."}, 500
        else:
            return {"message" : "Please upload a correct image file"}, 400
    
    @auth_required("token")
    @roles_required("mngr")
    def put(self, ctg, prod):
        curr_ctg = ctg
        args = self.parser_put.parse_args()

        new_ctg = args.get("category")
        name = args.get("name")
        desc = args.get("description")
        unit_desc = args.get("unitDescription")
        file = args.get("img")
        
        existing_prod = Product.query.filter_by(name = prod).first()
        if not existing_prod:
            return {"message" : "Product {} doesn't exist.".format(prod)}, 404
        
        curr_category = Category.query.filter_by(name = curr_ctg).first()
        if not curr_category : 
            return {"message" : "Category {} doesn't exist.".format(curr_ctg)}, 404
        
        if existing_prod.category != curr_category:
            return {"message" : "Product {} not found in category {}.".format(prod, curr_ctg)}, 404

        if new_ctg:
            new_category = Category.query.filter_by(name = new_ctg).first()
            if not new_category:
                return {"message" : "Category {} doesn't exist.".format(new_ctg)}, 404

            if curr_category.name != new_category.name :
                existing_prod.category_id = new_category.id
        
        if name and name != existing_prod.name :
            existing_prod.name = name
        if desc and desc != existing_prod.description :
            existing_prod.description = desc
        if unit_desc and unit_desc != existing_prod.unitDescription :
            existing_prod.unitDescription = unit_desc
            db.session.delete(existing_prod.available_stock)
        
        if file:
            if allowed_file(file.filename):
                FILENAME = save_file(file)

                prev_img_path = existing_prod.img_path
                new_img_path = "/static/"+ FILENAME
                existing_prod.img_path = new_img_path

                cwd = os.getcwd()
                cwd = cwd.replace("\\","/")
                path = cwd+prev_img_path

                try:
                    db.session.commit()
                    os.remove(path)
                    return {"message" : "Product updated successfully."}
                except:
                    return {"message" : "Something went wrong"} , 500
            else:
                return {"message" : "Please upload correct image file."}, 400
        
        try:
            db.session.commit()
            return {"message" : "Product updated successfully."}
        except:
            return {"message" : "Something went wrong"} , 500
    
    @auth_required("token")
    @roles_required("mngr")
    def delete(self, ctg , prod):
        category = Category.query.filter_by(name = ctg).first()
        if not category : 
            return {"message" : "Category {} doesn't exist.".format(ctg)}, 404
        
        product = Product.query.filter_by(name = prod).first()
        if not product:
            return {"message" : "Product {} doesn't exist.".format(prod)}, 404
        
        if product.category != category:
            return {"message" : "Product {} not found in category {}.".format(prod, ctg)}, 404
        
        img_path = product.img_path
        cwd = os.getcwd()
        cwd = cwd.replace("\\","/")
        path = cwd + img_path

        db.session.delete(product)
        try:
                db.session.commit()
                os.remove(path)
                return {"message": "Product deleted successfully."}
        except:
            return {"message" : "Something went wrong"} , 500


stock_fields = {
    "stock_id" : fields.Integer(attribute = "id"),
    "product" : fields.String(attribute = "product.name"),
    "category" : fields.String(attribute="product.category.name"),
    "mfd" : fields.String,
    "expiry_days" : fields.Integer(attribute = "expiry"),
    "quantity" : fields.Integer,
    "price" : fields.Float,
    "threshold" : fields.Integer,
    "saleable" : fields.Boolean
}

class StockAPI(Resource):
    def __init__(self):
        self.parser_post = reqparse.RequestParser()
        self.parser_post.add_argument("mfd", type = str, required = True, location = "json")
        self.parser_post.add_argument("expiry_days", type = int, required = True, location = "json")
        self.parser_post.add_argument("qty", type = int, required = True, location = "json")
        self.parser_post.add_argument("price", type = float, required = True, location = "json")
        self.parser_post.add_argument("threshold", type = int, required = True, location = "json")

        self.parser_put = reqparse.RequestParser()
        self.parser_put.add_argument("mfd", type = str, location = "json")
        self.parser_put.add_argument("expiry_days", type = int, location = "json")
        self.parser_put.add_argument("qty", type = int, location = "json")
        self.parser_put.add_argument("price", type = float, location = "json")
        self.parser_put.add_argument("threshold", type = int, location = "json")

    def get(self, prod, stock_id = None):
        product = Product.query.filter_by(name = prod).first()
        if not product:
            return {"message" : "product not found"}, 404
        if stock_id is None:
            return marshal(product.available_stock,stock_fields)
        
        stock = Stock.query.get(stock_id)
        if not stock or stock.product != product:
            return {"message" : "Stock not found"}, 404
        return marshal(stock, stock_fields)
    
    @auth_required("token")
    @roles_required("mngr")
    def post(self, prod):
        product = Product.query.filter_by(name = prod).first()
        if not product:
            return {"message" : "product not found"}, 404
        
        args = self.parser_post.parse_args()
        mfd_ = args.get("mfd")
        try:
            mfd = dt.strptime(mfd_,"%Y-%m-%d")
        except:
            return {"message" : "date format should be yyyy-mm-dd"}, 400
        exp_days = args.get("expiry_days")
        qty = args.get("qty")
        price = args.get("price")
        threshold = args.get("threshold")

        if exp_days == 0 or qty < 1 :
            return {"message": "Please send valid argument values"}, 400
        
        saleable_date = mfd + timedelta(days = exp_days-threshold)
        if saleable_date < dt.now():
            return {"message" : "Expired or soon to be expired stock."} , 400

        stock_added = False
        stocks = product.available_stock
        for stock in stocks:
            if stock.mfd == mfd:
                stock.quantity += qty
                stock.price = price
                stock.expiry = exp_days
                stock.threshold = threshold
                stock_added = True
                break
        if not stock_added:
            new_stock = Stock(product_id = product.id, mfd = mfd, expiry = exp_days, quantity = qty, price = price, threshold = threshold)
            db.session.add(new_stock)

        try:
            db.session.commit()
            return {"message" : "stock added successfully."}
        except:
            return {"message" : "something went wrong."}, 500

    @auth_required("token")
    @roles_required("mngr")
    def put(self, prod, stock_id):
        product = Product.query.filter_by(name = prod).first()
        if not product:
            return {"message" : "product not found"}, 404
        
        args = self.parser_put.parse_args()
        mfd_ = args.get("mfd")
        exp_days = args.get("expiry_days")
        qty = args.get("qty")
        price = args.get("price")
        threshold = args.get("threshold")

        if not mfd_ and not exp_days and not qty and not price and not threshold:
            return {"message" : "No value passed for update"}, 400

        stock = Stock.query.get(stock_id)
        if not stock or stock.product != product :
            return {"message" : "stock not found"} , 404
        
        if mfd_:
            try:
                mfd = dt.strptime(mfd_,"%Y-%m-%d")
            except:
                return {"message" : "date format should be yyyy-mm-dd"}, 400
            if stock.mfd != mfd:
                for stock_ in stock.product.available_stock:
                    if stock_!=stock and stock_.mfd == mfd:
                        return {"message" : "Stock with specified MFD already exists."}, 400
                stock.mfd = mfd
        if exp_days and stock.expiry != exp_days:
            stock.expiry = exp_days
        if qty and stock.quantity != qty:
            stock.quantity = qty
        if price and stock.price != price :
            stock.price = price
        if threshold and stock.threshold != threshold:
            stock.threshold = threshold
        
        try:
            db.session.commit()
            saleable_stock(product)
            return {"message" : "stock updated successfully."}
        except:
            return {"message" : "something went wrong"}, 500

    @auth_required("token")
    @roles_required("mngr")
    def delete(self, prod, stock_id):
        product = Product.query.filter_by(name = prod).first()
        if not product:
            return {"message" : "product not found"}, 404        

        stock = Stock.query.get(stock_id)
        if not stock or stock.product != product :
            return {"message" : "stock not found"} , 404
        
        try:
            db.session.delete(stock)
            db.session.commit()
            return {"message" : "stock deleted successfully."}
        except:
            return  {"message" : "Something went wrong."},500

prod_review_fields = {
    "review_id" : fields.Integer(attribute = "id"),
    "user" : fields.String(attribute="user.name"),
    "user_id" : fields.Integer(attribute="user.id"),
    "product": fields.String(attribute="product.name"),
    "comment" : fields.String,
    "rating" : fields.Integer,
    "reviewed_on" : fields.String(attribute="reviewedOn")
}

class ProdReviewAPI(Resource):
    def __init__(self):
        self.parser_post = reqparse.RequestParser()
        self.parser_post.add_argument("product_id", type = int, required = True, location = "json")
        self.parser_post.add_argument("comment", type = str, location = "json")
        self.parser_post.add_argument("rating", type = int, required = True, location = "json")
        
        self.parser_put = reqparse.RequestParser()
        self.parser_put.add_argument("comment", type = str, location = "json")
        self.parser_put.add_argument("rating", type = int, location = "json")
        
    def get(self,review_id):
        review = ProdReview.query.get(review_id)
        if not review:
            return {"message" : "Review not found."}, 404
        return marshal(review, prod_review_fields)
    
    @auth_required("token")
    @roles_required("cust")
    def post(self):
        args = self.parser_post.parse_args()
        prod_id = args.get("product_id")
        comment = args.get("comment")
        rating = args.get("rating")
        
        prod = Product.query.get(prod_id)
        if not prod:
            return {"message" : "Product not found."}, 404
        
        already_reviewed = ProdReview.query.filter_by(user_id = current_user.id, product_id = prod_id).first()
        if already_reviewed:
            return {"message" : "You have already reviewed this product. You can try editing your exisiting review."}, 400

        prod_bought_by_user = False
        for order in current_user.orders:
            for item in order.items:
                if item.product_id == prod_id:
                    prod_bought_by_user = True
                    break
            if prod_bought_by_user:
                break
        if not prod_bought_by_user:
            return {"message" : "You can't review a product until you buy it."}, 400

        if 5<rating<1:
            return {"message" : "Invalid rating."}, 400
        
        if comment is None:
            review = ProdReview(user_id = current_user.id, product_id = prod_id, rating = rating, reviewedOn = dt.now())
        else:
            review = ProdReview(user_id = current_user.id, product_id = prod_id, comment = comment, rating = rating, reviewedOn = dt.now())

        try:
            db.session.add(review)
            total_reviews = len(prod.reviews)
            if total_reviews > 0:
                prod.avg_rating = sum([review.rating for review in prod.reviews])/total_reviews
            db.session.commit()
            return {"message" : "Review added successfully."}
        except:
            return {"message" : "Something went wrong"}, 500
        
    @auth_required("token")
    @roles_required("cust")
    def put(self,review_id):
        review = ProdReview.query.get(review_id)
        if not review or review.user != current_user:
            return {"message": "Review not found"}, 404
        
        args = self.parser_put.parse_args()
        comment = args.get("comment")
        rating = args.get("rating")
        if comment is None and rating is None:
            return {"message" : "Provide values to update your review."}, 400
        if comment is not None:
            review.comment = comment
        if rating is not None:
            review.rating = rating
            prod = review.product
            total_reviews = len(prod.reviews)
            if total_reviews > 0:
                prod.avg_rating = sum([review.rating for review in prod.reviews])/total_reviews
        try:
            db.session.commit()
            return {"message": "Review updated successfully."}
        except:
            return {"message": "Something went wrong."}

cart_item_fields = {
    "item_id" : fields.Integer(attribute = "id"),
    "cart_id" : fields.Integer,
    "product_id" : fields.Integer(attribute = "product.id"),
    "product_category" : fields.String(attribute= "product.category.name"),
    "product_name": fields.String(attribute= "product.name"),
    "product_img_path" : fields.String(attribute="product.img_path"),
    "mfd" : fields.String,
    "quantity" : fields.Integer,
    "unit_description" : fields.String(attribute="product.unitDescription"),
    "price" : fields.Float,
    "availability_status" : fields.String
    # "discount" : fields.Integer 
} 

cart_fields = {
    "cart_id" : fields.Integer(attribute = "id"),
    "user_id" : fields.Integer,
    "cart_total" : fields.Float,
    "items" : fields.Nested(cart_item_fields)
}

class CartAPI(Resource):
    @auth_required("token")
    @roles_accepted("cust")
    def get(self):

        carts = current_user.cart
        if len(carts) == 0:
            return {"message" : "Your cart is empty."}, 404
        cart = carts[0]
        if not cart.items:
            return {"message" : "Your cart is empty."}, 404
        
        cart_items = cart.items
        for item in cart_items:
            prod = item.product
            stock_dict = saleable_stock(prod)
            stocks = stock_dict["stocks"]
            max_saleable_quantity = stock_dict["max_saleable_qty"]
            if max_saleable_quantity <= 0:
                item.availability_status = "out-of-stock"
                continue
            elif item.quantity > max_saleable_quantity:
                item.availability_status = "insufficient-stock"
                continue

            for stock in stocks:
                if item.quantity <= stock.quantity:
                    item.mfd  = stock.mfd
                    item.price = stock.price
                    break
            item.availability_status = "in-stock"
        
        try:
            cart_total = sum([item.price*item.quantity for item in cart_items if item.availability_status == "in-stock"])
            cart.cart_total = cart_total
            db.session.commit()
            return marshal(cart, cart_fields)
        except:
            return {"message" : "Something went wrong."}, 500
    
    @auth_required("token")
    @roles_required("cust")
    def delete(self):
        carts = current_user.cart
        if len(carts) == 0:
            return {"message" : "Your cart is empty."}, 400
        
        cart = carts[0]
        if not cart.items:
            return {"message" : "Your cart is empty."}, 404
        try:
            db.session.delete(cart)
            db.session.commit()
            return {"message" : "Cart successfully deleted"}
        except:
            return {"message" : "Something went wrong."}, 500

class CartItemsAPI(Resource):
    def __init__(self):
        self.parser_post = reqparse.RequestParser()
        self.parser_post.add_argument("stock_id", type = int, required = True, location = "json")
        self.parser_post.add_argument("quantity", type = int, required = True, location = "json")

        self.parser_put = reqparse.RequestParser()
        self.parser_put.add_argument("quantity", type = int, required = True, location = "json")

    @auth_required("token")
    @roles_required("cust")
    def get(self,item_id):
        item = CartItems.query.get(item_id)
        if not item or item.cart != current_user.cart[0]:
            return {"message" : "Item not found."}, 404
        
        prod = item.product
        stock_dict = saleable_stock(prod)
        stocks = stock_dict["stocks"]
        max_saleable_quantity = stock_dict["max_saleable_qty"]
        if max_saleable_quantity <= 0:
            item.availability_status = "out-of-stock"
        elif item.quantity > max_saleable_quantity:
            item.availability_status = "insufficient-stock"
        else:
            for stock in stocks:
                if item.quantity <= stock.quantity:
                    item.mfd  = stock.mfd
                    item.price = stock.price
                    break
            item.availability_status = "in-stock"
        try:
            db.session.commit()
        except:
            return {"message" : "Something went wrong."} , 500
        return marshal(item, cart_item_fields)
    
    @auth_required("token")
    @roles_required("cust")
    def post(self):
        args = self.parser_post.parse_args()
        
        stock_id = args.get("stock_id")
        qty = args.get("quantity")
        if 5<qty<1:
            return {"message" : "Invalid Quantity, min = 1 , max = 5"}, 400

        stock = Stock.query.get(stock_id)
        if not stock:
            return {"message" : "No such stock exists."}, 404
        
        carts = current_user.cart
        if len(carts) == 0:
            cart = Cart(user_id = current_user.id)
            db.session.add(cart)
            try:
                db.session.commit()
            except:
                return {"message" : "Something went wrong"}, 500
        else:
            cart = current_user.cart[0]
        cart_items = cart.items
        prod_added = False
        for item in cart_items:
            if item.product_id == stock.product_id:
                qty_already_added = item.quantity
                if (qty_already_added + qty) > 5:
                    return {"message" : '''You can buy maximum of 5 units. Quantity already added: {}'''.format(qty_already_added)}, 400
                item.quantity += qty
                item.price = stock.price
                item.mfd = stock.mfd
                cart.cart_total += qty*stock.price
                prod_added = True
        
        if not prod_added:
            item = CartItems(cart_id=cart.id, product_id = stock.product_id,mfd = stock.mfd, quantity = qty, price = stock.price, availability_status = "in-stock")
            cart.cart_total += qty*stock.price
            db.session.add(item)
        
        try:
            db.session.commit()
            return {"message" : "Item successfully added to cart."}
        except:
            return {"message" : "Something went wrong."}, 500

    @auth_required("token")
    @roles_required("cust")
    def put(self, item_id):
        args = self.parser_put.parse_args()
        qty = args.get("quantity")

        item = CartItems.query.get(item_id)
        if not item or item.cart != current_user.cart[0]:
            return {"message" : "Item not found"}, 404
        
        if 5<qty<1:
            return {"message" : "Invalid Quantity, min = 1 , max = 5"}, 400
        
        prev_qty = item.quantity
        item.quantity = qty

        prev_item_amount = prev_qty*item.price
        cart = current_user.cart[0]
        cart.cart_total = cart.cart_total - prev_item_amount + qty*item.price
        try:
            db.session.commit()
            return {"message" : "Quantity updated."}
        except:
            return {"message": "Something went wrong."}, 500
        
    @auth_required("token")
    @roles_required("cust")
    def delete(self, item_id):
        item = CartItems.query.get(item_id)
        if not item or item.cart != current_user.cart[0]:
            return {"message" : "Item not found"}, 404
        
        cart = current_user.cart[0]
        item_amount = item.price*item.quantity
        try:
            db.session.delete(item)
            cart.cart_total -= item_amount
            db.session.commit()
            return {"message" : "Item deleted."}
        except:
            return {"message": "Something went wrong."}, 500

class ItemAmount(fields.Raw):
    def format(self,id):
        item = OrderItems.query.get(id)
        if item.discount:
            amount = item.quantity*item.price*(1-0.01*item.discount)
        else:
            amount = item.quantity*item.price

        return amount

order_item_fields = {
    "item_id" : fields.Integer(attribute = "id"),
    "order_id" : fields.Integer,
    "product_id" : fields.Integer(attribute = "product.id"),
    "product_name": fields.String,
    "category_name":fields.String(attribute="product.category.name"),
    "product_img_path" : fields.String(attribute="product.img_path"),
    "quantity" : fields.Integer,
    "unitDescription" : fields.String,
    "price" : fields.Float,
    "amount" : ItemAmount(attribute = "id"),
    "percent_discount" : fields.Integer(attribute="discount")
} 

order_fields = {
    "order_id" : fields.Integer(attribute = "id"),
    "user_id" : fields.Integer,
    "order_total" : fields.Float,
    "status" : fields.String,
    "order_date" : fields.String,
    "items" : fields.Nested(order_item_fields)
}

class OrderAPI(Resource):
    def __init__(self):
        self.parser = reqparse.RequestParser()
        self.parser.add_argument("coupon_code", type = str, location = "json")

    @auth_required("token")
    @roles_required("cust")
    def get(self, order_id= None):
        if order_id is None:
            orders = current_user.orders
            if orders == []:
                return {"message" : "No orders yet."}, 404
            orders.sort(key = lambda order: order.order_date,reverse=True)
            return marshal(orders, order_fields)
        
        order = Order.query.get(order_id)

        if not order or order.user != current_user:
            return {"message" : "Order not found"} , 404
        
        return marshal(order, order_fields)
    
    @auth_required("token")
    @roles_required("cust")
    def post(self):
        args = self.parser.parse_args()
        coupon_code = args.get("coupon_code")
        disc = 0
        add_disc = False
        if coupon_code is not None:
            if coupon_code.upper() == "FIRSTBUY20" and len(current_user.orders) == 0:
                add_disc = True
                disc = 20

        items_to_order = []
        carts = current_user.cart
        if len(carts) == 0:
            return {"message" : "Your cart is empty."}, 404
        
        cart = carts[0]
        if not cart.items:
            return {"message" : "Your cart is empty."}, 404

        cart_items = cart.items

        for item in cart_items:
            if item.availability_status == "in-stock" :
                prod = item.product
                stock_dict = saleable_stock(prod)
                stocks = stock_dict["stocks"]
                
                selected_stock = None
                for stock in stocks:
                    if item.price == stock.price:
                        if item.quantity <= stock.quantity:
                            selected_stock = stock
                            break
                if not selected_stock:
                    return {"message" : "Order could not be placed. Please try again"} , 400
                items_to_order.append((item,selected_stock))
        
        # creating order
        if add_disc:
            order = Order(user_id = current_user.id, order_total = round(cart.cart_total*(1-disc*0.01),2), order_date = dt.now())
        else:
            order = Order(user_id = current_user.id, order_total = round(cart.cart_total,2), order_date = dt.now())
        try:
            db.session.add(order)
            db.session.commit()
        except:
            return {"message" : "something went wrong"}, 500
        
        # adding items to order
        for item, selected_stock in items_to_order:
            if add_disc:
                order_item = OrderItems(order_id = order.id, product_id = item.product_id, product_name = item.product.name, quantity = item.quantity, unitDescription= item.product.unitDescription, price = item.price, discount = disc)
            else:
                order_item = OrderItems(order_id = order.id, product_id = item.product_id, product_name = item.product.name, quantity = item.quantity, unitDescription= item.product.unitDescription, price = item.price)
            
            # updating the stock
            selected_stock.quantity -= item.quantity
            if selected_stock.quantity == 0:
                db.session.delete(selected_stock)

            db.session.add(order_item)
            db.session.delete(item)

        try:
            db.session.commit()
            return {"message" : "Order placed successfully"}
        except:
            try:
                db.session.rollback()
                db.session.delete(order)
                db.session.commit()
                return {"message": "Order could not be placed"}
            except:
                return {"message" : "something went wrong"}, 500

class OrderItemsAPI(Resource):
    @auth_required("token")
    @roles_required("cust")
    def get(self,item_id):
        item = OrderItems.query.get(item_id)
        if not item or item.order.user != current_user:
            return {"message" : "Item not found"}, 404
        return marshal(item, order_item_fields)


api.add_resource(UserApi, "/user")
api.add_resource(CategoryAPI,"/category","/category/<ctg_name>")
api.add_resource(ProductAPI, "/<string:ctg>/products","/<string:ctg>/products/<string:prod>")
api.add_resource(StockAPI, "/stock/<string:prod>", "/stock/<string:prod>/<int:stock_id>")
api.add_resource(ProdReviewAPI, "/reviews","/reviews/<int:review_id>")
api.add_resource(CartAPI, "/cart")
api.add_resource(CartItemsAPI, "/cart/cart_items", "/cart/cart_items/<int:item_id>")
api.add_resource(OrderAPI, "/order", "/order/<int:order_id>")
api.add_resource(OrderItemsAPI, "/order/order_items/<int:item_id>")