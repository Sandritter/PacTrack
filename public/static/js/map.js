// TEMPLATE
var gameEndTmpID = "gameEndTMP";
var usernameListTmpID = "usernameListTMP";
var powerContentTmpID = "powerContentTMP";

// CONTAINER
var optionMapWindowContainerID = "optionMapWindowContainer";
var chatWindowMainID = "optionChatWindowMain";
var timerDisplayID = "timerDisplay";
var optionPowerMainID = "optionPowerWindowMain";
var optionPowerContainerID = "optionPowerContainer";

// WRAPPER
var confirmMapID = "confirmMap";

// CONTENT
var powerContentID = "powerContent";

//BUTTONS
var yesMapButtonID = "yesMapButton";
var noMapButtonID = "noMapButton";
var openGameMenuButtonID = "openMenuButton";
var energyButtonID = "energyButton";
var statisticGameButtonID = "statisticGameButton";
var usersButtonID = "usersButton";
var chatButtonID = "chatButton";
var logoutGameButtonID = "logoutGameButton";
var gameEndButtonID = "gameEndButton";
var invisibleButtonID = "invisibleButton";
var defenseButtonID = "defenseButton";
var baboButtonID = "baboButton";
var closePowerButtonID = "closePowerButton";

// MAP
var map;
var mapID = "map-canvas";
var markerArray;
var pointArray;
var gameCircle;
var targetTime;
var highScoreDisplayID = "highscoreDisplay";
var infoWindow;
var pacmanCircle;
var invisibleButton;
var defenseButton;
var baboButton;
var progressBar;

//MAIN
var optionPowerMain;
var optionPowerContainer;

//MENU
var gameMenuID = "gameMenu";
var openGameMenuButton;

//CHAT
var chatSubmitButtonID = "chatSubmitButton";
var chatInputID = "chatInput";
var chatListID = "chatList";
var chatWindow;
var chatWindowContainer;

//IntervallIDs
var updateIntervalID;
var countdownIntervalID;

//Paths
var pointPath = "static/img/icons/markerButton.png";

/*
 * Funktion wird aufgerufen, sobald das DOM geladen ist
 */
