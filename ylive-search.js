/**
 * Youtube Live Search
 * 
 * Search in real time for youtube videos using google ajax library,
 * youtube thumbnail changer and auto-suggest
 *
 * Used scripts in this extension:
 * - Youtube Thumbs by hilmilho - https://chrome.google.com/extensions/detail/hblnelkomckokmpmjhphihjdbedjniak
 * - Fast YouTube Search by cleanrot - https://chrome.google.com/extensions/detail/ggkljdkflooidjlkahdnfgodflkelkai
 *
 * 
 * Copyright (c) 2010 Lucas Monteverde <monteverde13@yahoo.com.br>
 * 
 * This program is free software: you can redistribute it and/or modifysqu
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * 
**/

google.load("search", "1");

const site = {
	youtube: [ /.*v=(.+?)\&.*/, '<iframe class="youtube-player" type="text/html" width="660" height="405" src="http://www.youtube.com/embed/$1" allowscriptaccess = "true" frameborder="0"></iframe>' ],
	google_video: [/.*docid=(.+?)\&.*/, '<embed id="VideoPlayback" src="http://video.google.com/googleplayer.swf?docid=$1" style="width:660px;height:405px" allowFullScreen="true" type="application/x-shockwave-flash"></embed>' ]
};

var StorageManager = {
	save : function(local,value){
		localStorage[local] = JSON.stringify({
			data   : value,
			expires: +new Date + 1000 * 60 * 1
		});
	},

	load : function(data){
		if( !localStorage[data]) return
		var storage = JSON.parse(localStorage[data]);
		if(storage && storage.expires >= +new Date){
			return storage.data;
		}else return;
	}
}

