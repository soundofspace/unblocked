"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertVersionsToTree = exports.getClosestNumberMatch = exports.findClosestVersionMatch = void 0;
function findClosestVersionMatch(versionToMatch, versions) {
    if (versions.length === 1 && versions[0] === 'ALL')
        return 'ALL';
    if (!versions.length)
        return null;
    // there is no guarantee we have an exact match, so let's get the closest
    const versionTree = convertVersionsToTree(versions);
    const [major, minor] = versionToMatch.split('-').map(x => Number(x));
    const majors = Object.keys(versionTree).map(x => Number(x));
    const majorMatch = getClosestNumberMatch(major, majors);
    let versionMatch = `${majorMatch}`;
    if (minor) {
        const minors = Object.keys(versionTree[majorMatch]).map(x => Number(x));
        const minorMatch = getClosestNumberMatch(minor, minors);
        if (minorMatch !== undefined)
            versionMatch += `-${minorMatch}`;
    }
    else if (!versions.includes(versionMatch)) {
        const minors = Object.keys(versionTree[majorMatch]).map(x => Number(x));
        if (minors.length) {
            const minorMatch = major > majorMatch ? Math.max(...minors) : Math.min(...minors);
            versionMatch += `-${minorMatch}`;
        }
    }
    return versions.includes(versionMatch) ? versionMatch : null;
}
exports.findClosestVersionMatch = findClosestVersionMatch;
function getClosestNumberMatch(numToMatch, nums) {
    const sortedNums = nums.sort((a, b) => a - b);
    let closest = sortedNums[0];
    for (const num of sortedNums) {
        if (num === numToMatch) {
            return num;
        }
        if (num < numToMatch) {
            closest = num;
        }
        else if (num > numToMatch) {
            break;
        }
    }
    return closest;
}
exports.getClosestNumberMatch = getClosestNumberMatch;
function convertVersionsToTree(versions) {
    return versions.reduce((tree, version) => {
        var _a;
        const [major, minor, build] = version.split(/\.|-/);
        tree[major] = tree[major] || {};
        if (minor === undefined)
            return tree;
        (_a = tree[major])[minor] ?? (_a[minor] = []);
        if (build)
            tree[major][minor].push(build);
        return tree;
    }, {});
}
exports.convertVersionsToTree = convertVersionsToTree;
//# sourceMappingURL=VersionUtils.js.map