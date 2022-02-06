'use strict'

// Configuring numeral.js
numeral.register("locale", "ihnm", {
	delimiters: { thousands: " ", decimal: "." },
	abbreviations: { thousand: "тыс.", million: "млн.", billion: "млрд.", trillion: "трлн." },
	ordinal: function() { return "." },
	currency: { symbol: "руб." }
});
numeral.locale("ihnm");
numeral.defaultFormat("0[.][0000000]");

// Каждый пункт на странице создаётся с помощью функции addRepresentation,
// которая принимает объект со следующими свойствами:
// groupName -- идентификатор пункта списка
// html -- содержимое пункта списка
// getValue -- когда в пункте списка возникает событие input, вызывается функция
//     getValue, которая должна вернуть значение угла в градусах
// setValue -- функция, принимающая количество градусов и устанавливающая это
//     значение в пункт списка.
// В объекте могут быть и другие свойства, обратиться к ним можно
// через this, или через allRepresentations[groupName].func.

const allRepresentations = {};
const startValue = 0;

// representation = {groupName, html, getValue, setValue};
function addRepresentation(representation) {
	let li = document.createElement("li");
	li.innerHTML = representation.html;
	li.id = representation.groupName;
	li.addEventListener("input", () => {
		let dd = representation.getValue();
		if (typeof dd !== "number" || isNaN(dd)) {
			dd = 0;
		}
		for (let key in allRepresentations) {
			if (allRepresentations[key].groupName !== representation.groupName) {
				allRepresentations[key].setValue(dd);
			}
		}
	});
	document.getElementById("list").appendChild(li);
	allRepresentations[representation.groupName] = representation;
	representation.setValue(startValue);
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
		Градусы: <input id="gdeg" type="text">,
		минуты: <input id="gmin" type="text">,
		секунды: <input id="gsec" type="text">.
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

// Тригонометрический круг (tcm - trigonometric circle mathematical)
addRepresentation({
	groupName: "li-tcm",
	html: `
		<span>Тригонометрический круг</span>
		<svg id="tcm" viewBox="0 0 100 100" style="width: 120px; height: 120px; vertical-align: middle" onClick="allRepresentations['li-tcm'].tcmClick(event)">
			<line x1="0" y1="50" x2="100" y2="50" stroke="black"></line>
			<line x1="50" y1="100" x2="50" y2="0" stroke="black"></line>
			<circle cx="50" cy="50" r="20" stroke="black" fill="none"></circle>
			<line id="tcm-arrow" x1="50" y1="50" stroke="red"></line>
			<text text-anchor="end" x="100" y="50" font-size="12">x</text>
			<text alignment-baseline="hanging" x="50" y="0" font-size="12">y</text>
			<text x="50" y="30" font-size="12">1</text>
			<text x="70" y="50" font-size="12">1</text>
			<path fill="rgb(0, 0, 0)" id="tcm-angle"></path>
		</svg>
	`,
	getValue: () => {
		let t = document.getElementById("tcm-arrow");
		return Math.atan2(50 - t.getAttribute("y2"), t.getAttribute("x2") - 50) * 180 / Math.PI;
	},
	setValue: function(dd) {
		dd = (360 + dd % 360) % 360;
		dd = dd < 180 ? dd : dd - 360;
		this.setArrow(dd * Math.PI / 180);
	},
	tcmClick: function(e) {
		let rect = document.getElementById("tcm").getBoundingClientRect();
		let x = (e.clientX - rect.left) / (rect.right - rect.left) * 100;
		let y = (e.clientY - rect.top) / (rect.bottom - rect.top) * 100;
		x = Number.isNaN(x) ? 100 : x;
		y = Number.isNaN(y) ? 50 : y;
		let angle = Math.atan2(50 - y, x - 50);
		this.setArrow(angle);
		document.getElementById("li-tcm").dispatchEvent(new Event("input", { bubbles: true }));
	},
	setArrow: function(radians) {
		document.getElementById("tcm-arrow").setAttribute("x2", 50 + 20*Math.cos(radians));
		document.getElementById("tcm-arrow").setAttribute("y2", 50 - 20*Math.sin(radians));
		document.getElementById("tcm-angle").setAttribute("d", createSvgArc(50, 50, 8, radians > 0 ? -radians : 0, radians > 0 ? 0 : -radians));
	},
});

// Истинный азимут по сближению меридианов
addRepresentation({
	groupName: "li-ta-convergence",
	html: `Сближение меридианов: <input id="ta-convergence" type="text" value="0">, Истинный азимут: <input id="ta-value" type="text">`,
	getValue: () => (numberIn("ta-value") - numberIn("ta-convergence")),
	setValue: dd => setNumber("ta-value", dd + numberIn("ta-convergence")),
});

// Магнитный азимут по поправке
addRepresentation({
	groupName: "li-ma1-correction",
	html: `Поправка направления: <input id="ma1-correction" type="text" value="0">, Магнитный азимут: <input id="ma1-value" type="text">`,
	getValue: () => (numberIn("ma1-value") + numberIn("ma1-correction")),
	setValue: dd => setNumber("ma1-value", dd - numberIn("ma1-correction")),
});

// Магнитный азимут по сближению меридианов и магнитному склонению
addRepresentation({
	groupName: "li-ma2-convergence-declination",
	html: `
		Сближение меридианов: <input id="ma2-convergence" type="text" value="0">,
		Магнитное склонение: <input id="ma2-declination" type="text" value="0">,
		Магнитный азимут: <input id="ma2-value" type="text">
	`,
	getValue: () => (numberIn("ma2-value") + numberIn("ma2-declination") - numberIn("ma2-convergence")),
	setValue: dd => setNumber("ma2-value", dd + numberIn("ma2-convergence") - numberIn("ma2-declination")),
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
		dd = (360 + (dd % 360)) % 360;
				 if (0   <= (dd % 360) && (dd % 360) < 90)  { document.getElementById("rdir").selectedIndex = 0; setNumber("rval", dd); }
		else if (90  <= (dd % 360) && (dd % 360) < 180) { document.getElementById("rdir").selectedIndex = 1; setNumber("rval", 180 - dd); }
		else if (180 <= (dd % 360) && (dd % 360) < 270) { document.getElementById("rdir").selectedIndex = 2; setNumber("rval", dd - 180); }
		else if (270 <= (dd % 360) && (dd % 360) < 360) { document.getElementById("rdir").selectedIndex = 3; setNumber("rval", 360 - dd); }
	},
});

