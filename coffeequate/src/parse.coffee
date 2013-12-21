define ->

	# Functions to parse strings into various Coffeequate objects.

	class ParseError extends Error
		constructor: (@input, @type) ->

		toString: ->
			"Could not parse '#{@input}' as #{@type}"

	return {

		ParseError: ParseError

		constant: (value) ->
			# Take a string and return [numerator, denominator].

			if typeof(value) == "string" or value instanceof String
				## TODO: Use regex here!
				if value == "" then throw new ParseError("", "constant")

				value = value.split("/")
				if value.length == 1
					return [parseFloat(value[0]), 1]
				else if value.length == 2
					return [parseFloat(value[0]), parseFloat(value[1])]
				else
					throw new ParseError(value.join("/"), "constant")

			else if typeof(value) == "number" or value instanceof Number
				## TODO: Convert the number into a fraction if necessary.
				return [value, 1]

			else
				throw new ParseError(value, "constant")

	}