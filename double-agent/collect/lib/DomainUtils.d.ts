/// <reference types="node" />
import { URL } from 'url';
export declare enum DomainType {
    MainDomain = "MainDomain",
    SubDomain = "SubDomain",
    TlsDomain = "TlsDomain",
    CrossDomain = "CrossDomain"
}
export declare function getDomainType(url: URL | string): DomainType;
export declare function isRecognizedDomain(host: string, recognizedDomains: string[]): boolean;
export declare function addSessionIdToUrl(url: string, sessionId: string): string;
export declare function addPageIndexToUrl(url: string, pageIndex: number): string;
export declare function cleanDomains(url: string): string;
