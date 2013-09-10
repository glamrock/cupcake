Cupcake Bridge
===========

Cupcake Bridge helps users makes bridges automagically!
Get the Cupcake browser extension for [Chrome](https://chrome.google.com/webstore/detail/cupcake/dajjbehmbnbppjkcnpdkaniapgdppdnc) (v22+) and Firefox (v3+, coming soon)

##What the frak?
There is this thing called a Flash Proxy[[1](https://crypto.stanford.edu/flashproxy/)] - basically a code snippet that you run on sites and visitors become tor bridges temporarily.

I kind of love/hate the idea, because visitors aren't willing participants and the bridges last a short short while. But it means that you don't have to run the whole Tor shebang if you only want to make bridges. It's really innovative, and uses technology that the majority of computer owners have enabled (JavaScript).

So, what I want to do is take that same client-side code snippets and turn it into a browser extension. People install it and they opt-in to become really robust bridges. 

##But... why bother with flash proxies?
*"The purpose of this project is to create many ephemeral bridge IP
addresses, with the goal of outpacing a censor's ability to block them.
Rather than increasing the number of bridges at static addresses, we aim
to make existing bridges reachable by a larger and changing pool of
addresses."* [[2](https://gitweb.torproject.org/flashproxy.git/blob/HEAD:/README)]

##Oh. Well okay then. Carry on.
[I knew you'd come around!](https://www.youtube.com/watch?v=HrlSkcHQnwI)

##Complete
* Chrome - [download on google](https://chrome.google.com/webstore/detail/cupcake/dajjbehmbnbppjkcnpdkaniapgdppdnc) or [github](https://github.com/glamrock/cupcake/blob/master/downloads/chrome.crx)
* Wordpress
* Drupal 6
* Facebook App (html5/css3/javascript)
* Flex shim
* Tumblr post demo [post](http://blog.cryptic.be/post/47018950850/le-demo)

##Beta
* Tumblr theme #1
* /img-embed

##Next
* Translation - [Help Out!](https://www.transifex.com/projects/p/cupcake/)
* Firefox add-on
* Opera 15+ extension

##Roadmap
* Facebook WebApp Tutorial
* Wordpress Theme
* Tumblr Theme (#2)
* Drupal 7 & 5 modules
* Safari
* Flash/SWF App Shim (actionscript & html)

##High-priority tasks that are difficult to fix
* Enabling wordpress.COM users to add cupcake to their theme.

##Low-priority tasks that demand a lot of time
* Opera 12 extension
* Rolling a custom analytics system to replace GoSquared
* RefineryCMS add-on
* Opera add-on
* Joomla Extension

##Code notes
###chrome/manifest.json
- *incognito:split* This is useful during testing, so that incognito won't use cookies from standard browsing mode.  
- *incognito:spanning* When deployed, prevents incognito windows from creating additional Cupcake processes. Proxy will continue even if all the browser windows are in incognito mode.  
- *permissions:background* is used so that the extension will start/run on startup, before the browser is started.  
- *permissions:cookies* allows reading/writing of cookies, but may not be necessary, since Cupcake doesn't currently use the Cookies API.  

### License
My software is free to use, free to give to friends, & open-source, so everyone can make sure it's safe for people to use.

Cupcake uses the Revised BSD license -- see license.txt for more info.

### References
[1] https://crypto.stanford.edu/flashproxy/  
[2] https://gitweb.torproject.org/flashproxy.git/blob/HEAD:/README
