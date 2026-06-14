const express = require('express');
const { WebSocketServer } = require('ws');
const { createServer } = require('http');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

app.use(express.static(__dirname));

// ─── Online otaqlar API ────────────────────────────────────────────────────
app.get('/api/otaqlar', (req, res) => {
  const list = [];
  otaqlar.forEach(otaq => {
    if (otaq.oyunVeziyyeti === 'gozleme') {
      list.push({
        id: otaq.id,
        oyuncuSayi: otaq.oyuncular.size,
        cetinlik: otaq.cetinlik,
        kateqoriya: otaq.kateqoriya,
      });
    }
  });
  res.json(list);
});

// ─── Azərbaycan əlifbası ───────────────────────────────────────────────────
const AZ_HERFLERI = [
  'A','B','C','Ç','D','E','Ə','F','G','H','X',
  'İ','J','K','Q','L','M','N','O','Ö','P',
  'R','S','Ş','T','U','Ü','V','Y','Z'
];

// ─── Çətinlik səviyyələri ─────────────────────────────────────────────────
const CETINLIK = {
  easy:      { vaxt: 120, label: 'Asan',      emoji: '🟢', herfleSayi: 7 },
  medium:    { vaxt: 90,  label: 'Orta',      emoji: '🟡', herfleSayi: 6 },
  hard:      { vaxt: 60,  label: 'Çətin',     emoji: '🔴', herfleSayi: 5 },
  nightmare: { vaxt: 45,  label: 'Nightmare', emoji: '💀', herfleSayi: 4 },
};

