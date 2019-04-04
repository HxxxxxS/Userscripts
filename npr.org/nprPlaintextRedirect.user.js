// ==UserScript==
// @name         npr.org | choice.npr.org -> text.npr.org redirect
// @description  Automatically redirects to the plaintext version of NPR.org when prompted
// @author       HxxxxxS @ https://github.com/HxxxxxS/
// @match        https://choice.npr.org/index.html
// @downloadURL  https://raw.githubusercontent.com/HxxxxxS/Userscripts/master/npr.org/nprPlaintextRedirect.user.js
// ==/UserScript==

console.log('Redirecting to plaintext version at ' + document.querySelector('a#textLink').href);
window.location = document.querySelector('a#textLink').href;
