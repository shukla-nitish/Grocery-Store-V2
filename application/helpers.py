import os
from main import app
from .models import Category, Product

def allowed_file(filename):
    if '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config["ALLOWED_EXTENSIONS"]:
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

    file.save(os.path.join(app.config['UPLOAD_FOLDER'],FILENAME))

    return FILENAME
