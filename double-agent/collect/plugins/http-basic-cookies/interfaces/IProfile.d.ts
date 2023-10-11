import IBaseProfile from '@double-agent/collect/interfaces/IBaseProfile';
declare type IProfile = IBaseProfile<IProfileData>;
export default IProfile;
export declare type IProfileData = (ICreatedCookieData | ICollectedCookieData)[];
export interface ICreatedCookieData {
    group: string;
    setter: ICookieSetter;
    httpProtocol: string;
    cookies: ICreatedCookies;
    url: string;
}
export interface ICollectedCookieData {
    group: string;
    getter: ICookieGetter;
    httpProtocol: string;
    cookies: ICollectedCookies;
    url: string;
}
export declare enum CookieSetter {
    HttpHeader = "HttpHeader",
    JsScript = "JsScript"
}
export declare enum CookieGetter {
    HttpHeader = "HttpHeader",
    HttpAssetHeader = "HttpAssetHeader",
    JsScript = "JsScript"
}
export declare type ICookieSetter = keyof typeof CookieSetter;
export declare type ICookieGetter = keyof typeof CookieGetter;
export interface ICollectedCookies {
    [key: string]: string;
}
export declare type ICreatedCookies = string[];
