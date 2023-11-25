from flask import Flask, redirect, url_for, render_template, request, session, flash, jsonify
from datetime import timedelta
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.secret_key = "IDontKnowWhatKindOfKeyToPut"
app.permanent_session_lifetime = timedelta(days=1)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///usersscores.sqlite3'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] =False
db = SQLAlchemy(app)

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
        penalties = ["Get half his credit", "See score board", "Inputs block box", "Move cursor randomly", "Push commit",
                     "Kill random navigation tab", "Refresh his tab", "Destroy his navigation page",
                     "Change his current tab"]
        contestants = users_scores.query.all()
        return render_template("home.html", contestants=contestants, penalties=penalties)
    else:
        flash("Please login first")
        return redirect(url_for("login"))


@app.route('/score_board')
def score_board():
    contestants = users_scores.query.order_by(users_scores.score.desc()).all()
    return render_template("scoreboard.html", contestants=contestants)


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


@app.route("/user")
def user():
    if "user" in session:
        user_name = session["user"]
        user_data = users_scores.query.filter_by(name=user_name).first()
        if user_data:
            score = user_data.score
            credit = user_data.credit
        else:
            score = 0
            credits = 0

        return render_template("user.html", user_name=user_name, score=score, credit=credit)
    else:
        flash("Please login first")
        return redirect(url_for("login"))



@app.route("/logout")
def logout():
    if "user" in session:
        session.pop("user", None)
        session.pop("score", None)
        session.pop("credit", None)
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
    if request.method == "POST":
        return redirect(url_for("score_board"))


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run()