function initializeMap() {

	markerArray = [];
	pointArray = undefined;

	currentPage = mainGameID;
	// falls man mit dem Browser von der Map aus zurück navigieren möchte wird ein option window mit diesen Elementen geöffnet
	var optionMapWindowContext = {
		confirmID : confirmMapID,
		yesButton : yesMapButtonID,
		noButton : noMapButtonID,
		text : "Möchtest du wirklich steil gehen?"
	};

	// HIER WIRD DIE MAP INITIALISIERT
	/*
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function(position) {
			var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

			var mapOptions = {
				center : pos,
				zoom : 18
			};
			map = new google.maps.Map(document.getElementById(mapID), mapOptions);

			dropAjaxRequest(centerPositionRequestID, "?room=" + gameName, centerPositionCallback);

			if (startGameFlag == true) {
				dropAjaxRequest(pointMarkersRequestID, "?room=" + gameName, pointMarkerCallback);
			}
			// TIMER DER ALLE 4 Sekunden die Position des Users an den Server schickt
			updateIntervalID = setInterval(update, 3000);
		}, function() {
			displayErrorMessage(pos, "Browser does not support Geotracking");
		});
	} else {
		// Browser unterstüzt keine Geolocation
		displayErrorMessage(pos, "Browser does not support Geotracking");
	}
	*/

	// AJAX REQUEST für die gameTime
	//dropAjaxRequest(gameTimeRequestID, "?room=" + gameName, gameTimeCallback);

	swapHTML(optionWindowTmpID, optionMapWindowContainerID, optionMapWindowContext);

	//hier wird die Progressbar initialisiert
	initProgressbar();

	optionPowerContainer = document.getElementById(optionPowerContainerID);
	
	var optionPowerContext = {
		invisibleButton : "invisibleButton",
		defenseButton : "defenseButton",
		baboButton : "baboButton"
	};

	optionPowerContainer.innerHTML = generateHTML(powerContentTmpID, optionPowerContext);

	chatWindow = document.getElementById(chatWindowMainID);
	optionPowerMain = document.getElementById(optionPowerMainID);
	var yesLeaveGameButton = document.getElementById(yesMapButtonID);
	var noRemainGameButton = document.getElementById(noMapButtonID);
	openGameMenuButton = document.getElementById(openGameMenuButtonID);
	var energyButton = document.getElementById(energyButtonID);
	var statisticGameButton = document.getElementById(statisticGameButtonID);
	var usersButton = document.getElementById(usersButtonID);
	var chatButton = document.getElementById(chatButtonID);
	var logoutGameButton = document.getElementById(logoutGameButtonID);
	invisibleButton = document.getElementById(invisibleButtonID);
	defenseButton = document.getElementById(defenseButtonID);
	baboButton = document.getElementById(baboButtonID);
	var closePowerButton = document.getElementById(closePowerButtonID);

	addClickListener(closePowerButton, closePowerButtonListener);
	addClickListener(yesLeaveGameButton, closeGameListener);
	addClickListener(noRemainGameButton, remainGameListener);
	addClickListener(openGameMenuButton, openGameMenuListener);
	addClickListener(logoutGameButton, logoutGameButtonListener);
	addClickListener(statisticGameButton, statisticListener);
	addClickListener(usersButton, usersButtonListener);
	addClickListener(chatButton, chatButtonListener);


	//Wenn der Spieler das Spiel joint
	if (startGameFlag == false) {
		// wird ein AJAX REQUEST für die Liste von Usern in beigetretenen Spiel gesendet
		//dropAjaxRequest(userListRequestID, "?room=" + gameName, userListCallback);
		energyButton.classList.add("inactive");
	} else {
		addClickListener(energyButton, energyButtonListener);
	}

	/*
	 * Empfängt Positionsdaten aller Spieler die sich momentan auf der Karte befinden vom Server
	 * EINZELND
	 *
	socket.on(fetchPositionsSocketID, function(data) {
		var user = data.user;
		var pos = new google.maps.LatLng(user.position.latitude, user.position.longitude);

		var placeMarkerFlag = false;
		//Flag zur Unterscheidung ob neuer Spieler oder bereits vorhandener
		for ( i = 0; i < markerArray.length; i++) {
			if (markerArray[i].title == user.username) {//Wenn der Benutzername bereits vorhanden ist
				refreshMarker(markerArray[i], pos);
				//Position einfach updaten
				placeMarkerFlag = true;
			}
		}
		if (!placeMarkerFlag) {//Falls Benutzername noch nicht vorhanden
			addMarker(pos, user.iconPath, user.username, user.pacman); //Neuen Marker auf die Karte setzen
		}
	});
	*/

	/*
	 * Wird angesprochen vom Server falls Spieler entfernt werden kann
	
	socket.on(userLeftSocketID, function(username) {
		kickMarker(username);
	});
	*/
	/*
	 * wenn das Spiel aus irgend einem Grund zuende sein sollte wird diese socket.on Methode aufgerufen
	 
	socket.on(gameOverSocketID, function() {
		clearInterval(countdownIntervalID);
		clearInterval(updateIntervalID);
		clearMarkers();
		socket.emit(leaveRoomOnGameOverSocketID, {
			username : username
		});
	});
	
	
	socket.on(baboPowerSocketID, function(data){
		clearInterval(countdownIntervalID);
		clearInterval(updateIntervalID);
		openGameEndInfoWindow("Du wurdest pulverisiert!", data.gameEndInfo, data.highscore, data.amountDistance);
		socket.emit(userLeftSocketID, {
			username : username
		});
	});
	*/
	/*
	 *  wenn socket.emit(leaveRoomOnGameOver) von uns emitted wurde, wird diese socket.on methode aufgerufen
	 *  und enthält Daten wie den Highscore, die gelaufenen Meter und GameEndInfo ob man gewonnen hat oder nicht
	 *  1 - HOST DOWN
	 *  2 - TIME END
	 *  3 - PACMAN CATCHED
	 
	socket.on(gameEndInfoSocketID, function(data) {
		if (data.state == 1) {
			openGameEndInfoWindow("Der Host hat das Spiel beendet :(", data.gameEndInfo, data.highscore, data.amountDistance);
		} else if (data.state == 2) {
			openGameEndInfoWindow("Das Spiel ist vorbei!", data.gameEndInfo, data.highscore, data.amountDistance);
		} else if (data.state == 3) {
			openGameEndInfoWindow("Pacman wurde gefasst!", data.gameEndInfo, data.highscore, data.amountDistance);
		}
	});
	*/
	/*
	 * socket-methode wird aufgerufen, sobald sich der Highscore eines Spielers während eines Spiels geändert hat
	socket.on(highscoreSocketID, function(data) {
		var highscoreDisplay = document.getElementById(highScoreDisplayID).firstElementChild;
		highscoreDisplay.innerHTML = data.highscore;
	});
	*/
	
	/*
	 * Wird angesprochen wenn vom Server Chatnachrichten weitergeleitet werden
	 
	socket.on(chatMessageSocketID, function(data) {
		var chatList = document.getElementById(chatListID);

		//Text und Benutzername herauslesen
		var text = document.createTextNode(data.message);
		var usernameElement = document.createTextNode(data.username);
		//Dokumentelemente erstellen
		var li = document.createElement("li");
		if (data.username == username) {
			li.classList.add("user-chat-text");
		}
		var div = document.createElement("div");
		div.className = "usernameChat";
		var p = document.createElement("p");
		//Benutzernnamen einfügen
		p.appendChild(usernameElement);
		div.appendChild(p);
		li.appendChild(div);
		//Chattext einfügen
		div = document.createElement("div");
		p = document.createElement("p");
		div.className = "chatText";
		p.appendChild(text);
		div.appendChild(p);
		li.appendChild(div);

		//Chatnachricht ins Fenster einfügen
		chatList.appendChild(li);

		var scrollDiv = document.getElementById("scroll-div");
		scrollDiv.scrollTop = scrollDiv.scrollHeight;
	});
	*/

	/*
	 * Wird angesprochen wenn Pacman einen Punkt einsammelt um den Marker von der Karte zu entfernen
	socket.on(markerCatchedSocketID, function(ID) {
		if (pointArray[ID] != undefined) {
			pointArray[ID].setMap(null);
		}
		delete pointArray[ID];
	});
	*/

	/*
	 * socket-Methode springt an wenn sich ein Spieler außerhalb des Spielbereichs befindet
	 
	socket.on(outOfAreaSocketID, function(data) {
		var position = data.position;
		var state = parseInt(data.state);
		if (state == 0 && infoWindow != undefined) {
			console.log("Ich setzte den Errorflag");
			var pos = new google.maps.LatLng(position.latitude, position.longitude);
			displayErrorMessage(pos, "Außerhalb des Spielfeldes!");
		} else if (state == 1 && infoWindow != undefined) {
			infoWindow.setMap(null);
			infoWindow = undefined;
		}
	});
	*/
	
	/**
	 * socket-Methode die anspringt wenn der Server bescheid sagt, dass Spezialkräfte verfügbar sind
	socket.on(availablePowerSocketID, function(data) {
		console.log("Neue available");
		if (data.type1) {
			invisibleButton.classList.remove("inactive");
			addClickListener(invisibleButton, invisibleListener);
		}
		if (data.type2) {
			defenseButton.classList.remove("inactive");
			addClickListener(defenseButton, defenseListener);
		}
		if (data.type3) {
			baboButton.classList.remove("inactive");
			addClickListener(baboButton, baboListener);
		}
	});
	*/

	/**
	 * socket-Methode springt an wenn Broadcast vom Server über Aktivierung einer Spezialpower empfangen wurde
	 * 1 - INVISIBLE
	 * 2 - DEFENSE
	 * 3 - BABO
	socket.on(specialPowerSocketID, function(data) {
		
		var pacman;
		for ( i = 0; i < markerArray.length; i++) {
			if (markerArray[i].title == data.username) {
				pacman = markerArray[i];
				break;
			}
		}
		
		if (data.type == 1) {
			if(username != data.username){ //Wenn man nicht der Pacman ist
				pacman.setVisible(false); //Soll der Pacman unsichtbar gesetzt werden
				pacmanCircle.setVisible(false);				
			}
		} else if (data.type == 2) { //Pacman wird als Geist dargestellt
			pacman.setIcon("static/img/icons/c1.png"); 
			pacmanCircle.setVisible(false);

		} else if (data.type == 3) {// Pacman ist der Babo
			pacman.setIcon("static/img/icons/babo.png"); 				
		}
	});
	*/

	/**
	 * socket-Methode, die angesprochen wird wenn die Progressbar aktualisiert werden soll
	 * 
	socket.on(specialUpdateSocketID, function(data) {
		updateProgress(data);
	});
	*/

	/**
	 * Wird beim Auslaufen einer Spezialkraft aufgerufen
	 *
	socket.on(powerOffSocketID, function(data) {
		
		var pacman;
		for ( i = 0; i < markerArray.length; i++) {
			if (markerArray[i].title == data.username) {
				pacman = markerArray[i];
				break;
			}
		}
		
		if (data.type == 1) { //Pacman wird wieder sichtbar
			pacman.setVisible(true);
			pacmanCircle.setVisible(true);
		
		//Ansonsten müssen die Icons wieder getauscht werden
		} else if (data.type == 2) {
			pacman.setIcon("static/img/icons/pacman.png");
			pacman.setVisible(true);
		} else if (data.type == 3) {
			pacman.setIcon("static/img/icons/pacman.png");
		}
	});
	*/
};

