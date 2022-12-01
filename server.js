// Built-in Node.js modules
let fs = require('fs');
let path = require('path');

// NPM modules
let express = require('express');
let sqlite3 = require('sqlite3');
const { query } = require('express');
const { parse } = require('path');


let db_filename = path.join(__dirname, 'db', 'stpaul_crime.sqlite3');

let app = express();
let port = 8000;

app.use(express.json());

// Open SQLite3 database (in read-only mode)
let db = new sqlite3.Database(db_filename, sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.log('Error opening ' + path.basename(db_filename));
    }
    else {
        console.log('Now connected to ' + path.basename(db_filename));
    }
});


// GET request handler for crime codes
app.get('/codes', (req, res) => {
    console.log(req.query); // query object (key-value pairs after the ? in the url)
    let query = "";
    //check to see if specified parameters were given
    if(Object.keys(req.query).length !== 0) {
        let keyValues = req.query.code.split(',');
        if(keyValues.length > 1) {
            query = 'SELECT * FROM Codes WHERE ';
            while(keyValues.length>0) {
                let value = keyValues.pop();
                if(keyValues.length>0) {
                    query = query + "Codes.code = " +value+" OR ";
                }else {
                    query = query + "Codes.code = "+value;
                }
            }
        }else if(keyValues.length === 1) {
            query = "SELECT * FROM Codes WHERE Codes.code = "+keyValues[0];
        }else {
            res.writeHead(err, {'Content-Type': 'text/plain'});
            res.write('Bad Parameters');
            res.end();    
        }   
    }else {
        query = 'SELECT * FROM Codes';
    }
    console.log(query+ ' ORDER BY Code ASC LIMIT 1000');
    let promise = databaseSelect(query, []);

    promise.then((rows) => {
        res.status(200).type('json').send(rows);
    });
});
    
// GET request handler for neighborhoods
app.get('/neighborhoods', (req, res) => {
    console.log(req.query); // query object (key-value pairs after the ? in the url)
    let query = "";
    if(Object.keys(req.query).length !== 0) {
        let keyValues = req.query.id.split(',');
        if(keyValues.length > 1) {
            query = 'SELECT * FROM Neighborhoods WHERE ';
            while(keyValues.length>0) {
                let value = keyValues.pop();
                if(keyValues.length>0) {
                    query = query + "Neighborhoods.id = " +value+" OR ";
                }else {
                    query = query + "Neighborhoods.id = "+value;
                }
            }
        }else if(keyValues.length === 1) {
            query = "SELECT * FROM Neighborhoods WHERE Neighborhoods.id = "+keyValues[0];
        }else {
            res.writeHead(err, {'Content-Type': 'text/plain'});
            res.write('Bad Parameters');
            res.end();    
        }   
    }else {
        query = 'SELECT * FROM Neighborhoods';
    }
    console.log(query+ ' ORDER BY Code ASC LIMIT 1000');
    let promise = databaseSelect(query, []);

    promise.then((rows) => {
        res.status(200).type('json').send(rows);
    });
});

