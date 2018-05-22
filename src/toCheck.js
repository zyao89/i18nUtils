const config = require("../config");
const path = require("path");
const fs = require("fs");
const moment = require("moment");

const ParseUtil = require("../src/parse");

const jsonPath = path.resolve(__dirname, config.jsonPath);
const resultPath = path.resolve(__dirname, config.resultPath);

module.exports = function () {
  const opts = {
    path: jsonPath,
    encoding: "utf-8", // 文件编码格式
    regex: /^k.*/, // key关键字规则
  };
  let { keyMap } = ParseUtil.parseJson(opts);

  let fileText = ParseUtil.checkDataFilterStatus(keyMap);
  
  let fileName = `Result_${moment().format("YYYY-MM-DD-HH-mm-SS")}.md`;
  fs.writeFile(path.join(resultPath, fileName), fileText, function(err) {
    if (err) throw err;
    console.log("Write to result has finished");
  });

};