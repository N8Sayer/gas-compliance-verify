/*******************************************************************************************
* Creates a menu entry - in the Google Sheets UI when the document is opened.
* @param {object} e The event parameter for a simple onOpen trigger. 
*********************************************************************************************/
var ui = SpreadsheetApp.getUi();

function onOpen(e) {
  Logger.log(e);
  // Setup Menus
  if (e && e.authMode == ScriptApp.AuthMode.NONE) {
    var menu = ui.createMenu('Check Not Installed');
  } else {
    var menu = ui.createMenu('Auto Help');  
    sidebarOnOpen();
  }
  menu.addItem('Sheets Help', 'sidebarOnOpen').addToUi();
  
//  scanFile();
}

function onEdit(e) {
  var value = e.value;
  scanRange(e.range);
  PropertiesService.getDocumentProperties().setProperty('lastCell', value);
}

function onInstall(e) {
  onOpen(e);
  installTriggers();
}

/************************************************************************
* Function (Trigger) to open the sidebar when user opens the file
**************************************************************************/

function sidebarOnOpen() {
  Logger.log('Open Sidebar');
  try {
    var html = HtmlService.createHtmlOutputFromFile("Main").setTitle('Sheets Help');
    ui.showSidebar(html);
  } catch(err) {
    Logger.log(err);
  }
}

/*********************************************************
* Function to display the sidebar
*********************************************************/

function showSidebar() {
  var sidebar = HtmlService.createTemplateFromFile('Main').evaluate().setTitle('Sheets Help');
  
  ui.showSidebar(sidebar);
}

function installTriggers() {
  ScriptApp.newTrigger('onOpen').forSpreadsheet(SpreadsheetApp.getActiveSpreadsheet()).onOpen().create();
  ScriptApp.newTrigger('onEdit').forSpreadsheet(SpreadsheetApp.getActiveSpreadsheet()).onEdit().create();
}