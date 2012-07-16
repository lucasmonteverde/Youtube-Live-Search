// ==UserScript==
// @name           Youtube Thumbs
// @namespace      meh
// @description    mouseover to animate thumbs
// @include        http://www.youtube.com*
// @exclude        http://www.youtube.com/videos*
// ==/UserScript==

const LOOP_INTERVAL = 1000; // 1000 = 1 second
var loopHandler, img, imgs;

function mo(evt){
	if( evt.target.nodeName=='IMG' && evt.target.getAttribute('src') && evt.target.getAttribute('src').search(/default\.jpg$/)>-1 ){
		start(evt);
		evt.target.addEventListener('mouseout', end, false);
	}
}

function start(evt){
	img = evt.target;
	img.setAttribute('src', img.getAttribute('src').replace(/\/[^\/]+\.jpg$/, '/1.jpg'));
	loopHandler = setInterval(loop, LOOP_INTERVAL);
}

function loop(){
	var num = parseInt( img.getAttribute('src').match(/(\d)\.jpg$/)[1] );
	if(num==3) num = 1;
	else num++;
	img.setAttribute('src', img.getAttribute('src').replace(/\d\.jpg$/, +num+'.jpg')); // 0mg, hax0rz!!!
}

function end(evt){
	clearInterval(loopHandler);
	evt.target.setAttribute('src', img.getAttribute('src').replace(/\/[^\/]+\.jpg$/, '/default.jpg'));
	img = null;
}