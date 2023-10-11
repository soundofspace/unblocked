"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadData = void 0;
const Fs = require("fs");
const Path = require("path");
const BrowserData_1 = require("./BrowserData");
const paths_1 = require("../paths");
class DataLoader {
    constructor() {
        var _a;
        this.browserOsEmulatorsByVersion = {};
        this.osDataDirs = new Set();
        this.baseDir = Path.join(__dirname, '..');
        this.dataDir = paths_1.emulatorDataDir;
        const browsers = Fs.readdirSync(this.dataDir);
        for (const browser of browsers) {
            if (browser.startsWith('as-') && Fs.statSync(`${this.dataDir}/${browser}`).isDirectory()) {
                this.browserOsEmulatorsByVersion[browser] = {};
                for (const osDir of Fs.readdirSync(`${this.dataDir}/${browser}`)) {
                    if (osDir.startsWith('as-') &&
                        Fs.statSync(`${this.dataDir}/${browser}/${osDir}`).isDirectory()) {
                        const isMac = osDir.startsWith('as-mac');
                        const version = osDir.replace('as-mac-os-', '').replace('as-windows-', '');
                        const name = isMac ? 'mac-os' : 'windows';
                        (_a = this.browserOsEmulatorsByVersion[browser])[name] ?? (_a[name] = []);
                        this.browserOsEmulatorsByVersion[browser][name].push(version);
                        this.osDataDirs.add(`${this.dataDir}/${browser}/${osDir}`);
                    }
                }
            }
        }
    }
    isSupportedEmulatorOs(osDir) {
        return this.osDataDirs.has(osDir);
    }
    isInstalledBrowser(browserId) {
        return !!(this.browserOsEmulatorsByVersion[browserId] ||
            this.browserOsEmulatorsByVersion[`as-${browserId}`]);
    }
    isInstalledBrowserAndOs(browserId, osId) {
        const path = `${this.dataDir}/as-${browserId}/as-${osId}`;
        return this.osDataDirs.has(path);
    }
    get pkg() {
        return loadData(`${this.baseDir}/package.json`);
    }
    get browserEngineOptions() {
        return loadData(`${this.dataDir}/browserEngineOptions.json`);
    }
    as(userAgentOption) {
        return new BrowserData_1.default(this, userAgentOption);
    }
    getBrowserOperatingSystemVersions(browserId, osName) {
        if (!this.browserOsEmulatorsByVersion[`as-${browserId}`])
            return [];
        return this.browserOsEmulatorsByVersion[`as-${browserId}`][osName];
    }
}
exports.default = DataLoader;
const cacheMap = {};
function loadData(path) {
    cacheMap[path] = cacheMap[path] || JSON.parse(Fs.readFileSync(path, 'utf8'));
    return cacheMap[path];
}
exports.loadData = loadData;
//# sourceMappingURL=DataLoader.js.map