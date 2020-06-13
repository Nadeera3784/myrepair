Object.defineProperty(exports, "__esModule", { value: true });


let RandomizerHelpers = (function () {
	function RandomizerHelpers() {
	}

	RandomizerHelpers.prototype.generate = function () {
        return 'xxxxxxxx'.replace(/[x]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16).toUpperCase();
        });
	};

	return RandomizerHelpers;
}());
exports.RandomizerHelpers = RandomizerHelpers;