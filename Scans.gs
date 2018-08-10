function scanFile() {
  var sheets = SpreadsheetApp.getActiveSpreadsheet().getSheets();
  sheets.forEach(function(sheet) {
    var range = sheet.getDataRange();
    scanRange(range);
  });
}

function test() {
  var range = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Requirements').getRange('D12:D13');
  scanRange(range);
}

function scanRange(range) {
  var ncList = PropertiesService.getDocumentProperties().getProperty('nonCompliantObjects') ? JSON.parse(PropertiesService.getDocumentProperties().getProperty('nonCompliantObjects')) : [];
  var values = range.getDisplayValues();
  var colors = range.getBackgrounds();
  var sheetName = range.getSheet().getSheetName();
  var rangeInCompliance = true;
  var baseRow = range.getRow();
  var baseCol = range.getColumn();
  values.forEach(function(row, rowIndex) {
    row.forEach(function(cell, colIndex) {
      var statusObj = checkCompliance(cell);
      var nonComplianceObj = {
        location: {
          sheet: sheetName,
          row: (baseRow + rowIndex),
          col: (baseCol + colIndex)
        }
      };
      if (rangeInCompliance) {
        rangeInCompliance = statusObj.inCompliance;
      }
      console.log(statusObj);
      if (statusObj.inCompliance) {
        var isInList = false;
        ncList.forEach(function(obj, index) {
          if (obj.location.sheet == nonComplianceObj.location.sheet && obj.location.row == nonComplianceObj.location.row && obj.location.col == nonComplianceObj.location.col) {
            isInList = index;
          }
        });
        if (typeof isInList == 'number' && ncList.length > 1) {
          if (ncList.length > 1) {          
            ncList.splice(isInList,1);
          } else {         
            ncList = [];
          }
          colors[rowIndex][colIndex] = null;
        }
      } else {
        colors[rowIndex][colIndex] = statusObj.failed.color;
        var categories = Object.keys(statusObj.failed.categories).sort(function(a,b) {
          var objA = statusObj.failed.categories[a];
          var objB = statusObj.failed.categories[b];
          if (objA.rank === objB.rank) {
            return 0;
          } else {
            return objA.rank > objB.rank ? 1 : -1;
          }
        });
        nonComplianceObj.keywords = [];
        nonComplianceObj.regex = [];
        categories.forEach(function(cat) {
          var regex = statusObj.failed.categories[cat].regex;
          if (regex) {
            regex.forEach(function(regName) {
              nonComplianceObj.regex.push([regName, statusObj.failed.categories[cat].rank]);
            });
          }
          var keywords = statusObj.failed.categories[cat].keywords;
          if (keywords) {
            keywords.forEach(function(keyword) {
              nonComplianceObj.keywords.push([keyword, statusObj.failed.categories[cat].rank]);
            });
          }
        });
//        console.log(nonComplianceObj);
        var ncListCheck = false;
        ncList.forEach(function(obj) {
          if (obj.location.sheet == nonComplianceObj.location.sheet && obj.location.row == nonComplianceObj.location.row && obj.location.col == nonComplianceObj.location.col) {
            obj = nonComplianceObj;
            ncListCheck = true;
          }
        });
        if (!ncListCheck) {
          ncList.push(nonComplianceObj);
        }
      }
    });
  });    
  range.setBackgrounds(colors);
  PropertiesService.getDocumentProperties().setProperty('nonCompliantObjects', JSON.stringify(ncList));
  updateNonCompliantFields();
}

function checkCompliance(cellVal) {
  var obj = {
    inCompliance: true,
    passed: {
      categories: []
    },
    failed: {
      categories: {
        
      }
    }
  };
  var config = getDefaultConfiguration();
  var categories = Object.keys(config).sort(function(a,b) {
    if (config[a].Rank === config[b].Rank) {
      return 0;
    } else {
      return config[a].Rank > config[b].Rank ? 1 : -1;
    }
  });
  console.log(categories);
  categories.forEach(function(categoryName) {
    var category = config[categoryName];  
    var failedKeywords = [];
    category.Keywords.forEach(function(keyword) {
      var match = doesKeywordMatch(cellVal, keyword);
      if (match) {
        failedKeywords.push(keyword);
      }
    });
    var failedRegex = [];
    category.REGEX.forEach(function(regStr) {
      var regexPattern = REGEX_PATTERNS[regStr];
      if (regexPattern) {
        var match = doesRegexMatch(cellVal,regexPattern);
        if (match) {
          failedRegex.push(regStr);
        }
      }
    });
    if (failedKeywords.length || failedRegex.length) {
      obj.inCompliance = false;
      // Prioritize Regex over Keywords for coloring.
      if (failedRegex.length) {
        obj.failed['color'] = category.regexColor;
      } else {
        obj.failed['color'] = category.keywordColor;
      }
      obj.failed.categories[category.segment] = obj.failed.categories[category.segment] ? obj.failed.categories[category.segment] : {};
      obj.failed.categories[category.segment]['keywords'] = failedKeywords;
      obj.failed.categories[category.segment]['regex'] = failedRegex;
      obj.failed.categories[category.segment]['rank'] = category.Rank;
    }
  });
  return obj;  
}

function doesKeywordMatch(strToMatch, keyword) {
  strToMatch = strToMatch.trim();
  if (keyword) {
    if (strToMatch.toLowerCase() == keyword.toLowerCase()) {
      return true;
    } else {
      var regex = new RegExp('^.*?(?:\\b|_)(' + keyword + ')(?:\\b|_).*?$','mi');
      var match = regex.exec(strToMatch);
      if (match) {
        return true;
      }
    }
  }
  return false;
}

function doesRegexMatch(strToMatch, regexStr) {
  strToMatch = strToMatch.trim();
  var regex = new RegExp(regexStr,'gmi');
  var match = strToMatch.match(regex);
  if (match) {
    return true;
  }
  return false;
}

function updateNonCompliantFields() {
  var ncObjs = JSON.parse(PropertiesService.getDocumentProperties().getProperty('nonCompliantObjects'));
  PropertiesService.getDocumentProperties().setProperty('complianceStatus', ncObjs.length > 0 ? 'No' : 'Yes');
  var keywordList = [];
  var regexList = [];
  ncObjs.forEach(function(obj) {
    if (obj.keywords) {
      var keywords = obj.keywords.sort(function(a,b) {
        if (a[1] === b[1]) {
          return 0;
        } else {
          return a[1] > b[1] ? 1 : -1;
        }
      });
      keywordList = keywordList.length ? keywordList.concat(keywords) : keywords;
    }
    if (obj.regex) {
      var regexes = obj.regex.sort(function(a,b) {
        if (a[1] === b[1]) {
          return 0;
        } else {
          return a[1] > b[1] ? 1 : -1;
        }
      });
      regexList = regexList.length ? regexList.concat(regexes) : regexes;
    }
  });
  keywordList.sort(function(a,b) {
    if (a[1] === b[1]) {
      return 0;
    } else {
      return a[1] > b[1] ? 1 : -1;
    }
  });
  regexList.sort(function(a,b) {
    if (a[1] === b[1]) {
      return 0;
    } else {
      return a[1] > b[1] ? 1 : -1;
    }
  });
  keywordList = keywordList.map(function(row) {
    return row[0];
  });
  regexList = regexList.map(function(row) {
    return row[0];
  });
  PropertiesService.getDocumentProperties().setProperty('nonCompliantKeywords', JSON.stringify(keywordList));
  PropertiesService.getDocumentProperties().setProperty('nonCompliantRegex', JSON.stringify(regexList));
}