// ─── Kateqoriyalar ────────────────────────────────────────────────────────
const KATEQORIYALAR = {
  'Gündəlik Həyat': [
    'Bazara getmək','Yuxuya getmək','Nahar etmək','Paltarları yığmaq','Dişlərini fırçalamaq',
    'Ev yığışdırmaq','Duş almaq','Telefonu şarj etmək','Metroya minmək','Avtobus gözləmək',
    'Qapını bağlamaq','İşığı söndürmək','Pəncərəni açmaq','Qəhvə dəmləmək','Çay içmək',
    'Naharı bişirmək','Paltarları yumaq','Zibili atmaq','Mağazaya getmək','Kəmər bağlamaq',
    'Əllərini yumaq','Üzünü yumaq','Saçlarını daramaq','Geyinmək','Soyunmaq',
    'Getmək','Gəlmək','Oturmaq','Qalxmaq','Qaçmaq',
    'Gülmək','Ağlamaq','Danışmaq','Susmaaq','Fikirləşmək',
    'Oxumaq','Yazmaq','Dinləmək','Baxmaq','Gözləmək',
    'Həyəcanlanmaq','Sevinmək','Kədərlənmək','Qorxmaq','Utanmaq',
    'Qonşuya getmək','Dostla görüşmək','Əl sıxmaq','Sarılmaq','Öpüşmək',
  ],
  'Texnologiya': [
    'Süni intellekt','Smartfon','Klaviatura','Şifrə','Bulud xidməti',
    'Proqramlaşdırma','Veb sayt','Proqram yeniləmək','Fayl göndərmək','Çap etmək',
    'Bluetooth','WiFi','USB kabel','Ekran görüntüsü','Kamera',
    'Batareya','Mikrofon','Dinamik','Sensor ekran','Lazer printer',
    'Noutbuk','Planşet','Smartsaat','Qulaqlıq','Proyektor',
    'Kompüter','Siçan','Monitor','Server','Şəbəkə',
    'Proqram','Tətbiq','Oyun konsolu','Robotika','Dron',
    'Elektrik avtomobil','Solar panel','3D printer','Virtual gerçəklik','Artırılmış gerçəklik',
    'Blockchain','Şifrələmə','Hack etmək','Virus','Firewall',
    'Süni görmə','Maşın öyrənməsi','Neyron şəbəkə','Chatbot','Avtomatlaşdırma',
  ],
  'İnternet': [
    'Sosial media','Video yükləmək','Canlı yayım','Şərh yazmaq','Like vermək',
    'Paylaşım etmək','Abunə olmaq','Axtar','Spam','Phishing',
    'Meme','Viral video','Blog yazmaq','Podcast dinləmək','Online alış-veriş',
    'İnternet bankçılıq','Video zəng','Mesaj göndərmək','Stiker','Emoji',
    'Story paylaşmaq','Reels','Tweet atmaq','Hashtag','Follower',
    'İnfluencer','Streamer','Content creator','Troll','Fake news',
    'Şəkil çəkmək','Şəkili redaktə etmək','Filtr vurmaq','Caption yazmaq','Tag etmək',
    'DM göndərmək','Mention etmək','Repost etmək','Unfollow etmək','Block etmək',
    'Şifrəni unutmaq','Hesabı silmək','Profile şəkli dəyişmək','Bio yazmaq','Link paylaşmaq',
    'Görüntülü danışmaq','Grup yaratmaq','Kanal açmaq','Abunəni ləğv etmək','Reklam bloklamaq',
  ],
  'Oyun': [
    'Baş oyunçu','Takım oyunu','Qalib gəlmək','Məğlub olmaq','Xal toplamaq',
    'Canını itirmək','Yeni səviyyə','Güclü silah','Gizli keçid','Oyun daxilindəki pul',
    'Multiplayer','Singl oyunçu','RPG','FPS','Strategiya oyunu',
    'Dünya rekordu','Speed run','Easter egg','Patch yeniləmək','DLC almaq',
    'Turnir oynamaq','Streaming etmək','Oyun çantası','Joystick','Headset taxmaq',
    'Respawn olmaq','Loot toplamaq','Güclənmək','Boss döyüşü','Final missiya',
    'Yarış oyunu','Döyüş oyunu','Platformer','Sandbox','Survival oyunu',
    'Oyun klaviaturası','RGB işıq','Gaming chair','Gaming monitor','Yüksək FPS',
    'Lag etmək','Ping yüksəkliyi','Disconnect olmaq','Kənar oyunçu','Cheater',
    'Achievement qazanmaq','Trophy toplamaq','Game over','Yenidən başlamaq','Save etmək',
  ],
  'Yemək': [
    'Pizza bişirmək','Sushi yemək','Burger sifariş etmək','Qəhvə içmək','Çay dəmləmək',
    'Tort kəsmək','Dondurma yemək','Salat hazırlamaq','Sup bişirmək','Qril etmək',
    'Çörək kəsmək','Şoraba açmaq','Meyvə sıxmaq','Şokolad yemək','Popcorn etmək',
    'Makaron bişirmək','Yumurta qızartmaq','Pendir kəsmək','Kərə yağı ərimək','Un ələmək',
    'Xəmir yoğurmaq','Qazanı qarışdırmaq','Sobaya qoymaq','Mikrodalgada qızdırmaq','Dondurucu açmaq',
    'Lahmacun','Döner kebab','Plov','Dolma','Aşure',
    'Baklava','Şəkərbura','Pakhlava','Qutab','Tikhme',
    'Limonad hazırlamaq','Smoothie etmək','Kofein içmək','Enerji içkisi','Mineral su içmək',
    'Restoran seçmək','Menüyə baxmaq','Sifariş vermək','Ödəmək','Qalan yeməyi aparmaq',
    'Yeməyi dadmaq','Duz əlavə etmək','Ədviyyat vurmaq','Şəkər qatmaq','Limon sıxmaq',
  ],
  'Kino': [
    'Aksion film','Komediya','Dram','Qorxu filmi','Animasiya',
    'Treyler izləmək','Kinoteatra getmək','Bilet almaq','Popcorn yemək','Işığı söndürmək',
    'Ssenari yazmaq','Aktyor oynamaq','Rejissor','Prodüser','Çəkiliş',
    'Xüsusi effektlər','Grim vurmaq','Kostyum geymək','Müzik yazmaq','Montaj etmək',
    'Oskar mükafatı','Film serial','Spin-off','Prequel','Sequel',
    'Canlı çəkiliş','Sənəd filmi','Biografi','Tarixi film','Elm-fantastika',
    'Romantik film','Triller','Detektiv','Müharibə filmi','Nağıl filmi',
    'Film müzikası','Əsas qəhrəman','Antaqonist','Müttəfiq','Qılıncoynatmaq',
    'Uçmaq','Dövlət xilas etmək','Sirri açmaq','Cinayəti həll etmək','Düşməni məğlub etmək',
    'Kinematografiya','Işıq qurmaq','Kamera sürüşdürmək','Drone çəkişi','Epizodik rolu',
  ],
  'Məktəb': [
    'İmtahan vermək','Ev tapşırığı etmək','Dərsə getmək','Müəllimə sual vermək','Sinfə girmək',
    'Taxta yazmaq','Dəftərə qeyd etmək','Kitab açmaq','Kompasla dairə çəkmək','Rəsm çəkmək',
    'Oxumaq','Hesab etmək','Hekayə yazmaq','İnşa yazmaq','Şeir əzbərləmək',
    'Laboratoriyada iş','Kimya eksperimenti','Biologiya dərsi','Fizika formulu','Tarix dərsi',
    'İngilis dili dərsi','Riyaziyyat','Coğrafiya','Musiqi dərsi','Bədən tərbiyəsi',
    'Məktəb nəqliyyatı','Tən arasında oynamaq','Yeməkxanada yemək','Kitabxanaya getmək','Muzeyə excursiya',
    'Sinfə gecikmək','Müəllimin yanına çağırılmaq','Xəbərdarlıq almaq','Qiymət götürmək','Attestat almaq',
    'Lövhəni silmək','Partalını düzəltmək','Sıra yoldaşı seçmək','Qrupa bölünmək','Prezentasiya etmək',
    'İmla yazmaq','Test çözmək','Yanlış cavab vermək','Düzgün cavab vermək','Müəllimi utandırmaq',
    'Məktəb forması geymək','Çantanı hazırlamaq','Dərslikləri götürmək','Karandaş itirmək','Silgini borc almaq',
  ],
  'Elm': [
    'Atom nüvəsi','Qara dəlik','Gen mutasiyası','Vaksin hazırlamaq','Laboratoriya testi',
    'Teleskopla baxmaq','Mikroskop istifadə etmək','Kimyəvi reaksiya','Elektromaqnetizm','Termodinamika',
    'Kvant mexanikası','İzafiyet nəzəriyyəsi','Nüvə energiyası','Zülal sintezi','DNT sekvenasiyası',
    'Süni orqan','Hüceyrə bölünməsi','Karbon izotopu','Ultrasəs','Rentgen şüası',
    'Meteorit tapşmaq','Orbitə çıxmaq','Aya uçmaq','Marsı araşdırmaq','Ekzoplanet kəşf etmək',
    'Seismoqraf oxumaq','Vulkan püskürmək','Sunami dalğası','Ozon qatı','Qlobal isınma',
    'İqlim modelləmək','Neft çıxarmaq','Suyun elektrolizi','Fotosintez','Metabolizm',
    'Sinir impulsu','Beyin skanı','Süni ürək','Kök hüceyrə','Klonlaşdırma',
    'Süni intellekt alqoritmi','Robot proqramlamaq','Nanoteknologiya','Fiziki kəşf','Nobel mükafatı',
    'Hesablamaq','Ölçmək','Müşahidə etmək','Hipotez qurmaq','Nəticə çıxarmaq',
  ],
  'İdman': [
    'Qol vurmaq','Penalti atmaq','Oyundan kənar olmaq','Sarı kart almaq','Qapını qorumaq',
    'Basketbol atmaq','Voleybol vurmaq','Tenisi qaytarmaq','Üzmək','Qaçmaq',
    'Atlamaq','Ağırlıq qaldırmaq','Boks etmək','Güləşmək','Karate etmək',
    'Sürüşmək','Dağa çıxmaq','Velosiped sürməkk','Avarla çəkmək','İdman zalına getmək',
    'Gərginləşmək','İstiləşmək','Soyunmaq','Forma geymək','Ayaqqabı bağlamaq',
    'Komanda qurmaq','Kapitan seçmək','Taktika müzakirə etmək','Matçı izləmək','Çempionluq qazanmaq',
    'Rekord qırmaq','Mükafat almaq','Podium çıxmaq','Medalı almaq','Bayraq asmaq',
    'Stadionə getmək','Fandanlık etmək','Bilet almaq','Dürbünlə baxmaq','Tifozluq etmək',
    'Referi qərarına etiraz etmək','Transfermə keçmək','Kontrat imzalamaq','Pensiyaya çıxmaq','Komandanı tərk etmək',
    'Tramplin atmaq','Qayığa minmək','Atla getmək','Ox atmaq','Dart atmaq',
  ],
  'Heyvanlar': [
    'İt saxlamaq','Pişik oxşamaq','Quş əsir saxlamaq','Balıq bəsləmək','Dovşan saxlamaq',
    'Əl-ayaqla ördəyi qovmaq','Pişiyi çimmək','İti gəzdirmək','Quşa yem vermək','Balığı əsir buraxmaq',
    'Fil xortumu','Zürafə boynu','Dəvə dörkəci','Aslan yalı','Zebranın zolağı',
    'Qanad çırpmaq','Uçmaq','Sürünmək','Üzmək','Dırmaşmaq',
    'Hürməkk','Miyavlamaq','Möyürməkk','Bağırmaq','Cırcıralamaq',
    'Mağarada yaşamaq','Göçmək','Qışlamaq','Ov etmək','Gizlənmək',
    'Ağac üstündə oturmaq','Su içmək','Ot yemək','Şikar tutmaq','Yuvaya qayıtmaq',
    'Hayvanat bağına getmək','Çöldə görmək','Fotoşəkil çəkmək','Yaxınlaşmaq','Qorxmaq',
    'Dəniz atı','Ağ ayı','Qorilla','Şəlalə şimpanzesi','Okapi',
    'Qondarma','Leylək','Qar bəbiri','Vulkan soxulcanı','Mavi nəhəng balina',
  ],
  'Ölkələr': [
    'Azərbaycanlı olmaq','Türk mədəniyyəti','İtalyan pizzası','Fransız ətriyyatı','Yapon texnologiyası',
    'Çin Səddini görmək','Parisdə olmaq','Londona getmək','Nyu-Yorkda yaşamaq','Romada gəzmək',
    'Pasport almaq','Viza müraciəti','Uçuş bilet almaq','Turist olaraq gəzmək','Yerli yeməyi dadmaq',
    'Xarici dildə danışmaq','Yerli adət-ənənəni öyrənmək','Suvenir almaq','Valuta dəyişmək','Xarici bankda pul çəkmək',
    'Əfqanıstanda olmaq','Braziliyada karneval','Hindistanda düyün','Misirdə ehram','Peruda inkaları',
    'Atlantik keçmək','Sakit okeanda üzmək','Arktikada gəzmək','Amazonkada tədqiq etmək','Saharaya getmək',
    'Kanadadakı şəlalə','Yeni Zelandiyada Maori dansı','İndoneziyada Bali','Tayland tapınağı','Kambocada Anqkor Vat',
    'Almaniyada Oktoberfest','Ispaniyada Tomatina','Hollandiyada lale tarlası','Qreekvari ada həyatı','Norveçdə günəş işığı',
    'Rusiyada balalayka','Çindəki pandalara baxmaq','Koreyadakı K-pop konserti','Meksikadakı Mayalara baxmaq','Argentinada tango',
    'BƏƏdə burc binası','Sakit şəlalə','Braziliya meşəsi','Nil çayı','Amur çayı',
  ],
  'Tarix': [
    'Piramida tikintisi','Gladiator döyüşü','Feodal sənədi imzalamaq','Şəvalye olmaq','Kral taxtı almaq',
    'Xaç yürüşü','Müharibə bəyan etmək','Sülh müqaviləsi imzalamaq','İstila etmək','Şəhəri fəth etmək',
    'Kommunizm ideyası yaymaq','Demokratiyanı kurmak','Anayasa yazmaq','Ərzaq kartelini bölmək','Torpaq islahatı',
    'Fransız inqilabı','Amerikan müstəqilliyi','Sovet dövrü','Osmanlı imperiyası','Moğol yürüşü',
    'Vikinglərin yürüşü','Roma legionları','Sparta döyüşçüsü','Fəlsəfə müzakirəsi','Allaha ibadət etmək',
    'Qədim Babil','Şumer yazısı','Hiyeroqliflər oxumaq','Yunan mifologiyası','Roma panteon',
    'İkinci Dünya müharibəsi','Soyuq müharibə','Nüvə bombasını atmaq','Berlini bölmək','Berlini birləşdirmək',
    'Kosmosa çıxmaq','Aya ayaq basmaq','Avropanı kəşf etmək','Amerikanı tapmaq','Dünyada dövr etmək',
    'Xəritə çizmək','Kompas istifadə etmək','Teleskop ixtira etmək','Çap maşını icad etmək','Buxar maşını düzəltmək',
    'Sənaye inqilabı','Elektrik kəşf etmək','Peyvənd icad etmək','Antibiotik tapmaq','Nüvə fisiyonu',
  ],
  'Məşhur İnsanlar': [
    'Eynşteynin formulu','Musa peyğəmbər','Sokrat müzakirəsi','Leonardonun rəsmi','Şekspirin pyesi',
    'Napoleonun döyüşü','Kleopatranın saçı','Sezarın söyləmi','Aydının şeiri','Nizaminin dastan',
    'Əliağa Vahidin poetika','Üzeyir Hacıbəyovun opera','Heydər Əliyevin nutq','Bülbülün mahnısı','Rəşid Behbudovun qramplatı',
    'Maykl Ceksonun moonwalk','Beyonsenin konsert','Elvinin hip-sallamaq','Bitlzin mahnısı','Motzartin simfoniyası',
    'Pele topu vurmaq','Musinin qaçışı','Qremin topa hücum','Federerin servis','Nadalın bek-hend',
    'Bilin Ayliş saçı','Tayler Sviftin turnesi','Dreikin rap','Eminəmin freestyle','Jay-Zin lirka',
    'Elon Muskin raketi','Bil Qeytsın kompüteri','Stiv Cobsun iPhone','Mark Zukerberqin şəbəkəsi','Ceff Bezosun anbar',
    'Opranın müsahibəsi','Ellenin danslı proqram','Konanın monoloku','Çarlinin çikayəsi','Merilin Monroe poza',
    'Van Qoqun qulağı','Pikassonun kubiizm','Dali saqqalı','Mikelanchelonun heykəli','Rodenin düşüncə heykəli',
    'Kantın fəlsəfəsi','Froidun psixologiyası','Marksın kommunizmi','Darvinin evolyusiyası','Nyutonun alma',
  ],
  'Brendlər': [
    'Alma şirkəti','Kola içkisi','Sarı M hərfi','Üç zolaqlı idman paltar','Timsah emblemli köynək',
    'Qırmızı tac emblemi','Dördqolu üzük','At başı emblemi','İldırım loqosu','Göy quşu',
    'Düzgün tıq işarəsi','Cır okeyan dalğası','Narıncı-qara robot','Mavi quş','Qırmızı video küçüm',
    'Ağ alma dişləmək','İki qızıl qövslər','Yaşıl sırena','Qara pirat bayraq','Qırmızı çay qutusu',
    'Kofein içkisi sifariş etmək','Onlayn bazar almaq','Cib telefonu almaq','Paltaryuyan almaq','Avtomobil almaq',
    'Lüks çanta almaq','Moda şou izləmək','Parfüm almaq','Saat almaq','Eynək almaq',
    'Enerji içkisi içmək','Vitaminli su içmək','Protein barı yemək','Diyet kola içmək','Zero şəkər içmək',
    'Turnire qeydiyyat etmək','Yarışa qoşulmaq','Event bilet almaq','Festival getmək','Konsertə bilet almaq',
    'Avtomobil icarəsi','Oteli bron etmək','Aviabilet almaq','Paket tur','Sığorta almaq',
    'Brendin logosunu tanımaq','Şirkətin reklam sloganını bilmək','Brendin tarixini bilmək','Məhsulu müqayisə etmək','Endirimdə almaq',
  ],
  'Coğrafiya': [
    'Dağın zirvəsinə çıxmaq','Çay boyunca üzmək','Gölün sahilindən getmək','Səhraya girmək','Ormanı keçmək',
    'Adalara üzmək','Sahildə gəzmək','Buzlaqda yerişmək','Kanyon keçmək','Vadidə düşərgə qurmaq',
    'Xəritəyə baxmaq','Kompasla istiqamət tapmaq','GPS işlətmək','Koordinat yazmaq','Yüksekliyi ölçmək',
    'Vulkana yaxınlaşmaq','Geyzer izləmək','Mağara araşdırmaq','Su altı kəşf etmək','Sahilin haritasını çizmək',
    'Bataqlığa girmək','Savannada getmək','Tur meşəsini keçmək','Polo tundrasına çıxmaq','Antarktidaya getmək',
    'Meridian keçmək','Ekvator üzərindən keçmək','Qütb dairəsinə getmək','Beynəlxalq tarix xəttini keçmək','Qreenviçdə durmaq',
    'Limanı gəzmək','Körfəzdən keçmək','Boğazı keçmək','Delta tapşmaq','Ağız tapmaq',
    'Yeraltı mağaraya girmək','Şəlalənin altında durmaq','Dağ keçidini aşmaq','Dərənin dibinə inmək','Tərəsin üstündə durmaq',
    'Coğrafi izolyasiyada yaşamaq','Adada həyat qurmaq','Çöldə çadır qurmaq','Meşəyi tanımaq','Göyün ulduzlarına görə yön tapmaq',
    'Seysmik zonada yaşamaq','Sel yataqlı vadidə olmaq','Okean yatağını araşdırmaq','Yarımadaya keçmək','Körfəzi üzmək',
  ],
  'Kitablar': [
    'Romanı oxumaq','Şeir əzbərləmək','Nağıl danışmaq','Hekayə yazmaq','Kitabı bağlamaq',
    'Kitab mağazasına getmək','Kitabxanaya getmək','Kitab sifariş etmək','E-kitab oxumaq','Audio kitab dinləmək',
    'Müəlliflə görüşmək','Kitab tənqidi yazmaq','Kitab klubuna qatılmaq','Kitabı bağışlamaq','Kitabı aldatmaq',
    'Qəhrəmanla eyniləşmək','Kitabın sonunu oxumaq','Yarı yolda dayandırmaq','Kitabı yenidən oxumaq','Sehirli dünya',
    'Dedektiv araşdırmaq','Cinayəti həll etmək','Gizemi açmaq','Sirri saxlamaq','İzlər tapmaq',
    'Fantastik aləm','Sürrealizm','Realizm','Modernizm','Postmodernizm',
    'Uşaq kitabı','Yeniyetmə romanı','Böyük ədəbiyyat','Klassik əsər','Müasir roman',
    'Şair olmaq','Yazıçı olmaq','Redaktor olmaq','Nəşriyyatçı olmaq','Kitab dizayneri olmaq',
    'Avtobioqrafiya oxumaq','Məmuar yazmaq','Jurnal tutmaq','Gündəlik yazmaq','Məktub göndərmək',
    'Ön sözü oxumaq','Epiloqu oxumaq','İndeksi araşdırmaq','Biblioqrafiyaya baxmaq','Fiqnotanı oxumaq',
  ],
  'Cizgi Filmlər': [
    'Superqəhrəman uçmaq','Kərtənkələ çevrilmək','Sehrli dəyənək tutmaq','Quşa çevrilmək','Nəhəng olmaq',
    'Zərər verməmək üçün qaçmaq','Pisiyi xilas etmək','Planeti qurtarmaq','Düşməni məğlub etmək','Kiçilmək',
    'Sualtı dünyada yaşamaq','Kosmos gəmisini idarə etmək','Maşına dönmək','Dinozavr olmaq','Robot olmaq',
    'Sehirli dünyaya girmək','Sehrli xalçada uçmaq','Sehrbaz olmaq','Cadu etmək','Sehrə qarşı durmaq',
    'Rəngbərəng dünya','Mavi dəniz','Yaşıl meşə','Qaranlıq mağara','Uçan ada',
    'Anime qəhrəman','Manga oxumaq','Cizgi film studiyası','Animasiya etmək','Rəsm çizmək',
    'Pixar filmi','Disney prinsesi','Ghibli ruhu','Klasik Warner Bros','Looney Tunes',
    'Baş qəhrəman olmaq','Köməkçi olmaq','Bəd adam olmaq','İkili olmaq','Qrup qəhrəmanları',
    'Macəra başlamaq','Problemi həll etmək','Dosta kömək etmək','Geriyə dönmək','Zəfər qazanmaq',
    'Uşaqlıq xatirəsi','Nostalgiyaya getmək','Sevimli epizod','Açılış mahnısı','Son epizod',
  ],
  'TV Şouları': [
    'Reality şouya qatılmaq','Müsabiqə yarışmaq','Vokal müsabiqəsi','Yemək yarışı','Evlilik şou',
    'Detektiv serial izləmək','Komik serial izləmək','Drama serial izləmək','Fantastik serial','Qalib olmaq',
    'Efirə çıxmaq','Canlı yayımlanmaq','Reytinq almaq','Sezon sonu','Yeni serial',
    'Talk-şou aparıcısı','Late night şou','Gündəlik xəbər','Axşam xəbəri','Məhkəmə şouu',
    'Komediya şouu','Musiqili şou','Dans şouu','Uşaq şouu','Ailə şouu',
    'Xəbər müxbiri olmaq','Reportaj etmək','Müsahibə vermək','Siyasi debat','Sosial şərh',
    'Mövsümü bitirmək','Mövsümü gözləmək','Kliffhanger','Twist gəlmək','Şok son',
    'Binge-watch etmək','Marafon baxmak','Bir gecədə bitirmək','Epizodu yenidən izləmək','Favorit epizod',
    'Ekran görüntüsü almaq','Fan teoriya yazmaq','Xarakter tahlili etmək','Serial haqqında danışmaq','Serialı tövsiyə etmək',
    'Striming abunəliyi','Reklam atlamaq','Auto-play','Altmatn açmaq','Dublyaj dinləmək',
  ],
  'Əşyalar': [
    'Saatı taxmaq','Gözlük tapmaq','Çantanı bağlamaq','Açarı itirmək','Cüzdanı açmaq',
    'Qapını açmaq','Pəncərəni örtmək','İşığı yandırmaq','Kranı açmaq','Fanatı işlətmək',
    'Karandaşı siləklə qaytarmaq','Qayçı kəsmək','Şiş iynə tikişi','Əti bıçaqlamak','Qaşıqla çalmak',
    'Çəkici vurmaq','Mıxı sancmaq','Vintperi bağlamaq','Rəngi sürtmək','Yapışdırıcı çalmak',
    'Kitabı araşdırmaq','Telefonla danışmaq','Laptopun ekranına baxmaq','Kameranı qurmaq','Çantanı boşaltmaq',
    'Yorğanı sərpib uzanmaq','Yastığa basmaq','Stulda oturmaq','Masada yazmaq','Divara dayamaq',
    'Bıçaq saxlamaq','Qılınc tutmaq','Ox atmaq','Silah daşımaq','Zireh geymək',
    'Saat bağlamaq','Boyunbağı taxmaq','Sırğa vurmaq','Üzük taxmaq','Bilezik taxmaq',
    'Çəkmə geymək','Kepka taxmaq','Papaq taxmaq','Şal bağlamaq','Əlcək geymək',
    'Açarı çevirmək','Şifrəni salmak','Qıfılı açmaq','Kasanı tökmək','Stəkanı doldurmak',
  ],
  'Peşələr': [
    'Həkim muayinəsi','Müəllim dərsi','Mühəndis layihəsi','Pilot uçuşu','Aşpaz yeməyi',
    'Aktyor oyunu','Müğənni mahnısı','Rəssam tablosu','Yazıçı romanı','Jurnalist reportajı',
    'Hüquqçu müdafiəsi','Hakim qərarı','Polis müdaxiləsi','İtfaiyəçi söndürmə','Hərbçi nizam',
    'Arqueoloji qazıntı','Biologiya araşdırması','Kosmik gəmini idarə etmək','Astrofiziki hesablama','Tibbi cərrahiyyə',
    'Mühasib hesabı','İqtisadçı analizi','Marketinq kampaniyası','Sahibkar biznes','Menencer idarəetmə',
    'Dizayner yaratmaq','Proqramçı kod yazmaq','Analitik veri analiz etmək','İnvestor qoyuluş etmək','Bankir kredit',
    'Çoban sürü saxlamaq','Fermər tarla becərmək','Balıqçı av tutmaq','Mədənçi qazıntı','Tikişçi paltar tikmək',
    'Bərbər saç kəsmək','Manikürçü dırnaq bəzəmək','Masajçı masaj etmək','Fitnəs məşqçi','Psixoloq danışmaq',
    'Fotoqraf çəkiş','Operator kamera tutmaq','Rejissor çəkiliş idarə etmək','Prodüser maliyyə','Ssenari yazıçı hekayə',
    'Musiqi müəllimi','Balet müəllimi','İdman məşqçi','Peşəkar idmançı','Olimpiya çempionu',
  ],
};

