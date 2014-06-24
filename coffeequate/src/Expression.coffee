define ["parse", "nodes"], (parse, nodes) ->

	# Public interface for nodes.

	class Expression
		constructor: (val) ->
			if val instanceof String or typeof val == "string"
				# The string we pass in is just a representation to parse.
				@expr = parse.stringToExpression(val)
			else if val.copy?
				@expr = val.copy()
			else
				throw new Error("Unknown argument: `#{val}'.")

		toString: ->
			@expr.toString()

		toMathML: ->
			@expr.toMathML()

		toLaTeX: ->
			@expr.toLaTeX()

		solve: (variable) ->
			# TODO: Equivalencies.
			new Expression(@expr.solve(variable))

		sub: (substitutions) ->
			# TODO: Uncertainties, equivalencies, options.
			# TODO: Seems that the way I implemented substituting expressions was different last time for no real reason. Fix.

			# If there are any Expressions in here, we should remove them.
			newsubs = {}
			for key of substitutions
				if substitutions[key] instanceof Expression
					newsubs[key] = substitutions[key].expr
				else
					newsubs[key] = substitutions[key]

			return new Expression(@expr.sub(newsubs, null, null).simplify())

		copy: ->
			new Expression(@expr.copy())

		simplify: ->
			new Expression(@expr.simplify())

	return Expression