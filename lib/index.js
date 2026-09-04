// src/index.ts
import z from "@deepseek-ai/schemastery";

// src/contracts.ts
var NAMESPACE = "dsh-tool-manager";
var CATALOG_PATH = "/tool-manager/api/catalog";
var BUILTIN_TOOLS = {
  pwsh: "shell",
  bash: "shell",
  read: "files",
  read_image: "files",
  write: "files",
  edit: "files",
  str_replace_editor: "files",
  glob: "search",
  grep: "search"
};
function isManageableToolName(name2) {
  return /^[A-Za-z0-9_-]{1,128}$/.test(name2) && name2 !== "run_code";
}
function validateSettings(value) {
  if (value.schemaVersion !== 1 || !Array.isArray(value.disabledTools) || value.disabledTools.length > 256) throw new Error("Invalid tool manager settings");
  const seen = /* @__PURE__ */ new Set();
  for (const name2 of value.disabledTools) {
    if (typeof name2 !== "string" || !isManageableToolName(name2) || seen.has(name2)) {
      throw new Error(`Invalid or duplicate tool name: ${String(name2)}`);
    }
    seen.add(name2);
  }
}

// src/catalog.ts
function readCatalog(ctx, disabledTools) {
  const rows = /* @__PURE__ */ new Map();
  for (const name2 of /* @__PURE__ */ new Set([...Object.keys(BUILTIN_TOOLS), ...disabledTools])) {
    const category = Object.hasOwn(BUILTIN_TOOLS, name2) ? BUILTIN_TOOLS[name2] : "other";
    rows.set(name2, { name: name2, category, description: "", loaded: false, sessionCount: 0 });
  }
  const add = (schemas, isSession) => {
    for (const schema of schemas) {
      if (!isManageableToolName(schema.name)) continue;
      let row = rows.get(schema.name);
      if (!row) {
        row = { name: schema.name, category: "other", description: "", loaded: false, sessionCount: 0 };
        rows.set(schema.name, row);
      }
      row.loaded = true;
      row.description ||= schema.description.slice(0, 1e3);
      if (isSession) row.sessionCount++;
    }
  };
  add(ctx.tools.schemas(), false);
  const agents = ctx.agents.list();
  let codeSessionCount = 0;
  for (const agent of agents) {
    const schemas = ctx.tools.schemas(agent);
    add(schemas, true);
    if (schemas.some((tool) => tool.name === "run_code")) codeSessionCount++;
  }
  return { tools: [...rows.values()], sessionCount: agents.length, codeSessionCount };
}

// src/policy.ts
function denialReason(settings, name2) {
  return settings.disabledTools.includes(name2) ? `Tool "${name2}" is disabled in Tool Manager. Enable it in Settings \u2192 Tool Manager to use it.` : void 0;
}
function filterPrompt(assembly, settings) {
  const disabled = new Set(settings.disabledTools);
  return { ...assembly, tools: assembly.tools.filter((tool) => !disabled.has(tool.name)) };
}

// src/http.ts
function loopback(address) {
  return address === "127.0.0.1" || address === "::1" || address === "::ffff:127.0.0.1";
}
function catalogHandler(snapshot, port) {
  return (req, res) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("X-Content-Type-Options", "nosniff");
    const send = (status, data) => {
      res.statusCode = status;
      res.end(JSON.stringify(data));
    };
    const allowedHosts = /* @__PURE__ */ new Set([`127.0.0.1:${port()}`, `localhost:${port()}`, `[::1]:${port()}`]);
    const origin = req.headers.origin;
    if (!loopback(req.socket.remoteAddress) || !allowedHosts.has(req.headers.host ?? "") || req.headers["sec-fetch-site"] === "cross-site" || origin !== void 0 && origin !== `http://${req.headers.host}`) {
      send(403, { error: "Tool Manager is available from the local DSH page only." });
      return;
    }
    if (req.method !== "GET") {
      res.setHeader("Allow", "GET");
      send(405, { error: "Method not allowed" });
      return;
    }
    try {
      send(200, snapshot());
    } catch {
      send(503, { error: "Tool catalog is unavailable. Refresh after the runtime is ready." });
    }
  };
}

// src/index.ts
var name = "tool-manager";
var inject = ["tools", "systemPrompt", "settings", "agents"];
var Config = z.object({
  schemaVersion: z.const(1).default(1),
  disabledTools: z.array(z.string()).default([])
});
function apply(ctx, config) {
  if (typeof ctx.tools.guard !== "function" || typeof ctx.tools.schemas !== "function") {
    throw new Error("Tool Manager requires DSH 0.1.2-rc.1 tools.guard and tools.schemas.");
  }
  const settings = ctx.settings.register(NAMESPACE, Config, { base: config, validate: validateSettings });
  ctx.tools.guard((exec) => denialReason(settings.get(), exec.name));
  ctx.on("system-prompt/assemble", async (_assembly, _context, next) => {
    return filterPrompt(await next(), settings.get());
  }, { prepend: true, global: true });
  let revision = 0;
  const invalidate = () => {
    revision++;
  };
  ctx.on("tools/change", invalidate);
  ctx.on("agent/created", invalidate, { global: true });
  ctx.on("agent/disposed", invalidate, { global: true });
  settings.watch(() => {
    invalidate();
    ctx.emit("system-prompt/change");
  });
  ctx.inject(["webServer"], (webCtx) => {
    const snapshot = () => {
      const disabledTools = [...settings.get().disabledTools];
      const settingsRevision = ctx.settings.describe().find((section) => section.ns === NAMESPACE)?.revision ?? 0;
      return {
        apiVersion: 1,
        pluginVersion: false ? "development" : "0.1.0",
        revision,
        settingsRevision,
        disabledTools,
        ...readCatalog(ctx, disabledTools)
      };
    };
    webCtx.webServer.register({
      kind: "exact",
      path: CATALOG_PATH,
      handler: catalogHandler(snapshot, () => webCtx.webServer.port)
    });
  });
}
export {
  Config,
  apply,
  inject,
  name
};
//# sourceMappingURL=index.js.map
