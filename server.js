const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
app.use(cors());

const PORT = 3000;
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

app.listen(PORT, () => {
    console.log(`🚀 BACA TÜTÜYOR: http://localhost:${PORT} adresinde server hazır aslan!`);
});