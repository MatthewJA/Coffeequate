### Coffeequate - http://github.com/MatthewJA/Coffeequate ###

require.config
		baseUrl: "./"

define ["Equation", "operators", "terminals", "parse", "uncertainties", "prettyRender"], (Equation, operators, terminals, parse, uncertainties, prettyRender) ->

	return {
		# Public interface for Coffeequate.
		Equation: Equation
		tree:
			operators: operators
			terminals: terminals
		parse: parse
		prettyRender:
			DrawingNode: prettyRender.DrawingNode
			Add: prettyRender.Add
			Mul: prettyRender.Mul
			Power: prettyRender.Power
			Bracket: prettyRender.Bracket
			Number: prettyRender.Number
			Variable: prettyRender.Variable
			Fraction: prettyRender.Fraction
	}