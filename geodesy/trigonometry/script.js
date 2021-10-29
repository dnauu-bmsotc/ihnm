"use strict"

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

function evaluate(expression) {
	let value = 0;
	try {
		value = math.evaluate(expression);
	}
	catch {
		value = 0;
	}
	if (typeof value !== "number") {
		value = 0;
	}
	return value;
}

function humanNotation(number) {
	return number.toLocaleString('fullwide', {useGrouping:false});
}

document.addEventListener("DOMContentLoaded", function() {
	const table = {
		data() {
			return {
				dd: 0,
				leader: null,
				translators: [
					{name: "sin", func: math.sin, arcname: "arcsin", arcfunc: math.asin},
					{name: "cos", func: math.cos, arcname: "arccos", arcfunc: math.acos},
					{name: "tan", func: math.tan, arcname: "arctan", arcfunc: math.atan},
					{name: "cot", func: math.cot, arcname: "arcctg", arcfunc: math.acot},
				],
			};
		},
		methods: {
			onDdInput(value, e) {
				this.leader = e.target;
				this.dd = value;
			},
		},
	};

	const app = Vue.createApp(table);
	
	app.component("trigonometry-input", {
		template: `<input v-on:input="onInput"/>`,
		props: ["value", "leader", "source"],
		methods: {
			onInput(e) {
				let value = evaluate(this.$el.value);
				if (value > 1000000) {
					value = Infinity;
				}
				let DD = this.source.arcfunc(value) * 180 / math.PI;
				this.$emit("dd-input", DD, e);
			},
		},
		watch: {
			value: function(newVal, oldVal) {
				if (this.leader !== this.$el) {
					let value = this.source.func(newVal * math.PI / 180);
					if (value > 1000000) {
						value = Infinity;
					}
					this.$el.value = humanNotation(value);
				}
			},
		},
	});
	
	app.component("arc-input", {
		template: `
			<div style="display: contents;">
				<div><input class="degInp" v-on:input="onDegInput"/></div>
				<div><input class="minInp" v-on:input="onMinInput"/></div>
				<div><input class="secInp" v-on:input="onSecInput"/></div>
			</div>
		`,
		props: ["value", "leader", "source"],
		methods: {
			onDegInput(e) {
				let deg = evaluate(this.degInp.value);
				this.$emit("dd-input", deg + this.minInp.value / 60 + this.secInp.value / 60 / 60, e);
			},
			onMinInput(e) {
				let min = evaluate(this.minInp.value);
				console.log(min);
				this.$emit("dd-input", this.degInp.value + min / 60 + this.secInp.value / 60 / 60, e);
			},
			onSecInput(e) {
				let sec = evaluate(this.secInp.value);
				this.$emit("dd-input", this.degInp.value + this.minInp.value / 60 + sec / 60 / 60, e);
			},
		},
		watch: {
			value: function(newVal, oldVal) {
				if (this.leader !== this.degInp &&
				    this.leader !== this.minInp &&
						this.leader !== this.secInp) {
					let DMS = ConvertDDToDMS(newVal);
					this.degInp.value = humanNotation(DMS.deg);
					this.minInp.value = humanNotation(DMS.min);
					this.secInp.value = humanNotation(DMS.sec);
				}
			},
		},
		computed: {
			degInp: function() {
				return this.$el.querySelector(".degInp");
			},
			minInp: function() {
				return this.$el.querySelector(".minInp");
			},
			secInp: function() {
				return this.$el.querySelector(".secInp");
			},
		},
	});

	app.component("dd-input", {
		template: `<input v-on:input="onInput"/>`,
		props: ["value", "leader", "source"],
		methods: {
			onInput(e) {
				let DD = evaluate(this.$el.value);
				this.$emit("dd-input", DD, e);
			},
		},
		watch: {
			value: function(newVal, oldVal) {
				if (this.leader !== this.$el) {
					this.$el.value = humanNotation(newVal);
				}
			},
		},
	});
	
	app.mount("#table");
});