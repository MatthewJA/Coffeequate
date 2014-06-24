(function() {
	var repl = document.getElementById("repl");

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

	var style = document.createElement("style");
	style.innerHTML = ".entry {width: 90%; height: 32px; display: inline-block; font-family: monospace; padding: 0; border: 0; font-size: 28px;}";
	style.innerHTML += ".entry:focus {background-color: #EFEFFF;}";
	style.innerHTML += ".entry-area {width: 100%; height: 32px; border: 1px solid #EAEAEA; padding: 0;}";
	style.innerHTML += ".entry-button {width: 10%; height: 32px; padding: 0; border: 0; margin: 0; vertical-align: top;}";
	style.innerHTML += ".scrollback {font-family: monospace; list-style-type: none; overflow: auto;}";
	style.innerHTML += "#repl {width: 500px; margin: 0 auto;}";
	repl.appendChild(style);

	repl.appendChild(scrollback);
	repl.appendChild(entryArea);

	var history = [];
	var positionInHistory = 0

	function submit() {
		history.push(entry.value);
		positionInHistory = history.length;
		try {
			var ret = eval(entry.value);
		} catch (err) {
			var ret = err.toString();
		}
		var li2 = document.createElement("li");
		li2.innerHTML = prettyPrintOne(entry.value, "js");
		scrollback.appendChild(li2);
		var li = document.createElement("li");
		li.innerHTML = "&#8594; " + prettyPrintOne(ret, "js");
		scrollback.appendChild(li);
		entry.value = "";
	}



	$entry.on('keydown', function (e) {
		if (e.keyCode == 13) {
			submit();
		} else if (e.keyCode == 38) {
			positionInHistory = Math.max(positionInHistory - 1, 0);
			$entry.val(history[positionInHistory] || "");
		} else if (e.keyCode == 40) {
			positionInHistory = Math.min(positionInHistory + 1, history.length);
			$entry.val(history[positionInHistory] || "");
		}
	});
	entryButton.addEventListener('click', submit);
}).call()