// ─── Bütün kartları düzlü massivə çevir ──────────────────────────────────
function getKartlar(kateqoriyaAdi) {
  if (kateqoriyaAdi && KATEQORIYALAR[kateqoriyaAdi]) {
    return KATEQORIYALAR[kateqoriyaAdi];
  }
  // Hamısı
  return Object.values(KATEQORIYALAR).flat();
}

// ─── Oyun otaqları ─────────────────────────────────────────────────────────
const otaqlar = new Map();

function rastgeleHerfler(sayi) {
  const secilenler = [];
  const istifadeEdilmis = new Set();
  while (secilenler.length < sayi) {
    const harf = AZ_HERFLERI[Math.floor(Math.random() * AZ_HERFLERI.length)];
    if (!istifadeEdilmis.has(harf)) {
      secilenler.push(harf);
      istifadeEdilmis.add(harf);
    }
  }
  return secilenler;
}

function rastgeleKart(kateqoriya) {
  const kartlar = getKartlar(kateqoriya);
  return kartlar[Math.floor(Math.random() * kartlar.length)];
}

function otaqYarat() {
  const id = Math.random().toString(36).substr(2, 6).toUpperCase();
  const otaq = {
    id,
    oyuncular: new Map(),
    komandalar: { A: [], B: [] },
    oyunVeziyyeti: 'gozleme',
    mevcudKart: null,
    mevcudHerfler: [],
    mevcudKomanda: 'A',
    xallar: { A: 0, B: 0 },
    turSayaci: 0,
    maksimumTur: 10,
    vaxt: 60,
    vaxtInterval: null,
    cetinlik: 'medium',
    kateqoriya: null, // null = hamısı
    herfleSayi: 6,
  };
  otaqlar.set(id, otaq);
  return otaq;
}

