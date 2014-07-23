define ->

	# Exception for when algebraic manipulation fails.
	class AlgebraError extends Error

		# Make a new AlgebraError.
		#
		# @param expr [Object] The expression which could not be manipulated.
		# @param variable [String] The variable attempted to solve for.
		# @param postscript [String] Optional - A note to be added to the end of the error message.
		# @return [AlgebraError] A new AlgebraError.
		constructor: (@expr, @variable, @postscript=null) ->
			super("Unsolvable: #{@expr} for #{@variable}#{if @postscript then "; " + @postscript else ""}")
		toString: ->
			"Unsolvable: #{@expr} for #{@variable}#{if @postscript then "; " + @postscript else ""}"

	return AlgebraError