/*
 * Schließt das Spezialpowermenu
 */
function closePowerButtonListener(ev) {
	optionPowerMain.classList.add("hide");
}

/*
 * Stößt die Unsichtbarskeitsfähigkeit an
 */
function invisibleListener(ev) {
	if (!ev.currentTarget.classList.contains("inactive")) {
		socket.emit(specialPowerSocketID, {
			type : 1,
			username : username
		});
		allInactive();
	}
}


/*
 * Stößt die Tarnungsfähigkeit an
 */
function defenseListener(ev) {
	
	if(!ev.currentTarget.classList.contains("inactive")){
		socket.emit(specialPowerSocketID, {
			type : 2,
			username : username
		});
		allInactive();
	}
}


/*
 * Stößt die Babofähigkeit an
 */
function baboListener(ev) {
	socket.emit(specialPowerSocketID, {
		type : 3,
		username : username
	});
	allInactive();
}

/*
 * Fähigkeiten und werden nach jeder Aktivierung zunächst auf Inaktiv gesetzt
 */
function allInactive() {

	invisibleButton.removeEventListener("click", invisibleListener, false);
	defenseButton.removeEventListener("click", defenseListener, false);
	baboButton.removeEventListener("click", baboListener, false);

	invisibleButton.classList.add("inactive");
	defenseButton.classList.add("inactive");
	baboButton.classList.add("inactive");
	optionPowerMain.classList.add("hide");
}

