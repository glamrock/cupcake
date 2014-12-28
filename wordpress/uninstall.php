<?php

/**
 * Fired when the plugin is uninstalled.
 *
 * @link       http://cupcakebridge.com
 * @since      1.0.0
 *
 * @package    WP_Cupcake_Bridge
 */

// If uninstall not called from WordPress, then exit.
if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

if ( get_option( 'wp_cupcake_bridge_iframe_display' ) != false ) {
	delete_option('wp_cupcake_bridge_iframe_display');
}
