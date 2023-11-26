extends Node2D

@onready var heartsContainer = $CanvasLayer/HeartsContainer
@onready var thePlayer = $Player

# Called when the node enters the scene tree for the first time.
func _ready():
	heartsContainer.set_max_hearts(thePlayer.MAX_HEALTH)
	thePlayer.healthChanged.connect(heartsContainer.updateHearts)

# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta):
	pass
