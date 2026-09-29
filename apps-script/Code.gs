// Google Apps Script: принимает анкеты с сайта, пишет их в таблицу и присылает письмо.
// Инструкция — в apps-script/README.md
const NOTIFY_EMAIL = "alinasadykova2001@gmail.com";

function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  if (sheet.getLastRow() === 0) sheet.appendRow(["Дата", "ФИО", "Ответ"]);
  const name = (e.parameter["ФИО"] || "").toString().slice(0, 200);
  const answer = (e.parameter["Ответ"] || "").toString().slice(0, 50);
  sheet.appendRow([new Date(), name, answer]);
  MailApp.sendEmail(NOTIFY_EMAIL, "Посвящение в резиденты — новый ответ", name + " — " + answer);
  return ContentService.createTextOutput("ok");
}
