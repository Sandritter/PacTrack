// WRAPPER
var gameSelectWrapperID = "gameSelectWrapper";

// BUTTONS
var gameSelectorClass = "gameSelector";

/**
 * Initialisiert die Auswahl an aktuellen Spielen denen man beitreten kann
 */
function initGameSelection() {
	var sources = document.getElementsByClassName(gameSelectorClass);
	currentPage = gameSelectMainID;
	addClickListenerToList(sources, openGameListener);
	
	var context = {
		mapID : mapID
	};

	//Callbackmethode für das Betreten eines Spiels
	/**
	 * socket.on(enterRoomSocketID, function(data) {
		if (data.state = 200) { //Falls Server okay gibt
			swapAndHide(gameMapTmpID, mainGameID, gameSelectMainID, context);
			preGameHeader.classList.add("hide");
			menuContent.classList.add("hide");
			initializeMap(); //Weiter zur Map
			history.pushState({page : mainGameID}, pageTitle, "?page=4");
		} else { //Falls Server kein Okay gibt
			dropAjaxRequest(gameSelectListID, "", refreshGameListCallback); //Ajax Request für aktuelle Spielliste absetzen
		}
	}); 
	*/
}

/*
 * Callbackmethode für den Ajaxrequest auf die aktuelle Spielliste
 */
function refreshGameListCallback(xhr){
		if (xhr.readyState == 4) {
		if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
	
			gameArray = JSON.parse(xhr.responseText);
			
			var wrapper = {
				wrapperID : gameSelectWrapperID,
				items : gameArray
			};
			var gameSelectionMain = document.getElementById(gameSelectMainID);
			gameSelectionMain.innerHTML = generateHTML(gameSelectTmpID, wrapper);
		}
	}
}

/*
 * Liest aus welches Spiel betreten werden soll und gibt diese Informationen an den Server weiter
 */
function openGameListener(ev) {
	gameName = ev.currentTarget.lastElementChild.firstElementChild.firstElementChild.innerHTML;

	//Übermittelt relevante Daten des Spielbeitritts an den Server
	/**	
	socket.emit(enterRoomSocketID, {
		gameName : gameName,  //Spielname
		iconPath : selectedCharacter, //Ausgewählter Spielcharacter
		username : username //Benutzername
	});
	*/

}
