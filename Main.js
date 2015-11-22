// Create a HTTP server app.
var express = require('express');
var app = express();
//File reader
var fs = require('fs');
//Reads in JSON file
var crimes = JSON.parse(fs.readFileSync('CrimeRates.json','utf8'));
var earnings = JSON.parse(fs.readFileSync('AnnualEarns.json','utf8'));
//allows broswer to show JSON files
var bodyParser = require('body-parser');
//declare DB with SQLite3
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(':memory:');
//allows us to create path to HTML file
var path = require('path');
//port number that will be used, set to 8000 by default
var portNo = 8000;


app.use(bodyParser.json()); // allow broswer to show JSON 
app.use(bodyParser.urlencoded({ extended: true }));


//Database Set up begins
db.serialize(function() 
{
    //set up crime table   
  db.run("CREATE TABLE crimeRates(id INTEGER PRIMARY KEY AUTOINCREMENT,'GardaStation' Text, 'Y2008' INTEGER, 'Y2009' INTEGER, 'Y2010' INTEGER, 'Y2011' INTEGER ,'Y2012' INTEGER, 'Y2013' INTEGER, 'Crime' Text)");
    
    //set up annualEarnings table
  db.run("CREATE TABLE annualEarnings(id INTEGER PRIMARY KEY AUTOINCREMENT,'EarningType' Text, 'Y2008' INTEGER, 'Y2009' INTEGER, 'Y2010' INTEGER, 'Y2011' INTEGER ,'Y2012' INTEGER, 'Y2013' INTEGER, 'Y2014' INTEGER, 'Sector' Text)");
    
//populate crime table from JSON 
  var stmt = db.prepare("INSERT INTO crimeRates (GardaStation,Y2008,Y2009,Y2010,Y2011,Y2012,Y2013,Crime) VALUES (?,?,?,?,?,?,?,?)");
      crimes.forEach(function (fill)
      {
        stmt.run(fill.GardaStation, fill.Y2008 , fill.Y2009, fill.Y2010, fill.Y2011 , fill.Y2012 , fill.Y2013, fill.Crime);
        //console.log(fill.GardaStation, fill.Y2008 , fill.Y2009, fill.Y2010, fill.Y2011 , fill.Y2012 , fill.Y2013, fill.Crime);
      });
    stmt.finalize();
    
//populate annual earnings table from JSON
 stmt = db.prepare("INSERT INTO annualEarnings (EarningType,Y2008,Y2009,Y2010,Y2011,Y2012,Y2013,Y2014,Sector) VALUES (?,?,?,?,?,?,?,?,?)");
      earnings.forEach(function(fill)
      {
        stmt.run(fill.EarningType, fill.Y2008 , fill.Y2009, fill.Y2010, fill.Y2011 , fill.Y2012 , fill.Y2013, fill.Y2014, fill.Sector);
        //console.log(fill.EarningType, fill.Y2008 , fill.Y2009, fill.Y2010, fill.Y2011 , fill.Y2012 , fill.Y2013, fill.Y2014, fill.Sector);
      });
    stmt.finalize();
  });

//Set up default page for site, sends html file named Default.html..
app.get('/', function(req, res)
{
  res.sendFile(path.join(__dirname+'/Default.html'));
});
//set up years page
app.get('/annualEarningsYear/:yearStr', function (req, res)
{
    db.all("SELECT id, Y"+req.params.yearStr+" FROM annualEarnings", function(err,row)
    {
        //converts json to browser readable format
        var rowString = JSON.stringify(row, null, '\t');
        res.sendStatus(rowString);
    });
});
//returns sum of crime attempts based on parameters entered
app.get('/GardaStation/:crimeArea', function (req, res)
{
    db.all("SELECT id,Crime, (Y2008 + Y2009 + Y2010 + Y2011 +Y2012 + Y2013) AS numberofattempts, GardaStation FROM crimeRates WHERE GardaStation LIKE \"%"+ req.params.crimeArea+"%\" ", function(err,row)
    {
        var rowString2 = JSON.stringify(row, null, '\t');
        res.sendStatus(rowString2);
    });
});
//allows us to select an entry based on crime ID (useful for testing updates and deletes)
app.get('/crimeById/:id', function (req, res)
{
    db.all("SELECT id,Crime, (Y2008 + Y2009 + Y2010 + Y2011 +Y2012 + Y2013) AS numberofattempts, GardaStation FROM crimeRates WHERE id ="+req.params.id+"", function(err,row)
    {
        var rowString2 = JSON.stringify(row, null, '\t');
        res.sendStatus(rowString2);
    });
});
//allows us to do the same as above, except this time for earnings
app.get('/earningsById/:id', function (req, res)
{
    db.all("SELECT id,EarningType, (Y2008 + Y2009 + Y2010 + Y2011 +Y2012 + Y2013) AS sumOfEarnings, Sector FROM annualEarnings WHERE id ="+req.params.id+"", function(err,row)
    {
        var rowString2 = JSON.stringify(row, null, '\t');
        res.sendStatus(rowString2);
    });
});

