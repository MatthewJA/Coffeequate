define ["parse"], (parse) ->

	# Terminals for the equation tree.

	class Terminal
		# Base class for terminals.
		constructor: (@label) ->

		evaluate: ->

		toString: ->
			@label

	return {

		Terminal: Terminal

		Variable: class extends Terminal
			# Variables in the equation tree, e.g. m

		Constant: class extends Terminal
			# Constants in the equation tree, e.g. 1/2
			constructor: (value) ->
				[@numerator, @denominator] = parse.constant(value)

			evaluate: ->
				@numerator/@denominator

			toString: ->
				unless @denominator == 1
					return "#{@numerator}/#{@denominator}"
				return "#{@numerator}"

		SymbolicConstant: class extends Terminal
			# Symbolic constants in the equation tree, e.g. π
			constructor: (@label, @value=null) ->

			evaluate: ->
				@value
	}