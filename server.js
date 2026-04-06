const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());

// --- 1. STATİK DOSYALARI SERVİS ET ---
// Bu satır index.html, app.js ve style.css dosyalarını internete açar
app.use(express.static(path.join(__dirname)));

// Ana sayfaya (/) gelindiğinde index.html dosyasını gönder
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// --- 2. LETTERBOXD SCRAPER (SENİN ESKİ KODUN) ---
app.get('/scrape-lb', async (req, res) => {
    const title = req.query.title;
    if (!title) return res.json({ success: false, message: "Film adı lazım aslan!" });

    try {
        const searchUrl = `https://letterboxd.com/search/films/${encodeURIComponent(title)}/`;
        const { data } = await axios.get(searchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
                'Referer': 'https://letterboxd.com/'
            }
        });
        const $ = cheerio.load(data);
        const filmPath = $('.film-detail-content a').first().attr('href');

        if (!filmPath) {
            return res.json({ success: false, message: "Film bulunamadı." });
        }

        const filmUrl = `https://letterboxd.com${filmPath}`;
        const filmPage = await axios.get(filmUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
                'Referer': searchUrl
            }
        });
        const $$ = cheerio.load(filmPage.data);
        const rating = $$('.average-display a').text().trim();

        if (rating) {
            res.json({ success: true, score: rating });
        } else {
            res.json({ success: false, message: "Puan yok." });
        }
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

// --- 3. PORT AYARI ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 BACA TÜTÜYOR: Sunucu ${PORT} portunda hazır aslan!`);
});