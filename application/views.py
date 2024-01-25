import matplotlib
matplotlib.use('Agg')
from flask import current_app as app, jsonify, request, render_template, send_from_directory,send_file
from flask_security import auth_required, roles_required,roles_accepted, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from flask_restful import marshal, reqparse
from email_validator import validate_email
from datetime import datetime as dt
from datetime import timedelta
import matplotlib.pyplot as plt
import csv
import os
from celery.result import AsyncResult
from .tasks import create_sales_report
from .models import *
from .sec import datastore
from.resources import product_fields, prod_review_fields,user_fields
from .helpers import string_to_date

@app.get("/")
def home():
    return render_template("index.html")

@app.post('/user-login')
def user_login():
    data = request.get_json()
    email = data.get('email')
    if not email:
        return jsonify({"message": "email not provided"}), 400

    user = datastore.find_user(email=email)

    if not user:
        return jsonify({"message": "User with specified email not found."}), 404

    if check_password_hash(user.password, data.get("password")):
        return jsonify({"token": user.get_auth_token(),
                        "user_id": user.id,
                        "name" : user.name,
                        "email": user.email,
                        "role": user.roles[0].name})
    else:
        return jsonify({"message": "Wrong Password"}), 400

parser_mngr = reqparse.RequestParser()
parser_mngr.add_argument("name", type = str, required = True, location = "json")
parser_mngr.add_argument("email", type = str, required = True, location = "json")
parser_mngr.add_argument("password", type = str, required = True, location = "json")
parser_mngr.add_argument("role", type = str, required = True, location = "json")


@app.get('/managers')
@auth_required("token")
@roles_required("admin")
def get_mngrs():
    managers = User.query.filter(User.roles.any(Role.name == 'mngr')).all()
    if not managers:
        return {"message": "No managers found"}, 404
    else:
        return marshal(managers, user_fields)

@app.post('/add_manager')
@auth_required("token")
@roles_required("admin")
def add_mngr():
    args = parser_mngr.parse_args()

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
        return {"message": "Manager already exists!"}, 400
    
    password = args.get("password")
    role = args.get("role")
    if role != "manager":
        return {"message" : "Please specify correct role."}, 400
    
    if role == "manager":
        datastore.create_user(name = name, email = email, password = generate_password_hash(password), active = True, roles = ["mngr"])
    try:
            db.session.commit()
            user = datastore.find_user(email= email)
            return {"message" : "Manager added successfully."}
    except:
        return {"message" : "Oops! Something went wrong."} , 500

@app.get('/manager/activate/<int:mngr_id>')
@auth_required("token")
@roles_required("admin")
def activate_mngr(mngr_id):
    manager = User.query.get(mngr_id)
    if not manager or "mngr" not in manager.roles:
        return jsonify({"message": "Manager not found"}), 404

    manager.active = True
    try:
        db.session.commit()
        return jsonify({"message": "Manager Activated"})
    except:
        return jsonify({"message", "Something went wrong."}),500
    
@app.get('/manager/deactivate/<int:mngr_id>')
@auth_required("token")
@roles_required("admin")
def deactivate_mngr(mngr_id):
    manager = User.query.get(mngr_id)
    if not manager or "mngr" not in manager.roles:
        return jsonify({"message": "Manager not found"}), 404

    manager.active = False
    try:
        db.session.commit()
        return jsonify({"message": "Manager Deactivated"})
    except:
        return jsonify({"message", "Something went wrong."}),500
    
@app.get('/manager/delete/<int:mngr_id>')
@auth_required("token")
@roles_required("admin")
def delete_mngr(mngr_id):
    manager = User.query.get(mngr_id)
    if not manager or "mngr" not in manager.roles:
        return jsonify({"message": "Manager not found"}), 404

    try:
        db.session.delete(manager)
        db.session.commit()
        return jsonify({"message": "Manager Deleted"})
    except:
        return jsonify({"message", "Something went wrong."}),500
    
@app.get('/product/<string:prod_name>/reviews')
def prod_reviews(prod_name):
    prod = Product.query.filter_by(name = prod_name).first()
    if not prod:
        return {"message": "Product not found."}, 404
    reviews = prod.reviews
    if not reviews:
        return {"message" : "No reviews yet"}, 404
    return marshal(reviews, prod_review_fields)

@auth_required("token")
@roles_required("cust")
@app.get('/user/reviews')
def user_reviews():
    if current_user.reviews:
        return marshal(current_user.reviews, prod_review_fields)
    return {"message": "User has not reviewed any product."} , 404

@auth_required("token")
@roles_required("cust")
@app.get('/user/<string:prod_name>/reviews')
def user_prod_reviews(prod_name):
    for review in current_user.reviews:
        if review.product.name == prod_name:
            return marshal(review, prod_review_fields)
    return {"message": "User has not reviewed this product."} , 404


