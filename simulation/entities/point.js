/**
 * Modul
 * Repräsentiert einen Punkt den der Pacman einsammeln kann
 * @param {Object} ID 
 * @param {Object} pos - Position auf der Map
 */
function Point(ID, pos){
	this.ID            = ID;
	
	this.longitude  = pos.longitude;
	this.latitude   = pos.latitude;
}

Point.prototype.getID = function(){
	return this.name;
}

Point.prototype.getPosition = function(){
	return {longitude : this.longitude, latitude : this.latitude };		
}

exports.Point = Point;