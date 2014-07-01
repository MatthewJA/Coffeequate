(function() {
	var repl = $($(".repl")[0]);


	var scrollback = document.createElement("ul");
	scrollback.className = "scrollback";

	var entryArea = document.createElement("div");
	entryArea.className = "entry-area";
	var entry = document.createElement("input");
	entry.className = "entry prettyprint";
	entry.setAttribute("tabindex", "1");
	var entryButton = document.createElement("input");
	entryButton.type = "submit";
	entryButton.value = ">";
	entryButton.className = "entry-button";
	entryArea.appendChild(entry);
	entryArea.appendChild(entryButton);

	var $entry = $(entry);

	repl.append(scrollback);
	repl.append(entryArea);

	var history = [];
	var positionInHistory = 0

	function submit(value) {
		history.push(value);
		positionInHistory = history.length;
		try {
			var ret = eval(value);
		} catch (err) {
			var ret = err.toString();
		}
		var li2 = document.createElement("li");
		li2.innerHTML = prettyPrintOne(value, "js");
		scrollback.appendChild(li2);
		var li = document.createElement("li");
		li.innerHTML = "&#8594; " + prettyPrintOne(ret, "js");
		scrollback.appendChild(li);
		entry.value = "";
	}



	$entry.on('keydown', function (e) {
		if (e.keyCode == 13) {
			if (entry.value) {
				submit(entry.value);
			}
		} else if (e.keyCode == 38) {
			positionInHistory = Math.max(positionInHistory - 1, 0);
			$entry.val(history[positionInHistory] || "");
			event.preventDefault();
		} else if (e.keyCode == 40) {
			positionInHistory = Math.min(positionInHistory + 1, history.length);
			$entry.val(history[positionInHistory] || "");
			event.preventDefault();
		}
	});
	entryButton.addEventListener('click', submit);

	submit("1 + 2");
	submit("CQ(\"(x+y)**2\").simplify()");
	submit('CQ("(x+y)**2").simplify().toLaTeX()')

}).call()