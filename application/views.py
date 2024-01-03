from flask import current_app as app, jsonify, request, render_template, send_file
from flask_security import auth_required, roles_required
from werkzeug.security import check_password_hash
from flask_restful import marshal, fields
# import flask_excel as excel
# from celery.result import AsyncResult
# from .tasks import create_resource_csv
from .models import *
from .sec import datastore

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
        return jsonify({"message", "Something went wrong."})