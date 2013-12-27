define ["operators"], (operators) ->

	describe "Comparisons can be made between", ->

		it "addition and addition", ->
			expect(operators.compare(new operators.Add("1", "2"), new operators.Add("2", "2"))).toEqual(-1)
			expect(operators.compare(new operators.Add("2", "2"), new operators.Add("2", "2"))).toEqual(0)
			expect(operators.compare(new operators.Add("1", "5"), new operators.Add("1", "3"))).toEqual(1)
			expect(operators.compare(new operators.Add("1", "3"), new operators.Add("1", "3", "5"))).toEqual(-1)
			expect(operators.compare(new operators.Add("1", "3", "5"), new operators.Add("1", "3"))).toEqual(1)

		it "multiplication and multiplication", ->
			expect(operators.compare(new operators.Mul("1", "2"), new operators.Mul("2", "2"))).toEqual(-1)
			expect(operators.compare(new operators.Mul("2", "2"), new operators.Mul("2", "2"))).toEqual(0)
			expect(operators.compare(new operators.Mul("1", "5"), new operators.Mul("1", "3"))).toEqual(1)
			expect(operators.compare(new operators.Mul("1", "3"), new operators.Mul("1", "3", "5"))).toEqual(-1)
			expect(operators.compare(new operators.Mul("1", "3", "5"), new operators.Mul("1", "3"))).toEqual(1)