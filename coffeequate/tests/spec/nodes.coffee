define ["operators", "parse", "AlgebraError"], (operators, parse, AlgebraError) ->

	describe "Nodes", ->

		describe "representing addition", ->

			it "represent addition", ->
				add = new operators.Add("2", "3")
				expect(add.label).toBe("+")
				expect(add.toLisp()).toBe("(+ 2 3)")

				add = new operators.Add("2", "3", "4")
				expect(add.label).toBe("+")
				expect(add.toLisp()).toBe("(+ 2 3 4)")

			it "require at least two children", ->
				expect(-> new operators.Add()).toThrow(new Error("Add nodes must have at least one child."))

			it "expand", ->
				add = parse.stringToExpression("a + (b + c)")
				expect(add.expand().toLisp()).toBe("(+ a b c)")
				add = parse.stringToExpression("a + (b + (c + 4))")
				expect(add.expand().toLisp()).toBe("(+ 4 a b c)")
				add = parse.stringToExpression("a + ((b + e) + (c + d))")
				expect(add.expand().toLisp()).toBe("(+ a b c d e)")
				add = parse.stringToExpression("((a * b) + (c * d)) + ((e * f) + (g * h))")
				expect(add.expand().toLisp()).toBe("(+ (* a b) (* c d) (* e f) (* g h))")
				add = parse.stringToExpression("c + b + a")
				expect(add.expand().toLisp()).toBe("(+ a b c)")
				add = parse.stringToExpression("c + x + a")
				expect(add.expand().toLisp()).toBe("(+ a c x)")

			it "simplify", ->
				add = parse.stringToExpression("1 + 1")
				expect(add.simplify().toString()).toBe("2")
				add = parse.stringToExpression("x + x")
				expect(add.simplify().toLisp()).toBe("(* 2 x)")
				add = parse.stringToExpression("x + x + y + y")
				expect(add.simplify().toLisp()).toBe("(+ (* 2 x) (* 2 y))")
				add = parse.stringToExpression("((2 * x) + (3 * x))")
				expect(add.simplify().toLisp()).toBe("(* 5 x)")
				add = parse.stringToExpression("(x + 0)")
				expect(add.simplify().toLisp()).toBe("x")
				add = parse.stringToExpression("(x + 0 + 0 + y)")
				expect(add.simplify().toLisp()).toBe("(+ x y)")
				add = parse.stringToExpression("(x + (2 * x))")
				expect(add.simplify().toLisp()).toBe("(* 3 x)")
				add = parse.stringToExpression("(-1 + 1**1)")
				expect(add.simplify().toLisp()).toBe("0")

			it "can be solved", ->
				add = new operators.Add("x") # 0 = x
				expect(add.solve("x")[0].evaluate()).toEqual(0)
				add = parse.stringToExpression("x + -1") # 1 = x
				expect(add.solve("x")[0].evaluate()).toEqual(1)
				add = parse.stringToExpression("x + -y") # y = x
				expect(add.solve("x")[0].toLisp()).toEqual("y")
				add = parse.stringToExpression("x + y + 2") # y = x
				expect(add.solve("x")[0].toLisp()).toEqual("(+ -2 (* -1 y))")

				# Works so far. Let's try some multiplication.
				add = parse.stringToExpression("2 * x + -y") # x = y/2
				expect(add.solve("x")[0].toLisp()).toEqual("(* 1/2 y)")

				# Quadratics?
				add = parse.stringToExpression("-4 + x ** 2") # Simple quadratic.
				expect(add.solve("x").sort().toString()).toEqual("-2,2")
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
					"(sqrt(u**2 + 2*a*s) + -1*u)/a,(-1*u + -1*sqrt(u**2 + 2*a*s))/a")

			it "substitute values", ->
				add = parse.stringToExpression("a + b + c")
				add = add.sub(
					a: 10,
					b: 20,
					c: 30
				)
				expect(add.evaluate()).toEqual(60)
				add = parse.stringToExpression("a + b * c")
				add = add.sub(
					a: 10,
					b: 20,
					c: 30
				)
				expect(add.evaluate()).toEqual(610)

			it "can return an array of all contained variables", ->
				pow = parse.stringToExpression("(a + b) + c")
				vars = pow.getAllVariables()
				console.log(vars)
				expect("a" in vars).toBe(true)
				expect("b" in vars).toBe(true)
				expect("c" in vars).toBe(true)

		describe "representing multiplication", ->

			it "represent multiplication", ->
				mul = new operators.Mul("b", "3")
				expect(mul.label).toBe("*")
				expect(mul.toLisp()).toBe("(* b 3)")

				mul = new operators.Mul("b", "3", "d")
				expect(mul.toLisp()).toBe("(* b 3 d)")

			it "require at least one child", ->
				expect(-> new operators.Mul()).toThrow(new Error("Mul nodes must have at least one child."))

			describe "expand", ->

				it "associative expressions of multiplication", ->
					mul = parse.stringToExpression("a * (b * 3)", false)
					expect(mul.expand().toLisp()).toBe("(* 3 a b)")
					mul = parse.stringToExpression("(a * b) * (b * 3)", false)
					expect(mul.expand().toLisp()).toBe('(* 3 a b b)')

				it "distributive expressions over addition", ->
					mul = parse.stringToExpression("1 * (2 + 3)", false)
					expect(mul.expand().toLisp()).toBe("(+ (* 1 2) (* 1 3))")
					mul = parse.stringToExpression("1 * (2 + 3 ** 2)", false)
					expect(mul.expand().toLisp()).toBe("(+ (* 1 2) (* 1 (** 3 2)))")
					mul = parse.stringToExpression("(1 + 2) * (2 + 3)", false)
					expect(mul.expand().toLisp()).toBe("(+ (* 1 2) (* 1 3) (* 2 2) (* 2 3))")

				it "more complex expressions", ->
					mul = parse.stringToExpression("-(x + (x * 4) ** 2) + 7", false)
					expect(mul.expand().toLisp()).toBe("(+ 7 (* -1 x) (* -1 (** 4 2) (** x 2)))")
					mul = parse.stringToExpression("(((x + 4) * 2)**(x + - 2) + - 2)**x", false)
					expect(mul.expand().toLisp()).toBe("(** (+ (* -1 2) (* (** 2 (+ x (* -1 2))) (** (+ 4 x) (+ x (* -1 2))))) x)")

				it "expressions into a sorted form", ->
					mul = parse.stringToExpression("3 * 2 * 1", false)
					expect(mul.expand().toLisp()).toBe("(* 1 2 3)")
					mul = parse.stringToExpression("3 * x * 1", false)
					expect(mul.expand().toLisp()).toBe("(* 1 3 x)")

			it "simplify", ->
				mul = parse.stringToExpression("1 * x", false)
				expect(mul.simplify().toString()).toBe("x")
				mul = parse.stringToExpression("1 * x * 1", false)
				expect(mul.simplify().toString()).toBe("x")
				mul = parse.stringToExpression("x * x", false)
				expect(mul.simplify().toLisp()).toBe("(** x 2)")
				mul = parse.stringToExpression("x * y * x", false)
				expect(mul.simplify().toLisp()).toBe("(* y (** x 2))")
				mul = parse.stringToExpression("x * 1 * y * 1 ** 1", false)
				expect(mul.simplify().toLisp()).toBe("(* x y)")

			it "can be solved", ->
				mul = parse.stringToExpression("x * y * z", false)
				expect(mul.solve("y")[0].evaluate()).toEqual(0)
				expect(mul.solve("y").length).toEqual(1)
				mul = parse.stringToExpression("x * y * (z ** 2)", false)
				expect(mul.solve("z")[0].evaluate()).toEqual(0)
				expect(mul.solve("z").length).toEqual(1)
				mul = new operators.Mul("x") # 0 = x
				expect(mul.solve("x")[0].evaluate()).toEqual(0)

			describe "throw sensible errors when", ->

				it "trying to solve for a non-existant variable", ->
					pow = parse.stringToExpression("x * z", false)
					expect(-> pow.solve("y")).toThrow(new AlgebraError("Unsolvable: (x * z) for y"))

			it "substitute values", ->
				mul = parse.stringToExpression("a * b * c", false)
				mul = mul.sub(
					a: 10,
					b: 20,
					c: 30
				)
				expect(mul.evaluate()).toEqual(6000)
				mul = parse.stringToExpression("(a + b) * c", false)
				mul = mul.sub(
					a: 10,
					b: 20,
					c: 30
				)
				expect(mul.evaluate()).toEqual(900)

			it "can return an array of all contained variables", ->
				pow = parse.stringToExpression("(a * b) * c", false)
				vars = pow.getAllVariables()
				console.log(vars)
				expect("a" in vars).toBe(true)
				expect("b" in vars).toBe(true)
				expect("c" in vars).toBe(true)

		it "expand and simplify into reasonably-canonical forms", ->
			add = parse.stringToExpression("(a * b)*(2*x + 1)", false)
			expect(add.expandAndSimplify().toLisp()).toBe("(+ (* 2 a b x) (* a b))")
			add = parse.stringToExpression("(3*x+2)*(4*y**2+7)", false)
			expect(add.expand().simplify().toLisp()).toBe("(+ 14 (* 8 (** y 2)) (* 12 x (** y 2)) (* 21 x))")
			add = parse.stringToExpression("(3*x+2)*(4*y**2+7)*(x+2*y)**-1", false)
			expect(add.expand().simplify().toLisp()).toBe("(* (** (+ x (* 2 y)) -1) (+ 14 (* 8 (** y 2)) (* 12 x (** y 2)) (* 21 x)))")

		describe "representing powers", ->

			it "represent powers", ->
				pow = new operators.Pow("2", "3")
				expect(pow.label).toBe("**")
				expect(pow.toLisp()).toBe("(** 2 3)")

			it "require two children", ->
				expect(-> new operators.Pow()).toThrow(new Error("Pow nodes must have two children."))
				expect(-> new operators.Pow("")).toThrow(new Error("Pow nodes must have two children."))
				expect(-> new operators.Pow("", "", "")).toThrow(new Error("Pow nodes must have two children."))

			it "expand", ->
				pow = new operators.Pow("x", 2)
				expect(pow.expand().toLisp()).toBe("(** x 2)")
				pow = parse.stringToExpression("(1 + x)**2", false)
				expect(pow.expand().toLisp()).toBe("(+ (* 1 1) (* 1 x) (* 1 x) (* x x))")
				pow = parse.stringToExpression("(a * b * c)**d", false)
				expect(pow.expand().toLisp()).toBe("(* (** a d) (** b d) (** c d))")

			it "simplify", ->
				pow = parse.stringToExpression("x ** 2", false)
				expect(pow.simplify().toLisp()).toBe("(** x 2)")
				pow = parse.stringToExpression("((2 * x) + (3 * x))**2", false)
				expect(pow.simplify().toLisp()).toBe("(** (* 5 x) 2)")
				pow = parse.stringToExpression("2**((2 * x) + (3 * x))", false)
				expect(pow.simplify().toLisp()).toBe("(** 2 (* 5 x))")
				pow = parse.stringToExpression("((2 * x) + (3 * x))**((2 * x) + (3 * x))", false)
				expect(pow.simplify().toLisp()).toBe("(** (* 5 x) (* 5 x))")
				pow = parse.stringToExpression("(x ** 1)", false)
				expect(pow.simplify().toLisp()).toBe("x")
				pow = parse.stringToExpression("(4 ** 0.5)", false)
				expect(pow.simplify().toLisp()).toBe("2")
				pow = parse.stringToExpression("(4 ** -1 * 4 ** 1", false)
				expect(pow.simplify().toLisp()).toBe("1")
				pow = parse.stringToExpression("(x ** -1 * x ** 1", false)
				expect(pow.simplify().toLisp()).toBe("1")
				pow = parse.stringToExpression("(x ** 2) ** 0.5", false)
				expect(pow.simplify().toLisp()).toBe("x")
				pow = parse.stringToExpression("(x ** 2) ** y", false)
				expect(pow.simplify().toLisp()).toBe("(** x (* 2 y))")
				pow = parse.stringToExpression("(1 ** 2)", false)
				expect(pow.simplify().toLisp()).toBe("1")
				pow = parse.stringToExpression("(1 ** x)", false)
				expect(pow.simplify().toLisp()).toBe("1")
				pow = parse.stringToExpression("(0 ** 0)", false)
				expect(pow.simplify().toLisp()).toBe("1")
				pow = new operators.Pow(new operators.Add("2", "0"), "-1")
				expect(pow.expandAndSimplify().toLisp()).toBe("1/2")

			it "can be solved", ->
				pow = parse.stringToExpression("x ** 2", false)
				expect(pow.solve("x")[0].evaluate()).toEqual(0)
				expect(pow.solve("x").length).toEqual(1)

			describe "throw sensible errors when", ->

				it "trying to solve for a non-existant variable", ->
					pow = parse.stringToExpression("x ** 2", false)
					expect(-> pow.solve("y")).toThrow(new AlgebraError("Unsolvable: (x ** 2) for y"))

				it "trying to solve for a variable in the exponent", ->
					pow = parse.stringToExpression("x ** y", false)
					expect(-> pow.solve("y")).toThrow(new AlgebraError("Unsolvable: (x ** y) for y"))

			it "substitute values", ->
				pow = parse.stringToExpression("a ** b ** c", false)
				pow = pow.sub(
					a: 2,
					b: 3,
					c: 1
				)
				expect(pow.evaluate()).toEqual(8)
				pow = parse.stringToExpression("(a + b) ** c", false)
				pow = pow.sub(
					a: 10,
					b: 20,
					c: 3
				)
				expect(pow.evaluate()).toEqual(27000)

			it "can return an array of all contained variables", ->
				pow = parse.stringToExpression("(a + b)**c", false)
				vars = pow.getAllVariables()
				console.log(vars)
				expect("a" in vars).toBe(true)
				expect("b" in vars).toBe(true)
				expect("c" in vars).toBe(true)


		it "can be formed into a tree", ->
			# (+ 1 (* 2 3))
			expect((new operators.Add(1, new operators.Mul(2, 3))).toLisp()).toBe("(+ 1 (* 2 3))")
			# (* m (** c 2))
			expect((new operators.Mul("m", new operators.Pow("c", 2))).toLisp()).toBe("(* m (** c 2))")