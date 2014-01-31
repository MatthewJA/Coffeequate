### Coffeequate - http://github.com/MatthewJA/Coffeequate ###

require.config
		baseUrl: "./"

define ["Equation", "operators", "terminals", "parse", "uncertainties"], (Equation, operators, terminals, parse, uncertainties) ->

	return {
		# Public interface for Coffeequate.
		Equation: Equation
		tree:
			operators: operators
			terminals: terminals
		parse: parse
	}