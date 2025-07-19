const express = require('express');
const { google } = require('googleapis');
const cors = require('cors');
const path = require('path');
const keys = require('./service-account.json');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const auth = new google.auth.GoogleAuth({
  credentials: keys,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

// Konfigurasi spreadsheet berdasarkan halaman
const sheetConfig = {
  kontak: {
    spreadsheetId: '1aj3Fp1YxOUA5sJglPsT1FfhIJXCNTVji9-Cwz2R-Rf8',
    sheetName: 'Sheet1',
  },
  // Tambahkan key lain jika perlu, misalnya:
  // laporan: { spreadsheetId: '...', sheetName: '...' }
};

// Endpoint GET - membaca data berdasarkan pageKey
app.get('/get', async (req, res) => {
  const pageKey = req.query.pageKey;
  const config = sheetConfig[pageKey];

  if (!config) return res.status(400).send('Halaman tidak dikenali');

  try {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: config.spreadsheetId,
      range: config.sheetName,
    });

    res.json(result.data.values);
  } catch (err) {
    console.error(err);
    res.status(500).send('Gagal membaca data');
  }
});

// Endpoint POST - menulis data berdasarkan pageKey
app.post('/submit', async (req, res) => {
  const { rowData, pageKey } = req.body;
  const config = sheetConfig[pageKey];

  if (!config) return res.status(400).send('Halaman tidak dikenali');

  try {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

    const result = await sheets.spreadsheets.values.append({
      spreadsheetId: config.spreadsheetId,
      range: config.sheetName,
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

// Jalankan server
app.listen(3000, () => {
  console.log('API berjalan di http://localhost:3000');
});
