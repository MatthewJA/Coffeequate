define ["operators"], (operators) ->

	describe "Comparisons can be made between", ->

		# These test cases are not very interesting, but they might help pick up some big errors.
		# (In fact, they already have)

		it "addition and addition", ->
			expect(operators.compare(new operators.Add("1", "2"), new operators.Add("2", "2"))).toEqual(-1)
			expect(operators.compare(new operators.Add("2", "2"), new operators.Add("2", "2"))).toEqual(0)
			expect(operators.compare(new operators.Add("1", "5"), new operators.Add("1", "3"))).toEqual(1)
			expect(operators.compare(new operators.Add("1", "3"), new operators.Add("1", "3", "5"))).toEqual(-1)
			expect(operators.compare(new operators.Add("1", "3", "5"), new operators.Add("1", "3"))).toEqual(1)

		it "addition and multiplication", ->
			expect(operators.compare(new operators.Add("1", "2"), new operators.Mul("2", "2"))).toEqual(1)
			expect(operators.compare(new operators.Mul("2", "2"), new operators.Add("2", "2"))).toEqual(-1)

		it "multiplication and multiplication", ->
			expect(operators.compare(new operators.Mul("1", "2"), new operators.Mul("2", "2"))).toEqual(-1)
			expect(operators.compare(new operators.Mul("2", "2"), new operators.Mul("2", "2"))).toEqual(0)
			expect(operators.compare(new operators.Mul("1", "5"), new operators.Mul("1", "3"))).toEqual(1)
			expect(operators.compare(new operators.Mul("1", "3"), new operators.Mul("1", "3", "5"))).toEqual(-1)
			expect(operators.compare(new operators.Mul("1", "3", "5"), new operators.Mul("1", "3"))).toEqual(1)

		it "addition and powers", ->
			expect(operators.compare(new operators.Add("1", "2"), new operators.Pow("1", "2"))).toEqual(1)
			expect(operators.compare(new operators.Pow("1", "2"), new operators.Add("1", "2"))).toEqual(-1)

		it "multiplication and powers", ->
			expect(operators.compare(new operators.Mul("1", "2"), new operators.Pow("1", "2"))).toEqual(1)
			expect(operators.compare(new operators.Pow("1", "2"), new operators.Mul("1", "2"))).toEqual(-1)

		it "powers and powers", ->
			expect(operators.compare(new operators.Pow("1", "2"), new operators.Pow("1", "2"))).toEqual(0)
			expect(operators.compare(new operators.Pow("2", "2"), new operators.Pow("1", "2"))).toEqual(1)
			expect(operators.compare(new operators.Pow("1", "2"), new operators.Pow("2", "2"))).toEqual(-1)
			expect(operators.compare(new operators.Pow("2", "3"), new operators.Pow("2", "2"))).toEqual(1)
			expect(operators.compare(new operators.Pow("2", "1"), new operators.Pow("2", "2"))).toEqual(-1)

		it "towers of powers", ->
			expect(operators.compare(new operators.Pow("1", new operators.Pow("2", "3")), new operators.Pow("1", new operators.Pow("2", "3")))).toEqual(0)
			expect(operators.compare(new operators.Pow("1", new operators.Pow("2", "3")), new operators.Pow("1", new operators.Pow("2", "4")))).toEqual(-1)
			expect(operators.compare(new operators.Pow("1", new operators.Pow("2", "4")), new operators.Pow("1", new operators.Pow("2", "3")))).toEqual(1)
			expect(operators.compare(new operators.Pow("1", new operators.Pow("2", "3")), new operators.Pow("1", new operators.Pow("1", "3")))).toEqual(1)
			expect(operators.compare(new operators.Pow("1", new operators.Pow("1", "3")), new operators.Pow("1", new operators.Pow("2", "3")))).toEqual(-1)

		it "powers of towers", ->
			expect(operators.compare(new operators.Pow(new operators.Pow("2", "3"), "1"), new operators.Pow(new operators.Pow("2", "3"), "1"))).toEqual(0)
			expect(operators.compare(new operators.Pow(new operators.Pow("2", "3"), "1"), new operators.Pow(new operators.Pow("2", "4"), "1"))).toEqual(-1)
			expect(operators.compare(new operators.Pow(new operators.Pow("2", "4"), "1"), new operators.Pow(new operators.Pow("2", "3"), "1"))).toEqual(1)
			expect(operators.compare(new operators.Pow(new operators.Pow("2", "3"), "1"), new operators.Pow(new operators.Pow("1", "3"), "1"))).toEqual(1)
			expect(operators.compare(new operators.Pow(new operators.Pow("1", "3"), "1"), new operators.Pow(new operators.Pow("2", "3"), "1"))).toEqual(-1)