/**
 * Ajaxcallback für Anfrage auf die Liste der Punkte auf der Karte
 */
function pointMarkerCallback(xhr) {
	if (xhr.readyState == 4) {
		if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
			var array = JSON.parse(xhr.responseText);
			if (pointArray == undefined) {
				pointArray = [];
				for ( i = 0; i < array.length; i++) {
					var data = array[i];
					//addMarker(data.pos,pointPath,data.ID,false);
					placePointMarker(array[i], map);
				}
			}
		}
	}
}

/**
 * Ajaxcallback für Anfrage auf den Mittelpunkt des Spielfeldes
 */
function centerPositionCallback(xhr) {
	if (xhr.readyState == 4) {
		if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
			var o = JSON.parse(xhr.responseText);
			var radius = parseInt(o.radius);
			var pos = new google.maps.LatLng(o.latitude, o.longitude);
			gameCircle = drawCircle(map, false, radius, '#000000', 0, 0.5, '#418bd0', 6, pos);
		}
	}
}

/**
 * Ajaxcallback für Anfrage auf akutelle Restzeit des Spiels
 */
function gameTimeCallback(xhr) {
	if (xhr.readyState == 4) {
		if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
			var time = parseInt(JSON.parse(xhr.responseText).time);
			targetTime = new Date().getTime() + time;
			countdownIntervalID = setInterval(countDown, 1000);
		}
	}
}

