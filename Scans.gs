function scanFile() {
  var sheets = SpreadsheetApp.getActiveSpreadsheet().getSheets();
  sheets.forEach(function(sheet) {
    var range = sheet.getDataRange();
    scanRange(range);
  });
}

function test() {
  var range = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Requirements').getRange('D4:D5');
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
      console.log(nonComplianceObj);
      if (statusObj.inCompliance) {
        var isInList = false;
        ncList.forEach(function(obj, index) {
          if (obj.location.sheet == nonComplianceObj.location.sheet && obj.location.row == nonComplianceObj.location.row && obj.location.col == nonComplianceObj.location.col) {
            isInList = index;
          }
        });
        console.log([isInList, ncList.length]);
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
          if (a === b) {
            return 0;
          } else {
            return a > b ? 1 : -1;
          }
        });
        nonComplianceObj.keywords = [];
        nonComplianceObj.regex = [];
        categories.forEach(function(cat) {
          var regex = statusObj.failed.categories[cat].regex.sort(function(a,b) {
            if (a[0] === b[0]) {
              return 0;
            } else {
              return a[0] > b[0] ? 1 : -1;
            }
          });
          regex.forEach(function(line) {
            nonComplianceObj.regex.push(line[0]);            
          });
          var keywords = statusObj.failed.categories[cat].keywords.sort(function(a,b) {
            if (a[0] === b[0]) {
              return 0;
            } else {
              return a[0] > b[0] ? 1 : -1;
            }
          });
          keywords.forEach(function(line) {
            nonComplianceObj.keywords.push(line[0]);            
          });
        });
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

function checkCompliance(val) {
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
  Object.keys(config).forEach(function(categoryName) {
    var category = config[categoryName];    
    var keywordArr = category.Keywords;
    var keywords = [];
    keywordArr.forEach(function(keyword) {
      keywords.push([keyword, keyword]);
    });
    var failedKeywords = checkMatches(val,keywords);
    var regexArr = category.REGEX;
    var regexes = [];
    regexArr.forEach(function(regStr) {
      if (REGEX_PATTERNS[regStr]) {
        regexes.push([REGEX_PATTERNS[regStr],regStr]);
      }
    });
//    console.log([keywords, regexes]);
    var failedRegex = checkMatches(val,regexes);
    if (failedKeywords.length > 0 || failedRegex.length > 0) {
      obj.inCompliance = false;
      obj.failed['type'] = obj.failed['type'] ? obj.failed['type'].push(category.segment) : [category.segment];
      obj.failed['color'] = obj.failed['color'] ? obj.failed['color'] : category.color;
      obj.failed.categories[categoryName] = obj.failed.categories[categoryName] ? obj.failed.categories[categoryName] : {};
      obj.failed.categories[categoryName]['keywords'] = failedKeywords;
      obj.failed.categories[categoryName]['regex'] = failedRegex;
    }
  });
  return obj;  
}

function checkMatches(str, matchArr) {
  var matches = [];
  matchArr.forEach(function(matchStr) {
//    console.log(matchStr);
    if (matchStr[0]) {
      if (typeof matchStr[0] == 'object') {
        var regex = new RegExp(matchStr[0],'gmi');
      } else {
        if (str.match(/\W/g)) {
          var regex = new RegExp('\W' + keyword + '\W','gmi');
        } else {
          var regex = new RegExp('^'+ matchStr[0] +'$','gmi');          
        }
      }
      var match = str.match(regex);
      if (match) {
        matches.push([matchStr[1], match.join(', ')]);
      }
    }
  });
  return matches;
}

function updateNonCompliantFields() {
  var ncObjs = JSON.parse(PropertiesService.getDocumentProperties().getProperty('nonCompliantObjects'));
  PropertiesService.getDocumentProperties().setProperty('complianceStatus', ncObjs.length > 0 ? 'No' : 'Yes');
  var keywordList = [];
  var regexList = [];
  ncObjs.forEach(function(obj) {
    var keywords = obj.keywords;
    var regexes = obj.regex;
    keywords.forEach(function(keyword) {
      Object.keys(DEFAULT_CONFIGURATION).forEach(function(key) {
        var category = DEFAULT_CONFIGURATION[key];
        var catKeywords = category.Keywords;
        if (catKeywords.indexOf(keyword) !== -1) {
          keywordList.push([category.rank,keyword]);
        }
      });
    });
    regexes.forEach(function(regex) {
      Object.keys(DEFAULT_CONFIGURATION).forEach(function(key) {
        var category = DEFAULT_CONFIGURATION[key];
        var catRegex = category.REGEX;
        if (catRegex.indexOf(regex) !== -1) {
          regexList.push([category.Rank,regex]);
        }
      });
    });
  });
  keywordList.sort(function(a,b) {
    if (a[1] === b[1]) {
      return 0;
    } else {
      return a[1] > b[1] ? 1 : -1;
    }
  }).sort(function(a,b) {
    if (a[0] === b[0]) {
      return 0;
    } else {
      return a[0] > b[0] ? 1 : -1;
    }
  });
  regexList.sort(function(a,b) {
    if (a[1] === b[1]) {
      return 0;
    } else {
      return a[1] > b[1] ? 1 : -1;
    }
  }).sort(function(a,b) {
    if (a[0] === b[0]) {
      return 0;
    } else {
      return a[0] > b[0] ? 1 : -1;
    }
  });
  keywordList = keywordList.map(function(row) {
    return row[1];
  });
  regexList = regexList.map(function(row) {
    return row[1];
  });
  PropertiesService.getDocumentProperties().setProperty('nonCompliantKeywords', JSON.stringify(keywordList));
  PropertiesService.getDocumentProperties().setProperty('nonCompliantRegex', JSON.stringify(regexList));
}