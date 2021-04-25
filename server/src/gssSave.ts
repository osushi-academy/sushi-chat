import fs from "fs";
import readline from "readline";
import { google, sheets_v4 } from "googleapis";
import { OAuth2Client } from "google-auth-library";

// If modifying these scopes, delete token.json.
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = "token.json";

let sheets: sheets_v4.Sheets;
const spreadsheetId = "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms";

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
export async function gssAuthorize() {
  let oAuth2Client: OAuth2Client | null = null;
  // Load client secrets from a local file.
  fs.readFile("client.json", (err: any, content: any) => {
    if (err) return console.log("Error loading client secret file:", err);
    // Authorize a client with credentials, then call the Google Sheets API.
    const credentials = JSON.parse(content);
    const { client_secret, client_id, redirect_uris } = credentials.web;
    oAuth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0]
    );

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err: any, token: any) => {
      if (err) return getNewToken(oAuth2Client);
      oAuth2Client!.setCredentials(JSON.parse(token));
      sheets = google.sheets({ version: "v4", auth: oAuth2Client! });
      console.log(sheets);
    });
  });

  return oAuth2Client;
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client: any) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });
  console.log("Authorize this app by visiting this url:", authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question("Enter the code from that page here: ", (code: any) => {
    rl.close();
    oAuth2Client.getToken(code, (err: any, token: any) => {
      if (err)
        return console.error(
          "Error while trying to retrieve access token",
          err
        );
      oAuth2Client.setCredentials(token);
      sheets = google.sheets({ version: "v4", auth: oAuth2Client });
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err: any) => {
        if (err) return console.error(err);
        console.log("Token stored to", TOKEN_PATH);
      });
    });
  });
}

/**
 * Prints the names and majors of students in a sample spreadsheet:
 * @see https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */
export function readObject(sheetName: any) {
  if (!sheets) {
    gssAuthorize();
  }
  sheets.spreadsheets.values.get(
    {
      spreadsheetId,
      range: sheetName,
    },
    (err: any, res: any) => {
      if (err) return console.log("The API returned an error: " + err);
      return res.data.values;
    }
  );
}

export async function saveObject(sheetName: any, object: any) {
  if (!sheets || typeof sheets === "undefined") {
    const r = await gssAuthorize();
    console.log(sheets, r);
  }
  sheets.spreadsheets.values.append(
    {
      spreadsheetId,
      range: sheetName + "!1",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: Object.values(object),
      },
    },
    (err: any, res: any) => {
      if (err) return console.log("The API returned an error: " + err);
    }
  );
}
