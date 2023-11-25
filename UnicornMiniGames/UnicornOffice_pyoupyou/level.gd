extends Node2D
class_name Level

@export var asteroid_direction_variance = 40.0
@export var asteroid_scene: PackedScene
@onready var border_rect = %BorderRect

var screen_width = ProjectSettings.get_setting("display/window/size/viewport_width")
var screen_height = ProjectSettings.get_setting("display/window/size/viewport_height")
var screen_size = Vector2(screen_width, screen_height)
var screen_center = screen_size / 2.0

var spawn_circle_radius = screen_width * 1.2

func spawn_asteroid():
	# Pop asteroid
	var asteroid = asteroid_scene.instantiate()
	add_child(asteroid)
	
	# Define asteroid position
	var angle_from_center = deg_to_rad(randf_range(0.0,360.0))
	var direction_from_center = Vector2.RIGHT.rotated(angle_from_center)
	var point = screen_center + direction_from_center * spawn_circle_radius
	
	var top_left = border_rect.global_position
	var bottom_right = top_left + border_rect.size
	point = point.clamp(top_left, bottom_right)
	asteroid.position = point
	
	# Define asteroid direction
	var direction_to_center = point.direction_to(screen_center)
	var angle_variance = randfn(0.0, deg_to_rad(asteroid_direction_variance))
	asteroid.direction = direction_to_center.rotated(angle_variance)
	
	asteroid.chosenSize = randi_range(0.0, Asteroid.SIZE.size()-1)
	asteroid.destroyed.connect(_on_asteroid_destroyed.bind(asteroid))


func _input(event):
	if event.is_action_pressed("spawn"):
		spawn_asteroid()

func _on_asteroid_destroyed(asteroid):
	pass

func _on_spawn_timer_timeout():
	spawn_asteroid()
	

func _on_fire_timer_timeout():
	if Input.is_action_pressed("fire"):
		var fire = InputEventAction.new()
		fire.action = "fire"
		fire.pressed = true
		Input.parse_input_event(fire)
