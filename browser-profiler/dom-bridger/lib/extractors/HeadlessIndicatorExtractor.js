"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BaseExtractor_1 = require("./BaseExtractor");
class HeadlessIndicatorExtractor extends BaseExtractor_1.default {
}
exports.default = HeadlessIndicatorExtractor;
HeadlessIndicatorExtractor.definitePatterns = [
    'window.navigator.languages',
    'window.navigator.plugins',
    'window.navigator.mimeTypes',
    'window.HTMLLinkElement.prototype.import',
];
HeadlessIndicatorExtractor.extraAddPatterns = [];
HeadlessIndicatorExtractor.extraChangePatterns = [];
HeadlessIndicatorExtractor.ignoredExtraPatterns = [];
HeadlessIndicatorExtractor.regexps = [
    /window.HTMLLinkElement.prototype.import/
];
//# sourceMappingURL=HeadlessIndicatorExtractor.js.map