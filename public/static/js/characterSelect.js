// CONTAINER
var characterSelectMAIN;

// TEMPLATES
var gameSelectTmpID = "gameSelectTMP";

// BUTTONS
var characterClass = "character";

// WRAPPER
var characterSelectWrapperID = "characterSelectWrapper";

var gameArray;
var selectedCharacter;

/*
 * Initialisiert die Liste von auswählbaren Spielicons
 */
function initSelection() {
	var characters = document.getElementsByClassName(characterClass);
	currentPage = characterSelectMainID;
	addClickListenerToList(characters, characterSelectionListener);
}

/*
 *Callback für Ajax antwort vom Server 
 */
function gameSelectionCallback(xhr) {
	if (xhr.readyState == 4) {
		if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
	
			gameArray = JSON.parse(xhr.responseText); //Liste der aktuellen Spiele wird geparst
			
			var wrapper = {
				wrapperID : gameSelectWrapperID,
				items : gameArray
			};
			swapAndHide(gameSelectTmpID, gameSelectMainID, characterSelectMainID, wrapper); //Aktuellen mainbereich wechseln

			history.pushState({page : gameSelectMainID}, pageTitle, "?page=6");

			initGameSelection(); //Aktuelle Spielliste wird initialisiert
		}
	}
}

/*
 * Liest aus welcher Icon angewählt wurde und gibt dessen Pfad an den Server weiter
 */
function characterSelectionListener(ev) {
	selectedCharacter = (ev.target).src; //Der ausgewählte icon wird vermerkt
	if (selectedCharacter.indexOf("iconsB") == -1){ //Wenn der angewählte icon überhaupt verfügbar ist		
		selectedCharacter = selectedCharacter.replace("character","icons");
		selectedCharacter = selectedCharacter.replace(host+"/","");
		dropAjaxRequest(gameSelectListID, "", gameSelectionCallback); //Ajax request für die aktuelle spielliste absetzen
	}
}
