<?php
/*
Plugin Name: Cupcake
Plugin URI: https://github.com/glamrock/github
Description: Easy flash proxy
Version: 0.5
Author: Griffin Boyce
Author URI: https://twitter.com/abditum
Author Email: griffinboyce@gmail.com
License: GPL

  Copyright 2013 Griffin Boyce (griffinboyce@gmail.com)

  This program is free software; you can redistribute it and/or modify
  it under the terms of the GNU General Public License, version 2, as 
  published by the Free Software Foundation.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program; if not, write to the Free Software
  Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
  
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