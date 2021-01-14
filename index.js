var set = false;
var deleteSymbol;

function store(key, val) {
	var obj= {};
	obj[key] = val;
	chrome.storage.local.set(obj);
}

function retrieve(key) {
	chrome.storage.local.get(key, function(result) {
		console.log(result);
		if (result[key] !== undefined) {
			set = true;

			chrome.tabs.executeScript({
		    code: "document.title = '" + result[key] + "'"
		  });
		}
	});
}

function status() {
	var title;
	var self = this;
	chrome.tabs.getSelected(null,function(tab) { // null defaults to current window
	  title = tab.title.split(' ');

	  if(set) title[0] = self.textContent;
		else    title.unshift(self.textContent)
		set = true;

		store(tab.url, title.join(" "));

		chrome.tabs.executeScript({
	    code: "document.title = '" + title.join(" ") + "'"
	  });
	});
}

function menu(e) {
	var menu = document.querySelector("ul");
	menu.style.display = "block";
	menu.style.left = e.clientX + "px";
  menu.style.top = e.clientY + "px";
  deleteSymbol = e.target;
}

function getUserCharacters() {
	chrome.storage.local.get("user", function(result) {
		if (result.user !== undefined) {
			document.querySelector(".symbols").innerHTML = result.user;
			document.querySelectorAll("span").forEach(e => e.addEventListener("click", status));
			document.querySelectorAll(".symbols").forEach(e => e.addEventListener("contextmenu", e => menu(e)));
		}
	});
}

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

document.querySelector(".clear").addEventListener("click", () => {
	chrome.storage.local.clear();
	alert("data cleared")
});

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

document.querySelector(".add").addEventListener("click", add);
document.querySelector("input").addEventListener("keyup", function(e) { if(e.keyCode == 13) add()});
document.addEventListener("contextmenu", e => e.preventDefault());
document.body.addEventListener("click", () => document.querySelector("ul").style.display = "none");
document.body.addEventListener("keyup", e => { if ( e.keyCode === 27 ) document.querySelector("ul").display = "none" });
document.querySelector("ul").addEventListener("click", function(e) {
	deleteSymbol.remove();
	chrome.storage.local.set({"user": document.querySelector(".symbols").innerHTML});
});

window.onload = function() {
	chrome.tabs.getSelected(null, tab => retrieve(tab.url));
	getUserCharacters();
}
