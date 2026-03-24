/**
 * Rom Com Sundays — Google Apps Script
 *
 * Deploy as Web App:
 * 1. Open your Google Sheet
 * 2. Extensions > Apps Script
 * 3. Paste this code
 * 4. Deploy > New Deployment > Web App
 * 5. Execute as: Me, Access: Anyone
 * 6. Copy the URL and add it to your .env.local as APPS_SCRIPT_URL
 *
 * Sheet tabs:
 * - "Movies" with columns: id | title | year | score | date_watched | streaming_service | poster_url
 * - "Suggestions" with columns: title | reason | submitted_at
 */

function doGet(e) {
  var action = e.parameter.action;

  if (action === "getMovies") {
    return getMovies();
  }

  return ContentService
    .createTextOutput(JSON.stringify({ error: "Unknown action" }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var data = JSON.parse(e.postData.contents);

  if (data.action === "addSuggestion") {
    return addSuggestion(data.title, data.reason);
  }

  return ContentService
    .createTextOutput(JSON.stringify({ error: "Unknown action" }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getMovies() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Movies");
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var movies = [];

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (!row[0] && !row[1]) continue; // skip empty rows

    movies.push({
      id: row[0] || "",
      title: row[1] || "",
      year: row[2] || 0,
      score: row[3] || 0,
      dateWatched: row[4] ? formatDate(row[4]) : "",
      streamingService: row[5] || "",
      posterUrl: row[6] || ""
    });
  }

  return ContentService
    .createTextOutput(JSON.stringify({ movies: movies }))
    .setMimeType(ContentService.MimeType.JSON);
}

function addSuggestion(title, reason) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Suggestions");
  if (!sheet) {
    sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet("Suggestions");
    sheet.appendRow(["title", "reason", "submitted_at"]);
  }

  sheet.appendRow([title, reason || "", new Date().toISOString()]);

  return ContentService
    .createTextOutput(JSON.stringify({ success: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function formatDate(date) {
  if (date instanceof Date) {
    return date.toISOString().split("T")[0];
  }
  return String(date);
}
