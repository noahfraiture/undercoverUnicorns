extends HBoxContainer

@onready var HeartGUIClass = preload("res://scenes/heart_gui.tscn")
var CURRENT_HEALTH

# Called when the node enters the scene tree for the first time.
func _ready():
	pass # Replace with function body.

# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta):
	pass

func set_max_hearts(max):
	CURRENT_HEALTH = max
	for i in range(max):
		var heart = HeartGUIClass.instantiate()
		add_child(heart)

func updateHearts():
	var hearts = get_children()
	for i in range(CURRENT_HEALTH):
		hearts[i].update(true)
	for i in range(CURRENT_HEALTH, hearts.size()):
		hearts[i].update(false)

func _on_player_health_changed():
	print("coucou")
	CURRENT_HEALTH -= 1
	var hearts = get_children()
	for i in range(CURRENT_HEALTH):
		hearts[i].update(true)
	for i in range(CURRENT_HEALTH, hearts.size()):
		hearts[i].update(false)
