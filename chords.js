function chords(selector, options = {}) {
	// transposer
	const transposer = {
		props: [
			'dir',
			'interval',
			'primary',
			'secondary',
			'hide',
			'text',
			'larger',
			'smaller',
		],
		dirs: [
			['up', 'up'],
			['down', 'down'],
		],
		intervals: [
			[0, '1st'],
			[1, '2nd'],
			[2, '3rd'],
			[3, '4th'],
			[4, '5th'],
			[5, '6th'],
			[6, '7th'],
		],
		primary: [
			[-1, 'diminished'],
			[ 0, 'perfect'],
			[ 1, 'augmented'],
		],
		secondary: [
			[-2, 'diminished'],
			[-1, 'minor'],
			[ 0, 'major'],
			[ 1, 'augmented'],
		],
		is_primary: i => [0, 3, 4].includes(i),
		_re: /([A-G])(bb?|#|x)?/g,
		_steps: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
		step2str: i => transposer._steps[i],
		step2int: s => transposer._steps.indexOf(s),
		_alters: ['bb', 'b', '', '#', 'x'],
		alter2str: i => transposer._alters[i + 2],
		alter2int: s => transposer._alters.indexOf(s !== undefined ? s : '') - 2,
		_values: [0, 2, 4, 5, 7, 9, 11],
		step2val: i => i in transposer._values ? transposer._values[i] : '*',
		transpose: (note, transpose) => {
			let [step, alter] = note;
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
	// translator
	const translator = {
		languages: {},
		add_language: (lang, terms) => {
			translator.languages[lang] = {};
			for (const term of terms)
				translator.languages[lang][term[0]] = term[1];
		},
		translate: (s, lang) => {
			if (!(lang in translator.languages))
				return s;
			if (!(s in translator.languages[lang]))
				return s;
			return translator.languages[lang][s];
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
	// ready
	(function($) {
		$(document).ready(function() {
			$(selector).each(function() {
				// options
				const obj = {
					form: $(this),
					lang: 'en',
					data: null,
					input: null,
					url: null,
				};
				if ('lang' in options)
					obj.lang = options.lang;
				else if (obj.form.data('chords-lang') !== undefined)
					obj.lang = obj.form.data('chords-lang');
				if ('data' in options)
					obj.data = options.data;
				if ('input' in options)
					obj.input = obj.form.find(options.input);
				else if (obj.form.data('chords-input') !== undefined)
					obj.input = obj.form.find(obj.form.data('chords-input'));
				if ('url' in options)
					obj.url = options.url;
				else if (obj.form.data('chords-url') !== undefined)
					obj.url = obj.form.data('chords-url');
				transposer.props.forEach(prop => {
					obj[prop] = obj.form.find('.chords-' + prop);
				});
				// populate
				obj.dir.empty();
				transposer.dirs.forEach(x => {
					const value = x[0];
					const text = translator.translate(x[1], obj.lang);
					const html = '<option value="' + value + '">' + text + '</option>';
					obj.dir.append(html);
				});
				obj.intervals.empty();
				transposer.intervals.forEach(x => {
					const value = x[0];
					const text = translator.translate(x[1], obj.lang);
					const html = '<option value="' + value + '">' + text + '</option>';
					obj.interval.append(html);
				});
				obj.primary.empty();
				transposer.primary.forEach(x => {
					const value = x[0];
					const text = translator.translate(x[1], obj.lang);
					const html = '<option value="' + value + '">' + text + '</option>';
					obj.primary.append(html);
				});
				obj.secondary.empty();
				transposer.secondary.forEach(x => {
					const value = x[0];
					const text = translator.translate(x[1], obj.lang);
					const html = '<option value="' + value + '">' + text + '</option>';
					obj.secondary.append(html);
				});
				// initialize
				obj.hide.hide();
				obj.text.css('display', 'block')
					.css('font-family', 'monospace')
					.css('white-space', 'pre');
				obj.larger.hide();
				obj.smaller.hide();
				obj.interval.on('change', function() {
					const interval = parseInt(obj.interval.val());
					if (transposer.is_primary(interval)) {
						obj.primary.show();
						obj.secondary.hide();
					} else {
						obj.primary.hide();
						obj.secondary.show();
					}
					obj.primary.val('0');
					obj.secondary.val('0');
				}).change();
				// handlers
				const main = (data, transpose) => {
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
					obj.hide.show();
					obj.text.html(data);
					obj.larger.show();
					obj.smaller.show();
				};
				obj.form.on('submit', function() {
					const transpose = {};
					transpose.diatonic = parseInt(obj.interval.val());
					transpose.chromatic = transposer.step2val(transpose.diatonic);
					if (transposer.is_primary(transpose.diatonic))
						transpose.chromatic += parseInt(obj.primary.val());
					else
						transpose.chromatic += parseInt(obj.secondary.val());
					if (obj.dir.val() !== 'up') {
						transpose.diatonic = -transpose.diatonic;
						transpose.chromatic = -transpose.chromatic;
					}
					if (obj.data !== null) {
						main(obj.data, transpose);
					} else if (obj.input !== null) {
						main(obj.input.val(), transpose);
					} else if (obj.url !== null) {
						$.get(obj.url).done(function(data) {
							main(data, transpose);
						}).fail(function(jqXHR) {
							alert(jqXHR.statusText + ' ' + jqXHR.status);
						});
					}
					return false;
				});
				obj.hide.on('click', function() {
					obj.hide.hide();
					obj.text.html('');
					obj.larger.hide();
					obj.smaller.hide();
				});
				obj.larger.on('click', function() {
					const font_size = parseInt(obj.text.css('font-size').replace('px', ''));
					obj.text.css('font-size', (font_size + 1) + 'px');
				});
				obj.smaller.on('click', function() {
					const font_size = parseInt(obj.text.css('font-size').replace('px', ''));
					obj.text.css('font-size', (font_size - 1) + 'px');
				});
			});
		});
	})(jQuery);
}

chords('.chords');
