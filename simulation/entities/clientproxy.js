/**
 * Modul
 * Repräsentiert einen Client
 * @param {Object} client - socket.io Client Objekt
 * @param {Object} name - Name des Client
 * @param {Object} totalScore - Sein gesamter Highscore aus der Datenbank
 * @param {Object} totalWalkingDistance - Seine gesamte zurückgelegte Distanz aus der Datenbank
 */
function ClientProxy(client, name, totalScore, totalWalkingDistance){
	this.name            = name;
	this.client          = client;
	this.roomName        = undefined;
	this.score           = 0;
	this.totalScore      = totalScore;
	this.iconPath   = "";
	this.isPacman   = false;
	
	this.longitude  = undefined;
	this.latitude   = undefined;
	this.totalWalkingDistance = totalWalkingDistance;
	this.walkingDistance = 0;
	
	this.lastWalkingUpdate = new Date().getTime();
	
	this.updateCallback         = undefined;
	this.sessionCallbackContext = undefined;
	
	this.endGameState = undefined;
	
	this.outOfArea    = 1;
	this.specialPowerUsed = new Array();
	this.specialPowerCosts = new Array();
	
	this.initSpecialPowers();
	this.specialPoints = 0;
	
	this.intervalID = null;
	this.specialTimeLeft = 40;
	
	this.baboInUse = false;
}

/**
 * Die Specialpower, welche ein Pacman besitzt wird initialisiert
 */
ClientProxy.prototype.initSpecialPowers = function(){
	// man kann eine Spezialkraft pro Session nur einmal benutzen
	for(i = 1; i < 4; i++){
		this.specialPowerUsed[i] = false;
	}
	
	// Die Kosten der Spezialkräfte wird hier festgesetzt
	this.specialPowerCosts[1] = 3;
	this.specialPowerCosts[2] = 5;
	this.specialPowerCosts[3] = 10;
}

/**
 * Spezialkraft Punkte werden erhöht, welche für die Nutzung der Spezialfähigkeiten wird genutzt
 */
ClientProxy.prototype.addSpecialPoint = function(){
	
	// Man kann maximal 10 Spezialkraft Punkte auf einmal besitzten
	if((this.specialPoints) < 10) {
		this.specialPoints++;
	}
	
	// informiert den Client welche Spezialkräfte verfügbar sind
	var info = {
		type1 : (this.specialPowerCosts[1] <= this.specialPoints && !this.specialPowerUsed[1]),
		type2 : (this.specialPowerCosts[2] <= this.specialPoints && !this.specialPowerUsed[2]),
		type3 : (this.specialPowerCosts[3] <= this.specialPoints && !this.specialPowerUsed[3]),
		username : this.name 
	};
	
	this.client.emit('specialUpdate', (this.specialPoints * 10));
	console.log("CLIENT SPEZIAL : Send Points - " + this.specialPoints);
	this.client.emit('availablePower', info);
	console.dir(info);
}

/**
 * Spezialkraft Punkte werden reduziert
 * @param {Object} value
 */
ClientProxy.prototype.subSpecialPoints = function(value){
	this.specialPoints -= value;
	this.client.emit('specialUpdate', (this.specialPoints * 10));
}

/**
 * Liefert die gesammelten Spezialkraft Punkte zurück
 */
ClientProxy.prototype.getSpecialPoints = function(){
	return this.specialPoints;
}

/**
 * Startet die mitgegebene Spezialkraft
 * @param {Object} type - Spezialkraft
 */
ClientProxy.prototype.startSpecialPower = function(type){
	var self = this;
	// Überprüft, ob für die Spezialkraft genug Punkte gesamelt wurden und ob die Spezialkraft schon genutzt wurde
	if((this.specialPoints - this.specialPowerCosts[type] >= 0) && !this.specialPowerUsed[type]){
		console.log("START SPECIAL " + type);
		this.subSpecialPoints(this.specialPowerCosts[type]);
		this.specialPowerUsed[type] = true;
		if(type == 3) {
			this.baboInUse = true;
		}
		
		var info = {
			type : type,
			username : this.name
		}
		this.client.broadcast.to(this.roomName).emit('specialPower', info);
		this.client.emit('specialPower', info);
		
		//startet den Timer
		this.intervalID = setInterval(function() {
			self.specialTimeLeft -= 1;
			if (self.specialTimeLeft == 0) {
				self.endSpecialTime(type);
			}
		}, 1000); 
	}
}

/**
 * Spezialkraft wird beendet
 * @param {Object} type - Spezialkraft
 */
ClientProxy.prototype.endSpecialTime = function(type){
	console.log("SPECIAL TIME ENDED " + type);
	
	clearInterval(this.intervalID);
	this.specialTimeLeft = 40;
	this.baboInUse = false;
	
	var specialOffInfo = {
		username : this.name,
		type : type
	}
	
	this.client.broadcast.to(this.roomName).emit('powerOff', specialOffInfo);
	this.client.emit('powerOff', specialOffInfo);
	
	
	var info = {
		type1 : (this.specialPowerCosts[1] <= this.specialPoints && !this.specialPowerUsed[1]),
		type2 : (this.specialPowerCosts[2] <= this.specialPoints && !this.specialPowerUsed[2]),
		type3 : (this.specialPowerCosts[3] <= this.specialPoints && !this.specialPowerUsed[3]),
		username : this.name 
	};
	console.dir(info);
	this.client.emit('availablePower', info);
	
}

