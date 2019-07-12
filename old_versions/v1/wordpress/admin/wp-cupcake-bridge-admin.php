<?php

/**
 * The dashboard-specific functionality of the plugin.
 *
 * @link       http://cupcakebridge.com
 * @since      1.0.0
 *
 * @package    Wp_Cupcake_Bridge
 * @subpackage Wp_Cupcake_Bridge/admin
 */

/**
 * The dashboard-specific functionality of the plugin.
 *
 * Defines the plugin name, version, and two examples hooks for how to
 * enqueue the dashboard-specific stylesheet and JavaScript.
 *
 * @package    Wp_Cupcake_Bridge
 * @subpackage Wp_Cupcake_Bridge/admin
 * @author     Griffin Boyce <griffin@cryptolab.net>
 */

class Wp_Cupcake_Bridge_Admin {

    /**
     * The ID of this plugin.
     *
     * @since    1.0.0
     * @access   private
     * @var      string    $plugin_name    The ID of this plugin.
     */
    private $plugin_name;

    /**
     * The version of this plugin.
     *
     * @since    1.0.0
     * @access   private
     * @var      string    $version    The current version of this plugin.
     */
    private $version;

    /**
     * Initialize the class and set its properties.
     *
     * @since    1.0.0
     * @var      string    $plugin_name       The name of this plugin.
     * @var      string    $version    The version of this plugin.
     */
    public function __construct( $plugin_name, $version ) {

        $this->plugin_name = $plugin_name;
        $this->version = $version;

    }

    /**
     * Add menu item for options page.
     *
     * @since    1.0.0
     */
    public function admin_menu() {
        add_options_page( 'WP Cupcake Bridge', 'WP Cupcake Bridge', 'manage_options', $this->plugin_name, array($this, 'options_page'));
    }

    public function options_page() {
        include( plugin_dir_path( dirname( __FILE__ ) ) . 'admin/partials/wp-cupcake-bridge-options.php' );
    }

    public function register_setting() {
        register_setting( $this->plugin_name, 'wp_cupcake_bridge_iframe_display', 'sanitize_key' );
    }

    public function add_settings_section() {
        add_settings_section( $this->plugin_name , '', array($this, 'settings_callback'), $this->plugin_name );
    }

    public function add_settings_fields() {
        add_settings_field( 'wp_cupcake_bridge_radio_on', __('Display'), array($this, 'render_radio_on'), $this->plugin_name, $this->plugin_name );
        add_settings_field( 'wp_cupcake_bridge_radio_click', '', array($this, 'render_radio_click'), $this->plugin_name, $this->plugin_name );    
    }

    public function settings_callback() {
        _e('Select method for displaying the Flash Proxy iframe.');
    }

    public function render_radio_on() {
        $value = get_option('wp_cupcake_bridge_iframe_display', 'click');
        $html = '<label><input type="radio" id="wp_cupcake_bridge_iframe_display_on" name="wp_cupcake_bridge_iframe_display" value="on" ' . checked('on', $value, false) . '/>';
        $html .= __( 'Automatically' ) . '</label>'; 
        echo $html;
    }

    public function render_radio_click() {
        $value = get_option('wp_cupcake_bridge_iframe_display', 'click');
        $html = '<label><input type="radio" id="wp_cupcake_bridge_iframe_display_click" name="wp_cupcake_bridge_iframe_display" value="click" ' . checked('click', $value, false) . '/>';
        $html .= __( 'Click to enable' ) . '</label>'; 
        echo $html;
    }
}
