//dependencies for each module used
var express = require('express');
var http = require('http');
var path = require('path');
var handlebars = require('express-handlebars');
var bodyParser = require('body-parser');
var session = require('express-session');
var dotenv = require('dotenv');
var pg = require('pg');
var app = express();

//client id and client secret here, taken from .env (which you need to create)
dotenv.load();

//connect to database
var conString = process.env.DATABASE_CONNECTION_URL;

//Configures the Template engine
app.engine('html', handlebars({ defaultLayout: 'layout', extname: '.html' }));
app.set("view engine", "html");
app.set('views', __dirname + '/views');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({ secret: 'keyboard cat',
                  saveUninitialized: true,
                  resave: true}));

//set environment ports and start application
app.set('port', process.env.PORT || 3000);

//routes
app.get('/', function(req, res){
  res.render('new_index');
});

app.get('/map', function(req, res){
  res.render('map');
});

app.get('/old_index', function(req, res){
  res.render('index');
})

//routes
app.get('/agencies/:id', function(req, res){
  pg.connect(conString, function(err, client, done) {

    if(err) {
    return console.error('error fetching client from pool', err);
    }

    var q = 'SELECT c.charge_description, COUNT(*) AS total \
    FROM cogs121_16_raw.arjis_crimes c \
    WHERE c.agency LIKE \'' + req.params.id + '\' \
    GROUP BY c.charge_description \
    ORDER BY total DESC \
    LIMIT 5';

    client.query( q, function(err, result) {
    //call `done()` to release the client back to the pool
      done();

      if(err) {
        return console.error('error running query', err);
      }
      res.json(result.rows);
      client.end();
      return { delphidata: result };
    });
  });
  return { delphidata: "No data found" };
});

/* Gets the top five crimes.
 *
 */
// app.get('/agencycrimes', function (req, res) {
//   pg.connect(conString, function(err, client, done) {
//
//     if(err) {
//     return console.error('error fetching client from pool', err);
//     }
//
//     var q = 'SELECT c.agency, COUNT(*) AS total \
//       FROM cogs121_16_raw.arjis_crimes c \
//       WHERE c.agency NOT IN (\'SAN DIEGO\', \'SHERIFF\') \
//       GROUP BY c.agency \
//       ORDER BY total ASC';
//
//     client.query( q, function(err, result) {
//     //call `done()` to release the client back to the pool
//       done();
//
//       if(err) {
//         return console.error('error running query', err);
//       }
//       res.json(result.rows);
//       client.end();
//       return { delphidata: result };
//     });
//   });
//   return { delphidata: "No data found" };
// });