function OnLoad() {
	var container,searchForm, searchBox, open_video = false, formheight = "48px";
	var searchControl = new google.search.SearchControl();
	
	options = new google.search.SearcherOptions();
	options.setExpandMode(google.search.SearchControl.EXPAND_MODE_OPEN);
	options.setNoResultsString("Nothing Found");

	searchControl.addSearcher(new google.search.VideoSearch(), options);
	searchControl.setSearchCompleteCallback(this, searchComplete);
	//searchControl.setTimeoutInterval(google.search.SearchControl.TIMEOUT_SHORT);
	
	setBoxSearch();
	
	function searchComplete(){
		var node = document.links;
		for (var i=0; i<node.length; i++) {
			node[i].addEventListener("click",ajaxLink,false);
		}
		
		document.addEventListener('mouseover', mo, false);
		if(searchBox.value)
			StorageManager.save("last_search",searchBox.value);
		document.body.style.height = 0;
	}
	
	function setBoxSearch(value){
		container = document.getElementById("container");
		container.style.width = "300px";
		
		searchControl.draw(container);
		
		open_video = false;
		localStorage["open_video"] = false;
		
		searchForm = document.getElementsByTagName('form')[0];
		var cleanButton = searchForm.getElementsByTagName('div')[0];
		var searchInputs = searchForm.getElementsByTagName('input');
		
		searchBox = searchInputs[0];
		
		searchInputs[1].addEventListener("click",submeter,false);
		cleanButton.addEventListener("click",submeter,false);
		searchBox.addEventListener("keyup",keyUp,false);
		
		searchBox.focus();
		O(searchBox);
		
		if(localStorage["open_video_url"]){
			var obj = document.createElement('a');
			obj.innerText = "Last Video"; //
			obj.href = localStorage["open_video_url"];
			obj.id = "last_video";
			obj.target = "_self";
			searchForm.appendChild(obj);
			searchComplete();
		}

		searchForm = searchForm.style;

		if(!value) value = StorageManager.load("last_search");
		if(value) searchControl.execute(value);
	}
	
	function ajaxLink(e){
		if(e.button == 1) return true;
		var link = this.href;
		if(!link) link = this.parentNode.href;
		link = decodeURIComponent(link);
		
		for(var i in site){
			var expr = new RegExp(site[i][0]);
			if( expr.test( link )){
				var embed = link.replace( expr, site[i][1] );
				var id = link.replace( expr, "$1" );
				break;
			}
		}
		if(!embed) return true;

		var video_container = document.getElementsByTagName('div')[4];
		video_container.innerHTML = embed;
		
		var video_info  = getVideoInfo(this,id);
		if(video_info) video_container.appendChild( video_info );
		else video_container.style.display = "block";
		if(document.getElementById("last_video"))
		document.getElementById("last_video").style.display = "none";

		container.style.width = "660px";
		open_video = true;
		localStorage["open_video"] = true;
		localStorage["open_video_url"] = link;
		
		e.preventDefault();
		return false;
	}
	
	function keyUp(e){
		if(open_video){
			if(e.keyCode == 13) setBoxSearch(this.value); //enter
		}else if(this.value){
			searchControl.cancelSearch()
			searchControl.execute();
		}else searchControl.clearAllResults();
	}
	
	function submeter(e){
		if(open_video){
			setBoxSearch( searchBox.value);
		}
	}
	
	function getVideoInfo(element,id){
		if(element.className != "gs-title"){
			element = element.parentNode.parentNode.parentNode.getElementsByClassName('gs-title')[1];
		}
		if(!element) return false; //fix-to: ultimo video aberto
		var url = decodeURIComponent(element.href);
		
		var info = {
			nome: element.innerText,
			link: /youtube/.test( url ) ? "http://youtu.be/"+ id : "http://video.google.com/videoplay?docid="+ id,
			desc: element.parentNode.parentNode.childNodes[1].innerText
		}
		
		var video_info = document.createElement('div');
		video_info.setAttribute("id","video_info");
		video_info.innerHTML =  '<h3><a href="' + info.link + '" title="' + info.nome + '" target="_blank">' + info.nome + '</a></h3>' +
								'<p>' + info.desc + '</p>' +
								'<p><a href="' + info.link + '" title="' + info.link + '" target="_blank">' + info.link + '</a><p>';
		
		return video_info;

	}

	function O(g){var c=this;var A=null;var o="";c.d=null;var f= -1;var j=0;var C=false;c.G=function(){g.addEventListener("keydown",c.L,false);g.addEventListener("keyup",c.K,false);g.addEventListener("blur",c.H,false);},c.getData=function(m){var URL="http://suggestqueries.google.com/complete/search?%20hl=en&ds=yt&json=t&jsonp=callbackfunction&q="+m;var l;l=new XMLHttpRequest();l.open("GET",URL,true);l.onreadystatechange=function(){if(l.readyState==4){if(l.status==200){var response;if(o==m){if(c.d==null){c.d=document.createElement("div");document.body.appendChild(c.d);c.d.style.display='none';}c.d.setAttribute("class","fd");c.d.style.width=(g.clientWidth)+"px";c.F();c.d.innerHTML="";var D=l.responseText;var v=D.substring(new String("callbackfunction").length+1);var v=v.substring(0,v.length-1);var M=JSON.parse(v);c.d.style.display='block';var list=M[1];j=list.length;if(j>8)j=8;for(var i=0;i<j;i++){var r=list[i];var row=document.createElement("div");var pos=r.indexOf(m);if(pos!= -1){row.innerHTML=r.substr(0,pos+m.length)+"<b>"+r.substr(pos+m.length)+"</b>";}else{row.textContent=r;}row.setAttribute("id","gffg"+i);row.setAttribute("class","gffg");row.index=i;row.J=true;row.addEventListener("mouseover",function(e){var row=e.currentTarget;if(f!= -1)document.getElementById("gffg"+f).setAttribute("class","gffg");row.setAttribute("class","gffg selected");f=row.index;},false);row.addEventListener("mousedown",function(e){var row=e.currentTarget;g.value=row.textContent;c.B(row.textContent);},false);c.d.appendChild(row);}f= -1;I=27+j*17;if(j==0){c.d.style.display='none';searchForm.height=formheight;C=false;}else{c.d.style.display='block';searchForm.height=I+"px";C=true;}}}}};l.send("");};c.K=function(e){var keyCode=e.keyCode;if(keyCode!=13){if((keyCode!=38)&&(keyCode!=40)&&(keyCode!=116)){if(A!=null){window.clearInterval(A);A=null;}o=g.value;A=setTimeout(c.getData,10,g.value)}else{}}else{}},c.L=function(e){var keyCode=e.keyCode;if(keyCode==13){if(f!= -1){g.value=document.getElementById("gffg"+f).textContent}c.B(g.value);return;}if((keyCode!=38)&&(keyCode!=40)){}else{if(keyCode==38){if(f!= -1)document.getElementById("gffg"+f).setAttribute("class","gffg");f--;if(f<0)f=j-1;}else{if(f!= -1)document.getElementById("gffg"+f).setAttribute("class","gffg");f++;if(f>=j)f=0;}var row=document.getElementById("gffg"+f);row.setAttribute("class","gffg selected");g.value=row.textContent;}};c.H=function(e){if(e.explicitOriginalTarget!=c.d){o="--";if(c.d!=null){c.d.style.display='none';searchForm.height=formheight;}}},c.F=function(){var k=g;var x=0;var y=g.offsetHeight-1;while((k.offsetParent)&&(k.tagName.toLowerCase()!='body')){x+=k.offsetLeft;y+=k.offsetTop;k=k.offsetParent;}x+=k.offsetLeft;y+=k.offsetTop;if(c.d!=null){c.d.style.left=x+"px";c.d.style.top=y+"px";}},c.B=function(m){o="--";if(c.d!=null){c.d.style.display='none';searchForm.height=formheight;if(open_video)submeter();else searchControl.execute();}};c.G();}

}

google.setOnLoadCallback(OnLoad);