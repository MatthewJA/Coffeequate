define ->

	# Exception for when algebraic manipulation fails.

	return class AlgebraError extends Error
		constructor: (expr, variable, postscript=null) ->
			super("Unsolvable: #{expr} for #{variable}#{if postscript then ";" + postscript else ""}")