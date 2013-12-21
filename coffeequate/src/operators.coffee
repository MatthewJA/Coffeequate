define ["nodes", "parse", "terminals"], (nodes, parse, terminals) ->

	# Defines operator nodes of the expression tree.

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
			else if arg instanceof terminals.Terminal or arg instanceof nodes.BasicNode
				outArgs.push(arg)
			else
				throw new Error("Invalid argument #{arg}, (#{typeof(arg)}), (#{arg.toString()})")

		return outArgs

	return {

		Add: class extends nodes.RoseNode
			# Represent addition.
			constructor: (args...) ->
				# Check validity of arguments.
				if args.length < 2
					throw new Error("Add nodes must have at least two children.")

				args = parseArgs(args...)
				super("+", args)

		Mul: class extends nodes.RoseNode
			# Represent multiplication.
			constructor: (args...) ->
				if args.length < 2
					throw new Error("Mul nodes must have at least two children.")

				args = parseArgs(args...)
				super("*", args)

		Pow: class extends nodes.BinaryNode
			# Represent powers.
			constructor: (base, power) ->
				[base, power] = parseArgs(base, power)
				super("**", base, power)

	}