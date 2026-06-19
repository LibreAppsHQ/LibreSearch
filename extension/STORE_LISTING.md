# Store listing copy

Reference for Microsoft Edge Add-ons, Chrome Web Store, and Mozilla AMO
submissions. Copy/paste each section into the relevant store dashboard.

---

## 1. Name

**LibreSearch - Private Search**

(Edge: 50 char max. Chrome WS: 45 char max. AMO: 50 char max. Above fits all.)

## 2. Summary / Short description (one line)

> Search the web privately. No tracking, no profiles, no ads - and a tiny popup that gets out of your way.

(Edge: 200 char max. Chrome WS: 132 char max. AMO: 250 char max.
The above is **128 chars** so it fits Chrome too.)

## 3. Detailed description

```text
LibreSearch is a privacy-respecting search frontend for the open web. This extension lets you search LibreSearch from your browser's toolbar, address bar, or right-click menu - with zero tracking, zero profiles, and zero ads.

What you get:
• Quick-search popup with Web, Images, Videos, and News tabs
• Right-click any selected text on any page to search it on LibreSearch
• Type "libre <query>" in the address bar to search from anywhere
• Adds LibreSearch to your browser's search engine picker so you can make it your default
• Settings page with safe search, region, default tab, and 5 themes (Auto, Dark, Light, Slate, Sand)
• Settings sync across the browsers you're signed into

What it does NOT do:
• Track you. No analytics, no telemetry, no usage beacons.
• Read your tabs or page content. Zero host permissions.
• Phone home or auto-update outside the store's normal update channel.
• Change your default search engine silently. You stay in control.

Permissions explained:
• "contextMenus" - adds the right-click "Search LibreSearch for X" entry. Only sees text you explicitly highlight and choose to send.
• "storage" - stores your preferences across devices.

Open source under AGPL-3.0. Source: https://github.com/LibreAppsHQ/LibreSearch
Learn more: https://libresearch.ca
Privacy policy: https://libresearch.ca/privacy
```

## 4. Category

**Productivity** (specifically: search / workflow)

## 5. Search terms / keywords

Use these (Edge and Chrome both allow comma-separated):

```
private search, search engine, privacy, no tracking, libresearch, anonymous search, alternative search, default search
```

## 6. Privacy policy URL

```
https://libresearch.ca/privacy
```

## 7. Support / Homepage URL

```
https://libresearch.ca
```

## 8. Support email

```
grady.korchinski@gmail.com
```

## 9. Pricing / monetization

**Free.** No in-app purchases. No ads.

## 10. Languages

English (en-US).

## 11. Screenshots checklist

You need at least 1 for Edge; recommend 3–4 across all stores. **Required size: 1280×800 or 640×400.**

- [ ] **Popup, default state** - open the popup on any page, capture it. Crop to 1280×800.
- [ ] **Popup, Images tab selected** - shows the segmented tab indicator slid over
- [ ] **Options page, Themes section** - shows all five theme tiles
- [ ] **Right-click context menu** - select some text on a webpage, right-click, screenshot the menu showing "Search LibreSearch for 'X'"

How to capture: use the browser's built-in screenshot (Firefox: right-click → Take Screenshot. Chrome/Edge: DevTools → Cmd/Ctrl+Shift+P → "Capture screenshot").

## 12. Promotional images (optional but recommended)

- **Small promo tile** - 440×280, used in store search results
- **Marquee** - 1400×560, used in featured carousels

Skip these for v0.1.0; add for v0.2 once you've gathered feedback.

## 13. Edge-specific submission notes

- **Notes for certification**: paste this into the "Notes for certification" box so the reviewer doesn't get tripped up:

  > This extension adds LibreSearch (https://libresearch.ca) as a selectable search engine via `chrome_settings_overrides.search_provider` with `is_default: false`. It does NOT silently change the user's default - the user must promote it via Edge's search engine settings. The popup, omnibox keyword `libre`, and right-click context menu all open searches on libresearch.ca only. No host_permissions are requested. Source: https://github.com/LibreAppsHQ/LibreSearch

- **Country availability**: Worldwide is fine.
- **Age rating**: 3+ (no objectionable content).

## 14. AMO-specific notes (when you submit to Firefox later)

AMO requires the source bundle for any extension that uses a build step.
Upload `extension/` as a tarball plus:

> Build instructions: cd into the project root, run `npm install`, then `npm run build:extension`. This generates `popup/popup.css` and `options/options.css` via Tailwind v4.

## 15. Version notes (for the listing's "what's new")

```
v0.1.0 - Initial release.
• Quick-search popup with Web / Images / Videos / News tabs
• Right-click and address-bar keyword search
• Options page with safe search, region, default tab, theme
• 5 themes including system-following Auto mode
• Zero host permissions, zero remote scripts, zero tracking
```
