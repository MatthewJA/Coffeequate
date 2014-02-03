require.config
	baseUrl: "../src"
	urlArgs: "cb=" + Math.random() # Cache breaker
	paths:
		"spec": "../tests/spec"
		"jquery": "../tests/lib/jQuery/jquery.min"
	shim:
		"jquery":
			exports: ["jquery"]

require ["jquery"], ($) ->
	jasmineEnv = jasmine.getEnv()
	htmlReporter = new jasmine.HtmlReporter()
	jasmineEnv.addReporter(htmlReporter)

	specs = [
		"spec/nodes"
		"spec/terminals"
		"spec/parse"
		"spec/compare"
		"spec/differentiate"
#		"spec/coffeequate"
	]

	jasmineEnv.specFilter = (spec) ->
		htmlReporter.specFilter(spec)

	$ ->
		require specs, ->
			jasmineEnv.execute()