define [
	"nodes"
	"terminals"
	"generateInfo"
	"AlgebraError"
	"parseArgs"
	"require"
	"compare"
	"prettyRender"
], (nodes, terminals, generateInfo, AlgebraError, parseArgs, require, compare, prettyRender) ->

	# Represent powers as a node.

	class Pow extends nodes.BinaryNode
		# Represent powers.
		constructor: (base, power, args...) ->
			unless base? and power?
				throw new Error("Pow nodes must have two children.")
			if args.length > 0
				throw new Error("Pow nodes must have two children.")

			@cmp = -3

			[base, power] = parseArgs(base, power)
			super("**", base, power)

		copy: ->
			return new Pow(
				(if @children.left.copy? then @children.left.copy() else @children.left),
				(if @children.right.copy? then @children.right.copy() else @children.right)
			)

		sort: ->
			@children.left.sort?()
			@children.right.sort?()

		equals: (b, equivalencies) ->
			# Check equality between this and another object.
			unless b instanceof Pow
				return false

			if @children.left.equals?
				unless @children.left.equals(b.children.left, equivalencies)
					return false
			else
				unless @children.left == b.children.left
					return false

			if @children.right.equals?
				unless @children.right.equals(b.children.right, equivalencies)
					return false
			else
				unless @children.right == b.children.right
					return false

			return true

		compareSameType: (b) ->
			# Compare this object with another of the same type.
			c = compare(@children.left, b.children.left)
			if c != 0
				return c
			else
				return compare(@children.right, b.children.right)

		getVariableUnits: (variable, equivalencies) ->
			variableEquivalencies = if equivalencies? then equivalencies.get(variable) else {get: (z) -> [z]}
			if @children.left instanceof terminals.Variable and @children.left.label in variableEquivalencies
				return @children.left.units
			else
				leftVariableUnits = @children.left.getVariableUnits(variable, equivalencies)
				if leftVariableUnits?
					return leftVariableUnits
			if @children.right instanceof terminals.Variable and @children.right.label in variableEquivalencies
				return @children.right.units
			else
				rightVariableUnits = @children.right.getVariableUnits(variable, equivalencies)
				if rightVariableUnits?
					return rightVariableUnits
			return null

		expand: ->
			Mul = require("operators/Mul")
			Add = require("operators/Add")

			# Expand all the children.
			if @children.left.expand?
				left = @children.left.expand()
			else if @children.left.copy?
				left = @children.left.copy()
			else
				left = @children.left

			if @children.right.expand?
				right = @children.right.expand()
			else if @children.right.copy?
				right = @children.right.copy()
			else
				right = @children.right

			if left.children?
				if left instanceof Pow
					# (a ** b) ** c -> (a ** (b * c))
					left.children.right = new Mul(left.children.right, right)
					left.expand()
				else if left instanceof Mul
					# Put all the things on the left to the power of the right.
					for child, index in left.children
						newPow = new Pow(child, right)
						newPow = newPow.expand()
						left.children[index] = newPow # This is so I don't have to worry about what
													  # type the child is! :D
				else if left instanceof Add
					# Convert this into a multiplication of addition nodes, if the power is an integer.
					# Otherwise, leave it.
					if right instanceof terminals.Constant and right.evaluate() % 1 == 0 and right.evaluate() > 0
						# Expand!
						children = []
						for i in [1..right.evaluate()]
							children.push(left)
						newMul = new Mul(children...)
						newMul = newMul.expand()
						left = newMul
					else
						left = new Pow(left, right)

				return left
			else
				# Can't expand any more!
				return new Pow(left, right)

		simplify: (equivalencies) ->
			Mul = require("operators/Mul")

			unless equivalencies?
				equivalencies = {get: (variable) -> [variable]}

			# Simplify all the children.
			if @children.left.simplify?
				left = @children.left.simplify(equivalencies)
			else if @children.left.copy?
				left = @children.left.copy()
			else
				left = @children.left

			if @children.right.simplify?
				right = @children.right.simplify(equivalencies)
			else if @children.right.copy?
				right = @children.right.copy()
			else
				right = @children.right

			if right.evaluate?() == 1
				return left
			else if left.evaluate?() == 1
				return left
			else if right.evaluate?() == 0
				return new terminals.Constant("1")
			else
				if right instanceof terminals.Constant and left instanceof terminals.Constant
					return new terminals.Constant(Math.pow(left.evaluate(), right.evaluate()))
				else if left instanceof Pow
					power = new Mul(left.children.right, right)
					newPow = new Pow(left.children.left, power)
					newPow = newPow.simplify(equivalencies)
					return newPow
				else
					return new Pow(left, right)

		expandAndSimplify: (equivalencies) ->
			expr = @expand()
			if expr.simplify?
				return expr.simplify(equivalencies)
			return expr

		solve: (variable, equivalencies) ->
			Mul = require("operators/Mul")

			# variable: The label of the variable to solve for. Return an array of solutions.

			unless equivalencies?
				equivalencies = {get: (variable) -> [variable]}

			expr = @expandAndSimplify(equivalencies)

			if expr instanceof terminals.Terminal
				if expr instanceof terminals.Variable and (expr.label == variable or expr.label in equivalencies.get(variable))
					return [new terminals.Constant("0")]
				else
					throw new AlgebraError(expr.toString(), variable)

			if expr instanceof Pow
				if expr.children.left instanceof terminals.Variable
					return [new terminals.Constant("0")] if (expr.children.left.label == variable or expr.children.left.label in equivalencies.get(variable)) # 0 = v; v = 0
					throw new AlgebraError(expr.toString(), variable)
				else if expr.children.left instanceof terminals.Terminal
					throw new AlgebraError(expr.toString(), variable)
				else
					try
						solutions = expr.children.left.solve(variable, equivalencies) # Root the 0 on the other side of the equation.
					catch error
						throw error # Acknowledging that this solving could fail and we do want it to.

					# This will lose some solutions, if we have something like x ** x, but we can't solve
					# a ** x anyway with this program, so losing a solution to x ** x doesn't bother me.
					if expr.children.right.evaluate? and expr.children.right.evaluate() % 2 == 0
						returnables = []
						for solution in solutions
							negative = (new Mul(-1, solution)).simplify(equivalencies)
							if negative.equals?
								unless negative.equals(solution)
									returnables.push(negative)
								returnables.push(solution)
							else
								unless negative == solution
									returnables.push(negative)
								returnables.push(solution)
						return returnables
					else
						return solutions
			else
				return expr.solve(variable, equivalencies)

		sub: (substitutions, uncertaintySubstitutions, equivalencies=null) ->
			# subtitutions: {variable: value}
			# variable is a label, value is any object - if it is a node,
			# it will be substituted in; otherwise it is interpreted as a
			# constant (and any exceptions that might cause will be thrown).

			# Interpret substitutions.
			for variable of substitutions
				unless substitutions[variable] instanceof terminals.Terminal or substitutions[variable] instanceof nodes.BasicNode
					substitutions[variable] = new terminals.Constant(substitutions[variable])

			unless equivalencies?
				equivalencies = {get: (z) -> [z]}

			left = null
			right = null
			if @children.left instanceof terminals.Variable
				variableEquivalencies = equivalencies.get(@children.left.label)
				subbed = false
				for equiv in variableEquivalencies
					if equiv of substitutions
						left = substitutions[equiv].copy()
						subbed = true
						break
				unless subbed
					left = @children.left.copy()
			else if @children.left.sub?
				left = @children.left.sub(substitutions, uncertaintySubstitutions)
			else
				left = @children.left.copy()

			if @children.right instanceof terminals.Variable
				variableEquivalencies = equivalencies.get(@children.right.label)
				subbed = false
				for equiv in variableEquivalencies
					if equiv of substitutions
						right = substitutions[equiv].copy()
						subbed = true
						break
				unless subbed
					right = @children.right.copy()
			else if @children.right.sub?
				right = @children.right.sub(substitutions, uncertaintySubstitutions)
			else
				right = @children.right.copy()

			newPow = new Pow(left, right)
			newPow = newPow.expandAndSimplify(equivalencies)
			return newPow

		getAllVariables: ->
			variables = {}

			if @children.left instanceof terminals.Variable
				variables[@children.left.label] = true
			else if @children.left.getAllVariables?
				leftVariables = @children.left.getAllVariables()
				for variable in leftVariables
					variables[variable] = true
			if @children.right instanceof terminals.Variable
				variables[@children.right.label] = true
			else if @children.right.getAllVariables?
				rightVariables = @children.right.getAllVariables()
				for variable in rightVariables
					variables[variable] = true

			outVariables = []
			for variable of variables
				outVariables.push(variable)

			return outVariables

		replaceVariables: (replacements) ->
			# {variableLabel: replacementLabel}
			left = @children.left.copy()
			right = @children.right.copy()

			if left instanceof terminals.Variable and left.label of replacements
				left.label = replacements[left.label]
			else if left.replaceVariables?
				left = left.replaceVariables(replacements)
			if right instanceof terminals.Variable and right.label of replacements
				right.label = replacements[right.label]
			else if right.replaceVariables?
				right = right.replaceVariables(replacements)

			return new Pow(left, right)

		substituteExpression: (sourceExpression, variable, equivalencies=null, eliminate=false) ->
			# Replace all instances of a variable with an expression.
			# Eliminate the target variable if set to do so.
			if eliminate
				sourceExpressions = sourceExpression.solve(variable, equivalencies)
			else
				sourceExpressions = [sourceExpression]

			# Generate an equivalencies index if necessary.
			if not equivalencies?
				equivalencies = {get: (variable) -> [variable]}

			variableEquivalencies = equivalencies.get(variable)

			results = []

			for expression in sourceExpressions
				# variable = sourceExpression
				left = [@children.left.copy()]
				right = [@children.right.copy()]

				if @children.left instanceof terminals.Variable and (@children.left.label == variable or @children.left.label in variableEquivalencies)
					left = [expression.copy()]
				else if not (@children.left instanceof terminals.Terminal)
					left = @children.left.substituteExpression(expression, variable, equivalencies)

				if @children.right instanceof terminals.Variable and (@children.right.label == variable or @children.right.label in variableEquivalencies)
					right = [expression.copy()]
				else if not (@children.right instanceof terminals.Terminal)
					right = @children.right.substituteExpression(expression, variable, equivalencies)


				for i in left
					for j in right
						newPow = new Pow(i, j)
						newPow = newPow.expandAndSimplify(equivalencies)
						results.push(newPow)

			return results

		toMathML: (equationID, expression=false, equality="0", topLevel=false) ->
			Mul = require("operators/Mul")
			Add = require("operators/Add")

			# Return a MathML string representing this node.
			# This code was partially lifted from the (delightfully uncommented) predecessor
			# to Coffeequate, MatthewJA/JS-Algebra.
			# There's a few peculiarities, but for the most part it seems to work.
			[mathClass, mathID, html] = generateInfo.getMathMLInfo(equationID, expression, equality)

			unless topLevel
				html = ""
				closingHTML = ""
			else
				closingHTML = "</math></div>"

			if @children.right.evaluate?() == 1
				return html + @children.left.toMathML(equationID, expression) + closingHTML
			else if @children.right.evaluate?() == 0
				return html + "<mn>1</mn>" + closingHTML
			else
				if @children.right.evaluate?() < 0
					right = @children.right.copy()
					right = new Mul("-1", right)
					right = right.expandAndSimplify()
				else
					right = @children.right.copy()

				# Fence if lower precedence, i.e. Add or Mul.
				if @children.left instanceof Add or @children.left instanceof Mul
					innerHTML = "<mfenced>#{@children.left.toMathML(equationID, expression)}</mfenced>"
				else
					innerHTML = "#{@children.left.toMathML(equationID, expression)}"
				unless right.evaluate?() == 1
					innerHTML = "<msup>#{innerHTML}#{right.toMathML(equationID, expression)}</msup>"
				if @children.right.evaluate?() < 0
					innerHTML = "<mfrac><mn>1</mn>#{innerHTML}</mfrac>"
				return html + innerHTML + closingHTML

		toHTML: (equationID, expression=false, equality="0", topLevel=false) ->
			# Return an HTML string representing this node.
			[mathClass, mathID, html] = generateInfo.getHTMLInfo(equationID, expression, equality)

			unless topLevel
				html = ""
				closingHTML = ""
			else
				closingHTML = "</div>"

			if @children.right.evaluate?() == 1
				return html + @children.left.toHTML() + closingHTML
			else if @children.right.evaluate?() == 0
				return html + "1" + closingHTML
			else
				# Fence if terminals.
				if @children.left instanceof terminals.Terminal
					leftSide = @children.left.toHTML()
				else
					leftSide = "(#{@children.left.toHTML()})"
				if @children.right instanceof terminals.Terminal
					rightSide = @children.right.toHTML()
				else
					rightSide = "(#{@children.right.toHTML()})"

				innerHTML = "#{leftSide} ** #{rightSide}"
				return html + innerHTML + closingHTML

		toDrawingNode: ->
			SurdNode = prettyRender?.Surd
			PowNode = prettyRender.Pow
			FractionNode = prettyRender.Fraction
			NumberNode = prettyRender.Number

			if @children.right instanceof terminals.Constant
				if @children.right.numerator == 1
					if @children.right.denominator > 0
						return new SurdNode(@children.left.toDrawingNode(), @children.right.denominator)
					else
						return new FractionNode(new NumberNode(1),
								new SurdNode(@children.left.toDrawingNode(), -@children.right.denominator))

			return new PowNode(@children.left.toDrawingNode(), @children.right.toDrawingNode())

		differentiate: (variable)  ->
			Add = require("operators/Add")
			Mul = require("operators/Mul")
			Constant = require("terminals").Constant
			if variable in @children.right.getAllVariables
				throw new Error("I can't differentiate with a variable on the top of a power")
			if @children.right.evaluate?() == 0
				return new Constant(0)
			return new Mul(new Pow(@children.left, new Add(@children.right, new Constant(-1))),
										 @children.left.differentiate(variable),
										 @children.right).expandAndSimplify()
