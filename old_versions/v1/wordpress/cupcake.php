<?php
/*
Plugin Name: Cupcake
Plugin URI: https://github.com/glamrock/github
Description: Makes Tor bridges for censored individuals to use.
Version: 0.5
Author: Griffin Boyce
Author URI: https://twitter.com/abditum
Author Email: griffinboyce@gmail.com
License: BSD

Copyright (c) 2013, Griffin Boyce <griffinboyce@gmail.com>
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of the software, the organization, nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
  
*/

function cupcake() {
    $chosen = cupcake_quote();
    echo '<div id="cupcake"><iframe src="//crypto.stanford.edu/flashproxy/embed.html" width="80" height="15" frameborder="0" scrolling="no"></iframe>
    <a href="https://crypto.stanford.edu/flashproxy/">[info]</a>
    <a href="https://crypto.stanford.edu/flashproxy/options.html">[options]</a></div>';
}

// Now we set that function up to execute when the footer is called
add_action( 'wp_footer', 'cupcake' );

// We need some CSS to position errythang
function cupcake_css() {
    // This makes sure that the positioning is also good for right-to-left languages
    $x = is_rtl() ? 'left' : 'right';

    echo "
    <style type='text/css'>
    #cupcake {
        float: $x;
        padding-$x: 15px;
        padding-top: 5px;
        margin: 0;
        font-size: 13px;
        min-width:200px}
    }
    </style>
    ";
}

add_action( 'wp_footer', 'cupcake_css' );