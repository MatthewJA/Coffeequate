define ["Node"], (Node) ->

	# Defines operator nodes of the expression tree.

	add: class extends Node
		initialise: ->
			super("+")

	mul: class extends Node
		initialise: ->
			super("*")

	pow: class extends Node
		initialise: ->
			super("**")