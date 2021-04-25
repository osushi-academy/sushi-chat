import { google } from "googleapis";

const sheets = google.sheets({
  version: "v4",
  auth: "hoge",
});

sheets.spreadsheets.values.get(
  {
    spreadsheetId: "1vlTCapH2_R_h1FtEzrkUAIWQuMCHEs7npi_Izq0nuYY",
    range: "シート1!A2:E",
  },
  (err, res) => {
    if (err) return console.log("The API returned an error: " + err);
    if (!!res) {
      const rows = res.data.values;
      if (!!rows && rows.length) {
        console.log("Name, Major:");
        // Print columns A and E, which correspond to indices 0 and 4.
        rows.map((row) => {
          console.log(`${row[0]}, ${row[4]}`);
        });
      } else {
        console.log("No data found.");
      }
    }
  }
);

sheets.spreadsheets.values.append({
  spreadsheetId: "1vlTCapH2_R_h1FtEzrkUAIWQuMCHEs7npi_Izq0nuYY",
  range: "シート1!A3",
  valueInputOption: "USER_ENTERED",
  insertDataOption: "INSERT_ROWS",
  requestBody: { values: [["hello", "world"]] },
});
