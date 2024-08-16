require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
let bodyParser = require('body-parser');
const dns = require('dns');

app.use(bodyParser.urlencoded({extended: false}));

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

function normalizeURL(url) {
  // Supprimer le schéma (https://, http://, etc.)
  url = url.replace(/^https?:\/\//, '');

  // Supprimer le sous-domaine (www.)
  url = url.replace(/^www\./, '');

  // Supprimer tout chemin ou caractère de fin de chaîne (/)
  url = url.replace(/\/.*$/, '');

  return url;
}

function startsWithHttpOrHttps(url) {
  const regex = /^https?:\/\//;
  return regex.test(url);
}
var add = {};
var short = 0;
app.post('/api/shorturl', (req, res) => {

  dns.lookup(normalizeURL(req.body.url), (err, address, family) => {
    if ((address == undefined) || (startsWithHttpOrHttps(req.body.url) != true)) {
      res.json({"error":"Invalid URL"});
    } else {
      console.log('address: %j family: IPv%s', address, family);
      if (req.body.url in add) {
        res.json({"original_url":req.body.url,"short_url":short});
      } else {
        short += 1;
        add[req.body.url] = short;
        res.json({"original_url":req.body.url,"short_url":short});
      }
    }
  });
   
})

app.get('/api/shorturl/:num', (req, res) => {
  let key = Object.entries(add).find(([key, value]) => value === parseInt(req.params.num));
  if (key) {
    console.log(`La clé correspondant à la valeur "${req.params.num}" est "${key[0]}".`);
    res.redirect(key[0]);
  } else {
    console.log(`Aucune clé ne correspond à la valeur "${req.params.num}".`);
    res.json({"error":"No short URL found for the given input"});
  }
})
