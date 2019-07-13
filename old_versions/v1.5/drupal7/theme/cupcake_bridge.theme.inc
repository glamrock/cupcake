<?php

/**
 * Preprocess function
 *
 * @see cupcake-bridge-iframe.tpl.php
 */
function template_preprocess_cupcake_bridge_iframe(&$variables) {
	$iframe = variable_get('cupcake_bridge_iframe', 'no_cookie');	
	$variables['iframe'] = $iframe;
}