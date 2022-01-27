"use strict"

function ConvertDDToDMS(D){
	let deg = math.fix(D);
	let min = math.fix(math.multiply(math.subtract(D, deg), 60));
	let sec = math.chain(D).subtract(deg).subtract(math.divide(min, 60)).multiply(60 * 60).done();
	return {
		deg: deg,
		min: min,
		sec: sec
	};
}

function evalExpr(expression) {
	let value = 0;
	try { value = math.evaluate(expression); }
	catch { value = 0; }
	(value === undefined) && (value = 0);
	return value;
}

function format(x, precision=15) {
	return math.format(x, { notation: "fixed", precision: precision });
}

function onInput(e) {
	let $input = $(e.target);
	let value = 0; // radians
	let dms;
	
	// Scanning if it is trigonometry input
	if ($input.hasClass("trigonometry-input")) {
		value = $input.data("translator").arcfunc(evalExpr($input.val()));
	}
	
	// Scanning if it is degrees minutes or seconds input
	if ($input.hasClass("geodesy-input")) {
		value = math.add(value, math.divide(evalExpr($input.data("translator").$degrees.val()), 60 ** 0));
		value = math.add(value, math.divide(evalExpr($input.data("translator").$minutes.val()), 60 ** 1));
		value = math.add(value, math.divide(evalExpr($input.data("translator").$seconds.val()), 60 ** 2));
		value = math.multiply(value, math.PI / 180);
	}
	
	// Scanning if it is DD input
	if ($input.hasClass("dd-input")) {
		value = math.multiply(evalExpr($input.val()), math.PI / 180);
	}
	
	dms = ConvertDDToDMS(math.multiply(value, 180 / math.PI));
	
	// Updating trigonometry values
	$(".trigonometry-input").each(function() {
		if (this !== e.target) {
			let trigonometryValue = $(this).data("translator").func(value);
			(trigonometryValue > Number.MAX_SAFE_INTEGER)  && (trigonometryValue =  math.Infinity);
			(trigonometryValue < Number.MIN_SAFE_INTEGER) && (trigonometryValue = -math.Infinity);
			$(this).val(format(trigonometryValue));
		}
	});
	
	// Updating degrees minutes and seconds
	$(".degrees-input").each(function() {
		let t = $(this).data("translator");
		(e.target !== t.$degrees[0]) && (t.$degrees.val(dms.deg));
		(e.target !== t.$minutes[0]) && (t.$minutes.val(dms.min));
		(e.target !== t.$seconds[0]) && (t.$seconds.val(format(dms.sec, 8)));
	});
	
	// Updating DD values
	$(".dd-input").each(function() {
		if (this !== e.target) {
			$(this).val(format(math.multiply(value, 180 / math.PI)));
		}
	});
}

document.addEventListener("DOMContentLoaded", function() {
	let translators = [
		{name: "sin", func: math.sin, arcname: "arcsin", arcfunc: math.asin},
		{name: "cos", func: math.cos, arcname: "arccos", arcfunc: math.acos},
		{name: "tan", func: math.tan, arcname: "arctan", arcfunc: math.atan},
		{name: "cot", func: math.cot, arcname: "arcctg", arcfunc: math.acot},
	];
	
	for (let translator of translators) {
		translator.$name         = $(`<span class="name">${translator.name}</span>`);
		translator.$trigonometry = $(`<input class="trigonometry-input"/>`);
		translator.$degrees      = $(`<input class="geodesy-input degrees-input"/>`);
		translator.$minutes      = $(`<input class="geodesy-input minutes-input"/>`);
		translator.$seconds      = $(`<input class="geodesy-input seconds-input"/>`);
		translator.$dd           = $(`<input class="dd-input"/>`);
		
		[translator.$name, translator.$trigonometry, translator.$degrees, translator.$minutes, translator.$seconds, translator.$dd].map(x => x.data("translator", translator));
		[translator.$name, translator.$trigonometry, translator.$degrees, translator.$minutes, translator.$seconds, translator.$dd].map(x => $("#table").append($("<div>").append(x)));
	}
	
	$("#table").on("input", onInput);
});