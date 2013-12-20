define ->

	# Basic nodes for the expression tree.

	class BasicNode
		# A basic node for the expression tree.
		# All nodes inherit from this.
		constructor: (@label) ->
			@children = []

		getChildren: ->
			# Return an array of children.
			@children

	return {

		RoseNode: class extends BasicNode
			# A node with any number of children.

		BinaryNode: class extends BasicNode
			# A node with exactly two children, a left and a right child.
			constructor: (@label) ->
				@children =
					left: null
					right: null

			getChildren: ->
				# Return an array of children.
				[@children.left, @children.right]

	}