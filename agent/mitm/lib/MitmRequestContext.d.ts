/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
import { URL } from 'url';
import * as http from 'http';
import * as http2 from 'http2';
import MitmSocket from '@ulixee/unblocked-agent-mitm-socket';
import OriginType from '@ulixee/unblocked-specification/agent/net/OriginType';
import IHttpHeaders from '@ulixee/unblocked-specification/agent/net/IHttpHeaders';
import { IBrowserResourceRequest } from '@ulixee/unblocked-specification/agent/browser/IBrowserNetworkEvents';
import HttpResponseCache from './HttpResponseCache';
import { IRequestSessionResponseEvent } from '../handlers/RequestSession';
import IMitmRequestContext from '../interfaces/IMitmRequestContext';
export default class MitmRequestContext {
    private static contextIdCounter;
    private static nextId;
    static createFromResourceRequest(resourceLoadDetails: IBrowserResourceRequest): IMitmRequestContext;
    static create(params: Pick<IMitmRequestContext, 'requestSession' | 'isSSL' | 'clientToProxyRequest' | 'proxyToClientResponse' | 'isUpgrade'>, responseCache: HttpResponseCache): IMitmRequestContext;
    static createFromHttp2Push(parentContext: IMitmRequestContext, rawHeaders: string[]): IMitmRequestContext;
    static toEmittedResource(ctx: IMitmRequestContext): IRequestSessionResponseEvent;
    static assignMitmSocket(ctx: IMitmRequestContext, mitmSocket: MitmSocket): void;
    static getOriginType(url: URL, headers: IHttpHeaders): OriginType;
    static readHttp1Response(ctx: IMitmRequestContext, response: http.IncomingMessage): void;
    static readHttp2Response(ctx: IMitmRequestContext, response: http2.ClientHttp2Stream, statusCode: number, rawHeaders: string[]): void;
}
