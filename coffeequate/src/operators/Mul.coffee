define ["nodes", "terminals", "generateInfo", "AlgebraError", "parseArgs", "require", "compare"], (nodes, terminals, generateInfo, AlgebraError, parseArgs, require, compare) ->

	# Represent multiplication as a node.

	return class Mul extends nodes.RoseNode

		constructor: (args...) ->
			if args.length < 1
				throw new Error("Mul nodes must have at least one child.")

			@cmp = -2

			args = parseArgs(args...)
			super("*", args)

		copy: ->
			args = ((if i.copy? then i.copy() else i) for i in @children)
			return new Mul(args...)

		simplifyConstants: ->
			constantterm = new terminals.Constant("1")
			variableterm = null

			for child in @children
				if child instanceof terminals.Constant
					constantterm = constantterm.multiply(child)
				else
					if variableterm?
						variableterm.children.push(child)
					else
						variableterm = new Mul(child)

			unless variableterm?
				return constantterm
			if constantterm.evaluate() == 1
				return variableterm

			return new Mul(constantterm, variableterm)

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

		@expandMulAdd: (mul, add) ->
			Add = require("operators/Add")
			# Multiply out.
			results = []
			for child in add.children
				if child.copy?
					child = child.copy()

				if child instanceof Mul
					newMul = mul.copy()
					for c in child.children
						newMul.children.push(c)
				else if child instanceof Add
					newMul = Mul.expandMulAdd(mul, child)
				else
					if mul.children.length == 1
						newMul = mul.copy()
						newMul.children.push(child.copy())
					else
						newMul = new Mul(mul.copy(), child.copy())

				results.push(newMul)

			# The results should be put into an addition node.
			newAdd = new Add(results...)
			newAdd = newAdd.expand()
			return newAdd

		equals: (b, equivalencies) ->
			# Check equality between this and another object.
			unless b instanceof Mul
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

		expand: ->
			Add = require("operators/Add")
			# Multiplication is distributive over addition, as well as associative, so
			# we'll need to cover both cases.
			# We will need to multiply out. This returns an addition node!
			# a * (b + c) -> (a * b) + (a * c)
			# If you have multiple multiplications, then you need to expand in a more clever way.
			# a * b * (c + d) -> (a * b * c) + (a * b * d)
			# As far as I can tell, it's just multiplying all of the Add children
			# by all of the Mul children.
			# What about having multiple adds?
			# a * (b + c) * (d + e) -> (a * b + a * c) * (d + e) -> ((a * b + a * c) * d) + ((a * b + a * c) * e) -> ew
			# That's awful. We'll need to do this in a better way. It seems that we're just multiplying along though.
			# What if we just set the children to each product? Hmmm.
			# a * b * c -> (a * b) * c might work!
			# Then just expand again.
			term = []
			for child in @children
				if child.expand?
					child = child.expand()
				else if child.copy?
					child = child.copy()

				term.push(child)

			# Now we collapse this array.
			while term.length > 1
				# What is the first term?
				if term[0] instanceof Mul
					if term[1] instanceof Add
						term[0] = Mul.expandMulAdd(term[0], term.splice(1, 1)[0])

					else if term[1] instanceof Mul
						# Add children to term[0].
						for child in term.splice(1, 1)[0].children
							term[0].children.push(child)

					else
						# Add the whole term to term[0].
						term[0].children.push(term.splice(1, 1)[0])

				else if term[0] instanceof Add
					if term[1] instanceof Add
						# Of the form (a + b) * (c + d), with any number of children.
						# Expand.
						results = []
						for child in term[0].children
							newMul = new Mul(child, term[1])
							newMul = newMul.expand()
							results.push(newMul)
						term.splice(1, 1)
						term[0] = new Add(results...)
						term[0] = term[0].expand()

					else if term[1] instanceof Mul
						# Multiply out!
						term[0] = Mul.expandMulAdd(term.splice(1, 1)[0], term[0])

					else
						# Multiply the terms together.
						term[0] = new Mul(term[0], term.splice(1, 1)[0])

				else
					term[0] = new Mul(term[0])

			# The terms should be ordered.
			term[0].sort?()

			return term[0]

		simplify: (equivalencies) ->

			Add = require("operators/Add")
			Pow = require("operators/Pow")

			# Generate an equivalencies index if necessary.
			if not equivalencies?
				equivalencies = {get: (variable) -> [variable]}

			terms = []
			for child in @children
				if child.simplify?
					child = child.simplify(equivalencies)
				else if child.copy?
					child = child.copy()

				terms.push(child)

			# Collect like terms into powers.
			liketerms = []
			constantterm = null
			i = 0
			while i < terms.length
				term = terms[i]
				if term instanceof Mul
					child = terms.splice(i, 1)[0]
					# Pull the children into this node (this flattens the multiplication tree).
					for c in child.children
						terms.push(c)
					i -= 1 # Rewind the loop slightly.
				else if term instanceof terminals.Constant
					if constantterm?
						constantterm = constantterm.multiply(term)
					else
						constantterm = term.copy()
				else if term instanceof Pow # Might need to expand Pow nodes.
					base = term.children.left
					power = term.children.right
					# Find the base in liketerms.
					# If we find the base, add power to the power.
					# If we can't find the base, add [base, power] to liketerms.
					found = false
					for liketerm, index in liketerms
						if liketerm[0].equals?
							if liketerm[0].equals(base, equivalencies)
								liketerms[index][1] = new Add(liketerm[1], power)
								liketerms[index][1] = liketerms[index][1].simplify(equivalencies)
								if liketerms[index][1].children?.length == 1
									liketerms[index][1] = liketerms[index][1].children[0]
								found = true
						else if liketerm[0] == base
							liketerms[index][1] = new Add(liketerm[1], power)
							liketerms[index][1] = liketerms[index][1].simplify(equivalencies)
							if liketerms[index][1].children?.length == 1
								liketerms[index][1] = liketerms[index][1].children[0]
							found = true
					unless found
						liketerms.push([base, power])

				else
					# A unique term. Do we have a copy of it already?
					found = false
					for liketerm, index in liketerms
						if liketerm[0].equals?
							if liketerm[0].equals(term, equivalencies)
								liketerms[index][1] = new Add(liketerm[1], new terminals.Constant("1"))
								liketerms[index][1] = liketerms[index][1].simplify(equivalencies)
								if liketerms[index][1].children?.length == 1
									liketerms[index][1] = liketerms[index][1].children[0]
								found = true
						else if liketerm[0] == term
							liketerms[index][1] = new Add(liketerm[1], new terminals.Constant("1"))
							liketerms[index][1] = liketerms[index][1].simplify(equivalencies)
							if liketerms[index][1].children?.length == 1
								liketerms[index][1] = liketerms[index][1].children[0]
							found = true
					unless found
						liketerms.push([term, new terminals.Constant("1")])

				i += 1

			if constantterm?.evaluate?() == 0
				return new terminals.Constant("0")

			newMul = null
			for liketerm in liketerms
				if liketerm[1].evaluate?() != 1
					newPow = new Pow(liketerm[0], liketerm[1])
					newPow = newPow.simplify(equivalencies)
				else
					newPow = liketerm[0]
				if newMul?
					newMul.children.push(newPow)
				else
					newMul = new Mul(newPow)

			unless newMul?
				return constantterm

			if constantterm? and constantterm.evaluate() != 1
				newMul.children.push(constantterm)

			newMul.sort()

			# Is the result here just numerical?
			numerical = true
			for child in newMul.children
				unless child instanceof terminals.Constant
					numerical = false
					break

			if numerical
				return newMul.simplifyConstants()

			return newMul unless newMul.children.length == 1
			return newMul.children[0]

		sort: ->
			# Sort this node.
			for child in @children
				child.sort?()
			@children.sort(compare)

		expandAndSimplify: (equivalencies) ->
			expr = @expand()
			if expr.simplify?
				return expr.simplify(equivalencies)
			return expr

		solve: (variable, equivalencies=null) ->
			Pow = require("operators/Pow")

			expr = @expandAndSimplify(equivalencies)

			unless equivalencies?
				equivalencies = {get: (variable) -> [variable]}

			# If one of the children is either
			# - v
			# - (v ** p)
			# then return 0 or solve the latter, respectively.
			# Else unsolvable.

			if expr instanceof terminals.Terminal
				if expr instanceof terminals.Variable and (expr.label == variable or expr.label in equivalencies.get(variable))
					return [new terminals.Constant("0")]
				else
					throw new AlgebraError(expr.toString(), variable)

			unless expr instanceof Mul
				return expr.solve(variable, equivalencies)

			for child in expr.children
				if child instanceof terminals.Variable and (child.label == variable or child.label in equivalencies.get(variable))
					return [new terminals.Constant("0")]
				else if child instanceof Pow
					try
						return child.solve(variable, equivalencies)
					catch error
						if error instanceof AlgebraError
							continue
						else
							throw error
			throw new AlgebraError(expr.toString(), variable)

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
			for child, index in @children
				if child instanceof terminals.Variable and child.label of replacements
					@children[index].label = replacements[child.label]
				else if child.replaceVariables?
					child.replaceVariables(replacements)

		sub: (substitutions, equivalencies=null) ->
			# subtitutions: {variable: value}
			# variable is a label, value is any object - if it is a node,
			# it will be substituted in; otherwise it is interpreted as a
			# constant (and any exceptions that might cause will be thrown).

			# Interpret substitutions.
			for variable of substitutions
				unless substitutions[variable] instanceof terminals.Terminal or substitutions[variable] instanceof nodes.BasicNode
					substitutions[variable] = new terminals.Constant(substitutions[variable])

			children = []
			for child in @children
				if child instanceof terminals.Variable and child.label of substitutions
					children.push(substitutions[child.label].copy())
				else if child.sub?
					children.push(child.sub(substitutions))
				else
					children.push(child.copy())

			newMul = new Mul(children...)
			newMul = newMul.expandAndSimplify(equivalencies)
			return newMul

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
				children = []
				for child in @children
					if child instanceof terminals.Variable and (child.label == variable or child.label in variableEquivalencies)
						children.push(expression.copy())
					else if child.substituteExpression?
						for i in child.substituteExpression(expression, variable, equivalencies)
							children.push(i)
					else
						children.push(child.copy())
				newMul = new Mul(children...)
				results.push(newMul.expandAndSimplify(equivalencies))

			return results

		toMathML: (equationID, expression=false, equality="0", topLevel=false) ->
			Add = require("operators/Add")
			Pow = require("operators/Pow")

			# Return a MathML string representing this node.
			[mathClass, mathID, html] = generateInfo.getMathMLInfo(equationID, expression, equality)

			unless topLevel
				html = ""
				closingHTML = ""
			else
				closingHTML = "</math></div>"

			# Sort the children into terms with positive exponents and terms with negative exponents.
			denominator = ((new Pow(child, "-1")).simplify() for child in @children when (child instanceof Pow and child.children.right.evaluate? and child.children.right.evaluate() < 0))
			numerator = (child for child in @children when not (child instanceof Pow and child.children.right.evaluate? and child.children.right.evaluate() < 0))

			numeratorWithoutNegatives = numerator.filter((child) -> not (child instanceof terminals.Constant and child.evaluate?() == -1))
			denominatorWithoutNegatives = denominator.filter((child) -> not (child instanceof terminals.Constant and child.evaluate?() == -1))
			negativeCount = denominator.length - denominatorWithoutNegatives.length + numerator.length - numeratorWithoutNegatives.length

			if denominator.length > 0 and numerator.length > 0

				return html + ("<mo>-</mo>" for i in [0...negativeCount]).join("") + "<mfrac><mrow>" + numeratorWithoutNegatives.map(
					(child) ->
						# Fence nodes with lower precedence - that is, addition nodes.
						if child instanceof Add
							"<mfenced>" + child.toMathML(equationID, expression) + "</mfenced>"
						else
							child.toMathML(equationID, expression)
				).join("<mo>&middot;</mo>") + "</mrow><mrow>" + denominatorWithoutNegatives.map(
					(child) ->
						# Fence nodes with lower precedence - that is, addition nodes.
						if child instanceof Add
							"<mfenced>" + child.toMathML(equationID, expression) + "</mfenced>"
						else
							child.toMathML(equationID, expression)
				).join("<mo>&middot;</mo>") + "</mrow></mfrac>" + closingHTML

			else if denominator.length > 0
				return html + ("<mo>-</mo>" for i in [0...negativeCount]).join("") + "<mfrac><mn>1</mn><mrow>" + denominatorWithoutNegatives.map(
					(child) ->
						# Fence nodes with lower precedence - that is, addition nodes.
						if child instanceof Add
							"<mfenced>" + child.toMathML(equationID, expression) + "</mfenced>"
						else
							child.toMathML(equationID, expression)
				).join("<mo>&middot;</mo>") + "</mrow></mfrac>" + closingHTML

			else if numerator.length > 0
				return html + ("<mo>-</mo>" for i in [0...negativeCount]).join("") + "<mrow>" + numeratorWithoutNegatives.map(
					(child) ->
						# Fence nodes with lower precedence - that is, addition nodes.
						if child instanceof Add
							"<mfenced>" + child.toMathML(equationID, expression) + "</mfenced>"
						else
							child.toMathML(equationID, expression)
				).join("<mo>&middot;</mo>") + "</mrow>" + closingHTML

			else
				throw new Error("No terms in Mul node.")

		toHTML: (equationID, expression=false, equality="0", topLevel=false) ->
			Add = require("operators/Add")

			# Return an HTML string representing this node.
			[mathClass, mathID, html] = generateInfo.getHTMLInfo(equationID, expression, equality)

			unless topLevel
				html = ""
				closingHTML = ""
			else
				closingHTML = "</div>"

			return html + @children.map(
				(child) ->
					if child instanceof Add
						"(" + child.toHTML() + ")"
					else
						child.toHTML()
				).join("&middot;") + closingHTML

		toLaTeX: ->
			Add = require("operators/Add")

			# Return a LaTeX string representing this node.
			return @children.map(
				(child) ->
					if child instanceof Add
						"\\left(" + child.toLaTeX() + "\\right)"
					else
						child.toLaTeX()
				).join(" \\cdot ")