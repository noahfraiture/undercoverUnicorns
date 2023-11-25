extends Area2D
class_name Obstacles

func _on_body_entered(body):
	print(body)
	if body is Asteroid:
		body.destroy()
	if body is Projectile:
		body.destroy()
