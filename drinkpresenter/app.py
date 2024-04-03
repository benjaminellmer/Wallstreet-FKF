""" read from a SQLite database and return data """

from flask import Flask, render_template
from flask_sqlalchemy import SQLAlchemy
import os.path
from flask_bootstrap import Bootstrap5

# this variable, db, will be used for all SQLAlchemy commands
db = SQLAlchemy()
# create the app
app = Flask(__name__)
# change string to the name of your database; add path if necessary
db_name = 'Test.db'
# note - path is necessary for a SQLite db!!!
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
db_path = os.path.join(BASE_DIR, db_name)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + db_path

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True

# initialize the app with Flask-SQLAlchemy
db.init_app(app)

# Bootstrap-Flask requires this line
bootstrap = Bootstrap5(app)


class drinks(db.Model):
    __tablename__ = 'drinks'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)
    price = db.Column(db.Float)
    drinkgroup = db.Column(db.Integer)

class DrinkGroup(db.Model):
    __tablename__ = 'drinkgroup'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)
    minPrice = db.Column(db.Float)
    maxPrice = db.Column(db.Float)

#routes

@app.route('/')
def index():
    try:
        socks = db.session.execute(db.select(drinks)
            .order_by(drinks.name)).scalars()

        sock_text = '<ul>'
        for sock in socks:
            sock_text += '<li>' + sock.name + ', ' + str(sock.price) + ', ' + str(sock.drinkgroup) + '</li>'
        sock_text += '</ul>'
        return sock_text
    except Exception as e:
        # e holds description of the error
        error_text = "<p>The error:<br>" + str(e) + "</p>"
        hed = '<h1>Something is broken.</h1>'
        return hed + error_text

@app.route('/table')
def table():
    try:
        socks = db.session.execute(db.select(drinks)
            .order_by(drinks.id)).scalars()
        return render_template('list.html', socks=socks)
    except Exception as e:
        # e holds description of the error
        error_text = "<p>The error:<br>" + str(e) + "</p>"
        hed = '<h1>Something is broken.</h1>'
        return hed + error_text