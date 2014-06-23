### Coffeequate - http://github.com/MatthewJA/Coffeequate ###

require.config
		baseUrl: "./"

define ["operators", "Expression", "parse"], (operators, Expression, parse) ->

	# This defines the CQ function, which converts inputs into Expressions.
	# (Public interface for Coffeequate - this is all that the user will see!)

	return (args...) ->
		if args.length == 1 and (typeof args[0] == "string" or args[0] instanceof String)
			# Parse as complete expression or equation.
			if /\=/.test(args[0])
				# This is an equation.
				[left, right] = args[0].split("=")
				val = new operators.Add(parse.stringToExpression(right),
						new operators.Mul(parse.stringToExpression(left), "-1"))
				return new Expression(val)
			else
				# This is an expression.
				return new Expression(args[0])