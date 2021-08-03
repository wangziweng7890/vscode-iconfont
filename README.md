# auto download iconfont extension for VS Code

下载解压iconfont到本地指定目录

## Usage

使用只需两步，

**一.初始化配置：**

1. `Ctrl+Shift+P` on Windows/Linux or `Cmd+Shift+P` on Mac open command palette, run `iconfont: config` command.
2. A basic configuration file will appear named `iconfont.json` under the `.vscode` directory.  Edit the parameters to match your setup.

For instance: 

```json

{
  "cookie":
    "cna=q9zcF2DOxCQCAXFiyRrPH9EA;xxxxxxxxxx;xxxxxxxxxxxxx",
  "pid": 2130451,
  "path": "src/assets/iconfont",
  "include": [
    "demo_index.html",
    "demo.css",
    "iconfont.css",
    "iconfont.js",
    "iconfont.json",
    "iconfont.ttf",
    "iconfont.woff",
    "iconfont.woff2",
  ],
}

```
- cookie 需要你去iconfont下载接复制一份
- pid是你的项目id,需要在iconfont接口复制pid
- path是本地iconfont的文件夹
- include可以配置你所需要下载的文件

当配置完成之后执行第二步下载

**二.下载最新iconfont：**

`Ctrl+Shift+P` on Windows/Linux or `Cmd+Shift+P` on Mac open command palette, run `iconfont: download`command.