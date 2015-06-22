define ["operators/Add", "operators/Mul", "operators/Pow",
        "operators/Function"], (Add, Mul, Pow, FunctionNode) ->

	# API for operator nodes of the expression tree.

	return {"Add": Add, "Mul": Mul, "Pow": Pow, "Function": FunctionNode}