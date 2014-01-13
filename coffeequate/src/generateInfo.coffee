define ->

	# Return formatted information for output.

	return {
		getMathMLInfo: (equationID, expression, equality="0") ->
			mathClass = if expression then "expression" else "equation"
			mathID = "#{mathClass}-#{if equationID? then equationID else Math.floor(Math.random()*10000000).toString(16)}"
			mathIDstring = if equationID? then 'id="' + mathID + '"' else ""

			html = '<div ' + mathIDstring + ' class="' + mathClass + '"><math xmlns="http://www.w3.org/1998/Math/MathML">' + (if equality? then (if isFinite(equality) then "<mn>#{equality}</mn>" else (if equality.toMathML? then "#{equality.toMathML(equationID, expression)}" else "<mi>#{equality}</mi>")) + "<mo>=</mo>" else "")
			return [mathClass, mathID, html]

		getHTMLInfo: (equationID, expression, equality="0") ->
			mathClass = if expression then "expression" else "equation"
			mathID = "#{mathClass}-#{if equationID? then equationID else Math.floor(Math.random()*10000000).toString(16)}"
			mathIDstring = if equationID? then 'id="' + mathID + '"' else ""

			html = '<div ' + mathIDstring + ' class="' + mathClass + '">'+ (if equality? then (if equality.toHTML? then "#{equality.toHTML(equationID, expression)}" else "#{equality}") + "=" else "")
			return [mathClass, mathID, html]
	}