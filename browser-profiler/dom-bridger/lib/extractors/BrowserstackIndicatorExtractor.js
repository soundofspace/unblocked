"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BaseExtractor_1 = require("./BaseExtractor");
class BrowserstackIndicatorExtractor extends BaseExtractor_1.default {
}
exports.default = BrowserstackIndicatorExtractor;
BrowserstackIndicatorExtractor.definitePatterns = [
    'window.chrome.runtime',
    'window.HTMLAnchorElement.prototype.hrefTranslate',
];
BrowserstackIndicatorExtractor.extraAddPatterns = [];
BrowserstackIndicatorExtractor.extraChangePatterns = [];
BrowserstackIndicatorExtractor.ignoredExtraPatterns = [];
BrowserstackIndicatorExtractor.regexps = [
    /window.chrome$/,
    /window.chrome.runtime/,
    /window.HTMLAnchorElement.prototype.hrefTranslate/,
    /stack._\$value/,
];
//# sourceMappingURL=BrowserstackIndicatorExtractor.js.map