/**
 * Ajaxcallback für Anfrage für die aktuelle Benutzerliste im Spiel
 */
function userListCallback(xhr) {
	if (xhr.readyState == 4) {
		if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
			var array = JSON.parse(xhr.responseText);
			for ( i = 0; i < array.length; i++) {
				var u = array[i];
				addMarker(u.position, u.iconPath, u.username, u.pacman);
			}
		}
	}
}

/**
 * Ajaxcallback für Anfrage auf akutellen Benutzernamen des Spiels
 * @param XMLHTTPRequest
 */
function usernameListCallback(xhr) {
	if (xhr.readyState == 4) {
		if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
			var array = JSON.parse(xhr.responseText);
			var context = {
				items : array
			};
			var html = generateHTML(usernameListTmpID, context);
			optionContentWindow.classList.remove("hide");
			optionContentContainer.innerHTML = html;
		}
	}
}

/**
 * Updatemethode wird in festem Intervall aufgerufen und sendet Positionsdaten an Server
 */
function update() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function(position) {
			var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
			socket.emit(updatePositionSocketID, {
				position : {
					latitude : pos.d,
					longitude : pos.e
				},
				username : username
			});
		}, function() {
			displayErrorMessage(pos, "Browser does not support Geotracking");
		});

	} else {
		// Browser doesn't support Geolocation
		displayErrorMessage(pos, "Device does not support Geotracking");
	}
};

/**
 * Funktion wird angestoßen falls Device / Browser abfrage der Geodaten nicht unterstützt
 * @param position
 * @param errorMessage
 */
function displayErrorMessage(position, errorMessage) {

	var options = {
		map : map,
		position : new google.maps.LatLng(position.d, position.e),
		content : errorMessage
	};
	console.log("Infowindow wird gesetzt");
	infowindow = new google.maps.InfoWindow(options);
}

/**
 * Setzt einen Punkt als Marker auf die Karte welcher vom Pacman eingesammelt werden kann
 * @param data
 * @param map
 */
function placePointMarker(data, map) {
	var image = {
		url : "static/img/icons/markerButton.png",
		// This marker is 20 pixels wide by 32 pixels tall.
		size : new google.maps.Size(20, 20),
		// The origin for this image is 0,0.
		origin : new google.maps.Point(0, 0),
		// The anchor for this image is the base of the flagpole at 0,32.
		anchor : new google.maps.Point(25, 25)
	};

	var pos = new google.maps.LatLng(data.pos.latitude, data.pos.longitude);

	var marker = new google.maps.Marker({
		position : pos,
		map : map,
		icon : image
	});
	pointArray[data.ID] = marker;
	//Marker wird einer Liste zu Verwaltung hinzugefügt
}

