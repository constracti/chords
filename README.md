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

[twinkle.txt](https://github.com/constracti/chords/blob/main/twinkle.txt) is an example text.

Lines with chords are automatically recognized and emphasized using a bold font weight.

A transposition interval can be selected, i.e. 3rd minor upwards.

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

## Syntax

Input text files should obey certain rules.

- A chord consists of the _root note_, optionally followed by _chord modifiers_ and a _bass note_.
  - Allowed _root notes_ are capital latin letters from `A` to `G`, possibly accompanied by an accidental (sharp `#`, flat `b`, double sharp `x` and double flat `bb`).
  - Any character sequence may indicate a _chord modifier_, provided it does not contain _root notes_ patterns. For simplicity, _altered notes_ and _added tones_ can be considered as part of the _chord modifier_.
  - A _bass note_ is syntactically equivalent to a _root note_, with the exception that it is prefixed by a slash character `/`.
  - Some examples: `C`, `Ab`, `D/F#`, `G7`, `Csus4`, `Cm`.
  - More information can be found in [Wikipedia](https://en.wikipedia.org/wiki/Chord_names_and_symbols_(popular_music)).
- Chords should be separated with at least one space character.
- A line is recognized as a line with chords if at least half of the line characters are whitespace characters. In case a line with chords normally contains fewer characters, spaces should be appended.
- It is strongly recommended to use space and not tab characters, so that alignment is maintained.
- Any line ending (`CR+LF`, `LF`, `CR`) is supported.

A testing page can be found [here](https://raktivan.gr/chords/).
