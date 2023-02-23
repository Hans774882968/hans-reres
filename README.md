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

## 构建流程

我们需要打包出`manifest.json`；`popup.html`及其配套CSS、JS；`options.html`及其配套CSS、JS；`background.js`；静态资源。这就是一个典型Chrome插件的构成。下面列举遇到的几个基本问题和解决方案：

1. 静态资源：直接用`rollup-plugin-copy`复制到`manifest.json`定义的位置即可。
2. `manifest.json`需要修改某些字段：`vite`没有loader的概念，所以需要想其他办法。可以尝试构造一个专门`import 'xx.json'`导入json文件的入口ts文件，然后匹配`xx.json`进行处理，但这种写法获得的文件内容，是json文本转化为js对象的结果，不是很简洁。最终我选择了在`writeBundle`阶段，读入`manifest.json`并写入目标位置，类似于`rollup-plugin-copy`。[代码实现传送门](https://github.com/Hans774882968/hans-reres/blob/main/plugins/transform-manifest-plugin.ts)
3. `background.ts`和`popup.html / options.html`依赖的`tsx`文件希望共享某些代码，但不希望`background.js`打包结果出现`import`语句，因为这会导致插件无法工作：我们发现`background.ts`的可靠性可以靠单测来保证，于是只需要保证`popup.html / options.html`的本地预览功能可用。所以解决方案异常简单，构建2次即可。构建命令修改为`tsc && vite build && vite build --config vite-bg.config.ts`。

至此，Chrome插件开发与普通的~~🐓⌨️🍚~~前端开发没有任何区别。

## 参考资料
1. https://juejin.cn/post/7185920750765735973
2. stylelint规则文档：https://ask.dcloud.net.cn/article/36067