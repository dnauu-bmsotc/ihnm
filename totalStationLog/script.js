function addP(n) {
  if (n < 125) {
    return n + +$("#p100").val();
  }
  if (n < 175) {
    return n + +$("#p150").val();
  }
  return n + +$("#p200").val();
}

function round(n, accuracy) {
  let str = numeral(n).format("0." + "0".repeat(accuracy + 1));
  if ((str[str.length - 1] === "5") && (+str[str.length - 2] % 2 === 0)) {
    n = n - 1 / 10 ** (accuracy + 1) * Math.sign(n);
  }
  return Math.round(n * 10 ** accuracy) / 10 ** accuracy;
}

function sf(s) {
  return numeral(s).format("0.0");
}

function hf(h) {
  return numeral(h).format("0.00");
}

class Angle {
  constructor(dd, mm, sign=1) {
    if (mm === undefined) {
      this.dd = Math.floor(Math.abs(dd));
      this.mm = (Math.abs(dd) - Math.floor(Math.abs(dd))) * 60;
      this.sign = Math.sign(dd);
    }
    else {
      this.dd = dd; this.mm = mm; this.sign = sign;
    }
    this.$el = $(`
      <div class="angle"">
        <select class="sign">
          <option value="+">+</option>
          <option value="-">-</option>
        </select>
        <input class="angle-dd"></input>
        <input class="angle-mm"></input>
      </div>
    `);
    this.$el.on("input", this.input);
    this.updateHtml();
  }
  input() {
    console.log("input");
  }
  recalculate() {

  }
  updateHtml() {
    this.$el.find(".angle-dd").val(this.dd);
    this.$el.find(".angle-mm").val(numeral(round(this.mm, 1)).format("0.0"));
    this.$el.find(".sign").val(this.sign === -1 ? "-" : "+");
  }
  to360() {
    let ddd = (360 + this.degrees % 360) % 360;
    this.dd = Math.floor(Math.abs(ddd));
    this.mm = (Math.abs(ddd) - Math.floor(Math.abs(ddd))) * 60;
    this.sign = Math.sign(ddd);
    this.updateHtml();
  }
  get degrees() {
    return this.sign * (this.dd + this.mm / 60);
  }
}

class Dummy {
  constructor() {
    this.$el = $("<div></div>");
  }
  toString() {
    return "";
  }
  get isDummy() {
    return true;
  }
}

