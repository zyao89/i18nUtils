const fs = require("fs");
const path = require("path");
const colors = require("colors");

/**
 * 解析json文件
 * @param {Object} opts 配置
 * @param {Map} keyMap 空Map对象
 * @param {Set} keySet 空Set对象
 * @param {Set} langSet 空Set对象
 */
exports.parseJson = (opts = {}, keyMap = new Map(), keySet = new Set(), langSet = new Set()) => {
  let jsonPath = opts.path || "";
  if (jsonPath == "") {
    throw new Error("path is null...");
  }
  let encoding = opts.encoding || "utf-8";
  let regex = opts.regex || false;

  const aLang = fs.readdirSync(jsonPath, encoding);
  console.log(aLang);
  aLang.forEach(lang => {
    langSet.add(lang);
    let szLangFilePath = path.join(jsonPath, lang);
    let aLangFiles = fs.readdirSync(szLangFilePath);

    aLangFiles.forEach(fileName => {
      let szJsonFilePath = path.join(szLangFilePath, fileName);
      let json = fs.readFileSync(szJsonFilePath, encoding);
      let objJson = JSON.parse(json);
      for (const key in objJson) {
        if (objJson.hasOwnProperty(key)) {
          keySet.add(key);
          const value = objJson[key];

          let obj = {};
          if (keyMap.has(key)) {
            obj = keyMap.get(key);
          } else {
            keyMap.set(key, obj);
          }
          if (!obj[lang] || !obj[lang].value) {
            obj[lang] = {
              value
            };
            if (regex && Object.prototype.toString.call(regex) === "[object RegExp]" && !regex.test(key)) {
              obj[lang].status = "warn";
              obj[lang].message = "The key does not conform to the specification.";
              obj[lang].log = `<${lang}>`.magenta + `[${key}]`.bold.yellow + " The key does not conform to the specification.".gray.italic;
            } else {
              obj[lang].status = "success";
              obj[lang].message = "Is OK.";
              obj[lang].log = `<${lang}>`.magenta + `[${key}]`.bold.green + " is OK.";
            }
          } else {
            let oldValue = obj[lang].value;
            // 警告
            if (Object.is(oldValue, value)) {
              obj[lang].status = "warn";
              obj[lang].message = `【${oldValue}】 vs 【${value}】`;
              obj[lang].log = `<${lang}>`.magenta + `[${key}]`.bold.yellow + ` ${colors.grey("Old")}: ${oldValue} ${colors.magenta("vs.")} ${colors.grey("New")}: ${value}`;
            } else {
              // 报错
              obj[lang].status = "error";
              obj[lang].message = `【 ${oldValue}】 vs 【${value}】`;
              obj[lang].log = `<${lang}>`.magenta + `[${key}]`.bold.underline.red + ` ${colors.grey("Old")}: ${oldValue} ${colors.magenta("vs.")} ${colors.grey("New")}: ${value}`;
            }
          }
          obj[lang].key = key;
          obj[lang].path = szJsonFilePath;
          obj[lang].log += `\n  -> Path: ${szJsonFilePath}`.italic.cyan;
        }
      }
    });
  });

  return {
    keySet,
    keyMap,
    langSet
  };
};


/**
 * 解析ExcelData
 * @param {Object} opts 配置
 * @param {Map} langMap 空Map对象
 * @param {Set} keySet 空Set对象
 * @param {Set} langSet 空Set对象
 */
exports.parseExcelData = (oJson = [], langMap = new Map(), keySet = new Set(), langSet = new Set()) => {
  if (oJson.length <= 0) {
    console.log("No Data...".yellow);
    return {
      keySet,
      langMap,
      langSet
    };
  }
  const aLangName = oJson[0];
  const aLangValue = Array.prototype.splice.call(oJson, 1);

  if (aLangName.length <= 0) {
    console.log("No Lang...".yellow);
    return {
      keySet,
      langMap,
      langSet
    };
  }

  aLangName.forEach((lang, index) => {
    if (index != 0) { // key
      langSet.add(lang);
      langMap.set(lang, {});
    }
  });

  aLangValue.forEach(aRow => {
    let obj = {};
    aRow.forEach((value, index) => {
      if (index == 0) { // key
        keySet.add(value);
        obj["__KEY__"] = value;
      } else {
        obj[aLangName[index]] = value;
      }
    });

    aLangName.forEach((lang, index) => {
      if (index != 0) { // key
        let t = langMap.get(lang);
        t[obj["__KEY__"]] = obj[lang] || "";
      }
    });
  });

  return {
    keySet,
    langMap,
    langSet
  };
};

/**
 * 转换为Excel输出数据格式
 * @param {Map} keyMap 数据
 * @param {Set} langSet 语言种类
 */
exports.toExcelData = (keyMap, langSet) => {
  let data = [];
  if (langSet) {
    let row = ["key", ...langSet];
    data.push(row);
  }
  for (let [key, value] of keyMap) {
    let row = [key];
    let bSuccess = false;
    for (let lang in value) {
      if (value.hasOwnProperty(lang)) {
        let element = value[lang];
        if (element.status === "success") {
          row.push(element.value);
          bSuccess = true;
        } else {
          row.push("");
          console.log(element.log);
        }
      }
    }
    if (bSuccess) {
      data.push(row);
    }
  }
  return data;
};

/**
 * 数据检测输出
 * @param {Map} keyMap 数据
 */
exports.checkDataFilterStatus = (keyMap = new Map(), status = /success/i) => {
  let aFileText = ["## 检测结果："];
  for (let value of keyMap.values()) {
    for (let lang in value) {
      if (value.hasOwnProperty(lang)) {
        let element = value[lang];
        if (status.test(element.status)) {
          // nothing
        } else {
          let text = `### <*${lang}*> [${element.status.toUpperCase()}] `;
          text += `\r\n - Key : \`${element.key}\``;
          text += `\r\n - Msg : \`${element.message}\``;
          text += `\r\n - Path: \`${element.path}\``;
          aFileText.push(text);
          console.log(element.log);
        }
      }
    }
  }
  if (aFileText.length <= 1) {
    aFileText.push("### 无");
  }
  return aFileText.join("\r\n\r\n");
};