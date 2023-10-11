"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("@ulixee/commons/lib/SourceMapSupport");
const Fs = require("fs");
const Path = require("path");
const unblocked_browser_profiler_1 = require("@ulixee/unblocked-browser-profiler");
const deepDiff_1 = require("@ulixee/unblocked-browser-profiler/lib/deepDiff");
const foreachBridgeSet_1 = require("../lib/foreachBridgeSet");
const devtoolsToNodevtools = generateRawMappings(['nodevtools', 'devtools']);
const devtoolsToNodevtoolsPath = Path.resolve(unblocked_browser_profiler_1.default.dataDir, 'dom-bridges/raw-mappings/nodevtools-to-devtools.json');
Fs.writeFileSync(devtoolsToNodevtoolsPath, JSON.stringify(devtoolsToNodevtools, null, 2));
const headlessToHeaded = generateRawMappings(['headed', 'headless']);
const headlessToHeadedPath = Path.resolve(unblocked_browser_profiler_1.default.dataDir, 'dom-bridges/raw-mappings/headed-to-headless.json');
Fs.writeFileSync(headlessToHeadedPath, JSON.stringify(headlessToHeaded, null, 2));
const instanceToInstance = generateRawMappings(['instance', 'instance']);
const instanceToInstancePath = Path.resolve(unblocked_browser_profiler_1.default.dataDir, 'dom-bridges/raw-mappings/instance-to-instance.json');
Fs.writeFileSync(instanceToInstancePath, JSON.stringify(instanceToInstance, null, 2));
const localToBrowserstack = generateRawMappings(['local', 'browserstack']);
const localToBrowserstackPath = Path.resolve(unblocked_browser_profiler_1.default.dataDir, 'dom-bridges/raw-mappings/local-to-browserstack.json');
Fs.writeFileSync(localToBrowserstackPath, JSON.stringify(localToBrowserstack, null, 2));
// HELPERS /////////////////////////////////////////////////////////////
function generateRawMappings(bridge) {
    console.log('\nGENERATING ', bridge.join(' to '));
    console.log('--------------------------------------------------------------');
    const startingMap = {
        allFileKeys: [],
        added: {},
        removed: {},
        changed: {},
        changedOrder: {},
    };
    const finalMap = {
        allFileKeys: startingMap.allFileKeys,
        added: {},
        removed: {},
        changed: {},
        changedOrder: {},
    };
    (0, foreachBridgeSet_1.default)('https', bridge, (fileKey, dom1, dom2) => {
        const diff = (0, deepDiff_1.default)(dom1, dom2);
        processBridgeDiff(fileKey, diff, startingMap);
    });
    for (const path of Object.keys(startingMap.added)) {
        const rhs = extractDiffValue(startingMap.added[path].rhsKeysByValue, startingMap.allFileKeys);
        finalMap.added[path] = { rhs };
    }
    for (const path of Object.keys(startingMap.removed)) {
        const rhs = extractDiffValue(startingMap.removed[path].rhsKeysByValue, startingMap.allFileKeys);
        finalMap.removed[path] = { rhs };
    }
    for (const path of Object.keys(startingMap.changed)) {
        const lhs = extractDiffValue(startingMap.changed[path].lhsKeysByValue, startingMap.allFileKeys);
        const rhs = extractDiffValue(startingMap.changed[path].rhsKeysByValue, startingMap.allFileKeys);
        finalMap.changed[path] = { lhs, rhs };
    }
    for (const path of Object.keys(startingMap.changedOrder)) {
        const lhs = extractDiffValue(startingMap.changedOrder[path].lhsKeysByValue, startingMap.allFileKeys);
        finalMap.changedOrder[path] = { lhs };
    }
    return finalMap;
}
function extractDiffValue(keysByValue, allFileKeys) {
    const values = Object.keys(keysByValue);
    if (values.length === 1) {
        const value = values[0];
        const keys = keysByValue[value];
        return {
            fileKeys: keys.length === allFileKeys.length ? 'ALL' : keys,
            value: JSON.parse(value),
        };
    }
    return values.map(value => {
        const fileKeys = keysByValue[value];
        return {
            fileKeys,
            value: JSON.parse(value),
        };
    });
}
function ignorePath(path) {
    return path !== 'window.DomExtractor';
}
function processBridgeDiff(fileKey, diff, startingMap) {
    console.log(`DIFFED ${fileKey}`);
    startingMap.allFileKeys.push(fileKey);
    diff.added.forEach(added => {
        var _a, _b;
        const path = added.path;
        if (ignorePath(path))
            return;
        const rhsValue = JSON.stringify(added.rhs);
        (_a = startingMap.added)[path] ?? (_a[path] = { rhsKeysByValue: {} });
        (_b = startingMap.added[path].rhsKeysByValue)[rhsValue] ?? (_b[rhsValue] = []);
        startingMap.added[path].rhsKeysByValue[rhsValue].push(fileKey);
    });
    diff.removed.forEach(removed => {
        var _a, _b;
        const path = removed.path;
        if (ignorePath(path))
            return;
        const rhsValue = JSON.stringify(path);
        (_a = startingMap.removed)[path] ?? (_a[path] = { rhsKeysByValue: {} });
        (_b = startingMap.removed[path].rhsKeysByValue)[rhsValue] ?? (_b[rhsValue] = []);
        startingMap.removed[path].rhsKeysByValue[rhsValue].push(fileKey);
    });
    diff.changed.forEach(change => {
        var _a, _b, _c, _d;
        const path = change.path;
        if (ignorePath(path))
            return;
        const lhsValue = JSON.stringify(change.lhs);
        const rhsValue = JSON.stringify(change.rhs);
        (_a = startingMap.changed)[_b = change.path] ?? (_a[_b] = {
            lhsKeysByValue: {},
            rhsKeysByValue: {},
        });
        (_c = startingMap.changed[path].lhsKeysByValue)[lhsValue] ?? (_c[lhsValue] = []);
        startingMap.changed[path].lhsKeysByValue[lhsValue].push(fileKey);
        (_d = startingMap.changed[path].rhsKeysByValue)[rhsValue] ?? (_d[rhsValue] = []);
        startingMap.changed[path].rhsKeysByValue[rhsValue].push(fileKey);
    });
    diff.changedOrder.forEach(changedOrder => {
        var _a, _b;
        const path = changedOrder.path;
        if (ignorePath(path))
            return;
        const lhsValue = JSON.stringify(changedOrder.lhs);
        (_a = startingMap.changedOrder)[path] ?? (_a[path] = { lhsKeysByValue: {} });
        (_b = startingMap.changedOrder[path].lhsKeysByValue)[lhsValue] ?? (_b[lhsValue] = []);
        startingMap.changedOrder[path].lhsKeysByValue[lhsValue].push(fileKey);
    });
}
//# sourceMappingURL=generateRawMappings.js.map