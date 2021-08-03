import { COMMAND_DOWNLOAD } from "../constants";
import { uriFromfspath } from "./shared";
import { checkFileCommand } from "./abstract/createCommand";
import { getWorkspaceFolders } from "../host";
import { CONFIG_PATH } from "../constants";
import * as fse from "fs-extra";
import * as fs from "fs";
import * as path from "path";
import axios from "axios";
import { zip } from "compressing";

export default checkFileCommand({
  id: COMMAND_DOWNLOAD,
  getFileTarget: uriFromfspath,

  async handleFile() {
    await downloadHandle();
  },
});

async function downloadHandle() {
  const workspaceFolders = getWorkspaceFolders(); // 获取工作路径
  let workspaceFolder = "";
  if (workspaceFolders) {
    workspaceFolder = workspaceFolders[0].uri.fsPath;
  } else {
    return new Error("请输入本地iconfont路径");
  }
  const configPath = path.join(workspaceFolder, CONFIG_PATH); // 获取配置
  const config = await fse.readJSONSync(configPath);
  const targetPath = path.join(workspaceFolder, config.path); // 获取iconfont解压目的地址
  const pathExistsSync = fse.pathExistsSync(targetPath);
  if (!pathExistsSync) {
    await fse.mkdirpSync(targetPath);
  }
  let res = await downLoadZip(config); // 下载iconfont
  const tempPath = path.join(__dirname, "../", "tempDownLoadPath");
  await zip.uncompress(res.data as fs.ReadStream, tempPath); // 解压文件到指定目录并返回目录名
  const zipPath = await listDir(tempPath);
  await moveFile(path.join(tempPath, zipPath[0]), targetPath, config);
  await fse.emptyDirSync(tempPath); // 清空临时目录
  console.log("download iconfont success");
}

// 到阿里图标下载图标
async function downLoadZip(config): Promise<any> {
  const DOWNLOAD_URL = "https://www.iconfont.cn/api/project/download.zip";
  return axios.get(DOWNLOAD_URL, {
    responseType: "stream",
    headers: {
      cookie: config.cookie,
    },
    params: {
      pid: config.pid,
      ctoken: config.ctoken,
    },
  });
}

function listDir(path): Promise<any> {
  return new Promise((resolve, reject) => {
    fs.readdir(path, (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      // 把mac系统下的临时文件去掉
      if (data && data.length > 0 && data[0] === ".DS_Store") {
        data.splice(0, 1);
      }
      resolve(data);
    });
  });
}

// 移动文件到指定目录
async function moveFile(srcFolder, targetPath, options) {
  let files = await listDir(srcFolder);
  for (let index = 0; index < files.length; index++) {
    let fileName = files[index];
    let srcFile = path.join(srcFolder, fileName);
    let destFile = path.join(targetPath, fileName);
    if (options.include && options.include.includes(fileName)) {
      // 过滤掉不需要的文件
      await fse.moveSync(srcFile, destFile, {
        // 从临时目录移动到目的地址
        overwrite: true,
      });
    }
  }
}
