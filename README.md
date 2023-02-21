## 配置stylelint
根据[参考链接1](https://juejin.cn/post/7185920750765735973)，首先

```bash
npm install stylelint stylelint-config-standard stylelint-order postcss-less -D
```

然后添加`.stylelintrc.cjs`和`.stylelintignore`，最后`package.json` `scripts`添加一条命令：

```bash
"lint:s": "stylelint \"**/*.{css,scss,less}\" --fix",
```

即可通过`npm run lint:s`format less文件了。

更多`stylelint`规则介绍见[参考链接2](https://ask.dcloud.net.cn/article/36067)

### vscode配置保存自动修复
vscode打开设置，再打开`settings.json`：

```json
{
    "editor.codeActionsOnSave": {
        "source.fixAll.eslint": true,
        "source.fixAll.stylelint": true,
    },
}
```

若不生效，尝试重启vscode。

## 参考资料
1. https://juejin.cn/post/7185920750765735973
2. stylelint规则文档：https://ask.dcloud.net.cn/article/36067