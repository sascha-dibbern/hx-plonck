
// Todo
// 1) Add idempotency calls -> run htmx only once

function setPLONCKTREE(selectorid) {
let field = document.getElementById(selectorid);
PLONCKTREE=field.value;
}

function makePlonckForrestSelectorsHTML() {
const sortedPloncktreeNames = Object.keys(PLONCKFORREST).sort();
var result="";
for (let i = 0; i < sortedPloncktreeNames.length; i++) {
	let ploncktreename=sortedPloncktreeNames[i];
	let selector=`<option value="${ploncktreename}">${ploncktreename}</option>\n`;
	result=result+selector;
}
return result;
}

function findPlonckTreeSelectionTags() {
let result=[];
let plonkselectiontags=document.getElementsByTagName('ploncktreeselection');
for (let i = 0; i < plonkselectiontags.length; i++) {
	let tag=plonkselectiontags[i];
	result.push(tag);
}
return result;
}

function buildPlonckTreeSelection () {
let plonkselectiontags=findPlonckTreeSelectionTags();
for (let i = 0; i < plonkselectiontags.length; i++) {
	let plonkforrestselectors=makePlonckForrestSelectorsHTML();
	let tag=plonkselectiontags[i];
	tag.innerHTML=`<label for="ploncktrees">Scenario:</label>
	<select id="ploncktreeselection${i}" name="ploncktrees" onchange="setPLONCKTREE('ploncktreeselection${i}')">${plonkforrestselectors}</select>`+tag.innerHTML;
}
}

document.addEventListener('DOMContentLoaded', buildPlonckTreeSelection); 

function recursiveFindPlonckPath(currentploncktree,plonkpath) {
let ploncktreeobject=PLONCKFORREST[currentploncktree];	

if (plonkpath in ploncktreeobject) {
	return ploncktreeobject[plonkpath];	
}

if (currentploncktree=='*') {
	// recursion can not go deeper
	return "";
}

if ('@' in ploncktreeobject) { 
	// The explicite parent(s) case for lookup
	let parents=ploncktreeobject['@'];
	
	// Single parent case
	if (! Array.isArray(parents)) {
		parents=[ploncktreeobject['@']];
	}

	
	for (let i = 0; i < parents.length; i++) {
		let foundurl=recursiveFindPlonckPath(parents[i],plonkpath);
		if (foundurl=='') {
			// else proceed to next parent
			continue;
		}
		return foundurl;
	}
} else { 
	// the implicite lookup case of the default root parent 
	return recursiveFindPlonckPath('*',plonkpath)	;
}
}

function findPlonckPath(currentploncktree,plonkpath) {
path=recursiveFindPlonckPath(currentploncktree,plonkpath);

if (path=='') {
	// Todo: add visual error at HTMX-tag
	console.error("Plonck-error: Plonck path '" + plonkpath + "' not found in plonk tree "+currentploncktree+" and parent trees");
	// just return empty path to trigger HTMX
}
return path
}

htmx.defineExtension('plonk', {
onEvent : function(name, evt) {
	console.log("Fired event before: " + name, evt);

	if (evt.type!='htmx:configRequest') {
		return ;
	}

	let originalpath = evt.detail.path;
	if (!originalpath.endsWith('@plonk')) {
		return ;
	}
	plonkkey=originalpath.slice(0,-6);

	let currentploncktree=PLONCKTREE;
	let hx_ploncktree_attr=evt.detail.elt.attributes.getNamedItem('hx-ploncktree');
	if (hx_ploncktree_attr) {
		currentploncktree=hx_ploncktree_attr.value
	}
	
	//ploncktreeobject=PLONCKFORREST[currentploncktree];
	//evt.detail.path=ploncktreeobject[plonkkey]		
	evt.detail.path=findPlonckPath(currentploncktree,plonkkey);
	
	console.log("Found path: " + evt.detail.path);
}
})
