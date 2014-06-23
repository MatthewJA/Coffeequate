define ["parse", "nodes"], (parse, nodes) ->

	# Public interface for nodes.

	class Expression
		constructor: (val) ->
			if val instanceof String or typeof val == "string"
				# The string we pass in is just a representation to parse.
				@expr = parse.stringToExpression(val)
			else if val instanceof nodes.BasicNode
				@expr = val.copy()
			else
				throw new Error("Unknown argument: `#{val}'.")

		toString: ->
			@expr.toString()

		solve: (variable) ->
			# TODO: Equivalencies.
			@expr.solve(variable)

		sub: (substitutions) ->
			# TODO: Uncertainties, equivalencies, options.
			# TODO: Seems that the way I implemented substituting expressions was different last time for no real reason. Fix.
			@expr.sub(substitutions, null, null).simplify()

		simplify: ->
			@expr.simplify()

	return Expression