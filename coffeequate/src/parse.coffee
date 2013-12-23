define ["require"], (require) ->

	# Functions to parse strings into various Coffeequate objects.

	class ParseError extends Error
		constructor: (@input, @type) ->

		toString: ->
			"Could not parse '#{@input}' as #{@type}"

	stringToTerminal = (string) ->
		# Take a string and return a Terminal that that string represents.
		# E.g. "2" -> Constant(2)
		# E.g. "v" -> Variable(2)
		terminals = require("terminals")
		if /\d+(\.\d+)?/.test(string) or /\d+(\.\d+)?\/\d+(\.\d+)?/.test(string)
			return new terminals.Constant(string)
		else if /[a-zA-Z][a-zA-Z_\-\d]*/.test(string)
			return new terminals.Variable(string)
		else
			throw new ParseError(string, "terminal")

	class StringToExpression
		# A parser which parses an expression string into an expression.
		# E.g. "1 + 2 * 3 ** 4" -> Add(1, Mul(2, Pow(3, 4)))

		###
			ADDN := MULT | MULT "+" ADDN
			MULT := POWR | POWR "*" MULT
			POWR := BRAC | BRAC "**" POWR
			BRAC := "-" BRAC | "(" ADDN ")" | TERM
			TERM := <Existing Code>
		###

		constructor: (string) ->
			@tokens = StringToExpression.tokenise(string)
			@upto = 0
			@operators = require("operators")
			return @parseAddition() # Return a node instead of returning this parser class.

		@tokenise: (string) ->
			# Convert a string into an array of token strings.
			string.split(/(\*\*|[+*]|\s)/).filter((z) -> !/^\s*$/.test(z))

		getToken: ->
			@tokens[@upto]

		parseAddition: ->
			# We know we have to have a MULT to start with, so parse that.
			mult = @parseMultiplication()

			# Expect a "+".
			unless @getToken() == "+"
				# We must have only had a MULT after all.
				return mult

			@upto += 1

			# Now we have another ADDN.
			addn = @parseAddition()

			# We're done!
			return new @operators.Add(mult, addn)

		parseMultiplication: ->
			# We know we have to have a POWR to start with, so parse that.
			powr = @parsePower()

			# Expect a "*".
			unless @getToken() == "*"
				# We must have only had a POWR after all.
				return powr

			@upto += 1

			# Now we have another MULT.
			mult = @parseMultiplication()

			# We're done!
			return new @operators.Mul(powr, mult)

		parsePower: ->
			# We know we have to have a BRAC to start with, so parse that.
			brac = @parseBracket()

			# Expect a "**".
			unless @getToken() == "**"
				# We must have only had a BRAC after all.
				return brac

			@upto += 1

			# Now we have another POWR.
			powr = @parsePower()

			# We're done!
			return new @operators.Pow(brac, powr)

		parseBracket: ->
			# BRAC := "-" BRAC | "(" ADDN ")" | TERM

			# Do we start with a "-"?
			if @getToken() == "-"
				# We do!
				# Now we have another BRAC.
				@upto += 1
				brac = @parseBracket()

				# We're done!
				return new @operators.Mul(-1, brac)

			# We don't, but do we start with a "("?
			else if @getToken() == "("
				# We do!
				# Now we have another ADDN.
				@upto += 1
				addn = @parseAddition()

				# We're done!
				return addn

			# Nothing else, so we must have a TERM!
			else
				term = @parseTerm()

				# We're done!
				return term

		parseTerm: ->
			term = stringToTerminal(@getToken())
			@upto += 1
			return term

	return {

		ParseError: ParseError

		ExpressionFromString: StringToExpression # new expressionFromString(string) seems a natural alias.
		StringToExpression: StringToExpression # Consistency.

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

		stringToTerminal: stringToTerminal

	}