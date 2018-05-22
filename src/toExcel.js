const xlsx = require("node-xlsx");
const config = require("../config");
const path = require("path");
const fs = require("fs");

const ParseUtil = require("../src/parse");

const jsonPath = path.resolve(__dirname, config.jsonPath);
const excelPath = path.resolve(__dirname, config.excelPath);
const fileName = path.join(excelPath, config.fileName);

const createExcelData = (sheetName = "lang", { keyMap = new Map(), keySet, langSet } = { }) => {
  let oData = ParseUtil.toExcelData(keyMap, langSet);
  return {
    name: sheetName,
    data: oData
  };
};

module.exports = function () {
  const opts = {
    path: jsonPath,
    encoding: "utf-8", // 文件编码格式
    regex: /^k.*/, // key关键字规则
  };
  let oResult = ParseUtil.parseJson(opts);
  // 
  const langData = createExcelData("lang", oResult);
  const EmptyData = createExcelData("new", { langSet: oResult.langSet });
  // 写xlsx
  const buffer = xlsx.build([langData, EmptyData]);
  fs.writeFile(fileName, buffer, function(err) {
    if (err) throw err;
    console.log("Write to xls has finished");
  });
};