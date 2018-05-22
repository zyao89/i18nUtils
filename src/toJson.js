const xlsx = require("node-xlsx");
const config = require("../config");
const path = require("path");
const fs = require("fs");

const ParseUtil = require("../src/parse");

const jsonPath = path.resolve(__dirname, config.jsonPath);
const excelPath = path.resolve(__dirname, config.excelPath);
const fileName = path.join(excelPath, config.fileName);

module.exports = function () {
  // 读xlsx
  const aJson = xlsx.parse(fileName);

  aJson.forEach(oJson => {
    const sheetName = oJson.name;
    const aData = oJson.data;

    const {keySet, langMap, langSet} = ParseUtil.parseExcelData(aData);

    langSet.forEach(lang => {
      let langPath = path.join(jsonPath, lang);
      if (!fs.existsSync(langPath)) {
        fs.mkdirSync(langPath);
      }

      let oJson = langMap.get(lang);
      let filePath = path.join(langPath, `${sheetName}.json`)
      console.log(`Create Success! ${filePath.red}`);
      fs.writeFileSync(filePath, JSON.stringify(oJson));
    });
  });
};