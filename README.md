[TOC]

## 引言

[这个项目](https://github.com/Hans774882968/hans-reres)主要目的是用前端工程化技术栈复现`ReRes`和`request-interceptor`，希望将两者的功能结合起来。`request-interceptor`是前端开发调试常用工具，提供了多种修改请求的功能，但无法将请求映射到本地的文件。`ReRes`是JS逆向工程师常用工具，可以用来更改页面请求响应的内容。可以把请求映射到其他的url，也可以映射到本机的文件或者目录。因为`manifest version 3`无法实现这两个插件的功能，所以这个项目仍然使用`manifest version 2`。本文假设你了解：

- Chrome插件开发的`manifest.json`常见字段，尤其是`browser_action`（`popup`页面）、`options_page`（`options`页面，扩展程序选项）和`background`（`background.js`）。

修改请求的代码都是在`background.js`中实现的。`background.js`实际上也在一个独立的页面运行。在`chrome://extensions/`点击插件的“背景页”链接即可对`background.js`进行调试。

## Chrome插件ReRes源码赏析

`popup`页面和`options`页面和`background.js`唯一的联系就是，其他页面需要将数据写入背景页的`localStorage`：

```js
    var bg = chrome.extension.getBackgroundPage();

    //保存规则数据到localStorage
    function saveData() {
        $scope.rules = groupBy($scope.maps, 'group');
        bg.localStorage.ReResMap = angular.toJson($scope.maps);
    }
```

`background.js`注释版源码：

```js
var ReResMap = [];
var typeMap = {
    "txt"   : "text/plain",
    "html"  : "text/html",
    "css"   : "text/css",
    "js"    : "text/javascript",
    "json"  : "text/json",
    "xml"   : "text/xml",
    "jpg"   : "image/jpeg",
    "gif"   : "image/gif",
    "png"   : "image/png",
    "webp"  : "image/webp"
}
// 从背景页的localStorage读取ReResMap
function getLocalStorage() {
    ReResMap = window.localStorage.ReResMap ? JSON.parse(window.localStorage.ReResMap) : ReResMap;
}

// xhr请求本地文件的url，进行文本拼接，转为data url
function getLocalFileUrl(url) {
    var arr = url.split('.');
    var type = arr[arr.length-1];
    var xhr = new XMLHttpRequest();
    xhr.open('get', url, false);
    xhr.send(null);
    var content = xhr.responseText || xhr.responseXML;
    if (!content) {
        return false;
    }
    content = encodeURIComponent(
        type === 'js' ?
        content.replace(/[\u0080-\uffff]/g, function($0) {
            var str = $0.charCodeAt(0).toString(16);
            return "\\u" + '00000'.substr(0, 4 - str.length) + str;
        }) : content
    );
    return ("data:" + (typeMap[type] || typeMap.txt) + ";charset=utf-8," + content);
}

// 看MDN即可，https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/webRequest/onBeforeRequest
chrome.webRequest.onBeforeRequest.addListener(function (details) {
        // 这个url会在循环中被修改
        var url = details.url;
        for (var i = 0, len = ReResMap.length; i < len; i++) {
            var reg = new RegExp(ReResMap[i].req, 'gi');
            if (ReResMap[i].checked && typeof ReResMap[i].res === 'string' && reg.test(url)) {
                if (!/^file:\/\//.test(ReResMap[i].res)) {
                    // 普通url，只进行正则替换
                    do {
                        url = url.replace(reg, ReResMap[i].res);
                    } while (reg.test(url))
                } else {
                    do {
                        // file协议url，先正则替换，再转为data url
                        url = getLocalFileUrl(url.replace(reg, ReResMap[i].res));
                    } while (reg.test(url))
                }
            }
        }
        return url === details.url ? {} : { redirectUrl: url };
    },
    {urls: ["<all_urls>"]},
    ["blocking"]
);

getLocalStorage();
window.addEventListener('storage', getLocalStorage, false);
```

## Chrome插件request-interceptor background.js源码赏析

**`request-interceptor`**作者说没有开源，但我们仍然能轻易找到其`background.js`地址。~~幸好没有特意进行混淆~~

1. 安装插件。
2. 以macOS为例，执行命令：`open ~/Library/Application\ Support/Google/Chrome/Default/Extensions`，打开Chrome插件安装路径。
3. 根据插件ID找到对应的文件夹。

如何获得**`request-interceptor`**的`background.js`所使用的数据结构：阅读源码后知道，只需要在`background.js`控制台运行以下代码即可：

```js
let dataSet1 = {};
let storageKey1 = '__redirect__chrome__extension__configuration__vk__';
chrome.storage.local.get(storageKey1, config => {
    dataSet1 = {};
    Object.assign(dataSet1, (config || {})[storageKey1] || {});
});
```

代码比较长就不完整贴出啦。[带注释版源码地址](https://github.com/Hans774882968/hans-reres/blob/main/request-interceptor-bg.js)

可以学到什么：

1. 作者设计规则所执行的操作的时候，借鉴了http状态码设计的思想。`add-request-header`、`add-response-header`等操作的类型都是“add”，于是可以有下面的代码：

```js
const modifyHeaders = (headers, action, name, value) => {
  if (!headers || !action) {
    return;
  }
  if (action === 'add') {
    headers.set(name, value);
  } else if (action === 'modify') {
    if (headers.has(name)) {
      headers.set(name, value);
    }
  } else if (action === 'delete') {
    headers.delete(name);
  }
};
// 调用
actionType = type.split('-')[0];
modifyHeaders(obj.responseHeaders, actionType, updatedName, updatedValue);
```

这一技巧可以减少一些重复的`if-else`。

## 技术选型

`React Hooks + vite + jest`。使用下面的命令来创建：

```bash
npm init @vitejs/app
```

如果对这条命令所做的事感兴趣，可以看[参考链接4](https://juejin.cn/post/6948202986573135908)

但这条命令创建出的项目的文件结构是为构建单页应用而服务的，并不符合Chrome插件开发的需要，我们需要进行改造。我们期望的Chrome插件的`manifest.json`如下：

```json
{
  "manifest_version": 2,
  "name": "hans-reres",
  "version": "0.0.0",
  "description": "hans-reres旨在用前端工程化技术栈复现ReRes。ReRes是JS逆向工程师常用工具，可以用来更改页面请求响应的内容。通过指定规则，您可以把请求映射到其他的url，也可以映射到本机的文件或者目录。ReRes支持单个url映射，也支持目录映射。",
  "browser_action": {
    "default_icon": "assets/icon.png",
    "default_title": "hans-reres-popup",
    "default_popup": "popup.html"
  },
  "icons": {
    "16": "assets/icon.png",
    "48": "assets/icon48.png"
  },
  "options_page": "options.html",
  "background": {
    "scripts": [
      "background.js"
    ],
    "persistent": true
  },
  "permissions": [
    "tabs",
    "webRequest",
    "webRequestBlocking",
    "<all_urls>",
    "unlimitedStorage"
  ],
  "homepage_url": "https://github.com/Hans774882968/hans-reres"
}
```

所以我们需要：

1. `manifest.json`。
2. `background.ts`。
3. `popup.html`和它引用的`src/popup/popup.tsx`。
4. `options.html`和它引用的`src/options/options.tsx`。
5. 一系列供`tsx`文件和`background.ts`共同使用的代码。
6. 静态文件，放在`src/assets`文件夹下。

核心是希望构建流程用到这些文件，生成符合Chrome插件结构的产物，详见下文《构建流程》一节。

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

## 配置postcss

`react + vite`项目已经内置postcss，可以从`package-lock.json`中看出：

```json
    "vite": {
      "requires": {
        "esbuild": "^0.16.14",
        // 省略其他
        "postcss": "^8.4.21",
      },
      "dependencies": {
        "rollup": {
          "requires": {
            "fsevents": "~2.3.2"
          }
        }
      }
    },
```

### postcss-preset-env

装一下`postcss-preset-env`插件，这个插件支持css变量、一些未来css语法以及自动补全：

```bash
npm i postcss-preset-env -D
```

添加`postcss.config.cjs`：

```js
const postcssPresetEnv = require('postcss-preset-env');

module.exports = {
  plugins: [postcssPresetEnv()]
};
```

配置`postcss-preset-env`插件前：

```css
._app_1afpm_1 {
    padding: 20px;
    user-select: none;
}
```

配置该插件后：

```css
._app_1afpm_1 {
    padding: 20px;
    -webkit-user-select: none;
    -moz-user-select: none;
    user-select: none;
}
```

### flex-gap-polyfill

这个插件的配置步骤和上面的一样，不赘述。

代码：

```css
.app {
  padding: 20px;
  display: flex;
  gap: 20px;
}
```

效果：

```css
._app_13518_1 {
    padding: 20px;
    display: flex;
    --fgp-gap: var(--has-fgp, 20px);
    gap: 20px;
    gap: var(--fgp-gap, 0px);
    margin-top: var(--fgp-margin-top, var(--orig-margin-top));
    margin-left: var(--fgp-margin-left, var(--orig-margin-left));
}
._app_13518_1 {
    --has-fgp: ;
    --element-has-fgp: ;
    pointer-events: none;
    pointer-events: var(--has-fgp) none;
    --fgp-gap-row: 20px;
    --fgp-gap-column: 20px;
}
._app_13518_1 {
    --fgp-margin-top: var(--has-fgp) calc(var(--fgp-parent-gap-row, 0px) / (1 + var(--fgp--parent-gap-as-decimal, 0)) - var(--fgp-gap-row) + var(--orig-margin-top, 0px)) !important;
    --fgp-margin-left: var(--has-fgp) calc(var(--fgp-parent-gap-column, 0px) / (1 + var(--fgp--parent-gap-as-decimal, 0)) - var(--fgp-gap-column) + var(--orig-margin-left, 0px)) !important;
}
```

### flex-gap-polyfill踩坑

但要注意`flex-gap-polyfill`使用上有些坑：

1. 当你有这样的结构：`<div style="padding: 20px;"><div class="flex-and-gap"></div><div></div></div>`，那么`.flex-and-gap`会因为使用了**负margin**，导致它右侧的div**错位**。解决方案：在`.flex-and-gap`外面再套一层div，让`.flex-and-gap`的负margin不产生影响。
2. 打包体积增大。在只使用了3处`flex-gap`的情况下，css大小`3.17kb -> 11.0kb`。

## 配置husky + commitlint

根据[参考链接8](https://juejin.cn/post/6990307028162281508)

（1）项目级安装commitlint

```bash
npm i -D @commitlint/config-conventional @commitlint/cli
```

（2）添加`commitlint.config.cjs`（如果`package.json`配置了`"type": "module"`就需要`.cjs`，否则`git commit`时会报错）

```js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {}
};
```

（3）安装husky：`npm i -D husky`

（4）对于`husky版本>=5.0.0`，根据[官方文档](https://typicode.github.io/husky/#/)，首先安装git钩子：`npx husky install`，运行后会生成`.husky/_`文件夹，下面有`.gitignore`和`husky.sh`文件，都是被忽略的。接下来添加几个钩子：

```bash
npx husky add .husky/pre-commit "npm run lint"
npx husky add .husky/pre-commit "npm run lint:s"
npx husky add .husky/commit-msg 'npx commitlint --edit $1'
```

会生成`.husky/commit-msg`和`.husky/pre-commit`两个文件。不用命令，自己手动编辑也是可行的，分析过程见下文《`husky add、install`命令解析》。

接下来可以尝试提交了。效果：

```
⧗   input: README添加husky + commitlint
✖   subject may not be empty [subject-empty]
✖   type may not be empty [type-empty]
```

### husky add、install命令解析
#### vscode调试node cli程序

创建`.vscode/launch.json`：

```json
{
  // 使用 IntelliSense 了解相关属性。 
  // 悬停以查看现有属性的描述。
  // 欲了解更多信息，请访问: https://go.microsoft.com/fwlink/?linkid=830387
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node-terminal",
      "request": "launch",
      "command": "npx husky add .husky/pre-commit 'npm run lint:s'",
      "name": "npx husky add",
      "skipFiles": [
        "<node_internals>/**"
      ],
    }
  ]
}
```

之后可以直接在“运行和调试”选择要执行的命令了。

#### husky add

命令举例：`npx husky add .husky/commit-msg 'npx commitlint --edit $1'`

cli的入口`node_modules/husky/lib/bin.js`：

```js
const [, , cmd, ...args] = process.argv;
const ln = args.length;
const [x, y] = args;
const hook = (fn) => () => !ln || ln > 2 ? help(2) : fn(x, y);
const cmds = {
    install: () => (ln > 1 ? help(2) : h.install(x)),
    uninstall: h.uninstall,
    set: hook(h.set),
    add: hook(h.add),
    ['-v']: () => console.log(require(p.join(__dirname, '../package.json')).version),
};
try {
    cmds[cmd] ? cmds[cmd]() : help(0);
}
```

`x, y`分别表示文件名`.husky/commit-msg`和待添加的命令`npx commitlint --edit $1`。`h`就是`node_modules/husky/lib/index.js`。找到相关函数：

```js
function set(file, cmd) {
    const dir = p.dirname(file);
    if (!fs.existsSync(dir)) {
        throw new Error(`can't create hook, ${dir} directory doesn't exist (try running husky install)`);
    }
    fs.writeFileSync(file, `#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

${cmd}
`, { mode: 0o0755 });
    l(`created ${file}`); // 创建文件后会输出 husky - created .husky/pre-commit
}

function add(file, cmd) {
    if (fs.existsSync(file)) {
        fs.appendFileSync(file, `${cmd}\n`);
        l(`updated ${file}`); // 在已有文件后添加后则会输出 husky - updated .husky/pre-commit
    }
    else {
        set(file, cmd);
    }
}
```

总而言之，不执行这条命令，直接在`.husky/commit-msg`之后加命令是等效的。

#### husky install

此时我们也可以快速了解`npx husky install`所做的事。

```js
const git = (args) => cp.spawnSync('git', args, { stdio: 'inherit' });
function install(dir = '.husky') {
    if (process.env.HUSKY === '0') {
        l('HUSKY env variable is set to 0, skipping install');
        return;
    }
    /* 执行 git rev-parse 命令，正常情况下无输出
    git(['rev-parse']){
      output: (3) [null, null, null]
      pid: 90205
      signal: null
      status: 0
      stderr: null
      stdout: null
    }
    */
    if (git(['rev-parse']).status !== 0) {
        l(`git command not found, skipping install`);
        return;
    }
    const url = 'https://typicode.github.io/husky/#/?id=custom-directory';
    // npx husky install <dir>的dir参数不能跳出项目根目录
    if (!p.resolve(process.cwd(), dir).startsWith(process.cwd())) {
        throw new Error(`.. not allowed (see ${url})`);
    }
    if (!fs.existsSync('.git')) {
        throw new Error(`.git can't be found (see ${url})`);
    }
    try {
        // 创建“.husky/_”文件夹
        fs.mkdirSync(p.join(dir, '_'), { recursive: true });
        // 创建“.husky/_/.gitignore”文件
        fs.writeFileSync(p.join(dir, '_/.gitignore'), '*');
        // .husky/_/husky.sh 来源于 node_modules
        fs.copyFileSync(p.join(__dirname, '../husky.sh'), p.join(dir, '_/husky.sh'));
        // 执行 git config core.hooksPath .husky 命令
        // 同理取消githooks只需要执行 git config --unset core.hooksPath
        const { error } = git(['config', 'core.hooksPath', dir]);
        if (error) {
            throw error;
        }
    }
    catch (e) {
        l('Git hooks failed to install');
        throw e;
    }
    l('Git hooks installed');
}
```

## 配置jest

根据[参考链接3](https://juejin.cn/post/7078330175145902110)：

1、安装jest：

```bash
npm install jest @types/jest -D
```

2、生成jest配置文件：

```bash
npx jest --init
```

生成的`jest.config.ts`：

```ts
import { Config } from '@jest/types';
/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/configuration
 */

const config: Config.InitialOptions = {
  // Automatically clear mock calls, instances, contexts and results before every test
  clearMocks: true,
  // A preset that is used as a base for Jest's configuration
  preset: 'ts-jest',
  restoreMocks: true,
  testEnvironment: 'jsdom'
};

export default config;
```

注意：

1. 即使指定测试环境是`jsdom`，我们发起向本地文件的XHR请求时仍会报跨域错误，所以发起XHR请求的模块必须mock。
2. 对于`use-local-storage-state`包的测试文件`test/useLocalStorageStateBrowser.test.tsx`（我将`use-local-storage-state`包的代码复制到自己的项目里，进行了更改，以满足自己的需求），必须指定测试环境是`jsdom`。
3. 指定测试环境是`jsdom`时需要`npm install jest-environment-jsdom -D`。

3、配置babel：

```bash
npm install babel-jest @babel/core @babel/preset-env @babel/preset-typescript -D
```

4、创建`babel.config.ts`

```ts
export default {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' }}],
    '@babel/preset-typescript'
  ]
};
```

5、如果你在第2步创建的jest配置文件是ts，则还需要装`ts-node`，否则会报错：`Jest: 'ts-node' is required for the TypeScript configuration files.`。抛出这个错误的代码可以自己顺着stack trace往上找一下~

```bash
npm install ts-jest ts-node -D
```

总的来说，只需要：（1）安装若干`devDependencies`的npm包。（2）创建`babel.config.ts`和`jest.config.ts`。

## 构建流程

《技术选型》一节提到，我们需要打包出`manifest.json`；`popup.html`及其配套CSS、JS；`options.html`及其配套CSS、JS；`background.js`；静态资源。这就是一个典型Chrome插件的构成。我们需要设计一个构建流程，生成上述产物。下面列举我遇到的几个基本问题和解决方案：

1. 静态资源：直接用`rollup-plugin-copy`复制到`manifest.json`定义的位置即可。
2. `manifest.json`需要修改某些字段：`vite`没有loader的概念，所以需要想其他办法。可以尝试构造一个专门`import 'xx.json'`导入json文件的入口ts文件，然后匹配`xx.json`进行处理，但这种写法获得的文件内容，是json文本转化为js对象的结果，不是很简洁。最终我的做法是：在`writeBundle`阶段，先读入`manifest.json`，再进行修改，最后写入目标位置，类似于`rollup-plugin-copy`。[代码实现传送门](https://github.com/Hans774882968/hans-reres/blob/main/plugins/transform-manifest-plugin.ts)
3. `background.ts`和`popup.html / options.html`依赖的`tsx`文件希望共享某些代码，但不希望`background.js`打包结果出现`import`语句，因为这会导致插件无法工作：我们发现`background.ts`的可靠性可以靠单测来保证，于是只需要保证`popup.html / options.html`的本地预览功能可用。所以解决方案异常简单，构建2次即可。构建命令修改为`tsc && vite build && vite build --config vite-bg.config.ts`。

至此，Chrome插件开发与普通的~~🐓⌨️🍚~~前端开发没有任何区别。

### shell脚本：输出构建耗时

令人震惊的是，vite缺乏一个输出构建耗时的可靠插件（0 star的插件还是有的）！这个小需求可以自己写vite插件来解决，也可以用一个更简单的方式来解决：写一个shell脚本。

我们在配置jest时安装了`ts-node`，因此这里可以直接写ts脚本。`scripts/build.ts`[传送门](https://github.com/Hans774882968/hans-reres/blob/main/scripts/build.ts)：

```ts
import spawn from 'cross-spawn';
import chalk from 'chalk';

function main () {
  const startTime = new Date().valueOf();
  const cmds = [
    'npx tsc',
    'npx vite build',
    'npx vite build --config vite-bg.config.ts'
  ];
  const buildCmd = cmds.join(' && ');
  console.log(chalk.greenBright('Build command:', buildCmd));
  const spawnReturn = spawn.sync(buildCmd, [], { stdio: 'inherit', shell: true });
  if (spawnReturn.error) {
    console.error(chalk.redBright('Build failed with error'), spawnReturn.error);
    return;
  }
  const duration = ((new Date().valueOf() - startTime) / 1000).toFixed(2);
  console.log(chalk.greenBright(`✨  Done in ${duration}s.`));
}

main();
```



1. `cross-spawn`可以理解成一个跨平台版的`child_process.spawn`，避免自己处理跨平台适配。`spawn.sync`就是`child_process.spawnSync`。[参考链接5](https://www.cnblogs.com/cangqinglang/p/14761536.html)
2. `chalk`用来输出彩色文本。
3. 添加`shell: true`可解决MAC上运行报错`Error: spawnSync <cmd> ENOENT`导致无法构建的问题，[参考链接7](https://stackoverflow.com/questions/27688804/how-do-i-debug-error-spawn-enoent-on-node-js)

根据[参考链接6](https://juejin.cn/post/6939538768911138823)，构建命令要相应地修改为：

```bash
node --loader ts-node/esm ./scripts/build.ts
```

命令并不能直接使用`ts-node scripts/build.ts`，因为会报错`TypeError [ERR_UNKNOWN_FILE_EXTENSION]: Unknown file extension ".ts"`。

相关依赖：

```bash
npm install chalk cross-spawn @types/cross-spawn ts-node -D
```

## 引入i18n

根据[参考链接9](https://juejin.cn/post/7139855730105942030)，我们可以用`react-i18next`快速为react项目引入i18n。

（1）安装依赖

```bash
npm i i18next react-i18next i18next-browser-languagedetector
```



- `react-i18next`是一个`i18next`插件，用来降低 react 的使用成本。
- `i18next-browser-languagedetector`是一个`i18next`插件，它会自动检测浏览器的语言。

（2）我们建一个文件夹`src/i18n`存放i18n相关的代码。i18n需要考虑的一个核心问题是：资源文件的加载、使用策略。为了简单，我们直接使用`.ts`文件。创建`src/i18n/i18n-init.ts`如下。

1. `i18n.use`注册`i18next`插件。
2. 这里封装了一个`$gt`函数，期望能直接调用`$gt`而不需要在组件里多写一句`const { t } = useTranslation()`。但麻烦的是，`t`函数必须直接在组件中引用，甚至不能在组件内定义的函数里调用，否则它会直接**抛出错误让我们整个应用崩溃**……幸好本插件规模很小，这个问题可以容忍。

```ts
import i18n from 'i18next';
import { initReactI18next, useTranslation } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './en';
import zh from './zh';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: true,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    },
    resources: {
      en: {
        translation: en
      },
      zh: {
        translation: zh
      }
    }
  });

