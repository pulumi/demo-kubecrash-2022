import chalk from 'chalk';
import chalkAnimation from 'chalk-animation';
import gradientString from 'gradient-string';

export type Formatter = (str: string) => void;

let LONGEST_PREFIX = 20;
export function outputFormatter(title: string): Formatter {
  const prettify = chooseColor();

  if (title.length > LONGEST_PREFIX) {
    LONGEST_PREFIX = title.length;
  }

  const prefix = prettify(title.padEnd(LONGEST_PREFIX, ' '));

  return (msg: string): void => {
    const formattedMessage = msg.split('\n').map((line) => {
      process.stdout.write(`${prefix} | ${line.trimEnd()}\n`);
    });
  };
}

const colorNames = [
  'aliceblue',
  'antiquewhite',
  'aqua',
  'aquamarine',
  'azure',
  'beige',
  'bisque',
  'black',
  'blanchedalmond',
  'blue',
  'blueviolet',
  'brown',
  'burlywood',
  'burntsienna',
  'cadetblue',
  'chartreuse',
  'chocolate',
  'coral',
  'cornflowerblue',
  'cornsilk',
  'crimson',
  'cyan',
  'darkblue',
  'darkcyan',
  'darkgoldenrod',
  'darkgray',
  'darkgreen',
  'darkgrey',
  'darkkhaki',
  'darkmagenta',
  'darkolivegreen',
  'darkorange',
  'darkorchid',
  'darkred',
  'darksalmon',
  'darkseagreen',
  'darkslateblue',
  'darkslategray',
  'darkslategrey',
  'darkturquoise',
  'darkviolet',
  'deeppink',
  'deepskyblue',
  'dimgray',
  'dimgrey',
  'dodgerblue',
  'firebrick',
  'floralwhite',
  'forestgreen',
  'fuchsia',
  'gainsboro',
  'ghostwhite',
  'gold',
  'goldenrod',
  'gray',
  'green',
  'greenyellow',
  'grey',
  'honeydew',
  'hotpink',
  'indianred',
  'indigo',
  'ivory',
  'khaki',
  'lavender',
  'lavenderblush',
  'lawngreen',
  'lemonchiffon',
  'lightblue',
  'lightcoral',
  'lightcyan',
  'lightgoldenrodyellow',
  'lightgray',
  'lightgreen',
  'lightgrey',
  'lightpink',
  'lightsalmon',
  'lightseagreen',
  'lightskyblue',
  'lightslategray',
  'lightslategrey',
  'lightsteelblue',
  'lightyellow',
  'lime',
  'limegreen',
  'linen',
  'magenta',
  'maroon',
  'mediumaquamarine',
  'mediumblue',
  'mediumorchid',
  'mediumpurple',
  'mediumseagreen',
  'mediumslateblue',
  'mediumspringgreen',
  'mediumturquoise',
  'mediumvioletred',
  'midnightblue',
  'mintcream',
  'mistyrose',
  'moccasin',
  'navajowhite',
  'navy',
  'oldlace',
  'olive',
  'olivedrab',
  'orange',
  'orangered',
  'orchid',
  'palegoldenrod',
  'palegreen',
  'paleturquoise',
  'palevioletred',
  'papayawhip',
  'peachpuff',
  'peru',
  'pink',
  'plum',
  'powderblue',
  'purple',
  'rebeccapurple',
  'red',
  'rosybrown',
  'royalblue',
  'saddlebrown',
  'salmon',
  'sandybrown',
  'seagreen',
  'seashell',
  'sienna',
  'silver',
  'skyblue',
  'slateblue',
  'slategray',
  'slategrey',
  'snow',
  'springgreen',
  'steelblue',
  'tan',
  'teal',
  'thistle',
  'tomato',
  'turquoise',
  'violet',
  'wheat',
  'white',
  'whitesmoke',
  'yellow',
  'yellowgreen',
];

function shuffle<T>(list: T[]): T[] {
  const copiedList = [...list];

  return copiedList
    .map((f) => ({ f, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ f }) => f);
}

const colorPairs = (() => {
  const starts = [
    ...shuffle(colorNames),
    ...shuffle(colorNames),
    ...shuffle(colorNames),
  ];

  const ends = [
    ...shuffle(colorNames),
    ...shuffle(colorNames),
    ...shuffle(colorNames),
  ];

  return starts.map((start, idx) => [start, ends[idx]] as const);
})();

const builtinGradients = [
  gradientString.rainbow,
  gradientString.cristal,
  gradientString.teen,
  gradientString.mind,
  gradientString.morning,
  gradientString.vice,
  gradientString.passion,
  gradientString.fruit,
  gradientString.instagram,
  gradientString.atlas,
  gradientString.retro,
  gradientString.summer,
  gradientString.pastel,
];

const ALL_COLORS = [
  ...shuffle(builtinGradients),
  ...shuffle(colorPairs.map(([start, end]) => gradientString([start, end]))),
];

let COLOR_IDX = 0;
function chooseColor() {
  const colorChoice = ALL_COLORS[COLOR_IDX];
  COLOR_IDX = (COLOR_IDX + 1) % ALL_COLORS.length;

  return colorChoice;
}
