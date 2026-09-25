# 灵·洞本体工作站·展示站

这是一个与真实平台运行环境分离的纯静态站点，用于 GitHub Pages 对外展示：

- 产品介绍与能力全景；
- 按角色和目标组织的在线教程；
- 不连接 API、不上传文件、不写入任何系统的纯前端交互演示。

真实平台继续在本地运行，包括 Spring Boot API、PostgreSQL、TDB2、身份与会话、数据源连接以及受控执行。

## 本地预览

```bash
npm test
python3 -m http.server 4173 --directory dist
```

然后打开 `http://127.0.0.1:4173/`。

## 发布

`.github/workflows/pages.yml` 会在 `main` 分支更新时构建 `dist/` 并发布到 GitHub Pages。首次使用时，需在仓库 `Settings → Pages` 将发布源设为 **GitHub Actions**。

## 信任边界

- 展示站不包含凭据、真实业务数据或后端地址。
- “交互演示”使用内置示例数据，不代表真实 AI 推理或工作组正式结论。
- 涉及登录、建模、数据源、问答和智能体执行的真实操作，必须进入本地平台。
