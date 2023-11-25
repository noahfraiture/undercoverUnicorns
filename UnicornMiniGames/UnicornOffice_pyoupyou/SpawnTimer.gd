extends Timer

var max_wait_time = 0.0
var min_wait_time = 0.1
var iter_before_min = 1000
var inc = 0

# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta):
	if max_wait_time == 0.0:
		max_wait_time = self.wait_time
	self.wait_time = min_wait_time + (max_wait_time - min_wait_time)*sqrt(min(self.wait_time, 0.9)