app.get('/geography', function (req, res) {
  pg.connect(conString, function(err, client, done) {

    if(err) {
    return console.error('error fetching client from pool', err);
    }

      var q = 'SELECT a.geography, sum(a.total + b.total + c.total + d.total) as total \
    FROM ( SELECT \'Mid‐City\' AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
    WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Mid‐City\' \
    UNION \
    SELECT \'Central Region\' AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
    WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Central Region\' \
    UNION \
    SELECT \'Central San Diego\' AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
    WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Central San Diego\' \
    UNION \
    SELECT \'Southeastern San Diego\'  AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
    WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Southeastern San Diego\' \
    UNION \
    SELECT \'East Region\'  AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
    WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'East Region\' \
    UNION \
    SELECT \'Alpine\'  AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
    WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Alpine\' \
    UNION \
    SELECT \'El Cajon\'  AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
    WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'El Cajon\' \
    UNION \
    SELECT \'Harbison Crest/El Cajon\'  AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
    WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Harbison Crest/El Cajon\' \
    UNION \
    SELECT \'Jamul\'  AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
    WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Jamul\' \
    UNION \
    SELECT \'La Mesa\'  AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
    WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'La Mesa\' \
    UNION \
    SELECT \'Laguna‐Pine  Valley\'  AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
    WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Laguna‐Pine  Valley\' \
    UNION \
    SELECT \'Lakeside\'  AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
    WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Lakeside\' \
    UNION \
    SELECT \'Lemon Grove\'  AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
    WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Lemon Grove\' \
    UNION \
    SELECT \'Mountain Empire\'  AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
    WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Mountain Empire\' \
    UNION \
    SELECT \'Santee\'  AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
    WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Santee\' \
    UNION \
    SELECT \'Spring Valley\'  AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
    WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Spring Valley\' \
    UNION \
    SELECT \'North Central Region\'  AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
    WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'North Central Region\' \
    UNION \
    SELECT \'Coastal\'  AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
    WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Coastal\' \
    UNION \
    SELECT \'Del Mar‐Mira Mesa\'  AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
    WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Del Mar‐Mira Mesa\' \
    UNION \
    SELECT \'Elliott‐Navajo\'  AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
    WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Elliott‐Navajo\' \
    UNION \
    SELECT \'Kearny Mesa\'  AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
    WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Kearny Mesa\' \
    UNION \
    SELECT \'Miramar\'  AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
    WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Miramar\' \
    UNION \
    SELECT \'Peninsula\'  AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
    WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Peninsula\' \
    UNION \
    SELECT \'University\'  AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
    WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'University\' \
    UNION \
    SELECT \'North Coastal Region\'  AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
    WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'North Coastal Region\' \
    UNION \
    SELECT \'Carlsbad\'  AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
    WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Carlsbad\' \
    UNION \
    SELECT \'Oceanside\'  AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
    WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Oceanside\' \
    UNION \
    SELECT \'Pendleton\'  AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
    WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Pendleton\' \
    UNION \
    SELECT \'San Dieguito\'  AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
    WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'San Dieguito\' \
    UNION \
    SELECT \'Vista\'  AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
    WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Vista\' \
    UNION \
    SELECT \'North Inland Region\'  AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
    WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'North Inland Region\' \
    UNION \
    SELECT \'Anza‐Borrego Springs\'  AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
    WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Anza‐Borrego Springs\' \
    UNION \
    SELECT \'Escondido\'  AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
    WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Escondido\' \
    UNION \
    SELECT \'Fallbrook\'  AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
    WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Fallbrook\' \
    UNION \
    SELECT \'North San Diego\'  AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
    WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'North San Diego\' \
    UNION \
    SELECT \'Palomar‐Julian\'  AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
    WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Palomar‐Julian\' \
    UNION \
    SELECT \'Pauma\'  AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
    WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Pauma\' \
    UNION \
    SELECT \'Poway\'  AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
    WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Poway\' \
    UNION \
    SELECT \'Ramona\'  AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
    WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Ramona\' \
    UNION \
    SELECT \'San Marcos\'  AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
    WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'San Marcos\' \
    UNION \
    SELECT \'Valley Center\'  AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
    WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Valley Center\' \
    UNION \
    SELECT \'South Region\'  AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
    WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'South Region\' \
    UNION \
    SELECT \'Chula Vista\'  AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
    WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Chula Vista\' \
    UNION \
    SELECT \'Coronado\'  AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
    WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Coronado\' \
    UNION \
    SELECT \'National City\'  AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
    WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'National City\' \
    UNION \
    SELECT \'South Bay\'  AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
    WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'South Bay\' \
    UNION \
    SELECT \'Sweetwater\'  AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
    WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Sweetwater\' \
    UNION \
    SELECT \'Unknown\'  AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
    WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Unknown\')a, \
    (SELECT \'Mid‐City\' AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Mid‐City\' \
    UNION \
    SELECT \'Central Region\' AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Central Region\' \
    UNION \
    SELECT \'Central San Diego\' AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Central San Diego\' \
    UNION \
    SELECT \'Southeastern San Diego\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Southeastern San Diego\' \
    UNION \
    SELECT \'East Region\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'East Region\' \
    UNION \
    SELECT \'Alpine\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Alpine\' \
    UNION \
    SELECT \'El Cajon\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'El Cajon\' \
    UNION \
    SELECT \'Harbison Crest/El Cajon\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Harbison Crest/El Cajon\' \
    UNION \
    SELECT \'Jamul\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Jamul\' \
    UNION \
    SELECT \'La Mesa\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'La Mesa\' \
    UNION \
    SELECT \'Laguna‐Pine  Valley\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Laguna‐Pine  Valley\' \
    UNION \
    SELECT \'Lakeside\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Lakeside\' \
    UNION \
    SELECT \'Lemon Grove\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Lemon Grove\' \
    UNION \
    SELECT \'Mountain Empire\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Mountain Empire\' \
    UNION \
    SELECT \'Santee\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Santee\' \
    UNION \
    SELECT \'Spring Valley\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Spring Valley\' \
    UNION \
    SELECT \'North Central Region\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'North Central Region\' \
    UNION \
    SELECT \'Coastal\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Coastal\' \
    UNION \
    SELECT \'Del Mar‐Mira Mesa\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Del Mar‐Mira Mesa\' \
    UNION \
    SELECT \'Elliott‐Navajo\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Elliott‐Navajo\' \
    UNION \
    SELECT \'Kearny Mesa\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Kearny Mesa\' \
    UNION \
    SELECT \'Miramar\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Miramar\' \
    UNION \
    SELECT \'Peninsula\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Peninsula\' \
    UNION \
    SELECT \'University\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'University\' \
    UNION \
    SELECT \'North Coastal Region\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'North Coastal Region\' \
    UNION \
    SELECT \'Carlsbad\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Carlsbad\' \
    UNION \
    SELECT \'Oceanside\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Oceanside\' \
    UNION \
    SELECT \'Pendleton\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Pendleton\' \
    UNION \
    SELECT \'San Dieguito\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'San Dieguito\' \
    UNION \
    SELECT \'Vista\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Vista\' \
    UNION \
    SELECT \'North Inland Region\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'North Inland Region\' \
    UNION \
    SELECT \'Anza‐Borrego Springs\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Anza‐Borrego Springs\' \
    UNION \
    SELECT \'Escondido\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Escondido\' \
    UNION \
    SELECT \'Fallbrook\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Fallbrook\' \
    UNION \
    SELECT \'North San Diego\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'North San Diego\' \
    UNION \
    SELECT \'Palomar‐Julian\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Palomar‐Julian\' \
    UNION \
    SELECT \'Pauma\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Pauma\' \
    UNION \
    SELECT \'Poway\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Poway\' \
    UNION \
    SELECT \'Ramona\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Ramona\' \
    UNION \
    SELECT \'San Marcos\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'San Marcos\' \
    UNION \
    SELECT \'Valley Center\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Valley Center\' \
    UNION \
    SELECT \'South Region\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'South Region\' \
    UNION \
    SELECT \'Chula Vista\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Chula Vista\' \
    UNION \
    SELECT \'Coronado\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Coronado\' \
    UNION \
    SELECT \'National City\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'National City\' \
    UNION \
    SELECT \'South Bay\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'South Bay\' \
    UNION \
    SELECT \'Sweetwater\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Sweetwater\' \
    UNION \
    SELECT \'Unknown\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Unknown\') b, \
    (SELECT \'Mid‐City\' AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Mid‐City\' \
    UNION \
    SELECT \'Central Region\' AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Central Region\' \
    UNION \
    SELECT \'Central San Diego\' AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Central San Diego\' \
    UNION \
    SELECT \'Southeastern San Diego\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Southeastern San Diego\' \
    UNION \
    SELECT \'East Region\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'East Region\' \
    UNION \
    SELECT \'Alpine\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Alpine\' \
    UNION \
    SELECT \'El Cajon\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'El Cajon\' \
    UNION \
    SELECT \'Harbison Crest/El Cajon\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Harbison Crest/El Cajon\' \
    UNION \
    SELECT \'Jamul\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Jamul\' \
    UNION \
    SELECT \'La Mesa\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'La Mesa\' \
    UNION \
    SELECT \'Laguna‐Pine  Valley\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Laguna‐Pine  Valley\' \
    UNION \
    SELECT \'Lakeside\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Lakeside\' \
    UNION \
    SELECT \'Lemon Grove\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Lemon Grove\' \
    UNION \
    SELECT \'Mountain Empire\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Mountain Empire\' \
    UNION \
    SELECT \'Santee\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Santee\' \
    UNION \
    SELECT \'Spring Valley\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Spring Valley\' \
    UNION \
    SELECT \'North Central Region\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'North Central Region\' \
    UNION \
    SELECT \'Coastal\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Coastal\' \
    UNION \
    SELECT \'Del Mar‐Mira Mesa\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Del Mar‐Mira Mesa\' \
    UNION \
    SELECT \'Elliott‐Navajo\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Elliott‐Navajo\' \
    UNION \
    SELECT \'Kearny Mesa\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Kearny Mesa\' \
    UNION \
    SELECT \'Miramar\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Miramar\' \
    UNION \
    SELECT \'Peninsula\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Peninsula\' \
    UNION \
    SELECT \'University\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'University\' \
    UNION \
    SELECT \'North Coastal Region\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'North Coastal Region\' \
    UNION \
    SELECT \'Carlsbad\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Carlsbad\' \
    UNION \
    SELECT \'Oceanside\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Oceanside\' \
    UNION \
    SELECT \'Pendleton\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Pendleton\' \
    UNION \
    SELECT \'San Dieguito\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'San Dieguito\' \
    UNION \
    SELECT \'Vista\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Vista\' \
    UNION \
    SELECT \'North Inland Region\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'North Inland Region\' \
    UNION \
    SELECT \'Anza‐Borrego Springs\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Anza‐Borrego Springs\' \
    UNION \
    SELECT \'Escondido\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Escondido\' \
    UNION \
    SELECT \'Fallbrook\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Fallbrook\' \
    UNION \
    SELECT \'North San Diego\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'North San Diego\' \
    UNION \
    SELECT \'Palomar‐Julian\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Palomar‐Julian\' \
    UNION \
    SELECT \'Pauma\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Pauma\' \
    UNION \
    SELECT \'Poway\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Poway\' \
    UNION \
    SELECT \'Ramona\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Ramona\' \
    UNION \
    SELECT \'San Marcos\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'San Marcos\' \
    UNION \
    SELECT \'Valley Center\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Valley Center\' \
    UNION \
    SELECT \'South Region\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'South Region\' \
    UNION \
    SELECT \'Chula Vista\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Chula Vista\' \
    UNION \
    SELECT \'Coronado\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Coronado\' \
    UNION \
    SELECT \'National City\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'National City\' \
    UNION \
    SELECT \'South Bay\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'South Bay\' \
    UNION \
    SELECT \'Sweetwater\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Sweetwater\' \
    UNION \
    SELECT \'Unknown\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Unknown\') c, \
    (SELECT \'Mid‐City\' AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Mid‐City\' \
    UNION \
    SELECT \'Central Region\' AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Central Region\' \
    UNION \
    SELECT \'Central San Diego\' AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Central San Diego\' \
    UNION \
    SELECT \'Southeastern San Diego\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Southeastern San Diego\' \
    UNION \
    SELECT \'East Region\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'East Region\' \
    UNION \
    SELECT \'Alpine\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Alpine\' \
    UNION \
    SELECT \'El Cajon\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'El Cajon\' \
    UNION \
    SELECT \'Harbison Crest/El Cajon\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Harbison Crest/El Cajon\' \
    UNION \
    SELECT \'Jamul\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Jamul\' \
    UNION \
    SELECT \'La Mesa\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'La Mesa\' \
    UNION \
    SELECT \'Laguna‐Pine  Valley\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Laguna‐Pine  Valley\' \
    UNION \
    SELECT \'Lakeside\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Lakeside\' \
    UNION \
    SELECT \'Lemon Grove\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Lemon Grove\' \
    UNION \
    SELECT \'Mountain Empire\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Mountain Empire\' \
    UNION \
    SELECT \'Santee\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Santee\' \
    UNION \
    SELECT \'Spring Valley\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Spring Valley\' \
    UNION \
    SELECT \'North Central Region\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'North Central Region\' \
    UNION \
    SELECT \'Coastal\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Coastal\' \
    UNION \
    SELECT \'Del Mar‐Mira Mesa\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Del Mar‐Mira Mesa\' \
    UNION \
    SELECT \'Elliott‐Navajo\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Elliott‐Navajo\' \
    UNION \
    SELECT \'Kearny Mesa\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Kearny Mesa\' \
    UNION \
    SELECT \'Miramar\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Miramar\' \
    UNION \
    SELECT \'Peninsula\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Peninsula\' \
    UNION \
    SELECT \'University\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'University\' \
    UNION \
    SELECT \'North Coastal Region\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'North Coastal Region\' \
    UNION \
    SELECT \'Carlsbad\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Carlsbad\' \
    UNION \
    SELECT \'Oceanside\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Oceanside\' \
    UNION \
    SELECT \'Pendleton\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Pendleton\' \
    UNION \
    SELECT \'San Dieguito\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'San Dieguito\' \
    UNION \
    SELECT \'Vista\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Vista\' \
    UNION \
    SELECT \'North Inland Region\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'North Inland Region\' \
    UNION \
    SELECT \'Anza‐Borrego Springs\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Anza‐Borrego Springs\' \
    UNION \
    SELECT \'Escondido\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Escondido\' \
    UNION \
    SELECT \'Fallbrook\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Fallbrook\' \
    UNION \
    SELECT \'North San Diego\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'North San Diego\' \
    UNION \
    SELECT \'Palomar‐Julian\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Palomar‐Julian\' \
    UNION \
    SELECT \'Pauma\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Pauma\' \
    UNION \
    SELECT \'Poway\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Poway\' \
    UNION \
    SELECT \'Ramona\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Ramona\' \
    UNION \
    SELECT \'San Marcos\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'San Marcos\' \
    UNION \
    SELECT \'Valley Center\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Valley Center\' \
    UNION \
    SELECT \'South Region\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'South Region\' \
    UNION \
    SELECT \'Chula Vista\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Chula Vista\' \
    UNION \
    SELECT \'Coronado\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Coronado\' \
    UNION \
    SELECT \'National City\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'National City\' \
    UNION \
    SELECT \'South Bay\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'South Bay\' \
    UNION \
    SELECT \'Sweetwater\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Sweetwater\' \
    UNION \
    SELECT \'Unknown\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Unknown\')d \
    WHERE a.geography = b.geography and b.geography = c.geography and c.geography = d.geography \
    GROUP BY a.geography \
    ORDER BY total ASC'


    client.query( q, function(err, result) {
    //call `done()` to release the client back to the pool
      done();

      if(err) {
        return console.error('error running query', err);
      }
      res.json(result.rows);
      client.end();
      return { delphidata: result };
    });
  });
  return { delphidata: "No data found" };
});

