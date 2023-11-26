from flask import Flask, redirect, url_for, render_template, request, session, flash, jsonify
from datetime import timedelta
from flask_sqlalchemy import SQLAlchemy
import requests
import random
from apscheduler.schedulers.background import BackgroundScheduler


app = Flask(__name__, static_url_path='/static', static_folder='static')
app.secret_key = "IDontKnowWhatKindOfKeyToPut"
app.permanent_session_lifetime = timedelta(days=1)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///usersscores.sqlite3'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] =False
db = SQLAlchemy(app)

penalties = {
    "Get half his credit": 200, 
    "See score board": 20,
    "VsCode : Keep your eyes open": 100,
    "VsCode : Inputs block box": 35,
    "VsCode : Move cursor randomly":40,
    "VsCode : Push commit": 150,
    "Chromium : Kill random navigation tab": 60,
    "Chromium : Refresh his tab" : 25,
    "Chromium : Destroy his navigation page": 40,
    "Chromium : Change his current tab": 35,
    "Chromium : Open a SUPER tab": 20
}

class users_scores(db.Model):
    _id = db.Column("id", db.Integer, primary_key=True)
    name = db.Column("name", db.String(100))
    score = db.Column("score", db.Integer)
    credit = db.Column("credit", db.Integer)
    team = db.Column("team", db.String(100))

    def __init__(self, name, score, credit, team):
        self.name = name
        self.score = score
        self.credit = credit
        self.team = team

class teams_scores(db.Model):
    _id = db.Column("id", db.Integer, primary_key=True)
    team_name = db.Column("team_name", db.String(100))
    team_score = db.Column("team_score", db.Integer)

    def __init__(self, team_name, team_score):
        self.team_name = team_name
        self.team_score = team_score

class new_scores(db.Model):
    _id = db.Column("id", db.Integer, primary_key=True)
    name = db.Column("name", db.String(100))
    team = db.Column("team", db.String(100))
    score = db.Column("score", db.Integer)
    best_score = db.Column("best_score", db.Integer)
    times_play = db.Column("times_play", db.Integer)

    def __init__(self, name, team, score, best_score, times_play):
        self.name = name
        self.team = team
        self.score = score
        self.best_score = best_score
        self.times_play = times_play


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
        teams = teams_scores.query.all()
        return render_template("home.html", user_name=user_name, score=score, credit=credit, contestants=contestants, teams=teams, penalties=penalties, connected="user" in session)
    else:
        flash("Please login first")
        return redirect(url_for("login"))


@app.route('/secret_score_board', methods=['GET'])
def secret_score_board():
    if session.get('penalties_performed'):
        contestants = users_scores.query.order_by(users_scores.score.desc()).all()
        return render_template("secret_scoreboard.html", contestants=contestants, connected="user" in session)
    else:
        flash("Nice try !")
        return redirect(url_for("home"))

@app.route('/team_scoreboard')
def team_scoreboard():
    teams = teams_scores.query.all()
    return render_template('teams_scoreboard.html', teams=teams, connected="user" in session)


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
            return render_template("login.html", connected="user" in session)
        flash("Succesfully logged in", "info")
        return redirect(url_for("home"))
    else:
        if "user" in session:
            flash("Already logged in", "info")
            return redirect(url_for("home"))
        return render_template("login.html", connected="user" in session)

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

@app.route('/team_distribution')
def team_distribution():
    if "user" in session:
        contestants = users_scores.query.all()
        teams = teams_scores.query.all()
        user_teams = {}
        for user in contestants:
            if user.team not in user_teams:
                user_teams[user.team] = []
            user_teams[user.team].append(user)
        return render_template("teams.html", user_teams=user_teams, teams=teams, connected="user" in session)
    else:
        flash("Please login first")
        return redirect(url_for("login"))

@app.route('/penalty_prices')
def prices():
    sorted_penalties = dict(sorted(penalties.items(), key=lambda item: item[1]))
    return render_template('prices.html', penalties=sorted_penalties, connected="user" in session)


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
            team_data = teams_scores.query.filter_by(team_name=user_data.team).first()
            if team_data:
                team_data.team_score += score_to_add
                db.session.commit()
            return "Score successfully added"
        else:
            return "No user named " + current_user

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
            team_data = teams_scores.query.filter_by(team_name=user_data.team).first()
            if team_data:
                team_data.team_score += credit_to_add
                db.session.commit()
            return "Score successfully added"
        else:
            return "No user named " + current_user

    elif request.method == "GET":
        current_user = request.args.get("user")
        user_data = users_scores.query.filter_by(name=current_user).first()
        if user_data:
            return jsonify({"user": current_user, "score": user_data.score, "credit": user_data.credit, "team": user_data.team})
        else:
            return "No user named " + current_user

