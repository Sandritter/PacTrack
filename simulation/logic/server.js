/**
 * Modul
 * Repräsentiert die Schnittstelle für den Client, um sich mit einem Server zu verbinden
 * @param {Object} port
 * @param {Object} db - Datenbank Objekt
 * @param {Object} engine - Verwaltet die Sessions
 */
function Server(port, db, engine) {
	// Initialisiert und instanziiert benötigten Variablen
	this.express = require('express');
	this.app     = this.express();
	this.http    = require('http');
	this.server  = this.http.createServer(this.app);
	this.io      = require('socket.io').listen(this.server);
	this.server.listen(port);

	this.database        = db;
	this.clientProxyList = new Array();
	this.GameSettings    = require('../entities/gamesettings.js').GameSettings;
	this.SessionProxy    = require('../entities/sessionproxy.js').SessionProxy;
	this.ClientProxy     = require('../entities/clientproxy.js').ClientProxy;
	this.Repository		 = require('../persistence/repository.js').Repository;
	this.iconRep		 = new this.Repository(14, 4);
	this.PacEngine       = require('./engine.js').PacEngine;
	this.engine          = new this.PacEngine();

	// Definiert den Objektkontext
	var self = this;
	
	// Konfiguriert Socket.io
	this.io.set('log level', 1);
	this.io.set('transports', ['xhr-polling','jsonp-polling']);

	// Konfiguriert Express
	this.app.use(this.express.static(__dirname + '/../../public'));
	this.app.use(this.express.json());
	this.app.use(this.express.urlencoded());

	// ### register webserver callbacks ###
	
	// Sendet die noch zu verbleibende Zeit einer Session
	this.app.get('/gameTime', function(req, res) {
		var roomName = req.param("room");
		var room     = self.engine.getSession(roomName);
		
		console.log("EXPRESS : Get gametime of room " + roomName);

		if(room != null){
			var startTime  = room.getStartTime(); // in milliseconds
			var timeLength = room.getTimeLength(); // in seconds
			var actTime    = new Date().getTime(); // in milliseconds
			
			var timeLeft   = (timeLength * 1000) - (actTime - startTime); // in milliseconds
			
			console.log("Send gameTime: " + timeLeft);
			res.send({time : timeLeft});
		}else {
			console.log("EXPRESS : Room " + roomName + " nicht vorhanden");
		}
	});
	
	// Sendet eine Liste von Icon-Pfaden zurück
	this.app.get('/iconList', function(req, res){
		
		var username = req.param("username");
		var cp;
		
		console.log("EXPRESS : Get iconList for " + username);
		
		if(username in self.clientProxyList){
			cp = self.clientProxyList[username];
			var score = cp.getTotalScore();
			res.send(self.iconRep.getPaths(score));
		}
	});
	
	// Sendet die Mittelpunkt Position einer Session
	this.app.get('/centerPosition', function(req, res) {
		var room = req.param("room");
		console.log("EXPRESS : Get centerposition of room " + room);
		if (self.engine.getSession(room) != null) {
			res.send(self.engine.getSession(room).getPosition());
		}
	});
	
	
	// Sendet die Liste aller Client in einer Session
	this.app.get('/userList', function(req, res) {
		
		var room    = req.param("room");
		var session = self.engine.getSession(room);
		var array   = new Array();
		
		if(session != null) {
			console.log("EXPRESS : Get userList from room " + room);
			var clients = session.getClientList();
			for(username in clients) {
				var c = clients[username];
				
				array.push({
					username : c.getName(),
					pos      : c.getPosition(),
					iconPath : c.getIconPath(),
					pacman   : c.getIsPacman()
				}); 

			}
		}
		res.send(array);
	});
	
	// Sendet die Position aller Punkte die Pacman einsammeln kann
	this.app.get('/pointList', function(req, res) {
		
		var room    = req.param("room");
		var session = self.engine.getSession(room);
		var array   = new Array();
		
		if(session != null){
			console.log("EXPRESS : Get Pointlist of room " + room);
			var points = session.getPointList();
			for(ID in points){
				var point = points[ID];

				array.push({
					ID  : ID,
					pos : point.getPosition()
				});
			}
		}
		res.send(array);
	});
	
	// Sendet die Liste aller offenen Sessions
	this.app.get('/gameList', function(req, res) {
		
		console.log("EXPRESS : Get Gamelist")
		var roomArray = new Array();
		var rooms     = self.engine.getSessions();
			
		var roomname;
			
		for(roomname in rooms){
			var room = rooms[roomname];
			
			// checks if the room is full
			if(!room.isSessionFull()) {
				var roomInfo = {
					gameName : room.getRoomName(),
					host     : room.getHost(),
					timeLeft : room.getTimeLeft(),
					distance : room.getRadius() * 1000
				}	
				roomArray.push(roomInfo);
			}
		}
		res.send(roomArray);
	});
	
	// Sendet die Highscoreliste
	this.app.get('/high', function(req, res) {
		console.log("EXPRESS : Get Highscore")
		self.database.getHighscoreList(function(array){
			res.send(array);
		}, 5);
	});
	
	// Gibt die Daten eines Clients zurück
	this.app.get('/getStatistic', function(req, res){
		
		var username = req.param("username");
		var cp;
		console.log("EXPRESS : Get Statistic");
		
		if(username in self.clientProxyList){
			cp = self.clientProxyList[username];
			var info = {
				username : username,
				highscore : cp.getTotalScore(),
				amountDistance : cp.getTotalWalkingDistance()
			};
		
			res.send(info);
		}	
	});

	// ### register socket.io callbacks ###

	// beim Erstellen einer Connection
	this.io.sockets.on('connection', function(client) {

		client.on('login', function(data) {
			var username = data.username;
			var info     = undefined;
			var score    = undefined;
			var distance = undefined;

			client.set('username', username, function() {

				//prüft ob ein User sich mit dem Loginnamen anmelden kann
				var loginState = self.canLogin(username);
				switch(loginState) {
					case 200:
						// ALLES OK
						console.log("SOCKET IO : Client logged in : " + username);
						self.database.insertUser(username, function(score, distance) {
							console.log("SOCKET IO : Score of user " + username  + " - " + score);
							var cp = new self.ClientProxy(client, username, score, distance);
							self.clientProxyList[username] = cp;
							self.sendUserData({
								client   : client,
								username : username,
								score    : score,
								state    : loginState
							});
						});
						break;
					case 400:
						// Username bereits verwendet
						console.log("SOCKET IO : Username " + username + " bereits enthalten!");
						state = loginState;
						self.sendUserData({
							client   : client,
							username : username,
							score    : score,
							state    : loginState
						});
						break;
				}
			});
		});
		
		// client erstellt einen Raum und joined diesen
		client.on('createRoom', function(data) {
			console.log("SOCKET IO : CREATE ROOM " + data.gameName);
			data = data.gameSettings;

			var settings = new self.GameSettings(data.radius, data.gameTime, data.amountPlayers, data.gameName);
			var sp       = new self.SessionProxy(settings, data.host, function(sessionName, state){ //register gameOver callback
				console.log("SESSION : Game " + sessionName + " ended with state " + state);
				self.io.sockets.in(sessionName).emit('gameOver', {state : state});
			}, function(ID){
				client.emit('markerCatched', ID);			
			});
			
			var roomAddState = self.engine.addSession(sp);  // adds the session to the engine
			client.emit('createRoom', { state : roomAddState });  // client notifies the roomAddState
			
			if(roomAddState == 200){ // room has been created successfuly
				if (self.containedUsername(data.host)) { // checks if username is in clientProxyList
					var cp = self.clientProxyList[data.host];
					cp.setPacman(); // creater of the room is pacman
					self.engine.joinSession(data.gameName, cp); // client automaticaly joins the session
					sp.startGame(); // starts the session
					client.join(data.gameName); // client joins the socket.io room
				}
			}else{
				console.log("SOCKET IO : Room " + data.gameName + " konnte nicht erstellt werden");
			}
		});

		//client enters a room
		client.on('enterRoom', function(data) {
			var room     = data.gameName;
			var iconPath = data.iconPath;
			var username = data.username;
			
			if (self.containedUsername(username)) {
				console.log("SOCKET IO : " + username + " trys to join room " + room);
				var cp = self.clientProxyList[username];
				cp.reset(); // muss gemacht werden, weil man ja einmal als Pacman und danach als Ghost spielen kann. 
				cp.setIconPath(iconPath);
				var joinState = self.engine.joinSession(room, cp);
				if(joinState == 200){
					client.join(room);					
				}
				client.emit('enterRoom', { state : joinState }); // Benachrichtigung, ob joinen geklappt hat oder nicht
				console.log("SOCKET IO : " + username + " got code " + joinState + " at joining "+ room);
			} else {
				console.log("ERROR : Username " + username + " nicht vorhanden");
			}
			console.log("ROOMLIST : " + Object.keys(self.io.sockets.manager.rooms));
		});

		//client leaves the room
		client.on('userLeft', function(data) { // client ruft das auf wenn er den Raum verlässt oder hostDown bekommt
			console.log("LEAVE ROOM");
			var username = data.username;
			if (self.containedUsername(username)) {
				self.leaveRoom(self.clientProxyList[username], client);
			}
		});
		
		//client leaves a room when the game is over
		client.on('leaveRoomOnGameOver', function(data){ // Client soll das aufrufen wenn er gameOver bekommt 
			console.log("LEAVE ROOM ON GAME OVER");
			var username = data.username;
			if (self.containedUsername(username)) {
				self.leaveRoomOnGameOver(self.clientProxyList[username], client);
			}
		});
		
		// sets the centerposition of a room
		client.on('setRoomCenter', function(data) {
			var username = data.username;
			if(self.containedUsername(username)) {
				var cp = self.clientProxyList[username];
				var room = self.engine.getSession(cp.getRoomName());
				if(username == room.getHost()) {
					room.setPosition(data.position);
					room.initPointList(room.getPosition(), room.getRadius());
					client.emit('setRoomCenter', {});
				}
			}
		});

		//Client has changed his position
		client.on('updatePosition', function(data) {
			var room;
			var newData;
			if(data.username in self.clientProxyList) {
				var cp = self.clientProxyList[data.username];
				cp.setPosition(data.position); // sets the new position of the clientProxy
				newData = { user : {position : data.position, username : data.username, iconPath : cp.getIconPath(), pacman : cp.getIsPacman()}};
				self.io.sockets.in(cp.getRoomName()).emit('fetchPosition', newData); // notify all other clients in room 
			}
		});

		//client leaves the page
		client.on('disconnect', function() {
			console.log("SOCKET IO : Disconnect on")
			self.closeConnection(client, self);
		});

		client.on('logout', function() {
			console.log("SOCKET IO : Logout on")
			self.closeConnection(client, self);
		});
		
		client.on('chatMessage', function(data){
			console.log("SOCKET IO : Chat Message");
			console.log(data.room);
			if(data.message.toLowerCase().indexOf("babo") != -1){
				data.message = "Nix Babo! Es kann nur einen Babo geben!! UND DER BIN ICH!!";
				data.username = "OberBabo";
			}
			if(data.message != ""){
				self.io.sockets.in(data.room).emit('chatMessage', data);
			}
		});
		
		// starts a special power
		client.on('specialPower', function(data){
			var username = data.username;
			var type = data.type;
			
			if(username in self.clientProxyList){
				var cp = self.clientProxyList[username];
				cp.startSpecialPower(type);
			}
		});
	});
}

