extends CharacterBody2D

# variables
@onready var animated_sprite = $PlayerSprite
@export_range(0.0,1.0) var lerp_factor = 0.2
@onready var sprite_2d = $PlayerSprite

var speed = 0.0
var max_speed = 150.0

var direction = Vector2.ZERO
var last_direction = Vector2.ZERO
var last_anim = "right"
var anim_choice = "walkR"


func _physics_process(delta):	
	if Input.is_action_pressed("up"):
		direction.y = -1
		anim_choice = "walkU"
	if Input.is_action_pressed("down"):
		direction.y = 1
		anim_choice = "walkD"
	if Input.is_action_pressed("left"):
		direction.x = -1
		anim_choice = "walkL"
	if Input.is_action_pressed("right"):
		direction.x = 1
		anim_choice = "walkR"
	
	if (direction.x == 0.0 and direction.y == 0.0):
		speed = lerp(speed, 0.0, lerp_factor)
		
		if last_direction.x == 1 : last_anim = "right"
		elif last_direction.x == -1 : last_anim = "left"
		elif last_direction.y == 1 : last_anim = "down"
		elif last_direction.y == -1 : last_anim = "up"
		sprite_2d.animation = last_anim
	else:
		sprite_2d.animation = anim_choice
		if (direction.x != 0.0 and direction.y != 0.0):
			speed = lerp(speed, max_speed*1.5, lerp_factor)
		else:
			speed = lerp(speed, max_speed, lerp_factor)
	
	velocity = last_direction * speed
	move_and_slide()

func _input(event):
	direction = Input.get_vector("left", "right", "up", "down")
	if direction != Vector2.ZERO:
		last_direction = direction
