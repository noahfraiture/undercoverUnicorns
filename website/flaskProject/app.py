from flask import Flask, redirect, url_for, render_template, request, session, flash
from datetime import timedelta
#import sqlalchemy

app = Flask(__name__)
app.secret_key = "IDontKnowWhatKindOfKeyToPut"
app.permanent_session_lifetime = timedelta(days=1)

@app.route('/')
def home():
    return "Hello and welcom to the office olympics !"

@app.route('/score_board')
def score_board():
    contestants = {"Noah": 1, "Bryce": 5}
    contestants = sorted(contestants.items(), key=lambda x: x[1], reverse=True)
    return render_template("scoreboard.html", contestants=contestants)

@app.route('/login', methods=["POST", "GET"])
def login():
    if request.method == "POST" :
        session.permanent = True
        user = request.form["user_name"]
        session["user"] = user
        flash("Succesfully logged in", "info")
        return redirect(url_for("user"))
    else :
        if "user" in session:
            flash("Already logged in", "info")
            return redirect(url_for("user"))
        return render_template("login.html")

@app.route("/user", methods=["POST", "GET"])
def user():
    email = None
    if "user" in session:
        user = session["user"]
        if request.method == "POST":
            email = request.form["email"]
            session["email"] = email
        else :
            if "email" in session :
                email = session["email"]
        return render_template("user.html", email=email)
    else :
        return render_template("login.html")

@app.route("/logout")
def logout():
    if "user" in session:
        session.pop("user", None)
        session.pop("email", None)
        flash("Succesfully logged out", "info")
    return redirect(url_for("login"))


if __name__ == '__main__':
    app.run()
