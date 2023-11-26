requierment :

* pip install flask

* pip install Flask-SQLAlchemy

* (pip install sqlalchemy) jsp si besoin

* pip install apscheduler


curl http://127.0.0.1:5000/score?user=Noah

Invoke-WebRequest -Uri 'http://127.0.0.1:5000/score' -Method POST -Body '{"user": "Noah", "score": 5}' -ContentType 'application/json'

Invoke-WebRequest -Uri 'http://127.0.0.1:5000/credit' -Method POST -Body '{"user": "Delphine", "credit": 100}' -ContentType 'application/json'


users = [
            ("Delphine", "Bosses"),
            ("Noah", "Bosses"),
            ("Bryce", "Bosses"),
            ("Miguel", "Bosses"),
            ("Lola", "Sales"),
            ("Lou", "Sales"),
            ("Vincent", "Sales"),
            ("April", "Sales"),
            ("Jean-Luc", "Sales"),
            ("Victoria", "Dev"),
            ("Pierre", "Dev"),
            ("Nicolas", "Dev"),
            ("Jimmy", "Dev"),
            ("Batist", "Dev"),
            ("Emy", "RH"),
            ("Mathild", "RH"),
            ("Fred", "RH"),
            ("Claire", "RH"),
            ("Simon", "Stagiaire"),
            ("Alex", "Stagiaire"),
            ("Louis", "Stagiaire"),
            ("Dan", "Stagiaire")
        ]
        creat_user(users)