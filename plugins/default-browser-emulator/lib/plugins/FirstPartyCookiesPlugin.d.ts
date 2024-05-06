/// <reference types="node" />
import { URL } from 'url';
import IHttpResourceLoadDetails from '@ulixee/unblocked-specification/agent/net/IHttpResourceLoadDetails';
import { IPage } from '@ulixee/unblocked-specification/agent/browser/IPage';
import { IHooksProvider } from '@ulixee/unblocked-specification/agent/hooks/IHooks';
import IEmulationProfile from '@ulixee/unblocked-specification/plugin/IEmulationProfile';
export default class FirstPartyCookiesPlugin implements IHooksProvider {
    readonly emulationProfile: IEmulationProfile;
    static id: string;
    private cookieJar;
    private sitesWithUserInteraction;
    private enableNov2019ITPSupport;
    private enableFeb2020ITPSupport;
    private cookiesPendingSiteInteraction;
    private readonly userInteractionTrigger;
    private readonly logger;
    constructor(emulationProfile: IEmulationProfile);
    onLoadUserProfileCookies(cookies: any, storage: any): void;
    beforeHttpRequest(request: IHttpResourceLoadDetails): Promise<any>;
    beforeHttpResponse(resource: IHttpResourceLoadDetails): Promise<any>;
    onNewPage(page: IPage): Promise<any>;
    websiteHasFirstPartyInteraction(url: URL): void;
    private loadProfileCookies;
    private documentHasUserActivity;
    private setCookie;
    private getCookieHeader;
    private waitForDocumentCookiesLoaded;
    private hasFirstPartyInteractionForDomain;
    private handleNov2019ITPUpdates;
    private isMinimumVersion;
}
