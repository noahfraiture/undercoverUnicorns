extends Node2D
class_name Level

@export var asteroid_direction_variance = .0
@export var asteroid_scene: PackedScene
@onready var border_rect = %BorderRect

var screen_width = ProjectSettings.get_setting("display/window/size/viewport_width")
var screen_height = ProjectSettings.get_setting("display/window/size/viewport_height")
var screen_size = Vector2(screen_width, screen_height)
var screen_center = screen_size / 2.0

var spawn_circle_radius = screen_width * 0.6

func spawn_asteroid():
	var top_left = border_rect.global_position
	var bottom_right = top_left + border_rect.size

	# Pop asteroid
	var asteroid = asteroid_scene.instantiate()
	add_child(asteroid)
	
	# Define asteroid position (avoid obstacles !)
	var raw_angle = randf_range(0.0,360.0)
	while(raw_angle > 200 and raw_angle < 265) || (raw_angle > 300 and raw_angle < 325):
		raw_angle = randf_range(0.0,360.0)
	var angle_from_center = deg_to_rad(raw_angle)
	
	var direction_from_center = Vector2.RIGHT.rotated(angle_from_center)
	var point = screen_center + direction_from_center * spawn_circle_radius
	
	point = point.clamp(top_left, bottom_right)
	asteroid.position = point
	
	# Define asteroid direction
	var direction_to_center = point.direction_to($Player.global_position)
	var angle_variance = randfn(0.0, deg_to_rad(asteroid_direction_variance))
	asteroid.direction = direction_to_center.rotated(angle_variance)
	
	asteroid.chosenSize = randi_range(0.0, Asteroid.SIZE.size()-1)
	if asteroid.chosenSize == 0:
		asteroid.scale = Vector2(1.5, 1.5)
		asteroid.speed = 170.0
	if asteroid.chosenSize == 1:
		asteroid.scale = Vector2(1.8, 1.8)
		asteroid.speed = 190.0
	asteroid.destroyed.connect($ScoreLabel._on_asteroid_destroyed.bind(asteroid))


func _input(event):
	if event.is_action_pressed("spawn"):
		spawn_asteroid()

func _on_spawn_timer_timeout():
	spawn_asteroid()


func _on_player_destroyed():
	print("Good game : score %s" % $ScoreLabel.score)
	get_tree().reload_current_scene() # Restart game

