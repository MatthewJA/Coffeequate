define ["nodes"], (nodes) ->

	# Defines operator nodes of the expression tree.

	return {

		Add: class extends nodes.RoseNode
			# Represent addition.
			constructor: (args...) ->
				if args.length < 2
					throw new Error("Add nodes must have at least two children.")
				super("+", args)

		Mul: class extends nodes.RoseNode
			# Represent multiplication.
			constructor: (args...) ->
				if args.length < 2
					throw new Error("Mul nodes must have at least two children.")
				super("*", args)

		Pow: class extends nodes.BinaryNode
			# Represent powers.
			constructor: (base, power) ->
				super("**", base, power)

	}