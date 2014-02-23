define ["operators", "terminals", "parse", "AlgebraError"], (operators, terminals, parse, AlgebraError) ->
  diffString = (string, variable) ->
    return parse.stringToExpression(string).differentiate(variable).toLisp()

  describe "Differentiation", ->
    describe "of terminals", ->
      it "works", ->
        expect(diffString("x", "x")).toBe("1")
        expect(diffString("y", "x")).toBe("0")
        expect(diffString("3", "x")).toBe("0")

    describe "of addition", ->
      it "works", ->
        expect(diffString("x+y", "x")).toBe("1")
        expect(diffString("x+y+34", "x")).toBe("1")
        expect(diffString("x+y**3+-34", "x")).toBe("1")
        expect(diffString("x+y+34", "y")).toBe("1")
        expect(diffString("x+y+34", "z")).toBe("0")

    describe "of multiplication", ->
      it "works", ->
        expect(diffString("x*y", "x")).toBe("y")
        expect(diffString("x*y", "y")).toBe("x")
        expect(diffString("x*y*45", "y")).toBe("(* 45 x)")

    describe "of powers", ->
      it "works", ->
        expect(diffString("x**2","x")).toBe("(* 2 x)")
        expect(diffString("x**56","x")).toBe("(* 56 (** x 55))")

