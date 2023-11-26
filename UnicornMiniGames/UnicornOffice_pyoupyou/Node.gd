extends Node

var http_request
var json = JSON.new()
var score = 150  # Replace this with the score you want to send

func _ready():
	# Create an HTTPRequest instance dynamically
	http_request = HTTPRequest.new()
	http_request.set_process(false)  # Disable automatic processing
	add_child(http_request)

	# ... (other setup code)

func send_score():
	if http_request:
		var data = {"score": score}
		var body = json.print(data)
		http_request.request("http://127.0.0.1:5000/receive_score", [], HTTPClient.METHOD_POST, body)

func activate_request():
	http_request.set_process(true)  # Manually activate the HTTPRequest node
	send_score()