// is called from a session, when the game is over
Server.prototype.gameOver = function(sessionName) {
	console.log("Game " + sessionName + " beendet");
	this.io.sockets.in(sessionName).emit('gameOver', {}); // notify clients in room, that game is over
}

Server.prototype.markerDeleted = function(markerID) {
	console.log("Marker mit ID " +  markerID + " wurde gelöscht");
}

// checks if a username is in the clientList
Server.prototype.containedUsername = function(name) {
	return name in this.clientProxyList;
}

// clients leaves a room
Server.prototype.leaveRoom = function(clientProxy, client) {
	if(clientProxy.getRoomName() != undefined){

		console.log("SOCKET IO : Client " + clientProxy.getName() + " leaved room " + clientProxy.getRoomName());
		var roomName = clientProxy.getRoomName();
		var room = this.engine.getSession(roomName);
		var username = clientProxy.getName();
	
		// if host leaves the room
		if(room != null && room.getHost() == username) {
			console.log("HOST IS DOWN - GAME OVER");
			client.broadcast.to(roomName).emit('gameOver', {});
			room.setEndGameState(1);
		}
		
		clientProxy.addTotalScore(clientProxy.getScore());
		clientProxy.addTotalWalkingDistance(clientProxy.getWalkingDistance());
		
		this.engine.leaveSession(roomName, clientProxy);
		
		client.leave(roomName);
		clientProxy.setRoomName(undefined);
		clientProxy.reset();
		this.io.sockets.in(roomName).emit('userLeft', username); // dem rest des raums bescheid sagen, dass man weg ist (damit der marker gelöscht werden kann)
	}
}

