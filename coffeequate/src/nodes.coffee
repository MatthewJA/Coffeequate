define ->

	# Basic nodes for the expression tree.

	Node: class
		# A basic node for the expression tree.
		# All nodes inherit from this.
		constructor: (@label) ->
			@children = []

		getChildren: ->
			# Return an array of children.
			@children

	RoseNode: class extends @Node
		# A node with any number of children.
		constructor: (@label) ->

	BinaryNode: class extends @Node
		# A node with exactly two children, a left and a right child.
		constructor: (@label) ->
			@children =
				left: null
				right: null

		getChildren: ->
			# Return an array of children.
			[@children.left, @children.right]

	Term: class
		# A basic node for the expression tree.
		# All nodes inherit from this.
		constructor: (@label) ->
			@children = []

		getChildren: ->
			# Return an array of children.
			@children

	SymbolicConstant: class extends @Node
		# Symbolic constants in the equation tree, e.g. π
		constructor: (@label, @value=null) ->

		evaluate: ->