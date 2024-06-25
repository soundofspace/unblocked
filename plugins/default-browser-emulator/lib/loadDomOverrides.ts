import IEmulationProfile from '@ulixee/unblocked-specification/plugin/IEmulationProfile';
import IBrowserData from '../interfaces/IBrowserData';
import IUserAgentData from '../interfaces/IUserAgentData';
import DomOverridesBuilder from './DomOverridesBuilder';
import IBrowserEmulatorConfig, {
  ConsolePatchModes,
  InjectedScript,
} from '../interfaces/IBrowserEmulatorConfig';

export default function loadDomOverrides(
  config: IBrowserEmulatorConfig,
  emulationProfile: IEmulationProfile,
  data: IBrowserData,
  userAgentData: IUserAgentData,
): DomOverridesBuilder {
  const domOverrides = new DomOverridesBuilder();

  const deviceProfile = emulationProfile.deviceProfile;
  const isHeadless =
    emulationProfile.browserEngine.isHeaded !== true &&
    emulationProfile.browserEngine.isHeadlessNew !== true;

  const locale = emulationProfile.locale;
  const voices = data.speech.voices?.map(x => {
    x.default = locale.includes(x.lang);
    return x;
  });

  const domPolyfill = data.domPolyfill;

  const consoleConfig = config[InjectedScript.CONSOLE_LOG];
  if (consoleConfig) {
    const mode: ConsolePatchModes = consoleConfig === true ? 'patchLeaks' : consoleConfig.mode;
    domOverrides.add(InjectedScript.CONSOLE_LOG, { mode });
    domOverrides.registerWorkerOverrides('console');
  }

  if (config[InjectedScript.JSON_STRINGIFY]) {
    domOverrides.add(InjectedScript.JSON_STRINGIFY);
  }

  if (config[InjectedScript.MEDIA_DEVICES_PROTOTYPE_ENUMERATE_DEVICES]) {
    domOverrides.add(InjectedScript.MEDIA_DEVICES_PROTOTYPE_ENUMERATE_DEVICES, {
      videoDevice: deviceProfile.videoDevice,
    });
  }

  if (config[InjectedScript.NAVIGATOR]) {
    domOverrides.add(InjectedScript.NAVIGATOR, {
      userAgentString: emulationProfile.userAgentOption.string,
      platform: emulationProfile.windowNavigatorPlatform,
      headless: isHeadless,
      pdfViewerEnabled: data.windowNavigator.navigator.pdfViewerEnabled?._$value,
      userAgentData,
      rtt: emulationProfile.deviceProfile.rtt,
    });
    domOverrides.registerWorkerOverrides('navigator');
  }

  if (config[InjectedScript.NAVIGATOR_DEVICE_MEMORY]) {
    domOverrides.add(InjectedScript.NAVIGATOR_DEVICE_MEMORY, {
      memory: deviceProfile.deviceMemory,
      storageTib: deviceProfile.deviceStorageTib,
      maxHeapSize: deviceProfile.maxHeapSize,
    });
    domOverrides.registerWorkerOverrides('navigator.deviceMemory');
  }

  if (config[InjectedScript.NAVIGATOR_HARDWARE_CONCURRENCY]) {
    domOverrides.add(InjectedScript.NAVIGATOR_HARDWARE_CONCURRENCY, {
      concurrency: deviceProfile.hardwareConcurrency,
    });
    domOverrides.registerWorkerOverrides(InjectedScript.NAVIGATOR_HARDWARE_CONCURRENCY);
  }

  if (
    config[InjectedScript.PERFORMANCE] &&
    Number(emulationProfile.browserEngine.fullVersion.split('.')[0]) >= 109
  ) {
    domOverrides.add(InjectedScript.PERFORMANCE);
  }

  if (domPolyfill) {
    if (config[InjectedScript.POLYFILL_ADD] && domPolyfill?.add?.length) {
      domOverrides.add(InjectedScript.POLYFILL_ADD, {
        itemsToAdd: domPolyfill.add,
      });
    }

    if (config[InjectedScript.POLYFILL_MODIFY] && domPolyfill?.modify?.length) {
      domOverrides.add(InjectedScript.POLYFILL_MODIFY, {
        itemsToAdd: domPolyfill.modify,
      });
    }

    if (config[InjectedScript.POLYFILL_REMOVE] && domPolyfill?.remove?.length) {
      domOverrides.add(InjectedScript.POLYFILL_REMOVE, {
        itemsToRemove: domPolyfill.remove,
      });
    }

    if (config[InjectedScript.POLYFILL_REORDER] && domPolyfill?.reorder?.length) {
      domOverrides.add(InjectedScript.POLYFILL_REORDER, {
        itemsToReorder: domPolyfill.add,
      });
    }
  }

  if (config[InjectedScript.SHAREDWORKER_PROTOTYPE]) {
    domOverrides.add(InjectedScript.SHAREDWORKER_PROTOTYPE);
  }

  if (config[InjectedScript.SPEECH_SYNTHESIS_GETVOICES] && voices?.length) {
    domOverrides.add(InjectedScript.SPEECH_SYNTHESIS_GETVOICES, { voices });
  }

  if (config[InjectedScript.WINDOW_SCREEN]) {
    const frame = data.windowFraming;
    domOverrides.add(InjectedScript.WINDOW_SCREEN, {
      unAvailHeight: frame.screenGapTop + frame.screenGapBottom,
      unAvailWidth: frame.screenGapLeft + frame.screenGapRight,
      colorDepth: emulationProfile.viewport.colorDepth ?? frame.colorDepth,
    });
  }

  if (config[InjectedScript.WEBGL_RENDERING_CONTEXT_PROTOTYPE_GETPARAMETERS]) {
    domOverrides.add(
      InjectedScript.WEBGL_RENDERING_CONTEXT_PROTOTYPE_GETPARAMETERS,
      deviceProfile.webGlParameters,
    );
    domOverrides.registerWorkerOverrides('WebGLRenderingContext.prototype.getParameter');
  }

  return domOverrides;
}
