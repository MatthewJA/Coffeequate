define ["operators", "parse"], (operators, parse) ->

	describe "Nodes", ->

		describe "representing addition", ->

			it "represent addition", ->
				add = new operators.Add("2", "3")
				expect(add.label).toBe("+")
				expect(add.toString()).toBe("(2 + 3)")

				add = new operators.Add("2", "3", "4")
				expect(add.label).toBe("+")
				expect(add.toString()).toBe("(2 + 3 + 4)")

			it "require at least two children", ->
				expect(-> new operators.Add()).toThrow(new Error("Add nodes must have at least one child."))

			it "expand", ->
				add = parse.stringToExpression("1 + (2 + 3)")
				expect(add.expand().toString()).toBe("(1 + 2 + 3)")
				add = parse.stringToExpression("1 + (2 + (3 + 4))")
				expect(add.expand().toString()).toBe("(1 + 2 + 3 + 4)")
				add = parse.stringToExpression("1 + ((2 + 5) + (3 + 4))")
				expect(add.expand().toString()).toBe("(1 + 2 + 3 + 4 + 5)")
				add = parse.stringToExpression("((a * b) + (c * d)) + ((e * f) + (g * h))")
				expect(add.expand().toString()).toBe("((a * b) + (c * d) + (e * f) + (g * h))")
				add = parse.stringToExpression("3 + 2 + 1")
				expect(add.expand().toString()).toBe("(1 + 2 + 3)")
				add = parse.stringToExpression("3 + x + 1")
				expect(add.expand().toString()).toBe("(1 + 3 + x)")

			it "simplify", ->
				add = parse.stringToExpression("1 + 1")
				expect(add.simplify().toString()).toBe("2")
				add = parse.stringToExpression("x + x")
				expect(add.simplify().toString()).toBe("(2 * x)")
				add = parse.stringToExpression("x + x + y + y")
				expect(add.simplify().toString()).toBe("((2 * x) + (2 * y))")
				add = parse.stringToExpression("((2 * x) + (3 * x))")
				expect(add.simplify().toString()).toBe("(5 * x)")
				add = parse.stringToExpression("(x + 0)")
				expect(add.simplify().toString()).toBe("x")
				add = parse.stringToExpression("(x + 0 + 0 + y)")
				expect(add.simplify().toString()).toBe("(x + y)")
				add = parse.stringToExpression("(x + (2 * x))")
				expect(add.simplify().toString()).toBe("(3 * x)")
				add = parse.stringToExpression("(-1 + 1**1)")
				expect(add.simplify().toString()).toBe("0")

		describe "representing multiplication", ->

			it "represent multiplication", ->
				mul = new operators.Mul("2", "3")
				expect(mul.label).toBe("*")
				expect(mul.toString()).toBe("(2 * 3)")

				mul = new operators.Mul("2", "3", "4")
				expect(mul.toString()).toBe("(2 * 3 * 4)")

			it "require at least one child", ->
				expect(-> new operators.Mul()).toThrow(new Error("Mul nodes must have at least one child."))

			describe "expand", ->

				it "associative expressions of multiplication", ->
					mul = parse.stringToExpression("1 * (2 * 3)")
					expect(mul.expand().toString()).toBe("(1 * 2 * 3)")
					mul = parse.stringToExpression("(1 * 2) * (2 * 3)")
					expect(mul.expand().toString()).toBe("(1 * 2 * 2 * 3)")

				it "distributive expressions over addition", ->
					mul = parse.stringToExpression("1 * (2 + 3)")
					expect(mul.expand().toString()).toBe("((1 * 2) + (1 * 3))")
					mul = parse.stringToExpression("1 * (2 + 3 ** 2)")
					expect(mul.expand().toString()).toBe("((1 * 2) + (1 * (3 ** 2)))")
					mul = parse.stringToExpression("(1 + 2) * (2 + 3)")
					expect(mul.expand().toString()).toBe("((1 * 2) + (1 * 3) + (2 * 2) + (2 * 3))")

				it "more complex expressions", ->
					mul = parse.stringToExpression("-(x + (x * 4) ** 2) + 7")
					expect(mul.expand().toString()).toBe("(7 + (-1 * x) + (-1 * (4 ** 2) * (x ** 2)))")
					mul = parse.stringToExpression("(((x + 4) * 2)**(x + - 2) + - 2)**x")
					expect(mul.expand().toString()).toBe("(((-1 * 2) + ((2 ** (x + (-1 * 2))) * ((4 + x) ** (x + (-1 * 2))))) ** x)")

				it "expressions into a sorted form", ->
					mul = parse.stringToExpression("3 * 2 * 1")
					expect(mul.expand().toString()).toBe("(1 * 2 * 3)")
					mul = parse.stringToExpression("3 * x * 1")
					expect(mul.expand().toString()).toBe("(1 * 3 * x)")

			it "simplify", ->
				mul = parse.stringToExpression("1 * x")
				expect(mul.simplify().toString()).toBe("x")
				mul = parse.stringToExpression("1 * x * 1")
				expect(mul.simplify().toString()).toBe("x")
				mul = parse.stringToExpression("x * x")
				expect(mul.simplify().toString()).toBe("(x ** 2)")
				mul = parse.stringToExpression("x * y * x")
				expect(mul.simplify().toString()).toBe("(y * (x ** 2))")
				mul = parse.stringToExpression("x * 1 * y * 1 ** 1")
				expect(mul.simplify().toString()).toBe("(x * y)")

		describe "representing powers", ->

			it "represent powers", ->
				pow = new operators.Pow("2", "3")
				expect(pow.label).toBe("**")
				expect(pow.toString()).toBe("(2 ** 3)")

			it "require two children", ->
				expect(-> new operators.Pow()).toThrow(new Error("Pow nodes must have two children."))
				expect(-> new operators.Pow("")).toThrow(new Error("Pow nodes must have two children."))
				expect(-> new operators.Pow("", "", "")).toThrow(new Error("Pow nodes must have two children."))

			it "expand", ->
				pow = new operators.Pow("x", 2)
				expect(pow.expand().toString()).toBe("(x ** 2)")
				pow = parse.stringToExpression("(1 + x)**2")
				expect(pow.expand().toString()).toBe("((1 * 1) + (1 * x) + (1 * x) + (x * x))")
				pow = parse.stringToExpression("(a * b * c)**d")
				expect(pow.expand().toString()).toBe("((a ** d) * (b ** d) * (c ** d))")

			it "simplify", ->
				pow = parse.stringToExpression("x ** 2")
				expect(pow.simplify().toString()).toBe("(x ** 2)")
				pow = parse.stringToExpression("((2 * x) + (3 * x))**2")
				expect(pow.simplify().toString()).toBe("((5 * x) ** 2)")
				pow = parse.stringToExpression("2**((2 * x) + (3 * x))")
				expect(pow.simplify().toString()).toBe("(2 ** (5 * x))")
				pow = parse.stringToExpression("((2 * x) + (3 * x))**((2 * x) + (3 * x))")
				expect(pow.simplify().toString()).toBe("((5 * x) ** (5 * x))")
				pow = parse.stringToExpression("(x ** 1)")
				expect(pow.simplify().toString()).toBe("x")
				pow = parse.stringToExpression("(4 ** 0.5)")
				expect(pow.simplify().toString()).toBe("2")
				pow = parse.stringToExpression("(4 ** -1 * 4 ** 1")
				expect(pow.simplify().toString()).toBe("1")
				pow = parse.stringToExpression("(x ** -1 * x ** 1")
				expect(pow.simplify().toString()).toBe("1")

		it "can be formed into a tree", ->

			# (+ 1 (* 2 3))
			expect((new operators.Add(1, new operators.Mul(2, 3))).toString()).toBe("(1 + (2 * 3))")
			# (* m (** c 2))
			expect((new operators.Mul("m", new operators.Pow("c", 2))).toString()).toBe("(m * (c ** 2))")