// Дирекционный угол (tcg - trigonometric circle geodesic)
addRepresentation({
	groupName: "li-tcg",
	html: `
		<span>Дирекционный угол</span>
		<svg id="tcg" viewBox="0 0 100 100" style="width: 100px; height: 100px; vertical-align: middle" onClick="allRepresentations['li-tcg'].tcgClick(event)">
			<line x1="0" y1="50" x2="100" y2="50" stroke="black"></line>
			<line x1="50" y1="100" x2="50" y2="0" stroke="black"></line>
			<circle cx="50" cy="50" r="40" stroke="black" fill="none"></circle>
			<line id="tcg-arrow" x1="50" y1="50" stroke="red"></line>
			<text text-anchor="middle" alignment-baseline="middle" x="70" y="30" font-size="12">СВ</text>
			<text text-anchor="middle" alignment-baseline="middle" x="70" y="70" font-size="12">ЮВ</text>
			<text text-anchor="middle" alignment-baseline="middle" x="30" y="70" font-size="12">ЮЗ</text>
			<text text-anchor="middle" alignment-baseline="middle" x="30" y="30" font-size="12">СЗ</text>
			<path fill="rgb(0, 0, 0)" id="tcg-angle"></path>
		</svg>
	`,
	getValue: function() {
		let t = document.getElementById("tcg-arrow");
		return this.angleFromdxdy(t.getAttribute("x2") - 50, 50 - t.getAttribute("y2")) * 180 / Math.PI;
	},
	setValue: function(dd) {
		this.setArrow(((360+dd%360)%360)*Math.PI/180);
	},
	angleFromdxdy(dx, dy) {
		let angle = Math.abs(Math.atan(dx / dy));
		if (dx > 0 && dy > 0) angle = angle;
		if (dx > 0 && dy < 0) angle = Math.PI-angle;
		if (dx < 0 && dy < 0) angle = Math.PI+angle;
		if (dx < 0 && dy > 0) angle = 2*Math.PI-angle;
		return angle;
	},
	tcgClick: function(e) {
		let rect = document.getElementById("tcg").getBoundingClientRect();
		let x = (e.clientX - rect.left) / (rect.right - rect.left) * 100;
		let y = (e.clientY - rect.top) / (rect.bottom - rect.top) * 100;
		x = (Number.isNaN(x) ? 100 : x) - 50;
		y = 50 - (Number.isNaN(y) ? 50 : y);
		this.setArrow(this.angleFromdxdy(x, y));
		document.getElementById("li-tcg").dispatchEvent(new Event("input", { bubbles: true }));
	},
	setArrow: function(radians) {
		document.getElementById("tcg-arrow").setAttribute("x2", 50 + 40*Math.cos(Math.PI/2-radians));
		document.getElementById("tcg-arrow").setAttribute("y2", 50 - 40*Math.sin(Math.PI/2-radians));
		document.getElementById("tcg-angle").setAttribute("d", createSvgArc(50, 50, 12, -Math.PI/2, radians-Math.PI/2));
	},
});

// https://stackoverflow.com/questions/5736398/how-to-calculate-the-svg-path-for-an-arc-of-a-circle
function createSvgArc(x, y, radius, startRadians, endRadians) {
		function polarToCartesian(centerX, centerY, radius, radians) {
		  return {
		    x: centerX + (radius * Math.cos(radians)),
		    y: centerY + (radius * Math.sin(radians))
		  };
		}
    var start = polarToCartesian(x, y, radius, endRadians);
    var end = polarToCartesian(x, y, radius, startRadians);
    var largeArcFlag = Math.abs(endRadians - startRadians) <= Math.PI ? "0" : "1";
    var d = [
        "M", start.x, start.y,
        "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
				"L", x, y
    ].join(" ");
    return d;
}
