Cupcake Bridge
===========

Cupcake Bridge helps users makes bridges automagically!  Get the Cupcake browser extension for [Chrome](https://chrome.google.com/webstore/detail/cupcake/dajjbehmbnbppjkcnpdkaniapgdppdnc). 

# Releases
* Chrome - [download on google](https://chrome.google.com/webstore/detail/cupcake/dajjbehmbnbppjkcnpdkaniapgdppdnc)

The browser extension for Firefox is being rewritten as it has difficulty making websocket connections.  

### What even is Cupcake?
Cupcake is a wrapper for a pluggable transport called Snowflake.  This makes it easy for people who want to contribute some of their bandwidth to create special [Tor](https://torproject.org) pathways that are harder to block. As with all circumvention projects, there's a *lot* more to it than that, but that is the jist.  

Cupcake can be distributed in two ways:
* As a chrome extension (turning your computer in to a temporary pathway)
* As a module/theme/app on popular web platforms (turning every visitor to your site in to a temporary proxy). These are currently being rewritten to accomodate Snowflake. 

### How to help
The easiest way to help the project is by installing one of the browser extensions.  It's not resource intensive at *all* -- Snowflake uses about as much bandwidth in a day as a 5-minute YouTube video.

* Translation - [Help Out!](https://www.transifex.com/projects/p/cupcake/)

### Code notes
#### chrome/manifest.json
- *incognito:split* This is useful during testing, so that incognito won't use cookies from standard browsing mode.  
- *incognito:spanning* When deployed, prevents incognito windows from creating additional Cupcake processes. Proxy will continue even if all the browser windows are in incognito mode.  
- *permissions:background* is used so that the extension will notify of updates and display the post-installation page. Also used so that Cupcake will start/run on startup, before the browser is started (Windows only).
- *permissions:cookies* allows reading/writing of cookies, but may not be necessary, since Cupcake doesn't currently use the Cookies API.  

### Security
In 2015, a full security audit of both Cupcake and Flashproxy was conducted by Cure53.  Both projects passed the audit with compliments.  The full report is [available here](https://github.com/glamrock/cupcake/blob/master/security/audit1.pdf).

#### Financials
Most of the Cupcake Bridge projects are self-funded by @glamrock, but major modifications to the first versions of Chrome and Firefox extensions were covered under a generous grant from the [Open Tech Fund](https://www.opentech.fund/project/cupcake-bridge) from 2013-2014.

### History
Previously, Cupcake included Flashproxy rather than Snowflake.  Cupcake has existed since 2012, and Snowflake was created a couple of years after Cupcake.  Over time, it became clear that Snowflake was becoming more useful for at-risk users, so I made the switch in early 2019. The old readme is available [here](https://github.com/glamrock/v1_readme.md).

### License
My software is free to use, free to give to friends, & open-source, so everyone can make sure it's safe for people to use. Want to make changes? Go for it! :dog: Cupcake uses the Revised BSD license -- see license.txt for more legal info.

### References
[1] https://snowflake.torproject.org/
[2] https://crypto.stanford.edu/flashproxy/
