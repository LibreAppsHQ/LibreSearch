# LibreSearch browser extension

A small Manifest V3 extension that adds **LibreSearch** to the browser's
search-engine picker and gives you a quick-search popup. Works in Chrome,
Edge, Brave, Vivaldi, Opera, and Firefox.

## What it does

- **Quick-search popup** - click the toolbar icon for a Startpage-style
  search bar with Web / News / Images / Videos tabs. Hit enter, results open
  in a new tab, popup closes.
- **Right-click → Search LibreSearch for "X"** - select any text on any
  page, right-click, search privately. Opens results in a new tab next to
  the current one.
- **Address-bar keyword** - type `libre <query>` in the URL bar to search
  LibreSearch directly without first navigating to the site.
- **Search engine registration** - installing the extension adds LibreSearch
  to the browser's search-engine picker (Settings → Search Engine on
  Chromium-based browsers, Search Bar on Firefox). The popup includes a
  browser-specific guide for promoting it to default.
- **Welcome page on first install** - opens libresearch.ca once so the user
  knows the extension was installed and where to go.

## What it does NOT do

- Track you. Read pages. Modify content.
- Request any host permissions.
- Phone home. There's no background telemetry or update beacon beyond what
  the browser itself does for installed extensions.

## Permissions explained

| Permission     | Why                                                                                                                                                    |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `contextMenus` | Adds the right-click "Search LibreSearch for X" entry. Does not grant any access to page content - only the text the user selects and chooses to send. |

## Local development

The popup is styled with **Tailwind v4**. The source is `popup/popup.src.css`
and the built bundle is `popup/popup.css` (committed). Rebuild whenever you
change the popup markup or the source CSS:

```bash
# From the repo root:
npm run build:extension        # one-shot
npm run watch:extension        # rebuild on save
```

1. **Chrome / Edge / Brave / Vivaldi:**
   - Open `chrome://extensions` (or `edge://extensions`).
   - Enable **Developer mode**.
   - Click **Load unpacked** and pick this `extension/` folder.
2. **Firefox:**
   - Open `about:debugging#/runtime/this-firefox`.
   - Click **Load Temporary Add-on** and pick `manifest.json`.

The extension installs as v0.1.0 and the toolbar icon should appear
immediately.

## Submitting to stores

### Chrome Web Store

> **Before submitting:** add 16/48/128 PNG icons under `icons/` and wire them
> into `manifest.json` (`icons` block + `action.default_icon`). The Web Store
> will reject submissions without them.

1. Bump the version in `manifest.json` for each release.
2. Zip the contents of `extension/` (not the folder itself):
   ```bash
   cd extension && zip -r ../libresearch-extension.zip .
   ```
3. Upload at <https://chrome.google.com/webstore/devconsole>.
4. Listing copy lives in `STORE_LISTING.md` (TODO).

### Firefox Add-ons (AMO)

1. Same zip as above.
2. Upload at <https://addons.mozilla.org/developers/>.
3. Submit for review. AMO requires the listing to declare that no remote
   code is executed (we don't).

### Edge Add-ons

1. Same zip works in Edge.
2. Submit at <https://partner.microsoft.com/dashboard/microsoftedge>.

## Roadmap

- [ ] Real PNG icons (16 / 48 / 128)
- [ ] Store listing copy + screenshots (`STORE_LISTING.md`)
- [ ] Settings page (region, safe-search default, default tab)
- [ ] Light theme for the popup that follows system preference
- [ ] Omnibox autosuggest (would require host permission for
      `libresearch.ca` and an autosuggest endpoint)
- [ ] Recent-searches in popup, stored locally only

## License

Same as the parent project: AGPL-3.0-only.
