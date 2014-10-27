// TEMPLATES
var gameMapTmpID = "gameMapTMP";
var characterSelectTmpID = "characterSelectTMP";
var lobbyTmpID = "lobbyTMP";
var userStatisticTmpID = "userStatisticTMP";

//WRAPPER
var lobbyButtonWrapperID = "lobbyButtonWrapper";
var confirmID = "confirm";

// WRAPPER CONTENT
var gameButtons;

//BUTTONS
var newGameButtonID = "newGame";
var joinGameButtonID = "joinGame";
var yesButtonID = "yesButton";
var noButtonID = "noButton";

var amountImages = 14;

// GLOBALS
var gameName;
//var imageArray;
var startGameFlag;

//Initialisierung der Lobbyseite
function initLobby() {
	var newGameSource = document.getElementById(newGameButtonID);
	var joinGameSource = document.getElementById(joinGameButtonID);
	var yesButton = document.getElementById(yesButtonID);
	var noButton = document.getElementById(noButtonID);

	var statisticButton = document.getElementById(statisticButtonID);

	addClickListener(newGameSource, newGameListener);
	addClickListener(joinGameSource, joinGameListener);
	addClickListener(yesButton, confirmLogout);
	addClickListener(noButton, cancelLogout);
	addClickListener(statisticButton, statisticListener);

	currentPage = lobbyMainID;

	//initImages();
};

/**
 * Setzt den Ajaxrequest für die Statistikdaten des Benutzers
 */
function statisticListener(ev) {
	// hole Data daten vom Server
	//dropAjaxRequest(statisticRequestID, "?username=" + username, statisticCallBack);
}

/**
 * Callbackmethode für die Antwort auf die Anfrage auf die Statistikdaten
 */
function statisticCallBack(xhr) {
	if (xhr.readyState == 4) {
		if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
			var context = JSON.parse(xhr.responseText);

			optionContentWindow.classList.remove("hide");
			optionContentContainer.innerHTML = generateHTML(userStatisticTmpID, context);

			// klappe das Menu nach dem Logout wieder zu
			menuContent.classList.toggle("openMenu");
		}
	}
}

/**
 * Bestätigt den Logout und damit den Fensterwechsel zum Login
 */
function confirmLogout(ev) {

	// wechsel zurück zum login
	swapContainer(mainID, currentPage);
	currentPage = mainID;
	headerText.innerHTML = pageTitle;

	history.pushState({
		page : mainID
	}, pageTitle, "?page=1");
	// blende das option-window wieder aus
	var optionWindowMain = document.getElementById(optionWindowMainID);
	optionWindowMain.classList.add("hide");
	removeMenuElements();

	// signalisiere dem Server den Logout des Users
	//socket.emit(logoutSocketID);
}

/**
 * Löscht die Menüelemente die im Loginbereich nicht sichtbar sind
 */
function removeMenuElements() {
	var list = document.getElementById(menuListID);
	var del = document.getElementById(statisticButtonID).parentElement;
	list.removeChild(del);
	del = document.getElementById(logoutButtonID).parentElement;
	list.removeChild(del);
}

/**
 * Abbrechen des logout per History
 */
function cancelLogout(ev) {
	currentPage = lobbyMainID;
	var optionWindowMain = document.getElementById(optionWindowMainID);
	optionWindowMain.classList.add("hide");
}

/**
 * Initialisierung der Bilder für die Iconauswahl des Spielers
 */
function initImages() {
	imageArray = new Array();
	for ( i = 0; i < amountImages; i++) {
		imageArray[i] = {
			imageID : "c" + (i + 1),
			imagePath : "static/img/character/c" + (i + 1) + ".png"
		};
	}
}

/**
 * Callbackfunktion für die Anfrage auf die anzuzeigenden Icons
 */
function iconListCallback(xhr) {
	if (xhr.readyState == 4) {
		if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
			//Bilder werden geladen
			var imageArray = JSON.parse(xhr.responseText);
			var images = [];
			
			for ( i = 0; i < imageArray.length; i++) {
				images[i] = {imagePath : imageArray[i]};
			}
			//Weiterleitung wird angestoßen
			var wrapper = {
				wrapperID : characterSelectWrapperID,
				items : images
			};
			
			swapAndHide(characterSelectTmpID, characterSelectMainID, lobbyMainID, wrapper);
			swapContainer(characterSelectMainID, lobbyMainID);
			initSelection(); 
			history.pushState({page : characterSelectMainID}, pageTitle, "?page=5");
		}
	}
}

/**
 * Callbackfunktion falls neues Spiel gestartet wird
 */
function newGameListener(ev) {
	startGameFlag = true;
	var gameSettingContext = {
		startGameID : startGameButtonID,
		wrapperID : gameSettingsWrapperID,
		radius : "radius",
		gameTime : "gameTime",
		amountPlayers : "amountPlayers",
		gameName : "gameName"
	};
	swapAndHide(gameSettingTmpID, gameSettingsMainID, lobbyMainID, gameSettingContext);
	initGameSettings();

	history.pushState({
		page : gameSettingsMainID
	}, pageTitle, "?page=3");
};

/**
 * Callbackfunktion falls einem bestehenden Spiel beigetreten werden soll
 */
function joinGameListener(ev) {
	startGameFlag = false;
	//dropAjaxRequest(iconListRequestID, "?username=" + username, iconListCallback);
}

