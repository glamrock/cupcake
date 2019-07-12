<?php

/**
 * Provide a dashboard view for the plugin
 *
 * This file is used to markup the admin-facing aspects of the plugin.
 *
 * @link       http://www.cupcakebridge.com
 * @since      1.0.0
 *
 * @package    Wp_Cupcake_Bridge
 * @subpackage Wp_Cupcake_Bridge/admin/partials
 */
?>
<form action='options.php' method='post'>
		
		<h2><?php _e('WP Cupcake Bridge');?></h2>
		
		<?php
			settings_fields( 'wp-cupcake-bridge' );
			do_settings_sections( 'wp-cupcake-bridge' );
			submit_button();
		?>
		
</form>
