define ["terminals"], (terminals) ->

	describe "Terminals", ->

		describe "representing variables", ->

		describe "representing constants", ->

			it "correctly parse floats", ->
				term = new terminals.Constant("1.2")
				expect(term.evaluate()).toBe(1.2)

		describe "representing symbolic constants", ->