class Station {
  constructor(N, prevN, nextN, hl1, hl2, hr1, hr2, v1l, v1r, v2l, v2r, pipeHeight, labelHeight1, labelHeight2, l11, l12, l21, l22, nextStation) {
    this.N = N; this.prevN = prevN; this.nextN = nextN; this.hl1 = hl1; this.hl2 = hl2; this.hr1 = hr1; this.hr2 = hr2; this.v1l = v1l; this.v1r = v1r;
        this.v2l = v2l; this.v2r = v2r; this.pipeHeight = pipeHeight; this.labelHeight1 = labelHeight1; this.labelHeight2 = labelHeight2; this.l11 = l11;
        this.l12 = l12; this.l21 = l21; this.l22 = l22; this.nextStation = nextStation;
    this.$el = $(`<div class="station"></div>`);
    this.recalculate();
    this.updateHtml();
  }
  recalculate() {
    this.starting = (this.labelHeight1.constructor.name === "Dummy");
    this.ending = (this.labelHeight2.constructor.name === "Dummy");
    this.hl = new Angle(this.hl2.degrees - this.hl1.degrees);
    this.hr = new Angle(this.hr2.degrees - this.hr1.degrees);
    this.hl.to360();
    this.hr.to360();
    this.h = new Angle((this.hl.degrees + this.hr.degrees) / 2);
    this.MO1 = new Angle((this.v1l.degrees + this.v1r.degrees) / 2);
    this.v1 = new Angle((this.v1l.degrees - this.v1r.degrees) / 2);
    this.MO2 = new Angle((this.v2l.degrees + this.v2r.degrees) / 2);
    this.v2 = new Angle((this.v2l.degrees - this.v2r.degrees) / 2);
    this.l1 = round((this.l11 + this.l12) / 2, 1);
    this.l2 = round((this.l21 + this.l22) / 2, 1);
    this.d1 = addP(this.l1);
    this.d2 = addP(this.l2);
    this.s1 = round(this.d1 * Math.pow(Math.cos(this.v1.degrees * Math.PI / 180), 2), 1);
    this.s2 = round(this.d2 * Math.pow(Math.cos(this.v2.degrees * Math.PI / 180), 2), 1);
    this.h11 = round(this.s1 * Math.tan(this.v1.degrees * Math.PI / 180), 2);
    this.h21 = round(this.s2 * Math.tan(this.v2.degrees * Math.PI / 180), 2);
    this.dh1 = this.pipeHeight - this.labelHeight1;
    this.dh2 = this.pipeHeight - this.labelHeight2;
    this.h12 = this.h11 + this.dh1;
    this.h22 = this.h21 + this.dh2;
    this.hfw = this.h22;
    !this.nextStation.isDummy && this.nextStation.recalculate();
    !this.nextStation.isDummy && this.nextStation.updateHtml();
    this.hbw = this.nextStation.h12;
    this.hav = round((this.hfw + -this.hbw) / 2, 2);
  }
  updateHtml() {
    this.$el.html(`
        <div class="N"></div>
        <div class="Nvis column"></div>
        <div class="hor column"></div>
        <div class="hor2 column"></div>
        <div class="labels column"></div>
        <div class="ver column"></div>
        <div class="ver2 column"></div>
        <div class="l column"></div>
        <div class="s column"></div>
        <div class="h column"></div>
        <div class="h2 column"></div>
    `);
    this.$el.find(".N").append(`<div class="column"><span>${this.N}</span><span>${this.pipeHeight}</span></div>`);
    this.$el.find(".Nvis").append(`<span>${this.prevN}</span><span>${this.nextN}</span><span>${this.prevN}</span><span>${this.nextN}</span>`);
    this.$el.find(".hor").append([this.hl1.$el, this.hl2.$el, this.hr1.$el, this.hr2.$el]);
    this.$el.find(".hor2").append([this.hl.$el, this.h.$el, this.hr.$el]);
    if (this.starting) {
      this.$el.find(".labels").append(new Dummy().$el, new Dummy().$el);
      this.$el.find(".ver").append(new Dummy().$el, new Dummy().$el);
      this.$el.find(".ver2").append(new Dummy().$el, new Dummy().$el);
      this.$el.find(".l").append(new Dummy().$el, new Dummy().$el, new Dummy().$el);
      this.$el.find(".s").append(new Dummy().$el, new Dummy().$el);
      this.$el.find(".h").append(new Dummy().$el, new Dummy().$el, new Dummy().$el);
      this.$el.find(".h2").append(new Dummy().$el, new Dummy().$el, new Dummy().$el);
    }
    else {
      this.$el.find(".labels").append([$(`<span>${this.prevN}</span>`), $(`<span>${hf(this.labelHeight1)}</span>`)]);
      this.$el.find(".ver").append([this.v1l.$el, this.v1r.$el]);
      this.$el.find(".ver2").append([this.MO1.$el, this.v1.$el]);
      this.$el.find(".l").append(`<span>${this.l11}</span><span>${this.l12}</span><span>${this.l1}</span>`);
      this.$el.find(".s").append(`<span>${sf(this.d1)}</span><span>${sf(this.s1)}</span>`);
      this.$el.find(".h").append(`<span>${hf(this.h11)}</span><span>${hf(this.dh1)}</span><span>${hf(this.h12)}</span>`);
      this.$el.find(".h2").append(`<span>-</span><span>-</span><span>-</span>`);
    }
    if (this.ending) {
      this.$el.find(".labels").append(new Dummy().$el, new Dummy().$el);
      this.$el.find(".ver").append(new Dummy().$el, new Dummy().$el);
      this.$el.find(".ver2").append(new Dummy().$el, new Dummy().$el);
      this.$el.find(".l").append(new Dummy().$el, new Dummy().$el, new Dummy().$el);
      this.$el.find(".s").append(new Dummy().$el, new Dummy().$el);
      this.$el.find(".h").append(new Dummy().$el, new Dummy().$el, new Dummy().$el);
      this.$el.find(".h2").append(new Dummy().$el, new Dummy().$el, new Dummy().$el);
    }
    else {
      this.$el.find(".labels").append([$(`<span>${this.nextN}</span>`), $(`<span>${hf(this.labelHeight2)}</span>`)]);
      this.$el.find(".ver").append([this.v2l.$el, this.v2r.$el]);
      this.$el.find(".ver2").append([this.MO2.$el, this.v2.$el]);
      this.$el.find(".l").append(`<span>${this.l21}</span><span>${this.l22}</span><span>${this.l2}</span>`);
      this.$el.find(".s").append(`<span>${sf(this.d2)}</span><span>${sf(this.s2)}</span>`);
      this.$el.find(".h").append(`<span>${hf(this.h21)}</span><span>${hf(this.dh2)}</span><span>${hf(this.h22)}</span>`);
      this.$el.find(".h2").append(`<span>${hf(this.hfw)}</span><span>${hf(this.hbw)}</span><span>${hf(this.hav)}</span>`);
    }
  }
}

