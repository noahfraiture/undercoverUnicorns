extends Timer


# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta):
	self.wait_time = self.wait_time * 0.9995
