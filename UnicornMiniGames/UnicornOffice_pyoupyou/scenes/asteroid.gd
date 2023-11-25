@tool
extends Area2D
class_name Asteroid

# Variables
signal destroyed
var direction = Vector2.RIGHT
@export var speed = 200.0
@export var torque = 50.0
@onready var sprite_2d = $Sprite2D
@onready var collision_shape_2d = $CollisionShape2D

# ===== Size management ===== 
enum SIZE { SMALL, MEDIUM, BIG }
@export var AsteroidSize_array : Array[AsteroidSize]

@export var chosenSize : SIZE = SIZE.BIG:
	set(value):
		if value != chosenSize :
			chosenSize = value
			size_changed.emit()

signal size_changed

func _ready():
	if Engine.is_editor_hint():
		set_physics_process(false)
	size_changed.connect(update_size)

func update_size():
	var asteroid_size = AsteroidSize_array[chosenSize]
	sprite_2d.texture = asteroid_size.texture
	collision_shape_2d.shape = asteroid_size.shape

# ===== Physics =====
func _physics_process(delta):
	var velocity = speed * direction * delta
	global_position += velocity
	
	rotation_degrees += torque*delta

func _on_body_entered(body):
	if body is Player:
		body.destroy()

func destroy():
	destroyed.emit()
	queue_free()
