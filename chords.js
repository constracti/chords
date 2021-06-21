function chords(selector, options = {}) {
	// transposer
	const transposer = {
		props: [
			'dir',
			'diatonic',
			'primary',
			'secondary',
			'src',
			'dst',
			'hide',
			'text',
			'larger',
			'smaller',
		],
		dirs: [
			['up', 'up'],
			['down', 'down'],
		],
		diatonics: [
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
		interval: (dir, diatonic, primary, secondary) => {
			const interval = {};
			interval.diatonic = parseInt(diatonic);
			interval.chromatic = transposer.step2val(interval.diatonic);
			if (transposer.is_primary(interval.diatonic))
				interval.chromatic += parseInt(primary);
			else
				interval.chromatic += parseInt(secondary);
			if (dir !== 'up') {
				interval.diatonic = -interval.diatonic;
				interval.chromatic = -interval.chromatic;
			}
			return interval;
		},
		iinterval: interval => {
			let dir, diatonic, chromatic;
			if (interval.diatonic > 0 || interval.diatonic === 0 && interval.chromatic >= 0) {
				dir = 'up';
				diatonic = interval.diatonic;
				chromatic = interval.chromatic;
			} else {
				dir = 'down';
				diatonic = -interval.diatonic;
				chromatic = -interval.chromatic;
			}
			chromatic -= transposer.step2val(diatonic);
			return [dir, diatonic, chromatic];
		},
		transpose: (note, interval) => {
			let [step, alter] = note;
			step = transposer.step2int(step);
			alter = transposer.alter2int(alter);
			alter += transposer.step2val(step);
			step += interval.diatonic;
			alter += interval.chromatic;
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
		itranspose: (note_old, note_new) => {
			let [step_old, alter_old] = note_old;
			let [step_new, alter_new] = note_new;
			step_old = transposer.step2int(step_old);
			alter_old = transposer.alter2int(alter_old);
			alter_old += transposer.step2val(step_old);
			step_new = transposer.step2int(step_new);
			alter_new = transposer.alter2int(alter_new);
			alter_new += transposer.step2val(step_new);
			const interval = {
				diatonic: step_new - step_old,
				chromatic: alter_new - alter_old,
			};
			if (interval.diatonic > 3) {
				interval.diatonic -= 7;
				interval.chromatic -= 12;
			}
			if (interval.diatonic < -3) {
				interval.diatonic += 7;
				interval.chromatic += 12;
			}
			return interval;
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
					tonality: 'C',
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
				if ('tonality' in options)
					obj.tonality = options.tonality;
				else if (obj.form.data('chords-tonality') !== undefined)
					obj.tonality = obj.form.data('chords-tonality');
				obj.tonality = [...obj.tonality.matchAll(transposer._re)][0][0];
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
				obj.diatonic.empty();
				transposer.diatonics.forEach(x => {
					const value = x[0];
					const text = translator.translate(x[1], obj.lang);
					const html = '<option value="' + value + '">' + text + '</option>';
					obj.diatonic.append(html);
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
				obj.src.empty();
				transposer._steps.forEach(step => {
					transposer._alters.slice(1, -1).forEach(alter => {
						const value = step + alter;
						const html = '<option value="' + value + '">' + value + '</option>';
						obj.src.append(html);
					});
				});
				obj.dst.empty();
				transposer._steps.forEach(step => {
					transposer._alters.slice(1, -1).forEach(alter => {
						const value = step + alter;
						const html = '<option value="' + value + '">' + value + '</option>';
						obj.dst.append(html);
					});
				});
				// initialize
				obj.hide.hide();
				obj.text.css('display', 'block')
					.css('font-family', 'monospace')
					.css('white-space', 'pre');
				obj.larger.hide();
				obj.smaller.hide();
				obj.diatonic.on('change', function() {
					const diatonic = parseInt(obj.diatonic.val());
					if (transposer.is_primary(diatonic)) {
						obj.primary.show();
						obj.secondary.hide();
					} else {
						obj.primary.hide();
						obj.secondary.show();
					}
					obj.primary.val(0);
					obj.secondary.val(0);
				});
				obj.src.val(obj.tonality);
				obj.src.on('change', function() {
					obj.tonality = obj.src.val();
					obj.dst.find('option').each(function() {
						const value = $(this).val();
						const miter = [...obj.tonality.matchAll(transposer._re)];
						if (miter.length === 0)
							return;
						const m = miter[0];
						const niter = [...value.matchAll(transposer._re)];
						if (niter.length === 0)
							return;
						const n = niter[0];
						const interval = transposer.itranspose([m[1], m[2]], [n[1], n[2]]);
						const [dir, diatonic, chromatic] = transposer.iinterval(interval);
						let disabled;
						if (transposer.is_primary(diatonic))
							disabled = chromatic < -1 || chromatic > 1;
						else
							disabled = chromatic < -2 || chromatic > 1;
						$(this).prop('disabled', disabled);
					});
				}).change();
				$().add(obj.dir).add(obj.diatonic).add(obj.primary).add(obj.secondary).add(obj.src).on('change', function() {
					const miter = [...obj.tonality.matchAll(transposer._re)];
					if (miter.length === 0)
						return;
					const m = miter[0];
					const interval = transposer.interval(obj.dir.val(), obj.diatonic.val(), obj.primary.val(), obj.secondary.val());
					const note_old = m[0];
					const note_new = transposer.transpose([m[1], m[2]], interval).join('');
					obj.dst.val(note_new);
				});
				obj.diatonic.change();
				$(obj.dst).on('change', function() {
					const miter = [...obj.tonality.matchAll(transposer._re)];
					if (miter.length === 0)
						return;
					const m = miter[0];
					const niter = [...obj.dst.val().matchAll(transposer._re)];
					if (niter.length === 0)
						return;
					const n = niter[0];
					const interval = transposer.itranspose([m[1], m[2]], [n[1], n[2]]);
					const [dir, diatonic, chromatic] = transposer.iinterval(interval);
					obj.dir.val(dir);
					obj.diatonic.val(diatonic);
					if (transposer.is_primary(diatonic)) {
						obj.primary.val(chromatic).show();
						obj.secondary.val(0).hide();
					} else {
						obj.primary.val(0).hide();
						obj.secondary.val(chromatic).show();
					}
				});
				// handlers
				const main = (data, interval) => {
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
								const note_new = transposer.transpose([m[1], m[2]], interval).join('');
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
					const interval = transposer.interval(obj.dir.val(), obj.diatonic.val(), obj.primary.val(), obj.secondary.val());
					if (obj.data !== null) {
						main(obj.data, interval);
					} else if (obj.input !== null) {
						main(obj.input.val(), interval);
					} else if (obj.url !== null) {
						$.get(obj.url).done(function(data) {
							main(data, interval);
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
