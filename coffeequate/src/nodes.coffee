define ->

	# Basic nodes for the expression tree.

	class BasicNode
		# A basic node for the expression tree.
		# All nodes inherit from this.
		constructor: (@label) ->

		getChildren: ->
			# Return an array of children.
			return []

		getAllVariables: ->
			return []

		toDrawingNode: ->
			throw new Error("toDrawingNode not implemented for #{self.toString()}")

		toLaTeX: ->
			return @toDrawingNode().renderLaTeX()

		toMathML2: ->
			[mathClass, mathID, openingHTML] = generateInfo.getMathMLInfo(equationID, expression, equality)
			closingHTML = "</math></div>"
			return openingHTML + @toDrawingNode().renderMathML() + closingHTML

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

			toLisp: ->
				childrenStrings = @children.map((x) -> if x.toLisp then x.toLisp() else x)
				"(#{@label}#{if @children then " " else ""}#{childrenStrings.join(" ")})"

			toString: ->
				"(#{@children.join(" #{@label} ")})"


		BinaryNode: class extends BasicNode
			# A node with exactly two children, a left and a right child.
			constructor: (@label, left, right) ->
				@children =
					left: left
					right: right

			getChildren: ->
				# Return an array of children.
				[@children.left, @children.right]

			toLisp: ->
				lispify = (x) -> if x.toLisp then x.toLisp() else x
				"(#{@label} #{lispify(@children.left)} #{lispify(@children.right)})"

			toString: ->
				"(#{@children.left} #{@label} #{@children.right})"

	}