// TEMPLATES
var optionWindowTmpID = "optionWindowTMP";

// CONTAINER 
var optionLogoutWindowContainerID = "optionWindowContainer";
var optionMapWindowContainerID = "optionMapWindowContainer";

//	MAIN
var optionWindowMainID = "optionWindowMain";
var optionMapWindowMainID = "optionMapWindowMain";  

var optionLogoutWindowMain;
var optionMapWindowMain;

var stopPopFlag;

/*
 * Initialisiert den Dispatcher, welcher die Browserhistory verwaltet
 */
function initDispatcher() {
	window.onpopstate = handleHistory;	
	optionLogoutWindowMain = document.getElementById(optionWindowMainID);
	optionMapWindowMain = document.getElementById(optionMapWindowMainID);
}

/*
 * Verarbeitet vom Browser geworfenes History Event und kümmert sich um das vor- und zurückgehen in der History
 */
function handleHistory(ev) {
	if (ev.state != null) {
		var targetPage = ev.state.page; //Zielseite
		// wenn von der Lobby zum Login navigiert werden will
		if (targetPage == mainID && currentPage == lobbyMainID){
			initOptionWindow(lobbyMainID, optionLogoutWindowMain);
			
		// wenn von der Map aus zurück navigiert wird 
		} else if (targetPage == gameSettingsMainID && currentPage == mainGameID || targetPage == gameSelectMainID && currentPage == mainGameID) {
			initOptionWindow(mainGameID, optionMapWindowMain);

		// wenn man sich beim login befindet und zurück navigiert
		} else if (targetPage == lobbyMainID && currentPage == mainID) {
			history.pushState({page: mainID}, pageTitle, "?page=1"); // soll es verhindert werden wieder in die lobby zu gelangen
			currentPage = mainID;
		} else {
			swapContainer(targetPage, currentPage);
			currentPage = targetPage;
			optionLogoutWindowMain.classList.add("hide");
			optionMapWindowMain.classList.add("hide");
		}
	}
}

/**
 * Initialisiert das Fenster welches zur Bestätigung des Zurückgehens eingeblendet wird
 * @param {Object} currentPAGE - Aktuelle Seite
 * @param {Object} windoW - Das Fenster welches gezeigt werden soll
 */
function initOptionWindow(currentPAGE, windoW){
	if(currentPAGE == mainGameID){
		history.pushState({page: currentPAGE}, pageTitle, "?page=4");
	} else {
		history.pushState({page: currentPAGE}, pageTitle, "?page=2");
	}
	currentPage = currentPAGE;
	windoW.classList.remove("hide");
}
