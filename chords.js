// TODO translate terms
function chords(options = null) {
	if (options === null) {
		options = '#chords';
	}
	if (typeof(options) === 'string') {
		options = {
			form: options,
		};
	}
	const props = [
		'dir',
		'interval',
		'primary',
		'secondary',
		'hide',
		'text',
		'larger',
		'smaller',
	];
	props.forEach(prop => {
		if (!(prop in options))
			options[prop] = '.chords-' + prop;
	});
	const tools = {
		is_primary: i => [0, 3, 4].includes(i),
		_values: [0, 2, 4, 5, 7, 9, 11],
		step2val: i => i in tools._values ? tools._values[i] : '*',
	};
	(function($) {
		$(document).ready(function() {
			options.form = $(options.form);
			options.href = options.form.data('chords');
			props.forEach(prop => {
				if (typeof(options[prop]) === 'string')
					options[prop] = options.form.find(options[prop]);
			});
			[
				['up', 'up'],
				['down', 'down'],
			].forEach(x => {
				options.dir.append('<option value="' + x[0] + '">' + x[1] + '</option>');
			});
			[
				[0, '1st'],
				[1, '2nd'],
				[2, '3rd'],
				[3, '4th'],
				[4, '5th'],
				[5, '6th'],
				[6, '7th'],
			].forEach(x => {
				options.interval.append('<option value="' + x[0] + '">' + x[1] + '</option>');
			});
			[
				[-1, 'diminished'],
				[ 0, 'perfect'],
				[ 1, 'augmented'],
			].forEach(x => {
				options.primary.append('<option value="' + x[0] + '">' + x[1] + '</option>');
			});
			[
				[-2, 'diminished'],
				[-1, 'minor'],
				[ 0, 'major'],
				[ 1, 'augmented'],
			].forEach(x => {
				options.secondary.append('<option value="' + x[0] + '">' + x[1] + '</option>');
			});
			options.hide.hide();
			options.text.css('display', 'block')
				.css('font-family', 'monospace')
				.css('white-space', 'pre');
			options.larger.hide();
			options.smaller.hide();
			options.interval.on('change', function() {
				const interval = parseInt(options.interval.val());
				if (tools.is_primary(interval)) {
					options.primary.show();
					options.secondary.hide();
				} else {
					options.primary.hide();
					options.secondary.show();
				}
				options.primary.val('0');
				options.secondary.val('0');
			}).change();
			options.form.on('submit', function() {
				const transpose = {};
				transpose.diatonic = parseInt(options.interval.val());
				transpose.chromatic = tools.step2val(transpose.diatonic);
				if (tools.is_primary(transpose.diatonic))
					transpose.chromatic += parseInt(options.primary.val());
				else
					transpose.chromatic += parseInt(options.secondary.val());
				if (options.dir.val() !== 'up') {
					transpose.diatonic = -transpose.diatonic;
					transpose.chromatic = -transpose.chromatic;
				}
				$.get(options.href).done(function(data) {
					data = $('<div>' + data + '</div>').text();
					const lines_old = data.split('\n'); // TODO accept all types of EOL
					const lines_new = [];
					lines_old.forEach(line => {
						let ws = line.match(/\s/g);
						ws = (ws !== null) ? ws.length : 0;
						const is_chords = line.length ? (ws / line.length >= .5) : false;
						if (is_chords)
							line = '<b>' + line + '</b>';
						lines_new.push(line);
					});
					data = lines_new.join('\n');
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
