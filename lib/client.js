window.__ModuleLoader__.load({id:"dsh-tool-manager",factory:(require)=>{
const module={exports:{}};const exports=module.exports;
"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client/index.tsx
var index_exports = {};
__export(index_exports, {
  apply: () => apply,
  inject: () => inject
});
module.exports = __toCommonJS(index_exports);

// src/contracts.ts
var NAMESPACE = "dsh-tool-manager";
var CATALOG_PATH = "/tool-manager/api/catalog";

// src/client/ToolManager.tsx
var import_react = require("react");

// src/client/styles.ts
var styles = `
.dtm{--dtm-text:var(--dsw-alias-label-primary,#20242c);--dtm-muted:var(--dsw-alias-label-secondary,#69717d);--dtm-border:var(--dsw-alias-border-l2,#e1e5ea);--dtm-bg:var(--dsw-alias-bg-layer-3,#fff);--dtm-accent:var(--dsw-alias-state-business-primary,#4169e1);color:var(--dtm-text);max-width:900px;margin:auto;font-size:14px;line-height:1.55}
.dtm *{box-sizing:border-box}.dtm h2{font-size:23px;font-weight:650;margin:0 0 6px}.dtm p{margin:0}.dtm .muted{color:var(--dtm-muted)}
.dtm .scope{display:inline-block;font-size:12px;margin-top:14px;padding:5px 10px;background:color-mix(in srgb,var(--dtm-accent) 8%,transparent);border-radius:6px}
.dtm .summary{display:flex;gap:22px;margin:24px 0 16px;padding-bottom:17px;border-bottom:1px solid var(--dtm-border);color:var(--dtm-muted);font-size:12px}.dtm .summary strong{font-size:23px;color:var(--dtm-text);margin-right:6px;font-variant-numeric:tabular-nums}
.dtm .toolbar{display:flex;flex-wrap:wrap;gap:9px;margin:0 0 14px}.dtm input,.dtm select,.dtm .button{font:inherit;color:var(--dtm-text);background:var(--dtm-bg);border:1px solid var(--dtm-border);border-radius:7px;padding:8px 11px}.dtm input{min-width:170px;flex:1}.dtm select{max-width:160px}.dtm .button{cursor:pointer}.dtm button:disabled{cursor:default;opacity:.45}.dtm :focus-visible{outline:2px solid var(--dtm-accent);outline-offset:3px}
.dtm .status{font-size:12px;min-height:23px;margin-bottom:8px;color:var(--dtm-muted)}.dtm .notice{font-size:13px;border:1px solid var(--dtm-border);border-radius:8px;padding:12px 14px;margin:10px 0 16px;color:var(--dtm-muted)}.dtm .error{color:var(--dsw-alias-state-error-primary,#c03939);border-color:currentColor}
.dtm .list{border:1px solid var(--dtm-border);border-radius:10px;overflow:hidden}.dtm .row{display:flex;gap:16px;align-items:center;padding:16px 18px;border-bottom:1px solid var(--dtm-border)}.dtm .row:last-child{border-bottom:0}.dtm .tool{flex:1;min-width:0}.dtm .name{display:flex;align-items:center;flex-wrap:wrap;gap:9px}.dtm code{font-size:14px;font-weight:600;overflow-wrap:anywhere}.dtm .badge{font-size:10px;letter-spacing:.03em;color:var(--dtm-muted);border:1px solid var(--dtm-border);padding:1px 6px;border-radius:4px}.dtm .description{font-size:12px;color:var(--dtm-muted);margin-top:4px}.dtm .row-state{font-size:11px;color:var(--dtm-muted);margin-top:5px}.dtm .row-state.blocked{color:var(--dsw-alias-state-warn-primary,#ac7335)}
.dtm .switch-area{display:flex;align-items:center;gap:10px;flex-shrink:0;font-size:12px;color:var(--dtm-muted)}.dtm .switch{border:0;width:38px;height:22px;border-radius:20px;background:var(--dsw-alias-fill-secondary,#b5bbc5);padding:3px;cursor:pointer;transition:background .15s}.dtm .switch[aria-checked=true]{background:var(--dtm-accent)}.dtm .switch-knob{display:block;width:16px;height:16px;border-radius:100%;background:white;box-shadow:0 1px 3px #0002;transition:transform .15s}.dtm .switch[aria-checked=true] .switch-knob{transform:translateX(16px)}
.dtm .empty{padding:34px 16px;text-align:center;color:var(--dtm-muted)}.dtm .footer{display:flex;justify-content:space-between;align-items:center;gap:12px;margin:16px 0 22px}.dtm .help{font-size:12px;color:var(--dtm-muted);border-top:1px solid var(--dtm-border);padding-top:14px}.dtm summary{cursor:pointer}.dtm .help p{margin:10px 0;max-width:75ch}.dtm .tool-details{font-size:11px;color:var(--dtm-muted);margin-top:6px}.dtm .tool-details p{white-space:pre-wrap;overflow-wrap:anywhere;margin-top:8px}
@media(max-width:560px){.dtm .row{padding:14px 12px;gap:8px}.dtm .switch-area>span{display:none}.dtm .scope{font-size:11px}.dtm .toolbar input{flex-basis:100%}.dtm .summary{gap:15px}}
`;

// src/client/locales.ts
var zh = {
  title: "\u5DE5\u5177\u7BA1\u7406",
  subtitle: "\u9009\u62E9 Agent \u53EF\u4EE5\u4F7F\u7528\u7684\u5DE5\u5177\uFF1B\u81EA\u52A8\u53D1\u73B0\u5F53\u524D\u8FD0\u884C\u65F6\u548C\u4F1A\u8BDD\u52A0\u8F7D\u7684\u5DE5\u5177\u3002",
  scope: "\u7528\u6237\u7EA7\u8BBE\u7F6E \xB7 \u5BF9\u4F7F\u7528\u540C\u4E00\u914D\u7F6E\u7684\u4F1A\u8BDD\u751F\u6548",
  loaded: "\u5DF2\u52A0\u8F7D",
  blocked: "\u5DF2\u7981\u7528",
  available: "\u672C\u63D2\u4EF6\u5141\u8BB8",
  unloaded: "\u5F53\u524D\u672A\u52A0\u8F7D",
  search: "\u641C\u7D22\u5DE5\u5177\u540D\u79F0\u6216\u7528\u9014\u2026",
  all: "\u5168\u90E8\u5DE5\u5177",
  shell: "\u7EC8\u7AEF",
  files: "\u6587\u4EF6",
  searchGroup: "\u641C\u7D22",
  other: "\u5176\u4ED6",
  enabled: "\u5F00\u542F",
  disabled: "\u5173\u95ED",
  refresh: "\u5237\u65B0",
  reset: "\u6062\u590D\u9ED8\u8BA4",
  loading: "\u6B63\u5728\u8BFB\u53D6 Host \u72B6\u6001\u2026",
  saving: "\u6B63\u5728\u4FDD\u5B58\u2026",
  saved: "\u5DF2\u4FDD\u5B58\u5230 Host",
  readOnly: "\u5F53\u524D\u8FDE\u63A5\u65E0\u6CD5\u5199\u5165 Host \u8BBE\u7F6E\u3002\u8BF7\u5728\u672C\u673A DSH \u9875\u9762\u64CD\u4F5C\u3002",
  loadFailed: "\u65E0\u6CD5\u8BFB\u53D6\u5DE5\u5177\u72B6\u6001\uFF0C\u8BF7\u5237\u65B0\u91CD\u8BD5\u3002",
  saveFailed: "\u4FDD\u5B58\u5931\u8D25\uFF0C\u8BF7\u5237\u65B0\u72B6\u6001\u540E\u91CD\u8BD5\u3002",
  conflict: "\u8BBE\u7F6E\u5DF2\u5728\u53E6\u4E00\u9875\u9762\u66F4\u6539\uFF0C\u5DF2\u91CD\u65B0\u8BFB\u53D6\u3002\u8BF7\u68C0\u67E5\u540E\u91CD\u8BD5\u3002",
  empty: "\u6CA1\u6709\u5339\u914D\u7684\u5DE5\u5177",
  noSessions: "\u6682\u65E0\u6D3B\u8DC3\u4F1A\u8BDD\u3002\u521B\u5EFA\u6216\u6253\u5F00\u4F1A\u8BDD\u540E\uFF0C\u4F1A\u663E\u793A\u9884\u8BBE\u52A0\u8F7D\u7684\u5DE5\u5177\u3002",
  timing: "\u66F4\u6539\u7528\u4E8E\u540E\u7EED\u6A21\u578B\u8BF7\u6C42\u548C\u5DE5\u5177\u6743\u9650\u68C0\u67E5\uFF1B\u6B63\u5728\u8FD0\u884C\u6216\u5DF2\u901A\u8FC7\u68C0\u67E5\u7684\u8C03\u7528\u4E0D\u4F1A\u81EA\u52A8\u64A4\u9500\u3002",
  codeLimit: "\u68C0\u6D4B\u5230 Code/PTC \u4F1A\u8BDD\uFF1A\u7981\u7528\u89C4\u5219\u4ECD\u4F1A\u62E6\u622A\u8C03\u7528\uFF0C\u4F46\u751F\u6210\u7684\u5DE5\u5177 SDK \u53EF\u80FD\u4FDD\u7559\u5DE5\u5177\u8BF4\u660E\u3002",
  boundary: "\u5173\u95ED write \u4EC5\u7981\u6B62\u8FD9\u4E2A\u5DE5\u5177\uFF1B\u5F00\u653E\u7684\u7EC8\u7AEF\u5DE5\u5177\u4ECD\u53EF\u80FD\u5199\u6587\u4EF6\u3002\u6587\u4EF6\u8BBF\u95EE\u8303\u56F4\u8BF7\u4F7F\u7528 DSH \u6C99\u7BB1\u63A7\u5236\u3002",
  notes: "\u751F\u6548\u8BF4\u660E",
  details: "\u5DE5\u5177\u8BF4\u660E",
  pending: "\u5F53\u524D\u672A\u52A0\u8F7D\uFF1B\u6B64\u8BBE\u7F6E\u4F1A\u5728\u5DE5\u5177\u51FA\u73B0\u65F6\u751F\u6548\u3002",
  "tool.pwsh": "\u6267\u884C PowerShell \u547D\u4EE4",
  "tool.bash": "\u6267\u884C Bash \u547D\u4EE4",
  "tool.read": "\u8BFB\u53D6\u6587\u4EF6\u5185\u5BB9",
  "tool.read_image": "\u8BFB\u53D6\u56FE\u7247",
  "tool.write": "\u521B\u5EFA\u6216\u5199\u5165\u6587\u4EF6",
  "tool.edit": "\u4FEE\u6539\u6587\u4EF6\u5185\u5BB9",
  "tool.str_replace_editor": "\u67E5\u770B\u4E0E\u7F16\u8F91\u6587\u4EF6",
  "tool.glob": "\u6309\u6587\u4EF6\u540D\u641C\u7D22",
  "tool.grep": "\u641C\u7D22\u6587\u4EF6\u5185\u5BB9"
};
var en = {
  title: "Tool Manager",
  subtitle: "Choose which tools your agents can use. Tools loaded by the runtime and sessions are discovered automatically.",
  scope: "User settings \xB7 Applies to sessions sharing this configuration",
  loaded: "Loaded",
  blocked: "Disabled",
  available: "Allowed by this plugin",
  unloaded: "Not loaded",
  search: "Search tool names or descriptions\u2026",
  all: "All tools",
  shell: "Terminal",
  files: "Files",
  searchGroup: "Search",
  other: "Other",
  enabled: "On",
  disabled: "Off",
  refresh: "Refresh",
  reset: "Restore defaults",
  loading: "Reading Host state\u2026",
  saving: "Saving\u2026",
  saved: "Saved to Host",
  readOnly: "This connection cannot write Host settings. Open the local DSH page to make changes.",
  loadFailed: "Could not read tool state. Refresh to try again.",
  saveFailed: "Could not save. Refresh the state and try again.",
  conflict: "Settings changed in another page and have been reloaded. Review them and try again.",
  empty: "No matching tools",
  noSessions: "No active sessions. Create or open a session to see its preset tools.",
  timing: "Changes apply to subsequent model requests and permission checks. Running calls and calls already past the check are not cancelled.",
  codeLimit: "Code/PTC sessions detected: disabled calls are blocked, but the generated tool SDK may still describe these tools.",
  boundary: "Disabling write only blocks that tool. An enabled terminal can still write files. Use the DSH sandbox to restrict file access.",
  notes: "How changes apply",
  details: "Tool description",
  pending: "Not loaded yet; this setting applies when the tool appears.",
  "tool.pwsh": "Run PowerShell commands",
  "tool.bash": "Run Bash commands",
  "tool.read": "Read file contents",
  "tool.read_image": "Read images",
  "tool.write": "Create or write files",
  "tool.edit": "Edit file contents",
  "tool.str_replace_editor": "View and edit files",
  "tool.glob": "Find files by name",
  "tool.grep": "Search file contents"
};

// src/client/ToolManager.tsx
var import_jsx_runtime = require("react/jsx-runtime");
function ToolManager({ scope, t }) {
  const settings = (0, import_react.useSyncExternalStore)(
    (0, import_react.useCallback)((listener) => scope.subscribe(listener), [scope]),
    (0, import_react.useCallback)(() => scope.getSnapshot(), [scope])
  );
  const [catalog, setCatalog] = (0, import_react.useState)();
  const [query, setQuery] = (0, import_react.useState)("");
  const [category, setCategory] = (0, import_react.useState)("all");
  const [loadError, setLoadError] = (0, import_react.useState)(false);
  const [actionError, setActionError] = (0, import_react.useState)();
  const [busy, setBusy] = (0, import_react.useState)(false);
  const [saved, setSaved] = (0, import_react.useState)(false);
  const request = (0, import_react.useRef)();
  const mounted = (0, import_react.useRef)(false);
  const saving = (0, import_react.useRef)(false);
  const refresh = (0, import_react.useCallback)(async () => {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    try {
      const response = await fetch(CATALOG_PATH, {
        credentials: "same-origin",
        cache: "no-store",
        signal: AbortSignal.any([controller.signal, AbortSignal.timeout(1e4)])
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const value = await response.json();
      if (value.apiVersion !== 1 || !Array.isArray(value.tools)) throw new Error("Incompatible catalog");
      if (mounted.current && !controller.signal.aborted) {
        setCatalog(value);
        setLoadError(false);
      }
    } catch {
      if (mounted.current && !controller.signal.aborted) setLoadError(true);
    } finally {
      if (request.current === controller) request.current = void 0;
    }
  }, []);
  (0, import_react.useEffect)(() => {
    mounted.current = true;
    void refresh();
    const timer = window.setInterval(() => {
      if (!document.hidden && !request.current) void refresh();
    }, 5e3);
    return () => {
      mounted.current = false;
      window.clearInterval(timer);
      request.current?.abort();
    };
  }, [refresh]);
  const writable = settings.status === "ready" && settings.mode === "host" && settings.writable;
  const canChange = writable && catalog !== void 0 && !loadError && !busy;
  const disabled = new Set(settings.value?.disabledTools ?? catalog?.disabledTools ?? []);
  const categoryKey = { shell: "shell", files: "files", search: "searchGroup", other: "other" };
  const description = (name) => {
    const key = `tool.${name}`;
    return Object.hasOwn(zh, key) ? t(key) : name;
  };
  const filtered = (catalog?.tools ?? []).filter((tool) => {
    const matchesCategory = category === "all" || category === tool.category;
    const needle = query.trim().toLocaleLowerCase();
    return matchesCategory && `${tool.name} ${description(tool.name)} ${tool.description}`.toLocaleLowerCase().includes(needle);
  });
  const save = async (toolName) => {
    if (!canChange || saving.current) return;
    const current = scope.getSnapshot();
    if (current.status !== "ready" || current.mode !== "host" || !current.writable || !current.value || current.revision === void 0) return;
    const next = new Set(toolName ? current.value.disabledTools : []);
    if (toolName) {
      if (next.has(toolName)) next.delete(toolName);
      else next.add(toolName);
    }
    saving.current = true;
    setBusy(true);
    setSaved(false);
    setActionError(void 0);
    try {
      await scope.mutate([{ op: "set", path: ["disabledTools"], value: [...next].sort() }], current.revision);
      if (mounted.current) {
        setSaved(true);
        await refresh();
      }
    } catch (error) {
      if (mounted.current) {
        const message = error instanceof Error ? error.message : String(error);
        setActionError(/conflict|revision/i.test(message) ? "conflict" : "saveFailed");
      }
    } finally {
      saving.current = false;
      if (mounted.current) setBusy(false);
    }
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: "dtm", "aria-label": t("title"), children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("style", { children: styles }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: t("title") }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "muted", children: t("subtitle") }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "scope", children: t("scope") }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "summary", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: catalog?.tools.filter((tool) => tool.loaded).length ?? "\u2014" }),
        t("loaded")
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: settings.value ? disabled.size : "\u2014" }),
        t("blocked")
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "toolbar", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "search", "aria-label": t("search"), placeholder: t("search"), value: query, onChange: (event) => setQuery(event.target.value) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", { "aria-label": t("all"), value: category, onChange: (event) => setCategory(event.target.value), children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "all", children: t("all") }),
        Object.entries(categoryKey).map(([value, key]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value, children: t(key) }, value))
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "button", onClick: () => void refresh(), children: t("refresh") })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "status", role: "status", "aria-live": "polite", children: busy ? t("saving") : saved ? t("saved") : !catalog && !loadError ? t("loading") : "\xA0" }),
    loadError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { role: "alert", className: "notice error", children: t("loadFailed") }),
    actionError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { role: "alert", className: "notice error", children: t(actionError) }),
    (settings.status === "unavailable" || settings.status === "ready" && !writable) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "notice", children: t("readOnly") }),
    catalog?.sessionCount === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "notice", children: t("noSessions") }),
    !!catalog?.codeSessionCount && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "notice", children: t("codeLimit") }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "list", children: [
      filtered.map((tool) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "row", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "tool", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "name", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: tool.name }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "badge", children: t(categoryKey[tool.category]) })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "description", children: Object.hasOwn(zh, `tool.${tool.name}`) ? description(tool.name) : tool.description || tool.name }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `row-state ${disabled.has(tool.name) ? "blocked" : ""}`, children: [
            disabled.has(tool.name) ? t("blocked") : tool.loaded ? t("available") : t("unloaded"),
            !tool.loaded && disabled.has(tool.name) ? ` \xB7 ${t("unloaded")}` : ""
          ] }),
          tool.description && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", { className: "tool-details", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", { children: t("details") }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: tool.description })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "switch-area", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: disabled.has(tool.name) ? t("disabled") : t("enabled") }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "button",
            {
              className: "switch",
              role: "switch",
              type: "button",
              "aria-label": tool.name,
              "aria-checked": !disabled.has(tool.name),
              disabled: !canChange,
              title: !tool.loaded ? t("pending") : void 0,
              onClick: () => void save(tool.name),
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "switch-knob" })
            }
          )
        ] })
      ] }, tool.name)),
      catalog && filtered.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "empty", children: t("empty") })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "footer", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "muted", children: catalog ? `v${catalog.pluginVersion}` : "" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "button", disabled: !canChange || disabled.size === 0, onClick: () => void save(), children: t("reset") })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", { className: "help", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", { children: t("notes") }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: t("timing") }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: t("boundary") })
    ] })
  ] });
}

// src/client/index.tsx
var inject = ["slots", "locale", "settingsScope"];
function apply(ctx) {
  ctx.effect(() => ctx.locale.register(NAMESPACE, { zh, en }), "tool-manager.locales");
  const scope = ctx.settingsScope.bind({ namespace: NAMESPACE });
  const t = ctx.locale.bind(NAMESPACE);
  ctx.slots.inject("settings.section", () => ctx.slots.register({
    name: "settings.section",
    id: NAMESPACE,
    order: 17,
    label: () => t("title"),
    locale: NAMESPACE,
    inject: () => ({ scope })
  }, ToolManager));
}

return module.exports;
}});
