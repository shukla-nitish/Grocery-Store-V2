from flask import Flask
from config import DevelopmentConfig
from application.models import db
from application.resources import api

def create_app():
    app = Flask(__name__)

    app.config.from_object(DevelopmentConfig)
    db.init_app(app)
    api.init_app(app)
    app.app_context().push()
    return app

app = create_app()

if __name__ == "__main__":
    app.run(debug = True)