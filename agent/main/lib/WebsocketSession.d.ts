import Resolvable from '@ulixee/commons/lib/Resolvable';
import TypedEventEmitter from '@ulixee/commons/lib/TypedEventEmitter';
import { IWebsocketEvents } from '@ulixee/unblocked-specification/agent/browser/IWebsocketSession';
export type WebsocketCallback = (name: string, payload: string) => void;
export declare class WebsocketSession extends TypedEventEmitter<IWebsocketEvents> {
    readonly isReady: Promise<void>;
    port: number;
    secret: string;
    clientIdToTargetId: Map<string, string | Resolvable<string>>;
    private server;
    private wss;
    constructor();
    initialize(): Promise<void>;
    close(): void;
    registerWebsocketFrameId(url: string, frameId: string): void;
    injectWebsocketCallbackIntoScript(script: string): string;
    private proxyScript;
    private handleUpgrade;
    private handleConnection;
    private handleMessage;
}
