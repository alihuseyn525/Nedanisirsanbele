const express = require('express');
const { WebSocketServer } = require('ws');
const { createServer } = require('http');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

app.use(express.static(__dirname));

const AZ_HERFLERI = ['A','B','C','Ç','D','E','Ə','F','G','H','X','İ','J','K','Q','L','M','N','O','Ö','P','R','S','Ş','T','U','Ü','V','Y','Z'];

const CETINLIK = {
  easy:      { vaxt:120, herfleSayi:7 },
  medium:    { vaxt:90,  herfleSayi:6 },
  hard:      { vaxt:60,  herfleSayi:5 },
  nightmare: { vaxt:45,  herfleSayi:4 },
};

const KATEQORIYALAR = {
  'Gündəlik Həyat':['Bazara getmək','Yuxuya getmək','Nahar etmək','Paltarları yığmaq','Dişlərini fırçalamaq','Ev yığışdırmaq','Duş almaq','Telefonu şarj etmək','Metroya minmək','Avtobus gözləmək','Qapını bağlamaq','İşığı söndürmək','Pəncərəni açmaq','Qəhvə dəmləmək','Çay içmək','Naharı bişirmək','Paltarları yumaq','Zibili atmaq','Mağazaya getmək','Kəmər bağlamaq','Əllərini yumaq','Üzünü yumaq','Saçlarını daramaq','Geyinmək','Soyunmaq','Getmək','Gəlmək','Oturmaq','Qalxmaq','Qaçmaq','Gülmək','Ağlamaq','Danışmaq','Fikirləşmək','Oxumaq','Yazmaq','Dinləmək','Baxmaq','Gözləmək','Həyəcanlanmaq','Sevinmək','Kədərlənmək','Qorxmaq','Utanmaq','Qonşuya getmək','Dostla görüşmək','Əl sıxmaq','Sarılmaq'],
  'Texnologiya':['Süni intellekt','Smartfon','Klaviatura','Şifrə','Bulud xidməti','Proqramlaşdırma','Veb sayt','Proqram yeniləmək','Fayl göndərmək','Çap etmək','Bluetooth','WiFi','USB kabel','Ekran görüntüsü','Kamera','Batareya','Mikrofon','Dinamik','Sensor ekran','Noutbuk','Planşet','Smartsaat','Qulaqlıq','Proyektor','Kompüter','Siçan','Monitor','Server','Şəbəkə','Proqram','Tətbiq','Oyun konsolu','Robotika','Dron','Elektrik avtomobil','Solar panel','3D printer','Virtual gerçəklik','Blockchain','Chatbot','Avtomatlaşdırma','Maşın öyrənməsi','Neyron şəbəkə','Hack etmək','Virus','Firewall'],
  'İnternet':['Sosial media','Video yükləmək','Canlı yayım','Şərh yazmaq','Like vermək','Paylaşım etmək','Abunə olmaq','Axtar','Spam','Meme','Viral video','Blog yazmaq','Podcast dinləmək','Online alış-veriş','Video zəng','Mesaj göndərmək','Stiker','Emoji','Story paylaşmaq','Tweet atmaq','Hashtag','İnfluencer','Streamer','Troll','Fake news','Şəkil çəkmək','Filtr vurmaq','Caption yazmaq','Tag etmək','DM göndərmək','Repost etmək','Block etmək','Şifrəni unutmaq','Hesabı silmək','Bio yazmaq','Link paylaşmaq','Görüntülü danışmaq','Grup yaratmaq','Kanal açmaq','Reklam bloklamaq'],
  'Oyun':['Baş oyunçu','Takım oyunu','Qalib gəlmək','Məğlub olmaq','Xal toplamaq','Canını itirmək','Yeni səviyyə','Güclü silah','Gizli keçid','Multiplayer','Singl oyunçu','RPG','FPS','Strategiya oyunu','Dünya rekordu','Speed run','Easter egg','Patch yeniləmək','DLC almaq','Turnir oynamaq','Joystick','Respawn olmaq','Loot toplamaq','Boss döyüşü','Final missiya','Yarış oyunu','Döyüş oyunu','Platformer','Sandbox','Survival oyunu','Lag etmək','Disconnect olmaq','Cheater','Achievement qazanmaq','Game over','Yenidən başlamaq','Save etmək'],
  'Yemək':['Pizza bişirmək','Sushi yemək','Burger sifariş etmək','Tort kəsmək','Dondurma yemək','Salat hazırlamaq','Sup bişirmək','Qril etmək','Çörək kəsmək','Meyvə sıxmaq','Şokolad yemək','Popcorn etmək','Makaron bişirmək','Yumurta qızartmaq','Pendir kəsmək','Xəmir yoğurmaq','Sobaya qoymaq','Lahmacun','Döner kebab','Plov','Dolma','Aşure','Baklava','Şəkərbura','Qutab','Limonad hazırlamaq','Smoothie etmək','Restoran seçmək','Menüyə baxmaq','Sifariş vermək','Yeməyi dadmaq','Duz əlavə etmək','Ədviyyat vurmaq'],
  'Kino':['Aksion film','Komediya','Dram','Qorxu filmi','Animasiya','Treyler izləmək','Kinoteatra getmək','Bilet almaq','Ssenari yazmaq','Aktyor oynamaq','Rejissor','Prodüser','Xüsusi effektlər','Grim vurmaq','Kostyum geymək','Oskar mükafatı','Film serial','Spin-off','Prequel','Sequel','Sənəd filmi','Biografi','Tarixi film','Elm-fantastika','Romantik film','Triller','Detektiv','Müharibə filmi','Kinematografiya','Drone çəkişi'],
  'Məktəb':['İmtahan vermək','Ev tapşırığı etmək','Dərsə getmək','Müəllimə sual vermək','Taxta yazmaq','Dəftərə qeyd etmək','Kitab açmaq','Rəsm çəkmək','Hesab etmək','Hekayə yazmaq','İnşa yazmaq','Şeir əzbərləmək','Kimya eksperimenti','Biologiya dərsi','Fizika formulu','Tarix dərsi','Riyaziyyat','Coğrafiya','Musiqi dərsi','Bədən tərbiyəsi','Yeməkxanada yemək','Kitabxanaya getmək','Sinfə gecikmək','Qiymət götürmək','Attestat almaq','Lövhəni silmək','Prezentasiya etmək','İmla yazmaq','Test çözmək','Çantanı hazırlamaq','Karandaş itirmək'],
  'Elm':['Atom nüvəsi','Qara dəlik','Gen mutasiyası','Vaksin hazırlamaq','Teleskopla baxmaq','Mikroskop istifadə etmək','Kimyəvi reaksiya','Elektromaqnetizm','Termodinamika','Kvant mexanikası','Nüvə energiyası','Zülal sintezi','DNT sekvenasiyası','Hüceyrə bölünməsi','Rentgen şüası','Meteorit tapşmaq','Orbitə çıxmaq','Aya uçmaq','Marsı araşdırmaq','Seismoqraf oxumaq','Vulkan püskürmək','Ozon qatı','Qlobal isınma','Fotosintez','Metabolizm','Beyin skanı','Kök hüceyrə','Nanoteknologiya','Nobel mükafatı','Hesablamaq','Ölçmək','Müşahidə etmək','Hipotez qurmaq'],
  'İdman':['Qol vurmaq','Penalti atmaq','Sarı kart almaq','Qapını qorumaq','Basketbol atmaq','Voleybol vurmaq','Üzmək','Qaçmaq','Atlamaq','Ağırlıq qaldırmaq','Boks etmək','Güləşmək','Karate etmək','Velosiped sürmək','İdman zalına getmək','Komanda qurmaq','Çempionluq qazanmaq','Rekord qırmaq','Mükafat almaq','Stadiona getmək','Transfer keçmək','Kontrat imzalamaq','Pensiyaya çıxmaq','Ox atmaq','Dart atmaq'],
  'Heyvanlar':['İt saxlamaq','Pişik oxşamaq','Balıq bəsləmək','Dovşan saxlamaq','İti gəzdirmək','Fil xortumu','Zürafə boynu','Dəvə dörkəci','Aslan yalı','Qanad çırpmaq','Uçmaq','Sürünmək','Hürməkk','Miyavlamaq','Ov etmək','Gizlənmək','Hayvanat bağına getmək','Dəniz atı','Ağ ayı','Qorilla','Qar bəbiri','Mavi nəhəng balina'],
  'Ölkələr':['Azərbaycanlı olmaq','Türk mədəniyyəti','İtalyan pizzası','Fransız ətriyyatı','Yapon texnologiyası','Çin Səddini görmək','Parisdə olmaq','Londona getmək','Nyu-Yorkda yaşamaq','Pasport almaq','Viza müraciəti','Turist olaraq gəzmək','Xarici dildə danışmaq','Suvenir almaq','Valuta dəyişmək','Braziliyada karneval','Hindistanda düyün','Misirdə ehram','Almaniyada Oktoberfest','Hollandiyada lale tarlası','Koreyadakı K-pop konserti','Meksikadakı Mayalara baxmaq','Argentinada tango'],
  'Tarix':['Piramida tikintisi','Gladiator döyüşü','Şəvalye olmaq','Kral taxtı almaq','Müharibə bəyan etmək','Sülh müqaviləsi imzalamaq','İstila etmək','Fransız inqilabı','Amerikan müstəqilliyi','Sovet dövrü','Osmanlı imperiyası','Moğol yürüşü','Vikinglərin yürüşü','Sparta döyüşçüsü','Qədim Babil','Şumer yazısı','Hiyeroqliflər oxumaq','İkinci Dünya müharibəsi','Soyuq müharibə','Berlini birləşdirmək','Aya ayaq basmaq','Xəritə çizmək','Teleskop ixtira etmək','Sənaye inqilabı','Elektrik kəşf etmək'],
  'Məşhur İnsanlar':['Eynşteynin formulu','Sokrat müzakirəsi','Leonardonun rəsmi','Şekspirin pyesi','Napoleonun döyüşü','Kleopatranın saçı','Nizaminin dastan','Üzeyir Hacıbəyovun opera','Bülbülün mahnısı','Maykl Ceksonun moonwalk','Bitlzin mahnısı','Motzartin simfoniyası','Pele topu vurmaq','Federerin servis','Elon Muskin raketi','Bil Qeytsın kompüteri','Stiv Cobsun iPhone','Mark Zukerberqin şəbəkəsi','Van Qoqun qulağı','Pikassonun kubiizm','Dali saqqalı','Nyutonun alma'],
  'Brendlər':['Alma şirkəti','Kola içkisi','Üç zolaqlı idman paltar','Timsah emblemli köynək','Dördqolu üzük','At başı emblemi','Düzgün tıq işarəsi','Narıncı-qara robot','Mavi quş','İki qızıl qövslər','Yaşıl sırena','Kofein içkisi sifariş etmək','Onlayn bazar almaq','Enerji içkisi içmək','Protein barı yemək','Avtomobil icarəsi','Oteli bron etmək','Aviabilet almaq','Brendin logosunu tanımaq'],
  'Coğrafiya':['Dağın zirvəsinə çıxmaq','Çay boyunca üzmək','Səhraya girmək','Ormanı keçmək','Adalara üzmək','Buzlaqda yerişmək','Kanyon keçmək','Xəritəyə baxmaq','GPS işlətmək','Vulkana yaxınlaşmaq','Geyzer izləmək','Mağara araşdırmaq','Bataqlığa girmək','Antarktidaya getmək','Meridian keçmək','Ekvator üzərindən keçmək','Limanı gəzmək','Şəlalənin altında durmaq','Dağ keçidini aşmaq','Okean yatağını araşdırmaq'],
  'Kitablar':['Romanı oxumaq','Şeir əzbərləmək','Nağıl danışmaq','Hekayə yazmaq','Kitab mağazasına getmək','E-kitab oxumaq','Audio kitab dinləmək','Müəlliflə görüşmək','Kitab klubuna qatılmaq','Dedektiv araşdırmaq','Cinayəti həll etmək','Fantastik aləm','Uşaq kitabı','Klassik əsər','Müasir roman','Şair olmaq','Avtobioqrafiya oxumaq','Məmuar yazmaq','Jurnal tutmaq','Ön sözü oxumaq'],
  'Cizgi Filmlər':['Superqəhrəman uçmaq','Sehrli dəyənək tutmaq','Nəhəng olmaq','Planeti qurtarmaq','Sualtı dünyada yaşamaq','Kosmos gəmisini idarə etmək','Dinozavr olmaq','Robot olmaq','Sehirli dünyaya girmək','Sehrbaz olmaq','Anime qəhrəman','Manga oxumaq','Pixar filmi','Disney prinsesi','Ghibli ruhu','Baş qəhrəman olmaq','Macəra başlamaq','Problemi həll etmək','Uşaqlıq xatirəsi'],
  'TV Şouları':['Reality şouya qatılmaq','Vokal müsabiqəsi','Yemək yarışı','Evlilik şou','Detektiv serial izləmək','Efirə çıxmaq','Canlı yayımlanmaq','Talk-şou aparıcısı','Komediya şouu','Xəbər müxbiri olmaq','Mövsümü bitirmək','Kliffhanger','Binge-watch etmək','Bir gecədə bitirmək','Fan teoriya yazmaq','Striming abunəliyi','Reklam atlamaq','Altmatn açmaq'],
  'Əşyalar':['Saatı taxmaq','Gözlük tapmaq','Çantanı bağlamaq','Açarı itirmək','Cüzdanı açmaq','Qapını açmaq','Karandaşı siləklə qaytarmaq','Qayçı kəsmək','Çəkici vurmaq','Mıxı sancmaq','Rəngi sürtmək','Yorğanı sərpib uzanmaq','Stulda oturmaq','Masada yazmaq','Boyunbağı taxmaq','Sırğa vurmaq','Üzük taxmaq','Çəkmə geymək','Kepka taxmaq','Şal bağlamaq','Açarı çevirmək'],
  'Peşələr':['Həkim muayinəsi','Müəllim dərsi','Mühəndis layihəsi','Pilot uçuşu','Aşpaz yeməyi','Aktyor oyunu','Müğənni mahnısı','Rəssam tablosu','Yazıçı romanı','Jurnalist reportajı','Hüquqçu müdafiəsi','Hakim qərarı','Polis müdaxiləsi','İtfaiyəçi söndürmə','Arkeoloji qazıntı','Tibbi cərrahiyyə','Mühasib hesabı','Marketinq kampaniyası','Fotoqraf çəkiş','Bərbər saç kəsmək','Psixoloq danışmaq','Olimpiya çempionu'],
};

