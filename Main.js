// Create a HTTP server app.
var express = require('express');
var app = express();
//File reader
var fs = require('fs');
//Reads in JSON file
var crimes = JSON.parse(fs.readFileSync('CrimeRates.json','utf8'));
var earnings = JSON.parse(fs.readFileSync('AnnualEarns.json','utf8'));

var bodyParser = require('body-parser');
//declare up DB with SQLite3
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(':memory:');


app.use(bodyParser.json()); // allow app to use JSON 
app.use(bodyParser.urlencoded({ extended: true }));


//Database Set up begins
db.serialize(function() 
{
    //set up crime table   
  db.run("CREATE TABLE crimeRates('GardaStation' Text, 'Y2008' INTEGER, 'Y2009' INTEGER, 'Y2010' INTEGER, 'Y2011' INTEGER ,'Y2012' INTEGER, 'Y2013' INTEGER, 'Crime' Text)");
    
    //set up annualEarnings table
  db.run("CREATE TABLE annualEarnings('EarningType' Text, 'Y2008' INTEGER, 'Y2009' INTEGER, 'Y2010' INTEGER, 'Y2011' INTEGER ,'Y2012' INTEGER, 'Y2013' INTEGER, 'Y2014' INTEGER, 'Sector' Text)");
    
//populate crime table
  var stmt = db.prepare("INSERT INTO crimeRates VALUES (?,?,?,?,?,?,?,?)");
      crimes.forEach(function (fill)
      {
        stmt.run(fill.GardaStation, fill.Y2008 , fill.Y2009, fill.Y2010, fill.Y2011 , fill.Y2012 , fill.Y2013, fill.Crime);
        console.log(fill.GardaStation, fill.Y2008 , fill.Y2009, fill.Y2010, fill.Y2011 , fill.Y2012 , fill.Y2013, fill.Crime);
      });
    stmt.finalize();
    
//populate annual earnings table
 stmt = db.prepare("INSERT INTO annualEarnings VALUES (?,?,?,?,?,?,?,?,?)");
      earnings.forEach(function(fill)
      {
        stmt.run(fill.EarningType, fill.Y2008 , fill.Y2009, fill.Y2010, fill.Y2011 , fill.Y2012 , fill.Y2013, fill.Y2014, fill.Sector);
        console.log(fill.EarningType, fill.Y2008 , fill.Y2009, fill.Y2010, fill.Y2011 , fill.Y2012 , fill.Y2013, fill.Y2014, fill.Sector);
      });
    stmt.finalize();
    //ytemp
        db.all("SELECT * FROM annualEarnings", function(err,row)
        {
            var rowString = JSON.stringify(row, null, '\t');
            console.log(rowString);
        });
  });

//Set up default page for site..
app.get('/', function(req, res)
{
  res.send("Welcome To the crime vs earnings API");
});

//set up years page
app.get('/annualEarningsYear/:yearStr', function (req, res)
{
    db.all("SELECT Y"+req.params.yearStr+" FROM annualEarnings", function(err,row)
    {
        var rowString = JSON.stringify(row, null, '\t');
        res.sendStatus(rowString);
        console.log(rowString);
    });
});
//returns sum of crime attempts based on parameters entered
app.get('/GardaStation/:crimeArea', function (req, res)
{
    db.all("SELECT Crime, (Y2008 + Y2009 + Y2010 + Y2011 +Y2012 + Y2013) AS numberofattempts, GardaStation FROM crimeRates WHERE GardaStation LIKE \"%"+ req.params.crimeArea+"%\" ", function(err,row)
    {
        var rowString2 = JSON.stringify(row, null, '\t');
        res.sendStatus(rowString2);
        console.log(req.params.crimeArea);
    });
});
//crime rates and total earnings by area and sector
app.get('/compareSectorAndStation/:sector/:crimeArea', function (req, res)
{
    db.all("SELECT crimeRates.Crime as Crimes, (crimeRates.Y2008 + crimeRates.Y2009 + crimeRates.Y2010 + crimeRates.Y2011 +crimeRates.Y2012 + crimeRates.Y2013) AS numberofattempts, (annualEarnings.Y2008 + annualEarnings.Y2009 + annualEarnings.Y2010 + annualEarnings.Y2011 +annualEarnings.Y2012 + annualEarnings.Y2013) AS sumOfEarnings, crimeRates.GardaStation as GardaStations, annualEarnings.Sector as Sector FROM crimeRates LEFT JOIN annualEarnings WHERE crimeRates.GardaStation LIKE \"%"+req.params.crimeArea+"%\" AND annualEarnings.Sector LIKE \"%"+req.params.sector+"%\" ", function(err,row)
    {
        var rowString2 = JSON.stringify(row, null, '\t');
        res.sendStatus(rowString2);
        console.log(req.params.crimeArea);
        console.log(req.params.sector);
        
    });
});
//join by year, sector and station
app.get('/compareSectorAndStation/:sector/:crimeArea/:yearStr', function (req, res)
{
    db.all("SELECT crimeRates.Crime as Crimes, crimeRates.Y"+req.params.yearStr+" AS numberofattempts, annualEarnings.Y"+req.params.yearStr+" AS sumOfEarnings, crimeRates.GardaStation as GardaStations, annualEarnings.Sector as Sector FROM crimeRates LEFT JOIN annualEarnings WHERE crimeRates.GardaStation LIKE \"%"+req.params.crimeArea+"%\" AND annualEarnings.Sector LIKE \"%"+req.params.sector+"%\" ", function(err,row)
    {
        var rowString2 = JSON.stringify(row, null, '\t');
        res.sendStatus(rowString2);
        console.log(req.params.crimeArea);
        console.log(req.params.sector);
        
    });
});
// Start the server.
var server = app.listen(8000);

//db.close();