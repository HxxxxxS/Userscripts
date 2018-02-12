// ==UserScript==
// @name        NRK.no | Hide "apartments"
// @version     2
// @include     https://*.nrk.no/
// @author      h
// @grant       none
// @run-at      document-end
// @downloadURL https://raw.githubusercontent.com/HxxxxxS/Userscripts/master/nrk.no/HideApartments.user.js
// ==/UserScript==

(function(){

  'use strict';

  function appendStyle(styles) {
    var css = document.createElement('style');
    css.type = 'text/css';

    if (css.styleSheet) css.styleSheet.cssText = styles;
    else css.appendChild(document.createTextNode(styles));

    document.getElementsByTagName("head")[0].appendChild(css);
  }

  var styles  = '.kur-floor--apartment.aHidden{ padding-bottom:0; }';
      styles += '.kur-floor--apartment.aHidden div.kur-floor__content div{ display:none; }';
      styles += '.kur-floor--apartment.aHidden h2.kur-floor__title:after{ margin-left:15px; color: #dadada; content: "(Click to read)" }';

  window.onload = function() { appendStyle(styles) };

  var apts = document.getElementsByClassName('kur-floor--apartment');

  for (var i=0;i<apts.length;i++) {

    var apt = apts[i];

    apt.className += ' aHidden';

    apt.addEventListener("click", function(){
        this.classList.toggle('aHidden');
    });

  }

})();
