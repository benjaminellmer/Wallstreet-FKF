const sqlite3 = require('sqlite3').verbose();
const dbPath = '../database/wallstreet-database.db'; // Update the path as necessary

// Function to establish a database connection
const connect = () => new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE);

// Generic read function for SELECT queries
const read = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        const db = connect();
        db.all(sql, params, (err, rows) => {
            db.close();
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

// Generic write function for INSERT, UPDATE, DELETE queries
// Updated write function to optionally accept an existing database connection
const write = (sql, params = [], db = null) => {
    const shouldClose = !db; // Only close if we created the connection here

    if (!db) {
        db = connect(); // If no connection is provided, create a new one
    }

    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (shouldClose) {
                db.close(); // Close the connection if it was created in this function
            }
            if (err) {
                reject(err);
            } else {
                resolve({ lastID: this.lastID, changes: this.changes });
            }
        });
    });
};

module.exports = {
    read,
    write,
    connect // Export the connect function as well to use for transactions
};

