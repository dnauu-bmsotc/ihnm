'use strict'

// Configuring numeral.js
numeral.register("locale", "ihnm", {
	delimiters: { thousands: " ", decimal: "." },
	abbreviations: { thousand: "тыс.", million: "млн.", billion: "млрд.", trillion: "трлн." },
	ordinal: function() { return "." },
	currency: { symbol: "руб." }
});
numeral.locale("ihnm");
numeral.defaultFormat("0[.][000000]");

// Setting some functions
function numberIn($el) {
	let val = +$el.val().replace(/\,/g, ".");
	return (typeof val !== "number" || isNaN(val) ? 0 : val);
}

function setNumber($el, value) {
	$el.val((Math.abs(value) > 10**8) ? "" : numeral(value).format());
}

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

// Custom sign input element
class InputSign extends HTMLElement {
	connectedCallback() {
		$(this).html(`
			<select>
				<option value="+">+</option>
				<option value="-">-</option>
			</select>
		`);
	}
	get value() {
		return ($(this).find("select").value === "-" ? -1 : +1).toString();
	}
	set value(sign) {
		$(this).find("select").value = (+sign >= 0 ? "+" : "-");
	}
}
customElements.define("input-sign", InputSign);

// custom angle input element
class InputDMS extends HTMLElement {
	connectedCallback() {
		$(this).html(`
			<input-sign class="input-dms--sign"></input-sign>
			<input class="input-dms--d"></input>&#176;
			<input class="input-dms--m"></input>'
			<input class="input-dms--s"></input>"
		`);
	}
	get value() {
		return numberIn($(this).find(".input-dms--sign")) * (
			numberIn($(this).find(".input-dms--d"))
			+ numberIn($(this).find(".input-dms--m")) / 60
			+ numberIn($(this).find(".input-dms--s")) / 60 / 60).toString();
	}
	set value(dd) {
		let d, m, s;
		setNumber($(this).find(".input-dms--sign"), dd = +dd);
		dd = Math.abs(dd);
		setNumber($(this).find(".input-dms--d"), d = Math.trunc(dd));
		setNumber($(this).find(".input-dms--m"), m = Math.trunc((dd - d) * 60));
		setNumber($(this).find(".input-dms--s"), s = ((dd - d) * 60 - m) * 60);
	}
}
customElements.define("input-dms", InputDMS);

// Angle representations
const allRepresentations = [];
function addRepresentation(r) {
	let $li = $(`<li id="${r.groupName}">${r.html}</li>`);
	allRepresentations[r.groupName] = r;
	// Closure for updating other representations
	$li.on("input", () => {
		for (let key in allRepresentations) {
			if (allRepresentations[key].groupName !== r.groupName) {
				allRepresentations[key].setValue(r.getValue());
			}
		}
	});
	$("#list").append($li);
}

document.addEventListener('DOMContentLoaded', function() {
	document.querySelector("#li-dd input").value = 0;
	document.querySelector("#li-dd").dispatchEvent(new Event("input"));
});

// Градусы, минуты, секунды
addRepresentation({
	groupName: "li-g",
	html: `<input-dms></input-dms>`,
	getValue: () => $("#li-g input-dms").val(),
	setValue: dd => $("#li-g input-dms").val(dd),
});

// Только в градусах
addRepresentation({
	groupName: "li-dd",
	html: `Только в градусах: <input type="text">`,
	getValue: () => numberIn($("#li-dd input")),
	setValue: dd => setNumber($("#li-dd input"), dd),
});

// Синус
addRepresentation({
	groupName: "li-sin",
	html: `sin: <input type="text">`,
	getValue: () => Math.asin(numberIn($("#li-sin input"))) / Math.PI * 180,
	setValue: dd => setNumber($("#li-sin input"), Math.sin(dd * Math.PI / 180)),
});

// Косинус
addRepresentation({
	groupName: "li-cos",
	html: `cos: <input type="text">`,
	getValue: () => Math.acos(numberIn($("#li-cos input"))) / Math.PI * 180,
	setValue: dd => setNumber($("#li-cos input"), Math.cos(dd * Math.PI / 180)),
});

// Тангенс
addRepresentation({
	groupName: "li-tan",
	html: `tg: <input type="text">`,
	getValue: () => Math.atan(numberIn($("#li-tan input"))) / Math.PI * 180,
	setValue: dd => setNumber($("#li-tan input"), Math.tan(dd * Math.PI / 180)),
});

// Котангенс
addRepresentation({
	groupName: "li-ctg",
	html: `ctg: <input type="text">`,
	getValue: () => Math.atan(1 / numberIn($("#li-ctg input"))) / Math.PI * 180,
	setValue: dd => setNumber($("#li-ctg input"), 1 / Math.tan(dd * Math.PI / 180)),
});

// Только в минутах
addRepresentation({
	groupName: "li-mm",
	html: `Только в минутах: <input type="text">`,
	getValue: () => numberIn($("#li-mm input")) / 60,
	setValue: dd => setNumber($("#li-mm input"), dd * 60),
});

// Только в секундах
addRepresentation({
	groupName: "li-ss",
	html: `Только в секундах: <input type="text">`,
	getValue: () => numberIn($("#li-ss input")) / 3600,
	setValue: dd => setNumber($("#li-ss input"), dd * 3600),
});

// В градах
addRepresentation({
	groupName: "li-gon",
	html: `В градах: <input type="text">`,
	getValue: () => numberIn($("#li-gon input")) / 0.9,
	setValue: dd => setNumber($("#li-gon input"), dd * 0.9),
});

// В радианах
addRepresentation({
	groupName: "li-rad",
	html: `В радианах: <input type="text">`,
	getValue: () => numberIn($("#li-rad input")) / Math.PI * 180,
	setValue: dd => setNumber($("#li-rad input"), dd * Math.PI / 180),
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
			case 0: return (numberIn($("#rval")));
			case 1: return (180 - numberIn($("#rval")));
			case 2: return (180 + numberIn($("#rval")));
			case 3: return (360 - numberIn($("#rval")));
		};
	},
	setValue: dd => {
		dd = (360 + (dd % 360)) % 360;
				 if (0   <= (dd % 360) && (dd % 360) < 90)  { document.getElementById("rdir").selectedIndex = 0; setNumber($("#rval"), dd); }
		else if (90  <= (dd % 360) && (dd % 360) < 180) { document.getElementById("rdir").selectedIndex = 1; setNumber($("#rval"), 180 - dd); }
		else if (180 <= (dd % 360) && (dd % 360) < 270) { document.getElementById("rdir").selectedIndex = 2; setNumber($("#rval"), dd - 180); }
		else if (270 <= (dd % 360) && (dd % 360) < 360) { document.getElementById("rdir").selectedIndex = 3; setNumber($("#rval"), 360 - dd); }
	},
});
