// ==UserScript==
// @name         Twitch Chat Sanitizer
// @version      1
// @description  removes idiocy
// @author       HxxxxxS @ https://github.com/HxxxxxS/
// @author       Based on https://greasyfork.org/en/scripts/40811-twitch-chat-deretardifier by hello_frenz
// @match        https://www.twitch.tv/*
// @grant        none
// @downloadURL  https://raw.githubusercontent.com/HxxxxxS/Userscripts/master/twitch.tv/TwitchChatSanitizer.user.js
// ==/UserScript==

// Todo: Script won't work after changing channel through Twitch's native ajax calls. Must CTRL+R after changing channel.

// ==== Settings start ====

// Messages containing these words will not be shown. Note that spaces are removed before checking this list.
var blackList = [
    'monkaS', 'Saknom', 'POGGERS', 'FeelsAmazingMan',
    'OMEGALUL', 'KKona', 'PepePls', '!subhype', 'gachi',
    'sourpls', 'pepo', 'happyfooty', '<messagedeleted>',
    'ezclap', '(ditto)'
];

// If a message is already posted in the X last chat messages it will not be shown again.
var r9k = 100;

// Set debugMode to true and messages will be highlighted red instead of removed.
var debugMode = false;
// Set logMessages to true and the messages marked as spam will be logged in the console.
var logMessages = false;

// ===== Script start =====

(function() {
    'use strict';

    var censorCount = 0;
    var log;
    var r9klog = [];
    var interval = setInterval(function() {
        log = document.querySelectorAll('[role="log"]');
        if (log.length > 0)
        {
            addListener(log[0]);
            clearInterval(interval);
        }
        else
        {
            log = document.querySelectorAll('.video-chat__message-list-wrapper ul');
            if (log.length > 0)
            {
                addListener(log[0]);
                clearInterval(interval);
            }
        }
    }, 250);

    function addListener (log) {
        var observer = new MutationObserver(checkMessage);
        observer.observe(log, {childList: true});
        createMessage('Twitch Chat Sanitizer is now active.');
    }

    function checkMessage (mutation) {
        for (var i = 0; i < mutation.length; i++)
        {
            var newMessage = mutation[i].addedNodes[0];
            if (newMessage)
            {
                var text = newMessage.innerText.replace(/(?:\@[\w\d]+)*/g,'').replace(/(?:\r\n|\r|\n|\s)+/g,'');
                text = text.substr(text.indexOf(':') + 1);
                if (containsSpam(text))
                {
                    censorCount++;
                    if (debugMode){
                        newMessage.style.border = '1px solid red';
                    }else{
                        newMessage.style.display = 'none';
                    }

                    if (logMessages){
                        console.log('message removed = ' + text);
                    }
                }
            }
        }
    }

    function containsSpam (text) {
        if (text.length)
        {
            if (checkAllCaps(text))
            {
                return true;
            }
            else if (checkBlackList(text))
            {
                return true;
            }
            else if (checkR9k(text))
            {
                return true;
            }
            else if (logMessages)
            {
                console.log('message allowed = "' + text + '"');
                return false;
            }
        }
        else
        {
            return true
        }
    }

    function checkAllCaps (text) {
        var textLength = text.length;
        if (text.replace(/\s/g,'').length < 2) return true;
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

    function checkBlackList (text)
    {
        for (var i = 0; i < blackList.length; i++)
        {
            var emote = blackList[i].toUpperCase();
            if (text.toUpperCase().indexOf(emote) > -1)
            {
                if (debugMode) console.log(text, 'Contains "' + emote + '" at position ', text.toUpperCase().indexOf(emote));
                return true;
            }
        }
    }

    function checkR9k(text) {
        text = text.toUpperCase();
        if (r9k)
        {
            if (r9klog.indexOf(text) > -1)
            {
                if (debugMode) console.log(text, 'Found in r9k log');
                return true;
            }
            if (debugMode) console.log(r9klog);
            r9klog.push(text);
            if (r9klog.length > r9k) r9klog.shift();
        }
    }

    function createMessage(text){
        var chat = document.querySelector('[role=log]');
        var msg = document.createElement('div');
        msg.className = 'chat-line__status';
        msg.attributes['data-a-target'] = 'chat-welcome-message';
        msg.innerText = text;
        console.log(text);
        if (chat) chat.append(msg);
    }

    createMessage('Twitch Chat Sanitizer ready.. Waiting for chat to load.');
})();
