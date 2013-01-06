Cupcake
===========

Cupcake is a browser extension that makes bridges automagically!.

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

##Code notes
###manifest.json
- *incognito:split* This is useful during testing, so that incognito won't use cookies from standard browsing mode.  
- *incognito:spanning* When deployed, prevents incognito windows from creating additional Cupcake processes. Proxy will continue even if all the browser windows are in incognito mode.  
- *permissions:background* is used so that the extension will start/run on startup, before the browser is started.  
- *permissions:cookies* allows reading/writing of cookies, but may not be necessary, since Cupcake doesn't currently use the Cookies API.  

### License
License is Creative Commons Attribution Noncomercial.

### References
[1] https://crypto.stanford.edu/flashproxy/  
[2] https://gitweb.torproject.org/flashproxy.git/blob/HEAD:/README
