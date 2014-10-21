/**
 * Modul
 * Repräsentiert ein Session - Objekt
 */
function SessionProxy(settings, host, gameOverCallback, markerCollisionCallback) {
	this.host = host;
	this.catchRadius = 100;	// in meters

	this.clientList       = new Array();
	this.pointList        = new Array();
	
	this.Point     = require('./point.js').Point;
	
	this.initialized      = false;

	this.clientCounter    = 0;
	this.roomName         = settings.getGameName();
	this.timeLeft         = settings.getTime();
	this.timeLength       = settings.getTime();
	this.radius           = settings.getRadius();
	this.maxPlayers       = settings.getMaxPlayers();
	this.longitude        = 0;
	this.latitude         = 0;
	
	this.gameOverCallback        = gameOverCallback;
	this.markerCollisionCallback = markerCollisionCallback;
	
	this.intervalID       = null;
	this.startTime        = 0;
	var self = this;
}

/**
 * Startet die Session mit ihrem Timer
 */
SessionProxy.prototype.startGame = function() {
	this.startTime = new Date().getTime(); 
	
	var self = this;
	this.intervalID = setInterval(function() {
		self.timeLeft -= 1;
		if(self.timeLeft % 10 == 0){
			console.log("SESSION : Time left in session " + self.roomName + " : " +  self.timeLeft + " sekunden");
		}
		if (self.timeLeft == 0) {
			console.log("SESSION : Time end in session " +  self.roomName);
			self.gameOver(2); // state 2 = time end
		}
	}, 1000);
}

/**
 * Stoppt den Timer
 */
SessionProxy.prototype.stopTimer = function(){
	clearInterval(this.intervalID);
}

/**
 * Wird aufgerufen, wenn der Timer einer Session abgelaufen ist
 */
SessionProxy.prototype.gameOver = function(state) {
	this.setEndGameState(state); // jeden Client den Status zuweisen, warum das Spiel zu Ende ist
	clearInterval(this.intervalID);
	this.gameOverCallback(this.roomName, state);
}

SessionProxy.prototype.markerCollision = function(ID){
	this.markerCollisionCallback(ID);
}

SessionProxy.prototype.getClientList = function() {
	return this.clientList;
}

SessionProxy.prototype.getPointList = function() {
	return this.pointList;
}

/**
 * Fügt einen Client einer Session hinzu
 */
SessionProxy.prototype.addClient = function(clientProxy) {
	if (this.clientCounter < this.maxPlayers) { // überprüft, ob die Session schon voll ist
		console.log("SESSION : ADD CLIENT " + clientProxy.getName() + " TO SESSION " + this.roomName);
		this.clientList[clientProxy.getName()] = clientProxy;
		// this muss mitgegeben werden, da sonst bei aufruf der context des clientproxys aktuell wäre.
		clientProxy.setUpdateCallback(this.onClientProxyUpdate, this);
		// registriert die updateCallback
		this.clientCounter++;
		return true;
	}
	return false;
}

/**
 * Löscht einen Client von einer Sessiion
 */
SessionProxy.prototype.deleteClient = function(clientProxy) {
	if (clientProxy.getName() in this.clientList) { // überprüft, ob der Client überhaupt sich in der Session befindet
		delete this.clientList[clientProxy.getName()];
		this.clientCounter--;
		return true;
	}
	return false;
}

/**
 * Callback wenn der Client seine Position updatet
 */
