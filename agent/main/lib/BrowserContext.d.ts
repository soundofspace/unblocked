/// <reference types="node" />
import IBrowserContext, { IBrowserContextEvents } from '@ulixee/unblocked-specification/agent/browser/IBrowserContext';
import { ICookie } from '@ulixee/unblocked-specification/agent/net/ICookie';
import { URL } from 'url';
import Protocol from 'devtools-protocol';
import { TypedEventEmitter } from '@ulixee/commons/lib/eventUtils';
import { IBoundLog } from '@ulixee/commons/interfaces/ILog';
import { IBrowserContextHooks, IInteractHooks } from '@ulixee/unblocked-specification/agent/hooks/IHooks';
import IDomStorage from '@ulixee/unblocked-specification/agent/browser/IDomStorage';
import IProxyConnectionOptions from '../interfaces/IProxyConnectionOptions';
import ICommandMarker from '../interfaces/ICommandMarker';
import Page, { IPageCreateOptions } from './Page';
import { Worker } from './Worker';
import Browser from './Browser';
import DevtoolsSession from './DevtoolsSession';
import Resources from './Resources';
import WebsocketMessages from './WebsocketMessages';
import DevtoolsSessionLogger from './DevtoolsSessionLogger';
import FrameOutOfProcess from './FrameOutOfProcess';
import TargetInfo = Protocol.Target.TargetInfo;
import { WebsocketSession } from './WebsocketSession';
export interface IBrowserContextCreateOptions {
    logger?: IBoundLog;
    proxy?: IProxyConnectionOptions;
    hooks?: IBrowserContextHooks & IInteractHooks;
    isIncognito?: boolean;
    commandMarker?: ICommandMarker;
}
export default class BrowserContext extends TypedEventEmitter<IBrowserContextEvents> implements IBrowserContext {
    logger: IBoundLog;
    lastOpenedPage: Page;
    resources: Resources;
    websocketMessages: WebsocketMessages;
    workersById: Map<string, Worker>;
    pagesById: Map<string, Page>;
    pagesByTabId: Map<number, Page>;
    targetsById: Map<string, TargetInfo>;
    devtoolsSessionsById: Map<string, DevtoolsSession>;
    devtoolsSessionLogger: DevtoolsSessionLogger;
    proxy: IProxyConnectionOptions;
    domStorage: IDomStorage;
    id: string;
    hooks: IBrowserContextHooks & IInteractHooks;
    readonly browser: Browser;
    get browserId(): string;
    isIncognito: boolean;
    readonly websocketSession: WebsocketSession;
    readonly idTracker: {
        navigationId: number;
        tabId: number;
        frameId: number;
    };
    commandMarker: ICommandMarker;
    private attachedTargetIds;
    private pageOptionsByTargetId;
    private readonly createdTargetIds;
    private creatingTargetPromises;
    private waitForPageAttachedById;
    private isClosing;
    private readonly events;
    constructor(browser: Browser, isIncognito: boolean, options?: IBrowserContextCreateOptions);
    open(): Promise<void>;
    newPage(options?: IPageCreateOptions): Promise<Page>;
    addPageInitializationOptions(optionsByTargetId: {
        [targetId: string]: IPageCreateOptions;
    }): void;
    trackPage(page: Page): void;
    initializePage(page: Page): Promise<any>;
    initializeOutOfProcessIframe(frame: FrameOutOfProcess): Promise<any>;
    onIframeAttached(devtoolsSession: DevtoolsSession, targetInfo: TargetInfo, pageId: string): void;
    onPageAttached(devtoolsSession: DevtoolsSession, targetInfo: TargetInfo): Promise<Page>;
    onTargetDetached(targetId: string): void;
    onDevtoolsPanelAttached(devtoolsSession: DevtoolsSession, targetInfo: TargetInfo): void;
    onDevtoolsPanelDetached(devtoolsSession: DevtoolsSession): void;
    onSharedWorkerAttached(devtoolsSession: DevtoolsSession, targetInfo: TargetInfo): Promise<void>;
    beforeWorkerAttached(devtoolsSession: DevtoolsSession, workerTargetId: string, pageTargetId: string): void;
    onWorkerAttached(worker: Worker): void;
    targetDestroyed(targetId: string): void;
    targetKilled(targetId: string, errorCode: number): void;
    attachToTarget(targetId: string): Promise<void>;
    close(): Promise<void>;
    getCookies(url?: URL): Promise<ICookie[]>;
    addCookies(cookies: (Omit<ICookie, 'expires'> & {
        expires?: string | Date | number;
    })[], origins?: string[]): Promise<void>;
    private sendWithBrowserDevtoolsSession;
    private cleanup;
}