const BUTUN_SOZLER = Object.values(KATEQORIYALAR).flat();
const otaqlar = new Map();

function rastgeleHerfler(sayi) {
  const s = new Set();
  while (s.size < sayi) s.add(AZ_HERFLERI[Math.floor(Math.random()*AZ_HERFLERI.length)]);
  return [...s];
}
function rastgeleKart(kat) {
  const pool = kat && KATEQORIYALAR[kat] ? KATEQORIYALAR[kat] : BUTUN_SOZLER;
  return pool[Math.floor(Math.random()*pool.length)];
}
function secimYarat(dogru, kat) {
  const pool = (kat && KATEQORIYALAR[kat] ? KATEQORIYALAR[kat] : BUTUN_SOZLER).filter(s => s !== dogru);
  const yanlis = pool.sort(() => Math.random()-0.5).slice(0,19);
  const hamisi = [dogru, ...yanlis].sort(() => Math.random()-0.5);
  return hamisi;
}

// oyunModu: 'teamsiz' (2-3 nəfər, 1 guesser, ümumi xal) | 'teamli' (4+ nəfər, hər teamda 1 guesser)
function otaqYarat() {
  const id = Math.random().toString(36).substr(2,6).toUpperCase();
  const otaq = {
    id,
    sahibId: null,          // Room owner
    oyuncular: new Map(),
    komandalar: {A:[],B:[]},
    oyunVeziyyeti: 'gozleme',
    mevcudKart: null, mevcudHerfler: [],
    mevcudKomanda: 'A',
    xallar: {A:0,B:0,umumiXal:0}, // umumiXal for teamsiz mode
    turSayaci: 0, maksimumTur: 10,
    vaxt: 60, vaxtInterval: null,
    cetinlik: 'medium', kateqoriya: null, herfleSayi: 6,
    secimler: [], guessHaqqi: 3, alienHerfler: {},
    oyunModu: 'teamsiz', // default
    guesserIndex: 0, // teamsiz modda kim guesser (rotation)
  };
  otaqlar.set(id, otaq);
  return otaq;
}