@app.get('/category/approve/<int:ctg_id>')
@auth_required("token")
@roles_required("admin")
def approve_ctg(ctg_id):
    ctg = Category.query.get(ctg_id)
    if not ctg:
        return jsonify({"message" : "Category not found."}), 404
    ctg.is_approved = True
    try:
        db.session.commit()
        return jsonify({"message": "Category approved successfully."})
    except:
        return jsonify({"message" : "Something went wrong."}), 500
    
@app.get('/category/approve_edit/<int:ctg_id>')
@auth_required("token")
@roles_required("admin")
def approve_ctg_edit(ctg_id):
    ctg = Category.query.get(ctg_id)
    if not ctg:
        return jsonify({"message" : "Category not found."}), 404
    if ctg.edit_request:
        if not ctg.edited_name and not ctg.edited_img_path:
            return {"message" : "New Values not found for editing category"}, 404
        
        if ctg.edited_name:
            ctg.name = ctg.edited_name
            ctg.edited_name = ""

        try:
            if ctg.edited_img_path:
                prev_img_path = ctg.img_path
                ctg.img_path = ctg.edited_img_path

                cwd = os.getcwd()
                cwd = cwd.replace("\\","/")
                path = cwd+prev_img_path
                os.remove(path)
                ctg.edited_img_path = ""
            
            ctg.edit_request = False
            db.session.commit()
            return jsonify({"message": "Edit request approved."})
        except:
            return jsonify({"message" : "Something went wrong."}), 500
    else:
        return {"message" : "Not requested from manager"}, 400

@app.get('/category/cancel_edit/<int:ctg_id>')
@auth_required("token")
@roles_required("admin")
def cancel_ctg_edit(ctg_id):
    ctg = Category.query.get(ctg_id)
    if not ctg:
        return jsonify({"message" : "Category not found."}), 404
    if ctg.edit_request:
        ctg.edited_name = ""
        try:
            if ctg.edited_img_path:
                img_path = ctg.img_path
                cwd = os.getcwd()
                cwd = cwd.replace("\\","/")
                path = cwd+img_path
                os.remove(path)
                ctg.edited_img_path = ""
            
            ctg.edit_request = False
            db.session.commit()
            return jsonify({"message": "Edit request cancelled."})
        except:
            return jsonify({"message" : "Something went wrong."}), 500
    else:
        return {"message" : "Edit Not requested from manager"}, 400

@app.get('/category/approve_delete/<int:ctg_id>')
@auth_required("token")
@roles_required("admin")
def approve_ctg_delete(ctg_id):
    ctg = Category.query.get(ctg_id)
    if not ctg:
        return jsonify({"message" : "Category not found."}), 404
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
            os.remove(path1)
        if ctg.edited_img_path:
            os.remove(path2)
        return { "message" : "category successfully deleted"}
    except:
        return {"message" : "something went wrong"} , 500

@app.get('/category/cancel_delete/<int:ctg_id>')
@auth_required("token")
@roles_required("admin")
def cancel_ctg_delete(ctg_id):
    ctg = Category.query.get(ctg_id)
    if not ctg:
        return jsonify({"message" : "Category not found."}), 404
    ctg.delete_request = False
    try:
        db.session.commit()
        return {"message": "Category deletion cancelled"}
    except:
        return {"message" : "something went wrong"} , 500

@auth_required("token")
@roles_accepted("admin","mngr")
@app.get("/summary")
def summary_get():
    ctgs = Category.query.all()
    prods = Product.query.all()
    number_of_customers= len(RolesUsers.query.filter_by(role_id= 3).all())

    orders = Order.query.all()
    carts = Cart.query.all()

    total_cart_value = sum([cart.cart_total for cart in carts])
    total_sales = sum([order.order_total for order in orders])
    # task = create_charts.delay()
    weekly_sales_revenue = dict()
    weekly_sales_volume = dict()
    for i in range(6,-1,-1):
        d = dt.now()-timedelta(days=i)
        weekly_sales_revenue[str(d)[:10]] = 0
        weekly_sales_volume[str(d)[:10]] = 0
                
        for order in orders:
            date = str(order.order_date)[:10]
            if date in weekly_sales_revenue:
                weekly_sales_revenue[date] += order.order_total
                weekly_sales_volume[date] += 1

        dates = list(weekly_sales_revenue.keys())
        sales = list(weekly_sales_revenue.values())
        volume = list(weekly_sales_volume.values())

        path1 = "/static/sales_trend.png"
        path2 = "/static/volume_trend.png"
        cwd = os.getcwd()
        cwd = cwd.replace("\\","/")
        path1 = cwd+path1
        path2 = cwd+path2

        fig1 = plt.figure(figsize = (10, 5))
    
        # creating the bar plot
        plt.bar(dates, sales, color ='green',width = 0.4)
        plt.rc('axes', axisbelow=True)
        plt.rc('xtick', labelsize=12)
        plt.rc('ytick', labelsize=12)

        plt.xlabel("Date", fontsize=20)
        plt.ylabel("Sales in INR", fontsize=20)
        plt.title("Sales Trend for last 7 days",fontsize=20)
        plt.grid(axis='y')
        plt.savefig(path1)
        plt.close()

        fig2 = plt.figure(figsize = (10, 5))
        plt.bar(dates, volume, color ='green',width = 0.4)
        plt.xlabel("Date",fontsize=20)
        plt.ylabel("No. of orders",fontsize=20)
        plt.title("Volume Trend for last 7 days",fontsize=20)
        plt.grid(axis='y')
        plt.savefig(path2)
        plt.close()
    return {"total_categories":len(ctgs),
            "total_products":len(prods),
            "total_customers": number_of_customers,
            "total_orders":len(orders),
            "total_cart_value":round(total_cart_value,2),
            "total_sales" : round(total_sales,2),
            "sales_trend_img_path" : "/static/sales_trend.png",
            "volume_trend_img_path" : "/static/volume_trend.png"}

