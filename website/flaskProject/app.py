from flask import Flask, redirect, url_for, render_template, request, session, flash, jsonify
from datetime import timedelta
from flask_sqlalchemy import SQLAlchemy
import requests

app = Flask(__name__)
app.secret_key = "IDontKnowWhatKindOfKeyToPut"
app.permanent_session_lifetime = timedelta(days=1)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///usersscores.sqlite3'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] =False
db = SQLAlchemy(app)
penalties = {"Get half his credit": 200, "See score board": 20, "Inputs block box": 35, "Move cursor randomly":40,
                     "Push commit": 150, "Kill random navigation tab": 60, "Refresh his tab" : 25,
                     "Destroy his navigation page": 40, "Change his current tab": 35}

class users_scores(db.Model):
    _id = db.Column("id", db.Integer, primary_key=True)
    name = db.Column("name", db.String(100))
    score = db.Column("score", db.Integer)
    credit = db.Column("credit", db.Integer)

    def __init__(self, name, score, credit):
        self.name = name
        self.score = score
        self.credit = credit


@app.route('/')
def home():
    if "user" in session:
        user_name = session["user"]
        user_data = users_scores.query.filter_by(name=user_name).first()
        if user_data:
            score = user_data.score
            credit = user_data.credit
        else: #should never be in this case
            score = 0
            credit = 0
        contestants = users_scores.query.all()
        return render_template("home.html", user_name=user_name, score=score, credit=credit, contestants=contestants, penalties=penalties)
    else:
        flash("Please login first")
        return redirect(url_for("login"))


@app.route('/score_board', methods=['GET'])
def score_board():
    if session.get('penalties_performed'):
        contestants = users_scores.query.order_by(users_scores.score.desc()).all()
        return render_template("scoreboard.html", contestants=contestants)
    else:
        flash("Nice try !")
        return redirect(url_for("home"))


@app.route('/login', methods=["POST", "GET"])
def login():
    if request.method == "POST":
        session.permanent = True
        user = request.form["user_name"]
        session["user"] = user
        user_data = users_scores.query.filter_by(name=user).first()
        if user_data:
            session["score"] = user_data.score
            session["credit"] = user_data.credit
        else :
            flash(f"No user named {user}")
            return render_template("login.html")
        flash("Succesfully logged in", "info")
        return redirect(url_for("home"))
    else:
        if "user" in session:
            flash("Already logged in", "info")
            return redirect(url_for("home"))
        return render_template("login.html")

@app.route("/logout")
def logout():
    if "user" in session:
        session.pop("user", None)
        session.pop("score", None)
        session.pop("credit", None)
        session.pop('penalties_performed', None)
        flash("Succesfully logged out", "info")
    else :
        flash("No current user to logout", "info")
    return redirect(url_for("login"))


@app.route("/score", methods=["POST", "GET"])
def score():
    if request.method == "POST":
        try:
            data = request.get_json()
            current_user = data["user"]
            score_to_add = int(data["score"])
        except KeyError:
            return "Invalid request format. Make sure to include 'user' and 'score' in the JSON data."
        user_data = users_scores.query.filter_by(name=current_user).first()
        if user_data:
            user_data.score += score_to_add
            db.session.commit()
        else:
            usr = users_scores(current_user, score_to_add, 0)
            db.session.add(usr)
            db.session.commit()
        return "Score successfully added"

    elif request.method == "GET":
        current_user = request.args.get("user")
        user_data = users_scores.query.filter_by(name=current_user).first()
        if user_data:
            return jsonify({"user": current_user, "score": user_data.score, "credit": user_data.credit})
        else:
            return "No user named " + current_user

@app.route("/credit", methods=["POST", "GET"])
def credit():
    if request.method == "POST":
        try:
            data = request.get_json()
            current_user = data["user"]
            credit_to_add = int(data["credit"])
        except KeyError:
            return "Invalid request format. Make sure to include 'user' and 'credit' in the JSON data."
        user_data = users_scores.query.filter_by(name=current_user).first()
        if user_data:
            user_data.credit += credit_to_add
            db.session.commit()
        else:
            usr = users_scores(current_user, 0, credit_to_add)
            db.session.add(usr)
            db.session.commit()
        return "Score successfully added"

    elif request.method == "GET":
        current_user = request.args.get("user")
        user_data = users_scores.query.filter_by(name=current_user).first()
        if user_data:
            return jsonify({"user": current_user, "score": user_data.score, "credit": user_data.credit})
        else:
            return "No user named " + current_user

@app.route("/perform_penalties", methods=["POST", "GET"])
def perform_penalties():
    if "user" in session:
        user_name = session["user"]
        user_data = users_scores.query.filter_by(name=user_name).first()
        if user_data:
            credit = user_data.credit
        else : #normaly never in this case
            credit = 0
    else:
        flash("Please login first")
        return redirect(url_for("login"))

    if request.method == "POST":
        adversary = request.form["adversary"]
        proxy_url = "http://localhost:3000/sendMessage"
        headers = {"Content-Type": "application/json"}

        penalty = request.form["penalty"]
        price = penalties[penalty]
        if credit < price:
            flash("Sorry, you do not have enough credit to be this mean")
            return redirect(url_for("home"))

        match penalty:
            case "See score board":
                session['penalties_performed'] = True
                return redirect(url_for("score_board"))
            case "Kill random navigation tab":
                data = {"message": "killRandomTab 1", "user": adversary}
                return check(requests.post(proxy_url, headers=headers, json=data))
            case "Destroy his navigation page":
                data = {"message": "destroy 1", "user": adversary}
                return check(requests.post(proxy_url, headers=headers, json=data))
            case "Open a new tab":
                data = {"message": "openNewTab https://www.decisionproblem.com/paperclips/", "user": adversary}
                return check(requests.post(proxy_url, headers=headers, json=data))
            case "Refresh his tab":
                data = {"message": "refresh", "user": adversary}
                return check(requests.post(proxy_url, headers=headers, json=data))
            case "Change his current tab":
                data = {"message": "focusFirst", "user": adversary} # TODO : change name here and in the proxy
                return check(requests.post(proxy_url, headers=headers, json=data))
            case _:
                print("Invalid penalty")


    flash("You dum dum")
    return redirect(url_for("home"))

def check(response):
    if response.status_code == 200:
        flash("uhum that wasn't really nice, oh well")
    else:
        flash("That was a fail! \n {}".format(response.status_code))
    return redirect(url_for("home"))


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run()
