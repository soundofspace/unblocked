"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DomOverridesBuilder_1 = require("./DomOverridesBuilder");
const parseNavigatorPlugins_1 = require("./utils/parseNavigatorPlugins");
function loadDomOverrides(emulationProfile, data, userAgentData) {
    const domOverrides = new DomOverridesBuilder_1.default();
    const deviceProfile = emulationProfile.deviceProfile;
    const isHeadless = emulationProfile.browserEngine.isHeaded !== true &&
        emulationProfile.browserEngine.isHeadlessNew !== true;
    domOverrides.add('navigator.hardwareConcurrency', {
        concurrency: deviceProfile.hardwareConcurrency,
    });
    domOverrides.add('navigator.deviceMemory', {
        memory: deviceProfile.deviceMemory,
        storageTib: deviceProfile.deviceStorageTib,
        maxHeapSize: deviceProfile.maxHeapSize,
    });
    domOverrides.add('navigator', {
        userAgentString: emulationProfile.userAgentOption.string,
        platform: emulationProfile.windowNavigatorPlatform,
        headless: isHeadless,
        pdfViewerEnabled: data.windowNavigator.navigator.pdfViewerEnabled?._$value,
        userAgentData,
        rtt: emulationProfile.deviceProfile.rtt,
    });
    domOverrides.add('MediaDevices.prototype.enumerateDevices', {
        videoDevice: deviceProfile.videoDevice,
    });
    if (isHeadless) {
        domOverrides.add('Notification.permission');
        domOverrides.add('Permission.prototype.query');
        const windowChrome = data.windowChrome;
        if (windowChrome) {
            domOverrides.add('window.chrome', {
                updateLoadTimes: true,
                polyfill: {
                    property: windowChrome.chrome,
                    prevProperty: windowChrome.prevProperty,
                },
            });
        }
    }
    const domPolyfill = data.domPolyfill;
    if (domPolyfill) {
        if (domPolyfill?.add?.length) {
            domOverrides.add('polyfill.add', {
                itemsToAdd: domPolyfill.add,
            });
        }
        if (domPolyfill?.remove?.length) {
            domOverrides.add('polyfill.remove', {
                itemsToRemove: domPolyfill.remove,
            });
        }
        if (domPolyfill?.modify?.length) {
            domOverrides.add('polyfill.modify', {
                itemsToModify: domPolyfill.modify,
            });
        }
        if (domPolyfill?.reorder?.length) {
            domOverrides.add('polyfill.reorder', {
                itemsToReorder: domPolyfill.reorder,
            });
        }
    }
    const windowNavigator = data.windowNavigator;
    if (isHeadless) {
        domOverrides.add('navigator.plugins', (0, parseNavigatorPlugins_1.default)(windowNavigator.navigator));
    }
    domOverrides.add('WebGLRenderingContext.prototype.getParameter', deviceProfile.webGlParameters);
    domOverrides.add('console');
    domOverrides.add('HTMLIFrameElement.prototype');
    domOverrides.add('SharedWorker.prototype');
    if (emulationProfile.consoleLogPageJson) {
        domOverrides.add('JSON.stringify');
    }
    const locale = emulationProfile.locale;
    const voices = data.speech.voices?.map(x => {
        x.default = locale.includes(x.lang);
        return x;
    });
    if (voices?.length) {
        domOverrides.add('speechSynthesis.getVoices', { voices });
    }
    const frame = data.windowFraming;
    domOverrides.add('window.outerWidth', {
        frameBorderWidth: frame.frameBorderWidth,
    });
    domOverrides.add('window.outerHeight', {
        frameBorderHeight: frame.frameBorderHeight,
    });
    if (Number(emulationProfile.browserEngine.fullVersion.split('.')[0]) >= 109) {
        domOverrides.add('performance');
    }
    domOverrides.add('window.screen', {
        unAvailHeight: frame.screenGapTop + frame.screenGapBottom,
        unAvailWidth: frame.screenGapLeft + frame.screenGapRight,
        colorDepth: emulationProfile.viewport.colorDepth ?? frame.colorDepth,
    });
    domOverrides.registerWorkerOverrides('console', 'navigator.deviceMemory', 'navigator.hardwareConcurrency', 'navigator', 'WebGLRenderingContext.prototype.getParameter');
    return domOverrides;
}
exports.default = loadDomOverrides;
//# sourceMappingURL=loadDomOverrides.js.map