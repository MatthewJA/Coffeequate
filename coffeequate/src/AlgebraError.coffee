define ->

	# Exception for when algebraic manipulation fails.
	# @param expr [Object] The expression which could not be manipulated.
	# @param variable [String] The variable attempted to solve for.
	# @param postscript [String] Optional - A note to be added to the end of the error message.
	class AlgebraError extends Error
		constructor: (expr, variable, postscript=null) ->
			super("Unsolvable: #{expr} for #{variable}#{if postscript then "; " + postscript else ""}")

	return AlgebraError