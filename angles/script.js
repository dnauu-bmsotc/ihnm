'use strict'

// Каждый пункт на странице создаётся с помощью функции addRepresentation,
// которая принимает объект со следующими свойствами:
// groupName -- идентификатор пункта списка
// html -- содержимое пункта списка
// getValue -- когда в пункте списка возникает событие input, вызывается функция
//     getValue, которая должна вернуть значение угла в градусах
// setValue -- функция, принимающая количество градусов и устанавливающая это
//     значение в пункт списка.
// В объекте могут быть и другие свойства, обратиться к ним можно
// через this, или через representations[groupName].func.

let representations = {};

// representation = {groupName, html, getValue, setValue};
function addRepresentation(representation) {
	let li = document.createElement("li");
	li.innerHTML = representation.html;
	li.id = representation.groupName;
	li.addEventListener("input", () => {
		updateRepresentations(representation.getValue(), representation.groupName)
	});
	document.getElementById("list").appendChild(li);
	representations[representation.groupName] = representation;
}

function updateRepresentations(dd, exception) {
	for (let key in representations) {
		if (representations[key].groupName !== exception) {
				representations[key].setValue(dd);
		}
	}
}

function numberIn(id) {
	return +document.getElementById(id).value.replace(/\,/g, ".");
}

function setNumber(id, value) {
	document.getElementById(id).value = (Math.abs(value) > 10**8) ? "" : numeral(value).format();
}

// Градусы, минуты, секунды
addRepresentation({
	groupName: "li-g",
	html: `
		<input id="gdeg" type="text">градусов,
		<input id="gmin" type="text">минут,
		<input id="gsec" type="text">секунд.
	`,
	getValue: () => numberIn("gdeg") + numberIn("gmin") / 60 + numberIn("gsec") / 3600,
	setValue: dd => {
		let d, m, s;
		setNumber("gdeg", d = Math.trunc(dd));
		setNumber("gmin", m = Math.trunc((dd - d) * 60));
		setNumber("gsec", s = ((dd - d) * 60 - m) * 60);
	},
});

// Только в градусах
addRepresentation({
	groupName: "li-dd",
	html: `Только в градусах: <input id="dd" type="text">`,
	getValue: () => numberIn("dd"),
	setValue: dd => setNumber("dd", dd),
});

// Только в минутах
addRepresentation({
	groupName: "li-mm",
	html: `Только в минутах: <input id="mm" type="text">`,
	getValue: () => numberIn("mm") / 60,
	setValue: dd => setNumber("mm", dd * 60),
});

// Только в секундах
addRepresentation({
	groupName: "li-ss",
	html: `Только в секундах: <input id="ss" type="text">`,
	getValue: () => numberIn("ss") / 3600,
	setValue: dd => setNumber("ss", dd * 3600),
});

// В градах
addRepresentation({
	groupName: "li-gon",
	html: `В градах: <input id="gon" type="text">`,
	getValue: () => numberIn("gon") / 0.9,
	setValue: dd => setNumber("gon", dd * 0.9),
});

// В радианах
addRepresentation({
	groupName: "li-rad",
	html: `В радианах: <input id="rad" type="text">`,
	getValue: () => numberIn("rad") / Math.PI * 180,
	setValue: dd => setNumber("rad", dd * Math.PI / 180),
});

// Синус
addRepresentation({
	groupName: "li-sin",
	html: `sin: <input id="sin" type="text">`,
	getValue: () => Math.asin(numberIn("sin")) / Math.PI * 180,
	setValue: dd => setNumber("sin", Math.sin(dd * Math.PI / 180)),
});

// Косинус
addRepresentation({
	groupName: "li-cos",
	html: `cos: <input id="cos" type="text">`,
	getValue: () => Math.acos(numberIn("cos")) / Math.PI * 180,
	setValue: dd => setNumber("cos", Math.cos(dd * Math.PI / 180)),
});

// Тангенс
addRepresentation({
	groupName: "li-tan",
	html: `tg: <input id="tan" type="text">`,
	getValue: () => Math.atan(numberIn("tan")) / Math.PI * 180,
	setValue: dd => setNumber("tan", Math.tan(dd * Math.PI / 180)),
});

// Котангенс
addRepresentation({
	groupName: "li-ctg",
	html: `ctg: <input id="ctg" type="text">`,
	getValue: () => Math.atan(1 / numberIn("ctg")) / Math.PI * 180,
	setValue: dd => setNumber("ctg", 1 / Math.tan(dd * Math.PI / 180)),
});

