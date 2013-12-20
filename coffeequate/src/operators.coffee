define ["nodes"], (nodes) ->

	# Defines operator nodes of the expression tree.

	Add: class extends nodes.RoseNode
		constructor: ->
			super("+")

	Mul: class extends nodes.RoseNode
		constructor: ->
			super("*")

	Pow: class extends nodes.BinaryNode
		constructor: ->
			super("**")