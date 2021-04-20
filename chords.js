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
	(function($) {
		$(document).ready(function() {
			options.form = $(options.form);
			options.href = options.form.data('chords');
			options.hide = options.form.find(options.hide);
			options.text = options.form.find(options.text);
			options.hide.hide();
			options.text.css('display', 'block')
				.css('font-family', 'monospace')
				.css('white-space', 'pre');
			options.form.on('submit', function() {
				jQuery.get(options.href).done(function(data) {
					options.hide.show();
					options.text.html(data);
				}).fail(function(jqXHR) {
					alert(jqXHR.statusText + ' ' + jqXHR.status);
				});
				return false;
			});
			options.hide.on('click', function() {
				options.hide.hide();
				options.text.html('');
			});
		});
	})(jQuery);
}
