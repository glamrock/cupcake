Cupcake Bridge
===========

Cupcake Bridge helps users makes bridges automagically!
Get the Cupcake browser extension for [Chrome](https://chrome.google.com/webstore/detail/cupcake/dajjbehmbnbppjkcnpdkaniapgdppdnc) and [Firefox](https://addons.mozilla.org/en-us/firefox/addon/cupcakebridge/)

### Releases
* Chrome - [download on google](https://chrome.google.com/webstore/detail/cupcake/dajjbehmbnbppjkcnpdkaniapgdppdnc)
* Firefox - [download from Mozilla](https://addons.mozilla.org/en-us/firefox/addon/cupcakebridge/) (Special thanks to [Uzair Farooq](uzairfarooq11@gmail.com) for creating the original Firefox port of Cupcake.
* Opera 26 (works on v15+)
* Wordpress
* Facebook App (html5/css3/javascript)
* Flex shim
* Drupal 7+ module

### Security
In 2015, a full security audit of both Cupcake and Flashproxy was conducted by Cure53.  Both projects passed the audit with compliments.  The full report is [available here](https://github.com/glamrock/cupcake/blob/master/security/audit1.pdf).

### What even is Cupcake?
Cupcake uses something called Flashproxy to create special Tor pathways that are harder to block. As with all circumvention projects, there's a *lot* more to it than that, but that is the jist. Flashproxy was created by David Fifield, and there is a lot of ongoing research in this area.  You can learn more at the <a href="http://crypto.stanford.edu/flashproxy">Stanford Flashproxy site</a>.  Cupcake exists as an easy way to distribute Flashproxy, with the goal of getting as many people to become bridges as possible.

Cupcake can be distributed in two ways:
* As a chrome or firefox add-on (turning your computer in to a less temporary proxy)
* As a module/theme/app on popular web platforms (turning every visitor to your site in to a temporary proxy)

### What the frak is a Flashproxy?
There is this thing called a Flash Proxy[[1](https://crypto.stanford.edu/flashproxy/)] - basically a code snippet that you run on sites and visitors become tor bridges temporarily.

I kind of love/hate the idea, because visitors aren't willing participants and the bridges last a short short while. But it means that you don't have to run the whole Tor shebang if you only want to make bridges. It's really innovative, and uses technology that the majority of computer owners have enabled (JavaScript).

So, what I decided to do is take that same client-side code snippets and turn it into a browser extension. People install it and they opt-in to become really robust bridges. It was a total experiment, but it went so well that I decided to expand the project.

### But... why bother with flash proxies?
*"The purpose of this project is to create many ephemeral bridge IP
addresses, with the goal of outpacing a censor's ability to block them.
Rather than increasing the number of bridges at static addresses, we aim
to make existing bridges reachable by a larger and changing pool of
addresses."* [[2](https://gitweb.torproject.org/flashproxy.git/blob/HEAD:/README)]

### Oh. Well okay then. Carry on.
[I knew you'd come around!](https://www.youtube.com/watch?v=HrlSkcHQnwI)

### How to help
The easiest way to help the project is by installing one of the browser extensions.  It's not resource intensive at *all* -- flashproxy uses about as much bandwidth in a day as a 5-minute YouTube video (around 6mb).

* Translation - [Help Out!](https://www.transifex.com/projects/p/cupcake/)

##High-priority tasks that are difficult to fix
* Enabling wordpress.COM users to add flashproxy to their theme. (Can you help with this? Send me an email! griffin @ cryptolab.net )

### Low-priority tasks that demand a lot of time
* Joomla Extension
* Flash/SWF App Shim (actionscript & html)

### Failed experiments
* /img-embed

### Surprisingly-sucessful experiments
* Tumblr post demo [post](http://newhopegriffin.tumblr.com/post/47018950850/le-demo)
* Tumblr theme demo
* Facebook App (html5/css3/javascript)

### Code notes
#### chrome/manifest.json
- *incognito:split* This is useful during testing, so that incognito won't use cookies from standard browsing mode.  
- *incognito:spanning* When deployed, prevents incognito windows from creating additional Cupcake processes. Proxy will continue even if all the browser windows are in incognito mode.  
- *permissions:background* is used so that the extension will notify of updates and display the post-installation page. Also used so that Cupcake will start/run on startup, before the browser is started (Windows only).
- *permissions:cookies* allows reading/writing of cookies, but may not be necessary, since Cupcake doesn't currently use the Cookies API.  

#### Financials
Much of the Cupcake Bridge projects are self-funded by @glamrock, but the Chrome and Firefox extensions were covered under a generous grant from the [Open Tech Fund](https://www.opentech.fund/project/cupcake-bridge) from 2013-2014.

### License
My software is free to use, free to give to friends, & open-source, so everyone can make sure it's safe for people to use. Want to make changes? Go for it! :dog: Cupcake uses the Revised BSD license -- see license.txt for more legal info.

#### Cute dog
![dawww, lookit dat little tongue so cute](http://i.imgur.com/JYO9P6j.jpg)

### References
[1] https://crypto.stanford.edu/flashproxy/  
[2] https://gitweb.torproject.org/flashproxy.git/blob/HEAD:/README
[3] https://gitweb.torproject.org/flashproxy.git/tree/proxy
