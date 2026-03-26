// ============================================================
// GOOGLE APPS SCRIPT - Phishing Simulation Backend
// ============================================================
// 1. Va dans ton spreadsheet > Extensions > Apps Script
// 2. Colle ce code (remplace tout)
// 3. Deployer > Gerer les deploiements > crayon > Nouvelle version
// 4. Acces : "Tout le monde" > Deployer
// ============================================================

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSheet();
    var data = JSON.parse(e.postData.contents);

    sheet.appendRow([
      data.type || '',
      data.timestamp || new Date().toISOString(),
      data.userAgent || '',
      data.source || ''
    ]);

    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Data saved'
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  var params = e.parameter;

  // Si "type" est present dans l'URL, c'est un envoi de donnees (depuis index.html)
  if (params && params.type) {
    try {
      var sheet = SpreadsheetApp.getActiveSheet();

      sheet.appendRow([
        params.type || '',
        params.timestamp || new Date().toISOString(),
        params.userAgent || '',
        params.source || ''
      ]);

      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        message: 'Data saved'
      })).setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'error',
        message: error.toString()
      })).setMimeType(ContentService.MimeType.JSON);
    }
  }

  // Sinon, c'est une lecture (admin dashboard)
  try {
    var sheet = SpreadsheetApp.getActiveSheet();
    var data = sheet.getDataRange().getValues();

    var headers = data[0];
    var rows = data.slice(1);

    var json = rows.map(function(row) {
      var obj = {};
      headers.forEach(function(header, index) {
        obj[header] = row[index];
      });
      return obj;
    });

    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      data: json
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
