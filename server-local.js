const express = require('express');
const cloudscraper = require('cloudscraper'); 
const cheerio = require('cheerio');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname)));

// Ana sayfayı açar
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// LETTERBOXD SCRAPER (Senin bilgisayarında mermi gibi çalışacak kısım)
app.get('/scrape-lb', async (req, res) => {
    const title = req.query.title;
    if (!title) return res.json({ success: false, message: "Film adı eksik aslan!" });

    try {
        const searchUrl = `https://letterboxd.com/search/films/${encodeURIComponent(title)}/`;
        const searchData = await cloudscraper.get(searchUrl);
        const $ = cheerio.load(searchData);
        const filmPath = $('.film-detail-content a').first().attr('href');

        if (!filmPath) return res.json({ success: false, message: "Film bulunamadı." });

        const filmUrl = `https://letterboxd.com${filmPath}`;
        const filmPageData = await cloudscraper.get(filmUrl);
        const $$ = cheerio.load(filmPageData);
        const rating = $$('.average-display a').text().trim();

        res.json({ success: true, score: rating || "N/A" });
    } catch (error) {
        console.error("Lokal Scraper Hatası:", error.message);
        res.json({ success: false, error: "Bağlantı hatası kral." });
    }
});

const PORT = 3001; // Lokal olduğu için 3000'de kalsın
app.listen(PORT, () => {
    console.log(`🔥 LOKAL CANAVAR HAZIR: http://localhost:${PORT}`);
});