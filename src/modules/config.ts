import * as vscode from "vscode";
import * as fse from "fs-extra";
import * as path from "path";
import * as Joi from "joi";
import { CONFIG_PATH } from "../constants";
import { reportError } from "../helper";
import { showTextDocument } from "../host";

const nullable = (schema) => schema.optional().allow(null);

const configScheme = {
  name: Joi.string(),

  context: Joi.string(),
  protocol: Joi.any().valid("sftp", "ftp", "local"),

  host: Joi.string().required(),
  port: Joi.number().integer(),
  connectTimeout: Joi.number().integer(),
  username: Joi.string().required(),
  password: nullable(Joi.string()),

  agent: nullable(Joi.string()),
  privateKeyPath: nullable(Joi.string()),
  passphrase: nullable(Joi.string().allow(true)),
  interactiveAuth: Joi.boolean(),
  algorithms: Joi.any(),
  sshConfigPath: Joi.string(),
  sshCustomParams: Joi.string(),

  secure: Joi.any().valid(true, false, "control", "implicit"),
  secureOptions: nullable(Joi.object()),
  passive: Joi.boolean(),

  remotePath: Joi.string().required(),
  uploadOnSave: Joi.boolean(),
  downloadOnOpen: Joi.boolean().allow("confirm"),

  ignore: Joi.array().min(0).items(Joi.string()),
  ignoreFile: Joi.string(),
  watcher: {
    files: Joi.string().allow(false, null),
    autoUpload: Joi.boolean(),
    autoDelete: Joi.boolean(),
  },
  concurrency: Joi.number().integer(),

  syncOption: {
    delete: Joi.boolean(),
    skipCreate: Joi.boolean(),
    ignoreExisting: Joi.boolean(),
    update: Joi.boolean(),
  },
  remoteTimeOffsetInHours: Joi.number(),

  remoteExplorer: {
    filesExclude: Joi.array().min(0).items(Joi.string()),
  },
};

const defaultConfig = {
  // common
  // name: undefined,
  remotePath: "./",
  uploadOnSave: false,
  downloadOnOpen: false,
  ignore: [],
  // ignoreFile: undefined,
  // watcher: {
  //   files: false,
  //   autoUpload: false,
  //   autoDelete: false,
  // },
  concurrency: 4,
  // limitOpenFilesOnRemote: false

  protocol: "sftp",

  // server common
  // host,
  // port,
  // username,
  // password,
  connectTimeout: 10 * 1000,

  // sftp
  // agent,
  // privateKeyPath,
  // passphrase,
  interactiveAuth: false,
  // algorithms,

  // ftp
  secure: false,
  // secureOptions,
  // passive: false,
  remoteTimeOffsetInHours: 0,
};

function mergedDefault(config) {
  return {
    ...defaultConfig,
    ...config,
  };
}

function getConfigPath(basePath) {
  return path.join(basePath, CONFIG_PATH);
}

export function validateConfig(config) {
  const { error } = Joi.validate(config, configScheme, {
    allowUnknown: true,
    convert: false,
    language: {
      object: {
        child: '!!prop "{{!child}}" fails because {{reason}}',
      },
    },
  });
  return error;
}

export function readConfigsFromFile(configPath): Promise<any[]> {
  return fse.readJson(configPath).then((config) => {
    const configs = Array.isArray(config) ? config : [config];
    return configs.map(mergedDefault);
  });
}

export function tryLoadConfigs(workspace): Promise<any[]> {
  const configPath = getConfigPath(workspace);
  return fse.pathExists(configPath).then(
    (exist) => {
      if (exist) {
        return readConfigsFromFile(configPath);
      }
      return [];
    },
    (_) => []
  );
}

// export function getConfig(activityPath: string) {
//   const config = configTrie.findPrefix(normalizePath(activityPath));
//   if (!config) {
//     throw new Error(`(${activityPath}) config file not found`);
//   }

//   return normalizeConfig(config);
// }

