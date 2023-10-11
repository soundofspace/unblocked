"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOverrideScript = exports.injectedSourceUrl = void 0;
const fs = require("fs");
const injectedSourceUrl = '<anonymuos>';
exports.injectedSourceUrl = injectedSourceUrl;
const cache = {};
const shouldCache = process.env.NODE_ENV === 'production';
const utilsScript = [
    fs.readFileSync(`${__dirname}/../injected-scripts/_proxyUtils.js`, 'utf8'),
    fs.readFileSync(`${__dirname}/../injected-scripts/_descriptorBuilder.js`, 'utf8'),
].join('\n');
class DomOverridesBuilder {
    constructor() {
        this.scriptsByName = new Map();
        this.alwaysPageScripts = new Set();
        this.alwaysWorkerScripts = new Set();
    }
    build(type = 'page', scriptNames) {
        const scripts = [];
        const callbacks = [];
        for (const [name, script] of this.scriptsByName) {
            const shouldIncludeScript = scriptNames ? scriptNames.includes(name) : true;
            if (shouldIncludeScript) {
                scripts.push(script);
            }
        }
        if (type === 'page') {
            for (const script of this.alwaysPageScripts) {
                if (script.callback)
                    callbacks.push(script.callback);
                if (script.script)
                    scripts.push(script.script);
            }
        }
        else if (type === 'worker') {
            for (const script of this.alwaysWorkerScripts) {
                if (script.callback)
                    callbacks.push(script.callback);
                if (script.script)
                    scripts.push(script.script);
            }
        }
        return {
            callbacks,
            // NOTE: don't make this async. It can cause issues if you read a frame right after creation, for instance
            script: `(function newDocumentScript(selfOverride) {
      if (selfOverride) self = selfOverride;
  // Worklet has no scope to override, but we can't detect until it loads
  if (typeof self === 'undefined' && typeof window === 'undefined') return;
  
  const sourceUrl = '${injectedSourceUrl}';
  ${utilsScript}

   ${scripts.join('\n\n')}
})();
//# sourceURL=${injectedSourceUrl}`.replace(/\/\/# sourceMap.+/g, ''),
        };
    }
    add(name, args = {}) {
        let script = cache[name];
        if (!script) {
            if (!fs.existsSync(`${__dirname}/../injected-scripts/${name}.js`)) {
                throw new Error(`Browser-Emulator injected script doesn\`t exist: ${name}`);
            }
            script = fs.readFileSync(`${__dirname}/../injected-scripts/${name}.js`, 'utf8');
        }
        if (shouldCache)
            cache[name] = script;
        if (name === 'errors')
            args.sourceUrl = injectedSourceUrl;
        let wrapper = this.wrapScript(name, script, args);
        if (name.startsWith('polyfill.')) {
            wrapper = `// if main frame and HTML element not loaded yet, give it a sec
  if (!document.documentElement) {
    new MutationObserver((list, observer) => {
      observer.disconnect();
      ${wrapper}
    }).observe(document, {childList: true, subtree: true});
  } else {
    ${wrapper}
  }
`;
        }
        this.scriptsByName.set(name, wrapper);
    }
    addPageScript(script, args, callbackFn) {
        args ?? (args = {});
        args.callbackName ?? (args.callbackName = `injectedCallback${this.alwaysPageScripts.size}`);
        const wrapped = this.wrapScript('customScript', script, args);
        this.alwaysPageScripts.add({
            script: wrapped,
            callback: {
                name: args.callbackName,
                fn: callbackFn,
            },
        });
    }
    cleanup() {
        this.alwaysPageScripts.clear();
        this.alwaysWorkerScripts.clear();
    }
    addWorkerScript(script, args = {}) {
        const wrapped = this.wrapScript('customScript', script, args);
        this.alwaysWorkerScripts.add({
            script: wrapped,
        });
    }
    wrapScript(name, script, args = {}) {
        return `(function newDocumentScript_${name.replace(/\./g, '__')}(args) {
  try {
    ${script};
  } catch(err) {
    console.log('Failed to initialize "${name}"', err);
  }
})(${JSON.stringify(args)});`;
    }
}
exports.default = DomOverridesBuilder;
function getOverrideScript(name, args) {
    const injected = new DomOverridesBuilder();
    injected.add(name, args);
    return injected.build('page');
}
exports.getOverrideScript = getOverrideScript;
//# sourceMappingURL=DomOverridesBuilder.js.map