# @auth_required("token")
# @roles_accepted("admin", "mngr")
# @app.get('/get_charts/<task_id>')
# def get_charts(task_id):
#     res = AsyncResult(task_id)
#     if res.ready():
#         print("O am Ready")
#         return res.result
#     else:
#         return jsonify({"message": "Task Pending"}), 404

parser = reqparse.RequestParser()
parser.add_argument("data", type = str, location = "json")

@auth_required("token")
@roles_accepted("admin", "mngr")
@app.post("/summary")
def summary_post():
    args = parser.parse_args()
    data = args.get("data")

    if data == "sales":
        task = create_sales_report.delay()
        return {"task_id" : task.id}
                
                
    if data == "inventory":
        task = create_sales_report.delay()
        return {"task_id" : task.id}

@auth_required("token")
@roles_accepted("admin", "mngr")
@app.get('/get_csv/<task_id>')
def get_csv(task_id):
    res = AsyncResult(task_id)
    if res.ready():
        filename = res.result
        return send_file(filename, as_attachment=True)
    else:
        return jsonify({"message": "Task Pending"}), 404


@app.get("/search/<string:search_key>")
def search(search_key):        
        if search_key == "":
            return {"message": "No search key provided"}, 400
        
        ctg = Category.query.filter_by(name = search_key).first()
        if ctg:
            return {"result_type":"category",
                    "result" : ctg.name}
        else:
            prod = Product.query.filter_by(name = search_key).first()
            if prod:
                return {"result_type":"product",
                        "result" : {"category":prod.category.name,
                                    "product" : prod.name}}
            else:
                return {"message" : "Not found"}, 404

search_parser = reqparse.RequestParser()
search_parser.add_argument("category", type = str, location = "json")
search_parser.add_argument("price_min", type = float, location = "json")
search_parser.add_argument("price_max", type = float, location = "json")
search_parser.add_argument("mfd", type = str, location = "json")
search_parser.add_argument("rating", type = float, location = "json")


@app.post("/filtered_search")
def filtered_search():
    args = search_parser.parse_args()

    for key in ["category","price_min","price_max", "mfd", "rating"]:
        if key not in args:
            return {"message" : "Please provide a search field value."},400
            
    ctg_ = args.get("category")
    price_min = args.get("price_min")
    price_max = args.get("price_max")
    mfd = args.get("mfd")
    rating = args.get("rating")

    if not ctg_ and not price_min and not price_max and not mfd and not rating:
        return {"message" : "Please provide a search field value."},400

    if price_min and price_max and price_min > price_max:
        return {"message" : "No search Result"},404  

    mfd = string_to_date(mfd)
    if mfd and mfd > dt.now():
            return {"message" : "No search Result"},404
    
    if rating and  (rating>5 or rating<0.1) :
        return {"message" : "No search Result"},404
    
    ctg=None
    if ctg_:
        print(ctg_)
        ctg = Category.query.filter_by(name = ctg_).first()
        if not ctg or not ctg.is_approved:
            return {"message" : "No search Result"},404
    
    prods = Product.query.all()
    search_result = []
    for prod in prods:
        if ctg:
            if prod.category != ctg:
                continue
        if price_min:
            if not prod.available_stock:
                continue
            if prod.available_stock[0].price < price_min:
                continue
        if price_max:
            if not prod.available_stock:
                continue
            if price_max < prod.available_stock[0].price:
                continue
        if mfd:
            if not prod.available_stock:
                continue
            if mfd > prod.available_stock[0].mfd:
                continue
        if rating:
            if rating > prod.avg_rating:
                continue
        
        search_result.append(prod)

    if len(search_result) == 0:
        return {"message" : "No search Result"},404
    else:
        return marshal(search_result,product_fields)