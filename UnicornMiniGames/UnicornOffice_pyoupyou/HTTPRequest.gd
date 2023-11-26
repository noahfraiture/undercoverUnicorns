extends HTTPRequest

var json = JSON.new()
var ScoreLabel

func _ready():
	ScoreLabel = get_parent().get_parent().get_node("ScoreLabel")
	connect("request_completed", _on_request_completed)
	request("http://127.0.0.1:5000/get_score", [], HTTPClient.METHOD_GET)


func _on_request_completed(result, response_code, headers, body):
	if response_code == 200:
		var strdata = body.get_string_from_utf8()
		var json_parse_result = json.parse(strdata)
		if json_parse_result == OK:
			var data_received = json.data
			print(data_received)
			ScoreLabel.best = max(data_received.result, ScoreLabel.best)
		else:
			get_parent().ready_to_close.emit()
	else:
		print("Failed to. Response code:", response_code)
