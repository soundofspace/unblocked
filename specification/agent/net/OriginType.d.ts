declare const originTypes: readonly ["none", "same-origin", "same-site", "cross-site"];
declare type OriginType = typeof originTypes[number];
export declare function isOriginType(type: string): boolean;
export default OriginType;
