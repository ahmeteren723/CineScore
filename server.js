const express = require('express');
const cloudscraper = require('cloudscraper'); // Yeni silahımız
const cheerio = require('cheerio');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());

// 1. STATİK DOSYALARI SERVİS ET (index.html'i Render'da gösteren kısım)
app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 2. LETTERBOXD SCRAPER (Cloudscraper versiyonu)
app.get('/scrape-lb', async (req, res) => {
    const title = req.query.title;
    if (!title) return res.json({ success: false, message: "Film adı lazım aslan!" });

    try {
        const searchUrl = `https://letterboxd.com/search/films/${encodeURIComponent(title)}/`;
        
        // Axios yerine cloudscraper kullanarak Cloudflare korumasını deliyoruz
        const searchData = await cloudscraper.get(searchUrl);
        const $ = cheerio.load(searchData);
        const filmPath = $('.film-detail-content a').first().attr('href');

        if (!filmPath) {
            return res.json({ success: false, message: "Film bulunamadı kral." });
        }

        const filmUrl = `https://letterboxd.com${filmPath}`;
        const filmPageData = await cloudscraper.get(filmUrl);
        const $$ = cheerio.load(filmPageData);
        const rating = $$('.average-display a').text().trim();

        if (rating) {
            res.json({ success: true, score: rating });
        } else {
            res.json({ success: false, message: "Puan bulunamadı." });
        }
    } catch (error) {
        console.error("Scraper Hatası:", error.message);
        res.json({ success: false, error: "Letterboxd bizi yine engelledi gibi görünüyor." });
    }
});

// 3. PORT AYARI (Render için hayati önemde)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 BACA TÜTÜYOR: Sunucu ${PORT} portunda hazır aslan!`);
});