/**
 * adds a marker to the map
 * @param {Object} pos
 * @param {Object} iconPath
 * @param {Object} id
 * @param {Object} pacman
 */
function addMarker(pos, iconPath, id, pacman) {
	var image = {
		url : iconPath,
		// This marker is 20 pixels wide by 32 pixels tall.
		size : new google.maps.Size(50, 50),
		// The origin for this image is 0,0.
		origin : new google.maps.Point(0, 0),
		// The anchor for this image is the base of the flagpole at 0,32.
		anchor : new google.maps.Point(25, 25)
	};

	var markeropt = {
		position : pos,
		map : map,
		icon : image,
		title : id
	};

	var marker = new google.maps.Marker(markeropt);
	if (pacman) {
		pacmanCircle = drawCircle(map, false, 20, '#FFFF00', 0.2, 0.8, '#FFFF00', 0.8);
		pacmanCircle.bindTo('center', marker, 'position');
	}
	markerArray.push(marker);
	
	//markerArray[id] = marker;
}

/**
 * löscht den Marker eines Spielers der ein Spiel verlassen hat
 * @param {Object} id
 */
function kickMarker(id) {

	var j;
	for ( i = 0; i < markerArray.length; i++) {
		if (markerArray[i].title == id) {
			j = i;
		}
	}

	if (j != undefined) {
		markerArray[j].setMap(null);
		markerArray.splice(j, 1);
	}
}

/**
 * löscht alle Marker auf der Map, wenn ein Spiel zuende ist
 */
function clearMarkers() {
	for ( i = 0; i < markerArray.length; i++) {
		markerArray[i].setMap(null);
	}
	markerArray = [];
}

/**
 * aktualisiert die Position eines Markers
 * @param {Object} marker
 * @param {Object} pos
 */
function refreshMarker(marker, pos) {
	marker.setPosition(pos);
}

/**
 * Listener für den zurück zur Lobby button
 * @param {Object} ev
 */
function gameEndButtonListener(ev) {

	closeOptionButton.classList.remove("hide");
	// wechsel zurück zur lobby
	swapContainer(lobbyMainID, currentPage);

	// mache den PreGameHeader wieder sichtbar
	preGameHeader.classList.remove("hide");
	menuContent.classList.remove("hide");
	optionContentWindow.classList.add("hide");

	history.pushState({
		page : mainID
	}, pageTitle, "?page=1");
	history.pushState({
		page : lobbyMainID
	}, pageTitle, "?page=2");
	currentPage = lobbyMainID;

}

/**
 * öffnet das OptionContentWindow mit den Spezialkräften
 * @param {Object} ev
 */
function energyButtonListener(ev) {
	optionPowerMain.classList.remove("hide");
}

/**
 * öffnet das OptionContentWindow mit den im Spiel aktiven Usern
 * @param {Object} ev
 */
function usersButtonListener(ev) {
	dropAjaxRequest(userListRequestID, "?room=" + gameName, usernameListCallback);
}

/**
 * öffnet das OptionContentWindow mit dem Chat
 * @param {Object} ev
 */
function chatButtonListener(ev) {
	chatWindow.classList.remove("hide");

	var chatSubmitButton = document.getElementById(chatSubmitButtonID);
	addClickListener(chatSubmitButton, sendChatMessageListener);

	var closeButton = document.getElementById("closeChatButton");
	addClickListener(closeButton, closeChatListener);
}

/**
 * öffnet das OptionWindow, in dem gefragt wird ob man sich wirklich ausloggen möchte
 * @param {Object} ev
 */
function logoutGameButtonListener(ev) {
	initOptionWindow(mainGameID, optionMapWindowMain);
}

/**
 * Listener der angestoßen wird wenn man den Menu Opener Button betätigt
 * @param {Object} ev
 */