@app.route("/perform_penalties", methods=["POST", "GET"])
def perform_penalties():
    user_data = None
    adversary_data = None
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
        adversary = None
        if request.form["team"] :
            team = request.form["team"]
            users = users_scores.query.filter_by(team=team).all()
            if users:
                adversary_data = random.choice(users)
                adversary = adversary_data.name
            else :
                flash("No one belong to this team")
                return redirect(url_for("home"))
        else :
            adversary = request.form["adversary"]
            adversary_data = users_scores.query.filter_by(name=adversary).first()

        proxy_url = "http://localhost:3000/sendMessage/"
        headers = {"Content-Type": "application/json"}

        print(request.form)
        penalty = request.form["penalty"]
        price = penalties[penalty]
        if credit < price:
            flash("Sorry, you do not have enough credit")
            return redirect(url_for("home"))
        else:
            user_data.credit -= price
            db.session.commit()

        match penalty:

            # General
            case "Get half his credit":
                user_data.credit  += adversary_data.credit // 2
                db.session.commit()
                adversary_data.credit = adversary_data.credit // 2
                db.session.commit()
                return redirect(url_for("home"))
            case "See score board":
                session['penalties_performed'] = True
                return redirect(url_for("secret_score_board"))

            # VSCode
            case "VsCode : Keep your eyes open":
                data = {"message": "camera", "user": adversary}
                return check(requests.post(proxy_url + "vscode", headers=headers, json=data))
            case "VsCode : Inputs block box":
                data = {"message": "block", "user": adversary}
                return check(requests.post(proxy_url + "vscode", headers=headers, json=data))
            case "VsCode : Move cursor randomly":
                data = {"message": "move", "user": adversary}
                return check(requests.post(proxy_url + "vscode", headers=headers, json=data))
            case "VsCode : Push commit":
                data = {"message": "git", "user": adversary}
                return check(requests.post(proxy_url + "vscode", headers=headers, json=data))

            # Chrome
            case "Chromium : Kill random navigation tab":
                data = {"message": "killRandomTab 1", "user": adversary}
                return check(requests.post(proxy_url + "chrome", headers=headers, json=data))
            case "Chromium : Refresh his tab":
                data = {"message": "refreshTab", "user": adversary}
                return check(requests.post(proxy_url + "chrome", headers=headers, json=data))
            case "Chromium : Destroy his navigation page":
                data = {"message": "destroy 1", "user": adversary}
                return check(requests.post(proxy_url + "chrome", headers=headers, json=data))
            case "Chromium : Change his current tab":
                data = {"message": "changeTab", "user": adversary} # TODO : change name here and in the proxy
                return check(requests.post(proxy_url + "chrome", headers=headers, json=data))
            case "Chromium : Open a SUPER tab":
                data = {"message": "openNewTab https://www.decisionproblem.com/paperclips/", "user": adversary}
                return check(requests.post(proxy_url + "chrome", headers=headers, json=data))

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

def creat_user(users):
    for user, team in users :
        score = random.randint(0, 250)
        credit = random.randint(0, 250)
        usr = users_scores(user, score, credit, team)
        db.session.add(usr)
        db.session.commit()

        team_data = teams_scores.query.filter_by(team_name=team).first()
        if team_data:
            team_data.team_score += score
            db.session.commit()
        else:
            tm = teams_scores(team, score)
            db.session.add(tm)
            db.session.commit()

@app.after_request
def add_header(response):
    response.headers['Cross-Origin-Opener-Policy'] = 'same-origin'
    response.headers['Cross-Origin-Embedder-Policy'] = 'require-corp'
    return response

@app.route('/pyoupyou')
def pyoupyou():
    if "user" in session :
        game_user = session["user"]
        game_user_data = new_scores.query.filter_by(name=game_user).first()
        if game_user_data:
            if  game_user_data.times_play >= 5:
                flash("Stop playing, go back to work NOW")
                return redirect(url_for("home"))
    return render_template("game_template.html", connected="user" in session)

@app.route('/get_score', methods=['GET'])
def get_score():
    game_user = session["user"]
    game_user_data = new_scores.query.filter_by(name=game_user).first()
    if game_user_data:
        print("sending score:", game_user_data.best_score)
        return jsonify({"result": game_user_data.best_score})
    return None

@app.route('/receive_score', methods=['POST'])
def receive_score():
    data = request.get_json()
    if 'score' in data:
        game_score = data['score']
        print("Received score:", game_score)
        game_user = session["user"]
        game_user_data = new_scores.query.filter_by(name=game_user).first()
        if game_user_data :
            if game_user_data.score < game_score :
                game_user_data.score = game_score
                db.session.commit()
            if game_user_data.best_score < game_score :
                game_user_data.best_score = game_score
                db.session.commit()
            game_user_data.times_play += 1
            db.session.commit()
        else :
            user_team = users_scores.query.filter_by(name=game_user).first().team
            nw_scr = new_scores(game_user, user_team, game_score, game_score, 1)
            db.session.add(nw_scr)
            db.session.commit()
        return "Score received successfully!", 200
    else:
        return "Score data not found in request", 400

@app.route('/add_credit', methods=['POST'])
def add_score():
    with app.app_context():
        contestants = new_scores.query.all()
        for contestant in contestants :
            user = contestant.name
            credit_to_add = contestant.score
            contestant.score = 0
            db.session.commit()
            contestant.times_play = 0
            db.session.commit()
            user_data = users_scores.query.filter_by(name=user).first()
            if user_data:
                user_data.credit += credit_to_add
                db.session.commit()
                return "Score successfully added"
            else:
                return "No user named " + current_user

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        # add the score once a day
        scheduler = BackgroundScheduler()
        scheduler.start()
        scheduler.add_job(add_score, 'interval', days=1)
        #scheduler.add_job(add_score, 'interval', seconds=10)
    app.run()