export const $gt = (key: string | string[]) => {
  const { t } = useTranslation();
  return t(key);
};

export const langOptions = [
  { value: 'en', label: 'English' },
  { value: 'zh', label: '中文' }
];

export default i18n;
```

（3）语言切换功能。`useTranslation()`也会返回一个`i18n`对象，我们调用`i18n.changeLanguage`即可切换语言。

```tsx
/*
export const langOptions = [
  { value: 'en', label: 'English' },
  { value: 'zh', label: '中文' }
];
*/
const changeLang = (langValue: string) => {
  i18n.changeLanguage(langValue);
};
<Select
  defaultValue={i18n.resolvedLanguage}
  placeholder={$gt('Select language')}
  options={langOptions}
  onChange={changeLang}
/>
```

## 动态切换暗黑主题

根据[参考链接10](https://ant-design.gitee.io/docs/react/customize-theme-cn)，antd5提供了动态切换主题的能力，只需要使用`ConfigProvider`：

```tsx
import theme from 'antd/es/theme';
import ConfigProvider from 'antd/es/config-provider';
<ConfigProvider theme={{
  algorithm: preferDarkTheme ? theme.darkAlgorithm : theme.defaultAlgorithm
}}>
    <MyComponents />
</ConfigProvider>
```

使用预设算法是成本最低的方式，当然功能也最局限。为简单起见，我们就采用这种方式。

首先需要一个bool来控制当前是暗色主题还是灰色主题：

```tsx
const [preferDarkTheme, setPreferDarkTheme] = useLocalStorageState('preferDarkTheme', {
  defaultValue: true
});
```

导航栏的开关只需要调用`setPreferDarkTheme`即可切换主题。

另外，项目有一些组件没有用antd，不在预设算法的覆盖范围内，比如导航栏。不优美但肯定最简单的解决方案就是：我们在根组件定义各个主题的类名prefix：

```ts
enum ClassNamePrefix {
  DARK = 'custom-theme-dark',
  DEFAULT = 'custom-theme-default'
}
const curClassNamePrefix = preferDarkTheme ? ClassNamePrefix.DARK : ClassNamePrefix.DEFAULT;
```

然后通过Context传给子组件：

```tsx
<ThemeContext.Provider value={{ curClassNamePrefix, preferDarkTheme, setPreferDarkTheme }}>
</ThemeContext.Provider>
```

子组件直接消费即可：

```tsx
<Row className={styles[`${curClassNamePrefix}-navbar`]} />
```

## 插件核心功能：数据结构设计

我们希望这个插件支持：

- 重定向到某URL，包括`file://`这种指向本地文件的。
- 对于GET请求，可以进行`URLSearchParams`的增删改。
- 对请求头进行增删改。
- 对响应头进行增删改。
- 拦截请求。
- ……

