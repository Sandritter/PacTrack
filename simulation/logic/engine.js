/**
 * Modul
 * Hier werden die einzelnen Sessions (Maps) verwaltet.
 */
function PacEngine ()
{
	this.sessionList = new Array();
}

/**
 * Fügt eine neue Session hinzu
 * @param {Object} session - Name, der zu erstellenden Session
 */
PacEngine.prototype.addSession = function(session){
	// Überprüfung, ob Name schon vergeben ist
	if(session.getRoomName() in this.sessionList){
		return 400; // Fehlercode
	}
	this.sessionList[session.getRoomName()] = session;
	
	return 200;
}

/**
 * Gibt alle laufenden Sessions zurück
 */
PacEngine.prototype.getSessions = function(){
	return this.sessionList;
}

/**
 * Client tritt einer bestimmten Session bei
 * @param {Object} sessionName - Name der Session
 * @param {Object} clientProxy - Client Objekt
 */
PacEngine.prototype.joinSession = function(sessionName, clientProxy) {
	// Prüft, ob Session überhaupt existiert
	if(sessionName in this.sessionList)
	{
		this.sessionList[sessionName].addClient(clientProxy);
		clientProxy.setRoomName(sessionName);
		return 200;
	}
	return 400;
}

/**
 * Liefert eine bestimmte Session zurück
 * @param {Object} sessionName - Name der Session
 */
PacEngine.prototype.getSession = function(sessionName) {
	// Prüft, ob Session überhaupt existiert
	if(sessionName in this.sessionList)
	{
		console.log("ENGINE : getSession " + sessionName);
		return this.sessionList[sessionName];
	}
	return null;
}

/**
 * Entfernt einen Client von einer Session
 * @param {Object} sessionName - Name der Session
 * @param {Object} clientProxy - Client Objekt
 */
PacEngine.prototype.leaveSession = function(sessionName, clientProxy) {
	// Prüft, ob Session überhaupt existiert
	if(sessionName in this.sessionList)
	{
		this.sessionList[sessionName].deleteClient(clientProxy);
		clientProxy.setRoomName(undefined); 
		
		// Löscht die Session, falls kein Client mehr entahlten ist
		if(this.sessionList[sessionName].isEmpty()) { 
			console.log("ENGINE : lösche session " + sessionName);
			this.sessionList[sessionName].stopTimer(); 
			delete this.sessionList[sessionName];
		}
	}
}

exports.PacEngine = PacEngine;
