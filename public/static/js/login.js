// HTML ELEMENTS
var loginButtonID = "loginButton";
var logoutButtonID = "logoutButton";
var statisticButtonID = "statisticButton";
var menuListID = "menuList";
var loginErrorID = "loginErrorMessage";
var loadLoginID = "loadLogin";
var optionContentContainerID = "optionContentContainer";
var optionContentWindowMainID = "optionContentWindowMain";
var closeOptionButtonID = "closeOptionButton";
var highscoreButtonID = "highscoreButton";
var developerButtonID = "developerButton";
var developerContentID = "developerContent";

// TEMPLATES
var menuTmpID = "liMenuTMP";
var usernameTmpID = "usernameTMP";
var highscoreTmpID = "highscoreTMP";

// HEADER
var preGameHeader;
var headerText;
var menuContent;

// HEADER-ID
var preGameHeaderID = "preGameHeader";
var headerTextID = "headerText";

// REGULAR EXPRESSION
var regPattern = new RegExp("[a-zA-Z0-9]+");

// REQUESTS
var loginRequestURL = "server.de/login";

// GLOBALS
var username;
var loadLogin;
var highscore;
var socket;
var start;
var ende;
var optionContentWindow;
var optionContentContainer;
var closeOptionButton;
var ajaxList;

