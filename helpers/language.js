Object.defineProperty(exports, "__esModule", { value: true });
const path    = require('path');

let LanguageHelpers = (function () {
	function LanguageHelpers() {
	}
	
	LanguageHelpers.prototype.GetLine = function () {
		let i18n = new (require('i18n-2'))({
			locales: ['en', 'de', 'es', 'ru'],
			directory: path.join(__dirname, '../language/'),
			devMode : false
		});
		return i18n;
	};
	
	return LanguageHelpers;
}());
exports.LanguageHelpers = LanguageHelpers;