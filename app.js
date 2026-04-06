// --- AYARLAR (Burayı kendi anahtarlarınla doldur kral) ---
const API_KEY = 'a56ad9aac5d574e049b7e90d9b7b9737';
const OMDB_API_KEY = '68e6766b'; 
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_URL = 'https://image.tmdb.org/t/p/w500';

// --- 1. MOTORU BAŞLAT ---

const backBtn = document.getElementById('backBtn');


async function getTrendingMovies() {
    if (backBtn) backBtn.classList.add('hidden');
    try {
        const response = await fetch(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}&language=tr-TR`);
        const data = await response.json();
        displayMovies(data.results);
    } catch (error) { console.error("Hata:", error); }
}

// --- 2. GRID TASARIMI ---
function displayMovies(movies) {
    const moviesGrid = document.getElementById('moviesGrid');
    if (!moviesGrid) return;
    moviesGrid.innerHTML = '';

    movies.forEach(movie => {
        if (!movie.poster_path) return;
        const movieCard = document.createElement('div');
        movieCard.className = 'group cursor-pointer transform hover:scale-105 transition-all duration-300';
        movieCard.onclick = () => openMovieDetails(movie.id);
        
        movieCard.innerHTML = `
            <div class="relative overflow-hidden rounded-xl shadow-2xl border border-gray-800">
                <img src="${IMAGE_URL + movie.poster_path}" alt="${movie.title}" class="w-full h-auto object-cover">
                <div class="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4 text-center">
                    <span class="text-white font-bold text-lg">Analizi Gör</span>
                </div>
            </div>
            <h3 class="mt-3 text-sm font-semibold text-gray-200 group-hover:text-red-500 truncate text-center">${movie.title}</h3>
        `;
        moviesGrid.appendChild(movieCard);
    });
}
// --- 6. KİŞİYE GÖRE FİLM GETİRME MOTORU ---
async function searchByPerson(personId, personName) {
   
    showBackButton(); // <--- BU SATIRI EKLEDİK
    if (!personId) return;
   
   
    document.getElementById('mainTitle').innerText = `${personName} aranıyor...`;
    window.closeModal(); // Modalı kapat ki sonuçları görebilelim
    
    try {
        const creditsRes = await fetch(`${BASE_URL}/person/${personId}/movie_credits?api_key=${API_KEY}&language=tr-TR`);
        const creditsData = await creditsRes.json();

        let allMovies = [...creditsData.cast, ...creditsData.crew];
        allMovies.sort((a, b) => b.popularity - a.popularity);

        const uniqueMovies = Array.from(new Set(allMovies.map(m => m.id)))
            .map(id => allMovies.find(m => m.id === id))
            .filter(m => m.poster_path);

        document.getElementById('mainTitle').innerText = `${personName} - Tüm Filmleri`;
        displayMovies(uniqueMovies);
        
        // Sayfayı en üste kaydır ki sonuçlar görünsün
        window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (error) {
        console.error("Kişi filmleri çekilemedi:", error);
    }
}
// --- 3. DERİN ANALİZ (MODAL) ---
async function openMovieDetails(movieId) {
    const modal = document.getElementById('movieModal');
    const content = document.getElementById('modalContent');
    modal.classList.remove('hidden');
    
    try {
        const [detailsRes, creditsRes] = await Promise.all([
            fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=tr-TR`),
            fetch(`${BASE_URL}/movie/${movieId}/credits?api_key=${API_KEY}`)
        ]);

        const movie = await detailsRes.json();
        const credits = await creditsRes.json();
        const director = credits.crew.find(c => c.job === 'Director')?.name || 'Bilinmiyor';
        const actors = credits.cast.slice(0, 5);
        const releaseYear = movie.release_date ? movie.release_date.split('-')[0] : '';

        content.innerHTML = `
            <div class="md:w-1/3 flex-shrink-0">
                <img src="${IMAGE_URL + movie.poster_path}" class="rounded-3xl shadow-2xl border border-gray-800 w-full object-cover">
            </div>
            <div class="md:w-2/3 text-left">
                <h2 class="text-4xl md:text-5xl font-black text-white mb-2 tracking-tighter">${movie.title}</h2>
                <p onclick="searchByPerson(${credits.crew.find(c => c.job === 'Director')?.id}, '${director}')" 
   class="text-red-600 font-bold mb-6 text-lg md:text-xl italic cursor-pointer hover:underline">
   dir. ${director} (${releaseYear})
</p>
                
                <div class="grid grid-cols-3 gap-4 mb-8 text-center">
                    <div class="bg-gray-800/50 p-4 rounded-2xl border border-gray-700">
                        <div class="text-yellow-500 font-black text-2xl">${movie.vote_average.toFixed(1)}</div>
                        <div class="text-[10px] text-gray-500 uppercase font-bold tracking-widest">TMDB</div>
                    </div>
                    <div id="imdbBox" class="bg-gray-800/50 p-4 rounded-2xl border border-gray-700">
                        <div class="text-blue-400 font-black text-2xl animate-pulse">...</div>
                        <div class="text-[10px] text-gray-500 uppercase font-bold tracking-widest">IMDb</div>
                    </div>
                    <div id="rtBox" class="bg-gray-800/50 p-4 rounded-2xl border border-gray-700">
                        <div class="text-red-500 font-black text-2xl animate-pulse">...</div>
                        <div class="text-[10px] text-gray-500 uppercase font-bold tracking-widest">ROTTEN</div>
                    </div>
                </div>

                <p class="text-gray-300 text-lg leading-relaxed mb-8 italic font-light">"${movie.overview || 'Analiz bulunamadı.'}"</p>
                <div class="flex flex-wrap gap-4">
                    ${actors.map(actor => `
                        <div onclick="searchByPerson(${actor.id}, '${actor.name}')" 
     class="flex flex-col items-center cursor-pointer group/actor">
                            <img src="${actor.profile_path ? IMAGE_URL + actor.profile_path : 'https://via.placeholder.com/100'}" class="w-12 h-12 rounded-full object-cover border border-gray-800">
                            <span class="text-[8px] mt-1 text-gray-500 w-14 text-center truncate">${actor.name}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        fetchOtherScores(movie.imdb_id, movie.original_title, releaseYear);

    } catch (error) { console.error(error); }
}

