define ->
  class DrawingNode
    toString: ->
      throw new Error("not implemented")

    renderLaTeX: ->

  class Add extends DrawingNode
    constructor: (@terms...) ->

    renderLaTeX: ->
      @terms.map((x) -> x.renderLaTeX()).join("+")

  class Mul extends DrawingNode
    constructor: (@terms...) ->

    renderLaTeX: ->
      @terms.map((x) -> x.renderLaTeX()).join("+")

  class Power extends DrawingNode
    constructor: (@left, @right) ->

    renderLaTeX: ->
      "#{@left.renderLaTeX()}^#{@right.renderLaTeX()}"

  class Bracket extends DrawingNode
    constructor: (@contents) ->

    renderLaTeX: ->
      return "\\left(#{@contents.renderLaTeX()}\\right)"

  class Number extends DrawingNode
    constructor: (@value) ->

    renderLaTeX: ->
      @value+""

  class Variable extends DrawingNode
    constructor: (@label) ->

    renderLaTeX: ->
      @label

  class Fraction extends DrawingNode
    constructor: (@top, @bottom) ->

    renderLaTeX: ->
      "\\frac{#{@top.renderLaTeX()}}{#{@bottom.renderLaTeX()}}"

  class Surd extends DrawingNode
    constructor(@contents, @power = null) ->

    renderLaTeX: ->
      if @power and @power != 2
        return "\\sqrt[#{power}]{#{@contents.toLaTeX()}}"
      else
        return "\\sqrt{#{@contents.toLaTeX()}}"

  return {

    DrawingNode: DrawingNode
    Add: Add
    Mul: Mul
    Power: Power
    Bracket: Bracket
    Number: Number
    Variable: Variable
    Fraction: Fraction

  }