// GET request handler for crime incidents
app.get('/incidents', (req, res) => {
    console.log(req.query); // query object (key-value pairs after the ? in the url)
    let query = "";
    let limit = 1000;
    if(Object.keys(req.query).length !== 0) {

        query = 'SELECT * FROM Incidents WHERE ';
        let keyValues = [];
        let first = true;
        try{    
            let start_date = req.query['start_date'];
            let end_date = req.query['end_date']  

            console.log(start_date);

            // start_date = null
            // and
            // end_data = set to a value
            if(start_date == null && end_date != null) {
                query = query + "DATE(`date_time`) <= \"" +end_date+"\" ORDER by date_time ASC OR ";
            }

            // end_data = null
            // and
            // start_date = set to a value
            else if(start_date != null && end_date == null) {query = query + "DATE(`date_time`) >= \"" +start_date+"\" ORDER by date_time ASC OR ";}
            
            // both values are not null
            else if(start_date != null && end_date != null) { 
            query = query + "DATE(`date_time`) >= \"" + start_date + "\"";
            query += " AND DATE(`date_time`) <= \"" + end_date + "\" ORDER by date_time ASC OR "
            }

            // where both are null
            else {             }
 
        }
        catch(err){} 

        try{
            keyValues = req.query.code.split(',');
            if(keyValues.length > 1) {
                while(keyValues.length>0) {
                    let value = keyValues.pop();
                    if(keyValues.length>0) {
                        query = query + "Incidents.code = " +value+" OR ";
                    }else {
                        query = query + "Incidents.code = "+value +" OR ";
                    }
                }
            }else if(keyValues.length === 1) {
                query = query+ " Incidents.code = "+keyValues[0]+" OR ";
            }
        }
        catch(err){}

        try{
            keyValues = req.query.grid.split(',');
            if(keyValues.length > 1) {
                while(keyValues.length>0) {
                    let value = keyValues.pop();
                    if(keyValues.length>0) {
                        query = query + "Incidents.grid = " +value+" OR ";
                    }else {
                        query = query + "Incidents.grid = "+value +" OR ";
                    }
                }
            }else if(keyValues.length === 1) {
                query = query+ " Incidents.grid = "+keyValues[0]+" OR ";
            }
        }
        catch(err){}

        try{
            keyValues = req.query.neighborhood.split(',');
            if(keyValues.length > 1) {
                while(keyValues.length>0) {
                    let value = keyValues.pop();
                    if(keyValues.length>0) {
                        query = query + "Incidents.neighborhood = " +value+" OR ";
                    }else {
                        query = query + "Incidents.neighborhood = "+value +" OR ";
                    }
                }
            }else if(keyValues.length === 1) {
                query = query+ " Incidents.neighborhood = "+keyValues[0]+" OR ";
            }
        }
        catch(err){}
        

        try{
            limit = req.query.limit;
        }
        catch(err) {
            limit = 1000;
        }

        query = query.slice(0, query.length - 4); 
            
    }else {
        query = 'SELECT * FROM Incidents';
    }
    if(limit>1000 || limit<0 || typeof limit !== "int")  {
        limit = 1000;
    }
 
    console.log(query+ ' ORDER BY date_time ASC LIMIT '+limit);
    let promise = databaseSelect(query, []);

    promise.then((rows) => {
        res.status(200).type('json').send(rows);
    });
});

// DELETE request handler for new crime incident
app.delete('/remove-incident', (req, res) => {
    console.log(req.body); // uploaded data
    
    
    // First, test whether case number is in DB already
    // If not, response should reject (status 500)
    let test_query="";
    test_query = "SELECT * FROM Incidents WHERE Incidents.case_number=" + req.body.case_number;
    

    let promise = databaseSelect(test_query, []);
    promise.then((rows) => {
        if (rows.length === 0) {
            res.status(500).type('txt').send('Error: no incident found within database containing that case number.');
        } else {
            // Next, construct query to delete data from DB
            let query = "";
            query = "DELETE FROM Incidents WHERE case_number='";
            query += req.body.case_number + "';";

            // Finally, run query and send ok response
            let final_promise = databaseRun(query, []);
            final_promise.then(() => {
                res.status(200).type('txt').send('OK'); // <-- you may need to change this
            })
        }
    });
});


// Create Promise for SQLite3 database SELECT query 
function databaseSelect(query, params) {
    return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(rows);
            }  
        });
    })
}

// Create Promise for SQLite3 database INSERT or DELETE query
function databaseRun(query, params) {
    return new Promise((resolve, reject) => {
        db.all(query, params, (err) => {
            if (err) {
                reject(err);
            }
            else {
                resolve();
            }
        });
    })
}


// Start server - listen for client connections
app.listen(port, () => {
    console.log('Now listening on port ' + port);
});
