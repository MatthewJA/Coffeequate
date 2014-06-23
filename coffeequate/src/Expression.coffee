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

	return Expression