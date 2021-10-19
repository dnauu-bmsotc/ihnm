"use strict"

let translators = [];

function ConvertDDToDMS(D){
	let deg = math.fix(D);
	let min = math.fix((D - deg) * 60);
	let sec = (D - deg - min / 60) * 60 * 60;
	return {
		deg: deg,
		min: min,
		sec: sec
	};
}

function onFuncChange(e, translator) {
	if (e.isTrusted) {
		let rad = 0;
		try {
			rad = math.evaluate(translator.valInp.value);
		}
		catch {
			rad = 0;
		}
		
		let DD = 0;
		try {
			DD = translator.arcfunc(rad) * 180 / math.PI;
		}
		catch {
		}
		
		let DMS = ConvertDDToDMS(DD);
		
		for (let t of translators) {
			if (t !== translator) {
				t.valInp.value = t.func(DD / 180 * math.PI);
			}
			t.degInp.value = DMS.deg;
			t.minInp.value = DMS.min;
			t.secInp.value = DMS.sec;
			t.DDInp.value = DD;
		}
	}
}

function onArcfuncChange(e, translator) {
	if (e.isTrusted) {
		let deg, min, sec, DD;
		
		try {
			deg = math.evaluate(translator.degInp.value);
			deg = isNaN(deg) ? 0 : deg;
		}
		catch {
			deg = 0;
		}
		
		try {
			min = math.evaluate(translator.minInp.value);
			min = isNaN(min) ? 0 : min;
		}
		catch {
			min = 0;
		}
		
		try {
			sec = math.evaluate(translator.secInp.value);
			sec = isNaN(sec) ? 0 : sec;
		}
		catch {
			sec = 0;
		}
		
		DD = deg + min / 60 + sec / 60 / 60;
		
		for (let t of translators) {
			if (e.target !== t.degInp) {
				t.degInp.value = deg;
			}
			if (e.target !== t.minInp) {
				t.minInp.value = min;
			}
			if (e.target !== t.secInp) {
				t.secInp.value = sec;
			}
			t.DDInp.value = DD;
			t.valInp.value = t.func(DD * math.PI / 180);
		}
	}
}

function onDDChange(e, translator) {
	if (e.isTrusted) {
		let DD = 0;
		try {
			DD = math.evaluate(translator.DDInp.value);
		}
		catch {
			DD = 0;
		}
		let DMS = ConvertDDToDMS(DD);
		for (let t of translators) {
			if (t !== translator) {
				t.DDInp.value = translator.DDInp.value;
			}
			t.degInp.value = DMS.deg;
			t.minInp.value = DMS.min;
			t.secInp.value = DMS.sec;
			t.valInp.value = t.func(DD / 180 * math.PI);
		}
	}
}

function addTranslator(name, arcname, func, arcfunc) {
	let translator = {};
	translator.name = name;
	translator.arcname = arcname;
	translator.func = func;
	translator.arcfunc = arcfunc;
	
	let table = document.getElementById("table");
	
	let row = document.createElement("tr");
	table.appendChild(row);
	
	let tName = document.createElement("td");
	tName.appendChild(document.createTextNode(name));
	row.appendChild(tName);
	
	let tVal = document.createElement("td");
	let tValInp = document.createElement("input");
	tValInp.addEventListener("input", (e)=>onFuncChange(e, translator));
	tVal.appendChild(tValInp);
	row.appendChild(tVal);
	
	let tArc = document.createElement("td");
	tArc.appendChild(document.createTextNode(arcname));
	row.appendChild(tArc);
	
	let tDeg = document.createElement("td");
	let tDegInp = document.createElement("input");
	tDegInp.addEventListener("input", (e)=>onArcfuncChange(e, translator));
	tDeg.appendChild(tDegInp);
	row.appendChild(tDeg);
	
	let tMin = document.createElement("td");
	let tMinInp = document.createElement("input");
	tMinInp.addEventListener("input", (e)=>onArcfuncChange(e, translator));
	tMin.appendChild(tMinInp);
	row.appendChild(tMin);
	
	let tSec = document.createElement("td");
	let tSecInp = document.createElement("input");
	tSecInp.addEventListener("input", (e)=>onArcfuncChange(e, translator));
	tSec.appendChild(tSecInp);
	row.appendChild(tSec);
	
	let tDD = document.createElement("td");
	let tDDInp = document.createElement("input");
	tDDInp.addEventListener("input", (e)=>onDDChange(e, translator));
	tDD.appendChild(tDDInp);
	row.appendChild(tDD);
	
	translator.valInp = tValInp;
	translator.degInp = tDegInp;
	translator.minInp = tMinInp;
	translator.secInp = tSecInp;
	translator.DDInp = tDDInp;
	
	translators.push(translator);
	return translator;
}

document.addEventListener("DOMContentLoaded", function() {
	let sin = addTranslator("sin", "arcsin", math.sin, math.asin);
	let cos = addTranslator("cos", "arccos", math.cos, math.acos);
	let tan = addTranslator("tg", "arctn", math.tan, math.atan);
	let ctan = addTranslator("ctg", "arcctg", math.cot, math.acot);
});