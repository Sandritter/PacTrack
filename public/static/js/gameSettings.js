// TEMPLATES
var gameMapTmpID = "gameMapTMP";
var gameSettingTmpID = "gameSettingsTMP";

// WRAPPER
var gameSettingsWrapperID = "gameSettingsWrapper";
var gameNameErrorWrapperID = "gameNameErrorMessage";

// BUTTONS
var formGroupClass = "form-control";
var startGameButtonID = "startGameButton";

// GLOBALS
var gameName;
var radius;
var gameSettingKeys = {
	radius : "radius",
	gameTime : "gameTime",
	amountPlayers : "amountPlayers",
	gameName : "gameName"
};

/**
 * Initialisiert die Spieleinstellungsmöglichkeiten
 */
function initGameSettings() {
	var startGameSource = document.getElementById(startGameButtonID);
	var gameNameErrorMessage = document.getElementById(gameNameErrorWrapperID);
	currentPage = gameSettingsMainID;
	addClickListener(startGameSource, fetchGameSettings);

	//Callbackmethode für die Rückantwort vom Server bei der Raumstellung
	/**
	 * socket.on(createRoomSocketID, function(data) {
		if (data.state == 200) { //Wenn der Server okay zurück gibt
			var context = {
				mapID : mapID
			};
			swapAndHide(gameMapTmpID, mainGameID, gameSettingsMainID, context); //Bereiche der Seite austauschen
			preGameHeader.classList.add("hide");
			menuContent.classList.add("hide");
			history.pushState({page : mainGameID}, pageTitle, "?page=4");

			if (navigator.geolocation) { //Wenn Geodaten abgefragt werden können
				navigator.geolocation.getCurrentPosition(function(position) {
					pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
					socket.emit(setRoomCenterID, {//Dem Server die Position für den Mittelpunkt des Spielfeldes mitteilen
						position : {
							latitude : pos.d,
							longitude : pos.e
						},
						username : username
					});
					initializeMap(); //Initialisieren der Map anstoßen
				});
			};

		} else { //Falls der Spielname schon vergeben ist
			gameNameErrorMessage.innerHTML = errGameNameTaken; //Fehlermeldung einblenden
			gameNameErrorMessage.classList.add("displayBlock");
			gameNameErrorMessage.classList.remove("hide");
			window.setTimeout(function() {
				gameNameErrorMessage.classList.add("hide");
				gameNameErrorMessage.classList.remove("displayBlock");
			}, 4000);
			console.log("beim Starten eines Spiels ist ein Fehler passiert. Googlen Sie nach Benjamin Christiani oder Benedikt Süßmann um nähere Kontaktdaten zu erhalten.");
		}
	});
	*/
};

/*
 * liest Informationen aus den Spieleinstellungenfeldern aus und schickt diese an den Server
 */
function fetchGameSettings(ev) {
	var formGroups = document.getElementsByClassName(formGroupClass);
	var amountPlayers;
	var gameSettings;

	//Alle Formularfelder werden ausgelesen
	for ( i = 0; i < formGroups.length; i++) {
		if (gameSettingKeys.radius == formGroups[i].name) {
			radius = parseInt(formGroups[i].value);
		} else if (gameSettingKeys.gameTime == formGroups[i].name) {
			gameTime = formGroups[i].value;
		} else if (gameSettingKeys.amountPlayers == formGroups[i].name) {
			amountPlayers = formGroups[i].value;
		} else if (gameSettingKeys.gameName == formGroups[i].name) {
			gameName = formGroups[i].value;
		}
	};

	gameSettings = { //Spieleinstellungen die dem Server übermittelt werden
		radius : parseInt(radius), //Radius des Spielfeldes
		gameTime : parseInt(gameTime), //Laufzeit des Spiels
		amountPlayers : parseInt(amountPlayers), //Anzahl maximaler Spieler
		gameName : gameName, //Spielname
		host : username //Benutzername des Erstellers
	};

	//Spieleinstellungen werden an den Server versendet
	/**
	socket.emit(createRoomSocketID, { 
		gameSettings : gameSettings
	});
	*/

}

