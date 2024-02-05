
from celery import shared_task
from  .mail_service import send_message
from jinja2 import Template
from .models import *
import csv
from datetime import datetime as dt
from datetime import timedelta

@shared_task(ignore_result=False)
def create_sales_report():
    with open("sales.csv", "w", newline='') as file:
        f = csv.writer(file, delimiter=',')
        f.writerow(["Date", "User_id", "Order_id", "Item", "Quantity", "Unit", "Rate", "Discount(in pct)", "Amount"])
        orders = Order.query.all()
        for order in orders:
            for order_item in order.items:
                f.writerow([str(order.order_date), order.user_id, order.id, order_item.product_name, order_item.quantity, order_item.unitDescription, order_item.price,order_item.discount, order_item.quantity*order_item.price*((1-order_item.discount*0.01) if order_item.discount else 1)])
    
    return "sales.csv"

@shared_task(ignore_result = False)
def create_inventory_report():
    with open("inventory.csv", "w", newline='') as file:
        f = csv.writer(file, delimiter=',')
        f.writerow(["Stock_id","Product_id", "Product Name", "MFD", "Expiry Date", "Threshold(in days)", "Quantity", "Unit", "Rate", "Saleable"])
        stocks = Stock.query.all()
        for stock in stocks:
            prod = stock.product
            f.writerow([stock.id, stock.product_id, prod.name, str(stock.mfd)[:10], str(stock.mfd + timedelta(days = stock.expiry))[:10],stock.threshold, stock.quantity, prod.unitDescription, stock.price, stock.saleable])

    return "inventory.csv"

# @shared_task(ignore_result = False)
# def create_charts():
#     orders = Order.query.all()

#     weekly_sales_revenue = dict()
#     weekly_sales_volume = dict()
#     for i in range(6,-1,-1):
#         d = dt.now()-timedelta(days=i)
#         weekly_sales_revenue[str(d)[:10]] = 0
#         weekly_sales_volume[str(d)[:10]] = 0
                
#         for order in orders:
#             date = str(order.order_date)[:10]
#             if date in weekly_sales_revenue:
#                 weekly_sales_revenue[date] += order.order_total
#                 weekly_sales_volume[date] += 1

#         dates = list(weekly_sales_revenue.keys())
#         sales = list(weekly_sales_revenue.values())
#         volume = list(weekly_sales_volume.values())

#         path1 = "/static/sales_trend.png"
#         path2 = "/static/volume_trend.png"
#         cwd = os.getcwd()
#         cwd = cwd.replace("\\","/")
#         path1 = cwd+path1
#         path2 = cwd+path2

#         fig1 = plt.figure(figsize = (10, 5))
    
#         # creating the bar plot
#         plt.bar(dates, sales, color ='green',width = 0.4)
#         plt.rc('axes', axisbelow=True)
#         plt.rc('xtick', labelsize=12)
#         plt.rc('ytick', labelsize=12)

#         plt.xlabel("Date", fontsize=20)
#         plt.ylabel("Sales in INR", fontsize=20)
#         plt.title("Sales Trend for last 7 days",fontsize=20)
#         plt.grid(axis='y')
#         plt.savefig(path1)
#         plt.close()

#         fig2 = plt.figure(figsize = (10, 5))
#         plt.bar(dates, volume, color ='green',width = 0.4)
#         plt.xlabel("Date",fontsize=20)
#         plt.ylabel("No. of orders",fontsize=20)
#         plt.title("Volume Trend for last 7 days",fontsize=20)
#         plt.grid(axis='y')
#         plt.savefig(path2)
#         plt.close()

#         return {"sales_img_path" : "/static/sales_trend.png",
#             "volume_img_path" : "/static/volume_trend.png"}

@shared_task(ignore_result=True)
def daily_customer_reminder(to,subject):
    customers = User.query.filter(User.roles.any(Role.name == 'cust')).all()
    send_email_to = []
    
    for customer in customers:
        not_bought = True
        for order in customer.orders:
            if str(order.order_date)[0:10] == str(dt.now())[0:10]:
                not_bought = False
                break
        if not_bought:
            send_email_to.append(customer)
    
    for user in send_email_to:
        with open('daily_customer_reminder.html', 'r') as f:
            template = Template(f.read())
            send_message(user.email,subject,template.render(user=user))
    return "OK"

@shared_task(ignore_result=True)
def monthly_activity_report(to,subject):
    customers = User.query.filter(User.roles.any(Role.name == 'cust')).all()
    users = []
    for customer in customers:
        d={}
        d["name"] = customer.name
        d["email"] = customer.email
        d["orders"] = []
        for order in customer.orders:
            month_old_date = dt.now()-timedelta(days=30)
            if month_old_date < order.order_date < dt.now():
                d["orders"].append(order)
        if len(d["orders"])!= 0:
            users.append(d)

    for user in users:
        with open('monthly_activity_report.html', 'r') as f:
            template = Template(f.read())
            send_message(user["email"], subject,template.render(user=user))
    return "OK"