// --- 4. EK PUANLARI ÇEKEN YAN MOTOR (BACAYA BAĞLI) ---
async function fetchOtherScores(imdbId, title, year) {
    const imdbBox = document.querySelector('#imdbBox div');
    const rtBox = document.querySelector('#rtBox div');

    // OMDb İşlemi
    let omdbUrl = imdbId 
        ? `https://www.omdbapi.com/?i=${imdbId}&apikey=${OMDB_API_KEY}`
        : `https://www.omdbapi.com/?t=${encodeURIComponent(title)}&y=${year}&apikey=${OMDB_API_KEY}`;

    try {
        const res = await fetch(omdbUrl);
        const data = await res.json();
        if (data.Response === "True") {
            imdbBox.innerText = data.imdbRating || "N/A";
            const rtRating = data.Ratings?.find(r => r.Source.includes("Rotten"));
            rtBox.innerText = rtRating ? rtRating.Value : "N/A";
        }
    } catch (e) { console.warn("OMDb hatası."); }
    
    imdbBox.classList.remove('animate-pulse');
    rtBox.classList.remove('animate-pulse');
}

// --- 5. DİĞER FONKSİYONLAR ---
window.closeModal = function() { document.getElementById('movieModal').classList.add('hidden'); }
document.getElementById('searchInput').addEventListener('keypress', async (e) => {
    if (e.key === 'Enter') {
        showBackButton();
        const query = e.target.value.trim();
        if (!query) return;

        document.getElementById('mainTitle').innerText = `"${query}" aranıyor...`;
        
        try {
            // 1. ADIM: Kişiyi veya Filmi Bul (Multi Search)
            const searchRes = await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&language=tr-TR&query=${encodeURIComponent(query)}`);
            const searchData = await searchRes.json();
            
            const firstResult = searchData.results[0];

            if (!firstResult) {
                document.getElementById('mainTitle').innerText = "Sonuç bulunamadı aslan.";
                return;
            }

            // 2. ADIM: Eğer sonuç bir İNSAN ise, tüm filmografisini çek
            if (firstResult.media_type === 'person') {
                const personId = firstResult.id;
                const creditsRes = await fetch(`${BASE_URL}/person/${personId}/movie_credits?api_key=${API_KEY}&language=tr-TR`);
                const creditsData = await creditsRes.json();

                // Oyuncu (cast) ve Yönetmen (crew -> Director) verilerini birleştir
                const directorJobs = creditsData.crew.filter(c => c.job === 'Director');
                const actorJobs = creditsData.cast;
                
                // Hepsini tek listede topla ve popülerliğe göre sırala
                let allMovies = [...directorJobs, ...actorJobs];
                allMovies.sort((a, b) => b.popularity - a.popularity);

                // Tekrar edenleri temizle (Aynı filmde hem oynamış hem yönetmiş olabilir)
                const uniqueMovies = Array.from(new Set(allMovies.map(m => m.id)))
                    .map(id => allMovies.find(m => m.id === id));

                document.getElementById('mainTitle').innerText = `${firstResult.name} - Tüm Eserleri`;
                displayMovies(uniqueMovies);

            } else {
                // Eğer sonuç direkt FİLM ise, sadece benzer sonuçları göster
                displayMovies(searchData.results.filter(item => item.media_type === 'movie'));
            }

        } catch (error) {
            console.error("Arama motoru çöktü:", error);
        }
    }
});

getTrendingMovies();
// --- 7. NAVİGASYON VE GERİ BUTONU ---


if (backBtn) {
    backBtn.onclick = () => {
        getTrendingMovies(); // Ana sayfadaki trendleri tekrar yükle
        backBtn.classList.add('hidden'); // Butonu tekrar sakla
        document.getElementById('searchInput').value = ''; // Arama kutusunu temizle
        document.getElementById('mainTitle').innerText = "Popüler Keşifler";
    };
}

function showBackButton() {
    if (backBtn) backBtn.classList.remove('hidden');
}

// BU SATIR DOSYANIN EN SONUNDA KALMALI:
getTrendingMovies();