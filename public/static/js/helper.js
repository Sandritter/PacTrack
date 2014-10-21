// CONTAINER
var mainGameID = "mainGame";
var mainID = "main";
var characterSelectMainID = "characterSelectMain";
var gameSelectMainID = "gameSelectMain";
var gameSettingsMainID = "gameSettingsMain";
var lobbyMainID = "lobbyMain";
var pageTitle = "PacTrack";
var currentPage;

// STATE_MESSAGES
var errUserNameTaken = "Sorry dude, dieser Benutername ist bereits vergeben!";
var errUserNameInvalid = "Unzulässiger Benutzername! Versuchs nochmal!";
var errGameNameTaken = "Sorry Dude, dieser Spielname ist bereits vergeben!";

// SOCKET INDETIFIERS
var loginSocketID = "login";
var createRoomSocketID = "createRoom";
var logoutSocketID = "logout";
var userLeftSocketID = "userLeft";
var updatePositionSocketID = "updatePosition";
var fetchPositionsSocketID = "fetchPosition";
var enterRoomSocketID = "enterRoom";
var setRoomCenterID = "setRoomCenter";
var gameOverSocketID = "gameOver";
var leaveRoomOnGameOverSocketID = "leaveRoomOnGameOver";
var gameEndInfoSocketID = "gameEndInfo";
var chatMessageSocketID = "chatMessage";
var markerCatchedSocketID = "markerCatched";
var highscoreSocketID = "highscore";
var outOfAreaSocketID = "outOfArea";
var specialPowerSocketID = "specialPower"; 
var availablePowerSocketID = "availablePower";
var powerOffSocketID = "powerOff";
var specialUpdateSocketID = "specialUpdate";
var baboPowerSocketID = "baboPower";

// AJAX REQUEST IDENTIFIERS
var host = "http://m1.mi.hs-rm.de";
var gameSelectListID = "gameList";
var userListRequestID = "userList";
var gameTimeRequestID = "gameTime";
var centerPositionRequestID = "centerPosition";
var highscoreRequestID = "high";
var pointMarkersRequestID = "pointList";
var statisticRequestID = "getStatistic";
var iconListRequestID = "iconList";


/*
 * Fügt gegebenem Element einen Clickeventlistener hinzu - Eigentlich unnötig 
 */
function addClickListener(element, listener) {
	element.addEventListener("click", listener, false);
};

/*
 * Fügt allen Elementen einer Liste Eventlistener hinzu 
 */
function addClickListenerToList(list, listener) {
	for ( i = 0; i < list.length; i++) {
		addClickListener(list[i], listener);
	}
};

/**
 * Generiert Inneres HTML mit gegebenem HTML-Element und Template 
 * @param {Object} templateID - Id des zu bearbeitenden Templates
 * @param {Object} context - Context welcher eingefügt werden soll
 */
function generateHTML(templateID, context) {

	var templateSource = document.getElementById(templateID).innerHTML;

	if (context !== undefined) { //Wenn es einen Kontext gibt
		var template = Handlebars.compile(templateSource); //Kompilieren
		var html = template(context); //Einfügen
		return html;
	} else { //Ansonsten nur das Element wiedergeben
		return templateSource;
	}
};

/**
 * Setzt das HTML in einen gegebenen  Container mithilfe eines Templates 
 * @param {Object} templateID  - ID des zu verwendenden Templates
 * @param {Object} containerID - ID des zu verwendenden Containers
 * @param {Object} context - Context für das Template
 */
function swapHTML(templateID, containerID, context) {
	var container = document.getElementById(containerID);
	container.innerHTML = generateHTML(templateID, context);
}

/**
 * Setzt einen Ajax request auf eine bestimmt url ab
 * @param {Object} url - Ziel des Ajaxrequest
 * @param {Object} query - Querystring mit zusätzlichen Informationen
 * @param {Object} callback - Funktion die bei der Antwort angesprochen werden soll
 */
function dropAjaxRequest(url, query, callback) {
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		callback(xhr);
	};
	xhr.open("get", url + query, true);
	xhr.send(null);
}

/**
 * Wechselt die Sichtbarkeit zweier Container
 * @param {Object} containerIDSHOW - ID des Containers der gezeigt werden soll 
 * @param {Object} containerIDHIDE - ID des Containers der versteckt werden soll
 */
function swapContainer(containerIDSHOW, containerIDHIDE) {
	var container01 = document.getElementById(containerIDHIDE);
	var container02 = document.getElementById(containerIDSHOW);
	container01.classList.remove("displayTable");
	container01.classList.add("hide");
	container02.classList.remove("hide");
	container02.classList.add("displayBlock");
}

/**
 * Vertauscht HTML-Inhalt von zwei gegebenen HTML-Elementen mit Ids, versteckt ein drittes HTML Element - mit Templatekontext 
 * @param {Object} templateID - ID des zu verwendenden Templates
 * @param {Object} containerIDSHOW - ID des Containers der gezeigt werden soll
 * @param {Object} containerIDHIDE - ID des Containers der versteckt werden soll
 * @param {Object} context - Kontext für das Template
 */
function swapAndHide(templateID, containerIDSHOW, containerIDHIDE, context) {
	var container01 = document.getElementById(containerIDHIDE);
	var container02 = document.getElementById(containerIDSHOW);
	container01.classList.remove("displayTable");
	container01.classList.add("hide");
	container02.classList.remove("hide");
	container02.classList.add("displayBlock");
	swapHTML(templateID, containerIDSHOW, context);

}

/**
 * Zeichnet einen Googlemaps kreis mit gegeben Parametern
 * @param {Object} map - Karte auf die gezeichnet werden soll
 * @param {Object} clickable - Soll der Kreis anklickbar sein
 * @param {Object} radius - Radius des Kreises
 * @param {Object} fillColor - Füllfarbe des Kreises
 * @param {Object} fillOpacity - Füllsichtbarkeit des Kreises
 * @param {Object} strokeOpacity - Sichtbarkeit des Randes
 * @param {Object} strokeColor - Randfarbe
 * @param {Object} strokeWeight - Randgewicht
 * @param {Object} center - Zentrum des Kreises
 */
function drawCircle(map, clickable, radius, fillColor, fillOpacity, strokeOpacity, strokeColor, strokeWeight, center) {
	if (center != undefined) {//Falls Zentrum mitgegeben wird
		var opt = {
			map : map,
			clickable : clickable,
			radius : radius,
			fillColor : fillColor,
			fillOpacity : fillOpacity,
			strokeOpacity : strokeOpacity,
			strokeColor : strokeColor,
			strokeWeight : strokeWeight,
			center : center,
		};
	} else { //Ansonsten Kreis ohne Zentrum erstellen
		var opt = {
			map : map,
			clickable : clickable,
			radius : radius,
			fillColor : fillColor,
			fillOpacity : fillOpacity,
			strokeOpacity : strokeOpacity,
			strokeColor : strokeColor,
			strokeWeight : strokeWeight,
		};
	}

	var circle = new google.maps.Circle(opt);
	return circle;
}
