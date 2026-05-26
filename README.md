# HeyGen 中文汉化

一个用于将 HeyGen 网页界面翻译为简体中文的 Tampermonkey 油猴脚本。

## 功能特性

- 支持 `app.heygen.com` 和 `www.heygen.com`
- 翻译首页、导航、AI Studio、数字人、声音、生成弹窗、付费计划等常见界面文本
- 使用 `MutationObserver` 监听 React 单页应用的动态渲染内容
- 只替换文本节点和 placeholder，不修改 DOM 结构
- 跳过输入框内容、脚本编辑区、标题输入区等用户数据
- 词典独立维护在 `locals.js`，后续补充翻译更方便

## 安装方法

1. 安装浏览器扩展 [Tampermonkey](https://www.tampermonkey.net/)。
2. 打开脚本安装地址：
   [heygen-chinese.user.js](https://raw.githubusercontent.com/a18367883388/heygen-chinese/main/heygen-chinese.user.js)
3. Tampermonkey 会自动打开安装页面，点击「安装」。
4. 刷新 HeyGen 页面，脚本会自动生效。

截图说明：

- 安装 Tampermonkey 后，浏览器右上角会出现 Tampermonkey 图标。
- 点击脚本 Raw 链接后，会进入 Tampermonkey 的脚本安装确认页。
- 安装完成后，打开或刷新 HeyGen 页面即可看到中文界面。

## 使用方法

安装后无需额外配置。访问以下地址时，脚本会自动运行：

- `https://app.heygen.com/*`
- `https://www.heygen.com/*`

如果遇到新出现的英文界面文本，可以在 `locals.js` 里补充词条。

## 本地开发

如果你想在本地调试词典：

1. 克隆本仓库。
2. 在 Tampermonkey 中打开 `heygen-chinese.user.js`。
3. 将脚本头部的 `@require` 改成本地文件地址，例如：

```javascript
// @require file:///Users/your-name/heygen-chinese/locals.js
```

4. 修改 `locals.js` 后刷新 HeyGen 页面查看效果。

## 贡献翻译

欢迎补充更多 HeyGen 界面翻译：

1. Fork 本仓库。
2. 打开 `locals.js`。
3. 按照 `"英文原文": "中文翻译"` 的格式添加词条。
4. 提交 Pull Request，并说明你补充的页面位置。

建议优先使用 HeyGen 页面里实际出现的英文原文，保持大小写和标点一致，这样命中率最高。

## 免责声明

本项目仅用于提升中文用户浏览 HeyGen 网页界面的便利性，与 HeyGen 官方无关。脚本只在浏览器本地运行，不会上传或收集你的账号、视频、脚本、素材等数据。

## License

本项目基于 MIT License 开源。
