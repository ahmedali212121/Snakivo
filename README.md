# Snakivo — Launch Ready v1.6.0

This build is the recommended pre-launch Snakivo package.

## Gameplay
- Realtime Socket.IO multiplayer
- Bots OFF by default with home-screen toggle
- Country skins, including the special Saudi swords-and-palm design
- Coins, daily reward, ad/coin skin unlock hooks
- Rare Golden Food, Boost, Mini Map, Kill Streak bonuses, Leaderboard
- Mobile joystick, sound effects, EN + Arabic
- Rewarded-ad or Coin bigger respawn

## New in v1.6.0
- In-game Menu button and ESC menu
- Resume / Home / Sound / Language
- Home cleanly leaves the current match and returns without refreshing
- SEO title, description, canonical, Open Graph and VideoGame JSON-LD
- /guide.html and /faq.html with original game information
- Expanded About / Privacy / Terms / Contact
- Dynamic /robots.txt and /sitemap.xml
- Dynamic /ads.txt controlled by environment variables
- Optional AdSense head script injection controlled by environment variables
- Custom 404 page

## Local run
1. `npm.cmd install`
2. `npm.cmd start`
3. Open `http://localhost:3000`

## Production environment variables
Set these only after your real domain and AdSense account/site are ready:

`PUBLIC_URL=https://your-real-domain.com`

`ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXX`

`ADSENSE_PUBLISHER_ID=XXXXXXXXXXXXXXXX`

`ADSENSE_CLIENT` injects the official AdSense loader only when it matches `ca-pub-<digits>`.
`ADSENSE_PUBLISHER_ID` generates the correct root `/ads.txt` seller line.

## Before requesting AdSense review
1. Replace the placeholder Contact message with a real support email.
2. Set PUBLIC_URL to the final HTTPS domain.
3. Set the correct AdSense client/publisher IDs.
4. Configure Google's required consent/CMP settings for applicable visitors.
5. Test every page publicly over HTTPS.
6. Submit `/sitemap.xml` in Google Search Console.
7. Confirm `/robots.txt` and `/ads.txt` load from the final domain.
8. Connect a real approved rewarded-ad implementation. The current rewarded-ad actions are demo hooks only and must grant rewards only after the ad provider confirms completion.

No code package can guarantee AdSense approval. Google reviews the live site and its compliance, content quality, navigation, privacy practices and other publisher requirements.
