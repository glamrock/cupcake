==Embedding iframes using images==

This is pretty dark magic, frequently used by spammers and malware-spreaders. It's *also* used to track who opens emails, in case you're wondering how that sort of thing works.

At the core is an .htaccess rewrite rule, and here I'm going to give several ways to achieve this. And of course `mod_rewrite` must be on for these to work.

It still needs to be tested to see whether this will allow the flash proxy to actually run.

===Redirect all images in X folder to flashproxy embed page===
.htaccess rule:
    `RewriteRule ^imgembed/([^/]+).png http://crypto.stanford.edu/flashproxy/embed.html?debug&initial_facilitator_poll_interval=5 [NC]`

The flow for this is *visited page > flash proxy embed*
`http://website.com/imgembed/image.png` will instead display `http://crypto.stanford.edu/flashproxy/embed.html`

===Redirect all images in X folder to php script===
.htaccess rule:
    `RewriteRule ^imgembed/([^/]+).png embed.php [NC]`

PHP script:
    `<?php $content = file_get_contents("http://crypto.stanford.edu/flashproxy/embed.html"); echo $content; ?>`

The flow for this is *visited page > php script > flash proxy embed* 
`http://website.com/imgembed/image.png` will instead display `http://website.com/embed.php` which itself displays `http://crypto.stanford.edu/flashproxy/embed.html`
Why the extra step? If you want to run analytics or attempt to thwart server-side javascript detection. 

