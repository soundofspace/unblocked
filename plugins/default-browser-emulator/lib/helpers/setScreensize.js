"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function setScreensize(emulationProfile, page, devtools) {
    const { viewport } = emulationProfile;
    if (!viewport)
        return;
    const promises = [];
    const metricsOverrideRequest = {
        width: viewport.width,
        height: viewport.height,
        deviceScaleFactor: viewport.deviceScaleFactor ?? 0,
        mobile: false,
    };
    if (emulationProfile.browserEngine.isHeaded && viewport.screenWidth) {
        promises.push(page.devtoolsSession.send('Browser.getWindowForTarget').then(({ windowId, bounds }) => {
            if (bounds.width === viewport.screenWidth && bounds.height === viewport.screenHeight) {
                return null;
            }
            return devtools.send('Browser.setWindowBounds', {
                windowId,
                bounds: {
                    width: viewport.screenWidth,
                    height: viewport.screenHeight,
                    windowState: 'normal',
                },
            });
        }));
    }
    else {
        Object.assign(metricsOverrideRequest, {
            positionX: viewport.positionX,
            positionY: viewport.positionY,
            screenWidth: viewport.screenWidth,
            screenHeight: viewport.screenHeight,
        });
    }
    promises.push(devtools.send('Emulation.setDeviceMetricsOverride', metricsOverrideRequest));
    if (viewport.width === 0 || viewport.height === 0) {
        promises.push(devtools.send('Page.getLayoutMetrics').then((x) => {
            const visualViewport = x.cssVisualViewport ?? x.visualViewport;
            viewport.height = visualViewport.clientHeight;
            viewport.width = visualViewport.clientWidth;
            viewport.deviceScaleFactor = visualViewport.scale;
            return viewport;
        }));
    }
    await Promise.all(promises);
}
exports.default = setScreensize;
//# sourceMappingURL=setScreensize.js.map