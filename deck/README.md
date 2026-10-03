# RouteyAI pitch deck

A 13-slide pitch deck built as a plain web page: HTML, CSS and a little JavaScript, with no build step and no libraries.

## Open it

Double-click `index.html`, or serve the folder:

```bash
npx serve deck
```

The fonts (Archivo and IBM Plex Mono) load from Google Fonts. Without internet, the deck still works but falls back to Arial.

## Share it

The deck is live at **https://routeyai-deck.vercel.app**, a separate Vercel project (`routeyai-deck`) from the main website, and anyone with the link can open it. After changing the deck, publish the new version with:

```bash
cd deck
npx vercel deploy --prod
```

This README, `.env` files and the ignore files are left out of the upload (see `.vercelignore`).

## Present it

| Key | Action |
|---|---|
| `→` `Space` `PageDown` or click | Next slide |
| `←` `PageUp` or Shift+click | Previous slide |
| `Home` / `End` | First / last slide |
| `F` | Full screen |
| Swipe | Next / previous on a phone or tablet |

You can also click any stop on the line at the bottom to jump to that slide. The address bar keeps the slide number (`index.html#5`), so a link can open a specific slide.

## Save as PDF

Open the deck in Chrome or Edge, press `Ctrl+P`, choose **Save as PDF**, and set Margins to **None**. Every slide prints on its own 16:9 page, with the animations in their finished state.

## What's in the folder

```
deck/
├── index.html        # all 13 slides, in order (<section class="slide">)
├── css/deck.css      # colours and fonts (the :root block at the top), then one block per slide
├── js/deck.js        # navigation, scaling, and the animated slides
├── js/mapdata.js     # real map data copied from the landing page (homes, K-Means run, routes)
└── assets/           # photos, map images and the logo, copied from public/ and mobile/assets/
```

The deck is drawn on a fixed 1920 × 1080 canvas and scaled to fit the screen, so it looks the same everywhere.

## Before you send it

- **Photos:** the four photos come from the landing page and are AI-generated. Replace them with real photos of pilot schools when you have them, especially before showing investors.
- **Market figures:** slide 10 uses the Ministry of Education's 2026–27 figures as reported by [Qatar Tribune](https://www.qatar-tribune.com/article/251030/latest-news/education-ministry-ready-to-receive-420000-students-in-649-public-private-schools-and-kindergartens) (29 August 2026). Check them again before a big meeting.
- **The ask:** slide 13 asks for pilot schools, partners and investors, but names no amount. Add a funding figure if you pitch to investors.
- **Team:** the closing slide names only the founder. Add a short bio, a photo or advisers if you have them.
- **Contact:** add an email address once there is one.
- **Competition (slide 3):** the comparison describes typical alternatives (spreadsheets and group chats, vehicle GPS trackers), not named companies. Check it against what schools tell you.
