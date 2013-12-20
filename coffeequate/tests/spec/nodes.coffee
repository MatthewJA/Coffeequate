define ["operators"], (operators) ->

	describe "Nodes", ->

		describe "representing addition", ->

			it "represent addition", ->
				add = new operators.Add()
				expect(add.label).toBe("+")

		describe "representing multiplication", ->

			it "represent multiplication", ->
				mul = new operators.Mul()
				expect(mul.label).toBe("*")

		describe "representing powers", ->

			it "represent powers", ->
				pow = new operators.Pow()
				expect(pow.label).toBe("**")