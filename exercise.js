// Library function - would probably not be limited to the class
function request(url, callback){
    var xmlhttp;
    if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp = new XMLHttpRequest();
    }
    else {// code for IE6, IE5
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.onreadystatechange = function(){
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            callback(xmlhttp.responseText);
        }
    }
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}

var MiniBeat = function(feed){
	
	//reference for variable scoping
	var MB = this;
	
	//fields / model
	this.pages = null;
	this.current = -1;
	this.feed = feed;
	this.interval = null;
	
	//methods
	//get data and render, then repeat every 10 seconds
	this.init = function(){
		refreshModel();
		if(!this.interval){
			this.interval = setInterval(function(){
				refreshModel();
			},10000);
		}
	};
	
	//get data and call render
	var refreshModel = function(){
		request(MB.feed, function(text){
			var data = JSON.parse(text);
			//if something switches positions when selected, unselect it
			if(MB.current > -1 && MB.data && 
				MB.pages[MB.current].title != data.pages[MB.current].title){
					MB.current = -1;
				}
			MB.pages = data.pages;
			console.log(MB.pages);
			MB.printPages();
		});
	}
	//print a single page row and set action listeners for click
	var getSinglePageRow = function(index){
		var page = MB.pages[index];
		var row = document.createElement('div');
		row.className = "page-row";
		row.onclick = function(){
			MB.current = index;
			console.log(MB);
			MB.printPages();
		}
		var arrow = document.createElement("span");
		arrow.className = "arrow";
		arrow.innerHTML = "&gt;";
		if(index == MB.current){
			row.className += " selected";
		}
		row.innerHTML = page.stats.people + " " + page.title + " "; 
		row.appendChild(arrow);
		return row;
	};
	//clear pages then add elements back
	this.printPages = function(){
		console.log("printPages");
		var pages_div = document.getElementById("pages");
		var pages = this.pages;
		pages_div.innerHTML = "";
		for(var i = 0; i < pages.length; i++){
			pages_div.appendChild(getSinglePageRow(i));
		}
		this.printDetails();
	};
	//clear details then render if a page is selected 
	this.printDetails = function(){
		var header = document.getElementById("side-header");
		var details = document.getElementById("details");
		details.innerHTML = "";
		if(this.current < 0){
			header.innerHTML = "Select a page";
			return;
		}
		else{
			var current_page = this.pages[this.current];
			header.innerHTML = current_page.title + " details";
			var toprefs = current_page.stats.toprefs;
			for (var i = 0; i < toprefs.length; i++) {
				details.innerHTML += toprefs[i].visitors + " " + toprefs[i].domain + "<br />";
			}
		}
	};
}

//instantiations
var miniBeat = new MiniBeat("http://api.chartbeat.com/live/toppages/v3/?apikey=317a25eccba186e0f6b558f45214c0e7&host=gizmodo.com");
window.onload = function(){
	miniBeat.init();
}