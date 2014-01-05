define ->

	# Return formatted information for output.

	return {
		getMathMLInfo: (equationID, expression, equality="0") ->
			mathClass = if expression then "expression" else "equation"
			mathID = "#{mathClass}-#{if equationID? then equationID else Math.floor(Math.random()*10000000).toString(16)}"

			html = '<div id="' + mathID + '" class="' + mathClass + '"><math xmlns="http://www.w3.org/1998/Math/MathML">' + (if equality? then (if isFinite(equality) then "<mn>#{equality}</mn>" else "<mi>#{equality}</mi>") + "<mo>=</mo>" else "")
			return [mathClass, mathID, html]

		getHTMLInfo: (equationID, expression, equality="0") ->
			mathClass = if expression then "expression" else "equation"
			mathID = "#{mathClass}-#{if equationID? then equationID else Math.floor(Math.random()*10000000).toString(16)}"

			html = '<div id="' + mathID + '" class="' + mathClass + '">'+ (if equality? then (if isFinite(equality) then "#{equality}" else "#{equality}") + "=" else "")
			return [mathClass, mathID, html]
	}