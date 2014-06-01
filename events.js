// InLiveTw : ChromeCast news, events, video streaming through Chrome browser extension.

var eventQueue = [];
var queuePointer = 0;
var intervalFlag = null;

function simpleDateFormatter(jsondt) {
  var dt = jsondt.slice(0, 19).replace('T', ' ');
  return dt;
}


function updateEvent(data) {
  eventQueue = [];
  for(var id in data) {
    var x = data[id];
    eventQueue.push({
      'dt': x['start'],
      'content': x['title'] + '<br>\n' +
      '<span style="font-size:32px;">'+x['location'] + '</span><br>\n' +
      '<span style="font-size:24px;">'+simpleDateFormatter(x['start'])+'</span>'});
  }

  eventQueue.sort(function (a, b) { // ascendant order
    if(a['dt'] < b['dt']) return -1;
    if(a['dt'] > b['dt']) return 1;
    return 0;
  });
  queuePointer = 0;
  update();
  intervalFlag = setInterval(update, 5000);
}

function update() {
  msg = eventQueue[queuePointer % eventQueue.length].content;
  $('#input').html(msg);
  sendMessage(msg);
  queuePointer++;
}

var now = Date.now();
function newsTooOld(jsondt) {
  // One week = too old
  return Date.parse(jsondt) < now - 1000*86400*7;
}

function shortMessage(msg) {
  // Show 140 characters? XDDD
  if(msg.length > 140) {
    return msg.slice(0, 139) + '...';
  } else {
    return msg;
  }
}

function updateNews(data) {
  eventQueue = [];
  for(var reporter in data) {
    for(var i = 0; i < data[reporter]['post'].length; i++) {
      var x = data[reporter]['post'][i];
      if(!newsTooOld(x['datetime'])) {
        eventQueue.push({
          'dt': x['datetime'],
          'content': 
            '<span style="font-size:16px;">' + simpleDateFormatter(x['datetime']) + '</span><br>\n' +
            '<span style="font-size:24px;">' + shortMessage(x['message']) + '</span><br>\n' +
            '<img src="'+x['picture']+'">'});
      }
    }
  }

  if(eventQueue.length == 0) {  // When news is way too old ...
    return false;
  }

  eventQueue.sort(function (a, b) { // ascendant order
    if(a['dt'] < b['dt']) return -1;
    if(a['dt'] > b['dt']) return 1;
    return 0;
  });
  queuePointer = 0;
  update();
  intervalFlag = setInterval(update, 5000);
}



function loadEvents() {
  debugMessage('Loading events');
  if(intervalFlag != null) {
    debugMessage('Clear interval');
    clearInterval(intervalFlag);
  }
  $('#input').html("載入中...");
  $.ajax({
    url: 'https://livelink.firebaseio.com/event/.json',
    type: 'GET',
    dataType: 'json',
    cache: false,
    success: updateEvent,
    error: function(e) {
      debugMessage('Error reading JSON: ' + str(e));
    },
  });
}

function loadNews() {
  debugMessage('Loading news');
  if(intervalFlag != null) {
    debugMessage('Clear interval');
    clearInterval(intervalFlag);
  }
  $('#input').html("載入中...");
  $.ajax({
    url: 'https://livelink.firebaseio.com/news/.json',
    type: 'GET',
    dataType: 'json',
    cache: false,
    success: updateNews,
    error: function(e) {
      debugMessage('Error reading JSON: ' + str(e));
    },
  });
}
