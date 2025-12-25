# Shop Inventory Management MERN Project

## Backend

Install packages

```bash
npm install
```
Run backend

```bash
npm start
```

Run backend and expose with ngrok

1) Install the `ngrok` CLI globally (optional) or use the included npm helper which uses the `ngrok` package:

```bash
# install dependencies (if not done already)
npm install

# start server and open ngrok tunnel (uses the script in `scripts/start-with-ngrok.js`)
npm run start:ngrok
```

2) If you prefer the ngrok CLI instead, install it and run (assuming your server uses port 8000):

```bash
ngrok http 8000
```

After running `npm run start:ngrok`, the script will print the public ngrok URL (e.g. `https://abc123.ngrok.io`). Use that URL from anywhere to reach your local backend.