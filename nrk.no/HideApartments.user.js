// ==UserScript==
// @name        NRK.no | Hide "apartments"
// @version     1
// @include     https://*.nrk.no/
// @author      h
// @grant       none
// @require     https://code.jquery.com/jquery-3.3.1.min.js
// @run-at      document-end
// @downloadURL https://raw.githubusercontent.com/HxxxxxS/Userscripts/master/nrk.no/HideApartments.user.js
// ==/UserScript==

jQuery(document).ready(function($){
  
  $('head').append('<style>.kur-floor--apartment.aHidden div.kur-floor__content div{ display:none; }')
  $('head').append('<style>.kur-floor--apartment.aHidden{ padding-bottom:0; }')

  $('.kur-floor--apartment:has(h2.kur-floor__title)').addClass('aHidden').find('h2.kur-floor__title').append('<small style="margin-left:15px; margin-top:3px; color: #dadada;">(Click to read)</small>');

  $('.kur-floor--apartment').on('click', function(){
    $(this).toggleClass('aHidden');
  });
  
});
