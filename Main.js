// Create a HTTP server app.
var express = require('express');
var app = express();
//File reader
var fs = require('fs');
//Reads in JSON file
var crimes = JSON.parse(fs.readFileSync('CrimeRates.json','utf8'));
//setting up DB with SQLite3
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(':memory:');

//set up the crime table.
db.serialize(function() 
{
  db.run("CREATE TABLE crimeRates('GardaStation' Text, 'Y2008' INTEGER, 'Y2009' INTEGER, 'Y2010' INTEGER, 'Y2011' INTEGER ,'Y2012' INTEGER, 'Y2013' INTEGER, 'Crime' Text)");
//populate database
  var stmt = db.prepare("INSERT INTO crimeRates  VALUES (?,?,?,?,?,?,?,?)");
      crimes.forEach(function (fill)
      {
        stmt.run(fill.GardaStation, fill.Y2008 , fill.Y2009, fill.Y2010, fill.Y2011 , fill.Y2012 , fill.Y2013, fill.Crime);
        console.log(fill.GardaStation, fill.Y2008 , fill.Y2009, fill.Y2010, fill.Y2011 , fill.Y2012 , fill.Y2013, fill.Crime);
      });
    stmt.finalize();
  });
db.close();
//Set up default page for site..
app.get('/', function(req, res)
{
  res.send("Welcome To the crime API");
});

// Start the server.
var server = app.listen(8000);