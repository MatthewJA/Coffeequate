define ["parse", "terminals"], (parse, terminals) ->

	describe "Strings can be parsed into", ->

		it "expressions", ->
			expect(parse.stringToExpression("1 + 2").toString()).toBe("(1 + 2)")
			expect(parse.stringToExpression("1 + 2 + 3").toString()).toBe("((1 + 2) + 3)")
			expect(parse.stringToExpression("1 * 2").toString()).toBe("(1 * 2)")
			expect(parse.stringToExpression("1 * 2 * 3").toString()).toBe("((1 * 2) * 3)")
			expect(parse.stringToExpression("1 ** 2").toString()).toBe("(1 ** 2)")
			expect(parse.stringToExpression("1 ** 2 ** 3").toString()).toBe("((1 ** 2) ** 3)")
			expect(parse.stringToExpression("1 * 2 + 3 * 4").toString()).toBe("((1 * 2) + (3 * 4))")
			expect(parse.stringToExpression("1 * 2 ** 1/2 + 3 * 4").toString()).toBe("((1 * (2 ** 1/2)) + (3 * 4))")
			expect(parse.stringToExpression("1 * 2 ** (1/2 + 3) * 4").toString()).toBe("((1 * (2 ** (1/2 + 3))) * 4)")
			expect(parse.stringToExpression("2+3*(-5)+(-12)").toString()).toBe("((2 + (3 * (-1 * 5))) + (-1 * 12))")
			expect(parse.stringToExpression("((1))").toString()).toBe("1")
			expect(parse.stringToExpression("((1 + 1))").toString()).toBe("(1 + 1)")
			expect(parse.stringToExpression("((1 + 1) + 2)").toString()).toBe("((1 + 1) + 2)")
			expect(parse.stringToExpression("(((1 + 1) + 2))**x").toString()).toBe("(((1 + 1) + 2) ** x)")
			expect(parse.stringToExpression("(((x + 4) * 2))**x").toString()).toBe("(((x + 4) * 2) ** x)")
			expect(parse.stringToExpression("(((x + 4) * 2)**x)**x").toString()).toBe("((((x + 4) * 2) ** x) ** x)")
			expect(parse.stringToExpression("a ** (1 + 1)").toString()).toBe("(a ** (1 + 1))")
			expect(parse.stringToExpression("(((x + 4) * 2)**(x + - 2) + - 2)**x").toString()).toBe("(((((x + 4) * 2) ** (x + (-1 * 2))) + (-1 * 2)) ** x)")

			expect((x) -> parse.stringToExpression("a b c")).toThrow()

		it "terms", ->
			expect(parse.stringToTerminal("1/2").toString()).toEqual("1/2")
			expect(parse.stringToTerminal("2/4")).toEqual(new terminals.Constant("2", "4"))