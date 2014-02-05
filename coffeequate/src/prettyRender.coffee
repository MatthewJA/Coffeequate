define ->
  class DrawingNode
    toString: ->
      throw new Error("not implemented")

    renderLaTeX: ->
      throw new Error("not implemented")

    # This tells us how strongly bound together the node is.
    # As in, because x+y*z is parsed as x+(y*z), * binds more closely than + does.
    # When we want to express (x+y)*z, we put the x+y Add node inside a Bracket
    # node, which binds very tightly.
    bindingStrength: ->
      8

  DrawingNode.makeWithBrackets = (terms...) ->
    node = new this()
    terms = terms.map((x) ->
        if x.bindingStrength() <= node.bindingStrength()
          return new Bracket(x)
        else
          return x)
    node.terms = terms
    return node

  class Add extends DrawingNode
    constructor: (@terms...) ->

    bindingStrength: ->
      4

    renderLaTeX: ->
      return @terms.map((x) -> x.renderLaTeX()).join(" + ")

    renderString: ->
      return @terms.map((x) -> x.renderString()).join(" + ")

  class Mul extends DrawingNode
    constructor: (@terms...) ->

    bindingStrength: ->
      6

    renderLaTeX: ->
      return @terms.map((x) -> x.renderLaTeX()).join(" \\cdot ")

    renderString: ->
      return @terms.map((x) -> x.renderString()).join("*")

  class Pow extends DrawingNode
    constructor: (@left, @right) ->

    renderLaTeX: ->
      "#{@left.renderLaTeX()}^{#{@right.renderLaTeX()}}"

    renderString: ->
      "#{@left.renderString()}^(#{@right.renderString()})"

  class Bracket extends DrawingNode
    constructor: (@contents) ->

    renderLaTeX: ->
      return "\\left(#{@contents.renderLaTeX()}\\right)"

    renderString: ->
      return "(#{@contents.renderString()})"

  class Number extends DrawingNode
    constructor: (@value) ->

    renderLaTeX: ->
      return @value+""

    renderString: ->
      return @value+""

  class Variable extends DrawingNode
    constructor: (@label, @class="default") ->

    renderLaTeX: ->
      return @label

    renderString: ->
      return @label


  class Fraction extends DrawingNode
    constructor: (@top, @bottom) ->

    renderLaTeX: ->
      return "\\frac{#{@top.renderLaTeX()}}{#{@bottom.renderLaTeX()}}"

    renderString: ->
      return "(#{@top.renderLaTeX()})/(#{@bottom.renderLaTeX()})"

  class Surd extends DrawingNode
    constructor: (@contents, @power = null) ->

    renderLaTeX: ->
      if @power and @power != 2
        return "\\sqrt[#{@power}]{#{@contents.renderLaTeX()}}"
      else
        return "\\sqrt{#{@contents.renderLaTeX()}}"

  class Uncertainty extends DrawingNode
    constructor: (@label, @class="default") ->

    renderLaTeX: ->
      return "\\sigma_{#{@label}}"

  return {

    DrawingNode: DrawingNode
    Add: Add
    Mul: Mul
    Pow: Pow
    Bracket: Bracket
    Number: Number
    Variable: Variable
    Fraction: Fraction
    Surd: Surd
    Uncertainty: Uncertainty
  }