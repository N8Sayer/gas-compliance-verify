var DEFAULT_CONFIGURATION = {
  "Category1": {
    "segment" : "Restricted",
    "fname" : "CS-S",
    "ftext" : "Category:Restricted",
    "cname" : "Vigor", 
    "fnamefull": "Restricted - Distribution Restricted",
    "color": '#DC143C',
    "Keywords": ['QBR','Flash','Finpack','trade secrets','IP','Patent','Board of directors','formula','EVP'],
    "REGEX": ['SSN','Bank Routing','Patent','MRN','Passport','zip','ein'],
    "Rank": 1
  },
  "Category2": {
    "segment" : "Confidential", 
    "fname" : "CS-C", 
    "ftext" : "Category:Confidential",
    "cname" : "Vigor", 
    "fnamefull": "Confidential - Limited Distribution",
    "color": '#FF8C00',
    "Keywords": ['Credit card','Business proposal','Host address'],
    "REGEX": ['cc','demographic','PO number','Invoice','ip6','dl','ipan'],
    "Rank": 2    
  },
  "Category3": {
    "segment" : "Privileged",
    "fname" : "CS-A", 
    "ftext" : "Category:Privileged", 
    "cname" : "Vigor",
    "fnamefull": "Privileged Data",
    "color": '#1E90FF',
    "Keywords": ['privileged','Case Matter','case strategy'],
    "REGEX": ['ip4','words'],
    "Rank": 3
  },
  "Category4": {
    "segment" : "Internal", 
    "fname" : "CS-I", 
    "ftext" : "Category:Internal", 
    "cname" : "Vigor",
    "fnamefull": "Internal",
    "color": '#40E0D0',
    "Keywords": ['Business proposal','Meeting','SOP'], // Why do we have Business Proposal down here in Cat4 as well?
    "REGEX": ['phone'],
    "Rank": 4
  },
  "Category5": {
    "segment" : "Private", 
    "fname" : "CS-P", 
    "ftext" : "Category:Private", 
    "cname" : "Vigor",
    "fnamefull": "Non Business Information",
    "color": '#DC143C',
    "Keywords": ['Photos','Dinner','Gift'],
    "REGEX": ['restaurant','photo','pmail','words'],
    "Rank": 5
  }
};

var REGEX_PATTERNS = {
  "SSN": "\\d{3}-\\d{2}-\\d{4}",
  "Bank Routing": "^((0[0-9])|(1[0-2])|(2[1-9])|(3[0-2])|(6[1-9])|(7[0-2])|80)([0-9]{7})$",
  "zip": "^[0-9]{5}([-]?[0-9]{4})?$",
  "ip4": "^((25[0-5]|2[0-4]\\d|[01]?\\d{1,2})\\.){3}(25[0-5]|2[0-4]\\d|[01]?\\d{1,2})$",
  "cc": "^((4\\d{3})|(5[1-5]\\d{2})|(6011))-?\\d{4}-?\\d{4}-?\\d{4}|3[4,7]\\d{13}$",
  "dea": "^\\S{2}\\d{7}$",
  "pmail": "(\\W|^)[\\w.\\-]{0,25}@(yahoo|hotmail|gmail|rediff|outlook|msn|twc|spectrum)\\.com(\\W|$)",
  "po": "(\\W|^)po[#\\-]{0,1}\\s{0,1}\\d{2}[\\s-]{0,1}\\d{4}(\\W|$)",
//  "words": "(?i)(\\W|^)(baloney|darn|surgery|drat|genetics|genom|fooey|gosh|darnit|heck)(\\W|$)",
  "itin": "^(9\\d{2})([\\s\\-]?)([7]\\d|8[0-8])([\\s\\-]?)(\\d{4})$",
  "image": "([^\\s]+(?=\\.(jpg|gif|png))\\.\\2)",
  "ein": "^(0[1-6]|1[0-6]|2[0-7]|[345]\\d|[68][0-8]|7[1-7]|9[0-58-9])-?\\d{7}$",
  "phone": "\\+?\\d{1,4}?[-.\\s]?\\(?\\d{1,3}?\\)?[-.\\s]?\\d{1,4}[-.\\s]?\\d{1,4}[-.\\s]?\\d{1,9}",
  "swift": "[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?",
  "ipan": "^([a-zA-Z]{5})(\\d{4})([a-zA-Z]{1})$"
}

function getDefaultConfiguration(){
  return DEFAULT_CONFIGURATION;
}