function otaqDurumunuGonder(otaq) {
  const durum = {
    tip: 'otaq_durumu',
    otaqId: otaq.id,
    oyuncular: Array.from(otaq.oyuncular.values()).map(o => ({
      id: o.id,
      ad: o.ad,
      komanda: o.komanda,
      hazir: o.hazir,
      alien: o.alien,
    })),
    komandalar: otaq.komandalar,
    oyunVeziyyeti: otaq.oyunVeziyyeti,
    xallar: otaq.xallar,
    turSayaci: otaq.turSayaci,
    maksimumTur: otaq.maksimumTur,
    vaxt: otaq.vaxt,
    cetinlik: otaq.cetinlik,
    kateqoriya: otaq.kateqoriya,
    kateqoriyalar: Object.keys(KATEQORIYALAR),
  };
  otaq.oyuncular.forEach((oyuncu) => {
    const ferdi = { ...durum };
    if (otaq.oyunVeziyyeti === 'oyun') {
      ferdi.mevcudHerfler = otaq.mevcudHerfler;
      ferdi.mevcudKomanda = otaq.mevcudKomanda;
      if (oyuncu.alien && oyuncu.komanda === otaq.mevcudKomanda) {
        ferdi.mevcudKart = otaq.mevcudKart;
      } else {
        ferdi.mevcudKart = null;
      }
    }
    if (oyuncu.ws.readyState === 1) {
      oyuncu.ws.send(JSON.stringify(ferdi));
    }
  });
}

