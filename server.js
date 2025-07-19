const express = require('express');
const { google } = require('googleapis');
const cors = require('cors');
const keys = require('./service-account.json'); // File JSON kamu

const app = express();
app.use(cors());
app.use(express.json());

const auth = new google.auth.GoogleAuth({
  credentials: keys,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const SPREADSHEET_ID = '1aj3Fp1YxOUA5sJglPsT1FfhIJXCNTVji9-Cwz2R-Rf8';
const SHEET_NAME = 'Sheet1'; // Sesuaikan dengan nama tab di spreadsheet

// Endpoint GET - membaca data
app.get('/get', async (req, res) => {
  try {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: SHEET_NAME,
    });

    res.json(result.data.values);
  } catch (err) {
    console.error(err);
    res.status(500).send('Gagal membaca data');
  }
});

// Endpoint POST - menulis data
app.post('/submit', async (req, res) => {
  const { rowData } = req.body;

  try {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

    const result = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: SHEET_NAME,
      valueInputOption: 'RAW',
      resource: {
        values: [rowData],
      },
    });

    res.send({ status: 'ok', updated: result.data.updates });
  } catch (err) {
    console.error(err);
    res.status(500).send('Gagal menulis data');
  }
});

app.listen(3000, () => {
  console.log('API berjalan di http://localhost:3000');
});