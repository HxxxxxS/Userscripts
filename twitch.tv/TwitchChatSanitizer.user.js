// ==UserScript==
// @name         Twitch Chat Sanitizer
// @version      1.2.1
// @description  removes idiocy
// @author       HxxxxxS @ https://github.com/HxxxxxS/
// @author       Based on https://greasyfork.org/en/scripts/40811-twitch-chat-deretardifier by hello_frenz
// @match        https://www.twitch.tv/*
// @grant        none
// @downloadURL  https://raw.githubusercontent.com/HxxxxxS/Userscripts/master/twitch.tv/TwitchChatSanitizer.user.js
// ==/UserScript==

// Todo: Script won't work after changing channel through Twitch's native ajax calls. Must CTRL+R after changing channel.
let tcs = {}

// ==== Settings start ====

tcs.blackList = [               // Messages containing these words will not be shown. Note that spaces are removed before checking this list.
    'monka', 'Saknom', 'Pog', 'FeelsAmazingMan',
    'OMEGA', 'KKona', 'Pepe', '!subhype', 'gachi',
    'Pls', 'pepo', 'happyfooty', 'peepo', 'Sadge',
    'ezclap', '(ditto)', 'lulw', 'KEK', 'Giggle', 'LUL',
    'WICKED'
];
tcs.config = {
    r9k: 256,                   // If a message is already posted in the X last chat messages it will not be shown again.
    debugMode: false,           // Set debugMode to true and messages will be highlighted red instead of removed.
    logMessages: false,         // Set logMessages to true and the messages marked as spam will be logged in the console.
    deleteInsteadOfHiding: true,// If false the message will be styled `display: none;` instead of removed from the DOM
    bttvTop: 5000,              // How many bttv emotes to download from Top page. Being downloaded in pages of 100 so high numbers will cause more network lag.
    bttvTrending: 2500,         // How many bttv emotes to download from Trending page. Same as above.
}

// ===== Script start =====

tcs.limitPerPage = 100;
tcs.censorCount = 0;
tcs.log;
tcs.r9klog = [];

tcs.getTopEmotes = async (offset) =>
{
    const apiUrl='https://api.betterttv.net/3/emotes/shared/top';
    let actualUrl = apiUrl + `?offset=${offset}&limit=${tcs.limitPerPage}`;
    var apiResults = await fetch(actualUrl)
    .then(res=>{
        return res.json();
    });
    return apiResults;
}

tcs.getTrendingEmotes = async (offset) =>
{
    const apiUrl = "https://api.betterttv.net/3/emotes/shared/trending"
    let actualUrl = apiUrl + `?offset=${offset}&limit=${tcs.limitPerPage}`;
    var apiResults = await fetch(actualUrl)
    .then(res=>{
        return res.json();
    });
    return apiResults;
}

tcs.getEntireTopEmoteList = async (pageNo) =>
{
    const results = await tcs.getTopEmotes(pageNo);
    console.log("Retreiving Top BTTV emotes from API for page : " + pageNo);
    if (results.length>0 && pageNo<tcs.config.bttvTop) {
        return results.concat(await tcs.getEntireTopEmoteList(pageNo+tcs.limitPerPage));
    } else {
        return results;
    }
};
tcs.getEntireTrendingEmoteList = async (pageNo) =>
{
    const results = await tcs.getTrendingEmotes(pageNo);
    console.log("Retreiving Trending BTTV emotes from API for page : " + pageNo);
    if (results.length>0 && pageNo<tcs.config.bttvTrending) {
        return results.concat(await tcs.getEntireTrendingEmoteList(pageNo+tcs.limitPerPage));
    } else {
        return results;
    }
};

tcs.getAllEmoteLists = async () =>
{
    tcs.getEntireTopEmoteList(0)
    .then(top=>{
        tcs.blackList = tcs.blackList.concat(top.map(o=>{return o.emote.code}));
    });
    tcs.getEntireTrendingEmoteList(0)
    .then(trending=>{
        tcs.blackList = tcs.blackList.concat(trending.map(o=>{return o.emote.code}));
    })
    .then(_=>{
        tcs.blackList = [...new Set(tcs.blackList)];
        console.log(tcs)
    })
}

tcs.addListener = (log) =>
{
    var observer = new MutationObserver(tcs.checkMessage);
    observer.observe(log, {childList: true});
    tcs.createMessage('Twitch Chat Sanitizer is now active.');
}

