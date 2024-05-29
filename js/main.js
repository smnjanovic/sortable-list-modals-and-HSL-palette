const svg = 'http://www.w3.org/2000/svg';
const leaf = [null, svg];

new El('svg[viewBox=0 0 48 48][width=32][height=32]', [
	new El('g[fill=var(--contrast)][stroke=none]', [
		new El('path[d=M43,11 A3 3 0 0 1 45 13 V 39 A3 3 0 0 1 43 41 H5 '
				+ 'A3 3 0 0 1 3 39 V9 A3 3 0 0 1 5 7 H16 A3 3 0 0 1 18.5 9 '
				+ 'A3 3 0 0 0 21 11 Z]', ...leaf)
	], svg)
], svg).build(document.body);

new El('svg[viewBox=0 0 48 48][width=32][height=32]', [
	new El('g[fill=var(--contrast)][stroke=none]', [
		new El('path[d=M4,4 H13 V16 H28 V4 H31 V12 H36 V4 H38.5 L44,9.5 '
				+ 'V44 H36.5 V29.5 H11.5 V44 H4 Z M24,20 A1 1 0 1 1 24 26 '
				+ 'A1 1 0 1 1 24 20 Z][fill-rule=evenodd]', ...leaf),
		new El('path[d=M15,31.5 H33 A1 1 0 0 1 33 34.5 H15 A1 1 0 0 1 15 31.5 Z]', ...leaf),
		new El('path[d=M15,36.25 H33 A1 1 0 0 1 33 39.25 H15 A1 1 0 0 1 15 36.25 Z]', ...leaf),
		new El('path[d=M15,40.75 H33 A1 1 0 0 1 33 43.5 H15 A1 1 0 0 1 15 40.75 Z]', ...leaf),
		new El('path[d=M14,4 V15 H27 V4 Z]', ...leaf),
		new El('path[d=M32,4 V11 H35 V4 Z]', ...leaf)
	], svg)
], svg).build(document.body);

const slist = new SortableList("test test test test test test test test test test test");
slist.setDisposableList(false);
let order = 0;
slist.setListOptions(
	new Action("@ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @".replace(/\@/g, `test${++order}`), () => {}),
	new Action(`test${++order}`, () => {}),
	new Action(`test${++order}`, () => {}),
);
slist.setItemOptions(
	new Action(`test${++order}`, () => {}),
	new Action(`test${++order}`, () => {}),
	new Action(`test${++order}`, () => {}),
	new Action(`test${++order} test${order} test${order} test${order} test${order} test${order} `, () => {}),
	new Action(`test${++order}`, () => {}),
	new Action(`test${++order}`, () => {}),
	new Action(`test${++order}`, () => {}),
	new Action(`test${++order}`, () => {}),
	new Action(`test${++order}`, () => {}),
	new Action(`test${++order}`, () => {}),
	new Action(`test${++order}`, () => {}),
	new Action(`test${++order}`, () => {}),
	new Action(`test${++order}`, () => {}),
	new Action(`test${++order}`, () => {}),
	new Action(`test${++order}`, () => {}),
	new Action(`test${++order}`, () => {}),
	new Action(`test${++order}`, () => {}),
	new Action(`test${++order}`, () => {}),
	new Action(`test${++order}`, () => {}),
	new Action(`test${++order}`, () => {}),
	new Action(`test${++order}`, () => {}),
	new Action(`test${++order}`, () => {}),
	new Action(`test${++order}`, () => {}),
	new Action(`test${++order}`, () => {}),
	new Action(`test${++order}`, () => {}),
	new Action(`test${++order}`, () => {}),
	new Action(`test${++order}`, () => {}),
	new Action(`test${++order}`, () => {}),
	new Action(`test${++order}`, () => {}),
	new Action(`test${++order}`, () => {}),
	new Action(`test${++order}`, () => {}),
	new Action(`test${++order}`, () => {}),
	new Action(`test${++order}`, () => {}),
	new Action(`test${++order}`, () => {}),
	new Action(`test${++order}`, () => {}),
);
slist.setAsChild(document.body);
slist.setData("A", "Bbbldsgk", ..."Cjsldjgsldkg esôllsgjeaôg jsdslfôg sdlô ghdj gsdôl gjsdfôl gjsdflkg jdsôlgds".split(" "), "D", "E", "F", "G", "H", "I", "J", "K");
new El('style', [ `#${slist.id} {${new Theme(25, 25, 20).style}}` ]).build(document.head);

new El('div[style=position:fixed;top:50px;right:50px;--hue:0;--sat:0;--lum:10]', [
	new El('[style=padding:2px;background:var(--harmony-primary);color:var(--contrast)]', ['harmony-primary']),
	new El('[style=padding:2px;background:var(--harmony-secondary);color:var(--contrast)]', ['harmony-secondary']),
	new El('[style=padding:2px;background:var(--primary);color:var(--contrast)]', ['primary']),
	new El('[style=padding:2px;background:var(--secondary);color:var(--contrast)]', ['secondary']),
	new El('[style=padding:2px;background:var(--tertiary);color:var(--harmony-primary)]', ['tertiary']),
	new El('[style=padding:2px;background:var(--contrast);color:var(--harmony-primary)]', ['contrast'])
]).build(document.body);