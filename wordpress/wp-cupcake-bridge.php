<?php

/**
 *
 * @link              http://cupcakebridge.com
 * @since             1.0.0
 * @package           WP_Cupcake_Bridge
 *
 * Plugin Name:      	WordPress Cupcake Bridge
 * Plugin URI:        http://cupcakebridge.com/wordpress
 * Description:       Provides the Cupcake Bridge iframe.
 * Version:           1.0.0
 * Author:            Cupcake Bridge
 * Author URI:        http://cupcakebridge.com
 * Text Domain:       wp-cupcake-bridge
 * Domain Path:       /languages
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

function activate_wp_cupcake_bridge() {
	require_once plugin_dir_path( __FILE__ ) . 'includes/wp-cupcake-bridge-activator.php';
	Wp_Cupcake_Bridge_Activator::activate();
}

function deactivate_wp_cupcake_bridge() {
	require_once plugin_dir_path( __FILE__ ) . 'includes/wp-cupcake-bridge-deactivator.php';
	Wp_Cupcake_Bridge_Deactivator::deactivate();
}

register_activation_hook( __FILE__, 'activate_wp_cupcake_bridge' );
register_deactivation_hook( __FILE__, 'deactivate_wp_cupcake_bridge' );

require plugin_dir_path( __FILE__ ) . 'includes/wp-cupcake-bridge.php';

/**
 * Begins execution of the plugin.
 *
 * @since    1.0.0
 */
function run_wp_cupcake_bridge() {

	$plugin = new Wp_Cupcake_Bridge();
	$plugin->run();

}
run_wp_cupcake_bridge();
