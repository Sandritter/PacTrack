var menuButtonID = "menuButton";
var menuContentID = "menu";

document.addEventListener("DOMContentLoaded", function(){

	function menuListener(ev){
		menuContent.classList.toggle("openMenu");
	};
	
	var menuButton = document.getElementById(menuButtonID);
	var menuContent = document.getElementById(menuContentID);
	
	menuButton.addEventListener('click', menuListener, false);
	
});