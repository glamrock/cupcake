<?php

/**
 * Defines the WP Cupcake Bridge widget.
 *
 */

class WP_Cupcake_Bridge_Widget extends WP_Widget{

	/**
	 * Instantiates widget
	 */
	public function __construct() {
		parent::__construct(
			'wp-cupcake-bridge-iframe',
			__( 'Cupcake Bridge: iFrame', 'wp-cupcake-bridge-iframe' ),
			array(
				'classname'  => 'wp-cupcake-bridge-iframe-class',
				'description' => __( 'Displays an iframe.', 'wp-cupcake-bridge-iframe' )
			)
		);

		// Register and enqueue widget styles and scripts
		add_action( 'wp_enqueue_scripts', array($this, 'enqueue_scripts') );
	}

	/**
	 * Outputs the content of the widget
	 */
	public function widget( $args, $instance ) {
		echo $args['before_widget'];
		include( plugin_dir_path( dirname( __FILE__ ) ) . 'public/partials/iframe.php' );
		echo $args['after_widget'];
	}

	/**
	 * Generates the administration form
	 */
	public function form( $instance ) {
	}

	/**
	 * Sanitize widget form values as they are saved.
	 *
	 * @see WP_Widget::update()
	 *
	 * @param array $new_instance Values just sent to be saved.
	 * @param array $old_instance Previously saved values from database.
	 *
	 * @return array Updated safe values to be saved.
	 */
	public function update( $new_instance, $old_instance ) {
		$instance = $old_instance;
		return $instance;
	}

	/**
	 * Registers and enqueues widget-specific scripts.
	 */
	public function enqueue_scripts() {
		wp_enqueue_script( 'panzi-jquery-cookies');
		wp_enqueue_script( 'wp-cupcake-bridge-social-share-privacy');
		wp_enqueue_script( 'wp-cupcake-bridge-service');
		wp_enqueue_script( 'wp-cupcake-bridge');
	} 
}