tcs.checkMessage = (mutation) =>
{
  for (var i = 0; i < mutation.length; i++)
  {
      var newMessage = mutation[i].addedNodes[0];
      if (newMessage)
      {
          var fragments = newMessage.querySelectorAll('.text-fragment');
          if (fragments.length < 1) {
              tcs.removeMessage(newMessage);
          } else {
              var text = fragments[0].innerText.replace(/(?:\@[\w\d]+)*/g,'').replace(/(?:\r\n|\r|\n|\s)+/g,'');
              newMessage.title = text
              if (tcs.containsSpam(text))
              {
                  tcs.removeMessage(newMessage);
              }
          }
      }
  }
}

tcs.removeMessage = (message) =>
{
    tcs.censorCount++;
    if (message.className.indexOf('chat-line__message') < 0) return false;
    if (tcs.config.logMessages){
        console.log('removing message', message);
    }
    if (tcs.config.debugMode){
        message.style.border = '1px solid red';
        //message.style.display = 'none';
    }else{
        if (tcs.config.deleteInsteadOfHiding) {
            //tcs.log[0].removeChild(message);
            //message.remove();
            message.style.display = 'none';
        } else {
            message.style.display = 'none';
        }
    }
}

tcs.containsSpam = (text) =>
{
  if (text.length)
  {
      if (text.substr(0,1) == '!') {
          return true;
      }else if (tcs.checkAllCaps(text)) {
          return true
      }else if(tcs.checkBlackList(text)){
          return true
      }else if(tcs.checkR9k(text)){
          return true;
      }else{
          //if (tcs.config.logMessages) console.log('message allowed = "' + text + '"');
          return false;
      }
    }else{
        return true
    }
}

tcs.checkAllCaps = (text) =>
{
    var text = text.replace(/\s/g,'');
    var textLength = text.length;
    if (textLength < 2) return true;
    var amountUpperCaseInt = 0;
    for (var i = 0, len = textLength; i < len; i++)
    {
        var char = text[i];
        if (char === char.toUpperCase())
        {
            amountUpperCaseInt++;
        }
    }
    var percentageUpperCase = 100 - (textLength - amountUpperCaseInt) / textLength * 100;
    return percentageUpperCase >= 80;
}

tcs.checkBlackList = (text) =>
{
    for (var i = 0; i < tcs.blackList.length; i++)
    {
        var emote = tcs.blackList[i];
        if (text.indexOf(emote) > -1)
        {
            if (tcs.config.debugMode) console.log(text, 'Contains "' + emote + '" at position ', text.indexOf(emote));
            return true;
        }
    }
}

tcs.checkR9k = (text) =>
{
    if (tcs.config.r9k)
    {
        text = text.toUpperCase();
        if (tcs.r9klog.indexOf(text) > -1)
        {
            if (tcs.config.debugMode) console.log(text, 'Found in r9k log');
            return true;
        }
        for (var i = 0; i < tcs.r9klog.length; i++) {
            if (text.indexOf(tcs.r9klog[i]) > -1) {
                if (tcs.config.debugMode) console.log(text, 'Found in r9k log');
                return true;
            }
        }
        //if (tcs.config.debugMode) console.log(tcs.r9klog);
        tcs.r9klog.push(text);
        if (tcs.r9klog.length > tcs.config.r9k) tcs.r9klog.shift();
    }
}

tcs.createMessage = (text) =>
{
    var chat = document.querySelector('[role=log],.video-chat__message-list-wrapper ul');
    var msg = document.createElement('div');
    msg.className = 'chat-line__status';
    msg.attributes['data-a-target'] = 'chat-welcome-message';
    msg.innerText = text;
    console.log(text);
    if (chat) chat.append(msg);
}
(function(){
    tcs.createMessage('Twitch Chat Sanitizer ready.. Waiting for chat to load.');
    console.log(tcs)
    tcs.interval = setInterval(function(){
        tcs.log = document.querySelectorAll('[role="log"]');
        if (tcs.log.length > 0)
        {
            tcs.addListener(tcs.log[0]);
            clearInterval(tcs.interval);
        }
        else
        {
            tcs.log = document.querySelectorAll('.video-chat__message-list-wrapper ul');
            if (tcs.log.length > 0)
            {
                tcs.addListener(tcs.log[0]);
                clearInterval(tcs.interval);
            }
        }
    }, 250);
  
    if (document.location.protocol == 'https:' && document.location.href.indexOf('twitch.tv')>-1)
    {
/*        if (document.location.href.indexOf('popout')>-1 && document.location.href.indexOf('chat')>-1)
        {
            tcs.channel = document.location.pathname.split('/')[1];
        } else {
            tcs.channel = document.location.pathname.replace('/','');
        } else if(document.location.protocol == 'moz-extension:') {
            tcs.channel = document.location.search.split('=')[1]
        } */
    }

    tcs.getAllEmoteLists();
})();
