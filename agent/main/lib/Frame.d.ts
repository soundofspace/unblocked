import { IBoundLog } from '@ulixee/commons/interfaces/ILog';
import { TypedEventEmitter } from '@ulixee/commons/lib/eventUtils';
import IJsPath from '@ulixee/js-path/interfaces/IJsPath';
import { IFrame, IFrameEvents, ILifecycleEvents } from '@ulixee/unblocked-specification/agent/browser/IFrame';
import INavigation from '@ulixee/unblocked-specification/agent/browser/INavigation';
import IPoint from '@ulixee/unblocked-specification/agent/browser/IPoint';
import IWindowOffset from '@ulixee/unblocked-specification/agent/browser/IWindowOffset';
import { ILoadStatus, ILocationTrigger } from '@ulixee/unblocked-specification/agent/browser/Location';
import { NavigationReason } from '@ulixee/unblocked-specification/agent/browser/NavigationReason';
import { IInteractHooks } from '@ulixee/unblocked-specification/agent/hooks/IHooks';
import { IElementInteractVerification, IInteractionGroups } from '@ulixee/unblocked-specification/agent/interact/IInteractions';
import Protocol from 'devtools-protocol';
import IWaitForOptions from '../interfaces/IWaitForOptions';
import DevtoolsSession from './DevtoolsSession';
import FrameNavigations from './FrameNavigations';
import FrameNavigationsObserver from './FrameNavigationsObserver';
import FramesManager from './FramesManager';
import Interactor from './Interactor';
import { JsPath } from './JsPath';
import { NavigationLoader } from './NavigationLoader';
import Page from './Page';
import PageFrame = Protocol.Page.Frame;
import FrameNavigatedEvent = Protocol.Page.FrameNavigatedEvent;
export default class Frame extends TypedEventEmitter<IFrameEvents> implements IFrame {
    #private;
    readonly frameId: number;
    didSwapOutOfProcess: boolean;
    get id(): string;
    get name(): string;
    get parentId(): string;
    url: string;
    get isDefaultUrl(): boolean;
    get securityOrigin(): string;
    navigationReason?: string;
    disposition?: string;
    get isAttached(): boolean;
    get activeLoader(): NavigationLoader;
    get childFrames(): Frame[];
    get page(): Page;
    interactor: Interactor;
    jsPath: JsPath;
    activeLoaderId: string;
    navigationLoadersById: {
        [loaderId: string]: NavigationLoader;
    };
    readonly logger: IBoundLog;
    get hooks(): IInteractHooks;
    navigations: FrameNavigations;
    navigationsObserver: FrameNavigationsObserver;
    devtoolsSession: DevtoolsSession;
    readonly pendingNewDocumentScripts: {
        script: string;
        isolated: boolean;
    }[];
    private outOfProcess;
    private waitTimeouts;
    private frameElementDevtoolsNodeId?;
    private readonly parentFrame;
    private defaultLoaderId;
    private startedLoaderId;
    private defaultContextId;
    private isolatedContextId;
    private activeContextIds;
    private internalFrame;
    private closedWithError;
    private isClosing;
    private defaultContextCreated;
    private shouldRefreshContextIds;
    private hasCreatedIsolate;
    private readonly checkIfAttached;
    private inPageCounter;
    private events;
    private devtoolsNodeIdByNodePointerId;
    constructor(framesManager: FramesManager, internalFrame: PageFrame, activeContextIds: Set<number>, devtoolsSession: DevtoolsSession, logger: IBoundLog, checkIfAttached: () => boolean, parentFrame: Frame | null);
    updateDevtoolsSession(devtoolsSession: DevtoolsSession, activeContextIds: Set<number>): Promise<void>;
    isOopif(): boolean;
    close(error?: Error): void;
    runPendingNewDocumentScripts(): Promise<void>;
    evaluate<T>(expression: string, options?: {
        isolateFromWebPageEnvironment?: boolean;
        shouldAwaitExpression?: boolean;
        retriesWaitingForLoad?: number;
        returnByValue?: boolean;
        includeCommandLineAPI?: boolean;
        timeoutMs?: number;
    }): Promise<T>;
    waitForLoad(options?: IWaitForOptions & {
        loadStatus?: ILoadStatus;
    }): Promise<INavigation>;
    waitForLocation(trigger: ILocationTrigger, options?: IWaitForOptions): Promise<INavigation>;
    click(jsPathOrSelector: IJsPath | string, verification?: IElementInteractVerification): Promise<void>;
    interact(...interactionGroups: IInteractionGroups): Promise<void>;
    waitForScrollStop(timeoutMs?: number): Promise<[scrollX: number, scrollY: number]>;
    getWindowOffset(): Promise<IWindowOffset>;
    getNodePointerId(devtoolsObjectId: string): Promise<number>;
    getFrameElementNodePointerId(): Promise<number>;
    getContainerOffset(): Promise<IPoint>;
    outerHTML(): Promise<string>;
    waitForLifecycleEvent(event?: keyof ILifecycleEvents, loaderId?: string, timeoutMs?: number): Promise<void>;
    setFileInputFiles(nodePointerId: number, files: string[]): Promise<void>;
    evaluateOnNode<T>(devtoolsObjectId: string, expression: string): Promise<T>;
    getFrameElementDevtoolsNodeId(): Promise<string>;
    resolveDevtoolsNodeId(backendNodeId: number, resolveInIsolatedContext?: boolean): Promise<string>;
    trackBackendNodeAsNodePointer(backendNodeId: number): Promise<number>;
    initiateNavigation(url: string, loaderId: string): void;
    requestedNavigation(url: string, reason: NavigationReason, disposition: string): void;
    onAttached(internalFrame: PageFrame): void;
    onNavigated(frame: PageFrame, navigatedEvent: FrameNavigatedEvent): void;
    onNavigatedWithinDocument(url: string): void;
    onStoppedLoading(): void;
    waitForDefaultLoader(): Promise<void>;
    waitForNavigationLoader(loaderId?: string, timeoutMs?: number): Promise<void>;
    onLifecycleEvent(name: string, timestamp?: number, pageLoaderId?: string): void;
    hasContextId(executionContextId: number): boolean;
    removeContextId(executionContextId: number): void;
    clearContextIds(): void;
    addContextId(executionContextId: number, isDefault: boolean, origin: string): void;
    getActiveContextId(isolatedContext: boolean): number | undefined;
    waitForActiveContextId(isolatedContext?: boolean): Promise<number>;
    canEvaluate(isolatedFromWebPageEnvironment: boolean): boolean;
    toJSON(): Pick<IFrame, 'id' | 'parentId' | 'activeLoader' | 'name' | 'url' | 'navigationReason' | 'disposition'>;
    private setLoader;
    private createIsolatedWorld;
    private waitForDefaultContext;
    private updateUrl;
    private triggerLifecycleEvent;
}
