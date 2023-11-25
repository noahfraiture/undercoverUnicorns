extends CharacterBody2D
class_name Player

# Variables
var speed : float = 0.0
var max_speed : float = 400.0

var last_direction := Vector2.ZERO
var direction := Vector2.ZERO

@export_range(0.0,1.0) var lerp_factor = 0.1
@export_range(0.0,1.0) var lerp_angle_factor = 0.1

# Signals
@export var projectile_scene : PackedScene
signal projectile_fire(projectile)
signal destroyed

# Fonctions
func _physics_process(delta):
	# Move the ship
	if (direction == Vector2.ZERO):
		speed = lerp(speed, 0.0, lerp_factor)
	else:
		speed = lerp(speed, max_speed, lerp_factor)
	
	velocity = last_direction * speed
	move_and_slide()

	# rotate the ship toward the mouse
	var mouse_pos = get_global_mouse_position()
	var angle = global_position.angle_to_point(mouse_pos)
	rotation = lerp_angle(rotation, angle, lerp_angle_factor)
	

func _input(event):
	direction = Input.get_vector("left", "right", "up", "down")
	if direction != Vector2.ZERO:
		last_direction = direction
		
	if event.is_action_pressed("fire"):
		var projectile = projectile_scene.instantiate()
		projectile.transform = global_transform # Projectile à la position/rotation/skew du vaisseau
		
		projectile_fire.emit(projectile)

func destroy():
	destroyed.emit()
	queue_free()



