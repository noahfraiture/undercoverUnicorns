extends Label

var score = 0

func _on_asteroid_destroyed(asteroid):
	if(asteroid.is_destroyed == 1):
		score += 1
	text = "Score: %s" % score