app.get('/gonorrhea', function(req, res){
  pg.connect(conString, function(err, client, done) {

    if(err) {
    return console.error('error fetching client from pool', err);
    }

    var q = 'SELECT \'Mid‐City\' AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Mid‐City\' \
    UNION \
    SELECT \'Central Region\' AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Central Region\' \
    UNION \
    SELECT \'Central San Diego\' AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Central San Diego\' \
    UNION \
    SELECT \'Southeastern San Diego\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Southeastern San Diego\' \
    UNION \
    SELECT \'East Region\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'East Region\' \
    UNION \
    SELECT \'Alpine\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Alpine\' \
    UNION \
    SELECT \'El Cajon\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'El Cajon\' \
    UNION \
    SELECT \'Harbison Crest/El Cajon\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Harbison Crest/El Cajon\' \
    UNION \
    SELECT \'Jamul\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Jamul\' \
    UNION \
    SELECT \'La Mesa\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'La Mesa\' \
    UNION \
    SELECT \'Laguna‐Pine  Valley\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Laguna‐Pine  Valley\' \
    UNION \
    SELECT \'Lakeside\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Lakeside\' \
    UNION \
    SELECT \'Lemon Grove\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Lemon Grove\' \
    UNION \
    SELECT \'Mountain Empire\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Mountain Empire\' \
    UNION \
    SELECT \'Santee\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Santee\' \
    UNION \
    SELECT \'Spring Valley\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Spring Valley\' \
    UNION \
    SELECT \'North Central Region\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'North Central Region\' \
    UNION \
    SELECT \'Coastal\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Coastal\' \
    UNION \
    SELECT \'Del Mar‐Mira Mesa\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Del Mar‐Mira Mesa\' \
    UNION \
    SELECT \'Elliott‐Navajo\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Elliott‐Navajo\' \
    UNION \
    SELECT \'Kearny Mesa\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Kearny Mesa\' \
    UNION \
    SELECT \'Miramar\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Miramar\' \
    UNION \
    SELECT \'Peninsula\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Peninsula\' \
    UNION \
    SELECT \'University\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'University\' \
    UNION \
    SELECT \'North Coastal Region\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'North Coastal Region\' \
    UNION \
    SELECT \'Carlsbad\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Carlsbad\' \
    UNION \
    SELECT \'Oceanside\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Oceanside\' \
    UNION \
    SELECT \'Pendleton\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Pendleton\' \
    UNION \
    SELECT \'San Dieguito\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'San Dieguito\' \
    UNION \
    SELECT \'Vista\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Vista\' \
    UNION \
    SELECT \'North Inland Region\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'North Inland Region\' \
    UNION \
    SELECT \'Anza‐Borrego Springs\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Anza‐Borrego Springs\' \
    UNION \
    SELECT \'Escondido\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Escondido\' \
    UNION \
    SELECT \'Fallbrook\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Fallbrook\' \
    UNION \
    SELECT \'North San Diego\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'North San Diego\' \
    UNION \
    SELECT \'Palomar‐Julian\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Palomar‐Julian\' \
    UNION \
    SELECT \'Pauma\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Pauma\' \
    UNION \
    SELECT \'Poway\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Poway\' \
    UNION \
    SELECT \'Ramona\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Ramona\' \
    UNION \
    SELECT \'San Marcos\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'San Marcos\' \
    UNION \
    SELECT \'Valley Center\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Valley Center\' \
    UNION \
    SELECT \'South Region\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'South Region\' \
    UNION \
    SELECT \'Chula Vista\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Chula Vista\' \
    UNION \
    SELECT \'Coronado\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Coronado\' \
    UNION \
    SELECT \'National City\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'National City\' \
    UNION \
    SELECT \'South Bay\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'South Bay\' \
    UNION \
    SELECT \'Sweetwater\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Sweetwater\' \
    UNION \
    SELECT \'Unknown\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_gonorrhea_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Unknown\''

    client.query( q, function(err, result) {
    //call `done()` to release the client back to the pool
      done();

      if(err) {
        return console.error('error running query', err);
      }
      res.json(result.rows);
      client.end();
      return { delphidata: result };
    });
  });
  return { delphidata: "No data found" };
});

