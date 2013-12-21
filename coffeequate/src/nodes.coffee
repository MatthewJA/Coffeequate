define ->

	# Basic nodes for the expression tree.

	class BasicNode
		# A basic node for the expression tree.
		# All nodes inherit from this.
		constructor: (@label) ->

		getChildren: ->
			# Return an array of children.
			return []

	return {

		BasicNode: BasicNode

		RoseNode: class extends BasicNode
			# A node with any number of children.

			constructor: (label, @children=null) ->
				unless @children?
					@children = []

				super(label)

			getChildren: ->
				@children

			toString: ->
				@children.join(" #{@label} ")

		BinaryNode: class extends BasicNode
			# A node with exactly two children, a left and a right child.
			constructor: (@label, left, right) ->
				@children =
					left: left
					right: right

			getChildren: ->
				# Return an array of children.
				[@children.left, @children.right]

			toString: ->
				"#{@children.left} #{@label} #{@children.right}"

	}