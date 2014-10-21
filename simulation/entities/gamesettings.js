/**
 * Modul
 * Einstellungen einer Session
 * @param {Object} radius - Spielradius
 * @param {Object} time - Zeitdauer einer Session
 * @param {Object} maxPlayers - maximale Anzahl der Spieler
 * @param {Object} name - Name der Session
 */
function GameSettings (radius, time, maxPlayers, name){
	this.radius = radius;
	this.gameTime = time; // in min
	this.maxPlayers = maxPlayers;
	this.gameName = name;
}

GameSettings.prototype.getRadius = function(){
	return this.radius / 1000;
}

GameSettings.prototype.getTime = function(){
	return (this.gameTime * 60); // in seconds
}

GameSettings.prototype.getMaxPlayers = function(){
	return this.maxPlayers;
}

GameSettings.prototype.getGameName = function(){
	return this.gameName;
}

exports.GameSettings = GameSettings;

