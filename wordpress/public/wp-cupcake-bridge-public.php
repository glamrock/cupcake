<?php

/**
 * The public-facing functionality of the plugin.
 *
 * @link       http://cupcakebridge.com/wordpress
 * @since      1.0.0
 *
 * @package    Wp_Cupcake_Bridge
 * @subpackage Wp_Cupcake_Bridge/public
 */

/**
 * The public-facing functionality of the plugin.
 *
 * Defines the plugin name, version, and two examples hooks for how to
 * enqueue the dashboard-specific stylesheet and JavaScript.
 *
 * @package    Wp_Cupcake_Bridge
 * @subpackage Wp_Cupcake_Bridge/public
 * @author     Griffin Boyce <griffin@cryptolab.net>
 */
class Wp_Cupcake_Bridge_Public {

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
     * @var      string    $plugin_name       The name of the plugin.
     * @var      string    $version    The version of this plugin.
     */
    public function __construct( $plugin_name, $version ) {

        $this->plugin_name = $plugin_name;
        $this->version = $version;

    }

    /**
     * Return the shortcode.
     *
     * @since    1.0.0
     */
    public function shortcode() {
        if (get_option('wp_cupcake_bridge_iframe_display') == 'on') {
            return '<iframe src="//crypto.stanford.edu/flashproxy/embed.html" width="80" height="15" frameborder="0" scrolling="no"></iframe>';
        }
        wp_enqueue_script( 'panzi-jquery-cookies');
        wp_enqueue_script( 'wp-cupcake-bridge-social-share-privacy');
        wp_enqueue_script( 'wp-cupcake-bridge-service');
        wp_enqueue_script( 'wp-cupcake-bridge');
        return '<div class="share-cupcakebridge"></div>';
    }

    /**
     * Register a widget.
     *
     * @since    1.0.0
     */
    public function register_widget() {
        register_widget('Wp_Cupcake_Bridge_Widget');
    }

    /**
     * Register the stylesheets for the public-facing side of the site.
     *
     * @since    1.0.0
     */
    public function enqueue_styles() {

        wp_enqueue_style( $this->plugin_name, plugin_dir_url( __FILE__ ) . 'css/wp-cupcake-bridge-public.css', array(), $this->version, 'all' );

    }

    /**
     * Enqueue the stylesheets for the public-facing side of the site.
     *
     * @since    1.0.0
     */
    public function enqueue_scripts() {

        wp_register_script( 'panzi-jquery-cookies', plugin_dir_url( __FILE__ ) .  '/js/socialshareprivacy.cupcakebridge/javascripts/jquery.cookies.js', array('jquery'), $this->version, true );
        wp_register_script( 'wp-cupcake-bridge-social-share-privacy', plugin_dir_url( __FILE__ ) . '/js/socialshareprivacy.cupcakebridge/javascripts/socialshareprivacy.js', array('jquery', 'panzi-jquery-cookies'), $this->version, true );
        wp_register_script( 'wp-cupcake-bridge-service', plugin_dir_url( __FILE__ ) . '/js/socialshareprivacy.cupcakebridge/javascripts/modules/cupcakebridge.js', array('jquery', 'panzi-jquery-cookies'), $this->version, true );
        wp_register_script( 'wp-cupcake-bridge', plugin_dir_url( __FILE__ ) .'/js/wp-cupcake-bridge-public.js' , array('jquery'), $this->version, true );

    }




}