app.get('/chlamydia', function(req, res){
  pg.connect(conString, function(err, client, done) {

    if(err) {
    return console.error('error fetching client from pool', err);
    }

    var q = 'SELECT \'Mid‐City\' AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Mid‐City\' \
    UNION \
    SELECT \'Central Region\' AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Central Region\' \
    UNION \
    SELECT \'Central San Diego\' AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Central San Diego\' \
    UNION \
    SELECT \'Southeastern San Diego\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Southeastern San Diego\' \
    UNION \
    SELECT \'East Region\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'East Region\' \
    UNION \
    SELECT \'Alpine\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Alpine\' \
    UNION \
    SELECT \'El Cajon\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'El Cajon\' \
    UNION \
    SELECT \'Harbison Crest/El Cajon\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Harbison Crest/El Cajon\' \
    UNION \
    SELECT \'Jamul\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Jamul\' \
    UNION \
    SELECT \'La Mesa\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'La Mesa\' \
    UNION \
    SELECT \'Laguna‐Pine  Valley\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Laguna‐Pine  Valley\' \
    UNION \
    SELECT \'Lakeside\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Lakeside\' \
    UNION \
    SELECT \'Lemon Grove\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Lemon Grove\' \
    UNION \
    SELECT \'Mountain Empire\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Mountain Empire\' \
    UNION \
    SELECT \'Santee\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Santee\' \
    UNION \
    SELECT \'Spring Valley\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Spring Valley\' \
    UNION \
    SELECT \'North Central Region\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'North Central Region\' \
    UNION \
    SELECT \'Coastal\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Coastal\' \
    UNION \
    SELECT \'Del Mar‐Mira Mesa\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Del Mar‐Mira Mesa\' \
    UNION \
    SELECT \'Elliott‐Navajo\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Elliott‐Navajo\' \
    UNION \
    SELECT \'Kearny Mesa\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Kearny Mesa\' \
    UNION \
    SELECT \'Miramar\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Miramar\' \
    UNION \
    SELECT \'Peninsula\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Peninsula\' \
    UNION \
    SELECT \'University\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'University\' \
    UNION \
    SELECT \'North Coastal Region\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'North Coastal Region\' \
    UNION \
    SELECT \'Carlsbad\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Carlsbad\' \
    UNION \
    SELECT \'Oceanside\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Oceanside\' \
    UNION \
    SELECT \'Pendleton\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Pendleton\' \
    UNION \
    SELECT \'San Dieguito\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'San Dieguito\' \
    UNION \
    SELECT \'Vista\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Vista\' \
    UNION \
    SELECT \'North Inland Region\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'North Inland Region\' \
    UNION \
    SELECT \'Anza‐Borrego Springs\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Anza‐Borrego Springs\' \
    UNION \
    SELECT \'Escondido\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Escondido\' \
    UNION \
    SELECT \'Fallbrook\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Fallbrook\' \
    UNION \
    SELECT \'North San Diego\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'North San Diego\' \
    UNION \
    SELECT \'Palomar‐Julian\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Palomar‐Julian\' \
    UNION \
    SELECT \'Pauma\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Pauma\' \
    UNION \
    SELECT \'Poway\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Poway\' \
    UNION \
    SELECT \'Ramona\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Ramona\' \
    UNION \
    SELECT \'San Marcos\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'San Marcos\' \
    UNION \
    SELECT \'Valley Center\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Valley Center\' \
    UNION \
    SELECT \'South Region\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'South Region\' \
    UNION \
    SELECT \'Chula Vista\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Chula Vista\' \
    UNION \
    SELECT \'Coronado\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Coronado\' \
    UNION \
    SELECT \'National City\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'National City\' \
    UNION \
    SELECT \'South Bay\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'South Bay\' \
    UNION \
    SELECT \'Sweetwater\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Sweetwater\' \
    UNION \
    SELECT \'Unknown\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
    FROM cogs121_16_raw.hhsa_chlamydia_2010_2012 \
    WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
    AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
    AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
    AND "Geography" LIKE \'Unknown\''

    client.query( q, function(err, result) {
    //call `done()` to release the client back to the pool
      done();

      if(err) {
        return console.error('error running query', err);
      }
      res.json(result.rows);
      client.end();
      return { delphidata: result };
    });
  });
  return { delphidata: "No data found" };
});