function turBaslat(otaq) {
  if (otaq.turSayaci >= otaq.maksimumTur) {
    oyunuBitir(otaq);
    return;
  }
  otaq.turSayaci++;
  otaq.mevcudKart = rastgeleKart(otaq.kateqoriya);
  otaq.mevcudHerfler = rastgeleHerfler(otaq.herfleSayi);
  const cfg = CETINLIK[otaq.cetinlik] || CETINLIK.medium;
  otaq.vaxt = cfg.vaxt;

  // Növbəti alien seç
  const komandaOyunculari = Array.from(otaq.oyuncular.values())
    .filter(o => o.komanda === otaq.mevcudKomanda);
  komandaOyunculari.forEach(o => o.alien = false);
  if (komandaOyunculari.length > 0) {
    const alienIdx = (otaq.turSayaci - 1) % komandaOyunculari.length;
    komandaOyunculari[alienIdx].alien = true;
  }

  if (otaq.vaxtInterval) clearInterval(otaq.vaxtInterval);
  otaq.vaxtInterval = setInterval(() => {
    otaq.vaxt--;
    if (otaq.vaxt <= 0) {
      clearInterval(otaq.vaxtInterval);
      otaq.mevcudKomanda = otaq.mevcudKomanda === 'A' ? 'B' : 'A';
      turBaslat(otaq);
    } else {
      otaqDurumunuGonder(otaq);
    }
  }, 1000);

  otaqDurumunuGonder(otaq);
}

