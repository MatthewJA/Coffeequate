define ["parse"], (parse) ->

	describe "Strings can be parsed into", ->

		it "expressions", ->
			expect((new parse.ExpressionFromString("1 + 2")).toString()).toBe("(+ 1 2)")
			expect((new parse.ExpressionFromString("1 + 2 + 3")).toString()).toBe("(+ 1 (+ 2 3))")
			expect((new parse.ExpressionFromString("1 * 2")).toString()).toBe("(* 1 2)")
			expect((new parse.ExpressionFromString("1 * 2 * 3")).toString()).toBe("(* 1 (* 2 3))")
			expect((new parse.ExpressionFromString("1 ** 2")).toString()).toBe("(** 1 2)")
			expect((new parse.ExpressionFromString("1 ** 2 ** 3")).toString()).toBe("(** 1 (** 2 3))")