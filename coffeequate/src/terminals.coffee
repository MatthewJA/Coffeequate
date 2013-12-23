define ["parse"], (parse) ->

	# Terminals for the equation tree.

	class Terminal
		# Base class for terminals.
		constructor: (@label) ->

		evaluate: ->

		copy: ->
			return new Terminal(@label)

		toString: ->
			@label

	class Constant extends Terminal
		# Constants in the equation tree, e.g. 1/2
		constructor: (value, @denominator=null) ->

			if @denominator?
				[@numerator, denominator] = parse.constant(value)
				@denominator *= denominator
			else
				[@numerator, @denominator] = parse.constant(value)

		evaluate: ->
			@numerator/@denominator

		copy: ->
			return new Constant(@numerator, @denominator)

		toString: ->
			unless @denominator == 1
				return "#{@numerator}/#{@denominator}"
			return "#{@numerator}"

	class SymbolicConstant extends Terminal
		# Symbolic constants in the equation tree, e.g. π
		constructor: (@label, @value=null) ->

		copy: ->
			return new SymbolicConstant(@label, @value)

		evaluate: ->
			@value

	class Variable extends Terminal
		# Variables in the equation tree, e.g. m

		copy: ->
			return new Variable(@label)

	return {

		Terminal: Terminal

		Variable: Variable

		Constant: Constant

		SymbolicConstant: SymbolicConstant

	}