// Create a HTTP server app.
var express = require('express');
var app = express();
//File reader
var fs = require('fs');
//Reads in JSON file
var crimes = JSON.parse(fs.readFileSync('CrimeRates.json','utf8'));
var earnings = JSON.parse(fs.readFileSync('AnnualEarns.json','utf8'));
//declare up DB with SQLite3
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(':memory:');

//Database Set up begins
db.serialize(function() 
{
    //set up crime table   
  db.run("CREATE TABLE crimeRates('GardaStation' Text, 'Y2008' INTEGER, 'Y2009' INTEGER, 'Y2010' INTEGER, 'Y2011' INTEGER ,'Y2012' INTEGER, 'Y2013' INTEGER, 'Crime' Text)");
    
    //set up annualEarnings table
  db.run("CREATE TABLE annualEarnings('EarningType' Text, 'Y2008' INTEGER, 'Y2009' INTEGER, 'Y2010' INTEGER, 'Y2011' INTEGER ,'Y2012' INTEGER, 'Y2013' INTEGER, 'Y2014' INTEGER)");
    
//populate crime table
  var stmt = db.prepare("INSERT INTO crimeRates VALUES (?,?,?,?,?,?,?,?)");
      crimes.forEach(function (fill)
      {
        stmt.run(fill.GardaStation, fill.Y2008 , fill.Y2009, fill.Y2010, fill.Y2011 , fill.Y2012 , fill.Y2013, fill.Crime);
        console.log(fill.GardaStation, fill.Y2008 , fill.Y2009, fill.Y2010, fill.Y2011 , fill.Y2012 , fill.Y2013, fill.Crime);
      });
    stmt.finalize();
    
//populate annual earnings table
 stmt = db.prepare("INSERT INTO annualEarnings VALUES (?,?,?,?,?,?,?,?)");
      earnings.forEach(function(fill)
      {
        stmt.run(fill.EarningType, fill.Y2008 , fill.Y2009, fill.Y2010, fill.Y2011 , fill.Y2012 , fill.Y2013, fill.Y2014);
        console.log(fill.EarningType, fill.Y2008 , fill.Y2009, fill.Y2010, fill.Y2011 , fill.Y2012 , fill.Y2013, fill.Y2014);
      });
    stmt.finalize();
  });
db.close();
//Set up default page for site..
app.get('/', function(req, res)
{
  res.send("Welcome To the crime vs earnings API");
});

// Start the server.
var server = app.listen(8000);