define ["Node"], (Node) ->

	# Defines operator nodes of the expression tree.

	Add: class extends Node
		constructor: ->
			super("+")

	Mul: class extends Node
		constructor: ->
			super("*")

	Pow: class extends Node
		constructor: ->
			super("**")