app.get('/aidshiv', function(req, res){
  pg.connect(conString, function(err, client, done) {

    if(err) {
    return console.error('error fetching client from pool', err);
    }
      var q = 'SELECT \'Mid‐City\' AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
      FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
      WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "Geography" LIKE \'Mid‐City\' \
      UNION \
      SELECT \'Central Region\' AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
      FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
      WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "Geography" LIKE \'Central Region\' \
      UNION \
      SELECT \'Central San Diego\' AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
      FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
      WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "Geography" LIKE \'Central San Diego\' \
      UNION \
      SELECT \'Southeastern San Diego\'  AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
      FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
      WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "Geography" LIKE \'Southeastern San Diego\' \
      UNION \
      SELECT \'East Region\'  AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
      FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
      WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "Geography" LIKE \'East Region\' \
      UNION \
      SELECT \'Alpine\'  AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
      FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
      WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "Geography" LIKE \'Alpine\' \
      UNION \
      SELECT \'El Cajon\'  AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
      FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
      WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "Geography" LIKE \'El Cajon\' \
      UNION \
      SELECT \'Harbison Crest/El Cajon\'  AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
      FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
      WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "Geography" LIKE \'Harbison Crest/El Cajon\' \
      UNION \
      SELECT \'Jamul\'  AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
      FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
      WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "Geography" LIKE \'Jamul\' \
      UNION \
      SELECT \'La Mesa\'  AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
      FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
      WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "Geography" LIKE \'La Mesa\' \
      UNION \
      SELECT \'Laguna‐Pine  Valley\'  AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
      FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
      WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "Geography" LIKE \'Laguna‐Pine  Valley\' \
      UNION \
      SELECT \'Lakeside\'  AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
      FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
      WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "Geography" LIKE \'Lakeside\' \
      UNION \
      SELECT \'Lemon Grove\'  AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
      FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
      WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "Geography" LIKE \'Lemon Grove\' \
      UNION \
      SELECT \'Mountain Empire\'  AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
      FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
      WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "Geography" LIKE \'Mountain Empire\' \
      UNION \
      SELECT \'Santee\'  AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
      FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
      WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "Geography" LIKE \'Santee\' \
      UNION \
      SELECT \'Spring Valley\'  AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
      FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
      WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "Geography" LIKE \'Spring Valley\' \
      UNION \
      SELECT \'North Central Region\'  AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
      FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
      WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "Geography" LIKE \'North Central Region\' \
      UNION \
      SELECT \'Coastal\'  AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
      FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
      WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "Geography" LIKE \'Coastal\' \
      UNION \
      SELECT \'Del Mar‐Mira Mesa\'  AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
      FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
      WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "Geography" LIKE \'Del Mar‐Mira Mesa\' \
      UNION \
      SELECT \'Elliott‐Navajo\'  AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
      FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
      WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "Geography" LIKE \'Elliott‐Navajo\' \
      UNION \
      SELECT \'Kearny Mesa\'  AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
      FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
      WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "Geography" LIKE \'Kearny Mesa\' \
      UNION \
      SELECT \'Miramar\'  AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
      FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
      WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "Geography" LIKE \'Miramar\' \
      UNION \
      SELECT \'Peninsula\'  AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
      FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
      WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "Geography" LIKE \'Peninsula\' \
      UNION \
      SELECT \'University\'  AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
      FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
      WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "Geography" LIKE \'University\' \
      UNION \
      SELECT \'North Coastal Region\'  AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
      FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
      WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "Geography" LIKE \'North Coastal Region\' \
      UNION \
      SELECT \'Carlsbad\'  AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
      FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
      WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "Geography" LIKE \'Carlsbad\' \
      UNION \
      SELECT \'Oceanside\'  AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
      FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
      WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "Geography" LIKE \'Oceanside\' \
      UNION \
      SELECT \'Pendleton\'  AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
      FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
      WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "Geography" LIKE \'Pendleton\' \
      UNION \
      SELECT \'San Dieguito\'  AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
      FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
      WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "Geography" LIKE \'San Dieguito\' \
      UNION \
      SELECT \'Vista\'  AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
      FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
      WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "Geography" LIKE \'Vista\' \
      UNION \
      SELECT \'North Inland Region\'  AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
      FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
      WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "Geography" LIKE \'North Inland Region\' \
      UNION \
      SELECT \'Anza‐Borrego Springs\'  AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
      FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
      WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "Geography" LIKE \'Anza‐Borrego Springs\' \
      UNION \
      SELECT \'Escondido\'  AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
      FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
      WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "Geography" LIKE \'Escondido\' \
      UNION \
      SELECT \'Fallbrook\'  AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
      FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
      WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "Geography" LIKE \'Fallbrook\' \
      UNION \
      SELECT \'North San Diego\'  AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
      FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
      WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "Geography" LIKE \'North San Diego\' \
      UNION \
      SELECT \'Palomar‐Julian\'  AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
      FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
      WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "Geography" LIKE \'Palomar‐Julian\' \
      UNION \
      SELECT \'Pauma\'  AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
      FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
      WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "Geography" LIKE \'Pauma\' \
      UNION \
      SELECT \'Poway\'  AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
      FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
      WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "Geography" LIKE \'Poway\' \
      UNION \
      SELECT \'Ramona\'  AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
      FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
      WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "Geography" LIKE \'Ramona\' \
      UNION \
      SELECT \'San Marcos\'  AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
      FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
      WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "Geography" LIKE \'San Marcos\' \
      UNION \
      SELECT \'Valley Center\'  AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
      FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
      WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "Geography" LIKE \'Valley Center\' \
      UNION \
      SELECT \'South Region\'  AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
      FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
      WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "Geography" LIKE \'South Region\' \
      UNION \
      SELECT \'Chula Vista\'  AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
      FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
      WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "Geography" LIKE \'Chula Vista\' \
      UNION \
      SELECT \'Coronado\'  AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
      FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
      WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "Geography" LIKE \'Coronado\' \
      UNION \
      SELECT \'National City\'  AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
      FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
      WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "Geography" LIKE \'National City\' \
      UNION \
      SELECT \'South Bay\'  AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
      FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
      WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "Geography" LIKE \'South Bay\' \
      UNION \
      SELECT \'Sweetwater\'  AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
      FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
      WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "Geography" LIKE \'Sweetwater\' \
      UNION \
      SELECT \'Unknown\'  AS geography, COALESCE(SUM(cast("2010 AIDS Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 AIDS Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 AIDS Incidence No." as float)), 0) AS total \
      FROM cogs121_16_raw.Hhsa_aids_hiv_2010_2012 \
      WHERE "2010 AIDS Incidence Rate" <> \'§\' AND "2010 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2011 AIDS Incidence Rate" <> \'§\' AND "2011 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "2012 AIDS Incidence Rate" <> \'§\' AND "2012 AIDS Incidence Rate" <> \'‐‐‐\' \
      AND "Geography" LIKE \'Unknown\''

      client.query( q, function(err, result) {
      //call `done()` to release the client back to the pool
        done();

        if(err) {
          return console.error('error running query', err);
        }
        res.json(result.rows);
        client.end();
        return { delphidata: result };
      });
    });
    return { delphidata: "No data found" };
  });

  app.get('/syphillis', function(req, res){
    pg.connect(conString, function(err, client, done) {

      if(err) {
      return console.error('error fetching client from pool', err);
      }
        var q = 'SELECT \'Mid‐City\' AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
        FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
        WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
        AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
        AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
        AND "Geography" LIKE \'Mid‐City\' \
        UNION \
        SELECT \'Central Region\' AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
        FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
        WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
        AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
        AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
        AND "Geography" LIKE \'Central Region\' \
        UNION \
        SELECT \'Central San Diego\' AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
        FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
        WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
        AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
        AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
        AND "Geography" LIKE \'Central San Diego\' \
        UNION \
        SELECT \'Southeastern San Diego\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
        FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
        WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
        AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
        AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
        AND "Geography" LIKE \'Southeastern San Diego\' \
        UNION \
        SELECT \'East Region\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
        FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
        WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
        AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
        AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
        AND "Geography" LIKE \'East Region\' \
        UNION \
        SELECT \'Alpine\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
        FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
        WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
        AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
        AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
        AND "Geography" LIKE \'Alpine\' \
        UNION \
        SELECT \'El Cajon\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
        FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
        WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
        AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
        AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
        AND "Geography" LIKE \'El Cajon\' \
        UNION \
        SELECT \'Harbison Crest/El Cajon\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
        FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
        WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
        AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
        AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
        AND "Geography" LIKE \'Harbison Crest/El Cajon\' \
        UNION \
        SELECT \'Jamul\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
        FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
        WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
        AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
        AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
        AND "Geography" LIKE \'Jamul\' \
        UNION \
        SELECT \'La Mesa\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
        FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
        WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
        AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
        AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
        AND "Geography" LIKE \'La Mesa\' \
        UNION \
        SELECT \'Laguna‐Pine  Valley\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
        FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
        WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
        AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
        AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
        AND "Geography" LIKE \'Laguna‐Pine  Valley\' \
        UNION \
        SELECT \'Lakeside\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
        FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
        WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
        AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
        AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
        AND "Geography" LIKE \'Lakeside\' \
        UNION \
        SELECT \'Lemon Grove\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
        FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
        WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
        AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
        AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
        AND "Geography" LIKE \'Lemon Grove\' \
        UNION \
        SELECT \'Mountain Empire\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
        FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
        WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
        AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
        AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
        AND "Geography" LIKE \'Mountain Empire\' \
        UNION \
        SELECT \'Santee\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
        FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
        WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
        AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
        AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
        AND "Geography" LIKE \'Santee\' \
        UNION \
        SELECT \'Spring Valley\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
        FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
        WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
        AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
        AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
        AND "Geography" LIKE \'Spring Valley\' \
        UNION \
        SELECT \'North Central Region\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
        FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
        WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
        AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
        AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
        AND "Geography" LIKE \'North Central Region\' \
        UNION \
        SELECT \'Coastal\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
        FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
        WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
        AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
        AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
        AND "Geography" LIKE \'Coastal\' \
        UNION \
        SELECT \'Del Mar‐Mira Mesa\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
        FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
        WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
        AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
        AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
        AND "Geography" LIKE \'Del Mar‐Mira Mesa\' \
        UNION \
        SELECT \'Elliott‐Navajo\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
        FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
        WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
        AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
        AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
        AND "Geography" LIKE \'Elliott‐Navajo\' \
        UNION \
        SELECT \'Kearny Mesa\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
        FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
        WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
        AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
        AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
        AND "Geography" LIKE \'Kearny Mesa\' \
        UNION \
        SELECT \'Miramar\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
        FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
        WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
        AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
        AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
        AND "Geography" LIKE \'Miramar\' \
        UNION \
        SELECT \'Peninsula\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
        FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
        WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
        AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
        AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
        AND "Geography" LIKE \'Peninsula\' \
        UNION \
        SELECT \'University\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
        FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
        WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
        AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
        AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
        AND "Geography" LIKE \'University\' \
        UNION \
        SELECT \'North Coastal Region\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
        FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
        WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
        AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
        AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
        AND "Geography" LIKE \'North Coastal Region\' \
        UNION \
        SELECT \'Carlsbad\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
        FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
        WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
        AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
        AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
        AND "Geography" LIKE \'Carlsbad\' \
        UNION \
        SELECT \'Oceanside\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
        FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
        WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
        AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
        AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
        AND "Geography" LIKE \'Oceanside\' \
        UNION \
        SELECT \'Pendleton\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
        FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
        WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
        AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
        AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
        AND "Geography" LIKE \'Pendleton\' \
        UNION \
        SELECT \'San Dieguito\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
        FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
        WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
        AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
        AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
        AND "Geography" LIKE \'San Dieguito\' \
        UNION \
        SELECT \'Vista\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
        FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
        WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
        AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
        AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
        AND "Geography" LIKE \'Vista\' \
        UNION \
        SELECT \'North Inland Region\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
        FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
        WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
        AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
        AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
        AND "Geography" LIKE \'North Inland Region\' \
        UNION \
        SELECT \'Anza‐Borrego Springs\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
        FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
        WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
        AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
        AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
        AND "Geography" LIKE \'Anza‐Borrego Springs\' \
        UNION \
        SELECT \'Escondido\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
        FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
        WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
        AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
        AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
        AND "Geography" LIKE \'Escondido\' \
        UNION \
        SELECT \'Fallbrook\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
        FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
        WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
        AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
        AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
        AND "Geography" LIKE \'Fallbrook\' \
        UNION \
        SELECT \'North San Diego\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
        FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
        WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
        AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
        AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
        AND "Geography" LIKE \'North San Diego\' \
        UNION \
        SELECT \'Palomar‐Julian\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
        FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
        WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
        AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
        AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
        AND "Geography" LIKE \'Palomar‐Julian\' \
        UNION \
        SELECT \'Pauma\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
        FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
        WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
        AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
        AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
        AND "Geography" LIKE \'Pauma\' \
        UNION \
        SELECT \'Poway\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
        FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
        WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
        AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
        AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
        AND "Geography" LIKE \'Poway\' \
        UNION \
        SELECT \'Ramona\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
        FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
        WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
        AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
        AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
        AND "Geography" LIKE \'Ramona\' \
        UNION \
        SELECT \'San Marcos\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
        FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
        WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
        AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
        AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
        AND "Geography" LIKE \'San Marcos\' \
        UNION \
        SELECT \'Valley Center\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
        FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
        WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
        AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
        AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
        AND "Geography" LIKE \'Valley Center\' \
        UNION \
        SELECT \'South Region\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
        FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
        WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
        AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
        AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
        AND "Geography" LIKE \'South Region\' \
        UNION \
        SELECT \'Chula Vista\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
        FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
        WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
        AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
        AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
        AND "Geography" LIKE \'Chula Vista\' \
        UNION \
        SELECT \'Coronado\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
        FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
        WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
        AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
        AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
        AND "Geography" LIKE \'Coronado\' \
        UNION \
        SELECT \'National City\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
        FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
        WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
        AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
        AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
        AND "Geography" LIKE \'National City\' \
        UNION \
        SELECT \'South Bay\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
        FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
        WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
        AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
        AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
        AND "Geography" LIKE \'South Bay\' \
        UNION \
        SELECT \'Sweetwater\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
        FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
        WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
        AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
        AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
        AND "Geography" LIKE \'Sweetwater\' \
        UNION \
        SELECT \'Unknown\'  AS geography, COALESCE(SUM(cast("2010 Incidence No." as float)), 0) + COALESCE(COALESCE(SUM(cast("2011 Incidence No." as float)), 0), 0) + COALESCE(SUM(cast("2012 Incidence No." as float)), 0) AS total \
        FROM cogs121_16_raw.hhsa_primary_and_secondary_syphillis_2010_2012 \
        WHERE "2010 Incidence Rate" <> \'§\' AND "2010 Incidence Rate" <> \'‐‐‐\' \
        AND "2011 Incidence Rate" <> \'§\' AND "2011 Incidence Rate" <> \'‐‐‐\' \
        AND "2012 Incidence Rate" <> \'§\' AND "2012 Incidence Rate" <> \'‐‐‐\' \
        AND "Geography" LIKE \'Unknown\''

        client.query( q, function(err, result) {
        //call `done()` to release the client back to the pool
          done();

          if(err) {
            return console.error('error running query', err);
          }
          res.json(result.rows);
          client.end();
          return { delphidata: result };
        });
      });
      return { delphidata: "No data found" };
    });


/* Gets the top five crimes.
 *
 */
// app.get('/timeofcrimes', function (req, res) {
//   pg.connect(conString, function(err, client, done) {
//
//     if(err) {
//     return console.error('error fetching client from pool', err);
//     }
//
//     var q = 'SELECT EXTRACT(HOUR FROM c.activity_date) AS hour, Count(*) \
//              FROM cogs121_16_raw.arjis_crimes c \
//              GROUP BY hour \
//              ORDER BY hour ASC';
//
//     client.query( q, function(err, result) {
//     //call `done()` to release the client back to the pool
//       done();
//
//       if(err) {
//         return console.error('error running time query', err);
//       }
//       res.json(result.rows);
//       client.end();
//       return { delphidata: result };
//     });
//   });
//   return { delphidata: "No data found" };
// });


http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});
