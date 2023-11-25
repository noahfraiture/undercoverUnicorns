@tool
extends Area2D
class_name Asteroid

# BOOM
var Boom1 = preload("res://sprites/BOOM/Boom1.png")
var Boom2 = preload("res://sprites/BOOM/Boom2.png")
var Boom3 = preload("res://sprites/BOOM/Boom3.png")
var Boom4 = preload("res://sprites/BOOM/Boom4.png")
var Boom5 = preload("res://sprites/BOOM/Boom5.png")
var Boom6 = preload("res://sprites/BOOM/Boom6.png")
var Boom7 = preload("res://sprites/BOOM/Boom7.png")
var Boom8 = preload("res://sprites/BOOM/Boom8.png")

# Variables
signal destroyed
var is_destroyed = 0.0 # 0.0 pour false, 1.0 pour projectile, 2.0 pour obstacle

var direction = Vector2.RIGHT
@export var speed = 200.0
#@export var torque = 50.0
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
	
	#rotation_degrees += torque*delta

func _on_body_entered(body):
	if body is Player:
		body.destroy()

func destroy():
	speed = 0
	collision_shape_2d.disabled = true
	destroyed.emit()
	
	if is_destroyed == 2.0:
		self.scale = self.scale * 0.4
	else: 
		self.scale = self.scale * 0.75
	sprite_2d.texture = Boom1
	await get_tree().create_timer(0.07).timeout
	sprite_2d.texture = Boom2
	await get_tree().create_timer(0.07).timeout
	sprite_2d.texture = Boom3
	await get_tree().create_timer(0.07).timeout
	sprite_2d.texture = Boom4
	await get_tree().create_timer(0.07).timeout
	sprite_2d.texture = Boom5
	await get_tree().create_timer(0.07).timeout
	sprite_2d.texture = Boom6
	await get_tree().create_timer(0.07).timeout
	sprite_2d.texture = Boom7
	await get_tree().create_timer(0.07).timeout
	sprite_2d.texture = Boom8
	await get_tree().create_timer(0.07).timeout
	queue_free()
