import IDomPolyfill from '@ulixee/unblocked-specification/plugin/IDomPolyfill';
export default class DomBridger {
    static removeDevtoolsFromPolyfill(polyfill: IDomPolyfill): void;
    static removeBrowserstackFromPolyfill(polyfill: IDomPolyfill): void;
    static removeHeadlessFromPolyfill(polyfill: IDomPolyfill): void;
    static removeVariationsFromPolyfill(polyfill: IDomPolyfill): void;
    static removeUnsupportedPropertiesFromPolyfill(polyfill: IDomPolyfill): void;
}
