define [
	"backend/equivalenciesIndex"
], (equivalenciesIndex) ->

	beforeEach ->
		equivalenciesIndex.clear()

	describe "Equivalencies", ->

		it "can be added to an empty index", ->
			equivalenciesIndex.add("a", "b")
			expect(equivalenciesIndex.get("a")).toEqual ["a", "b"]

		it "can be added to a non-empty index with no shared equivalencies", ->
			equivalenciesIndex.add("a", "b")
			equivalenciesIndex.add("c", "d")
			equivalenciesIndex.add("e", "f")
			expect(equivalenciesIndex.get("e")).toEqual ["e", "f"]

		it "can be added to a non-empty index with one shared equivalency", ->
			equivalenciesIndex.add("a", "b")
			equivalenciesIndex.add("c", "d")
			equivalenciesIndex.add("e", "f")
			equivalenciesIndex.add("a", "g")
			expect(equivalenciesIndex.get("a")).toEqual ["a", "b", "g"]
			expect(equivalenciesIndex.get("g")).toEqual ["a", "b", "g"]

		it "can be added to a non-empty index with two shared equivalencies", ->
			equivalenciesIndex.add("a", "b")
			equivalenciesIndex.add("c", "d")
			equivalenciesIndex.add("e", "f")
			equivalenciesIndex.add("a", "e")
			expect(equivalenciesIndex.get("a")).toEqual ["a", "b", "e", "f"]
			expect(equivalenciesIndex.get("e")).toEqual ["a", "b", "e", "f"]

		it "can be added to a non-empty index with both variables already equivalent", ->
			equivalenciesIndex.add("a", "b")
			equivalenciesIndex.add("c", "d")
			equivalenciesIndex.add("e", "f")
			equivalenciesIndex.add("a", "b")
			expect(equivalenciesIndex.get("a")).toEqual ["a", "b"]
			expect(equivalenciesIndex.get("b")).toEqual ["a", "b"]