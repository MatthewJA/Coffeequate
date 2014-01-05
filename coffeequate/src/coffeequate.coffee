require.config
    baseUrl: "./"

define ["operators", "parse", "terminals"], (operators, parse, terminals) ->
	return {
		operators: operators
		parse: parse
		terminals: terminals
	}