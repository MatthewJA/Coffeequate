define ["nodes", "parse", "terminals"], (nodes, parse, terminals) ->

	# Defines operator nodes of the expression tree.

	prettyPrint = (array) ->
		out = []
		for i in array
			if i instanceof Array
				out.push(prettyPrint(i))
			else
				out.push(i.toString?())
		return "[" + out.join(", ") + "]"

	parseArgs = (args...) ->
		# Check arguments are valid children for operators, and convert args
		# which are of the wrong type (but we still recognise).
		# Args should be either Terminals, Nodes, strings (which will be converted
		# into Terminals), or floats (which will be converted into Constants).
		outArgs = []
		for arg in args
			if typeof(arg) == "string" or arg instanceof String
				outArgs.push(parse.stringToTerminal(arg))
			else if typeof(arg) == "number" or arg instanceof Number
				outArgs.push(new terminals.Constant(arg))
			else if arg instanceof terminals.Terminal or arg instanceof nodes.BasicNode or arg.isTerminal?
				outArgs.push(arg)
			else
				console.log(arg)
				throw new Error("Invalid argument #{arg}, (#{typeof(arg)}), (#{arg.toString()})")

		return outArgs

	class Add extends nodes.RoseNode
		# Represent addition.
		constructor: (args...) ->
			# Check validity of arguments.
			if args.length < 2
				throw new Error("Add nodes must have at least one child.")

			args = parseArgs(args...)
			super("+", args)

		copy: ->
			args = ((if i.copy? then i.copy() else i) for i in @children)
			return new Add(args...)

		expand: ->
			# Addition is associative, so expand (+ (+ a b) c) into (+ a b c).
			children = []
			for child in @children
				if child.expand?
					child = child.expand()
				else if child.copy?
					child = child.copy()
				if child instanceof Add
					# If the child is an addition node, add its children as
					# the children of this node.
					for c in child.children
						children.push(c)
				else
					children.push(child)

			return new Add(children...)

	class Mul extends nodes.RoseNode
		# Represent multiplication.
		constructor: (args...) ->
			if args.length < 1
				throw new Error("Mul nodes must have at least one child.")

			args = parseArgs(args...)
			super("*", args)
		
		copy: ->
			args = ((if i.copy? then i.copy() else i) for i in @children)
			return new Mul(args...)

		@expandMulAdd: (mul, add) ->
			# Multiply out.
			results = []
			for child in add.children
				if child.copy?
					child = child.copy()

				if child instanceof Mul
					newMul = mul.copy()
					for c in child.children
						newMul.children.push(c)
				else if child instanceof Add
					newMul = Mul.expandMulAdd(mul, child)
				else
					if mul.children.length == 1
						newMul = mul.copy()
						newMul.children.push(child.copy())
					else
						newMul = new Mul(mul.copy(), child.copy())

				results.push(newMul)

			# The results should be put into an addition node.
			newAdd = new Add(results...)
			newAdd = newAdd.expand()
			return newAdd

		expand: ->
			# Multiplication is distributive over addition, as well as associative, so
			# we'll need to cover both cases.
			# We will need to multiply out. This returns an addition node!
			# a * (b + c) -> (a * b) + (a * c)
			# If you have multiple multiplications, then you need to expand in a more clever way.
			# a * b * (c + d) -> (a * b * c) + (a * b * d)
			# As far as I can tell, it's just multiplying all of the Add children
			# by all of the Mul children.
			# What about having multiple adds?
			# a * (b + c) * (d + e) -> (a * b + a * c) * (d + e) -> ((a * b + a * c) * d) + ((a * b + a * c) * e) -> ew
			# That's awful. We'll need to do this in a better way. It seems that we're just multiplying along though.
			# What if we just set the children to each product? Hmmm.
			# a * b * c -> (a * b) * c might work!
			# Then just expand again.
			term = []
			for child in @children
				if child.expand?
					child = child.expand()
				else if child.copy?
					child = child.copy()

				term.push(child)

			# Now we collapse this array.
			while term.length > 1
				# What is the first term?
				if term[0] instanceof Mul
					if term[1] instanceof Add
						term[0] = Mul.expandMulAdd(term[0], term.splice(1, 1)[0])

					else if term[1] instanceof Mul
						# Add children to term[0].
						for child in term.splice(1, 1)[0].children
							term[0].children.push(child)

					else
						# Add the whole term to term[0].
						term[0].children.push(term.splice(1, 1)[0])

				else if term[0] instanceof Add
					console.log("adding #{term[0]}")
					if term[1] instanceof Add
						console.log("adding #{term[1]} 1")
						# Of the form (a + b) * (c + d), with any number of children.
						# Expand.
						results = []
						for child in term[0].children
							newMul = new Mul(child, term[1])
							newMul = newMul.expand()
							results.push(newMul)
						term.splice(1, 1)
						term[0] = new Add(results...)
						term[0] = term[0].expand()

					else if term[1] instanceof Mul
						# Multiply out!
						term[0] = Mul.expandMulAdd(term.splice(1, 1)[0], term[0])

					else
						# Multiply the terms together.
						term[0] = new Mul(term[0], term.splice(1, 1)[0])

				else
					term[0] = new Mul(term[0])

			return term[0]

	class Pow extends nodes.BinaryNode
		# Represent powers.
		constructor: (base, power, args...) ->
			unless base? and power?
				throw new Error("Pow nodes must have two children.")
			if args.length > 0
				throw new Error("Pow nodes must have two children.")

			[base, power] = parseArgs(base, power)
			super("**", base, power)

		copy: ->
			return new Pow(
				(if @children.left.copy? then @children.left.copy() else @children.left),
				(if @children.right.copy? then @children.right.copy() else @children.right)
			)

	return {

		Add: Add

		Mul: Mul

		Pow: Pow

	}