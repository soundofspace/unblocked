declare const frameWindowProxies: WeakMap<object, any>;
declare const hasRunNewDocumentScripts: WeakSet<object>;
declare const originalContentWindow: () => any;
declare function getTrueContentWindow(frame: HTMLIFrameElement): Window;
