# Herald Capital

## Setup (macOS)

```bash
# 1. Install Xcode Command Line Tools
xcode-select --install

# 2. Install Homebrew (if needed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 3. Install Node via nvm
brew install nvm
mkdir ~/.nvm
echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.zshrc
echo '[ -s "$(brew --prefix)/opt/nvm/nvm.sh" ] && \. "$(brew --prefix)/opt/nvm/nvm.sh"' >> ~/.zshrc
source ~/.zshrc

# 4. Use correct Node version & install deps
nvm install
npm install
```

## Run

```bash
npm run dev
```

Opens at http://localhost:5173

## Google Sheets Integration

Portfolio data is fetched from a public Google Sheet. To configure:

1. Create a Google Sheet with columns: `id`, `name`, `description`, `stage`, `location`, `primary`, `secondary`, `tertiary`, `website`
2. Publish the sheet: **File → Share → Publish to web** (select CSV format)
3. Update `src/data/portfolio.ts`:
   - Replace `SHEET_ID` with your sheet ID (from the URL: `https://docs.google.com/spreadsheets/d/{SHEET_ID}/...`)
   - Update `SHEET_NAME` if your sheet tab isn't named "Sheet1"

### Column Reference

| Column      | Required | Description                                   |
| ----------- | -------- | --------------------------------------------- |
| id          | No       | Unique identifier (auto-generated if missing) |
| name        | Yes      | Company name                                  |
| description | No       | Company description                           |
| stage       | No       | One of: Angel, Early, Growth, Public          |
| location    | Yes      | City, State/Country format                    |
| primary     | Yes      | Primary sector                                |
| secondary   | No       | Secondary sector                              |
| tertiary    | No       | Tertiary sector                               |
| website     | No       | Company website URL                           |

### Adding New Locations

For the geography view, add coordinates to `cityCoords` in `src/data/portfolio.ts`:

```typescript
"City, Country": { lat: 0.0000, lng: 0.0000 },
```
