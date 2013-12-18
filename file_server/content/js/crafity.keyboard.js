window.keyboard = (function () {

	var emitter = new crafity.core.EventEmitter();
	
	window.addEventListener("keydown", function (e) {
		if (e.shiftKey && e.keyIdentifier === "U+004D" && e.which === 77) {
			console.log("cmd+shft+m");
			emitter.emit("cmd+shft+m", e);
			//e.preventDefault();
			//return false;
		}
		if (!e.shiftKey && e.metaKey && e.which === 69) {
			console.log("cmd+e");
			emitter.emit("cmd+e", e);
		}
		if (!e.shiftKey && e.metaKey && e.which === 76) {
			console.log("cmd+l");
			emitter.emit("cmd+l", e);
		}
		// U+0046 70 
		if (!e.shiftKey && e.metaKey && e.which === 70) {
			console.log("cmd+f");
			console.log("emitter", emitter);
			emitter.emit("cmd+f", e);
		}
		if (!e.shiftKey && e.metaKey && e.which === 78) {
			emitter.emit("cmd+n", e);
			return false;
		}
		if (!e.shiftKey && e.metaKey && e.altKey && e.which === 192) {
			emitter.emit("cmd+opt+n", e);
			return false;
		}
		if (!e.shiftKey && e.keyIdentifier === "U+001B" && e.which === 27) {
			console.log("esc");
			emitter.emit("esc", e);
		}
		if (e.which == 83 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
			console.log("cmd+s");
			emitter.emit("cmd+s", e);
		}
	});

	return {
		on: function (shortcuts, callback) {
			[].concat(shortcuts).forEach(function (shortcut) {
				emitter.on(shortcut, callback)
			});
		}
	};
}());