拟定这些需求是参考了Chrome插件`request-interceptor`的`background.js`的核心代码，如下：

```js
const applyRuleActions = (rule, details, obj) => {
    if (!rule.actions || !rule.enabled) {
        return;
    }

    // const count = countMap.get(rule.id) ?? 0;
    // countMap.set(rule.id, count + 1);

    const matches = getMatches(rule, details);

    (rule.actions || []).forEach((action) => {
        if (!action.details) {
            action.details = {};
        }

        const {type, details: {name, value}} = action;
        const updatedName = patternMatchingReplace(name, matches);
        const updatedValue = patternMatchingReplace(value, matches);

        let actionType;

        switch (type) {
            case 'block-request':
                obj.cancel = true; break;
            case 'add-request-header':
            case 'modify-request-header':
            case 'delete-request-header':
                actionType = type.split('-')[0];
                modifyHeaders(obj.requestHeaders, actionType, updatedName, updatedValue);
                obj.requestHeadersModified = true;
                break;
            case 'add-response-header':
            case 'modify-response-header':
            case 'delete-response-header':
                actionType = type.split('-')[0];
                modifyHeaders(obj.responseHeaders, actionType, updatedName, updatedValue);
                obj.responseHeadersModified = true;
                break;
            case 'add-query-param':
            case 'modify-query-param':
            case 'delete-query-param':
                actionType = type.split('-')[0];
                modifyQueryParams(obj.queryParams, actionType, updatedName, updatedValue);
                obj.queryParamsModified = true;
                break;
            case 'redirect-to':
                // Preflight requests can not be redirected
                if (details.method.toLowerCase() !== 'options') {
                    obj.redirectUrl = updatedValue;
                }

                break;
            case 'throttle':
                obj.redirectUrl = `https://deelay.me/${updatedValue}/${details.url}`; break;
        }

    });
};
```

对需求进行简单分析后，我认为`background.ts`的一条规则这样描述看上去还算合理，[完整代码](https://github.com/Hans774882968/hans-reres/blob/main/src/action-types.ts)：

```ts
// 为节省篇幅，只展示了一部分
export enum RewriteType {
  SET_UA = 'Set UA',
  REDIRECT = 'Redirect',
  ADD_QUERY_PARAM = 'Add Query Param'
}

