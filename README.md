## i18n 多语言处理工具

> 可对多国语言进行转换，输入输出。并可检测 key 关键字的正确性与重复关键字，可输出报告结果。

### First Step
```sh
npm install
```

### JSON to Excel
```js
const i18nUtils = require("../i18nUtils");
i18nUtils.toExcel();
```


### Excel to JSON
```js
const i18nUtils = require("../i18nUtils");
i18nUtils.toJson();
```


### JSON 中 Key 值检测
```js
const i18nUtils = require("../i18nUtils");
i18nUtils.toCheck();
```


### config 配置使用
```js
// config/index.js
{
  jsonPath: "../json", // JSON根路径
  excelPath: "../excel", // Excel根路径
  resultPath: "../result", // 检查结果根路径
  fileName: "i18n_字符串.xlsx", // Excel文件名
}
```
