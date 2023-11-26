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
@onready var sprite_2d = $Sprite2D
@export var projectile_scene : PackedScene
signal projectile_fire(projectile)
signal destroyed

var mouse_pos = get_global_mouse_position()
var projectile_deg_rotation = rad_to_deg(global_position.angle_to_point(mouse_pos) - rotation)

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
	# var mouse_pos = get_global_mouse_position()
	# var angle = global_position.angle_to_point(mouse_pos)
	# rotation = lerp_angle(rotation, angle, lerp_angle_factor)
	
	# Change sprite according to mouse
	mouse_pos = get_global_mouse_position()
	projectile_deg_rotation = rad_to_deg(global_position.angle_to_point(mouse_pos) - rotation)
	
	if (abs(projectile_deg_rotation) < 45) || (abs(projectile_deg_rotation) > 135):
		sprite_2d.animation = "default"
	elif projectile_deg_rotation < 0:
		sprite_2d.animation = "up"
	else:
		sprite_2d.animation = "down"
	
	sprite_2d.flip_h = abs(projectile_deg_rotation) > 90

func _input(event):
	direction = Input.get_vector("left", "right", "up", "down")
	if direction != Vector2.ZERO:
		last_direction = direction
		
	if event.is_action_pressed("fire"):
		var projectile = projectile_scene.instantiate()
		projectile.position = global_position
		projectile.rotation = rotation + deg_to_rad(projectile_deg_rotation)
		projectile.direction = Vector2.RIGHT.rotated(projectile.rotation)

		projectile_fire.emit(projectile)
		$shoot.play()
		$FireTimer.start()


signal ready_to_close
func _on_fire_timer_timeout():
	if Input.is_action_pressed("fire"):
		var fire = InputEventAction.new()
		fire.action = "fire"
		fire.pressed = true
		Input.parse_input_event(fire)

func destroy():
	var ScoreLabel = get_parent().get_node("ScoreLabel")
	var headers = ["Content-Type: application/json"]
	var json_string = "{\"score\": %s}" % ScoreLabel.score
	$HTTPRequest.request("http://127.0.0.1:5000/receive_score", headers, HTTPClient.METHOD_POST, json_string)

	# get_parent().httsend = true
	await ready_to_close
	print("destroy")
	destroyed.emit()
	queue_free()



