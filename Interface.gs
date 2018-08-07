function getLastVal(value) {
  return PropertiesService.getDocumentProperties().getProperty('lastCell');
}

function getComplianceStatus() {
  return PropertiesService.getDocumentProperties().getProperty('complianceStatus');
}

function getComplianceList() {
  return PropertiesService.getDocumentProperties().getProperty('nonCompliantRegex');
}

function getSensitiveList() {
  return PropertiesService.getDocumentProperties().getProperty('nonCompliantKeywords');
}

function tester() {
  console.log(getComplianceStatus());
}

function checkProperties() {
  console.log(PropertiesService.getDocumentProperties().getProperties());
}

function resetProps() {
  PropertiesService.getDocumentProperties().deleteAllProperties();
}