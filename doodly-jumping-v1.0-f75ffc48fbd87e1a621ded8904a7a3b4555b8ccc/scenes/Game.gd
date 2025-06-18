extends Node

var top_platform;
var platform = preload("res://platform/Platform.tscn")
var cam_holder
var camera
var player
var game_state

func _ready():
	cam_holder = $CamHolder
	camera = $CamHolder/Camera2D
	player = $Player
	game_state = get_node("/root/game_state")
	reset()
	
func reset():
	randomize()
	game_state.reset()
	for obj in get_children():
		if not obj.is_in_group("dnd"):
			print(obj.name)
			obj.queue_free()
	cam_holder.position.y = 0
	top_platform = platform.instance()
	top_platform.do_spawn = false
	top_platform.position = Vector2(0,0)
	add_child(top_platform)
	player.position = Vector2(0,0)
	player.movement = Vector2(0,0)
	generate_platforms()

func generate_platforms():
	var top = cam_holder.position.y - player.get_viewport_rect().size.y
	while(top_platform.position.y > top):
		var new_platform = platform.instance()
		var distance = 200
		if top_platform.has_spring:
			distance = 450
		var y_rand = randf() * distance
		new_platform.position.y = top_platform.position.y - y_rand
		new_platform.position.x = randf() * get_viewport().size.x - 0.5 * get_viewport().size.x
		new_platform.position.x = clamp(new_platform.position.x, top_platform.position.x - (distance - y_rand), top_platform.position.x + (distance - y_rand))
		top_platform = new_platform
		add_child(new_platform)

func fix_precision():
	if(cam_holder.position.y < -10000):
		print("Fixing...")
		game_state.num_fixes = game_state.num_fixes + 1
		for obj in get_children():
			if not obj.is_class("ParallaxBackground"):
				obj.translate(Vector2(0, 10000))

func move_camera(delta):
	cam_holder.position.y = min(cam_holder.position.y - 30 * delta, player.position.y)
	camera.align()
	camera.force_update_scroll()

func _process(delta):
	generate_platforms()
	check_player()

func check_player():
	if player.position.y > cam_holder.position.y + 0.5 * get_viewport().size.y:
		$CamHolder/Camera2D/UI.game_over()

func _physics_process(delta):
	fix_precision()
	move_camera(delta)
	game_state.update_height(player.position.y)
