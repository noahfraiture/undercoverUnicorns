extends Node2D
class_name Projectile

@export var speed = 400.0

@onready var direction := Vector2.RIGHT.rotated(rotation) # onready = quand ajouté dans l'arbre

# Called every frame. 'delta' is the elapsed time since the previous frame.
func _physics_process(delta):
	var velocity = direction * speed * delta
	global_position += velocity

func _on_area_entered(area):
	if area is Asteroid:
		area.destroy()

func destroy():
	queue_free()
