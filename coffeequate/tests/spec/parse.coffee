define ["parse", "terminals"], (parse, terminals) ->

	describe "Strings can be parsed into", ->

		it "expressions", ->
			expect((new parse.stringToExpression("1 + 2")).toString()).toBe("(+ 1 2)")
			expect((new parse.stringToExpression("1 + 2 + 3")).toString()).toBe("(+ (+ 1 2) 3)")
			expect((new parse.stringToExpression("1 * 2")).toString()).toBe("(* 1 2)")
			expect((new parse.stringToExpression("1 * 2 * 3")).toString()).toBe("(* (* 1 2) 3)")
			expect((new parse.stringToExpression("1 ** 2")).toString()).toBe("(** 1 2)")
			expect((new parse.stringToExpression("1 ** 2 ** 3")).toString()).toBe("(** (** 1 2) 3)")
			expect((new parse.stringToExpression("1 * 2 + 3 * 4")).toString()).toBe("(+ (* 1 2) (* 3 4))")
			expect((new parse.stringToExpression("1 * 2 ** 1/2 + 3 * 4")).toString()).toBe("(+ (* 1 (** 2 1/2)) (* 3 4))")
			expect((new parse.stringToExpression("1 * 2 ** (1/2 + 3) * 4")).toString()).toBe("(* (* 1 (** 2 (+ 1/2 3))) 4)")
			expect((new parse.stringToExpression("1 * 2 ** (1/2 + a) * z")).toString()).toBe("(* (* 1 (** 2 (+ 1/2 a))) z)")
			expect((new parse.stringToExpression("2+3*(-5)+(-12)")).toString()).toBe("(+ (+ 2 (* 3 (* -1 5))) (* -1 12))")

		it "terms", ->
			expect(parse.stringToTerminal("1/2").toString()).toEqual("1/2")
			expect(parse.stringToTerminal("2/4")).toEqual(new terminals.Constant("2", "4"))