SessionProxy.prototype.onClientProxyUpdate = function(clientProxy, context) {

	var distance = undefined;
	var catchingGhost;
	var deleteList = new Array();
	
	if (clientProxy.getIsPacman()) {
		console.log("SESSION : IS PACMAN");
		
		/*
		//muss noch ne lösung gefunden werden. Es kann passieren dass die erste positionsbestimmung so ungenau ist, dass sofort das spiel beendet wird
		if(clientProxy.calcDistanceInMeter(context.getPosition()) > context.radius * 1000){ //Pacman ist außerhalb des Spielfelds
			context.gameOver(4); // state 4 = pacman hat das spielfeld verlassen
			return;
		}
		*/
		
		// check collisions with ghosts
		for(c in context.clientList){
			if(c != context.host){ // alle durchgehen, außer dem Host selbst
				var ghostPos = context.clientList[c].getPosition();
				var tempDistance = clientProxy.calcDistanceInMeter(ghostPos);
				if(tempDistance < distance){ // der geist der am nähesten ist, ist der catchingGhost
					distance = tempDistance;
					catchingGhost = context.clientList[c];
				}
			}
		}
		// check collisions with point makers
		for(p in context.pointList){
			var pointPos = context.pointList[p].getPosition();
			var distance = clientProxy.calcDistanceInMeter(pointPos);
			if(distance < 40){
				console.log("SESSION : Pacman catched a point " + p + "  +50!");
				deleteList.push(p); // add to delete list
			}
		}
		
		for(p in deleteList){
			context.markerCollisionCallback(deleteList[p]);  // notify client
			delete context.pointList[deleteList[p]];		 // delete from pointlist
			clientProxy.addScore(50);
			clientProxy.addSpecialPoint();
		}	
	} else { // hier muss nur die Kollision mit dem Pacman geprüft werden.
		console.log("SESSION : CALC DISTANCE")
		if (context != undefined && context.host in context.clientList) {
			var pacmanPos = context.clientList[context.host].getPosition();
			var centerDistance = clientProxy.calcDistanceInMeter(this.getPosition());
			
			if(centerDistance > this.radius * 1000){
				clientProxy.setOutOfArea(true);
			}else{
				clientProxy.setOutOfArea(false);
			}
			
			distance = clientProxy.calcDistanceInMeter(pacmanPos);
			catchingGhost = clientProxy;
			console.log("SESSION : DISTANCE " + distance);
		}	
	}
	
	// gameOver if distance to Pacman is lower then 30
	if (distance != undefined && catchingGhost != null && distance < 35) {
		var pac = context.clientList[context.host];
		var state = pac.getBaboInUse();
		console.log("BABOOOOOO :" + state);
		if(state) {
			var cl = clientProxy.getClient();
			console.log("SESSION: Babo Power");
			cl.emit('baboPower', {gameEndInfo : "Pacman hat dich aufgrund von Babo Power geschnappt!", highscore: 0, amountDistance : 0});
		}else {
			console.log("SESSION : PACMAN CATCHED");
			catchingGhost.addScore(500);
			context.gameOver(3); // state 3 = pacman catched 
			clearInterval(context.intervalID);
		}
	}
}

/**
 * Punkte, welche vom Pacman eingesamelt werden können, werden erstellt
 * @param {Object} pos
 * @param {Object} radius
 */
SessionProxy.prototype.initPointList = function(pos, radius){
	if(!this.initialized){
		
		console.log("SESSION INIT POINT LIST");
		
		// Formel at http://gis.stackexchange.com/questions/25877/how-to-generate-random-locations-nearby-my-location
		
		var latitude  = pos.latitude;
		var longitude = pos.longitude;
		var radiusInMeter    = radius * 1000; // in meters
		var radiusInDeg = radiusInMeter / 111000;
		
		for(i = 0; i < radius * 2000; i++){
			var random1 = Math.random();
			var random2 = Math.random();
			
			var w = radiusInDeg * Math.sqrt(random1);
			var t = 2 * Math.PI * random2;
			
			var x = w * Math.cos(t);
			var y = w * Math.sin(t);
			
			var new_x = x / Math.cos(latitude);
			
			var new_long = (new_x * 1.4)+ longitude;
			var new_lat = y + latitude;
			
			this.pointList[i] = new this.Point(i, {
				longitude : new_long,
				latitude  : new_lat
			})
		}
		
		this.initialized = true;
	}
	
}

SessionProxy.prototype.getStartTime = function() {
	return this.startTime;
}

SessionProxy.prototype.getRoomName = function() {
	return this.roomName;
}

SessionProxy.prototype.getHost = function() {
	return this.host;
}

SessionProxy.prototype.getTimeLeft = function() {
	return this.timeLeft;
}

SessionProxy.prototype.getSettings = function() {
	return this.gameSetting;
}

SessionProxy.prototype.isEmpty = function() {
	return this.clientCounter == 0;
}

SessionProxy.prototype.getRadius = function() {
	return this.radius;
}

/**
 * Überprüft, ob die maximale Anzahl an Spielern in der Session erreicht ist
 */
SessionProxy.prototype.isSessionFull = function() {
	if (this.clientCounter == this.maxPlayers) {
		return true;
	}
	return false;
}

SessionProxy.prototype.getMaxPlayers = function() {
	return this.maxPlayers;
}

/**
 * Liefert die zentrale Position des Spielfeldes 
 */
SessionProxy.prototype.getPosition = function() {
	return {
		longitude : this.longitude,
		latitude : this.latitude,
		radius : this.radius * 1000
	};
}

SessionProxy.prototype.setPosition = function(pos) {
	this.longitude = pos.longitude;
	this.latitude = pos.latitude;
}

SessionProxy.prototype.getTimeLength = function() {
	return this.timeLength;
}

SessionProxy.prototype.setEndGameState = function(state){
	for(c in this.clientList){
		this.clientList[c].setEndGameState(state);	
	}
}

exports.SessionProxy = SessionProxy;
