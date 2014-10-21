// Datenbank - Objekte werden initialisiert und instanziiert
var Database = require('./simulation/persistence/mongo.js').MongoDB;
var mongodb = new Database('mongodb.intern.mi.hs-rm.de', 27017);
// Engine - Objekte werden initialisiert und instanziiert
var Engine = require('./simulation/logic/engine.js').PacEngine;
var pacEngine = new Engine();
// Server - Objekte werden initialisiert und instanziiert
var Server = require('./simulation/logic/server.js').Server
var nodeServer = new Server(8081, mongodb, pacEngine);