//crime rates and total earnings by area and sector
app.get('/compareSectorAndStation/:sector/:crimeArea', function (req, res)
{
    db.all("SELECT crimeRates.id as CrimeID, annualEarnings.id as EarningID, crimeRates.Crime as Crimes, (crimeRates.Y2008 + crimeRates.Y2009 + crimeRates.Y2010 + crimeRates.Y2011 +crimeRates.Y2012 + crimeRates.Y2013) AS numberofattempts, (annualEarnings.Y2008 + annualEarnings.Y2009 + annualEarnings.Y2010 + annualEarnings.Y2011 +annualEarnings.Y2012 + annualEarnings.Y2013) AS sumOfEarnings, crimeRates.GardaStation as GardaStations, annualEarnings.Sector as Sector FROM crimeRates LEFT JOIN annualEarnings WHERE crimeRates.GardaStation LIKE \"%"+req.params.crimeArea+"%\" AND annualEarnings.Sector LIKE \"%"+req.params.sector+"%\" ", function(err,row)
    {
        var rowString2 = JSON.stringify(row, null, '\t');
        res.sendStatus(rowString2);
    });
});
//join by year, sector and station
app.get('/compareSectorAndStation/:sector/:crimeArea/:yearStr', function (req, res)
{
    db.all("SELECT crimeRates.id as CrimeID, annualEarnings.id as EarningID, crimeRates.Crime as Crimes, crimeRates.Y"+req.params.yearStr+" AS numberofattempts, annualEarnings.Y"+req.params.yearStr+" as Earnings , annualEarnings.EarningType as Type, crimeRates.GardaStation as GardaStations, annualEarnings.Sector as Sector FROM crimeRates INNER JOIN annualEarnings WHERE crimeRates.GardaStation LIKE \"%"+req.params.crimeArea+"%\" AND annualEarnings.Sector LIKE \"%"+req.params.sector+"%\" ", function(err,row)
    {
        var rowString2 = JSON.stringify(row, null, '\t');
        res.sendStatus(rowString2);
        
    });
});
//join by year , sector, crime area and crime
app.get('/compareSectorAndStation/:sector/:crimeArea/:yearStr/:crimeType', function (req, res)
{
    db.all("SELECT crimeRates.id as CrimeID, annualEarnings.id as EarningID, crimeRates.Crime as Crimes, crimeRates.Y"+req.params.yearStr+" AS numberofattempts, annualEarnings.Y"+req.params.yearStr+" as Earnings , annualEarnings.EarningType as Type, crimeRates.GardaStation as GardaStations, annualEarnings.Sector as Sector FROM crimeRates INNER JOIN annualEarnings WHERE crimeRates.GardaStation LIKE \"%"+req.params.crimeArea+"%\" AND annualEarnings.Sector LIKE \"%"+req.params.sector+"%\"AND crimeRates.Crime LIKE \"%"+req.params.crimeType+"%\"  ", function(err,row)
    {
        var rowString2 = JSON.stringify(row, null, '\t');
        res.sendStatus(rowString2);
        
    });
});
//Simple new entry into crime database
app.post('/newCrimeEntry/:type/:station/:year/:amount', function (req, res)
{
    db.all("INSERT INTO crimeRates(Crime , GardaStation , Y"+req.params.year+") VALUES (\""+req.params.type+"\" , \""+req.params.station+"\" , "+req.params.amount+")", function(err,row)
    {
        res.sendStatus("New Entry has been added.");
    });
});
//Simple new entry into Annual Earnings database
app.post('/newEarningEntry/:sector/:type/:year/:amount', function (req, res)
{
    db.all("INSERT INTO annualEarnings(Sector , EarningType , Y"+req.params.year+") VALUES (\""+req.params.sector+"\" , \""+req.params.type+"\" , "+req.params.amount+")", function(err,row)
    {
        res.sendStatus("New Entry has been added.");
    });
});
//Delete Row from earnings table based on ID
app.delete('/deleteEarning/:id', function (req, res)
{
    db.all("DELETE FROM annualEarnings WHERE id="+req.params.id+"", function(err,row)
    {
        res.sendStatus("Earning with ID " + req.params.id + " has been deleted.");
    });
});
//delete row from Crime table based on ID
app.delete('/deleteCrime/:id', function (req, res)
{
    db.all("DELETE FROM crimeRates WHERE id="+req.params.id+"", function(err,row)
    {
        res.sendStatus("Crime with ID " + req.params.id + " has been deleted.");
    });
});
//update number of crimes on crime table using id, year and the amount
app.put('/updateCrimeAmount/:id/:year/:amount', function (req, res)
{
    db.all("UPDATE crimeRates SET Y"+req.params.year+" = "+req.params.amount+"  WHERE id="+req.params.id+"", function(err,row)
    {
        res.sendStatus("Crime with ID " + req.params.id + " has been updated.");
    });
});
//update earnings on annualEarnings table using id, year and the amount
app.put('/updateEarningsAmount/:id/:year/:amount', function (req, res)
{
    db.all("UPDATE annualEarnings SET Y"+req.params.year+" = "+req.params.amount+"  WHERE id="+req.params.id+"", function(err,row)
    {
        res.sendStatus("Earnings with ID " + req.params.id + " has been updated.");
    });
});
// Start the server.
var server = app.listen(portNo);

//db.close();