// Румб
addRepresentation({
	groupName: "li-rum",
	html: `
		Направление
		<select id="rdir">
			<option>СВ</option>
			<option>ЮВ</option>
			<option>ЮЗ</option>
			<option>СЗ</option>
		</select>,
		Румб <input id="rval" type="text">
	`,
	getValue: () => {
		switch(document.getElementById("rdir").selectedIndex) {
			case 0: return (numberIn("rval"));
			case 1: return (180 - numberIn("rval"));
			case 2: return (180 + numberIn("rval"));
			case 3: return (360 - numberIn("rval"));
		};
	},
	setValue: dd => {
				 if (0   <= (dd % 360) && (dd % 360) < 90)  { document.getElementById("rdir").selectedIndex = 0; setNumber("rval", dd); }
		else if (90  <= (dd % 360) && (dd % 360) < 180) { document.getElementById("rdir").selectedIndex = 1; setNumber("rval", 180 - dd); }
		else if (180 <= (dd % 360) && (dd % 360) < 270) { document.getElementById("rdir").selectedIndex = 2; setNumber("rval", 180 + dd); }
		else if (270 <= (dd % 360) && (dd % 360) < 360) { document.getElementById("rdir").selectedIndex = 3; setNumber("rval", 360 - dd); }
	},
});

// Истинный азимут по сближению меридианов
addRepresentation({
	groupName: "li-ta-convergence",
	html: `Сближение меридианов: <input id="ta-convergence" type="text">, Истинный азимут: <input id="ta-value" type="text">`,
	getValue: () => (numberIn("ta-value") - numberIn("ta-convergence")),
	setValue: dd => setNumber("ta-value", dd + numberIn("ta-convergence")),
});

// Магнитный азимут по поправке
addRepresentation({
	groupName: "li-ma1-correction",
	html: `Поправка направления: <input id="ma1-correction" type="text">, Магнитный азимут: <input id="ma1-value" type="text">`,
	getValue: () => (numberIn("ma1-value") + numberIn("ma1-correction")),
	setValue: dd => setNumber("ma1-value", dd - numberIn("ma1-correction")),
});

// Магнитный азимут по сближению меридианов и магнитному склонению
addRepresentation({
	groupName: "li-ma2-convergence-declination",
	html: `
		Сближение меридианов: <input id="ma2-convergence" type="text">,
		Магнитное склонение: <input id="ma2-declination" type="text">,
		Магнитный азимут: <input id="ma2-value" type="text">
	`,
	getValue: () => (numberIn("ma2-value") + numberIn("ma2-declination") - numberIn("ma2-convergence")),
	setValue: dd => setNumber("ma2-value", dd + numberIn("ma2-convergence") - numberIn("ma2-declination")),
});

// Тригонометрический круг
addRepresentation({
	groupName: "li-tc",
	html: `
		<svg id="tc" viewBox="0 0 100 100" style="width: 100px; height: 100px" onClick="representations['li-tc'].tcClick(event)">
			<line x1="0" y1="50" x2="100" y2="50" stroke="black"></line>
			<line x1="50" y1="100" x2="50" y2="0" stroke="black"></line>
			<circle cx="50" cy="50" r="40" stroke="black" fill="none"></circle>
			<line id="tc-arrow" x1="50" y1="50" stroke="red"></line>
		</svg>
	`,
	getValue: () => {
		let t = document.getElementById("tc-arrow");
		return Math.atan2(50 - t.getAttribute("y2"), t.getAttribute("x2") - 50) * 180 / Math.PI;
	},
	setValue: function(dd) { this.setArrow(dd*Math.PI/180) },
	tcClick: function(e) {
		let rect = document.getElementById("tc").getBoundingClientRect();
		let x = (e.clientX - rect.left) / (rect.right - rect.left) * 100;
		let y = (e.clientY - rect.top) / (rect.bottom - rect.top) * 100;
		x = Number.isNaN(x) ? 100 : x;
		y = Number.isNaN(y) ? 50 : y;
		let angle = Math.atan2(50 - y, x - 50);
		this.setArrow(angle);
		document.getElementById("li-tc").dispatchEvent(new Event("input", { bubbles: true }));
	},
	setArrow: function(radians) {
		document.getElementById("tc-arrow").setAttribute("x2", 50 + 40*Math.cos(radians));
		document.getElementById("tc-arrow").setAttribute("y2", 50 - 40*Math.sin(radians));
	},
});

//

numeral.register("locale", "ihnm", {
	delimiters: { thousands: " ", decimal: "." },
	abbreviations: { thousand: "тыс.", million: "млн.", billion: "млрд.", trillion: "трлн." },
	ordinal: function() { return "." },
	currency: { symbol: "руб." }
});
numeral.locale("ihnm");
numeral.defaultFormat("0[.][0000000]");

updateRepresentations(0, null);