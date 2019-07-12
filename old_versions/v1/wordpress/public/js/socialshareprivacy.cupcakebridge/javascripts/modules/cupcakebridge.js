/*
 * Provides the Flash Proxy service for jquery.socialshareprivacy.js | 2 Klicks fuer mehr Datenschutz
 */
(function ($, undefined) {
	"use strict";

	function get (self, options, uri, settings, name) {
		var value = options[name];
		if (typeof value === "function") {
			return value.call(self, options, uri, settings);
		}
		return String(value);
	}

	$.fn.socialSharePrivacy.settings.services.cupcakebridge = {
		'status'            : true,
		'perma_option'   		: true,
		'dummy_line_img'    : 'images/dummy_cupcakebridge.png',
		'dummy_alt'         : '"Flash Proxy"',
		'txt_info'          : 'Click to enable Flash Proxy',
		'line_img'          : 'images/cupcakebridge.png',
		'display_name'			: 'Flash Proxy',
		'button'            : function (options, uri, settings) {
			return $('<iframe width="80" height="15" frameborder="0" scrolling="no"></iframe>')
				.attr('src', '//crypto.stanford.edu/flashproxy/embed.html');
		}
	};
})(jQuery);