extends Area2D
class_name Obstacles

func _on_area_entered(area):
	if area is Asteroid:
		if area.is_destroyed == 0:
			area.is_destroyed = 2.0
			area.destroy()
	if area is Projectile:
		area.destroy()
