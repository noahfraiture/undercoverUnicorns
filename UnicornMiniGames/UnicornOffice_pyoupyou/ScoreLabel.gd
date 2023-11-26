extends Label

var score = 0
var best = 0

func _on_asteroid_destroyed(asteroid):
	if(asteroid.is_destroyed == 1):
		score += 1
	best = max(score, best)
	text = "Score: %d\nbest: %d" % [score, best]

