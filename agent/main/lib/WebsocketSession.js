"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebsocketSession = void 0;
const Resolvable_1 = require("@ulixee/commons/lib/Resolvable");
const TypedEventEmitter_1 = require("@ulixee/commons/lib/TypedEventEmitter");
const http_1 = require("http");
const ws_1 = require("ws");
const SCRIPT_PLACEHOLDER = '';
class WebsocketSession extends TypedEventEmitter_1.default {
    constructor() {
        super();
        this.secret = Math.random().toString();
        // We store resolvable when we received websocket message before, receiving
        // targetId, this way we can await this, and still trigger get proper ids.
        this.clientIdToTargetId = new Map();
        this.server = (0, http_1.createServer)();
        this.wss = new ws_1.Server({ noServer: true });
    }
    async initialize() {
        const resolver = new Resolvable_1.default(3e3);
        this.server.on('error', resolver.reject);
        this.server.listen(0, () => {
            const address = this.server.address();
            if (typeof address === 'string') {
                throw new Error('Unexpected server address format (string)');
            }
            this.port = address.port;
            resolver.resolve();
        });
        this.server.on('upgrade', this.handleUpgrade.bind(this));
        this.wss.on('connection', this.handleConnection.bind(this));
        return resolver.promise;
    }
    close() {
        this.wss.close();
        this.server.close();
    }
    registerWebsocketFrameId(url, frameId) {
        const parsed = new URL(url);
        if (parsed.searchParams.get('secret') !== this.secret)
            return;
        const clientId = parsed.searchParams.get('clientId');
        if (!clientId)
            return;
        const targetId = this.clientIdToTargetId.get(clientId);
        if (targetId instanceof Resolvable_1.default) {
            targetId.resolve(frameId);
        }
        this.clientIdToTargetId.set(clientId, frameId);
    }
    injectWebsocketCallbackIntoScript(script) {
        // We could do this as a simple template script but this logic might get
        // complex over time and we want typescript to be able to check proxyScript();
        const scriptBody = this.proxyScript
            .toString()
            // eslint-disable-next-line no-template-curly-in-string
            .replaceAll('${this.port}', this.port.toString())
            // eslint-disable-next-line no-template-curly-in-string
            .replaceAll('${this.secret}', this.secret)
            // Use function otherwise replace will try todo some magic
            .replace('SCRIPT_PLACEHOLDER', () => script);
        const wsScript = `(function ${scriptBody})();`;
        return wsScript;
    }
    proxyScript() {
        const clientId = Math.random();
        const url = `localhost:${this.port}?secret=${this.secret}&clientId=${clientId}`;
        // This will signal to network manager we are trying to make websocket connection
        // This is needed later to map clientId to frameId
        // void fetch(`http://${url}`);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        let callback = () => { };
        try {
            const socket = new WebSocket(`ws://${url}`);
            socket.addEventListener('open', _event => {
                callback = (name, payload) => {
                    socket.send(JSON.stringify({ name, payload }));
                };
            });
        }
        catch { }
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        SCRIPT_PLACEHOLDER;
    }
    handleUpgrade(request, socket, head) {
        const url = new URL(request.url, 'ws://localhost');
        // Close and dont send 403 so this acts as an invisible websocket server
        if (url.searchParams.get('secret') !== this.secret) {
            socket.destroy();
        }
        const clientId = url.searchParams.get('clientId');
        this.wss.handleUpgrade(request, socket, head, ws => {
            this.wss.emit('connection', ws, request, clientId);
        });
    }
    handleConnection(ws, request, clientId) {
        // TODO handle somehow or blow up
        ws.on('error', console.error);
        ws.on('message', this.handleMessage.bind(this, clientId));
    }
    async handleMessage(clientId, data) {
        const { name, payload } = JSON.parse(data.toString());
        let frameId = this.clientIdToTargetId.get(clientId);
        if (!frameId) {
            const resolvable = new Resolvable_1.default();
            this.clientIdToTargetId.set(clientId, resolvable);
            frameId = await resolvable.promise;
        }
        else if (frameId instanceof Resolvable_1.default) {
            frameId = await frameId.promise;
        }
        this.emit('message-received', { id: frameId, name, payload });
    }
}
exports.WebsocketSession = WebsocketSession;
//# sourceMappingURL=WebsocketSession.js.map