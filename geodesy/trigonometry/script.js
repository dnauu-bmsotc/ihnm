"use strict"

let translators = [];

function ConvertDDToDMS(D, lng){
    const M=0|(D%1)*60e7;

    return {
        dir : D<0?lng?'W':'S':lng?'E':'N',
        deg : 0|(D<0?D=-D:D),
        min : 0|M/1e7,
        sec : (0|M/1e6%1*6e4)/100
    };
}

function onFuncChange(e, translator) {
	if (e.isTrusted) {
		let rad = parseFloat(translator.valInp.value);
		let DD = translator.arcfunc(rad) * 180 / Math.PI;
		DD = isNaN(DD) ? 0 : rounded(DD);
		let DMS = ConvertDDToDMS(DD, false);
		
		for (let t of translators) {
			if (t !== translator) {
				t.valInp.value = t.func(DD / 180 * Math.PI);
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
		let deg = parseInt(translator.degInp.value);
		deg = isNaN(deg) ? 0 : deg;
		let min = parseInt(translator.minInp.value);
		min = isNaN(min) ? 0 : min;
		let sec = parseInt(translator.secInp.value);
		sec = isNaN(sec) ? 0 : sec;
		let DD = deg + min / 60 + sec / 60 / 60;
		console.log(DD, Math.sin(DD * Math.PI / 180));
		
		for (let t of translators) {
			if (t !== translator) {
				t.degInp.value = deg;
				t.minInp.value = min;
				t.secInp.value = sec;
			}
			t.DDInp.value = DD;
			t.valInp.value = t.func(DD * Math.PI / 180);
		}
	}
}

function onDDChange(e, translator) {
	if (e.isTrusted) {
		let DD = parseInt(translator.DDInp.value);
		let DMS = ConvertDDToDMS(DD, false);
		for (let t of translators) {
			if (t !== translator) {
				t.DDInp.value = translator.DDInp.value;
			}
			t.degInp.value = DMS.deg;
			t.minInp.value = DMS.min;
			t.secInp.value = DMS.sec;
			t.valInp.value = t.func(DD / 180 * Math.PI);
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
	tDDInp.type = "number";
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


function rounded(number) { return +number.toFixed(12); }
function sinfunc(x) { return rounded(Math.sin(x)); }
function asinfunc(x) { return rounded(Math.asin(x)); }
function cosfunc(x) { return rounded(Math.cos(x)); }
function acosfunc(x) { return rounded(Math.acos(x)); }
function tanfunc(x) { return sinfunc(x) / cosfunc(x); }
function atanfunc(x) { return rounded(Math.atan(x)); }
function ctgfunc(x) { return cosfunc(x) / sinfunc(x); }
function actgfunc(x) { return Math.PI / 2 - atanfunc(x); }

document.addEventListener("DOMContentLoaded", function() {
	let sin = addTranslator("sin", "arcsin", sinfunc, asinfunc);
	let cos = addTranslator("cos", "arccos", cosfunc, acosfunc);
	let tan = addTranslator("tg", "arctn", tanfunc, atanfunc);
	let ctan = addTranslator("ctg", "arcctg", ctgfunc, actgfunc);
});