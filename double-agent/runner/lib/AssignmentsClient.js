"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_fetch_1 = require("node-fetch");
const config_1 = require("@double-agent/config");
const qs = require("querystring");
const unzipper = require("unzipper");
const fileUtils_1 = require("@ulixee/commons/lib/fileUtils");
const fs_1 = require("fs");
class AssignmentsClient {
    constructor(userId) {
        this.userId = userId;
        this.baseUrl = config_1.default.runner.assignmentsHost;
    }
    async downloadAssignmentProfiles(assignmentId, filesDir) {
        const filesStream = await this.get(`/download/${assignmentId}`, {
            userId: this.userId,
        });
        if (!(await (0, fileUtils_1.existsAsync)(filesDir)))
            await fs_1.promises.mkdir(filesDir, { recursive: true });
        await new Promise((resolve) => {
            filesStream.pipe(unzipper.Extract({ path: filesDir })).on('finish', resolve);
        });
        await new Promise((resolve) => setTimeout(resolve, 100));
    }
    async downloadAll(filesDir) {
        const filesStream = await this.get(`/download`, { userId: this.userId });
        if (!(await (0, fileUtils_1.existsAsync)(filesDir)))
            await fs_1.promises.mkdir(filesDir, { recursive: true });
        await new Promise((resolve) => {
            filesStream.pipe(unzipper.Extract({ path: filesDir })).on('finish', resolve);
        });
        await new Promise((resolve) => setTimeout(resolve, 100));
    }
    async activate(assignmentId) {
        const result = await this.get(`/activate/${assignmentId}`, {
            userId: this.userId,
        });
        return result.assignment;
    }
    /**
     * Create and activate a single assignment
     */
    async createSingleUserAgentIdAssignment(userAgentId, dataDir) {
        const { assignment } = await this.get('/', {
            userId: this.userId,
            userAgentId,
            dataDir,
        });
        return assignment;
    }
    async start(params) {
        const result = await this.get('/create', {
            userId: this.userId,
            ...params,
        });
        return result.assignments;
    }
    async finish() {
        await this.get('/finish', { userId: this.userId });
    }
    async get(path, params) {
        const paramStrs = qs.stringify(params);
        const res = await (0, node_fetch_1.default)(`${this.baseUrl}${path}?${paramStrs}`);
        const contentType = res.headers.get('content-type');
        if (contentType === 'application/json') {
            const data = await res.json();
            if (res.status >= 400) {
                throw new Error(data.message);
            }
            return data;
        }
        return res.body;
    }
}
exports.default = AssignmentsClient;
//# sourceMappingURL=AssignmentsClient.js.map