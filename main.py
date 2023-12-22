from flask import Flask
from config import DevelopmentConfig
from application.resources import api

def create_app():
    app = Flask(__name__)

    app.config.from_object(DevelopmentConfig)
    api.init_app(app)
    return app

app = create_app()

if __name__ == "__main__":
    app.run(debug = True)