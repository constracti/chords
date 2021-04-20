function chords(options = null) {
	// intervals
	const dirs = [
		['up', 'up'],
		['down', 'down'],
	];
	const intervals = [
		[0, '1st'],
		[1, '2nd'],
		[2, '3rd'],
		[3, '4th'],
		[4, '5th'],
		[5, '6th'],
		[6, '7th'],
	];
	const primary = [
		[-1, 'diminished'],
		[ 0, 'perfect'],
		[ 1, 'augmented'],
	];
	const secondary = [
		[-2, 'diminished'],
		[-1, 'minor'],
		[ 0, 'major'],
		[ 1, 'augmented'],
	];
	// translator
	const translator = {
		_languages: {},
		add_language: (lang, terms) => {
			translator._languages[lang] = {};
			for (const term of terms)
				translator._languages[lang][term[0]] = term[1];
		},
		translate: (s, lang) => {
			if (!(lang in translator._languages))
				return s;
			if (!(s in translator._languages[lang]))
				return s;
			return translator._languages[lang][s];
		},
	};
	translator.add_language('el', [
		['up', 'πάνω'],
		['down', 'κάτω'],
		['1st', '1ης'],
		['2nd', '2ης'],
		['3rd', '3ης'],
		['4th', '4ης'],
		['5th', '5ης'],
		['6th', '6ης'],
		['7th', '7ης'],
		['diminished', 'ελαττωμένο'],
		['minor', 'μικρό'],
		['perfect', 'καθαρό'],
		['major', 'μεγάλο'],
		['augmented', 'αυξημένο'],
	]);
	// transposer
	const transposer = {
		_re: /([A-G])(bb?|#|x)?/g,
		is_primary: i => [0, 3, 4].includes(i),
		_steps: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
		step2str: i => transposer._steps[i],
		step2int: s => transposer._steps.indexOf(s),
		_alters: ['bb', 'b', '', '#', 'x'],
		alter2str: i => transposer._alters[i + 2],
		alter2int: s => transposer._alters.indexOf(s !== undefined ? s : '') - 2,
		_values: [0, 2, 4, 5, 7, 9, 11],
		step2val: i => i in transposer._values ? transposer._values[i] : '*',
		transpose: function(note, transpose) {
			let step = note[0];
			let alter = note[1];
			step = transposer.step2int(step);
			alter = transposer.alter2int(alter);
			alter += transposer.step2val(step);
			step += transpose.diatonic;
			alter += transpose.chromatic;
			while (step < 0) {
				step += 7;
				alter += 12;
			}
			while (step >= 7) {
				step -= 7;
				alter -= 12;
			}
			alter -= transposer.step2val(step);
			step = transposer.step2str(step);
			alter = transposer.alter2str(alter);
			note = [step, alter];
			return note;
		},
	};
	// options
	if (options === null) {
		options = {};
	}
	if (typeof(options) === 'string') {
		options = {
			form: options,
		};
	}
	if (!('form' in options))
		options.form = '#chords';
	if (!('lang' in options))
		options.lang = 'en';
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
	// ready
	(function($) {
		$(document).ready(function() {
			options.form = $(options.form);
			options.href = options.form.data('chords');
			props.forEach(prop => {
				if (typeof(options[prop]) === 'string')
					options[prop] = options.form.find(options[prop]);
			});
			dirs.forEach(x => {
				const value = x[0];
				const text = translator.translate(x[1], options.lang);
				const html = '<option value="' + value + '">' + text + '</option>';
				options.dir.append(html);
			});
			intervals.forEach(x => {
				const value = x[0];
				const text = translator.translate(x[1], options.lang);
				const html = '<option value="' + value + '">' + text + '</option>';
				options.interval.append(html);
			});
			primary.forEach(x => {
				const value = x[0];
				const text = translator.translate(x[1], options.lang);
				const html = '<option value="' + value + '">' + text + '</option>';
				options.primary.append(html);
			});
			secondary.forEach(x => {
				const value = x[0];
				const text = translator.translate(x[1], options.lang);
				const html = '<option value="' + value + '">' + text + '</option>';
				options.secondary.append(html);
			});
			options.hide.hide();
			options.text.css('display', 'block')
				.css('font-family', 'monospace')
				.css('white-space', 'pre');
			options.larger.hide();
			options.smaller.hide();
			options.interval.on('change', function() {
				const interval = parseInt(options.interval.val());
				if (transposer.is_primary(interval)) {
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
				transpose.chromatic = transposer.step2val(transpose.diatonic);
				if (transposer.is_primary(transpose.diatonic))
					transpose.chromatic += parseInt(options.primary.val());
				else
					transpose.chromatic += parseInt(options.secondary.val());
				if (options.dir.val() !== 'up') {
					transpose.diatonic = -transpose.diatonic;
					transpose.chromatic = -transpose.chromatic;
				}
				$.get(options.href).done(function(data) {
					data = $('<div>' + data + '</div>').text();
					const lines_old = data.split(/\n|\r\n|\r|\n\r/);
					const lines_new = [];
					lines_old.forEach(line => {
						let ws = line.match(/\s/g);
						ws = (ws !== null) ? ws.length : 0;
						const is_chords = line.length ? (ws / line.length >= .5) : false;
						if (is_chords) {
							let offset = 0;
							const miter = line.matchAll(transposer._re);
							for (const m of miter) {
								const note_old = m[0];
								const note_new = transposer.transpose([m[1], m[2]], transpose).join('');
								let prev = line.slice(0, m.index + offset);
								let next = line.slice(m.index + offset + note_old.length);
								if (offset < 0 && prev.slice(-1) !== '/') {
									prev += ' '.repeat(-offset);
									offset = 0;
								}
								while (offset > 0) {
									if (prev.slice(-2) !== '  ')
										break;
									prev = prev.slice(0, -1);
									offset--;
								}
								line = prev + note_new + next;
								offset += note_new.length - note_old.length;
							}
							line = '<b>' + line + '</b>';
						}
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