// teamsiz modda alien (açıqlayan): BÜTÜN oyuncular alien (heç biri guesser deyil? Yox - 1 nəfər guesser, qalanlar alien)
// Hər turda guesser növbəylə dəyişir.
function teamsizGuesserTap(otaq) {
  const oyuncular = [...otaq.oyuncular.values()];
  if (!oyuncular.length) return null;
  return oyuncular[otaq.guesserIndex % oyuncular.length];
}

function otaqDurumunuGonder(otaq) {
  const base = {
    tip:'otaq_durumu', otaqId:otaq.id,
    sahibId: otaq.sahibId,
    oyuncular: Array.from(otaq.oyuncular.values()).map(o=>({id:o.id,ad:o.ad,komanda:o.komanda,hazir:o.hazir,alien:o.alien,guesser:o.guesser})),
    komandalar: otaq.komandalar,
    oyunVeziyyeti: otaq.oyunVeziyyeti,
    xallar: otaq.xallar,
    turSayaci: otaq.turSayaci, maksimumTur: otaq.maksimumTur,
    vaxt: otaq.vaxt, cetinlik: otaq.cetinlik, kateqoriya: otaq.kateqoriya,
    kateqoriyalar: Object.keys(KATEQORIYALAR), mevcudKomanda: otaq.mevcudKomanda,
    guessHaqqi: otaq.guessHaqqi, oyunModu: otaq.oyunModu,
  };
  otaq.oyuncular.forEach(oyuncu => {
    const d = {...base};
    if (otaq.oyunVeziyyeti === 'oyun') {
      // Her aliena oz herf desti
      d.mevcudHerfler = (otaq.alienHerfler && otaq.alienHerfler[oyuncu.id]) || [];
      if (otaq.oyunModu === 'teamsiz') {
        // teamsiz: 1 guesser, qalanlar alien
        if (oyuncu.alien) {
          d.mevcudKart = otaq.mevcudKart;
          d.secimler = null;
        } else if (oyuncu.guesser) {
          d.mevcudKart = null;
          d.secimler = otaq.secimler;
        } else {
          d.mevcudKart = null; d.secimler = null;
        }
      } else {
        // teamli
        const benimKomanda = oyuncu.komanda === otaq.mevcudKomanda;
        if (oyuncu.alien && benimKomanda) {
          d.mevcudKart = otaq.mevcudKart; d.secimler = null;
        } else if (!oyuncu.alien && benimKomanda) {
          d.mevcudKart = null; d.secimler = otaq.secimler;
        } else {
          d.mevcudKart = null; d.secimler = null;
        }
      }
    }
    if (oyuncu.ws.readyState === 1) oyuncu.ws.send(JSON.stringify(d));
  });
}

