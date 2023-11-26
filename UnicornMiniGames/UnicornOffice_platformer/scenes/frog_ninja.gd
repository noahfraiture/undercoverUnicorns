extends CharacterBody2D
class_name FrogNinja

@onready var death_timer = $DeathTimer

# Variables
const JUMP_VELOCITY = -1200.0
const SPEED = 300.0
var close_limit = 10
var detection_distance = 0.0
var temp

# Control variables
var start_position
var destinationX
var hit = 0
var dead = false

# Get the gravity from the project settings to be synced with RigidBody nodes.
var gravity = ProjectSettings.get_setting("physics/2d/default_gravity")
@onready var Player = get_parent().get_node("Player")
@onready var sprite_2d = $AnimatedSprite2D

func init_and_reset():
	# Initialisation
	if detection_distance == 0.0 || start_position == Vector2.ZERO:
		detection_distance = abs(Player.global_position.x - global_position.x) / 3.0
		start_position = global_position
		destinationX = global_position.x - 3*detection_distance/2.5
	
	# Eviter les glitches à l'arrivée : reset
	if (abs(destinationX - global_position.x) < close_limit):
		global_position.x = destinationX
		
		temp = destinationX
		destinationX = start_position.x
		start_position.x = temp

func move_and_anim(delta):
	# Add the gravity and animation
	if not is_on_floor():
		velocity.y += gravity * delta
		sprite_2d.animation = "jumping"
	else:
		sprite_2d.animation = "default"
		# Jump
		if randi_range(0,60) == 1 and is_on_floor():
			velocity.y = JUMP_VELOCITY
			sprite_2d.animation = "jumping"
	
	velocity.x = sign(destinationX - global_position.x) * SPEED
	sprite_2d.flip_h = velocity.x < 0
	move_and_slide()


func _physics_process(delta):
	if dead:
		sprite_2d.animation = "hit"
	elif hit > 0:
		sprite_2d.animation = "hit"
		velocity = Vector2.ZERO
		if hit < 30 && not is_on_floor():
			velocity.y += gravity * delta
		hit -= 1
	else:		
		init_and_reset()
		move_and_anim(delta)


func _on_real_hit_box_area_entered(area):
	if area != $Hitbox:
		print("GOO")
		dead = true
		death_timer.start()
		await death_timer.timeout
		queue_free()
