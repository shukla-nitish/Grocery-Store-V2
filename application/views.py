from flask import current_app as app, jsonify, request, render_template, send_file
from flask_security import auth_required, roles_required, current_user
from werkzeug.security import check_password_hash
from flask_restful import marshal, fields
# import flask_excel as excel
# from celery.result import AsyncResult
# from .tasks import create_resource_csv
from .models import *
from .sec import datastore
from.resources import prod_review_fields


@app.get('/activate/manager/<int:mngr_id>')
@auth_required("token")
@roles_required("admin")
def activate_mngr(mngr_id):
    manager = User.query.get(mngr_id)
    if not manager or "mngr" not in manager.roles:
        return jsonify({"message": "Manager not found"}), 404

    manager.active = True
    try:
        db.session.commit()
        return jsonify({"message": "User Activated"})
    except:
        return jsonify({"message", "Something went wrong."}),500
    
@app.get('/product/<int:prod_id>/reviews')
def prod_reviews(prod_id):
    prod = Product.query.get(prod_id)
    if not prod:
        return {"message" : "Product not found."}, 404
    return marshal(prod.reviews, prod_review_fields)

@auth_required("token")
@roles_required("cust")
@app.get('/user/reviews')
def user_reviews():
    return marshal(current_user.reviews, prod_review_fields)

# @app.get('/approve/category/<int:ctg_id>')
# @auth_required("token")
# @roles_required("admin")
# def approve_ctg(ctg_id):
#     ctg = Category.query.get(ctg_id)
#     if not ctg:
#         return jsonify({"message" : "Category not found."}), 404
#     ctg.is_approved = True
#     try:
#         db.session.commit()
#         return jsonify({"message": "Category approved successfully."})
#     except:
#         return jsonify({"message" : "Something went wrong."}), 500