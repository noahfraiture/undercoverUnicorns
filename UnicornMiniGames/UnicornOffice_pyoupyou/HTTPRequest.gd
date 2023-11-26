extends HTTPRequest

var http_request
var json = JSON.new()
var last_score = 0
var time = 0.0
var tnext = 5.0
var ScoreLabel

func _ready():
	ScoreLabel = get_parent().get_node("ScoreLabel")
	connect("request_completed", _on_request_completed)

	#print("sending score %s" % best_score)

	#request("http://127.0.0.1:5000/get_score", [], HTTPClient.METHOD_GET)
	request("http://127.0.0.1:5000/get_score", [], HTTPClient.METHOD_GET)

func send_score():
	var headers = ["Content-Type: application/json"]
	var json_string = "{\"score\": %s}" % ScoreLabel.score  # Create a dictionary to send as JSON
	request("http://127.0.0.1:5000/receive_score", headers, HTTPClient.METHOD_POST, json_string)

func _process(delta):
	time += delta
	if(time > tnext): # and ScoreLabel.score > last_score):
		send_score()
		tnext += 5

func _on_request_completed(result, response_code, headers, body):
	if response_code == 200:
		var strdata = body.get_string_from_utf8()
		var json_parse_result = json.parse(strdata)
		if json_parse_result == OK:
			var data_received = json.data
			ScoreLabel.best = max(data_received.result, ScoreLabel.best)
	else:
		print("Failed to. Response code:", response_code)