ClientProxy.prototype.getBaboInUse = function() {
	return this.baboInUse;
}

ClientProxy.prototype.getName = function(){
	return this.name;
}

ClientProxy.prototype.getClient = function(){
	return this.client;
}

ClientProxy.prototype.getScore = function(){
	return this.score;
}

ClientProxy.prototype.setScore = function(value){
	this.score = value;
}

ClientProxy.prototype.addScore = function(value){
	this.score += value;
	console.log("SENDE SCORE - " + this.score);
	this.client.emit('highscore', { highscore : this.score });
}

ClientProxy.prototype.getTotalScore = function(){
	return this.totalScore;
}

ClientProxy.prototype.setTotalScore = function(value){
	this.totalScore =  value;
}

ClientProxy.prototype.addTotalScore = function(value){
	this.totalScore += value;
}

ClientProxy.prototype.getRoomName = function(){
	return this.roomName;
}

ClientProxy.prototype.setRoomName = function(value){
	this.roomName = value;
}


ClientProxy.prototype.getPosition = function(){
	return {longitude : this.longitude, latitude : this.latitude };		
}

/**
 * Wird aufgerufen, wenn ein Positionsupdate stattfindet
 * @param {Object} pos - neue Position
 */
ClientProxy.prototype.setPosition = function(pos){
	var actTime = new Date().getTime();
	console.log("CLIENTPROXY : " + this.name + " SET POSITION")
	
	if(this.latitude == undefined && this.longitude == undefined) { // on first update
		this.longitude = pos.longitude;
		this.latitude  = pos.latitude;
	}else {
		var diffTime = (actTime - this.lastWalkingUpdate)/1000; // in seconds
		var distance = Math.round(this.calcDistanceInMeter(pos));
		console.log("CLIENTPROXY : " + this.name + " - Walkingdistance: " + distance);

		if((distance < (diffTime * 10)) && distance != 0) { // Boltsche's Theorem
			console.log("CLIENTPROXY : Laufdistanz ok!");
			this.addWalkingDistance(distance);
			this.longitude = pos.longitude;
			this.latitude  = pos.latitude;
			if(!this.isPacman){
				this.setScore(Math.round(this.walkingDistance / 10) * 5 * this.outOfArea); // Geister bekommen 5 points pro 10 meter
			}
		}
	}
	// calls the updateCall to notify the session
	if(this.updateCallback != undefined){
		this.updateCallback(this, this.sessionCallbackContext); // notify the session
	}	
	this.lastWalkingUpdate = actTime;
}

ClientProxy.prototype.addTotalWalkingDistance = function(value){
	this.totalWalkingDistance += value;
}

ClientProxy.prototype.getTotalWalkingDistance = function() {
	return this.totalWalkingDistance;
}

ClientProxy.prototype.setWalkingDistance = function(value){
	this.walkingDistance = value;
}

ClientProxy.prototype.addWalkingDistance = function(value){
	this.walkingDistance += value;
}

ClientProxy.prototype.getWalkingDistance = function(){
	return this.walkingDistance;
}

ClientProxy.prototype.setIconPath = function(path) {
	this.iconPath = path;
}

ClientProxy.prototype.getIconPath = function() {
	return this.iconPath;
}

ClientProxy.prototype.getIsPacman = function(){
	return this.isPacman;
}

ClientProxy.prototype.setPacman = function(){
	this.isPacman = true;
	this.iconPath = "static/img/icons/pacman.png";
}

/**
 * Relevante Informationen werden resetet
 */
ClientProxy.prototype.reset = function(){
	this.isPacman = false;
	this.endGameState = undefined;
	this.iconPath = "";
	this.score = 0;
	this.walkingDistance = 0;
	this.initSpecialPowers();
}

ClientProxy.prototype.setUpdateCallback = function(callback, context){
	this.updateCallback = callback;
	this.sessionCallbackContext = context;
	this.updateCallback(this, this.sessionCallbackContext);
}

ClientProxy.prototype.setEndGameState = function(state){
	this.endGameState = state;
}

ClientProxy.prototype.getEndGameState = function(){
	return this.endGameState;
}

/*
 * legt fest ob der client sich außerhalb des spielfelds befindet
 */
ClientProxy.prototype.setOutOfArea = function(x){
	if(x){
		this.outOfArea = -5;
		this.client.emit('outOfArea', { state : 1, position : this.getPosition() });
	}else{
		this.outOfArea = 1;
		this.client.emit('outOfArea', { state : 0, position : this.getPosition() });
	}
}

/*
 * berechnet immer die distanz einer position zu sich selbst
 */
ClientProxy.prototype.calcDistanceInMeter = function(pos){
	var lat = (pos.longitude + this.longitude)/2 * 0.01745;
	var dx = 111.3 * Math.cos(lat) * (pos.longitude - this.longitude);
	var dy = 111.3 * (pos.latitude - this.latitude);
	var distanceInKm = Math.sqrt((dx*dx) + (dy*dy));
	return distanceInKm * 1000;
}
exports.ClientProxy = ClientProxy;