function oyunuBitir(otaq) {
  if (otaq.vaxtInterval) clearInterval(otaq.vaxtInterval);
  otaq.oyunVeziyyeti = 'bitdi';
  let qalib = null;
  if (otaq.xallar.A > otaq.xallar.B) qalib = 'A';
  else if (otaq.xallar.B > otaq.xallar.A) qalib = 'B';
  else qalib = 'berabere';

  otaq.oyuncular.forEach(o => {
    if (o.ws.readyState === 1) {
      o.ws.send(JSON.stringify({
        tip: 'oyun_bitti',
        xallar: otaq.xallar,
        qalib,
      }));
    }
  });
}

// ─── WebSocket bağlantıları ────────────────────────────────────────────────
wss.on('connection', (ws) => {
  const oyuncuId = uuidv4();
  let oyuncuOtaq = null;

  ws.on('message', (data) => {
    let mesaj;
    try { mesaj = JSON.parse(data); } catch { return; }

    switch (mesaj.tip) {

      case 'otaq_yarat': {
        const otaq = otaqYarat();
        const oyuncu = {
          id: oyuncuId,
          ad: mesaj.ad || 'Oyunçu',
          komanda: 'A',
          hazir: false,
          alien: false,
          ws,
        };
        otaq.oyuncular.set(oyuncuId, oyuncu);
        otaq.komandalar.A.push(oyuncuId);
        oyuncuOtaq = otaq;
        ws.send(JSON.stringify({ tip: 'otaq_yaradildi', otaqId: otaq.id, oyuncuId }));
        otaqDurumunuGonder(otaq);
        break;
      }

      case 'otaqa_qosul': {
        const otaq = otaqlar.get(mesaj.otaqId);
        if (!otaq) {
          ws.send(JSON.stringify({ tip: 'xeta', mesaj: 'Otaq tapılmadı' }));
          return;
        }
        if (otaq.oyunVeziyyeti !== 'gozleme') {
          ws.send(JSON.stringify({ tip: 'xeta', mesaj: 'Oyun artıq başlayıb' }));
          return;
        }
        const komanda = otaq.komandalar.A.length <= otaq.komandalar.B.length ? 'A' : 'B';
        const oyuncu = {
          id: oyuncuId,
          ad: mesaj.ad || 'Oyunçu',
          komanda,
          hazir: false,
          alien: false,
          ws,
        };
        otaq.oyuncular.set(oyuncuId, oyuncu);
        otaq.komandalar[komanda].push(oyuncuId);
        oyuncuOtaq = otaq;
        ws.send(JSON.stringify({ tip: 'qosuldu', otaqId: otaq.id, oyuncuId, komanda }));
        otaqDurumunuGonder(otaq);
        break;
      }

      case 'ayarlar_deyish': {
        if (!oyuncuOtaq || oyuncuOtaq.oyunVeziyyeti !== 'gozleme') return;
        if (mesaj.cetinlik && CETINLIK[mesaj.cetinlik]) {
          oyuncuOtaq.cetinlik = mesaj.cetinlik;
          const cfg = CETINLIK[mesaj.cetinlik];
          oyuncuOtaq.herfleSayi = cfg.herfleSayi;
        }
        if (mesaj.kateqoriya !== undefined) {
          oyuncuOtaq.kateqoriya = mesaj.kateqoriya || null;
        }
        if (mesaj.maksimumTur) {
          oyuncuOtaq.maksimumTur = parseInt(mesaj.maksimumTur) || 10;
        }
        otaqDurumunuGonder(oyuncuOtaq);
        break;
      }

      case 'hazir': {
        if (!oyuncuOtaq) return;
        const oyuncu = oyuncuOtaq.oyuncular.get(oyuncuId);
        if (oyuncu) oyuncu.hazir = true;
        const hamisiHazir = Array.from(oyuncuOtaq.oyuncular.values()).every(o => o.hazir);
        const enAz2Oyuncu = oyuncuOtaq.oyuncular.size >= 2;
        if (hamisiHazir && enAz2Oyuncu) {
          oyuncuOtaq.oyunVeziyyeti = 'oyun';
          turBaslat(oyuncuOtaq);
        } else {
          otaqDurumunuGonder(oyuncuOtaq);
        }
        break;
      }

      case 'taxmin': {
        if (!oyuncuOtaq || oyuncuOtaq.oyunVeziyyeti !== 'oyun') return;
        const taxminci = oyuncuOtaq.oyuncular.get(oyuncuId);
        if (!taxminci || taxminci.komanda !== oyuncuOtaq.mevcudKomanda || taxminci.alien) return;

        const dogru = mesaj.cavab?.trim().toLowerCase() === oyuncuOtaq.mevcudKart?.toLowerCase();
        
        oyuncuOtaq.oyuncular.forEach(o => {
          if (o.ws.readyState === 1) {
            o.ws.send(JSON.stringify({
              tip: 'taxmin_edildi',
              oyuncu: taxminci.ad,
              cavab: mesaj.cavab,
              dogru,
            }));
          }
        });

        if (dogru) {
          oyuncuOtaq.xallar[oyuncuOtaq.mevcudKomanda]++;
          if (oyuncuOtaq.vaxtInterval) clearInterval(oyuncuOtaq.vaxtInterval);
          oyuncuOtaq.mevcudKomanda = oyuncuOtaq.mevcudKomanda === 'A' ? 'B' : 'A';
          setTimeout(() => turBaslat(oyuncuOtaq), 2000);
        }
        break;
      }

      case 'skip': {
        // Yalnız alien skip edə bilər, xal verilmir
        if (!oyuncuOtaq || oyuncuOtaq.oyunVeziyyeti !== 'oyun') return;
        const skipper = oyuncuOtaq.oyuncular.get(oyuncuId);
        if (!skipper || !skipper.alien || skipper.komanda !== oyuncuOtaq.mevcudKomanda) return;
        oyuncuOtaq.oyuncular.forEach(o => {
          if (o.ws.readyState === 1) {
            o.ws.send(JSON.stringify({ tip: 'skip_edildi', kart: oyuncuOtaq.mevcudKart }));
          }
        });
        if (oyuncuOtaq.vaxtInterval) clearInterval(oyuncuOtaq.vaxtInterval);
        oyuncuOtaq.mevcudKomanda = oyuncuOtaq.mevcudKomanda === 'A' ? 'B' : 'A';
        setTimeout(() => turBaslat(oyuncuOtaq), 1500);
        break;
      }

      case 'xal_ver': {
        // Yalnız alien score düyməsinə basa bilər → +1 xal, növbəti söz
        if (!oyuncuOtaq || oyuncuOtaq.oyunVeziyyeti !== 'oyun') return;
        const scorer = oyuncuOtaq.oyuncular.get(oyuncuId);
        if (!scorer || !scorer.alien || scorer.komanda !== oyuncuOtaq.mevcudKomanda) return;
        oyuncuOtaq.xallar[oyuncuOtaq.mevcudKomanda]++;
        oyuncuOtaq.oyuncular.forEach(o => {
          if (o.ws.readyState === 1) {
            o.ws.send(JSON.stringify({
              tip: 'taxmin_edildi',
              oyuncu: '✅ Alien təsdiq etdi',
              cavab: oyuncuOtaq.mevcudKart,
              dogru: true,
            }));
          }
        });
        if (oyuncuOtaq.vaxtInterval) clearInterval(oyuncuOtaq.vaxtInterval);
        oyuncuOtaq.mevcudKomanda = oyuncuOtaq.mevcudKomanda === 'A' ? 'B' : 'A';
        setTimeout(() => turBaslat(oyuncuOtaq), 2000);
        break;
      }

      case 'yeniden_oyna': {
        if (!oyuncuOtaq) return;
        oyuncuOtaq.xallar = { A: 0, B: 0 };
        oyuncuOtaq.turSayaci = 0;
        oyuncuOtaq.oyunVeziyyeti = 'gozleme';
        oyuncuOtaq.oyuncular.forEach(o => { o.hazir = false; o.alien = false; });
        if (oyuncuOtaq.vaxtInterval) clearInterval(oyuncuOtaq.vaxtInterval);
        otaqDurumunuGonder(oyuncuOtaq);
        break;
      }
    }
  });

  ws.on('close', () => {
    if (!oyuncuOtaq) return;
    const oyuncu = oyuncuOtaq.oyuncular.get(oyuncuId);
    if (oyuncu) {
      const k = oyuncu.komanda;
      oyuncuOtaq.komandalar[k] = oyuncuOtaq.komandalar[k].filter(id => id !== oyuncuId);
      oyuncuOtaq.oyuncular.delete(oyuncuId);
    }
    if (oyuncuOtaq.oyuncular.size === 0) {
      if (oyuncuOtaq.vaxtInterval) clearInterval(oyuncuOtaq.vaxtInterval);
      otaqlar.delete(oyuncuOtaq.id);
    } else {
      otaqDurumunuGonder(oyuncuOtaq);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🛸 WOEAT Serveri işləyir: http://localhost:${PORT}`);
});
