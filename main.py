from flask import Flask
from flask_security import Security
from application.sec import datastore
from config import DevelopmentConfig
from application.models import db
from application.resources import api
from application.worker import celery_init_app
from celery.schedules import crontab
from application.tasks import daily_customer_reminder,monthly_activity_report

def create_app():
    app = Flask(__name__)

    app.config.from_object(DevelopmentConfig)
    db.init_app(app)
    api.init_app(app)
    
    app.security = Security(app, datastore)
    app.app_context().push()
    return app, datastore

app, datastore = create_app()
celery_app = celery_init_app(app)

# @celery_app.on_after_configure.connect
# def send_email(sender, **kwargs):
#     sender.add_periodic_task(
#         crontab(hour=14, minute=26, day_of_month=25),
#         daily_reminder.s('client@email.com', 'Daily Test'),
#     )

@celery_app.on_after_configure.connect
def customer_email_daily(sender, **kwargs):
    sender.add_periodic_task(
        crontab(hour=16, minute=59, day_of_month=25),
        daily_customer_reminder("dummy@email.com","GroceGalaxy Daily Reminder!"),
    )

@celery_app.on_after_configure.connect
def customer_email_monthly(sender, **kwargs):
    sender.add_periodic_task(
        crontab(hour=16, minute=59, day_of_month=25),
        monthly_activity_report.s("dummy@email.com","GroceGalaxy Monthly Report!"),
    )
import application.views

if __name__ == "__main__":
    app.run(debug = True)