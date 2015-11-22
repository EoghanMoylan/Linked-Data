# Linked-Data
***Eoghan Moylan***

##Overview
The goal of this API is to create a link between the earnings across various sectors and the number of crimes occuring in various areas. The two datasets are linked by years (2008 - 2013). The API uses SQLite3 and was tested using the [HttpRequester](https://addons.mozilla.org/en-us/firefox/addon/httprequester/) plugin for Firefox. The target audience of this API would be journalists, students, organistions or other parties conducting research into a correlation between earnings in various sectors and increase/decrease in various crime rates. Users can add data, get data, update data and delete data using POST,GET,PUT and DELETE respectively (URLs listed below in *How To Use* section). The API reads in two JSON files and populates a database with them. Both JSON files are quite large and have been edited from their original form in order to make them more useful/compatiable.

####Expansion
It would be possible to expand this API in future. All users would have to do is add an additional column for the year (so far limited to 2008 - 2013) and populate the rows as crimes and earnings occur. Users already have the ability to add and update data.

##How To Use
The API is simple to use, all users have to do is input data on a URL and the API will return data, delete data, add data or update data depending on the input. The full list of URLs is listed below (the are also available from the default html page)

Getting Data:
>localhost:8000/GardaStation/**enter the Garda Station you're interested in here**
>localhost:8000/annualEarningsYear/**enter the year you're interested in here**

>**Both of these will return a large JSON file of all crimes/earnings based on your input.**

>localhost:8000/compareSectorAndStation/**enter the sector you're interested in here**/**enter the station you're interested in here**
>localhost:8000/compareSectorAndStation/sector/garda station/year
>localhost:8000/compareSectorAndStation/sector/garda station/year/type of crime
>localhost:8000/crimeById/id of crime
>localhost:8000/earningsById/id of earning

>**These will return smaller JSON file based on your input.**

Adding data (POST):
>localhost:8000/newCrimeEntry/type of crime/station/year/occurences
>localhost:8000/newEarningsEntry/sector/type of earning/year/occurenamount

Removing data (DELETE):
>localhost:8000/deleteCrime/id of crime
>localhost:8000/deleteEarning/id of earning

Updating data (PUT):
>localhost:8000/updateCrime/id of crime/year of crime/occurences
>localhost:8000/deleteEarning/id of earning/year of earning/ammount earned

*Examples:*

* localhost:8000/updateCrime/85/2009/8

* localhost:8000/newCrimeEntry/murder/Galway/2012/8

(*note that these require a tool such as HttpRequester or cURL in order to work. These cannot be entered into your browser.*)

* localhost:8000/crimeById/85

* localhost:8000/compareSectorAndStation/Arts/Carna/2009/Theft

(*note that as these are GET methods they will return a JSON file if entered into your browser.*)

##Datasets
***Datasets were taken from CSO.ie in CSV format and converted into JSON. Links to originals are at bottom of the README.***

The CrimeRates dataset used contains data listing all crimes reported in all Garda Staions in Ireland between 2008 to 2013. The dataset also lists the type of crime reported also.
The second dataset used, the AnnualEarnings dataset, list a sum of all earnings in various sectors through the years of 2008 to 2014. This dataset also lists the type of earning.


##Code Examples
Below are some code snippets for a few of the URLs listed above.
```javascript
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
```
##References
*For sending HTML using Express : [Use ExpressJS to Deliver HTML Files](https://scotch.io/tutorials/use-expressjs-to-deliver-html-files)

*General info on SQL Queries (e.g Updates) : [w3Schools](http://www.w3schools.com/sql/sql_update.asp)

*General info on RESTful APIs : [Scotch.io](https://scotch.io/tutorials/build-a-restful-api-using-node-and-express-4)

*Plugin for testing API : [HttpRequester](https://addons.mozilla.org/en-us/firefox/addon/httprequester/)

#####Datasets used:

[EHA04: Annual Earnings and Other Labour Costs for All Employees by Industry Sector NACE Rev 2, Year and Statistic] (http://www.cso.ie/px/pxeirestat/Database/eirestat/EHECS%20Earnings%20Hours%20and%20Employment%20Costs%20Survey%20Annual/EHECS%20Earnings%20Hours%20and%20Employment%20Costs%20Survey%20Annual_statbank.asp?SP=EHECS%20Earnings%20Hours%20and%20Employment%20Costs%20Survey%20Annual&Planguage=0)

[CJA07: Recorded Crime Offences by Garda Station, Type of Offence and Year] (http://www.cso.ie/px/pxeirestat/Database/eirestat/Recorded%20Crime/Recorded%20Crime_statbank.asp?sp=Recorded%20Crime&Planguage=0)


