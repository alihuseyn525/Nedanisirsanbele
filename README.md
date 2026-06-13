# 🛸 Nə Danışırsınız Siz?! (What On Earth Are You Talking About?)

Azərbaycan dilli multiplayer alien-çarades oyunu. Real-time WebSocket multiplayer, Node.js backend.

## 🎮 Oyun qaydaları

1. Bir otaq aç və ya koda qoşul
2. Oyunçular 2 komandaya bölünür (A və B)
3. Hər turda bir oyunçu **alien** olur — o, bir anlayışı izah etməlidir
4. Alien yalnız **transmissiya hərfləri** ilə başlayan sözlər işlədə bilər
5. Komanda yoldaşları 60 saniyə ərzində anlayışı tapmağa çalışır
6. Düzgün cavab = 1 xal
7. 10 turdan sonra daha çox xalı olan komanda qazanır

## 🔤 Azərbaycan əlifbası haqqında

Oyunda işlədilən hərflər:
```
A B C Ç D E Ə F G H X İ I J K Q L M N O Ö P R S Ş T U Ü V Y Z
```

- `İ` (nöqtəli i) və `I` (nöqtəsiz ı) — hər ikisi ayrı hərf kimi işlədilir
- `Ğ` hərfi söz başında Azərbaycanca sözlərdə işlənmədiyindən **kartlara əlavə edilməyib**

## 🚀 Quraşdırma

```bash
npm install
npm start
```

Server `http://localhost:3000` ünvanında işləyəcək.

### Development rejimi (auto-restart):
```bash
npm run dev
```

## ☁️ Deploy (Render / Railway / Fly.io)

Bu oyun WebSocket tələb edir. Aşağıdakı platformlar dəstəklənir:

### Render.com
1. GitHub reponu Render-ə qoşun
2. **Start Command:** `npm start`
3. **Environment:** `Node`

### Railway
```bash
railway init
railway up
```

### Fly.io
```bash
fly launch
fly deploy
```

## 📁 Struktur

```
woeat/
├── src/
│   └── server.js      # WebSocket + Express serveri
├── public/
│   └── index.html     # Tam oyun interfeysi (single-file)
├── package.json
└── README.md
```

## 🛠 Texnologiyalar

- **Backend:** Node.js, Express, `ws` (WebSocket)
- **Frontend:** Vanilla JS + CSS (framework yoxdur)
- **Real-time:** WebSocket (ws library)
- **UI:** Space Grotesk + Share Tech Mono fontları, CRT efekti

## ✏️ Yeni kartlar əlavə etmək

`src/server.js` faylında `YER_KARTLARI` massivini genişləndir:

```js
const YER_KARTLARI = [
  "İqlim dəyişikliyi",
  "Selfie çəkmək",
  // buraya əlavə et...
];
```
