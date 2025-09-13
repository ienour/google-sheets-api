const express = require('express');
const { google } = require('googleapis');
const cors = require('cors');
const path = require('path');
const keys = require('./service-account.json');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve file statis dari folder 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Autentikasi Google Sheets
const auth = new google.auth.GoogleAuth({
  credentials: keys,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

// Konfigurasi dinamis berdasarkan nama halaman
const sheetConfig = {
  kontak: {
    spreadsheetId: '1aj3Fp1YxOUA5sJglPsT1FfhIJXCNTVji9-Cwz2R-Rf8',
    sheetName: 'Sheet1',
  },
  Produk: {
    spreadsheetId: '1wYgtlK7N7vHF3jzwwfkdZuPpVbWuh0ZtMJT-V_whauY',
    sheetName: 'Produk',
  },
  // Tambahkan halaman tambahan di sini jika perlu
  // laporan: { spreadsheetId: '...', sheetName: '...' }
};

// === ENDPOINT PRODUK ===
app.get('/api/produk', async (req, res) => {
  try {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

    const cfg = sheetConfig.Produk;
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: cfg.spreadsheetId,
      range: `${cfg.sheetName}!A2:H`, // ambil mulai row 2
    });

    const rows = response.data.values || [];
    const produk = rows.map(r => ({
      id: r[0] || "",
      kategori: r[1] || "",
      item: r[2] || "",
      deskripsi: r[3] || "",
      stok: parseInt(r[4] || "0"),
      gambar: [r[5], r[6], r[7]].filter(Boolean),
      harga: parseFloat(r[8] || "0"),
      preorder: r[9] || "Tidak"
    }));

    res.json(produk);
  } catch (err) {
    console.error('Error ambil data produk:', err);
    res.status(500).json({ error: 'Gagal mengambil data produk' });
  }
});
/*
// Endpoint GET - Membaca data
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
    console.error('Error GET:', err);
    res.status(500).send('Gagal membaca data');
  }
});

// Endpoint POST - Menambahkan data
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
    console.error('Error POST:', err);
    res.status(500).send('Gagal menulis data');
  }
});
*/
// Jalankan server pada port yang sesuai (Render membutuhkan process.env.PORT)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API berjalan di http://localhost:${PORT}`);
});