function openGameMenuListener(ev) {
	var menu = document.getElementById(gameMenuID);
	menu.classList.toggle("fading");
	openGameMenuButton.classList.toggle("moving");
	openGameMenuButton.firstElementChild.firstElementChild.classList.toggle("rotate");
}

/**
 * Listener der auf den Sendebutton im Chatfenster angemeldet wird
 * @param {Object} ev
 */
function sendChatMessageListener(ev) {
	var message = document.getElementById(chatInputID).value;
	socket.emit(chatMessageSocketID, {
		username : username,
		message : message,
		room : gameName
	});
	var input = document.getElementById("chatInput");
	input.innerHTML = "";
}

/**
 * Listener der auf den Schließbutton im Chatfenster angemeldet wird
 * @param {Object} ev
 */
function closeChatListener(ev) {
	chatWindow.classList.add("hide");
}

/**
 * navigiert man mit dem Browser zurück so wird dieser Listener aktiv
 * @param {Object} ev
 */
function closeGameListener(ev) {

	socket.emit(userLeftSocketID, {
		username : username
	});

	startGameFlag = false;

	clearInterval(countdownIntervalID);
	clearInterval(updateIntervalID);
	// wechsel zurück zur lobby
	swapContainer(lobbyMainID, currentPage);

	// mache den PreGameHeader wieder sichtbar
	preGameHeader.classList.remove("hide");
	menuContent.classList.remove("hide");
	// blende das option-window wieder aus
	optionMapWindowMain.classList.add("hide");

	history.pushState({
		page : mainID
	}, pageTitle, "?page=1");
	history.pushState({
		page : lobbyMainID
	}, pageTitle, "?page=2");
	currentPage = lobbyMainID;

}

/**
 * Listener der auf den Nein-Button vom OptionWindow angemeldet
 * @param {Object} ev
 */
function remainGameListener(ev) {
	currentPage = mainGameID;
	optionMapWindowMain.classList.add("hide");
}

/**
 * wenn ein Spiel vorbei ist öffnet die die openGameEndInfoWindow
 * das GameEndWindow um dem Spieler mitzuteilen, ob er ein Spiel gewonnen oder verloren hat
 * und wieviele Punkte er gesammelt und Meter gelaufen ist
 * @param {Object} state
 * @param {Object} gameEndInfo
 * @param {Object} highscore
 * @param {Object} amountDistance
 */
function openGameEndInfoWindow(state, gameEndInfo, highscore, amountDistance) {
	var context = {
		state : state,
		gameEndInfo : gameEndInfo,
		highscore : highscore,
		amountDistance : amountDistance
	};
	optionContentContainer.innerHTML = generateHTML(gameEndTmpID, context);
	optionContentWindow.classList.remove("hide");
	optionLogoutWindowMain.classList.add("hide");
	optionMapWindowMain.classList.add("hide");
	chatWindow.classList.add("hide");
	closeOptionButton.classList.add("hide");
	var backToLobby = document.getElementById(gameEndButtonID);
	addClickListener(backToLobby, gameEndButtonListener);
}

/**
 * diese Countdown Methode wird aufgerufen wenn ein Spieler einem Spiel beitritt oder ein Spiel selbst erstellt.
 * Dabei visualisiert der countdown die ablaufenden Sekunden eines Spiels und ist somit abhängig von der targetTime,
 * die Global zur Verfügung steht
 */
function countDown() {
	var now = new Date().getTime();
	var seconds_left = (targetTime - now) / 1000;
	var str = (new Date).clearTime().addSeconds(seconds_left).toString("mm : ss");
	var timerDisplay = document.getElementById(timerDisplayID);
	if (seconds_left <= 0) {
		clearInterval(countDown);
		timerDisplay = "00:00";
	} else if (seconds_left <= 60) {
		if (!timerDisplay.classList.contains("critical")) {
			timerDisplay.classList.add("critical");
		}
		timerDisplay.innerHTML = str;
	}
	timerDisplay.innerHTML = str;

}
