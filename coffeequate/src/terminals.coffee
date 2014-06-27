define ["parse", "generateInfo", "nodes", "prettyRender", "constants"], (parse, generateInfo, nodes, prettyRender, constants) ->

	# Terminals for the equation tree.

	class Terminal extends nodes.BasicNode
		# Base class for terminals.
		constructor: (@label) ->

		# Question for Matt: why do the next two functions exist?
		# I would have thought they should raise a NotImplementedError
		evaluate: ->

		copy: ->
			return new Terminal(@label)

	class Constant extends Terminal
		# Constants in the equation tree, e.g. 0.5 or 1/2.
		# Can be represented as a RATIONAL (1/2) or a FLOAT (0.5).
		# If a constant is produced by a negative exponentiation (or division, but CQ doesn't use that)
		# then it becomes a rational. If it is entered as an integer then it will also be a rational.
		# If it is entered as a float, then it remains a float.
		# Rational * Rational -> Rational
		# Rational * Float -> Float
		# Float * Float -> Float
		constructor: (@numerator, @denominator=1, @mode="rational") ->
			@cmp = -6

			switch @mode
				when "rational"
					@numerator = parseInt(@numerator)
					@denominator = parseInt(@denominator)
					@simplifyInPlace()
				when "float"
					@numerator = parseFloat(@numerator)
					@denominator = parseFloat(@denominator)
					@numerator /= @denominator
					@denominator = 1

		evaluate: ->
			parseFloat(@numerator/@denominator)

		copy: ->
			return new Constant(@numerator, @denominator, @mode)

		compareSameType: (b) ->
			# Compare this object with another of the same type.
			if @evaluate() < b.evaluate()
				return -1
			else if @evaluate() == b.evaluate()
				return 0
			else
				return 1

		mul: (b) ->
			# Multiply by another constant and return the result.
			if @mode == b.mode
				newMode = @mode
			else
				newMode = "float"

			return new Constant(@numerator * b.numerator, @denominator * b.denominator, newMode)

		add: (b) ->
			# Add another constant and return the result.
			if @mode == b.mode
				newMode = @mode
			else
				newMode = "float"

			return new Constant(b.denominator * @numerator + @denominator * b.numerator, @denominator * b.denominator, newMode)

		pow: (b) ->
			# Put this constant to the power of another constant and return the result.
			if @mode == "rational"
				if b.mode == "rational"
					flip = false # Whether to invert the fraction (for negative powers).
					# Sort out the power so there's no negative numbers in it.
					if b.numerator < 0 and b.denominator < 0
						b = new Constant(-b.numerator, -b.denominator)
					else if b.numerator > 0 and b.denominator < 0
						flip = true
						b = new Constant(b.numerator, -b.denominator)
					else if b.numerator < 0 and b.denominator > 0
						flip = true
						b = new Constant(-b.numerator, b.denominator)

					# No matter what, we're going to be raising everything to a power.
					num = Math.pow(@numerator, b.numerator)
					den = Math.pow(@denominator, b.numerator)

					if flip
						con = new Constant(den, num, "rational")
					else
						con = new Constant(num, den, "rational")

					# Depending on whether or not the exponent is an integer, we might also need to root this.
					if b.denominator == 1
						# Integer. Just put the numerator and denominator of this constant to this power.
						return con
					else
						# Fraction. Put everything to the power and then root the whole thing using another pow.
						# This is a bit weird if you think about it - the pow method is actually returning a Pow -
						# but you can think about this as an "irreducible" power.
						operators = require("operators")
						return new operators.Pow(con, new Constant(1, b.denominator, "rational"))

				else
					# We're returning a float here, so this is very easy!
					return new Constant(Math.pow(@evaluate(), b.evaluate()), 1, "float")
			else
				# Also returning a float.
				return new Constant(Math.pow(@evaluate(), b.evaluate()), 1, "float")

		equals: (b) ->
			# Test equality between this object and another.
			unless b instanceof Constant
				return false
			return @evaluate() == b.evaluate()

		replaceVariables: (replacements) ->
			@copy() # Does nothing - this is a constant.

		getAllVariables: ->
			[]

		sub: (substitutions, uncertaintySubstitutions) ->
			@copy()

		simplifyInPlace: ->
			# Get the greatest common divisor.
			a = @numerator
			b = @denominator
			until b == 0
				[a, b] = [b, Math.round(a % b * 10) / 10] # Floating point errors.
			gcd = a

			# Divide out.
			@numerator /= gcd
			@numerator = Math.round(@numerator*10)/10 # Floating point errors.
			@denominator /= gcd
			@denominator = Math.round(@denominator*10)/10

		simplify: ->
			constant = @copy()
			constant.simplifyInPlace()
			return constant

		expand: ->
			@copy()

		expandAndSimplify: ->
			@simplify()

		substituteExpression: (sourceExpression, variable, equivalencies) ->
			[@copy()]

		getUncertainty: ->
			new Constant(0)

		getVariableUnits: ->
			null

		setVariableUnits: (variable, equivalencies, units) ->
			null

		toDrawingNode: ->
			NumberNode = prettyRender.Number
			FractionNode = prettyRender.Fraction
			if @denominator == 1
				return new NumberNode(@numerator)
			return new FractionNode(new NumberNode(@numerator), new NumberNode(@denominator))

		differentiate: (variable) ->
			return new Constant(0)

	class SymbolicConstant extends Terminal
		# Symbolic constants in the equation tree, e.g. Ï€
		constructor: (@label, @value=null, @units=null) ->
			@cmp = -5

		copy: ->
			return new SymbolicConstant(@label, @value, @units)

		compareSameType: (b) ->
			# Compare this object with another of the same type.
			if @label < b.label
				return -1
			else if @label == b.label
				return 0
			else
				return 1

		evaluate: ->
			@value

		equals: (b) ->
			unless b instanceof SymbolicConstant
				return false
			return @label == b.label and @value == b.value

		replaceVariables: (replacements) ->
			@copy() # Does nothing - this is a constant.

		getAllVariables: ->
			[]

		sub: (substitutions, uncertaintySubstitutions, equivalencies=null, assumeZeroUncertainty=false, evaluateSymbolicConstants=false) ->
			unless evaluateSymbolicConstants
				return @copy()
			if @label of constants
				return new Constant(constants[@label])

		simplify: ->
			@copy()

		expand: ->
			@copy()

		expandAndSimplify: ->
			@copy()

		substituteExpression: (sourceExpression, variable, equivalencies) ->
			[@copy()]

		getUncertainty: ->
			new Constant(0)

		getVariableUnits: ->
			null

		setVariableUnits: (variable, equivalencies, units) ->
			null

		toDrawingNode: ->
			VariableNode = prettyRender.Variable
			return new VariableNode(@label, "constant symbolic-constant")

		differentiate: (variable) ->
			return new Constant(0)

	class Variable extends Terminal
		# Variables in the equation tree, e.g. m
		constructor: (@label, @units=null) ->
			@cmp = -4

		copy: ->
			return new Variable(@label, @units)

		compareSameType: (b) ->
			# Compare this object with another of the same type.
			if @label < b.label
				return -1
			else if @label == b.label
				return 0
			else
				return 1

		equals: (b, equivalencies=null) ->
			# Check equality between this and some other object.
			unless b instanceof Variable
				return false

			if equivalencies?
				return @label in equivalencies.get(b.label)
			else
				return b.label == @label

		replaceVariables: (replacements) ->
			copy = @copy()
			if @label of replacements
				copy.label = replacements[@label]
			return copy

		getAllVariables: ->
			[@label]

		sub: (substitutions, uncertaintySubstitutions) ->
			if @label of substitutions
				substitute = substitutions[@label]
				if substitute.copy?
					return substitute.copy()
				else
					return new Constant(substitute)
			else
				return @copy()

		substituteExpression: (sourceExpression, variable, equivalencies=null, eliminate=false) ->
			# Replace all instances of a variable with an expression.

			# Generate an equivalencies index if necessary.
			if not equivalencies?
				equivalencies = {get: (variable) -> [variable]}

			variableEquivalencies = equivalencies.get(variable)

			# Eliminate the target variable if set to do so.
			if eliminate
				sourceExpressions = sourceExpression.solve(variable)
			else
				sourceExpressions = [sourceExpression]
			if @label == variable or @label in variableEquivalencies
				return (e.copy() for e in sourceExpressions)
			else
				return [@copy()]

		getUncertainty: ->
			new Uncertainty(@label)

		getVariableUnits: (variable, equivalencies) ->
			if equivalencies?
				if @label in equivalencies.get(variable)
					return @units
			else if @label == variable
				return @units
			return null

		setVariableUnits: (variable, equivalencies, units) ->
			if equivalencies?
				if @label in equivalencies.get(variable)
					@units = units
			else if @label == variable
				@units = units

		simplify: ->
			@copy()

		expand: ->
			@copy()

		expandAndSimplify: ->
			@copy()

		toDrawingNode: ->
			VariableNode = prettyRender.Variable
			return new VariableNode(@label)

		differentiate: (variable) ->
			if variable == @label
				return new Constant(1)
			return new Constant(0)

	class Uncertainty extends Terminal
		# Uncertainty in the equation tree, e.g. sigma_m
		constructor: (@label) ->
			# Matt: what do I do here?
			@cmp = -4.5

		copy: ->
			return new Uncertainty(@label)

		compareSameType: (b) ->
			# Compare this object with another of the same type.
			if @label < b.label
				return -1
			else if @label == b.label
				return 0
			else
				return 1

		# Before commit: think about this more before asking Matt
		# Matt: should we do this?
		equals: (b, equivalencies=null) ->
			# Check equality between this and some other object.
			unless b instanceof Uncertainty
				return false

			if equivalencies?
				return @label in equivalencies.get(b.label)
			else
				return b.label == @label

		replaceVariables: (replacements) ->
			copy = @copy()
			if @label of replacements
				copy.label = replacements[@label]
			return copy

		getAllVariables: ->
			[@label]

		sub: (substitutions, uncertaintySubstitutions, equivalencies=null, assumeZero=false) ->
			if @label of uncertaintySubstitutions and uncertaintySubstitutions[@label]?
				substitute = uncertaintySubstitutions[@label]
				if substitute.copy?
					return substitute.copy()
				else
					return new Constant(substitute)
			else
				return if not assumeZero then @copy() else new Constant("0")

		substituteExpression: (sourceExpression, variable, equivalencies=null, eliminate=false) ->
			throw new Error("Can't sub uncertainties")

		getUncertainty: ->
			throw new Error("Can't take uncertainty of an uncertainty")

		getVariableUnits: (variable, equivalencies) ->
			throw new Error("Can't do that with uncertainties")

		setVariableUnits: (variable, equivalencies, units) ->
			throw new Error("Can't do that with uncertainties")

		simplify: ->
			@copy()

		expand: ->
			@copy()

		expandAndSimplify: ->
			@copy()

		toDrawingNode: ->
			UncertaintyNode = prettyRender.Uncertainty
			return new UncertaintyNode(@label)

		differentiate: (variable) ->
			throw new Error("Can't differentiate uncertainties!")


	return {

		Terminal: Terminal

		Variable: Variable

		Constant: Constant

		SymbolicConstant: SymbolicConstant

		Uncertainty: Uncertainty

	}