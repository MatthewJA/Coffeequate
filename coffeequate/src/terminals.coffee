define ["parse", "nodes", "prettyRender", "constants"], (parse, nodes, prettyRender, constants) ->

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

		# Make a new Constant
		#
		# @param numerator [String]
		# @param denominator [String]
		# @param mode [String] Optional. Can be rational or float. 
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

		# Evaluate the constant to be a float
		#
		# @return [Float] A float representation of this Constant
		evaluate: ->
			parseFloat(@numerator/@denominator)

		#Deep copy this Constant
		#
		#@return [Constant] A copy of this Constant
		copy: ->
			return new Constant(@numerator, @denominator, @mode)

		#Compares this constant with another constant
		#
		#@param b [Constant]
		#@return [Integer] returns an integer based on the comparison result (negative, neutral or positive)
		compareSameType: (b) ->
			if @evaluate() < b.evaluate()
				return -1
			else if @evaluate() == b.evaluate()
				return 0
			else
				return 1

		# Multiplies by another constant and returns the resulting Constant
		#
		# @param b [Constant]
		# return [Constant] The multiple of this and b
		mul: (b) ->
			if @mode == b.mode
				newMode = @mode
			else
				newMode = "float"

			return new Constant(@numerator * b.numerator, @denominator * b.denominator, newMode)

		# Adds to another constant and returns the resulting Constant.
		# @param b [Constant]
		# @return [Constant] The addition of this and b
		add: (b) ->
			if @mode == b.mode
				newMode = @mode
			else
				newMode = "float"

			return new Constant(b.denominator * @numerator + @denominator * b.numerator, @denominator * b.denominator, newMode)
		# This constant to the power of another constant
		# @param b [Constant]
		# @return [Constant] Returns a constant of base this to power b
		pow: (b) ->
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

		# Tests the equality between this Constant and another Constant.
		# @param b [Constant]
		# @return [Boolean] Whether or not the two Constants are equal
		equals: (b) ->
			unless b instanceof Constant
				return false
			return @evaluate() == b.evaluate()

		# Does nothing - included for API parity
		# @param replacements [???]
		replaceVariables: (replacements) ->
			@copy() # Does nothing - this is a constant.

		getAllVariables: ->
			[]

		# Substitute values into the constant - does nothing as this is a constant;
		# Included for API parity
		# 
		#@param substitutions [Object] A map of variable labels to their values. Values can be integers, Expressions, Terminals or BasicNodes
		#@param uncertaintySubstitutions [???] I don't know how this works
		sub: (substitutions, uncertaintySubstitutions) ->
			@copy()

		# Gets greatest common divisor and divides out to simplify Constant
		#
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

		# Simplify this constant
		#
		# @return [Constant] A simplified copy of the current Constant
		simplify: ->
			constant = @copy()
			constant.simplifyInPlace()
			return constant

		# Expands the constant
		# @return [Constant] A simplified constant
		expand: ->
			@copy()

		# Expands and simplifies 
		# @return [Constant] A simplified and expanded constant
		expandAndSimplify: ->
			@simplify()

		# Substitutes 
		substituteExpression: (sourceExpression, variable, equivalencies) ->
			[@copy()]

		# Gets uncertainty of the Constant
		#
		# @return [Constant] A constant of 0
		getUncertainty: ->
			new Constant(0)

		# Gets the units of the Constant (does nothing since Constant)
		#
		# @return [null] null
		getVariableUnits: ->
			null

		#Sets units of the Constant (does nothing)
		#
		# @param variable [???]
		# @param equivalencies [???]
		# @param units [String]
		# @return null
		setVariableUnits: (variable, equivalencies, units) ->
			null

		# Creates a drawing node to export Constant for viewing.
		#
		# @return [FractionNode, NumberNode] A drawing node for viewing.
		toDrawingNode: ->
			NumberNode = prettyRender.Number
			FractionNode = prettyRender.Fraction
			if @denominator == 1
				return new NumberNode(@numerator)
			return new FractionNode(new NumberNode(@numerator), new NumberNode(@denominator))

		differentiate: (variable) ->
			return new Constant(0)


	# A class to represent symbolic constants in the equation tree; for e.g. Ï€
	#
	class SymbolicConstant extends Terminal

		# Symbolic constants in the equation tree, e.g. Ï€
		# Creates a new SymbolicConstant.
		# @param label [String]
		# @param value [Integer, Float] Optional. Default is null.
		# @param units [String] Optional. Default is null.
		constructor: (@label, @value=null, @units=null) ->
			@cmp = -5

		# Returns a deep copy of the SymbolicConstant
		#
		# @return [SymbolicConstant] Returns a new copy of the Symbolic Constant
		copy: ->
			return new SymbolicConstant(@label, @value, @units)

		# Compares this SymbolicConstant with another SymbolicConstant. 
		#
		# @param b [SymbolicConstant]
		# @return [Integer 0,1,2] Returns the difference 'discriminator' of the two SymbolicConstants
		compareSameType: (b) ->
			# Compare this object with another of the same type.
			if @label < b.label
				return -1
			else if @label == b.label
				return 0
			else
				return 1

		# Evaluates the SymbolicConstant
		# @return [Integer, Float] Returns the current value of the SymbolicConstant
		evaluate: ->
			@value

		# Checks equality of this and another SymbolicConstant
		# 
		# @param b [SymbolicConstant]
		# @return [Boolean] Whether or not the two SymbolicConstants are equal
		equals: (b) ->
			unless b instanceof SymbolicConstant
				return false
			return @label == b.label and @value == b.value

		# Does nothing - included for API parity
		#
		# @params replacements [???]
		# @return [SymbolicConstant]
		replaceVariables: (replacements) ->
			@copy() # Does nothing - this is a constant.

		#Does nothing??? Matt, please check
		getAllVariables: ->
			[]


		# Substitute values into the SymbolicConstant - does nothing as this is a SymbolicConstant;
		# Included for API parity
		# 
		#@param substitutions [Object] A map of variable labels to their values. Values can be integers, Expressions, Terminals or BasicNodes
		#@param uncertaintySubstitutions [???] I don't know how this works
		sub: (substitutions, uncertaintySubstitutions, equivalencies=null, assumeZeroUncertainty=false, evaluateSymbolicConstants=false) ->
			unless evaluateSymbolicConstants
				return @copy()
			if @label of constants
				return new Constant(constants[@label])

		# Simplify the SymbolicConstant
		#
		# @return [SymbolicConstant] Returns a deep copy of the SymbolicConstant
		simplify: ->
			@copy()

		# Expand the SymbolicConstant
		#
		# @return [SymbolicConstant] Returns a deep copy of the SymbolicConstant
		expand: ->
			@copy()

		# Expand and simplify the SymbolicConstant
		#
		# @return [SymbolicConstant] Returns a deep copy of the SymbolicConstant
		expandAndSimplify: ->
			@copy()

		# Substitutes an expression into the SymbolicConstant
		#
		# @param sourceExpression [Expression]
		# @param variable [???]
		# @param equivalencies []
		substituteExpression: (sourceExpression, variable, equivalencies) ->
			[@copy()]

		# Gets the uncertainty of the SymbolicConstant
		#
		# @return [Constant] Returns a Constant of 0
		getUncertainty: ->
			new Constant(0)

		# Gets the units of the SymbolicConstant i.e. null
		# @return null
		getVariableUnits: ->
			null

		# Sets the units of the SymbolicConstant
		# @param variable
		# @param equivalencies
		# @param units
		setVariableUnits: (variable, equivalencies, units) ->
			null

		# Creates a DrawingNode of the SymbolicConstant to be viewed
		#
		# @return [VariableNode] Returns a prettyRendered DrawingNode of the SymbolicConstant
		toDrawingNode: ->
			VariableNode = prettyRender.Variable
			return new VariableNode(@label, "constant symbolic-constant")

		# Differentiates the SymbolicConstant
		# @param variable [???]
		# @return [Constant] Returns a Constant of 0
		differentiate: (variable) ->
			return new Constant(0)

	# A class to represent Variables in the Equation tree; e.g. 'm'
	class Variable extends Terminal
		# Variables in the equation tree, e.g. m

		# Make a new Variable
		# 
		# @param label [String]
		# @param units [???] Optional. Defaults to null.
		constructor: (@label, @units=null) ->
			@cmp = -4

		# Creates a deep copy of the current Variable
		#
		# @return [Variable] Returns a deep copy of the current Variable
		copy: ->
			return new Variable(@label, @units)

		# Compares this Variable with another Variable
		#
		# @param b [Variable] The other Variable
		# @return [Integer -1, 0, 1] Returns an integer to indicate less than, equal to or greater than the other Variable
		compareSameType: (b) ->
			# Compare this object with another of the same type.
			if @label < b.label
				return -1
			else if @label == b.label
				return 0
			else
				return 1

		# Checks equality of this Variable and another Variable
		#
		# @param b [Variable] The other variable
		# @param equivalencies [???] Optional. 
		equals: (b, equivalencies=null) ->
			# Check equality between this and some other object.
			unless b instanceof Variable
				return false

			if equivalencies?
				return @label in equivalencies.get(b.label)
			else
				return b.label == @label

		# Replaces the variables with new variables (MATT I DON'T GET THIS ONE)
		replaceVariables: (replacements) ->
			copy = @copy()
			if @label of replacements
				copy.label = replacements[@label]
			return copy

		# Gets all variables
		# @return [List of Strings] Returns the variable label
		getAllVariables: ->
			[@label]

		# Substitutes values into the Variable
		#
		# @param [???] substitutions
		# @param [???] uncertaintySubstitutions
		sub: (substitutions, uncertaintySubstitutions) ->
			if @label of substitutions
				substitute = substitutions[@label]
				if substitute.copy?
					return substitute.copy()
				else
					return new Constant(substitute)
			else
				return @copy()

		# Substitutes an Expression into the Variable
		#
		# @param sourceExpression [sourceExpression] The source expression to be used.
		# @param variable [???]
		# @param equivalencies [???] Optional.
		# @param eliminate [???] Optional.
		# @return [Variable] Returns the resulting Variable from the substitution
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

		# Gets the uncertainty of the Variable
		#
		# @return [???] IDK how this one works either TBH
		getUncertainty: ->
			new Uncertainty(@label)

		# Gets the units of the Variable 
		#
		# @param variable [???]
		# @param equivalencies [???]
		# @return [units] The current units of the Variable
		getVariableUnits: (variable, equivalencies) ->
			if equivalencies?
				if @label in equivalencies.get(variable)
					return @units
			else if @label == variable
				return @units
			return null

		# Sets the units for the Variable
		#
		# @param variable [???]
		# @param equivalencies [???]
		# @param units [???]
		setVariableUnits: (variable, equivalencies, units) ->
			if equivalencies?
				if @label in equivalencies.get(variable)
					@units = units
			else if @label == variable
				@units = units

		# Simplifies the Variable
		#
		# @return [Variable] A deep copy of the Variable
 		simplify: ->
			@copy()

		# Expand the Variable
		#
		# @return [Variable] A deep copy of the Variable
		expand: ->
			@copy()

		# Expands and simplifies the Variable
		#
		#@return [Variable] A deep copy of the Variable
		expandAndSimplify: ->
			@copy()

		# Returns a DrawingNode of the Variable to be viewed
		#
		# @return [VariableNode] A DrawingNode version of the variable
		toDrawingNode: ->
			VariableNode = prettyRender.Variable
			return new VariableNode(@label)

		# Differentiates the variable
		#
		# @param variable [Variable]
		# @return [Constant] Returns a constant of value either 1 or 0 (Mitchell: not sure how this actually works)
		differentiate: (variable) ->
			if variable == @label
				return new Constant(1)
			return new Constant(0)

	# Defines an Uncertainty object in the equation tree; for e.g. sigma_m
	# ??? I know nothing about this object really, it's going to be very poorly documented and needs to be edited
	class Uncertainty extends Terminal

		#Creates an Uncertainty (that sounds really beautiful doesn't it?)
		#
		# @param label [String] Label of the Uncertainty object
		constructor: (@label) ->
			# Matt: what do I do here?
			@cmp = -4.5

		copy: ->
			return new Uncertainty(@label)

		#Compares the value of this Uncertainty and another Uncertainty
		#
		# @param b [Uncertainty]
		# @return [Integer -1, 0, 1]
		compareSameType: (b) ->
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
		# Don't differentiate uncertainties. It won't work. (Throws error 'Can't differentiate uncertainties!')
		differentiate: (variable) ->
			throw new Error("Can't differentiate uncertainties!")

	return {

		Terminal: Terminal

		Variable: Variable

		Constant: Constant

		SymbolicConstant: SymbolicConstant

		Uncertainty: Uncertainty

	}