// client leaves a room when the game is over
Server.prototype.leaveRoomOnGameOver = function(clientProxy, client) {
	if(clientProxy.getRoomName() != undefined){
		console.log("SOCKET IO : Client " + clientProxy.getName() + " leaved room " + clientProxy.getRoomName() + " on game over");
		var roomName = clientProxy.getRoomName();
		var room = this.engine.getSession(roomName);
		var username = clientProxy.getName();
		var endGameState = clientProxy.getEndGameState();
		var distance = clientProxy.getTotalWalkingDistance();
		var gameEndInfo = "";
		
		this.engine.leaveSession(roomName, clientProxy);
		client.leave(roomName);
		clientProxy.setRoomName(undefined);
		
		// ermittelt den endGameState, der am Ende eines Spiels bei dem Spieler angezeigt werden soll
		switch(endGameState){
			case 1: // hostdown
				gameEndInfo = "Sie haben gewonnen !! ";
				clientProxy.addScore(250);
				break;
			case 2: // time end
				if(clientProxy.getIsPacman()){
					gameEndInfo = "Glückwunsch, Sie haben es geschafft vor den Geistern abzuhauen :) ";
					clientProxy.addScore(1000);
				}else{
					gameEndInfo = "Der Babo ist entkommen :(";
				}
				break;
			case 3: // pacman catched
				if(clientProxy.getIsPacman()){
					gameEndInfo = "Sie wurden leider von den Geistern erwischt :(";
				}else{
					gameEndInfo = "Der Babo wurde gefasst! Glückwunsch, Sie haben gewonnen :)";
					clientProxy.addScore(250);
				}
				break;
			case 4: // pacman leaved area
				if(clientProxy.getIsPacman()){
					gameEndInfo = "Sie haben das Spielfeld verlassen!! Leider verloren";
				}else{
					gameEndInfo = "Der Babo hat das Spielfeld verlassen";
					clientProxy.addScore(300);
				}
				break;
		}
		
		var score = clientProxy.getScore();
		client.emit('gameEndInfo', {state : endGameState , gameEndInfo : gameEndInfo, highscore: score, amountDistance : distance}); // Schicke dem User die spezifischen Daten am Gameende
	
		clientProxy.addTotalScore(clientProxy.getScore());
		clientProxy.addTotalWalkingDistance(clientProxy.getWalkingDistance());
		clientProxy.reset();
	}
}

Server.prototype.canLogin = function(username) {
	// checks if username is already in use
	if(username in this.clientProxyList)
	{
		return 400;
	}
	// user is allowed to join
	return 200;
}

// schließt die connection zu einem client
Server.prototype.closeConnection = function(client, context) {
	var username;
	var score;
	var distance;
	var clientProxyList = this.clientProxyList;
	var database = this.database;
	
	client.get('username', function(err, name) {
		username = name;
		if(context.containedUsername(username)) 
		{
			var cp = clientProxyList[username];
			room   = cp.getRoomName();

			if (room != undefined) {
				context.leaveRoom(cp, client);
			}
			score = cp.getTotalScore();
			distance = cp.getTotalWalkingDistance();

			console.log("SOCKET IO: " + username + " disconnected");
			client.leave(room);
			delete clientProxyList[username];     // deletes the leaving clientProxy
			database.updateUser(username, score, distance); // updates score of the clientProxy in database
		}
	});
}

Server.prototype.sendUserData = function(data) {
	info = {
		username  : data.username,
		state     : data.state,
	};
	data.client.emit('login', info);
}

exports.Server = Server;
