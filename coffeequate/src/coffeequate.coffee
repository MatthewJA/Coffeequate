### Coffeequate - http://github.com/MatthewJA/Coffeequate ###

require.config
		baseUrl: "./"

define ["Equation", "operators", "terminals", "parse"], (Equation, operators, terminals, parse) ->

	return {
		# Public interface for Coffeequate.
		Equation: Equation
		tree:
			operators: operators
			terminals: terminals
		parse: parse
	}