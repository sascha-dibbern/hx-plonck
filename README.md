# hx-plonck
A HTMX extension to support a __[protovibe](https://github.com/sascha-dibbern/protovibe)__ based prototyping of single page web-applications (SPA) through abstracting HTMX target-paths

## Introduction
This HTMX-extension helps to create a prototype SPA (single page web-application) by embedding the possibility of enabling multiple use-case scenarios into the prototype. This is a feature that follows the approach of visual & behavioural prototyping of a SPA as defined in __[protovibe](https://github.com/sascha-dibbern/protovibe)__.
Use-case scenarios of a prototype SPA, ie. the manipulation of behaviour, define how HTMX-actions are applied to the in-memory web-page & DOM in the webbrowser. The web-page state is changed depending on the action taken. In a normal the HTMX-approach of SPA-development the HTMX-actions use a given HTMX request-path to retrieve a html-artifact. This html-artifact will be placed in or replace parts of the web-browser in-memroy SPA web-page. The web-page state has then changed, and the change is shown to the user visually. 

The mechanism of the hx-plonck HTMX-extension allows the use of __abstracted HTMX request-paths__ to translate them to real HTMX request-paths. Given a choosen scenario-context as an input the __abstracted HTMX request-paths__ will be translated to the real URI-paths for HTMX to use. A scenario can be seen a set of possible use-cases that can be applied to a SPA in it's current state.
The outcome of the prototyped SPA-emulation will be controllable by a given input of a scenario choice. This provides the means for the SPA prototype to emulate the visualization and the behaviour expected in the way it follows the HATEOAS school of thought.

## Defintions
 * __abstracted HTMX request-path__ is a HTMX-tag path, that is formatted as "...@plonck". This abstracted path will translated in hx-plonck to a real URI to be interpreted by HTMX further in the process.
 * __plonck-forrest__ is a java-script hash-map that define the mapping between various scenarios and the plonck trees representing the outcome of the given scenarios
 * __plonck-tree__ is a java-script hash-map that defines the mapping between the abstract paths and the html-fragment URIs. A plonck-tree is named by a __scenario__
 * __[protovibe](https://github.com/sascha-dibbern/protovibe)__ is a process to prototype single page web-applications in regard to visualization and behaviour
 * __scenario__ is the means to define a set of one or more use-cases applicable to use-case situations to a SPA. A __scenario__ is in hx-plonck the name of a given __plonck-tree__.

## Usage

Import HTMX and hx-plonck.js to use the hx-plonck features in the SPA-prototype page:

    <html> ...
      <body>
	    <script src="https://unpkg.com/htmx.org@1.9.10"></script>
	    <script src="hx-plonck.js"></script>
        ...

Define the values for current plonck-tree to start the prototype and the plonck-forrest of scenarios for all outcomes:

    <script>
        var PLONCKTREE='*'; // Current plonck-tree when the SPA is started
        var PLONCKFORREST={
	        '*' : // the baseline scenario and default tree named '*'
	            {
		            'add-item-to-basket' : 'item-in-basket.html',
		            'remove-item-from-basket' : 'remove-item.html',
                    ...
	            },
	        'out of stock scenario' : // This tree inherits from '*', so some paths can be overridden
	            {
		            'add-item-to-basket' : 'out-of-stock-message.html',
	            },
	        'out of stock scenario, but offer later delivery' : // This tree inherits from 'out of stock scenario'
	            {
                    '@' : 'out of stock scenario', // This entry is not a scenario but a inheritance reference ('@' used as inheritance symbol) to the scenario 'out of stock scenario'
		            'show later deliver offer' : 'later-deliver-offer-message.html',
	            }
            };
    </script>

The scenario plonck-tree called `'*'` is the baseline scenario for the SPA prototype. Other scenarios (plonck-trees) will per default inherit from `*` as the plonk-tree `'out of stock scenario'` does here. 
Each scenario plonck-tree will have multiple entries, that are mappings between the __abstracted HTMX request-path__ (hash-map key) and the real HTMX request-path (hash-map value). As an exception to that rule the hash-map key `'@'` is used to define an explicite inheritance of an scenario plonck-tree (child) to another scenario plonck-tree (parent).
Inherited scenario plonck-trees will have every HTMX request-path mapping from it's parent. These can then be overridden in the child plonk-tree if necessary to fullfill the scenario context.
Multiple inheritance is also possible and would look like

    'a complex scenario' : 
        {
            '@' : [ 'low-priority scenario', 'high-priority scenario' ],
            ...
        }

In that case request-mapings from 'high-priority scenario' will override request-mapings from 'low-priority scenario' too.
