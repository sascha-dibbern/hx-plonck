//
// Origin: https://github.com/sascha-dibbern/hx-plonck
// Version: v0.7.x
// Author: Sascha dibbern
// License: BSD 3-Clause License (see https://github.com/sascha-dibbern/hx-plonck)
//
// Ideas
// 1) Add idempotency calls -> run htmx only once
// 2) '*'-globbing in abstract-path for override all/selected inherited paths
// 3) handling of 'futures'

let PLONCK_ID_COUNTER=0;

/*
 * Plonk tree handling
 */
function setPLONCKTREE(selectorid) {
    let field = document.getElementById(selectorid);
    PLONCKTREE=field.value;
}

function makePlonckForrestSelectorsHTML() {
    const sortedPloncktreeNames = Object.keys(PLONCKFOREST).sort();
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
	    tag.innerHTML=`<label for="ploncktrees">Scenario:</label><select id="ploncktreeselection${i}" name="ploncktrees" onchange="setPLONCKTREE('ploncktreeselection${i}')">${plonckforrestselectors}</select>`+tag.innerHTML;
    }
}

document.addEventListener('DOMContentLoaded', buildPlonckTreeSelection); 

/*
 * Handling path mapping
 */

function recursiveFindPlonckPath(currentploncktree,plonckpath) {
    let ploncktreeobject=PLONCKFOREST[currentploncktree];	

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
	    return recursiveFindPlonckPath('*',plonckpath);
    }
}

function findPlonckPath(currentploncktree,plonckpath) {
    path=recursiveFindPlonckPath(currentploncktree,plonckpath);

    if (path=='') {
	    // Todo: add visual error at HTMX-tag
	    console.error("Plonck-error: Plonck path '" + plonckpath + "' not found in plonck tree "+currentploncktree+" and parent trees");
	    // just return empty path to trigger HTMX
    }
    return path;
}

/*
 * Handling tag substitution
 */
 
function parsePkRuleDefs(elt) {
	let pktags = {};
	let pktags_attr = elt.attributes.getNamedItem("pk-tags");
	
	// Case: Undefined "pk-tags" attribute => no tags used 
	if (pktags_attr === null) {
		return pktags;
	}
	
	let pktags_ruledefs = elt.attributes.getNamedItem("pk-tags").value.split(",");
	pktags_ruledefs.map( (rule) => {
		let ruleparts = rule.split("=");
		if (ruleparts.length<2) {
			console.log("Illegal 'pk-tags'-attribute rule-defintion. Needs a '='");
			return {};
		}
		let tag = ruleparts[0];
		let logic = ruleparts[1];
		let logicparts = logic.split(":");
		let tagsubstitution = logicparts[0];
		let substmechanism = "direct";
		if (logicparts.length>1) {
			substmechanism = logicparts[1];
		}
		pktags[tag] = {
			'tagsubstitution' : tagsubstitution,
			'substmechanism' : substmechanism
		};		
	});
	return pktags;
}

let PLONCK_TAGS_SEQUENCES = {};

function handlePkTagRule(pktag,logic,text) {
	let tagsubstitution = logic['tagsubstitution'];
	let substmechanism = logic['substmechanism'];
	
	// Direct substitution
	if (logic['substmechanism'] == "direct") {
		let result = text.replaceAll("%"+pktag+"%",tagsubstitution);
		return result;
	}
	
	/*
     * Sequence substitutions
	 * Tags that are participating in identity sequences
     */
	
    if (! (pktag in PLONCK_TAGS_SEQUENCES))	{
		PLONCK_TAGS_SEQUENCES[pktag] = 0;
	}
	
	let seq_subst = false;
	let seq_value = 0; 
	
	// Next item in sequence substitution
	if (substmechanism == "++") {
		seq_value = ++PLONCK_TAGS_SEQUENCES[pktag];
		seq_subst = true;
	}

	// Previous item in sequence substitution
	if (substmechanism == "--") {
		seq_value = --PLONCK_TAGS_SEQUENCES[pktag];
		seq_subst = true;
	}

	// Previous item in sequence substitution and deletion after countdown
	if (substmechanism == "--!") {
		seq_value = PLONCK_TAGS_SEQUENCES[pktag]
		if (PLONCK_TAGS_SEQUENCES[pktag] >0) {
			seq_value = --PLONCK_TAGS_SEQUENCES[pktag];
		}
		if (seq_value <= 0) {
			return "";
		}
		seq_subst = true;
	}
	
	// Current item in sequence substitution
	if (substmechanism == "#") {
		seq_value = PLONCK_TAGS_SEQUENCES[pktag];
		seq_subst = true;
	}
	
	// Previous item in sequence substitution but no change in counter
	if (substmechanism == "-") {
		seq_value = PLONCK_TAGS_SEQUENCES[pktag]-1;
		seq_subst = true;
	}

	// Substitue with a sequence-value
	if (seq_subst) {
		let result = text.replaceAll("%"+pktag+"%",tagsubstitution + seq_value);
		return result;
	}
	
	return text;
}

function handlePkTags(text,elt) {
	let pktagrules = parsePkRuleDefs(elt);
	let result = text;
	for (pktag in pktagrules) {
		logic = pktagrules[pktag];
		result = handlePkTagRule(pktag,logic,result);
	}
	return result;
}


/*
 * Main
 */

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
        PLONCK_ID_COUNTER++;
		
	    let currentploncktree=PLONCKTREE;
	    let hx_ploncktree_attr=evt.detail.elt.attributes.getNamedItem('hx-ploncktree');
	    if (hx_ploncktree_attr) {
		    currentploncktree=hx_ploncktree_attr.value;
	    }
		
	    evt.detail.path=findPlonckPath(currentploncktree,plonckkey);
	
	    console.log("Found path: " + evt.detail.path);
    },
	transformResponse : function(text, xhr, elt) {
	    console.log("transformResponse: ", xhr, elt);
		
		let result = handlePkTags(text,elt);

		return result;
	}
});
