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
app.get('/agencycrimes', function (req, res) {
  pg.connect(conString, function(err, client, done) {

    if(err) {
    return console.error('error fetching client from pool', err);
    }

    var q = 'SELECT c.agency, COUNT(*) AS total \
      FROM cogs121_16_raw.arjis_crimes c \
      WHERE c.agency NOT IN (\'SAN DIEGO\', \'SHERIFF\') \
      GROUP BY c.agency \
      ORDER BY total ASC';

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

app.get('/communities', function (req, res) {
  pg.connect(conString, function(err, client, done) {

    if(err) {
    return console.error('error fetching client from pool', err);
    }

    var q = 'SELECT c.community, COUNT(*) AS total \
      FROM cogs121_16_raw.arjis_crimes c \
      WHERE c.community <> \'\' \
      GROUP BY c.community \
      ORDER BY total ASC';

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

app.get('/communities/:id', function(req, res){
  pg.connect(conString, function(err, client, done) {

    if(err) {
    return console.error('error fetching client from pool', err);
    }

    var q = 'SELECT c.charge_description, COUNT(*) AS total \
    FROM cogs121_16_raw.arjis_crimes c \
    WHERE c.community LIKE \'' + req.params.id + '\' \
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
app.get('/timeofcrimes', function (req, res) {
  pg.connect(conString, function(err, client, done) {

    if(err) {
    return console.error('error fetching client from pool', err);
    }

    var q = 'SELECT EXTRACT(HOUR FROM c.activity_date) AS hour, Count(*) \
             FROM cogs121_16_raw.arjis_crimes c \
             GROUP BY hour \
             ORDER BY hour ASC';

    client.query( q, function(err, result) {
    //call `done()` to release the client back to the pool
      done();

      if(err) {
        return console.error('error running time query', err);
      }
      res.json(result.rows);
      client.end();
      return { delphidata: result };
    });
  });
  return { delphidata: "No data found" };
});


http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});
