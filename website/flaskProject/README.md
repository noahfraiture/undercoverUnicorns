requierment :

* pip install flask

* pip install Flask-SQLAlchemy

* (pip install sqlalchemy) jsp si besoin

curl http://127.0.0.1:5000/score?user=Noah

Invoke-WebRequest -Uri 'http://127.0.0.1:5000/score' -Method POST -Body '{"user": "Noah", "score": 5}' -ContentType 'application/json'

Invoke-WebRequest -Uri 'http://127.0.0.1:5000/credit' -Method POST -Body '{"user": "Delphine", "credit": 100}' -ContentType 'application/json'