document.addEventListener("DOMContentLoaded", function() {

	// Versuch die Adressleiste des Browsers auszublenden, funktioniert leider ab iOS7 nicht mehr
	setTimeout(function() {
		window.scrollTo(0, 1);
	}, 0);

	currentPage = mainID;
	history.pushState({page : mainID}, pageTitle, "?page=1");
	initDispatcher();

	// socket = io.connect('http://m1.mi.hs-rm.de');
	ajaxList = [];

	// Header Html-Elemente
	preGameHeader = document.getElementById(preGameHeaderID);
	headerText = document.getElementById(headerTextID);
	menuContent = document.getElementById(menuContentID);
	loadLogin = document.getElementById(loadLoginID);

	// Option Window-Elemente
	optionContentWindow = document.getElementById(optionContentWindowMainID);
	optionContentContainer = document.getElementById(optionContentContainerID);
	closeOptionButton = document.getElementById(closeOptionButtonID);
	var highscoreButton = document.getElementById(highscoreButtonID);
	var developerButton = document.getElementById(developerButtonID);

	/**
	 * socket.on Methode die vom Server nach einem login request eines Benutzers aufgerufen wird
	 * ist der state 200, hat der Login geklappt
	 * ansonsten wird dem Benutzer signalisert, dass er einen anderen Benutzernamen eingeben soll 
	 
	socket.on(loginSocketID, function(data) {
		var state = data.state;
		// statistik informationen sind später in der data enthalten
		if (state == 200) {
			loadLogin.classList.add("hide");

			// newGameButtonID und joinGameButtonID sind in der lobby.js deklariert
			var context = {
				wrapperID : lobbyButtonWrapperID,
				newGameID : newGameButtonID,
				joinGameID : joinGameButtonID
			};

			swapAndHide(lobbyTmpID, lobbyMainID, mainID, context);
			

			var statisticMenuContext = {
				menuText : "Statistik",
			};
			appendMenu(menuListID, statisticButtonID, menuTmpID, statisticMenuContext);

			// after the user is logged-in the menu is getting appended with a logout option
			var newMenuContext = {
				menuText : "Logout"
			};
			appendMenu(menuListID, logoutButtonID, menuTmpID, newMenuContext);

			// reaching the lobby there needs to be a optionWindow for the user
			// in case the user wants to get back to the login
			var optionWindowContext = {
				confirmID : confirmID,
				yesButton : yesButtonID,
				noButton : noButtonID,
				text : "Möchtest du dich wirklich ausloggen?"
			};

			swapHTML(optionWindowTmpID, optionLogoutWindowContainerID, optionWindowContext);

			// Ersetzen des Namen "PacTrack" durch den Benutzernamen
			var usernameContext = {
				preText : "Servus, ",
				username : username
			};
			headerText.innerHTML = generateHTML(usernameTmpID, usernameContext);

			//Erstellen der Map aus lobby.js - Muss explizit aufgerufen werden wegen Änderung der DOM-Struktur
			initLobby();

			//Listener fürs Logout
			var logoutButton = document.getElementById(logoutButtonID);
			addClickListener(logoutButton, logoutListener);

			//Logout beim erweiterten Menü hinzufügen
			var logoutButton = document.getElementById(logoutButtonID);
			addClickListener(logoutButton, logoutListener);

			history.pushState({
				page : lobbyMainID
			}, pageTitle, "?page=2");

		} else {
			loginErrorMessage.innerHTML = errUserNameTaken;
			loginErrorMessage.classList.add("displayBlock");
			loginErrorMessage.classList.remove("hide");
			loadLogin.classList.add("hide");
			window.setTimeout(function() {
				loginErrorMessage.classList.add("hide");
				loginErrorMessage.classList.remove("displayBlock");
			}, 4000);
		}
	});
	*/

	/**
 	* Listener der beim Klicken des Highscore-Menu-Punkts angsprochen wird
 	* Listener setzt einen Ajax-Request um die Highscoreliste anzufordern
 	* @param {Object} ev
 	*/
	function highscoreButtonListener(ev) {
		//dropAjaxRequest(highscoreRequestID, "", highscoreCallback);
	}

	/**
	 * Callback Methode des AjaxRequests die vom Server die Highscoreliste erhält
 	 * @param XMLHTTPRequest xhr
	 */
	function highscoreCallback(xhr) {
		if (xhr.readyState == 4) {
			if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
				var dummyArray = JSON.parse(xhr.responseText);
				var context = {
					items : dummyArray
				};
				optionContentWindow.classList.remove("hide");
				optionContentContainer.innerHTML = generateHTML(highscoreTmpID, context);
			}
		}
	}

	/**
	 * Listener der das Entwicklungsfenster öffnet
	 * @param {Object} ev
	 */
	function developerButtonListener(ev) {
		optionContentWindow.classList.remove("hide");
		var html = document.getElementById(developerContentID).innerHTML;
		optionContentContainer.innerHTML = html;
	}

	/**
	 * Listener der beim bätitigen des Login-Buttons aktiviert wird
	 * @param {Object} ev
	 */
	function loginListener(ev) {
		username = document.getElementById("username").value;

		loadLogin.classList.add("hide");

		// newGameButtonID und joinGameButtonID sind in der lobby.js deklariert
		var context = {
			wrapperID : lobbyButtonWrapperID,
			newGameID : newGameButtonID,
			joinGameID : joinGameButtonID
		};

		swapAndHide(lobbyTmpID, lobbyMainID, mainID, context);
	
		var statisticMenuContext = {
			menuText : "Statistik",
		};
		
		appendMenu(menuListID, statisticButtonID, menuTmpID, statisticMenuContext);

		// after the user is logged-in the menu is getting appended with a logout option
		var newMenuContext = {
			menuText : "Logout"
		};
		appendMenu(menuListID, logoutButtonID, menuTmpID, newMenuContext);

		// reaching the lobby there needs to be a optionWindow for the user
		// in case the user wants to get back to the login
		var optionWindowContext = {
			confirmID : confirmID,
			yesButton : yesButtonID,
			noButton : noButtonID,
			text : "Möchtest du dich wirklich ausloggen?"
		};

		swapHTML(optionWindowTmpID, optionLogoutWindowContainerID, optionWindowContext);

		// Ersetzen des Namen "PacTrack" durch den Benutzernamen
		var usernameContext = {
			preText : "Servus, ",
			username : username
		};
		headerText.innerHTML = generateHTML(usernameTmpID, usernameContext);

		//Erstellen der Map aus lobby.js - Muss explizit aufgerufen werden wegen Änderung der DOM-Struktur
		initLobby();

		//Listener fürs Logout
		var logoutButton = document.getElementById(logoutButtonID);
		addClickListener(logoutButton, logoutListener);

		//Logout beim erweiterten Menü hinzufügen
		var logoutButton = document.getElementById(logoutButtonID);
		addClickListener(logoutButton, logoutListener);

		history.pushState({
			page : lobbyMainID
		}, pageTitle, "?page=2");
		
		/**
		if (regPattern.test(username)) {
			socket.emit(loginSocketID, {
				username : username
			});
			loadLogin.classList.remove("hide");
		} else {
			loginErrorMessage.innerHTML = errUserNameInvalid;
			loginErrorMessage.classList.add("displayBlock");
			loginErrorMessage.classList.remove("hide");
			window.setTimeout(function() {
				loginErrorMessage.classList.add("hide");
				loginErrorMessage.classList.remove("displayBlock");
			}, 4000);
		}
		*/
	};

	/**
	 * Listener der beim bätitigen des Logout-Buttons aktiviert wird
	 * @param {Object} ev
	 */
	function logoutListener(ev) {

		swapContainer(mainID, currentPage);
		currentPage = mainID;
		history.pushState({
			page : mainID
		}, pageTitle, "?page=1");
		removeMenuElements();
		headerText.innerHTML = pageTitle;

		// klappe das Menu nach dem Logout wieder zu
		menuContent.classList.toggle("openMenu");

		// sage dem Server bescheid er solle den Benutzer doch bitte ausloggen
		/**socket.emit(logoutSocketID, {
			username : username
		});*/
	}

	/**
	 * Listener der auf den Close-Button vom OptionWindow hört
 	 * @param {Object} ev
	 */
	function closeOptionWindowListener(ev) {
		optionContentWindow.classList.add("hide");
		menuContent.classList.remove("openMenu");
	}

	/**
	 * Erweitert das Spielmenü um die Funktion des Ausloggens
 	 * @param {Object} menuListID
     * @param {Object} liID
     * @param {Object} templateID
     * @param {Object} context
	 */
	function appendMenu(menuListID, liID, templateID, context) {
		var html = generateHTML(templateID, context);
		var menu = document.getElementById(menuListID);
		var element = document.createElement("li");
		var a = document.createElement("a");
		a.className = "font-size-menu";
		a.id = liID;
		var text = document.createTextNode(context.menuText);
		a.appendChild(text);
		element.appendChild(a);
		menu.appendChild(element);
	}

	var loginErrorMessage = document.getElementById(loginErrorID);
	var loginButton = document.getElementById(loginButtonID);
	addClickListener(loginButton, loginListener);
	addClickListener(closeOptionButton, closeOptionWindowListener);
	addClickListener(developerButton, developerButtonListener);
	addClickListener(highscoreButton, highscoreButtonListener);
});
