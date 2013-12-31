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
			if args.length < 1
				throw new Error("Add nodes must have at least one child.")

			@cmp = -1

			args = parseArgs(args...)
			super("+", args)

		copy: ->
			args = ((if i.copy? then i.copy() else i) for i in @children)
			return new Add(args...)

		compareSameType: (b) ->
			# Compare this object with another of the same type.
			if @children.length == b.children.length
				lengthComparison = 0
			else if @children.length < b.children.length
				lengthComparison = -1
			else
				lengthComparison = 1

			for child, index in @children
				return 1 unless b.children[index]?
				c = compare(@children[index], b.children[index])
				if c != 0
					return c

			return lengthComparison

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

			add = new Add(children...)
			add.sort()

			return add

		sort: ->
			# Sort this node.
			for child in @children
				child.sort?()
			@children.sort(compare)

		equals: (b) ->
			# Check equality between this and another object.
			unless b instanceof Add
				return false
			unless b.children.length == @children.length
				return false
			for child, index in @children
				if child.equals?
					unless child.equals(b.children[index])
						return false
				else
					unless child == b.children[index]
						return false
			return true

		simplify: ->
			terms = []
			for child in @children
				if child.simplify?
					child = child.simplify()
				else if child.copy?
					child = child.copy()

				terms.push(child)
			
			# Collect like terms into multiplication.
			liketerms = []
			constantterm = null
			i = 0
			while i < terms.length
				term = terms[i]
				if term instanceof Add
					terms.splice(i, 1)[0]
					# Pull the children into this node (this flattens the addition tree).
					for c in term.children
						terms.push(c)
					i -= 1 # Rewind the loop slightly.
				else if term instanceof terminals.Constant
					if constantterm?
						constantterm = constantterm.add(term)
					else
						constantterm = term.copy()
				else if term instanceof Mul # Might need to expand Mul nodes.
					constanttermmul = null
					variabletermmul = null
					for child in term.children
						if child instanceof terminals.Constant
							if constanttermmul?
								constanttermmul = constanttermmul.multiply(child)
							else
								constanttermmul = child.copy()
						else
							if variabletermmul?
								variabletermmul.children.push(child)
							else
								variabletermmul = new Mul(child)

					if variabletermmul.children.length == 1
						variabletermmul = variabletermmul.children[0]

					if constanttermmul? and (not variabletermmul?)
						if constantterm?
							constantterm = constantterm.add(constanttermmul)
						else
							constantterm = constanttermmul.copy()
					else
						unless constanttermmul?
							constanttermmul = new terminals.Constant("1")

						# Find the var in liketerms.
						# If we find it, add the constant to the total.
						# If we can't find it, add [var, const] to liketerms.
						found = false
						for liketerm, index in liketerms
							console.log(liketerm[0])
							if liketerm[0].equals?
								if liketerm[0].equals(variabletermmul)
									liketerms[index][1] = new Add(liketerm[1], constanttermmul)
									liketerms[index][1] = liketerms[index][1].simplify()
									found = true
							else if liketerm[0] == variabletermmul
								liketerms[index][1] = new Add(liketerm[1], constanttermmul)
								liketerms[index][1] = liketerms[index][1].simplify()
								found = true
						unless found
							liketerms.push([variabletermmul, constanttermmul])

				else
					# A unique term. Do we have a copy of it already?
					found = false
					for liketerm, index in liketerms
						if liketerm[0].equals?
							if liketerm[0].equals(term)
								liketerms[index][1] = new Add(liketerm[1], new terminals.Constant("1"))
								liketerms[index][1] = liketerms[index][1].simplify()
								found = true
						else if liketerm[0] == term
							liketerms[index][1] = new Add(liketerm[1], new terminals.Constant("1"))
							liketerms[index][1] = liketerms[index][1].simplify()
							found = true
					unless found
						liketerms.push([term, new terminals.Constant("1")])

				i += 1

			newAdd = null
			for liketerm in liketerms
				if liketerm[0].children? and liketerm[0].children.length == 1
					liketerm[0] = liketerm[0].children[0]
				if liketerm[1].evaluate?() != 1
					newMul = new Mul(liketerm[0], liketerm[1])
					newMul = newMul.simplify()
				else
					newMul = liketerm[0]
				if newAdd?
					newAdd.children.push(newMul)
				else
					newAdd = new Add(newMul)

			unless newAdd?
				return constantterm

			if constantterm? and constantterm.evaluate() != 0
				newAdd.children.push(constantterm)

			newAdd.sort()

			return newAdd unless newAdd.children.length == 1
			return newAdd.children[0]

		expandAndSimplify: ->
			@expand().simplify()

	class Mul extends nodes.RoseNode
		# Represent multiplication.
		constructor: (args...) ->
			if args.length < 1
				throw new Error("Mul nodes must have at least one child.")

			@cmp = -2

			args = parseArgs(args...)
			super("*", args)
		
		copy: ->
			args = ((if i.copy? then i.copy() else i) for i in @children)
			return new Mul(args...)

		simplifyConstants: ->
			constantterm = new terminals.Constant("1")
			variableterm = null

			for child in @children
				if child instanceof terminals.Constant
					constantterm = constantterm.multiply(child)
				else
					if variableterm?
						variableterm.children.push(child)
					else
						variableterm = new Mul(child)

			unless variableterm?
				return constantterm
			if constantterm.evaluate() == 1
				return variableterm

			return new Mul(constantterm, variableterm)

		compareSameType: (b) ->
			# Compare this object with another of the same type.
			if @children.length == b.children.length
				lengthComparison = 0
			else if @children.length < b.children.length
				lengthComparison = -1
			else
				lengthComparison = 1

			for child, index in @children
				return 1 unless b.children[index]?
				c = compare(@children[index], b.children[index])
				if c != 0
					return c

			return lengthComparison

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

		equals: (b) ->
			# Check equality between this and another object.
			unless b instanceof Mul
				return false
			unless b.children.length == @children.length
				return false
			for child, index in @children
				if child.equals?
					unless child.equals(b.children[index])
						return false
				else
					unless child == b.children[index]
						return false
			return true

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
					if term[1] instanceof Add
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

			# The terms should be ordered.
			term[0].sort?()

			return term[0]

		simplify: ->
			terms = []
			for child in @children
				if child.simplify?
					child = child.simplify()
				else if child.copy?
					child = child.copy()

				terms.push(child)
			
			# Collect like terms into powers.
			liketerms = []
			constantterm = null
			i = 0
			while i < terms.length
				term = terms[i]
				if term instanceof Mul
					child = terms.splice(i, 1)[0]
					# Pull the children into this node (this flattens the multiplication tree).
					for c in child.children
						terms.push(c)
					i -= 1 # Rewind the loop slightly.
				else if term instanceof terminals.Constant
					if constantterm?
						constantterm = constantterm.multiply(term)
					else
						constantterm = term.copy()
				else if term instanceof Pow # Might need to expand Pow nodes.
					base = term.children.left
					power = term.children.right
					# Find the base in liketerms.
					# If we find the base, add power to the power.
					# If we can't find the base, add [base, power] to liketerms.
					found = false
					for liketerm, index in liketerms
						if liketerm[0].equals?
							if liketerm[0].equals(base)
								liketerms[index][1] = new Add(liketerm[1], power)
								liketerms[index][1] = liketerms[index][1].simplify()
								if liketerms[index][1].children?.length == 1
									liketerms[index][1] = liketerms[index][1].children[0]
								found = true
						else if liketerm[0] == base
							liketerms[index][1] = new Add(liketerm[1], power)
							liketerms[index][1] = liketerms[index][1].simplify()
							if liketerms[index][1].children?.length == 1
								liketerms[index][1] = liketerms[index][1].children[0]
							found = true
					unless found
						liketerms.push([base, power])

				else
					# A unique term. Do we have a copy of it already?
					found = false
					for liketerm, index in liketerms
						if liketerm[0].equals?
							if liketerm[0].equals(term)
								liketerms[index][1] = new Add(liketerm[1], new terminals.Constant("1"))
								liketerms[index][1] = liketerms[index][1].simplify()
								if liketerms[index][1].children?.length == 1
									liketerms[index][1] = liketerms[index][1].children[0]
								found = true
						else if liketerm[0] == term
							liketerms[index][1] = new Add(liketerm[1], new terminals.Constant("1"))
							liketerms[index][1] = liketerms[index][1].simplify()
							if liketerms[index][1].children?.length == 1
								liketerms[index][1] = liketerms[index][1].children[0]
							found = true
					unless found
						liketerms.push([term, new terminals.Constant("1")])

				i += 1

			if constantterm?.evaluate?() == 0
				return new terminals.Constant("0")

			newMul = null
			for liketerm in liketerms
				if liketerm[1].evaluate?() != 1
					newPow = new Pow(liketerm[0], liketerm[1])
					newPow = newPow.simplify()
				else
					newPow = liketerm[0]
				if newMul?
					newMul.children.push(newPow)
				else
					newMul = new Mul(newPow)

			unless newMul?
				return constantterm

			if constantterm? and constantterm.evaluate() != 1
				newMul.children.push(constantterm)

			newMul.sort()

			# Is the result here just numerical?
			numerical = true
			for child in newMul.children
				unless child instanceof terminals.Constant
					numerical = false
					break

			if numerical
				return newMul.simplifyConstants()

			return newMul unless newMul.children.length == 1
			return newMul.children[0]

		sort: ->
			# Sort this node.
			for child in @children
				child.sort?()
			@children.sort(compare)

		expandAndSimplify: ->
			@expand().simplify()

	class Pow extends nodes.BinaryNode
		# Represent powers.
		constructor: (base, power, args...) ->
			unless base? and power?
				throw new Error("Pow nodes must have two children.")
			if args.length > 0
				throw new Error("Pow nodes must have two children.")

			@cmp = -3

			[base, power] = parseArgs(base, power)
			super("**", base, power)

		copy: ->
			return new Pow(
				(if @children.left.copy? then @children.left.copy() else @children.left),
				(if @children.right.copy? then @children.right.copy() else @children.right)
			)

		sort: ->
			@children.left.sort?()
			@children.right.sort?()

		equals: (b) ->
			# Check equality between this and another object.
			unless b instanceof Pow
				return false

			if @children.left.equals?
				unless @children.left.equals(b.children.left)
					return false
			else
				unless @children.left == b.children.left
					return false

			if @children.right.equals?
				unless @children.right.equals(b.children.right)
					return false
			else
				unless @children.right == b.children.right
					return false

			return true

		compareSameType: (b) ->
			# Compare this object with another of the same type.
			c = compare(@children.left, b.children.left)
			if c != 0
				return c
			else
				return compare(@children.right, b.children.right)

		expand: ->
			# Expand all the children.
			if @children.left.expand?
				left = @children.left.expand()
			else if @children.left.copy?
				left = @children.left.copy()
			else
				left = @children.left

			if @children.right.expand?
				right = @children.right.expand()
			else if @children.right.copy?
				right = @children.right.copy()
			else
				right = @children.right

			if left.children?
				if left instanceof Pow
					# (a ** b) ** c -> (a ** (b * c))
					left.children.right = new Mul(left.children.right, right)
					left.expand()
				else if left instanceof Mul
					# Put all the things on the left to the power of the right.
					for child, index in left.children
						newPow = new Pow(child, right)
						newPow = newPow.expand()
						left.children[index] = newPow # This is so I don't have to worry about what
													  # type the child is! :D
				else if left instanceof Add
					# Convert this into a multiplication of addition nodes, if the power is an integer.
					# Otherwise, leave it.
					if right instanceof terminals.Constant and right.evaluate() % 1 == 0
						# Expand!
						children = []
						for i in [1..right.evaluate()]
							children.push(left)
						newMul = new Mul(children...)
						newMul = newMul.expand()
						left = newMul
					else
						left = new Pow(left, right)

				return left
			else
				# Can't expand any more!
				return new Pow(left, right)

		simplify: ->
			# Simplify all the children.
			if @children.left.simplify?
				left = @children.left.simplify()
			else if @children.left.copy?
				left = @children.left.copy()
			else
				left = @children.left

			if @children.right.simplify?
				right = @children.right.simplify()
			else if @children.right.copy?
				right = @children.right.copy()
			else
				right = @children.right

			if right.evaluate?() == 1
				return left
			else if right.evaluate?() == 0
				return new terminals.Constant("1")
			else
				if right instanceof terminals.Constant and left instanceof terminals.Constant
					return Math.pow(left.evaluate(), right.evaluate())
				else
					return new Pow(left, right)

		expandAndSimplify: ->
			@expand().simplify()


	compare = (a, b) ->
		# Compare two values to get an order.
		# a < b -> -1
		# a = b ->  0
		# a > b ->  1
		###
		Order:
		-6: Constants, by value
		-5: Symbolic constants, by label
		-4: Variables, by label
		-3: Power nodes, by base
		-2: Multiplication nodes, by first child
		-1: Addition nodes, by first child
		###

		if a.cmp? and b.cmp?
			if a.cmp == b.cmp
				return a.compareSameType(b)
			else
				return (a.cmp-b.cmp)/Math.abs(a.cmp-b.cmp)
		else
			return 0

	return {

		Add: Add

		Mul: Mul

		Pow: Pow

		compare: compare

	}