export interface RequestMappingRule {
  req: string
  action: Action
  checked: boolean
}

export interface Action {
  type: RewriteType
}

export interface RedirectAction extends Action {
  res: string
}

export interface SetUAAction extends Action {
  newUA: string
}

export interface AddQueryParamAction extends Action {
  name: string
  value: string
}

export interface ModifyQueryParamAction extends Action {
  name: string
  value: string
}

export interface DeleteQueryParamAction extends Action {
  name: string
}

export type QueryParamAction = AddQueryParamAction | ModifyQueryParamAction | DeleteQueryParamAction;

export function isAddQueryParamAction (o: Action): o is AddQueryParamAction {
  return o.type === RewriteType.ADD_QUERY_PARAM;
}

export type ReqHeaderAction = AddReqHeaderAction | ModifyReqHeaderAction | DeleteReqHeaderAction;

export function isReqHeaderAction (o: Action): o is ReqHeaderAction {
  return isAddReqHeaderAction(o) ||
    isModifyReqHeaderAction(o) ||
    isDeleteReqHeaderAction(o);
}
```

前文提到，`request-interceptor`源码设计描述操作的常量`(add|modify|delete)-response-header`时，借鉴了http状态码的思想，第一个词表示操作类型。但我不打算这么写，而是采用类型安全但比较啰嗦的写法。

`popup`、`options`页面需要用到的，各类型`Action`提供的默认值如下：

```ts
export const actionDefaultResultValueMap = {
  [RewriteType.REDIRECT]: { res: 'https://baidu.com' },
  [RewriteType.SET_UA]: { newUA: 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_0 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1 FingerBrowser/1.5' },
  [RewriteType.BLOCK_REQUEST]: {},
  [RewriteType.ADD_QUERY_PARAM]: { name: 'role', value: 'acmer' },
  [RewriteType.MODIFY_QUERY_PARAM]: { name: 'rate', value: '2400' },
  [RewriteType.DELETE_QUERY_PARAM]: { name: 'param_to_delete' },
  [RewriteType.ADD_REQ_HEADER]: { name: 'X-Role', value: 'ctfer' },
  [RewriteType.MODIFY_REQ_HEADER]: { name: 'X-Rate', value: '2400' },
  [RewriteType.DELETE_REQ_HEADER]: { name: 'Request-Header' },
  [RewriteType.ADD_RESP_HEADER]: { name: 'Y-Role', value: 'acmer' },
  [RewriteType.MODIFY_RESP_HEADER]: { name: 'Y-Rate', value: '2400' },
  [RewriteType.DELETE_RESP_HEADER]: { name: 'Response-Header' }
};
```

`RequestMappingRule`的数据结构设计符合直觉，但这个设计对象里有对象，引入了一个问题：如果想直接使用`antd`的`Form`组件，`Form.useForm<RequestMappingRule>()`里的`action`属性（是`Action`接口）应该是无法直接映射到表单的字段。如何解决呢？借鉴**适配器模式**，我引入了以下数据结构（有更好的做法请佬们教教！）：

```ts
export interface FlatRequestMappingRule {
  req: string
  checked: boolean
  action: RewriteType
  res: string
  newUA: string
  name: string
  value: string
}
```

然后在`Form`组件`onFinish`事件里将`FlatRequestMappingRule`翻译为`RequestMappingRule`，这样就能顺利写入`localStorage`啦。同理，从`localStorage`加载`RequestMappingRule`后，也要翻译为`FlatRequestMappingRule`才能顺利输入`Form`组件，渲染Edit对话框。两者相互转化的函数如下：

```ts
export function transformIntoRequestMappingRule (o: FlatRequestMappingRule): RequestMappingRule {
  const action: Action = (() => {
    if (o.action === RewriteType.REDIRECT) return { type: o.action, res: o.res };
    if (o.action === RewriteType.SET_UA) return { type: o.action, newUA: o.newUA };
    return { type: o.action, name: o.name, value: o.value };
  })();
  return {
    req: o.req,
    checked: o.checked,
    action
  };
}

export function transformIntoFlatRequestMappingRule (o: RequestMappingRule): FlatRequestMappingRule {
  const ret: FlatRequestMappingRule = {
    req: o.req,
    checked: o.checked,
    action: o.action.type,
    res: '',
    newUA: '',
    name: '',
    value: ''
  };
  return { ...ret, ...o.action };
}
```

缺点：

1. 对于新增的`Action`类型，不鼓励新增字段名，因为改动会更大，一般都是直接使用已有的`name, value`属性。这恰好和**`request-interceptor`**的源码一致。

## 插件核心功能：正式实现

赏析`ReRes`和`request-interceptor`两个插件的源码，并结合typescript进行数据结构设计后，我们就可以开始实现本插件的核心功能了。[代码传送门](https://github.com/Hans774882968/hans-reres/blob/main/src/background/background.ts)

模仿`ReRes`写一个加载数据结构的函数：

```ts
function getMapFromLocalStorage (): RequestMappingRule[] {
  const hansReResMap = window.localStorage.getItem(hansReResMapName);
  return hansReResMap ? JSON.parse(hansReResMap) : [];
}
```

值得注意的是，`ReRes`源码使用了

```js
window.addEventListener('storage', getLocalStorage, false);
```

在`popup, options`页面更新`localStorage`后更新数据结构，于是可以直接将`ReResMap`作为全局变量，理论上可以提高性能。但我这边尝试使用这行代码发现并没有及时更新，因此没有使用全局变量，而是在每个`listener`执行时都重新调用`getMapFromLocalStorage`加载。

因为测试是保证`background.ts`可靠性的唯一手段，所以为了**可测性**，我把大部分代码都移动到`src/utils.ts`了。期间遇到了一个typescript中才有的问题：`chrome`在测试环境中不存在，因此在**不mock的情况下**，只有将代码移动到其他文件，才能测试。但有些类型依赖`chrome`变量，如：`import HttpHeader = chrome.webRequest.HttpHeader;`。因为`HttpHeader`字段少，所以可以使用“鸭子类型”的技巧：

```ts
export interface MockHttpHeader {
  name: string;
  value?: string | undefined;
  binaryValue?: ArrayBuffer | undefined;
}
```

之后`HttpHeader`类型的变量都可以用`MockHttpHeader`代替，而两者是兼容的，所以ts不会报类型错误。

`onBeforeRequest`的入口，我模仿了`request-interceptor`的写法，优先级`cancel > redirect > queryParamsModified`。唯一不同点是，`processRequest`是一个纯函数：

```ts
const onBeforeRequestListener = (details: WebRequestBodyDetails) => {
  const hansReResMap = getMapFromLocalStorage();
  const actionDescription = processRequest(details.url, hansReResMap);

  const { redirectUrl = '', cancel, queryParamsModified } = actionDescription;
  // 约定优先级：cancel > redirect > queryParamsModified
  if (cancel) {
    return { cancel: true };
  }
  if (redirectUrl) {
    try {
      // Unchecked runtime.lastError: redirectUrl 'baidu.com/' is not a valid URL.
      // 针对Chrome的这种报错，我们只会尝试给出一个友好点的报错提示，不会擅自阻止报错的产生
      new URL(redirectUrl);
    } catch (e) {
      console.error(`Please make sure that redirectURL '${redirectUrl}' is a valid url when using hans-reres. For example, 'baidu.com' is not a valid url.`);
    }
    return redirectUrl === details.url ? {} : { redirectUrl };
  }
  if (queryParamsModified) {
    const { urlObject } = actionDescription;
    urlObject.search = actionDescription.queryParams.toString();
    return { redirectUrl: urlObject.toString() };
  }
  return {};
};

chrome.webRequest.onBeforeRequest.addListener(
  onBeforeRequestListener,
  { urls: ['<all_urls>'] },
  ['blocking']
);
```

TODO

## 参考资料

1. https://juejin.cn/post/7185920750765735973
2. stylelint规则文档：https://ask.dcloud.net.cn/article/36067
3. https://juejin.cn/post/7078330175145902110
4. `npm init @vitejs/app`到底干了什么：https://juejin.cn/post/6948202986573135908
5. https://www.cnblogs.com/cangqinglang/p/14761536.html
6. 使用ts-node运行ts脚本及踩过的坑：https://juejin.cn/post/6939538768911138823
7. https://stackoverflow.com/questions/27688804/how-do-i-debug-error-spawn-enoent-on-node-js
8. 使用commitlint规范commit格式：https://juejin.cn/post/6990307028162281508
9. https://juejin.cn/post/7139855730105942030
10. antd5定制主题官方文档：https://ant-design.gitee.io/docs/react/customize-theme-cn
11. `onBeforeRequest` MDN：https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/webRequest/onBeforeRequest