function yeniSozYukle(otaq) {
  otaq.mevcudKart = rastgeleKart(otaq.kateqoriya);
  otaq.secimler = secimYarat(otaq.mevcudKart, otaq.kateqoriya);
  otaq.guessHaqqi = 3;
  // Her alien ucun ferqli herf desti
  otaq.alienHerfler = {};
  otaq.oyuncular.forEach(o => {
    if (o.alien) otaq.alienHerfler[o.id] = rastgeleHerfler(otaq.herfleSayi);
  });
  otaqDurumunuGonder(otaq);
}

function turBaslat(otaq) {
  if (otaq.turSayaci >= otaq.maksimumTur) { oyunuBitir(otaq); return; }
  otaq.turSayaci++;
  if (otaq.oyunModu === 'teamsiz') {
    // Hər turda 1 guesser, qalanlar alien
    const oyuncular = [...otaq.oyuncular.values()];
    const guesser = teamsizGuesserTap(otaq);
    oyuncular.forEach(o => { o.alien = (o.id !== guesser.id); o.guesser = (o.id === guesser.id); });
  } else {
    // Teamli mod - mevcud komanda
    const komandaOyunculari = Array.from(otaq.oyuncular.values()).filter(o=>o.komanda===otaq.mevcudKomanda);
    komandaOyunculari.forEach(o=>{o.alien=false;o.guesser=false;});
    // 1 nəfər guesser, qalanlar alien
    if (komandaOyunculari.length) {
      const guesserO = komandaOyunculari[(otaq.turSayaci-1) % komandaOyunculari.length];
      komandaOyunculari.forEach(o => { o.guesser = (o.id === guesserO.id); o.alien = (o.id !== guesserO.id); });
    }
    // Digər komanda - izləyici
    Array.from(otaq.oyuncular.values()).filter(o=>o.komanda!==otaq.mevcudKomanda).forEach(o=>{o.alien=false;o.guesser=false;});
  }

  yeniSozYukle(otaq);
  const cfg = CETINLIK[otaq.cetinlik]||CETINLIK.medium;
  otaq.vaxt = cfg.vaxt;
  if (otaq.vaxtInterval) clearInterval(otaq.vaxtInterval);
  otaq.vaxtInterval = setInterval(()=>{
    otaq.vaxt--;
    if (otaq.vaxt<=0) {
      clearInterval(otaq.vaxtInterval);
      if (otaq.oyunModu === 'teamsiz') {
        // Növbəti guesser
        otaq.guesserIndex++;
      } else {
        otaq.mevcudKomanda = otaq.mevcudKomanda==='A'?'B':'A';
      }
      turBaslat(otaq);
    } else {
      otaqDurumunuGonder(otaq);
    }
  }, 1000);
  otaqDurumunuGonder(otaq);
}

