# 片刻之间 · 纯静态个人博客

一个无需构建工具的个人博客模板，包含文章列表、文章详情、关于页面、全文搜索、分类筛选和深浅主题。

## 本地预览

Markdown 通过 `fetch()` 加载，因此不能直接双击 `index.html`。在项目目录运行任意静态服务器，例如：

```powershell
python -m http.server 8080
```

然后访问 `http://localhost:8080/`。

## 修改个人信息

编辑 `js/config.js` 中的站点标题、作者、简介、邮箱和社交链接。

## 添加文章

1. 在 `posts/` 目录新建 Markdown 文件，例如 `my-post.md`。
2. 在 `js/config.js` 的 `posts` 数组中添加文章信息。
3. 将 `file` 设置为 `posts/my-post.md`，并保持 `published: true`。

## 部署到 GitHub Pages

1. 将当前目录提交到 GitHub 仓库。
2. 进入仓库 **Settings → Pages**。
3. 在 **Build and deployment** 中选择 **Deploy from a branch**。
4. 选择目标分支和 `/ (root)` 目录并保存。

Hash 路由无需额外配置，可直接用于 GitHub Pages 子目录。

## 部署到 EdgeOne Pages

导入 GitHub 仓库，框架预设选择静态站点。无需构建命令，输出目录填写 `/`（仓库根目录）。

## 依赖

页面通过 CDN 加载 Marked 和 DOMPurify，用于 Markdown 渲染与内容净化；无需 npm 安装。
