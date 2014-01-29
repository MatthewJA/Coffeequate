define ["parse", "terminals"], (parse, terminals) ->

	describe "Strings can be parsed into", ->

		it "expressions", ->
			expect(parse.stringToExpression("a + b").toString()).toBe("(a + b)")
			expect(parse.stringToExpression("a + b + 3").toString()).toBe("(3 + a + b)")
			expect(parse.stringToExpression("a * b").toString()).toBe("(a * b)")
			expect(parse.stringToExpression("a * b * 3").toString()).toBe("(3 * a * b)")
			expect(parse.stringToExpression("a ** b").toString()).toBe("(a ** b)")
			expect(parse.stringToExpression("a ** b ** 3").toString()).toBe('(a ** (3 * b))')
			expect(parse.stringToExpression("a * b + c * 4").toString()).toBe('((4 * c) + (a * b))')
			expect(parse.stringToExpression("a * b ** 1/2 + c * 4").toString()).toBe('((4 * c) + (a * (b ** 1/2)))')
			expect(parse.stringToExpression("a * b ** (5/6 + c) * 4").toString()).toBe('(4 * a * (b ** (5/6 + c)))')
			expect(parse.stringToExpression("b+c*(-5)+(-a)").toString()).toBe('(b + (-5 * c) + (-1 * a))')
			expect(parse.stringToExpression("((a))").toString()).toBe("a")
			expect(parse.stringToExpression("((a + b))").toString()).toBe("(a + b)")
			expect(parse.stringToExpression("((a + c) + b)").toString()).toBe("(a + b + c)")
			expect(parse.stringToExpression("(((a + a) + b))**x").toString()).toBe('((b + (2 * a)) ** x)')
			expect(parse.stringToExpression("(((x + 4) * b))**x").toString()).toBe('((b ** x) * ((4 + x) ** x))')
			expect(parse.stringToExpression("(((x + 4) * b)**x)**x").toString()).toBe('((b ** (x ** 2)) * ((4 + x) ** (x ** 2)))')
			expect(parse.stringToExpression("a ** (b + c)").toString()).toBe("(a ** (b + c))")
			expect(parse.stringToExpression("(((x + 4) * b)**(x + - b) + - b)**x").toString()).toBe('(((-1 * b) + ((b ** (x + (-1 * b))) * ((4 + x) ** (x + (-1 * b))))) ** x)')

			expect((x) -> parse.stringToExpression("a b c")).toThrow()

		it "terms", ->
			expect(parse.stringToTerminal("1/2").toString()).toEqual("1/2")
			expect(parse.stringToTerminal("3/4")).toEqual(new terminals.Constant("3", "4"))

		it "terminals with units", ->
			expect(parse.stringToTerminal("v::{m * s**-a}").units).toEqual(parse.stringToExpression("m * s ** -a"))