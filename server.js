const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
app.use(cors());

const path = require('path');

// Statik dosyaları (HTML, JS, CSS) bulunduğun klasörden servis et
app.use(express.static(path.join(__dirname)));

// Ana sayfaya girildiğinde index.html'i gönder
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/scrape-lb', async (req, res) => {
    const { title } = req.query;
    
    // İsmi temizle
    const slug = title.toLowerCase()
        .replace(/[^a-z0-9 ]/g, '')
        .replace(/\s+/g, '-');

    const url = `https://letterboxd.com/film/${slug}/`;
    
    // TERMINALE YAZDIR (Burayı izle aslan)
    console.log(`🔍 Denenen Adres: ${url}`);

    try {
        const { data } = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const $ = cheerio.load(data);
        const rating = $('meta[name="twitter:data2"]').attr('content');
        
        if (rating) {
            res.json({ success: true, score: rating.split(' ')[0] });
        } else {
            console.log("❌ Sayfa geldi ama puan etiketi bulunamadı.");
            res.json({ success: false });
        }
    } catch (error) {
        console.log(`🚫 Hata: ${error.response?.status || error.message}`);
        res.json({ success: false });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 BACA TÜTÜYOR: Sunucu ${PORT} portunda hazır aslan!`);
});