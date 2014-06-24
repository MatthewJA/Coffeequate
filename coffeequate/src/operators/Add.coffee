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


	combinations = (list) ->
		if list.length == 1
			return (i for i in list[0])
		else
			results = []
			for i in list[0]
				for ii in combinations(list[1..])
					results.push([i].concat(ii))
			return results

	return class Add extends nodes.RoseNode
		constructor: (args...) ->
			# Check validity of arguments.
			if args.length < 1
				throw new Error("Add nodes must have at least one child.")

			@cmp = -1

			args = parseArgs(args...)
			super("+", args)

		copy: ->
			args = ((if i.copy? then i.copy() else i) for i in @children)
			return new Add(args...)

		compareSameType: (b) ->
			# Compare this object with another of the same type.
			if @children.length == b.children.length
				lengthComparison = 0
			else if @children.length < b.children.length
				lengthComparison = -1
			else
				lengthComparison = 1

			for child, index in @children
				return 1 unless b.children[index]?
				c = compare(@children[index], b.children[index])
				if c != 0
					return c

			return lengthComparison

		getVariableUnits: (variable, equivalencies) ->
			variableEquivalencies = if equivalencies? then equivalencies.get(variable) else [variable]
			for child in @children
				if child instanceof terminals.Variable and child.label in variableEquivalencies
					return child.units
				else
					childVariableUnits = child.getVariableUnits(variable, equivalencies)
					if childVariableUnits?
						return childVariableUnits
			return null

		setVariableUnits: (variable, equivalencies, units) ->
			variableEquivalencies = if equivalencies? then equivalencies.get(variable) else {get: (z) -> [z]}
			for child in @children
				child.setVariableUnits(variable, equivalencies, units)

		expand: ->
			# Addition is associative, so expand (+ (+ a b) c) into (+ a b c).
			children = []
			for child in @children
				if child.expand?
					child = child.expand()
				else if child.copy?
					child = child.copy()
				if child instanceof Add
					# If the child is an addition node, add its children as
					# the children of this node.
					for c in child.children
						children.push(c)
				else
					children.push(child)

			add = new Add(children...)
			add.sort()

			return add

		sort: ->
			# Sort this node.
			for child in @children
				child.sort?()
			@children.sort(compare)

		equals: (b, equivalencies) ->
			# Check equality between this and another object.
			unless b instanceof Add
				return false
			unless b.children.length == @children.length
				return false
			for child, index in @children
				if child.equals?
					unless child.equals(b.children[index], equivalencies)
						return false
				else
					unless child == b.children[index]
						return false
			return true

		simplify: (equivalencies) ->
			Mul = require("operators/Mul")

			unless equivalencies?
				equivalencies = {get: (variable) -> [variable]}

			terms = []
			for child in @children
				if child.simplify?
					child = child.simplify(equivalencies)
				else if child.copy?
					child = child.copy()

				terms.push(child)

			# Collect like terms into multiplication.
			liketerms = []
			constantterm = null
			i = 0
			while i < terms.length
				term = terms[i]
				if term instanceof Add
					terms.splice(i, 1)[0]
					# Pull the children into this node (this flattens the addition tree).
					for c in term.children
						terms.push(c)
					i -= 1 # Rewind the loop slightly.
				else if term instanceof terminals.Constant
					if constantterm?
						constantterm = constantterm.add(term)
					else
						constantterm = term.copy()
				else if term instanceof Mul # Might need to expand Mul nodes.
					constanttermmul = null
					variabletermmul = null
					for child in term.children
						if child instanceof terminals.Constant
							if constanttermmul?
								constanttermmul = constanttermmul.multiply(child)
							else
								constanttermmul = child.copy()
						else
							if variabletermmul?
								variabletermmul.children.push(child)
							else
								variabletermmul = new Mul(child)

					if variabletermmul.children.length == 1
						variabletermmul = variabletermmul.children[0]

					if constanttermmul? and (not variabletermmul?)
						if constantterm?
							constantterm = constantterm.add(constanttermmul)
						else
							constantterm = constanttermmul.copy()
					else
						unless constanttermmul?
							constanttermmul = new terminals.Constant("1")

						# Find the var in liketerms.
						# If we find it, add the constant to the total.
						# If we can't find it, add [var, const] to liketerms.
						found = false
						for liketerm, index in liketerms
							if liketerm[0].equals?
								if liketerm[0].equals(variabletermmul, equivalencies)
									liketerms[index][1] = new Add(liketerm[1], constanttermmul)
									liketerms[index][1] = liketerms[index][1].simplify(equivalencies)
									found = true
							else if liketerm[0] == variabletermmul
								liketerms[index][1] = new Add(liketerm[1], constanttermmul)
								liketerms[index][1] = liketerms[index][1].simplify(equivalencies)
								found = true
						unless found
							liketerms.push([variabletermmul, constanttermmul])

				else
					# A unique term. Do we have a copy of it already?
					found = false
					for liketerm, index in liketerms
						if liketerm[0].equals?
							if liketerm[0].equals(term, equivalencies)
								liketerms[index][1] = new Add(liketerm[1], new terminals.Constant("1"))
								liketerms[index][1] = liketerms[index][1].simplify(equivalencies)
								found = true
						else if liketerm[0] == term
							liketerms[index][1] = new Add(liketerm[1], new terminals.Constant("1"))
							liketerms[index][1] = liketerms[index][1].simplify(equivalencies)
							found = true
					unless found
						liketerms.push([term, new terminals.Constant("1")])

				i += 1

			newAdd = null
			for liketerm in liketerms
				if liketerm[0].children? and liketerm[0].children.length == 1
					liketerm[0] = liketerm[0].children[0]
				if liketerm[1].evaluate?() != 1
					newMul = new Mul(liketerm[0], liketerm[1])
					newMul = newMul.simplify(equivalencies)
				else
					newMul = liketerm[0]
				if newAdd?
					newAdd.children.push(newMul)
				else
					newAdd = new Add(newMul)

			unless newAdd?
				return constantterm

			if constantterm? and constantterm.evaluate() != 0
				newAdd.children.push(constantterm)

			newAdd.sort()

			return newAdd unless newAdd.children.length == 1
			return newAdd.children[0]

		expandAndSimplify: (equivalencies) ->
			expr = @expand()
			if expr.simplify?
				return expr.simplify(equivalencies)
			return expr

		solve: (variable, equivalencies=null) ->
			Mul = require("operators/Mul")
			Pow = require("operators/Pow")

			expr = @expandAndSimplify(equivalencies)

			unless equivalencies?
				equivalencies = {get: (variable) -> [variable]}

			# Sort the expression into terms containing v, and terms not containing v.
			# Since we expanded, every term we deal with should be either a Mul with v as a direct
			# child, a Pow with v as the left child, or the latter in a Mul.

			termsContainingVariable = []
			termsNotContainingVariable = []

			variableUnits = null
			for equiv in equivalencies
				units = @getVariableUnits(equiv)
				if units?
					variableUnits = units
					break

			if expr instanceof terminals.Terminal
				if expr instanceof terminals.Variable and (expr.label == variable or expr.label in equivalencies.get(variable))
					return [new terminals.Constant("0")]
				else
					throw new AlgebraError(expr.toString(), variable)

			unless expr instanceof Add
				return expr.solve(variable, equivalencies)

			for term in expr.children
				if term.copy?
					term = term.copy()

				if term instanceof Pow
					if term.children.left instanceof terminals.Variable and (term.children.left.label == variable or term.children.left.label in equivalencies.get(variable))
						termsContainingVariable.push(term)
					else
						termsNotContainingVariable.push(term)
				else if term instanceof Mul
					added = false
					for subterm in term.children
						if subterm instanceof terminals.Variable and (subterm.label == variable or subterm.label in equivalencies.get(variable))
							termsContainingVariable.push(term)
							added = true
							break
						else if (
							subterm instanceof Pow and
							subterm.children.left instanceof terminals.Variable and
							(subterm.children.left.label == variable or subterm.children.left.label in equivalencies.get(variable)))
							termsContainingVariable.push(term)
							added = true
							break

					unless added
						termsNotContainingVariable.push(term)
				else if term instanceof terminals.Variable and (term.label == variable or term.label in equivalencies.get(variable))
					termsContainingVariable.push(term)
				else
					termsNotContainingVariable.push(term)

			if termsContainingVariable.length == 0
				throw new AlgebraError(expr.toString(), variable)

			# The rest of the terms need to be manipulated to solve the equation.
			# (a * v) + (b * v) -> ((a + b) * v)
			# (a * v) + (b * v) + (c * (v ** 2)) -> ((a + b) * v) + (c * (v ** 2))
			# If we detect a power > 2, reject the equation.

			# Not everything can be solved this way. At this point we could have
			# one of these:
			# 0 = a + b / v + c / (v ** 2)
			# 0 = a + b / v
			# 0 = a + b / (v ** 2)
			# 0 = a + v + b / v
			# 0 = a + v ** 2 + b / v (not solvable)
			# 0 = a + v + v ** 2 + 1 / v (not solvable)

			factorised = [] # (a + b) in the above example.
			factorisedSquares = [] # c in the above example.
			inversed = [] # Handles 1/v and v**-1.
			inversedSquares = [] # Handles 1/v**2 and v**-2.

			for term in termsContainingVariable
				if term instanceof terminals.Variable
					factorised.push(new terminals.Constant("1"))
				else if term instanceof Pow
					unless term.children.right instanceof terminals.Constant
						throw new AlgebraError(expr.toString(), variable)
					power = term.children.right.evaluate()
					if term.children.left instanceof terminals.Variable and (term.children.left.label == variable or term.children.left.label in equivalencies.get(variable))
						if power == 1
							factorised.push(new terminals.Constant("1"))
						else if power == 2
							factorisedSquares.push(new terminals.Constant("1"))
						else if power == -1
							inversed.push(new terminals.Constant("1"))
						else if power == -2
							inversedSquares.push(new terminals.Constant("1"))
						else
							throw new AlgebraError(expr.toString(), variable, " (not supported)")
					else
						# I don't think this should happen, ever?
						throw new AlgebraError(expr.toString(), variable, " (this shouldn't happen)")
				else if term instanceof Mul
					subterms = [] # Non-variable terms.
					quadratic = false
					inv = false
					invSquare = false
					for subterm in term.children
						if subterm instanceof terminals.Variable and (subterm.label == variable or subterm.label in equivalencies.get(variable)) then # pass
						else if subterm instanceof Pow
							unless subterm.children.right instanceof terminals.Constant
								throw new AlgebraError(expr.toString(), variable)
							power = subterm.children.right.evaluate()
							if subterm.children.left instanceof terminals.Variable and (subterm.children.left.label == variable or subterm.children.left.label in equivalencies.get(variable))
								if power == 1 then # pass
								else if power == 2
									quadratic = true # We operate on the assumption that there's only one term with our target variable in it here.
									# This should be possible due to expandAndSimplify.
								else if power == -1
									inv = true
								else if power == -2
									invSquare = true
								else
									throw new AlgebraError(expr.toString(), variable, " (not supported)")
							else
								subterms.push(subterm)
						else
							subterms.push(subterm)

					factorisedTerm = if subterms.length > 0 then new Mul(subterms...) else new terminals.Constant("1")
					if quadratic
						factorisedSquares.push(factorisedTerm)
					else if inv
						inversed.push(factorisedTerm)
					else if invSquare
						inversedSquares.push(factorisedTerm)
					else
						factorised.push(factorisedTerm)

			negatedTerms = []
			# Terms not containing the variable need to be negated. They will form part of the returned result.
			for term in termsNotContainingVariable
				newMul = new Mul("-1", (if term.copy? then term.copy() else term))
				newMul = newMul.simplify(equivalencies)
				negatedTerms.push(newMul)

			negatedTermsEquatable = new Add(negatedTerms...) unless negatedTerms.length == 0
			nonNegatedTermsEquatable = new Add(termsNotContainingVariable...) unless termsNotContainingVariable.length == 0
			factorisedEquatable = new Add(factorised...) unless factorised.length == 0
			factorisedSquaresEquatable = new Add(factorisedSquares...) unless factorisedSquares.length == 0
			inversedEquatable = new Add(inversed...) unless inversed.length == 0
			inversedSquaresEquatable = new Add(inversedSquares...) unless inversedSquares.length == 0

			# Let's just... enumerate everything. That will probably work.

			if negatedTerms.length == 0
				negatedTermsEquatable = new terminals.Constant("0")

			if factorisedSquares.length == 0
				## Outdated comment follows:
				# We now have terms on the other side of the equation (negatedTermsEquatable) and
				# terms factorised out from this side of the equation (factorisedEquatable).
				# (factorisedEquatable * v) = negatedTermsEquatable
				# Hence the solution is simply (negatedTermsEquatable * (factorisedEquatable ** -1)).
				## Saved for posterity. New comment follows:
				# There are no squares in the equation.
				if factorised.length == 0
					# There are no standalone variables in the equation.
					if inversed.length == 0
						# There are no standalones or squares or inversed variables.
						if inversedSquares.length == 0
							# There is nothing. There is nothing here. All is lost.
							throw new AlgebraError(expr.toString(), variable)
						else
							# We have only inversed squares.
							# -a = b/v**2
							# v = +/(b/-a)**1/2
							answer = new Mul(new Pow(inversedSquaresEquatable, "1/2"), new Pow(negatedTermsEquatable, "-1/2"))
							a1 = new Mul(-1, answer.copy())
							a1 = a1.expandAndSimplify(equivalencies)
							a2 = answer.expandAndSimplify(equivalencies)
							if a1.equals?(a2)
								return [a1]
							else
								return [a1, a2]
					else
						# There are no standalones, but there are inversed variables.
						if inversedSquares.length == 0
							# We only have inversed variables.
							# -a = b/v
							# v = b/-a
							answer = new Mul(inversedEquatable, new Pow(negatedTermsEquatable, "-1"))
							return [answer.expandAndSimplify(equivalencies)]
						else
							# We have inversed variables and inversed squares.
							# -a = b/v + c/v**2
							# Ewwwww
							# Ewwwwwwwwwwwwwwwwwww
							# 0 = a + b/v + c/v**2
							# 0 = a v**2 + b v + c
							newAdd = new Add(new Mul(nonNegatedTermsEquatable, new Pow(new terminals.Variable(variable, variableUnits), 2)),
								new Mul(inversedEquatable, new terminals.Variable(variable, variableUnits)),
								inversedSquaresEquatable)
							return newAdd.solve(variable, equivalencies)
				else if inversed.length == 0
					# There are standalone variables, but there aren't any inversed ones.
					if inversedSquares.length == 0
						# There are no inversed squares, so there are just standalone variables.
						# -a = b v
						# v = -a / b
						answer = new Mul(negatedTermsEquatable, new Pow(factorisedEquatable, "-1"))
						return [answer.expandAndSimplify(equivalencies)]
					else
						# There are inversed squares and standalone variables.
						# That's a cubic, c'mon.
						# Technically, this is solvable if negatedTerms.length == 0, but
						# is that ever likely to actually happen?
						## FIXME
						throw new AlgebraError(expr.toString(), variable, " (not supported)")
				# else if inversedSquares.length == 0
					# There are standalone variables and inversed variables, but there aren't any
					# inversed squares.
					# This actually exhausts all possibilities, so I'll comment this else out for clarity.
				else
					# There are standalone variables and inversed variables and inversed squares,
					# so this is unsolvable.
					throw new AlgebraError(expr.toString(), variable, " (not supported)")
			else if factorised.length == 0
				# We have squared terms, but no standalone terms.
				if inversed.length == 0
					# We have squared terms, but no standalone terms or inversed terms.
					if inversedSquares.length == 0
						# There are no inversed squares, so there is only squared terms.
						# -a = b v**2
						# v**2 = -a / b
						answer = new Pow(new Mul(negatedTermsEquatable, new Pow(factorisedSquaresEquatable, "-1")), "1/2")
						a1 = new Mul("-1", answer.copy())
						a1 = a1.expandAndSimplify(equivalencies)
						a2 = answer.expandAndSimplify(equivalencies)
						if a1.equals?(a2)
							return [a1]
						else
							return [a1, a2]
					else
						# We have squared terms and inverse squared terms.
						# That is a quartic, and as quartics are a danger to the very moral fabric of our
						# society, we don't solve them here.
						## FIXME: This is solvable if negatedTerms.length == 0.
						throw new AlgebraError(expr.toString(), variable, " (not supported)")
				else
					# We have squares and we have inversed variables, so this is usually unsolvable, except if
					# inversed squares and negated terms are both of 0 length.
					## FIXME: Deal with that situation.
					throw new AlgebraError(expr.toString(), variable, " (not supported)")
			else
				# There are squares and standalone variables. Unsolvable if we have any inverses whatsoever.
				if inversed.length > 0 or inversedSquares.length > 0
					throw new AlgebraError(expr.toString(), variable, " (not supported)")

				# We have a quadratic equation.
				# ((factorisedSquaresEquatable) * (v ** 2)) + (factorisedEquatable * v) + (nonNegatedTerms) = 0
				if nonNegatedTermsEquatable?
					# a = fSE
					# b = fE
					# c = nonNegatedTermsEquatable
					# d = ((b ** 2) + (-4 * a * c))
					# rd = (d ** 1/2)
					# v = ((-1 * b) + rd) * ((2 * a) ** -1)
					# v = (-1 * (b + rd)) * ((2 * a) ** -1)
					a = factorisedSquaresEquatable
					b = factorisedEquatable
					c = nonNegatedTermsEquatable
					d = new Add(
							new Pow(b, "2"),
							new Mul("-4", a, c)
						)
					rd = new Pow(d, "1/2")
					v1 = new Mul(
							new Add(
								new Mul("-1", b),
								rd),
							new Pow(
								new Mul("2", a),
								"-1")
						)
					v2 = new Mul("-1", new Add(b, rd), new Pow(new Mul("2", a), "-1"))
					v1 = v1.expandAndSimplify(equivalencies)
					v2 = v2.expandAndSimplify(equivalencies)
					if v1.equals? and v1.equals(v2)
						return [v1]
					return [v1, v2]
				else
					# (((fSE * v) + fE) * v) = 0
					# v = 0
					# v = (-1 * fE * (fSE ** -1)))
					newPow = new Pow(factorisedSquaresEquatable, "-1")
					newMul = new Mul("-1", factorisedEquatable, newPow)
					newMul = newMul.simplify(equivalencies)
					return [0, newMul]

		getAllVariables: ->
			variables = {}
			for child in @children
				if child instanceof terminals.Variable
					variables[child.label] = true
				else if child.getAllVariables?
					childVariables = child.getAllVariables()
					for variable in childVariables
						variables[variable] = true

			outVariables = []
			for variable of variables
				outVariables.push(variable)

			return outVariables

		replaceVariables: (replacements) ->
			children = []
			for child, index in @children
				if child instanceof terminals.Variable and child.label of replacements
					children.push(child.copy())
					children[index].label = replacements[child.label]
				else if child.replaceVariables?
					children.push(child.replaceVariables(replacements))
				else
					children.push(child.copy())

			return new Add(children...)

		sub: (substitutions, uncertaintySubstitutions, equivalencies=null, assumeZeroUncertainty=false, evaluateSymbolicConstants=false) ->
			# substitutions: {variable: value}
			# variable is a label, value is any object - if it is a node,
			# it will be substituted in; otherwise it is interpreted as a
			# constant (and any exceptions that might cause will be thrown).

			# Interpret substitutions.
			for variable of substitutions
				unless substitutions[variable].copy? # All nodes and terminals should implement this.
					substitutions[variable] = new terminals.Constant(substitutions[variable])

			unless equivalencies?
				equivalencies = {get: (z) -> [z]}

			children = []
			for child in @children
				if child instanceof terminals.Variable
					variableEquivalencies = equivalencies.get(child.label)
					subbed = false
					for equiv in variableEquivalencies
						if equiv of substitutions
							children.push(substitutions[equiv].copy())
							subbed = true
							break
					unless subbed
						children.push(child.copy())
				else if child.sub?
					children.push(child.sub(substitutions, uncertaintySubstitutions, equivalencies, assumeZeroUncertainty, evaluateSymbolicConstants))
				else
					children.push(child.copy())

			newAdd = new Add(children...)
			newAdd = newAdd.expandAndSimplify(equivalencies)
			return newAdd

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
				childrenExpressions = []
				for child in @children
					if child instanceof terminals.Variable and (child.label == variable or child.label in variableEquivalencies)
						childrenExpressions.push([expression.copy()])
					else if child.substituteExpression?
						childrenExpressions.push(child.substituteExpression(expression, variable, equivalencies))
					else
						childrenExpressions.push([child.copy()])

				# childrenExpressions is now an array of arrays. We want every combination of them.
				childrenArray = combinations(childrenExpressions)

			for children in childrenArray
				newAdd = new Add(children...)
				results.push(newAdd.expandAndSimplify(equivalencies))

			return results

		toHTML: (equationID, expression=false, equality="0", topLevel=false) ->
			# Return an HTML string representing this node.
			[mathClass, mathID, html] = generateInfo.getHTMLInfo(equationID, expression, equality)

			unless topLevel
				html = ""
				closingHTML = ""
			else
				closingHTML = "</div>"

			return html + @children.map((child) -> child.toHTML()).join("+") + closingHTML

		toDrawingNode: ->
			AddNode = prettyRender.Add
			return AddNode.makeWithBrackets(@children.map((term) -> term.toDrawingNode())...)

		differentiate: (variable) ->
			newChildren = @children.map (x) -> x.differentiate(variable)

			derivative = new Add(newChildren...)

			return derivative.expandAndSimplify()