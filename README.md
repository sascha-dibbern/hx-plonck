# hx-plonck
A HTMX extension to support a __[protovibe](https://github.com/sascha-dibbern/protovibe)__ based prototyping of single page web-applications (SPA).

## Disclaimer
This code and documentation is still experimental and major conceptual changes can be expected. Use a tagged version for having a workable baseline.

## Introduction
This HTMX-extension helps to create a prototype SPA (single page web-application) by embedding the possibility of enabling multiple use-case scenarios into a SPA prototype and emulate a final product behaviour without any backend coding. This feature follows the approach of visual & behavioural prototyping of SPAs as defined in __[protovibe](https://github.com/sascha-dibbern/protovibe)__.
Use-case scenarios of a prototype SPA, ie. the definition of behaviours, define how HTMX-actions are applied in a given context to the in-memory web-page & DOM in the webbrowser. The web-page state is changed depending on the action taken. In the normal HTMX-approach of SPA-development the HTMX-actions use a given HTMX request-path to retrieve a html-fragment. This html-fragment will be placed in or replace parts of the web-browser in-memroy SPA web-pages DOM. As the web-page's internal state changed the webbrowser will show to the user the effect visually. So what you see is what is (WYSIWI).

The hx-plonck HTMX-extension mechanisms allow a better SPA-prototyping by introducing following concepts to HTMX processing:
 * path abstraction: the use of __abstracted HTMX request-paths__ to translate that to real HTMX request-paths. Given a choosen scenario-context as an input the __abstracted HTMX request-paths__ will be translated to the real URI-paths for HTMX to use. A scenario can be seen a set of possible use-cases that can be applied to a SPA in it's current state.
 * scenario management: The outcome of prototyped SPA-emulations will be controllable in the context of a given scenario choice. This provides the means for the SPA prototype to emulate the visualization and the behaviour expected in a way that follows the HATEOAS school of thought.
 * content identities: as the usage of the SPA prototype generates it's visio-behavioural state, the page fragments generated will have an identity, that enables additional rcossreferencing and fragment lifecycle control
 
## Defintions
 * __abstracted HTMX request-path__ is a HTMX-tag path, that is formatted as "...@plonck". This abstracted path will translated in hx-plonck to a real URI to be interpreted by HTMX further in the process.
 * __plonck-forest__ is a java-script hash-map that define the mapping between various scenarios and the plonck trees representing the outcome of the given scenarios
 * __plonck-tree__ is a java-script hash-map that defines the mapping between the abstract paths and the html-fragment URIs. A plonck-tree is named by a __scenario__
 * __plonck-tag__ is a placeholder for later dynamically replacement of a generated identity value
 * __[protovibe](https://github.com/sascha-dibbern/protovibe)__ is a process to prototype single page web-applications in regard to visualization and behaviour
 * __scenario__ is the means to define a set of one or more use-cases applicable to use-case situations to a SPA. A __scenario__ is in hx-plonck the name of a given __plonck-tree__.


## Usage

### 1. Required components
Import HTMX and hx-plonck.js to use the hx-plonck features in the SPA-prototype page:

    <html> ...
      <body>
	    <script src="https://unpkg.com/htmx.org@1.9.10"></script>
	    <script src="hx-plonck.js"></script>
        ...

### 2. Definition of the plonck-trees based scenarios by an inheritance model
The global Javascript variable `PLONCKFOREST` defines the collection of plonck-trees that make out the set of scenarios to be emulated.

`PLONCKTREE` is defined as the global Javascript variable for the start-scenario of plonck-forest when the SPA is loaded:

    <script>
        var PLONCKTREE='*'; // The current plonck-tree (selected scenario) when the SPA is started
        var PLONCKFOREST={
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
		          'add-item-to-basket' : 'later-deliver-offer-message.html',
	            }
            };
    </script>

#### Scenario inheritance

The scenario plonck-tree called `'*'` is the baseline scenario for the SPA prototype. Other scenarios (plonck-trees) will per default inherit from `*` as the plonck-tree `'out of stock scenario'` does here. 

Each child scenario plonck-tree can have hash-map key `'@'`, which, when used, defines an explicite inheritance of this scenario plonck-tree from another parental scenario plonck-tree.

#### Multiple inheritance

Multiple inheritance is also possible and would look like

    'a compounded scenario' : 
        {
            '@' : [ 'high-priority scenario', 'low-priority scenario' ],
            ...
        }

In that case explicite defined request-mapings from 'high-priority scenario' will override the request-mapings from 'low-priority scenario' too.

### 3. Scenario based path mapping

Each scenario plonck-tree will have multiple entries of path mappings. These are mappings between the __abstracted HTMX request-path__ (the hash-map key) and the real HTMX request-path (hash-map value). 
Inherited scenario plonck-trees will have every HTMX request-path mapping from it's parent. These can then be overridden in the child plonck-tree if necessary to fullfill the scenario context.

### 4. Selection of the current applicable scenario

The prototype SPA has to provide a scenario selector, which give the user the possibility to select and apply the given scenario to the SPA prototype so the behaviour can emulate within this scenario. 
This mechanism is created by applying the tag `<ploncktreeselection/>` in a discrete place in to the HTML-document's body. The user will then see a dropdown-selection box to choose a given "Scenario" before continueing with the other SPA prototype activities.

### 5. Content identities by using tag substitution

HTMX-loaded fragment files can contain definitions of explicite identities to address them from some other HTMX-actions (inside or outside the given fragment). These identites might also be used as indicators to classify them as a member of a set. 
Plonck uses textual substitution of 'plonck tags'. These tags are defined as texts enclosed between two '%' characters such as `%demotag%`.

A html-fragment file with a self-replacing fascility might look like:

    <div id="%itemid%" class="%itemclass%"> 
	...This is an item.
	   <div hx-get="nullitem.html" hx-target="#%itemid%" hx-swap="outerHTML">Click to delete this item %itemid%</div>
    ...
    </div>
	
The outside file refering to this fragment addresses the %itemid% tag and the %itemclass% tag and replaces it here with the defined string-patterns from the __pk-tags__ attribute

   <div hx-get="replacement.html" hx-target="#itemlist" hx-swap="beforeend" hx-ext="plonck" pk-tags="itemid=MyID:++,itemclass=BIGITEMS">Click to replace this fragment</div>

The 2 tags refered here are
 * __itemid__, which is translated into "MyID<sequence>" pattern where the <sequence> is translated into number that increases sequentially each time a new item is created and added with an tag-substitution rule like `itemid=MyID:++`
 * __itemclass__, which is translated into the string "BIGITEMS"

#### Plonck tag-substitution rules

In the `pk-tags` attribute one or more plonck tag-substitution rules can be defined. The tag-substitution rules are comma-separated. Each tag-substitution rule consists of following elements:
 * tag-identifier: the name of the plonck tags to be substituted
 * a `=`
 * a replacement text
 * optionally a sequencial counter can be added to the replacement text. The counter depends on a tag-identifier associated sequence. Following extension provide the scope of the sequences counter:
   * a `:++` will increase the sequence counter in each htmx-based load of a html-fragment.
   * a `:#` will keep the sequence counter number from a previous htmx-based load of a html-fragment. 
   * a `:-` will use a previous sequence counter number from a previous htmx-based load of a html-fragment.
   * a `:--` will decrease the sequence counter in each htmx-based load of a html-fragment.
   * a `:--!` will decrease the sequence counter in each htmx-based load of a html-fragment. When the sequence counter has reached 0 the html-fragment will be replaced by an empty string. This emulates the removal the html-fragment ie. an act of countdown deletion.
 
## Demo

A sceleton-example of a hx-plonck.js based SPA prototype could look like:

__mainpage.html__
	
    <html> ...
      <body>
	    <script src="https://unpkg.com/htmx.org@1.9.10"></script>
	    <script src="hx-plonck.js"></script>
        ...
        <script>
            var PLONCKTREE='*'; // Current plonck-tree when the SPA is started
            var PLONCKFOREST={
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
	                },
		        ...			
                };
        </script>
        ...
		<div hx-get="addeditem.html" hx-target="#itemlist" hx-swap="beforeend" hx-ext="plonck" pk-tags="itemid=ItemID:++">Click to add an item</div>
		...
		<div id="itemlist">
		... <!-- added items will be placed here -->
		</div>
	    <ploncktreeselection/>
	  </body>
	</html>

__addeditem.html__
    <div id="%itemid%"> 
	...This is an item %itemid%. You can:
	   <div hx-get="changeditem.html" hx-target="#%itemid%" hx-swap="outerHTML" hx-ext="plonck" pk-tags="itemid=%itemid%">!!! Click to update this item (%itemid%) !!!</div>
	   <div hx-get="nullitem.html" hx-target="#%itemid%" hx-swap="outerHTML">!!! Click to delete this item (%itemid%) !!!</div>
    ...
    </div>	

__changeditem.html__
    <div id="%itemid%"> 
	...This is a changed item %itemid%. You can:
	   <div hx-get="nullitem.html" hx-target="#%itemid%" hx-swap="outerHTML">!!! Click to delete this item (%itemid%) !!!</div>
    ...
    </div>	
	
__nullitem.html__
    <!-- A virtually empty html-file for item deletion -->
	
## Examples

Other examples of how to use hx-plonck.js for SPA protoypes will / can be found in the examples area of [protovibe](https://github.com/sascha-dibbern/protovibe). A very minimal and just proof of functionality example can also found in `Test/index.html` of this repository.

## Ideas for features

 * Add idempotency calls so that running the htmx-action only once.
 * '*'-globbing in abstract-paths for overriding all/selected inherited paths.
 * Handling of 'futures'. A 'future' is a html-fragment that is loaded, but will first be shown when a given given condition it met.
 