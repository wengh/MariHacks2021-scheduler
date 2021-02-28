function prompt(msg) {
  let ui = SpreadsheetApp.getUi();
  let response = ui.prompt(msg);
  if (response.getSelectedButton() == ui.Button.OK) {
    return response.getResponseText();
  } else {
    return undefined;
  }
}

function createNewDataset() {
  var name = prompt('Enter name of new pair of input and output:');
  if (name == undefined) return;
  
  
  var spreadsheet = SpreadsheetApp.getActive();
  spreadsheet.setActiveSheet(spreadsheet.getSheetByName('INPUT: Mandarin'), true);
  spreadsheet.duplicateActiveSheet();
  spreadsheet.getActiveSheet().setName('INPUT: ' + name);
  
  spreadsheet.getRange('B2').activate();
  spreadsheet.getCurrentCell().setValue(name);
  spreadsheet.getRange('C2:I').activate();
  spreadsheet.getActiveRangeList().clear({contentsOnly: true, skipFilteredRows: true});
  spreadsheet.getRange('A3:B').activate();
  spreadsheet.getActiveRangeList().clear({contentsOnly: true, skipFilteredRows: true});
  spreadsheet.getRange('A2').activate();
  spreadsheet.getCurrentCell().setValue('lonely');
  
  
  spreadsheet.setActiveSheet(spreadsheet.getSheetByName('OUTPUT: Mandarin'), true);
  spreadsheet.duplicateActiveSheet();
  spreadsheet.getActiveSheet().setName('OUTPUT: ' + name);
  
  spreadsheet.getRange('A1:H1').activate();
  spreadsheet.getCurrentCell().setFormula('=\'INPUT: ' + name + '\'!K$1');
  spreadsheet.getRange('B3').activate();
  spreadsheet.getCurrentCell().setFormula('=MAKE_SCHEDULE(\'INPUT: ' + name + '\'!K$2:S,2,$N$3:$N$6)');
  spreadsheet.getRange('A12:H12').activate();
  spreadsheet.getCurrentCell().setFormula('=\'INPUT: ' + name + '\'!U$1');
  spreadsheet.getRange('B14').activate();
  spreadsheet.getCurrentCell().setFormula('=MAKE_SCHEDULE(\'INPUT: ' + name + '\'!U$2:AC,2,$N$3:$N$6)');
  spreadsheet.getRange('A23:H23').activate();
  spreadsheet.getCurrentCell().setFormula('=\'INPUT: ' + name + '\'!AE$1');
  spreadsheet.getRange('B25').activate();
  spreadsheet.getCurrentCell().setFormula('=MAKE_SCHEDULE(\'INPUT: ' + name + '\'!AE$2:AM,2,$N$3:$N$6)');
  spreadsheet.getRange('A34:H34').activate();
  spreadsheet.getCurrentCell().setFormula('=\'INPUT: ' + name + '\'!AO$1');
  spreadsheet.getRange('B36').activate();
  spreadsheet.getCurrentCell().setFormula('=MAKE_SCHEDULE(\'INPUT: ' + name + '\'!AO$2:AW,2,$N$3:$N$6)');
  spreadsheet.getRange('A45:H45').activate();
  spreadsheet.getCurrentCell().setFormula('=\'INPUT: ' + name + '\'!AY$1');
  spreadsheet.getRange('B47').activate();
  spreadsheet.getCurrentCell().setFormula('=MAKE_SCHEDULE(\'INPUT: ' + name + '\'!AY$2:BG,2,$N$3:$N$6)');
  
  
  spreadsheet.setActiveSheet(spreadsheet.getSheetByName('Live Dashboard'), true);
  
  var lastRow = spreadsheet.getLastColumn();
  var letter = columnToLetter(lastRow + 1);
  spreadsheet.getRange(letter + '1').activate();
  spreadsheet.getRange('D1:D6').copyTo(spreadsheet.getActiveRange(), SpreadsheetApp.CopyPasteType.PASTE_NORMAL, false);
  spreadsheet.getRange(letter + '1').activate();
  spreadsheet.getCurrentCell().setValue(name);
  spreadsheet.getRange(letter + '2').activate();
  spreadsheet.getCurrentCell().setFormula('=ArrayFormula(\'OUTPUT: ' + name + '\'!$L$22:$L$26)\n');
  
  
  alert('Successfully created new pair of input and output: ' + name);
};
