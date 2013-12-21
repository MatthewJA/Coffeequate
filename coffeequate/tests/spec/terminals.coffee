define ["terminals", "parse"], (terminals, parse) ->

	describe "Terminals", ->

		describe "representing variables", ->

			it "represent variables", ->
				term = new terminals.Variable("v")
				expect(term.toString()).toBe("v")

		describe "representing constants", ->

			it "represent constants", ->
				term = new terminals.Constant("1.2")
				expect(term.toString()).toBe("1.2")
				term = new terminals.Constant("1/2")
				expect(term.toString()).toBe("1/2")

			it "parse floats", ->
				term = new terminals.Constant("1.2")
				expect(term.evaluate()).toBe(1.2)

			it "parse fractions", ->
				term = new terminals.Constant("1/2")
				expect(term.evaluate()).toBe(0.5)

			it "accept floats", ->
				term = new terminals.Constant(1.2)
				expect(term.evaluate()).toBe(1.2)

			it "reject non-parseable inputs", ->
				expect(-> new terminals.Constant("")).toThrow(new parse.ParseError("", "constant"))
				expect(-> new terminals.Constant(true)).toThrow(new parse.ParseError(true, "constant"))
				expect(-> new terminals.Constant("1/2/3")).toThrow(new parse.ParseError("1/2/3", "constant"))

		describe "representing symbolic constants", ->

			it "represent symbolic constants", ->
				term = new terminals.SymbolicConstant("π", Math.PI)
				expect(term.toString()).toBe("π")
				expect(term.evaluate()).toBe(Math.PI)

				term = new terminals.SymbolicConstant("c", 3e8)
				expect(term.toString()).toBe("c")
				expect(term.evaluate()).toBe(3e8)

				term = new terminals.SymbolicConstant("G")
				expect(term.toString()).toBe("G")
				expect(term.evaluate()).toBe(null)