function oyunuBitir(otaq) {
  if (otaq.vaxtInterval) clearInterval(otaq.vaxtInterval);
  otaq.oyunVeziyyeti='bitdi';
  let qalib;
  if (otaq.oyunModu === 'teamsiz') {
    qalib = 'umumiXal';
  } else {
    qalib = otaq.xallar.A>otaq.xallar.B?'A':otaq.xallar.B>otaq.xallar.A?'B':'berabere';
  }
  otaq.oyuncular.forEach(o=>{
    if (o.ws.readyState===1) o.ws.send(JSON.stringify({tip:'oyun_bitti',xallar:otaq.xallar,qalib,oyunModu:otaq.oyunModu}));
  });
}

app.get('/api/otaqlar',(req,res)=>{
  const list=[];
  otaqlar.forEach(o=>{ if(o.oyunVeziyyeti==='gozleme') list.push({id:o.id,oyuncuSayi:o.oyuncular.size,cetinlik:o.cetinlik,kateqoriya:o.kateqoriya,oyunModu:o.oyunModu}); });
  res.json(list);
});

wss.on('connection',(ws)=>{
  const oyuncuId = uuidv4();
  let oyuncuOtaq = null;

  ws.on('message',(data)=>{
    let m; try{m=JSON.parse(data);}catch{return;}
    switch(m.tip){
      case 'otaq_yarat':{
        const otaq=otaqYarat();
        otaq.sahibId = oyuncuId;
        const o={id:oyuncuId,ad:m.ad||'Oyunçu',komanda:'A',hazir:false,alien:false,guesser:false,ws};
        otaq.oyuncular.set(oyuncuId,o); otaq.komandalar.A.push(oyuncuId);
        oyuncuOtaq=otaq;
        ws.send(JSON.stringify({tip:'otaq_yaradildi',otaqId:otaq.id,oyuncuId,sahibId:otaq.sahibId}));
        otaqDurumunuGonder(otaq); break;
      }
      case 'otaqa_qosul':{
        const otaq=otaqlar.get(m.otaqId);
        if(!otaq){ws.send(JSON.stringify({tip:'xeta',mesaj:'Otaq tapılmadı'}));return;}
        if(otaq.oyunVeziyyeti!=='gozleme'){ws.send(JSON.stringify({tip:'xeta',mesaj:'Oyun artıq başlayıb'}));return;}
        const k=otaq.komandalar.A.length<=otaq.komandalar.B.length?'A':'B';
        const o={id:oyuncuId,ad:m.ad||'Oyunçu',komanda:k,hazir:false,alien:false,guesser:false,ws};
        otaq.oyuncular.set(oyuncuId,o); otaq.komandalar[k].push(oyuncuId);
        oyuncuOtaq=otaq;
        ws.send(JSON.stringify({tip:'qosuldu',otaqId:otaq.id,oyuncuId,komanda:k,sahibId:otaq.sahibId}));
        otaqDurumunuGonder(otaq); break;
      }
      case 'ayarlar_deyish':{
        if(!oyuncuOtaq||oyuncuOtaq.oyunVeziyyeti!=='gozleme') return;
        if(oyuncuOtaq.sahibId!==oyuncuId) return; // Yalnız sahib
        if(m.cetinlik&&CETINLIK[m.cetinlik]){oyuncuOtaq.cetinlik=m.cetinlik;oyuncuOtaq.herfleSayi=CETINLIK[m.cetinlik].herfleSayi;}
        if(m.kateqoriya!==undefined) oyuncuOtaq.kateqoriya=m.kateqoriya||null;
        if(m.maksimumTur) oyuncuOtaq.maksimumTur=parseInt(m.maksimumTur)||10;
        if(m.oyunModu&&(m.oyunModu==='teamsiz'||m.oyunModu==='teamli')) oyuncuOtaq.oyunModu=m.oyunModu;
        otaqDurumunuGonder(oyuncuOtaq); break;
      }
      case 'oyuncu_koc':{
        // Sahib oyuncunu komanda dəyişdirir
        if(!oyuncuOtaq||oyuncuOtaq.oyunVeziyyeti!=='gozleme') return;
        if(oyuncuOtaq.sahibId!==oyuncuId) return;
        const {hdfOyuncuId, yeniKomanda} = m;
        if(!hdfOyuncuId||!['A','B'].includes(yeniKomanda)) return;
        const hdf = oyuncuOtaq.oyuncular.get(hdfOyuncuId);
        if(!hdf) return;
        const eskiKomanda = hdf.komanda;
        if(eskiKomanda===yeniKomanda) return;
        oyuncuOtaq.komandalar[eskiKomanda] = oyuncuOtaq.komandalar[eskiKomanda].filter(id=>id!==hdfOyuncuId);
        oyuncuOtaq.komandalar[yeniKomanda].push(hdfOyuncuId);
        hdf.komanda = yeniKomanda;
        otaqDurumunuGonder(oyuncuOtaq); break;
      }
      case 'hazir':{
        if(!oyuncuOtaq) return;
        const o=oyuncuOtaq.oyuncular.get(oyuncuId);
        if(o) o.hazir=true;
        const oyuncularArr = Array.from(oyuncuOtaq.oyuncular.values());
        if(oyuncularArr.every(x=>x.hazir)&&oyuncuOtaq.oyuncular.size>=2){
          // Oyun modu: 4+ nəfər teamli, 2-3 nəfər teamsiz (unless override)
          // (sahib seçə bilər, yəni artıq ayarlar_deyish ilə set edilib)
          oyuncuOtaq.oyunVeziyyeti='oyun';
          oyuncuOtaq.guesserIndex=0;
          turBaslat(oyuncuOtaq);
        } else otaqDurumunuGonder(oyuncuOtaq);
        break;
      }
      case 'secim':{
        if(!oyuncuOtaq||oyuncuOtaq.oyunVeziyyeti!=='oyun') return;
        const guesser=oyuncuOtaq.oyuncular.get(oyuncuId);
        if(!guesser||!guesser.guesser) return;
        // teamli modda yalnız aktif komanda
        if(oyuncuOtaq.oyunModu==='teamli'&&guesser.komanda!==oyuncuOtaq.mevcudKomanda) return;
        const dogru = m.secim===oyuncuOtaq.mevcudKart;
        if(dogru){
          if(oyuncuOtaq.oyunModu==='teamsiz'){
            oyuncuOtaq.xallar.umumiXal++;
          } else {
            oyuncuOtaq.xallar[oyuncuOtaq.mevcudKomanda]++;
          }
          oyuncuOtaq.oyuncular.forEach(o=>{ if(o.ws.readyState===1) o.ws.send(JSON.stringify({tip:'secim_netice',secim:m.secim,dogru:true,oyunModu:oyuncuOtaq.oyunModu,umumiXal:oyuncuOtaq.xallar.umumiXal})); });
          yeniSozYukle(oyuncuOtaq);
        } else {
          oyuncuOtaq.guessHaqqi--;
          if(oyuncuOtaq.guessHaqqi<=0){
            oyuncuOtaq.oyuncular.forEach(o=>{ if(o.ws.readyState===1) o.ws.send(JSON.stringify({tip:'secim_netice',secim:m.secim,dogru:false,haqq:0,mevcudKart:oyuncuOtaq.mevcudKart})); });
            // Növbəti tur / guesser dəyişimi
            if(oyuncuOtaq.oyunModu==='teamsiz') oyuncuOtaq.guesserIndex++;
            else oyuncuOtaq.mevcudKomanda = oyuncuOtaq.mevcudKomanda==='A'?'B':'A';
            if(oyuncuOtaq.vaxtInterval) clearInterval(oyuncuOtaq.vaxtInterval);
            turBaslat(oyuncuOtaq);
          } else {
            oyuncuOtaq.oyuncular.forEach(o=>{ if(o.ws.readyState===1) o.ws.send(JSON.stringify({tip:'secim_netice',secim:m.secim,dogru:false,haqq:oyuncuOtaq.guessHaqqi})); });
            otaqDurumunuGonder(oyuncuOtaq);
          }
        }
        break;
      }
      case 'skip':{
        if(!oyuncuOtaq||oyuncuOtaq.oyunVeziyyeti!=='oyun') return;
        const skipper=oyuncuOtaq.oyuncular.get(oyuncuId);
        if(!skipper||!skipper.alien) return;
        if(oyuncuOtaq.oyunModu==='teamli'&&skipper.komanda!==oyuncuOtaq.mevcudKomanda) return;
        const skippeKart = oyuncuOtaq.mevcudKart;
        yeniSozYukle(oyuncuOtaq);
        oyuncuOtaq.oyuncular.forEach(o=>{ if(o.ws.readyState===1) o.ws.send(JSON.stringify({tip:'skip_edildi',kart:skippeKart})); });
        break;
      }
      case 'yeniden_oyna':{
        if(!oyuncuOtaq) return;
        oyuncuOtaq.xallar={A:0,B:0,umumiXal:0}; oyuncuOtaq.turSayaci=0; oyuncuOtaq.oyunVeziyyeti='gozleme';
        oyuncuOtaq.guesserIndex=0;
        oyuncuOtaq.oyuncular.forEach(o=>{o.hazir=false;o.alien=false;o.guesser=false;});
        if(oyuncuOtaq.vaxtInterval) clearInterval(oyuncuOtaq.vaxtInterval);
        otaqDurumunuGonder(oyuncuOtaq); break;
      }
    }
  });

  ws.on('close',()=>{
    if(!oyuncuOtaq) return;
    const o=oyuncuOtaq.oyuncular.get(oyuncuId);
    if(o){oyuncuOtaq.komandalar[o.komanda]=oyuncuOtaq.komandalar[o.komanda].filter(id=>id!==oyuncuId);oyuncuOtaq.oyuncular.delete(oyuncuId);}
    // Sahib çıxarsa, növbəti oyuncuya ver
    if(oyuncuOtaq.sahibId===oyuncuId){
      const ilk=[...oyuncuOtaq.oyuncular.values()][0];
      oyuncuOtaq.sahibId=ilk?ilk.id:null;
    }
    if(oyuncuOtaq.oyuncular.size===0){if(oyuncuOtaq.vaxtInterval)clearInterval(oyuncuOtaq.vaxtInterval);otaqlar.delete(oyuncuOtaq.id);}
    else otaqDurumunuGonder(oyuncuOtaq);
  });
});

const PORT=process.env.PORT||3000;
server.listen(PORT,()=>console.log(`🛸 WOEAT: http://localhost:${PORT}`));
