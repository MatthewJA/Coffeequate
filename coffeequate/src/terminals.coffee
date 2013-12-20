

define ["nodes"], (nodes) ->

	# Terminals for the equation tree.

	class Terminal
		# Base class for terminals.
		constructor: (@label) ->

		evaluate: ->

	return {

		Variable: class extends Terminal
			# Variables in the equation tree, e.g. m

		Constant: class extends Terminal
			# Constants in the equation tree, e.g. 1/2
			constructor: (value) ->
				if typeof(value) == "string" or value instanceof String
					## TODO: Use regex here!
					value = value.split("/")
					if value.length == 0
						@numerator = 1
						@denominator = 1
					else if value.length == 1
						@numerator = parseFloat(value[0])
						@denominator = 1
					else if value.length == 2
						@numerator = parseFloat(value[0])
						@denominator = parseFloat(value[1])
					else
						throw new Error("Invalid constant #{value.join("/")}")

			evaluate: ->
				@numerator/@denominator

		SymbolicConstant: class extends Terminal
			# Symbolic constants in the equation tree, e.g. π
			constructor: (@label, @value=null) ->
	}