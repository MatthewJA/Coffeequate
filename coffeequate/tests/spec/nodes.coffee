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

			it "can be solved", ->
				add = new operators.Add("x") # 0 = x
				expect(add.solve("x")[0].evaluate()).toEqual(0)
				add = parse.stringToExpression("x + -1") # 1 = x
				expect(add.solve("x")[0].evaluate()).toEqual(1)
				add = parse.stringToExpression("x + -y") # y = x
				expect(add.solve("x")[0].toString()).toEqual("y")
				add = parse.stringToExpression("x + y + 2") # y = x
				expect(add.solve("x")[0].toString()).toEqual("(-2 + (-1 * y))")

				# Works so far. Let's try some multiplication.
				add = parse.stringToExpression("2 * x + -y") # x = y/2
				expect(add.solve("x")[0].toString()).toEqual("(0.5 * y)")

				# Quadratics?
				add = parse.stringToExpression("-4 + x ** 2") # Simple quadratic.
				expect(add.solve("x")[0].toString()).toEqual("2")
				expect(add.solve("x")[1].toString()).toEqual("-2")
				add = parse.stringToExpression("-4 * x + x ** 2") # Slightly more complex quadratic.
				expect(add.solve("x")[0].toString()).toEqual("0")
				expect(add.solve("x")[1].toString()).toEqual("4")
				add = parse.stringToExpression("(x + 3)**2")
				expect(add.solve("x")[0].toString()).toEqual("-3")
				expect(add.solve("x").length).toEqual(1)
				add = parse.stringToExpression("(x + 3) * (x + -2)")
				expect(add.solve("x")[0].toString()).toEqual("2")
				expect(add.solve("x")[1].toString()).toEqual("-3")

				# Projectile motion for t?
				add = parse.stringToExpression("u * t + a * t ** 2 * 0.5 + -s")
				expect(add.solve("t").toString()).toEqual(
					"((a ** -1) * ((((u ** 2) + (2 * a * s)) ** 1/2) + (-1 * u))),((a ** -1) * ((-1 * u) + (-1 * (((u ** 2) + (2 * a * s)) ** 1/2))))")

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

			it "can be solved", ->
				mul = parse.stringToExpression("x * y * z")
				expect(mul.solve("y")[0].evaluate()).toEqual(0)
				expect(mul.solve("y").length).toEqual(1)
				mul = parse.stringToExpression("x * y * (z ** 2)")
				expect(mul.solve("z")[0].evaluate()).toEqual(0)
				expect(mul.solve("z").length).toEqual(1)
				mul = new operators.Mul("x") # 0 = x
				expect(mul.solve("x")[0].evaluate()).toEqual(0)

			describe "throw sensible errors when", ->

				it "trying to solve for a non-existant variable", ->
					pow = parse.stringToExpression("x * z")
					expect(-> pow.solve("y")).toThrow(new operators.AlgebraError("Unsolvable: (x * z) for y"))

		it "expand and simplify into reasonably-canonical forms", ->
			add = parse.stringToExpression("(a * b)*(2*x + 1)")
			expect(add.expandAndSimplify().toString()).toBe("((2 * a * b * x) + (a * b))")
			add = parse.stringToExpression("(3*x+2)*(4*y**2+7)")
			expect(add.expand().simplify().toString()).toBe("(14 + (8 * (y ** 2)) + (12 * x * (y ** 2)) + (21 * x))")
			add = parse.stringToExpression("(3*x+2)*(4*y**2+7)*(x+2*y)**-1")
			expect(add.expand().simplify().toString()).toBe("(((x + (2 * y)) ** -1) * (14 + (8 * (y ** 2)) + (12 * x * (y ** 2)) + (21 * x)))")

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
				pow = parse.stringToExpression("(x ** 2) ** 0.5")
				expect(pow.simplify().toString()).toBe("x")
				pow = parse.stringToExpression("(x ** 2) ** y")
				expect(pow.simplify().toString()).toBe("(x ** (2 * y))")
				pow = parse.stringToExpression("(1 ** 2)")
				expect(pow.simplify().toString()).toBe("1")
				pow = parse.stringToExpression("(1 ** x)")
				expect(pow.simplify().toString()).toBe("1")
				pow = parse.stringToExpression("(0 ** 0)")
				expect(pow.simplify().toString()).toBe("1")
				pow = new operators.Pow(new operators.Add("2", "0"), "-1")
				expect(pow.expandAndSimplify().toString()).toBe("0.5")

			it "can be solved", ->
				pow = parse.stringToExpression("x ** 2")
				expect(pow.solve("x")[0].evaluate()).toEqual(0)
				expect(pow.solve("x").length).toEqual(1)

			describe "throw sensible errors when", ->

				it "trying to solve for a non-existant variable", ->
					pow = parse.stringToExpression("x ** 2")
					expect(-> pow.solve("y")).toThrow(new operators.AlgebraError("Unsolvable: (x ** 2) for y"))

				it "trying to solve for a variable in the exponent", ->
					pow = parse.stringToExpression("x ** y")
					expect(-> pow.solve("y")).toThrow(new operators.AlgebraError("Unsolvable: (x ** y) for y"))


		it "can be formed into a tree", ->
			# (+ 1 (* 2 3))
			expect((new operators.Add(1, new operators.Mul(2, 3))).toString()).toBe("(1 + (2 * 3))")
			# (* m (** c 2))
			expect((new operators.Mul("m", new operators.Pow("c", 2))).toString()).toBe("(m * (c ** 2))")