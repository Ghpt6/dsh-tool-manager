# dsh-tool-manager

在 DeepSeek Harness 的 **设置 → 工具管理** 页面，逐项开关内置 Agent 工具。

自动发现当前运行时和各会话注册的工具，支持逐项开关其他内置工具，以及通过同一工具注册表加载的插件工具。`pwsh`、`bash`、`read`、`read_image`、`write`、`edit`、`str_replace_editor`、`glob`、`grep` 作为常用工具始终显示，其他已加载工具自动归入「其他」。关闭 `write` 会保留同一插件中的 `read` 和 `edit`。

## 安装

已验证的 DSH 版本：**`0.1.2-rc.1`**。Node.js：`^22.19.0 || >=24.0.0`。本插件支持 GitHub 源码、本地源码或打包文件安装，尚未发布到 npm。

通过 GitHub 安装：

```powershell
npx @deepseek-ai/dsh@0.1.2-rc.1 plugin --profile web add github:Ghpt6/dsh-tool-manager
```

仓库自带预先构建的 `lib/`，安装时不运行构建脚本，也不需要配置 `allowBuilds`。如果曾固定安装旧提交，请改用包含此安装修复的新提交。

也可以从项目目录生成 `.tgz` 后安装：

```powershell
npm ci
npm run pack:release
npx @deepseek-ai/dsh@0.1.2-rc.1 plugin --profile web add ./dsh-tool-manager-0.1.0.tgz
```

重启 DSH Web，刷新浏览器，然后进入 **设置 → 工具管理**：

```powershell
npx @deepseek-ai/dsh@0.1.2-rc.1 web
```

包自带 `dsh.bundle.patch`，安装会挂载插件，不需要手改现有 `cordis.patch.yml`。GitHub 仓库和 `.tgz` 均包含构建好的 Host 和 Client。

本地开发可以直接链接当前目录：

```powershell
npm run build
npx @deepseek-ai/dsh@0.1.2-rc.1 plugin --profile web add .
```

修改后重新构建、重启测试实例并刷新页面。

## 使用

- 每行开关决定本插件是否允许该工具；默认全部允许。
- 支持按工具名、用途或注册说明搜索，按终端、文件、搜索、其他分类筛选。
- 其他工具首次加载后自动出现，无需逐个修改插件代码；会话预设工具需要先创建或打开对应会话。已禁用工具卸载后仍保留在列表中，再次加载时继续禁用。
- 「当前未加载」表示当前运行时没有该工具。此时也可以预先设置开关，工具出现后生效。
- 「本插件允许」不覆盖 Harness 原有的沙箱、审批或其他插件策略。
- 「恢复默认」清空本插件的禁用名单，使所有工具恢复到本插件允许状态。
- 页面跟随 DSH 的中文/英文和浅色/深色主题；提交失败会显示错误。

## 生效范围与时间

这是**用户级策略**，作用于加载本插件且使用同一设置文档的会话，包括存量、新建和子 Agent。设置通常保存在 `<DSH_HOME>/settings.yaml`，多个 profile 可能共用这个文件。

Native 模式下，关闭的工具从后续模型请求的工具列表中移除。每次调用进入 `tools.guard()` 时重新读取 Host 已提交的配置，被禁用的调用不会运行工具体。关闭浏览器不影响 Host 执行策略。

正在运行，或已经通过该权限检查的调用不会自动撤销；本插件不会自动终止后台命令。开启开关也不会安装或加载当前不存在的工具。

配置示例（这是 settings 文档中的 namespace，不是 Cordis 插件 patch）：

```yaml
dsh-tool-manager:
  schemaVersion: 1
  disabledTools:
    - pwsh
    - write
```

工具名精确匹配，不支持通配符；保留的 `run_code` 不能作为禁用目标，也不显示开关。可管理名称为 1–128 个英文字母、数字、下划线或连字符；不符合此格式的注册名称不显示。已配置但当前未加载的名称会保留并作为「其他」显示。

## 模式与访问限制

| 场景 | 首版支持 |
| --- | --- |
| 本机 DSH Web、Native | 设置页、持久化、请求列表隐藏、执行拦截 |
| Code/PTC/both | 正常经过注册表的子调用会被拦截；生成的 SDK 仍可能包含工具说明，页面会提示 |
| 远程浏览器 | 首版不提供远程管理；不可写连接不会显示保存成功 |
| 项目级 / 会话级覆盖 | 尚未提供 |
| MCP 服务器管理 | 不管理服务器连接；通过同一工具注册表加载且名称符合上述格式的工具会自动显示 |

关闭 `write` 只禁止这个工具；开放的 `pwsh`、`bash` 等工具仍可能写文件。要限制文件系统访问，应使用 DSH 沙箱。本插件不是恶意 Node 插件的隔离机制。

本插件的工具目录查询为本机只读 HTTP 接口 `GET /tool-manager/api/catalog`，不返回工具参数、执行记录或工作区路径。配置写入复用官方 settings RPC 和 revision 检查。

## 卸载

```powershell
npx @deepseek-ai/dsh@0.1.2-rc.1 plugin --profile web remove dsh-tool-manager
```

重启 DSH 后，插件的过滤器和执行守卫移除，工具恢复 Harness 原有行为。settings 中的禁用名单保留，重新安装时继续生效。若希望同时清空偏好，请在卸载前点「恢复默认」。

## 开发与验证

```powershell
npm ci
npm run check
```

`lib/` 是随源码提交的安装产物。修改源码后运行 `npm run check`，将更新的 `lib/` 一起提交；CI 会重新构建并检查产物是否同步。打包使用 `npm run pack:release`，会先检查并构建再执行 `npm pack`。不要添加 `prepare`、`prepack` 或安装生命周期脚本，以免 GitHub 安装再次要求用户批准构建。

测试使用真实 Cordis、DSH 工具注册表、文件设置 provider，以及 Code/PTC worker runtime；不用付费模型 API，不读取用户的 DSH 凭据。临时文件写入 Git 忽略的 `.test-artifacts/`。

验证覆盖：独立开关、作用域/子 Agent、其他策略不能重新放行、审批等待期间切换、运行中调用的边界、嵌套与 Code/PTC 调用、持久化重载、revision 冲突、输入校验和卸载清理。

另在隔离的真实 `0.1.2-rc.1` DSH Web 实例中检查页面加载、开关写入 Host、搜索和重新打开页面后的状态，以及浅色/深色外观。验证记录见 [docs/verification.zh-CN.md](docs/verification.zh-CN.md)。

实现依据与参考项目见 [调研与方案](docs/research-and-plan.zh-CN.md)。
