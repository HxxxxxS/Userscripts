// ==UserScript==
// @name        NRK.no | Hide "apartments"
// @version     1.1
// @include     https://*.nrk.no/
// @author      h
// @grant       none
// @require     https://code.jquery.com/jquery-3.3.1.min.js
// @run-at      document-end
// @downloadURL https://raw.githubusercontent.com/HxxxxxS/Userscripts/master/nrk.no/HideApartments.user.js
// ==/UserScript==

jQuery(document).ready(function($){
  
  $('head').append('<style>.kur-floor--apartment.aHidden{ padding-bottom:0; }')
  $('head').append('<style>.kur-floor--apartment.aHidden div.kur-floor__content div{ display:none; }')
  $('head').append('<style>.kur-floor--apartment.aHidden h2.kur-floor__title:after{ margin-left:15px; color: #dadada; content: "(Click to read)" }')

  $('.kur-floor--apartment:has(h2.kur-floor__title)').addClass('aHidden');

  $('.kur-floor--apartment').on('click', function(){
    $(this).toggleClass('aHidden');
  });
  
});
