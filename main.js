/*
**  Nuxt.js part
*/
process.env.NODE_ENV = process.env.NODE_ENV || 'production'
let win = null // Current window

const http = require('http')
const Nuxt = require('nuxt')

// Import and Set Nuxt.js options
let config = require('./nuxt.config.js')
config.dev = !(process.env.NODE_ENV === 'production')
config.rootDir = __dirname // for electron-packager

const malScraper = require('mal-scraper')
const URL = require('url-parse');
const querystring = require('querystring');
// Init Nuxt.js
const nuxt = new Nuxt(config)
const route = (req,res) => {
  const url = new URL(req.url);
  if(url.pathname == '/malScraper.json'){
    const query = querystring.parse(url.query.replace('?',''));
    let seasonalInfo = malScraper.getSeason(query.year, query.season, () => {
      console.log("Finished gathering information.")
      res.writeHead(200, {"Content-Type": "application/json"});
      res.write(JSON.stringify(seasonalInfo.info));
      res.end();
    });
  }else{
    return nuxt.render(req,res) ;
  }
};
const server = http.createServer(route)
//nuxt.render

// Build only in dev mode
if (config.dev) {
  nuxt.build()
  .catch((error) => {
    console.error(error) // eslint-disable-line no-console
    process.exit(1)
  })
}

// Listen the server
server.listen()
const _NUXT_URL_ = `http://localhost:${server.address().port}`
console.log(`Nuxt working on ${_NUXT_URL_}`)

/*
** Electron app
*/
const electron = require('electron')
const path = require('path')
const url = require('url')

// http.get('test', (res)=>{
//   res.send('aaa');
// });

const POLL_INTERVAL = 300
const pollServer = () => {
  http
  .get(_NUXT_URL_, (res) => {
    const SERVER_DOWN = res.statusCode !== 200
    SERVER_DOWN ? setTimeout(pollServer, POLL_INTERVAL) : win.loadURL(_NUXT_URL_)
  })
  .on('error', pollServer)
}

const app = electron.app
const bw = electron.BrowserWindow

const newWin = () => {
  win = new bw({
    width: config.electron.width || 800,
    height: config.electron.height || 600
  })
  if (!config.dev) {
    return win.loadURL(_NUXT_URL_)
  }
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))
  win.on('closed', () => win = null)
  pollServer()
}

app.on('ready', newWin)
app.on('window-all-closed', () => app.quit())
app.on('activate', () => win === null && newWin())
