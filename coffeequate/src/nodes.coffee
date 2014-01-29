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

		getUncertainty: ->
			require ["operators/Add", "operators/Mul", "operators/Pow", "terminals"], (Add, Mul, Pow, terminals) ->

				Uncertainty = terminals.Uncertainty
				Constant = terminals.Constant

				variables = @getAllVariables()
				out = []
				for variable in variables
					stuff = new Mul(new Uncertainty(variable), @differentiate(variable))
					out.push(new Pow(stuff, 2))

				return new Pow(new Add(out...), new terminals.Constant(1,2)).expandAndSimplify()

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