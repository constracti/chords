function chords(options = null) {
	if (options === null) {
		options = '#chords';
	}
	if (typeof(options) === 'string') {
		options = {
			form: options,
		};
	}
	if (!('hide' in options)) {
		options.hide = '.chords-hide';
	}
	if (!('text' in options)) {
		options.text = '.chords-text';
	}
	if (!('larger' in options)) {
		options.larger = '.chords-larger';
	}
	if (!('smaller' in options)) {
		options.smaller = '.chords-smaller';
	}
	(function($) {
		$(document).ready(function() {
			options.form = $(options.form);
			options.href = options.form.data('chords');
			options.hide = options.form.find(options.hide);
			options.text = options.form.find(options.text);
			options.larger = options.form.find(options.larger);
			options.smaller = options.form.find(options.smaller);
			options.hide.hide();
			options.text.css('display', 'block')
				.css('font-family', 'monospace')
				.css('white-space', 'pre');
			options.larger.hide();
			options.smaller.hide();
			options.form.on('submit', function() {
				jQuery.get(options.href).done(function(data) {
					options.hide.show();
					options.text.html(data);
					options.larger.show();
					options.smaller.show();
				}).fail(function(jqXHR) {
					alert(jqXHR.statusText + ' ' + jqXHR.status);
				});
				return false;
			});
			options.hide.on('click', function() {
				options.hide.hide();
				options.text.html('');
				options.larger.hide();
				options.smaller.hide();
			});
			options.larger.on('click', function() {
				const font_size = parseInt(options.text.css('font-size').replace('px', ''));
				options.text.css('font-size', (font_size + 1) + 'px');
			});
			options.smaller.on('click', function() {
				const font_size = parseInt(options.text.css('font-size').replace('px', ''));
				options.text.css('font-size', (font_size - 1) + 'px');
			});
		});
	})(jQuery);
}
