// Built-in Node.js modules
let fs = require('fs');
let path = require('path');

// NPM modules
let express = require('express');
let sqlite3 = require('sqlite3');
const { query } = require('express');


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

function parseQueryString(q_string){
    let key_values = q_string.substring(1).split("=");
    let query_object = {};
    for(let i=0; i<key_values.length; i++){
        let key_val = key_values[i].split(',');
        query_object[key_val[0]] = key_val[1];
    }
    return query_object;
}

// GET request handler for crime codes
app.get('/codes', (req, res) => {
    console.log(req.query); // query object (key-value pairs after the ? in the url)
    let keyValues = parseQueryString(req.query);

    if(keyValues.length > 1) {
        query = 'SELECT DISTINCT FROM Codes WHERE';
        let addition = "";
        while(keyValues[i]) {
            if(i<keyValues.length-1) {
                addition = addition + "Codes.code = ".concat(keyValues[i]);
                addition = addition + " AND ";
            }else {
                addition = addition + "Codes.code = ".concat(keyValues[i]);
            }
        }
    }else if(keyValues.length === 1) {
        query = 'SELECT DISTINCT FROM Codes WHERE Codes.code = '+keyValues[0];
    }else {
        query = 'SELECT DISTINCT FROM Codes';
    }

    let promise = databaseSelect(query, params);
    let jsonArr = [];

    promise.then((rows) => {
        rows.forEach(e => {
            jsonArr.add({"code": rows.code, "type": rows.incident_type});
        });
    });

    res.status(200).type('json').send(jsonArr); // <-- you will need to change this
});

// GET request handler for neighborhoods
app.get('/neighborhoods', (req, res) => {
    console.log(req.query); // query object (key-value pairs after the ? in the url)
    let keyValues = parseQueryString(req.query);

    if(keyValues.length > 1) {
        query = 'SELECT DISTINCT FROM Neighborhoods WHERE';
        let addition = "";
        while(keyValues[i]) {
            if(i<keyValues.length-1) {
                addition = addition + "Neighborhoods.neigborhood_number = ".concat(keyValues[i]);
                addition = addition + " AND ";
            }else {
                addition = addition + "Neighborhoods.neigborhood_number = ".concat(keyValues[i]);
            }
        }
    }else if(keyValues.length === 1) {
        query = 'SELECT DISTINCT FROM Neighborhoods WHERE Neighborhoods.neigborhood_number = '+keyValues[0];
    }else {
        query = 'SELECT DISTINCT FROM Neighborhoods';
    }

    let promise = databaseSelect(query, params);
    let jsonArr = [];

    promise.then((rows) => {
        rows.forEach(e => {
            jsonArr.add({"id": rows.neighborhood_number, "name": rows.neighborhood_name});
        });
    });
    
    res.status(200).type('json').send(jsonArr); // <-- you will need to change this
});

// GET request handler for crime incidents
app.get('/incidents', (req, res) => {
    console.log(req.query); // query object (key-value pairs after the ? in the url)
    let keyValues = parseQueryString(req.query);

    if(keyValues.length > 1) {
        query = 'SELECT DISTINCT FROM Incidents WHERE';
        let addition = "";
        while(keyValues[i]) {
            if(i<keyValues.length-1) {
                addition = addition + "Incidents.case_number = ".concat(keyValues[i]);
                addition = addition + " AND ";
            }else {
                addition = addition + "Incidents.case_number = ".concat(keyValues[i]);
            }
        }
    }else if(keyValues.length === 1) {
        query = 'SELECT DISTINCT FROM Incidents WHERE Incidents.case_number = '+keyValues[0];
    }else {
        query = 'SELECT DISTINCT FROM Incidents';
    }
    
    let promise = databaseSelect(query, params);
    let jsonArr = [];

    promise.then((rows) => {
        rows.forEach(e => {
            //update date and time to be seperate
            jsonArr.add({"case_number": e.case_number, "date": e.date_time, "code": e.code, "incident": e.incident, "police_grid": e.police_grid, "neigborhood_number": e.neighborhood_number, "block": e.block});
        });
    });

    res.status(200).type('json').send(jsonArr); // <-- you will need to change this
});

// PUT request handler for new crime incident
app.put('/new-incident', (req, res) => {
    console.log(req.body); // uploaded data
    
    res.status(200).type('txt').send('OK'); // <-- you may need to change this
});

// DELETE request handler for new crime incident
app.delete('/new-incident', (req, res) => {
    console.log(req.body); // uploaded data
    
    res.status(200).type('txt').send('OK'); // <-- you may need to change this
});


// Create Promise for SQLite3 database SELECT query 
function databaseSelect(query, params) {
    return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            if (err) {
                reject(err);
                res.writeHead(err, {'Content-Type': 'text/plain'});
                res.write('Query Unsucsessful');
                res.end();
            }
            else {
                resolve(rows);
                
            }
        
            res.writeHead(404, {'Content-Type': 'text/plain'});
            res.write('Error: cannot process ' + req.method + ' request');
            res.end();     
        });
    })
}

// Create Promise for SQLite3 database INSERT or DELETE query
function databaseRun(query, params) {
    return new Promise((resolve, reject) => {
        db.run(query, params, (err) => {
            if (err) {
                reject(err);
                es.writeHead(err, {'Content-Type': 'text/plain'});
                res.write('Query Unsucsessful');
                res.end();
            }
            else if(req.readyState === 4 && req.status === 200){
                resolve();
            }
            res.writeHead(404, {'Content-Type': 'text/plain'});
            res.write('Error: cannot process ' + req.method + ' request');
            res.end();   
        });
    })
}


// Start server - listen for client connections
app.listen(port, () => {
    console.log('Now listening on port ' + port);
});
