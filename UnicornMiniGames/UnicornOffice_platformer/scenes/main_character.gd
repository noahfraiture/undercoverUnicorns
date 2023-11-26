extends CharacterBody2D
class_name Player

# Ressources
const max_speed = 500.0
const JUMP_VELOCITY = -1024.0
@onready var sprite_2d = $Sprite2D
@onready var collision_shape_2d = $CollisionShape2D
@onready var hitbox = $Hitbox

@onready var hurt_timer = $HurtTimer
@onready var frappe_timer = $FrappeTimer

@onready var animation_player = $AnimationPlayer
@onready var effects = $Effects

# Variables
var last_direction := 0.0
var direction := 0.0
var speed = 0.0
var lerp_factor = 0.2

# Control Variable & signals
@export var MAX_HEALTH = 3
@onready var HEALTH = MAX_HEALTH
var enemyCollisions = []
signal healthChanged

var is_Hurt = false
var attacking = false

# Get the gravity from the project settings to be synced with RigidBody nodes.
var gravity = ProjectSettings.get_setting("physics/2d/default_gravity")

# Functions
func _ready():
	effects.play("RESET")


func _input(event):
	direction = Input.get_axis("left", "right")
	if direction != 0.0:
		last_direction = direction
	
	if Input.is_action_just_pressed("attack"):
		animation_player.play("frapper")
		attacking = true
		frappe_timer.start()
		await frappe_timer.timeout
		animation_player.play("RESET")
		attacking = false

func _physics_process(delta):	
	# Handle Jump.
	if Input.is_action_just_pressed("jump") and is_on_floor():
		velocity.y = JUMP_VELOCITY
	
	# Get the input direction and handle the movement/zdeceleration.
	# As good practice, you should replace UI actions with custom gameplay actions.
	direction = Input.get_axis("left", "right")
	if direction == 0.0:
		speed = lerp(speed, 0.0, lerp_factor)
	else:
		speed = lerp(speed, max_speed, lerp_factor)
	
	# Add the gravity + animation
	if attacking:
		sprite_2d.animation = "attack"
	elif !is_on_floor():
		velocity.y += gravity * delta
		sprite_2d.animation = "jumping"
	else:
		sprite_2d.animation = "default"
	
	velocity.x = last_direction * speed
	move_and_slide()
	
	var isLeft = velocity.x < 0
	sprite_2d.flip_h = isLeft
	
	# Collision with Enemy
	if !is_Hurt:
		for area in hitbox.get_overlapping_areas():
			if area.name == "Hitbox": HurtByEnemy()

func HurtByEnemy():
	HEALTH -= 1
	healthChanged.emit()
	is_Hurt = true
	
	effects.play("Blink")
	hurt_timer.start()
	await hurt_timer.timeout
	effects.play("RESET")
	is_Hurt = false

func _on_hitbox_area_entered(area):
	if !is_Hurt and area.name == "Hitbox":
		enemyCollisions.append(area)

func _on_hitbox_area_exited(area):
	enemyCollisions.erase(area)
