const slist = new SortableList("test test test test test test test test test test test");
slist.setDisposableList(false);
slist.setListOptions(
	new Action("test1 test1test1 test1test1 test1test1 test1test1 test1", () => console.log(1)),
	new Action("test2", () => console.log(2)),
	new Action("test3", () => console.log(3))
);
slist.setItemOptions(
	new Action("test4", it => console.log(it, 4)),
	new Action("test5", it => console.log(it, 5)),
	new Action("test6", it => console.log(it, 6))
);
slist.setAsChild(document.body);
slist.setData("A", "Bbbldsgk", ..."Cjsldjgsldkg esôllsgjeaôg jsdslfôg sdlô ghdj gsdôl gjsdfôl gjsdflkg jdsôlgds".split(" "), "D", "E", "F", "G", "H", "I", "J", "K");
document.head.appendChild(el({ style: `#${slist.id} {${new Theme(25, 25, 20).style}}` }));
