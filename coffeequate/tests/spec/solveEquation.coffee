define [
	"backend/solveEquation"
	"backend/getFormula"
	"backend/equationIndex"
	"JSAlgebra/equation"
], (solveEquation, getFormula, equationIndex, Equation) ->

	describe "Can solve", ->

		it "physics equations linearly", ->
			equation = getFormula("momentum")
			equationID = equationIndex.add(equation)
			expect(solveEquation(equationID, "p")).toEqual equation
			expect(solveEquation(equationID, "m")).toEqual (new Equation(["m"], ["p", "v**-1"]))