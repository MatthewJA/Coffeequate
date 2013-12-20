require.config
	baseUrl: "../src"
	urlArgs: "cb=" + Math.random() # Cache breaker
	paths:
		"spec": "../tests/spec"
		"jquery": "lib/jquery.min"
		"JSAlgebra": "lib/JS-Algebra/src"
	shim:
		"jquery":
			exports: ["jquery"]

require ["jquery"], ($) ->
	jasmineEnv = jasmine.getEnv()
	htmlReporter = new jasmine.HtmlReporter()
	jasmineEnv.addReporter(htmlReporter)

	specs = [
		# "spec/equationIndex"
		# "spec/expressionIndex"
		"spec/equivalenciesIndex"
		# "spec/getFormula"
		"spec/solveEquation"
	]

	jasmineEnv.specFilter = (spec) ->
		htmlReporter.specFilter(spec)

	$ ->
		require specs, ->
			jasmineEnv.execute()