const totalStation = {
  pp26: null,
  i: null,
  ii: null,
  iii: null,
  pp68: null
};

function pUpdate() {
  totalStation.pp26.recalculate();
  totalStation.pp26.updateHtml();
}

$(document).ready(function() {
    totalStation.pp68 = new Station("ПП68", "III", "ПП69", new Angle(0, 3.5), new Angle(218, 36.0), new Angle(182, 24.0), new Angle(40, 55.5),
      new Angle(2, 7.5), new Angle(2, 6.5, -1), new Dummy(), new Dummy(), 1.46, 1.50, new Dummy(), 189.5, 188.9, new Dummy(), new Dummy(), new Dummy());
    totalStation.iii = new Station("III", "II", "ПП68", new Angle(0, 2.5), new Angle(306, 39.5), new Angle(182, 23.0), new Angle(128, 59.0),
      new Angle(1, 8.5, -1), new Angle(1, 9.0), new Angle(1, 56.0, -1), new Angle(1, 57.0), 1.52, 1.50, 2.00, 196.6, 196.6, 189.7, 189.3, totalStation.pp68);
    totalStation.ii = new Station("II", "I", "III", new Angle(0, 3.0), new Angle(98, 2.0), new Angle(181, 23.5), new Angle(279, 22.0),
      new Angle(1, 40.0, -1), new Angle(1, 39.0), new Angle(1, 19.5), new Angle(1, 20.5, -1), 1.35, 2.00, 2.00, 110.2, 110.0, 197.0, 196.4, totalStation.iii);
    totalStation.i = new Station("I", "ПП26", "II", new Angle(0, 2.0), new Angle(130, 24.0), new Angle(182, 22.5), new Angle(312, 43.5),
      new Angle(1, 14.0, -1), new Angle(1, 15.0), new Angle(2, 17.0), new Angle(2, 18.0, -1), 1.45, 2.00, 2.00, 101.5, 101.2, 110.5, 110.5, totalStation.ii);
    totalStation.pp26 = new Station("ПП26", "ПП25", "I", new Angle(0, 1.5), new Angle(168, 14.5), new Angle(181, 31.0), new Angle(349, 44.5),
      new Dummy(), new Dummy(), new Angle(1, 23.0), new Angle(1, 24.0, -1), 1.30, new Dummy(), 1.00, new Dummy(), new Dummy(), 101.5, 101.5, totalStation.i);
    $("#journal").append(Object.values(totalStation).map(s => s.$el));
});
