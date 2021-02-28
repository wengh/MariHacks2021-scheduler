/**
 * @OnlyCurrentDoc
 */

// https://stackoverflow.com/a/21231012
function columnToLetter(column)
{
  var temp, letter = '';
  while (column > 0)
  {
    temp = (column - 1) % 26;
    letter = String.fromCharCode(temp + 65) + letter;
    column = (column - temp - 1) / 26;
  }
  return letter;
}

function alert(msg) {
//  SpreadsheetApp.getUi().alert(msg);
  SpreadsheetApp.getActiveSpreadsheet().toast("", msg, -1);
}

function getMonday(date) {
  let day = date.getDay() || 7;  
  if( day !== 1 ) 
    date.setHours(-24 * (day - 1));
  return date;
}

function sameDay(d1, d2) {
  return (d1 instanceof Date)
      && (d2 instanceof Date)
      && d1.getFullYear() === d2.getFullYear()
      && d1.getMonth()    === d2.getMonth()
      && d1.getDate()     === d2.getDate();
}

function onOpen() {
  let ui = SpreadsheetApp.getUi();
  let mainMenu = ui.createMenu("Scheduler");
  mainMenu.addItem("Manually trigger refresh", "refresh");
  mainMenu.addItem("Create new pair of input and output", "createNewDataset");
  mainMenu.addToUi();
  refresh();
}

const maxHeight = 50;
const weeksToKeep = 5;

function createReference(sheet, c1) {
  for (r = 1; r <= maxHeight; r++) {
    for (c = 1; c <= 9; c++) {
      sheet.getRange(r, c + c1 - 1).setFormula('=$' + columnToLetter(c) + '$' + r.toString());
    }
  }
}

function copy(sheet, c1, c2) {
  sheet.getRange(1, c1, maxHeight, 9).copyTo(sheet.getRange(1, c2));
}

function createNewDataset() {
  prompt('Enter name of new pair:');
}

function refresh() {
  alert('Refreshing...');
  let sheets = SpreadsheetApp.getActive().getSheets();
  refreshed = false;
  sheets.forEach(sheet => {
    if (sheet.getName().includes('INPUT')) {
      refreshed |= refreshSheet(sheet);
    }
  });
  if (refreshed) {
    alert('Updated, ready for new week!');
  } else {
    alert('No change.');
  }
}

function refreshSheet(sheet) {
  let monday = getMonday(new Date());
  let offset = weeksToKeep;
  for (i = 0; i < weeksToKeep; i++) {
    if (sameDay(monday, sheet.getRange(1, i * 10 + 11).getValue())) {
      offset = i;
      break;
    }
  }
  if (offset == 0) {
    return false; // no change
  }
  
  for (i = offset; i < weeksToKeep; i++) {
    copy(sheet, i * 10 + 11, (i - offset) * 10 + 11);
  }
  date = monday;
  for (i = 0; i < 5; i++) {
    if (i >= (weeksToKeep - offset)) {
      let col = i * 10 + 11;
      createReference(sheet, col);
      sheet.getRange(1, col).setValue(date);
    }
    date.setDate(date.getDate() + 7); // add 7 days
  }
  SpreadsheetApp.flush();
  return true;
}
