/**
 * Modul
 * Erstellt eine Verbidnung zu einer MongoDB Datenbank und bietet Methoden an um darauf zuzugreifen
 * @param {Object} host - Adresse der Datenbank
 * @param {Object} port
 */
function MongoDB (host, port){
	this.MongoClient = require('mongodb').MongoClient, format = require('util').format;
	this.host = process.env['MONGO_NODE_DRIVER_HOST'] != null ? process.env['MONGO_NODE_DRIVER_HOST'] : host;
	this.port = process.env['MONGO_NODE_DRIVER_PORT'] != null ? process.env['MONGO_NODE_DRIVER_PORT'] : port;
}


/**
 * Fügt einen neuen Client in die Datenbank hinzu, oder liefer Daten des Clients zurück falls vorhanden
 * @param {Object} searchUsername - Name des Client
 * @param {Object} func - Callback für die Ergebnisse aus der Datenbank
 */
MongoDB.prototype.insertUser = function (searchUsername, func) {
	console.log("DATABASE CONNECT: " + this.host + ":" + this.port);
	
	// stellt Verbindung zur Datenbank her
	this.MongoClient.connect(format("mongodb://%s:%s/db1?w=1", this.host, this.port), function(err, db) {
		var score = 0;
		var distance = 0;
		var collection = db.collection('users');
		
		// Client wird in der Datenbank gesucht
		collection.findOne({
			username : searchUsername
		}, function(err, document) {

			var data = {
				username : searchUsername,
				score    : 0,
				distance : 0
			};

			if (document == null) { //wenn der username noch nicht vorhanden
				console.log("DATABASE ADD USER: " + searchUsername);

				collection.insert(data, {
					w : 0
				});
			} else { // falls vorhanden
				console.log("DATABASE FIND USER: " + document.username);
				score = document.score;
				distance = document.distance;
			}
			db.close();
			
			//gibt den score zurück
			func(score, distance);
		});
	});
}

/**
 * Updatet die Daten eines Client in der Datenbank
 * @param {Object} searchUsername - Name des Client
 * @param {Object} score - neue Score Points
 * @param {Object} distance - neue gelaufene Distanz
 */
MongoDB.prototype.updateUser = function (searchUsername, score, distance) {
	console.log("DATABASE CONNECT: " + this.host + ":" + this.port);
	
	// stellt Verbindung zur Datenbank her
	this.MongoClient.connect(format("mongodb://%s:%s/db1?w=1", this.host, this.port), function(err, db) {
		var id;
		var collection = db.collection('users');
		
		// Client wird in der Datenbnak gesucht
		collection.findOne({
			username : searchUsername
		}, function(err, document) {
			
			if (document == null) { // Client nicht vorhanden
				console.log("DATABASE ERROR: Username - " + searchUsername + " not found");
			} else { // Client vorhanden
				console.log("DATABASE FIND USER: " + document.username);
				
				id = document._id;
				
				// Daten des Client wird geupdatet
				collection.findAndModify({
					_id : id
				}, [['_id', 'asc']], {
					$set : {
						score    : score,
						distance : distance
					}
				}, {}, function(err, object) {
					console.log("DATABASE UPDATE SCORE : User  - " + searchUsername + " | Score - " + score);
				});
			}
			
			db.close();
		});
	});
}

/**
 * Liefert die erfolgreichten Clients zurück
 * @param {Object} func - Callback des Ergebnisses
 * @param {Object} count - Anzahl der Clients
 */
MongoDB.prototype.getHighscoreList = function(func, count) {
	// Verbindung zur Datenbank
	this.MongoClient.connect(format("mongodb://%s:%s/db1?w=1", this.host, this.port), function(err, db) {
		var collection = db.collection('users');
		
		//Sucht die besten Clients raus, auf Basis ihrer Score Points
		collection.find({}, {limit:count, sort:[['score',-1]]}).toArray(function(err, items) {
			var array = new Array();
			for(i in items)
			{
				array.push({
					username: items[i].username, 
					highscore: items[i].score
				});	
			}
			db.close();
			// liefert Ergebnis zurück
			func(array);
		});
	});
}


/**
 * Liefert die Daten eines Clients zurück
 * @param {Object} searchUsername - Name des Client
 * @param {Object} func - Callback für das Ergebnis
 */
MongoDB.prototype.getStatistic = function(searchUsername, func){
	// Verbindung zur Datenbank
	this.MongoClient.connect(format("mongodb://%s:%s/db1?w=1", this.host, this.port), function(err, db) {
		var collection = db.collection('users');
		
		var score;
		var distance;
		
		// Sucht den Client in der Datenbank
		collection.findOne({
			username : searchUsername
		}, function(err, document){
			
			if (document == null) { // falls nicht vorhanden
				console.log("DATABASE ERROR: Username - " + searchUsername + " not found");
			} else { // falls vorhanden
				score    = document.score;
				distance = document.distance;
				
				// Ergebnis wird zurückgeliefert
				func({
					username       : searchUsername,
					highscore      : score,
					amountDistance : distance
				}); 
			}
		});
	});
}
exports.MongoDB = MongoDB;