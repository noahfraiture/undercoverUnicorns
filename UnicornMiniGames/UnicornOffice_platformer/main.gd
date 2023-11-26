extends Node2D

@onready var heartsContainer = $CanvasLayer/HeartsContainer
@onready var thePlayer = $Player
var time = 0.0

# Called when the node enters the scene tree for the first time.
func _ready():
	heartsContainer.set_max_hearts(thePlayer.MAX_HEALTH)
	thePlayer.healthChanged.connect(heartsContainer.updateHearts)

# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta):
	time += 0.05



func _on_victory_area_entered(area):
	print("Victory")
	pass # Envoyer time !!
