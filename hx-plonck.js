
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
let plonckselectiontags=document.getElementsByTagName('ploncktreeselection');
for (let i = 0; i < plonckselectiontags.length; i++) {
	let tag=plonckselectiontags[i];
	result.push(tag);
}
return result;
}

function buildPlonckTreeSelection () {
let plonckselectiontags=findPlonckTreeSelectionTags();
for (let i = 0; i < plonckselectiontags.length; i++) {
	let plonckforrestselectors=makePlonckForrestSelectorsHTML();
	let tag=plonckselectiontags[i];
	tag.innerHTML=`<label for="ploncktrees">Scenario:</label>
	<select id="ploncktreeselection${i}" name="ploncktrees" onchange="setPLONCKTREE('ploncktreeselection${i}')">${plonckforrestselectors}</select>`+tag.innerHTML;
}
}

document.addEventListener('DOMContentLoaded', buildPlonckTreeSelection); 

function recursiveFindPlonckPath(currentploncktree,plonckpath) {
let ploncktreeobject=PLONCKFORREST[currentploncktree];	

if (plonckpath in ploncktreeobject) {
	return ploncktreeobject[plonckpath];	
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
		let foundurl=recursiveFindPlonckPath(parents[i],plonckpath);
		if (foundurl=='') {
			// else proceed to next parent
			continue;
		}
		return foundurl;
	}
} else { 
	// the implicite lookup case of the default root parent 
	return recursiveFindPlonckPath('*',plonckpath)	;
}
}

function findPlonckPath(currentploncktree,plonckpath) {
path=recursiveFindPlonckPath(currentploncktree,plonckpath);

if (path=='') {
	// Todo: add visual error at HTMX-tag
	console.error("Plonck-error: Plonck path '" + plonckpath + "' not found in plonck tree "+currentploncktree+" and parent trees");
	// just return empty path to trigger HTMX
}
return path
}

htmx.defineExtension('plonck', {
onEvent : function(name, evt) {
	console.log("Fired event before: " + name, evt);

	if (evt.type!='htmx:configRequest') {
		return ;
	}

	let originalpath = evt.detail.path;
	if (!originalpath.endsWith('@plonck')) {
		return ;
	}
	plonckkey=originalpath.slice(0,-7);

	let currentploncktree=PLONCKTREE;
	let hx_ploncktree_attr=evt.detail.elt.attributes.getNamedItem('hx-ploncktree');
	if (hx_ploncktree_attr) {
		currentploncktree=hx_ploncktree_attr.value
	}
		
	evt.detail.path=findPlonckPath(currentploncktree,plonckkey);
	
	console.log("Found path: " + evt.detail.path);
}
})
