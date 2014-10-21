/**
 * hier wird die Progressbar für die Spezialkräfte initialisiert
 */
function initProgressbar() {
	progressBar = new ProgressBar("progressbar", {
		'width' : '45px',
		'height' : '10px'
	});

	var oName = ProgressBar.OPTION_NAME;
	var oValue = ProgressBar.OPTION_VALUE;

	//Create new item
	barItem = {};
	barItem[oName.ITEM_ID] = "item1";
	barItem[oName.TYPE] = oValue.TYPE.BAR;
	barItem[oName.COLOR_ID] = oValue.COLOR_ID.GREEN;
	progressBar.createItem(barItem);
	
	progressBar.setPercent(0, "item1");
}

function updateProgress(p) {
	progressBar.setPercent(p);
}
