var set = false,
    deleteSymbol;

// store to localstorage
function store(key, val) {
	var obj= {};
	obj[key] = val;
	chrome.storage.local.set(obj);
}

// set the status of current tab with a symbol
function status() {
	var title;
	var text = this.textContent; // capture text of element

	browser.tabs.query({active: true}).then(tabs => {
		for (let tab of tabs) {
			title = tab.title.split(' ');

			if(set) title[0] = text;
			else    title.unshift(text);
			set = true;

			store(tab.url, title.join(" "));

			browser.tabs.executeScript({
				code: "document.title = '" + title.join(" ") + "'"
			});
		}
	});
}

// display context menu
function menu(e) {
	var menu = document.querySelector("ul");
	menu.style.display = "block";
	menu.style.left = e.clientX + "px";
	menu.style.top = e.clientY + "px";
	deleteSymbol = e.target;
}

// add to span and save
function add() {
	var span = document.createElement("span");
	span.textContent = document.querySelector("input").value;
	span.addEventListener("click", status); // add listeners to new button
	span.addEventListener("contextmenu", e => menu(e));
	document.querySelector(".symbols").appendChild(span);

	// save
	chrome.storage.local.set({"user": document.querySelector(".symbols").innerHTML});
	document.querySelector("input").value = ' '; // clear input
}

// UI

// collapsable titles
document.querySelectorAll("p").forEach(e => e.addEventListener("click", function() {
	if(this.nextElementSibling.style.display == "block") {
		this.nextElementSibling.style.display = "none";
		this.style.color = "#0af";
	}
	else {
		this.nextElementSibling.style.display = "block";
		this.style.color = "#fa0";
	}
}));

// clear button
document.querySelector(".clear").addEventListener("click", () => {
	chrome.storage.local.clear();
	alert("data cleared")
});

// remove status button
document.querySelector(".remove").addEventListener("click", () => {
	if(set) {
		browser.tabs.query({active: true}).then(tabs => {
			for (let tab of tabs) {
				title = tab.title.split(' ');

			  title[0] = '';
				set = false;
				chrome.storage.local.remove(tab.url);

				browser.tabs.executeScript({
					code: "document.title = '" + title.join(" ") + "'"
				});
			}
		});
	}
});

// delete contextmenu option
document.querySelector("ul").addEventListener("click", function(e) {
	deleteSymbol.remove();
	chrome.storage.local.set({"user": document.querySelector(".symbols").innerHTML});
});

// one-liners
document.querySelector(".add").addEventListener("click", add);
document.querySelector("input").addEventListener("keyup", function(e) { if(e.keyCode == 13) add()});
document.addEventListener("contextmenu", e => e.preventDefault());
document.body.addEventListener("click", () => document.querySelector("ul").style.display = "none");
document.body.addEventListener("keyup", e => { if ( e.keyCode === 27 ) document.querySelector("ul").display = "none" });

// INITIALIZATION

// get this tab's data from localstorage
function retrieve(key) {
	chrome.storage.local.get(key, function(result) {
		if (result[key] !== undefined) {
			set = true;

			chrome.tabs.executeScript({
		    code: "document.title = '" + result[key] + "'"
		  });
		}
	});
}

// get symbols defined by user from localstorage
function getUserCharacters() {
	chrome.storage.local.get("user", function(result) {
		if (result.user !== undefined) {
			document.querySelector(".symbols").innerHTML = result.user;
			document.querySelectorAll("span").forEach(e => e.addEventListener("click", status));
			document.querySelectorAll(".symbols").forEach(e => e.addEventListener("contextmenu", e => menu(e)));
		}
	});
}

window.onload = function() {
	browser.tabs.query({active: true}).then(tabs => { for (let tab of tabs) retrieve(tab.url) });
	getUserCharacters();
}
