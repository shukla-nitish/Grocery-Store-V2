import os
from config import ALLOWED_EXTENSIONS, UPLOAD_FOLDER
from .models import db,Category, Product
# from flask import jsonify
from datetime import datetime as dt
from datetime import timedelta

def string_to_date(str):
    try:
        date = dt.strptime(str, "%Y-%m-%d")
        return date
    except:
        return False

def allowed_file(filename):
    if '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS:
        return True
    return False

def save_file(file):
    # here I am considering only the images that are related to products and categories
    files_names = [category.img_path.rsplit("/",1)[1] for category in Category.query.all()]
    files_names += [product.img_path.rsplit("/",1)[1] for product in Product.query.all()]

    same_file_names = [name.rsplit(".",1)[0] for name in files_names if name.rsplit(".",1)[0].rsplit("_",1)[0] == file.filename.rsplit(".",1)[0]]
    if len(same_file_names) != 0:
        #since I am always adding a counter whenever i save a new file 'name.rsplit("_",1)[1]' will never give index error
        counters = [int(name.rsplit("_",1)[1]) for name in same_file_names] 
        new_img_count = max(counters)+1
        FILENAME = file.filename.rsplit(".",1)[0]+"_"+ str(new_img_count) +"."+file.filename.rsplit(".",1)[1]
    else:
        FILENAME = file.filename.rsplit(".",1)[0]+"_0."+file.filename.rsplit(".",1)[1]

    file.save(os.path.join(UPLOAD_FOLDER,FILENAME))

    return FILENAME

def saleable_stock(prod): #prod is a product object
    stocks = prod.available_stock
    if stocks:
        for stock in stocks:
            saleable_date = stock.mfd + timedelta(days = stock.expiry-stock.threshold) #it is the date after which this particular stock can't be sold
            expiry_date = stock.mfd + timedelta(days = stock.expiry)

            if saleable_date < dt.now():
                stock.saleable = False
            if expiry_date < dt.now() or stock.quantity <= 0:
                db.session.delete(stock)
                
        try:
            db.session.commit()
        except:
            return {"message" : "Something went wrong."}, 500
        stocks = [stock for stock in prod.available_stock if stock.saleable]
        stocks.sort(key = lambda stock: stock.mfd)

    # I am going to give the product to the user from a single stock. the stock will be selected based on order quantity.
    # if order quanity is less than the available quantity of oldest stock then oldest stock will be selected otherwise newer stocks will be selected.
    # it is possible that the order quantity is less than total quantity available in the stock and still user sees "insufficient stock"
        
    # max_saleable_qty = max([stock.quantity for stock in stocks],default = 0)
    stock_dict = dict()
    stock_dict["stocks"] = stocks
    stock_dict["max_saleable_qty"] = 0
    stock_dict["max_saleable_qty_price"] = 0
    stock_dict["stock_id"] = 0
    for stock in stocks:
        if stock.quantity > stock_dict["max_saleable_qty"]:
            stock_dict["max_saleable_qty"] = stock.quantity
            stock_dict["max_saleable_qty_price"] = stock.price
            stock_dict["stock_id"] = stock.id
    
    return  stock_dict