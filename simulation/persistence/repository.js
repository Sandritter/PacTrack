/**
 * Modul
 * Verwaltet die Pfade zu den Character Icons
 * @param {Object} maxIconCount - maximale Anzahl der anzuzeigenden Characters
 * @param {Object} minIconCount - minimale Anzahl der Standardicons 
 */
function Repository(maxIconCount, minIconCount) {
	this.greyIconPaths = new Array();
	this.normalIconPaths = new Array();
	this.scoreTable = new Array();
	
	this.maxIconCount = maxIconCount;
	this.minIconCount = minIconCount;
	
	this.init();
}

/**
 * Initialisiert die Pfade
 */
Repository.prototype.init = function() {
	
	this.scoreTable[0] = this.minIconCount;
	this.scoreTable[2000] = Math.round(this.maxIconCount * 0.5);
	this.scoreTable[5000] = Math.round(this.maxIconCount * 0.9);
	this.scoreTable[10000] = this.maxIconCount;
	
	for(i = 1; i <= this.maxIconCount; i++) {
		this.normalIconPaths.push("static/img/character/c" + i + ".png");
	}
	
	for(i = this.minIconCount + 1; i <= this.maxIconCount; i++) {
		this.greyIconPaths.push("static/img/iconsB/c" + i + ".png");
	}
}

/**
 * Liefert eine Liste der Characters, welche vom Client ausgewählt werden können
 * @param {Object} score - abhängig von dem Score der Clients
 */
Repository.prototype.getPaths = function(score) {
	var iconCount = this.minIconCount;
	
	// Leider gefällt JavaScript die Zahl 10000 nicht, deswegen musste auf diese etwas umständliche Lösung zurückgegriffen werden!!!
	if(0<=score && score < 2000) {
		iconCount = this.scoreTable[0];
	} else if(2000<=score && score < 5000) {
		iconCount = this.scoreTable[2000];
	} else if(5000<=score && score < 10000) {
		iconCount = this.scoreTable[5000];
	} else if(score >= 10000) {
		iconCount = this.scoreTable[10000];
	}
	
	// Die normalen Icons werden durch den folgenden aufwendigen Algorithmus mit den ausgegrauten Icons vermischt 
	var icons = this.normalIconPaths.slice(0,iconCount);
	var rest = this.maxIconCount - iconCount;
	var greyStart = this.greyIconPaths.length - rest;
	var greyIcons = this.greyIconPaths.slice(greyStart);
	
	icons.push.apply(icons, greyIcons);
	
	return icons;
}

exports.Repository = Repository;