export function newConfig(basePath) {
  const configPath = getConfigPath(basePath);

  return fse
    .pathExists(configPath)
    .then((exist) => {
      if (exist) {
        return showTextDocument(vscode.Uri.file(configPath));
      }

      return fse
        .outputJson(
          configPath,
          {
            cookie:
              "cna=q9zcF2DOxCQCAXFiyRrPH9EA; EGG_SESS_ICONFONT=U8AXvqwdm-42-umGXGwgKq_Emj2wuVCkA87TjZ3dn6xm2T4whio3sIKoy4kjkuBSusLMQ-0MhcjWBE1FwhfGmMbpO9xPCEANAHIhoET_7kJ_pbscGV6FmfCh8QTWcmCiTv5lhhXEW-AxLfe1otCy-b_Xu6bubgtR7jh7j4tyTxJ_XW7McfoOosNIBZqkfhF6lYOumAhblsbAc3P-r462Jbtc1U_5HdLQzxnNiuPExJsHCFvO0c9fp_j1chbXIIw5N3LUI-xBnR3yl29OXy2HwK1hR6UGdzcVnJFUJ9SvpNIZ6vD3TQSGp7RRStj0k0JnYDk6oWJkAIZIpseZjDJetMLUXHrSkNoeX45n_5ZgLPUjEBTr1YKa2u-qH0dK4qxjL2WdvjkEJN-YijYlLxBaev2CBMtYrLDfE7yrfjxr3XdR71t-SmDeO8_r0aC1KVV3clOki5omH7d85mjro05mqyzzzRJ72bPRzFdDCMApE89hejPBdz3PvFx_O2wy9SkSrTRA5GDKERrzGh6D1pvbmtfBoy8FAepiLvqg6zQ_js-dGX8KDxv_ixrSTDrG-_iTDv_PUts-1LSsks_ftXk6u21JpvPU4A_T5KXjPA3abbuboNI0KVXJGywjdbZqfyS0AtSFwIjkWEE5WehVMOSeDMkSChFSSrQso911oEH_DrEWlpo-zmTUvTAMALzuksWQO5vbPC43bkx-39huf2f1Ll7Xl80dENdU7WKTd9pNGmkx98IEm-argwjf6rivYfNkttrK5TZY4-GlCtX9_WriVV4TTlTp-N0YoWeKigBMpFsoUhy3oa5NJmwfrZ-mbkYyQ2zjl9_RMNnprnjqaYjE8t9w92vrQLli6n7o3Dbk3CMLZJHsrUy1PIWIFDbkPgBzCd683alUnCzFHUeRR6GVUpZFql71we_6hbZVWT2SBl1KqIiY2w7jFhau74vxOgzwlrMmtAcRnL3A2ofhxas5jrSXUqSzn4CBBgzQ6OQU-B7SfHL5uPY_seTKB-iNYXhlM1mWGRam6FCWvbudNSJmX5OUcUHVZwciH6kjlSqM3J9yqeHnPiuWjjWw1042O2ii; trace=AQAAAHUuyBGgDg0AGslicSqQy1OTCZZz; ctoken=P2M3mJhnrzbUN71QsXqFHLcY; u=7799194; u.sig=nfB7ynvUi567QqwuOyHU5oKj20_C-cK9PDFLUb_M5rA; locale=zh-cn; xlly_s=1; isg=BCAgnaeGVWS2y9fjCyq7DAI68S7yKQTz8WyFwJoyxTublce_Qz3wgynnLT0VJbzL",
            pid: 2130451,
            path: "src/assets/iconfont",
            include: [
              "demo_index.html",
              "demo.css",
              "iconfont.css",
              "iconfont.js",
              "iconfont.json",
              "iconfont.ttf",
              "iconfont.woff",
              "iconfont.woff2",
            ],
          },
          { spaces: 2 }
        )
        .then(() => showTextDocument(vscode.Uri.file(configPath)));
    })
    .catch(reportError);
}
