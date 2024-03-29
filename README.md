# chords
A JavaScript library to show lyrics with chords and provide full transpose functionality.

## Demonstration

Input text files are similar to the following content.

```
C                 F      C
Twinkle, twinkle, little star,
F     C      G7       C
How I wonder what you are!

C   F        C        G
Up above the world so high,
C      F       C      G
Like a diamond in the sky.


Twinkle, twinkle, little star…
```

File [twinkle.txt](https://github.com/constracti/chords/blob/main/twinkle.txt) is an example input text.

Lines with chords are automatically recognized and emphasized using a bold font weight.

A transposition interval can be selected, e.g. 3rd minor upwards.

```
Eb                Ab     Eb
Twinkle, twinkle, little star,
Ab    Eb     Bb7      Eb
How I wonder what you are!

Eb  Ab       Eb       Bb
Up above the world so high,
Eb     Ab      Eb     Bb
Like a diamond in the sky.


Twinkle, twinkle, little star…
```

## Requirements

A relatively recent version of [jQuery](https://jquery.com/) is required.

## Functionality

A function named `chords` is exposed by the library.

```javascript
chords(selector, options = {});
```

Upon invoked on a form, some marked descendant elements will control the appearance of the lyrics and transposition of the chords.

Argument `selector` should be any object that can be accepted as the first argument of the [jQuery constructor](https://api.jquery.com/jQuery/). Functionality will be applied to each form container separately, i.e. each matched element.

Function `chords` is applied automatically with the default options to any element having the `chords` class.

### Controls

All control elements should be hierarchical descendants of the form container.

#### Select elements

The transposition parameters are controlled by several select elements, which are automatically populated with the corresponding options.

- Class `chords-dir` defines the select element that controls the direction (up, down) of the transposition.
- Class `chords-diatonic` defines the select element that controls the diatonic interval (1st, 2nd, …, 7th) of the transposition.
- Class `chords-primary` defines the select element that controls the quality of the interval (diminished, perfect, augmented), in case of a primary diatonic interval (1st, 4th, 5th).
- Class `chords-secondary` defines the select element that controls the quality of the interval (diminished, minor, major, augmented), in case of a secondary diatonic interval (2nd, 3rd, 6th, 7th).
- Class `chords-src` defines the select element that controls the source tonality of the transposition.
- Class `chords-dst` defines the select element that controls the destination tonality of the transposition.

#### Button elements

Lyrics and the transposed chords are displayed in an element with class `chords-text`, whose appearance is controlled by multiple buttons.
It is highly recommended to apply a monospaced font family on this element.

- A submission of the form (usually clicking a button with the `type="submit"` attribute) shows the lyrics.
- An element with class `chords-hide` hides the lyrics.
- An element with class `chords-larger` increases the text size of the lyrics.
- An element with class `chords-smaller` decreases the text size of the lyrics.
- An element with class `chords-copy` copies lyrics to the clipboard. When clicked, an element with class `chords-copied` is faded in for 1 second.

### Options

The effect of `chords` function can be customized through special `data-chords-*` attributes of the container form and the `options` argument. Data attributes have lower precedence and will be checked if the analogous options are not provided.

- `options.lang` and `data-chords-lang` define the language used to populate the select fields. Default is `'en'` (english). Currently, the only translation available is `'el'` (greek).
- `options.data` defines the initial text that holds the lyrics. Default is `null`.
- `options.input` and `data-chords-input` define a selector leading to the input field (usually a textarea) whose value contains the lyrics. Default is `null`.
- `options.url` and `data-chords-url` define the url pointing to the lyrics through a GET request. Default is `null`.
- `options.tonality` defines the initial tonality of the lyrics. Default is `'C'`.

Options `data`, `input` and `url` are tested in the order they are mentioned. At least one should have a non-null value.

### Examples

Load lyrics through a textarea element and display transposition options in greek.

```html
<form class="chords" data-chords-input=".chords-input" data-chords-lang="el">
	<textarea class="chords-input"></textarea>
	<select class="chords-dir"></select>
	<select class="chords-diatonic"></select>
	<select class="chords-primary"></select>
	<select class="chords-secondary"></select>
	<select class="chords-src"></select>
	<select class="chords-dst"></select>
	<button type="submit" class="chords-show">show</button>
	<button type="button" class="chords-hide">hide</button>
	<button type="button" class="chords-larger">&plus;</button>
	<button type="button" class="chords-smaller">&minus;</button>
	<button type="button" class="chords-copy">copy</button>
	<span class="chords-copied">copied!</span>
	<div class="chords-text" style="font-family: monospace;"></div>
</form>
```

Request lyrics from a specific url.

```javascript
chords('#chords-container', {
	url: 'lyrics-with-chords.txt',
	tonality: 'Eb',
});
```

## Syntax

Input text files should obey certain rules.

- A chord consists of the _root note_, optionally followed by the _chord quality_ and a _bass note_.
	- Allowed _root notes_ are capital latin letters from `A` to `G`, possibly accompanied by an accidental (sharp `#`, flat `b`, double sharp `x` and double flat `bb`).
	- Any character sequence may indicate the _chord quality_, provided it does not contain _root notes_ patterns. For simplicity, _altered notes_ and _added tones_ can be considered as part of the _chord quality_.
	- A _bass note_ is syntactically equivalent to a _root note_, with the exception that it is prefixed by a slash character `/`.
	- Some examples: `C`, `Ab`, `D/F#`, `G7`, `Csus4`, `Cm`.
	- More information can be found in [Wikipedia](https://en.wikipedia.org/wiki/Chord_names_and_symbols_(popular_music)).
- Chords should be separated with at least one space character.
- A line is recognized as a line with chords if at least half of the line characters are whitespace characters. In case a line with chords normally contains fewer characters, spaces should be appended.
- It is strongly recommended to use space and not tab characters, so that alignment is maintained.
- Any line ending (`CR+LF`, `LF`, `CR`) is supported.

A testing page can be found [here](https://constracti.github.io/chords/).
