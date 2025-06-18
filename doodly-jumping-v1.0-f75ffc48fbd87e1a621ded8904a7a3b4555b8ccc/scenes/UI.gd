extends Control

# HUD
var blue_label
var height_label

# Title
var play
var quit
var title
var title_selected

# Game Over
var over
var to_title
var restart
var over_selected

# Game
var game

func _ready():
	get_node("/root/game_state").connect("blue_kills_changed", self, "_on_blue_kills_changed")
	blue_label = $Margin/HUD/BlueKills
	height_label = $Margin/HUD/Height
	
	play = $TitleMargin/VBox/Choices/VBox/Play
	quit = $TitleMargin/VBox/Choices/VBox/Quit
	title = $TitleMargin
	title_selected = play
	
	game = get_node("../../..")
	get_tree().paused = true
	
	restart = $OverMargin/VBox/Choices/VBox/Restart
	to_title = $OverMargin/VBox/Choices/VBox/Margin/ToTitle
	over = $OverMargin
	over_selected = restart
	
func game_over():
	get_tree().paused = true
	over.show()
	
func _input(evt):
	if title.visible:
		if evt.is_action_released("ui_up") or evt.is_action_released("ui_down"):
			if title_selected == play:
				title_selected = quit
				play.text = "Play"
				quit.text = ">Quit"
			else:
				title_selected = play
				play.text = ">Play"
				quit.text = "Quit"
		if evt.is_action_released("ui_accept"):
			if(title_selected == play):
				get_tree().paused = false
				title.hide()
			else:
				get_tree().quit()
			title_selected = play
			play.text = ">Play"
			quit.text = "Quit"
	elif over.visible:
		if evt.is_action_released("ui_up") or evt.is_action_released("ui_down"):
			if over_selected == restart:
				over_selected = to_title
				restart.text = "Restart"
				to_title.text = ">To Title"
			else:
				over_selected = restart
				restart.text = ">Restart"
				to_title.text = "To Title"
		if evt.is_action_released("ui_accept"):
			over.hide()
			game.reset()
			_on_blue_kills_changed(0)
			if(over_selected == restart):
				get_tree().paused = false
			else:
				title.show()
			over_selected = restart
			restart.text = ">Restart"
			to_title.text = "To Title"
	
func _process(delta):
	height_label.text = String(get_node("/root/game_state").height)
	
func _on_blue_kills_changed(kills):
	blue_label.text = String(kills)

func _on_Player_died():
	game_over()
