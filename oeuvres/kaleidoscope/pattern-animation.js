class PatternAnimation {
    constructor(svgpattern, speed, callback, ns) {
        this.svgpattern = svgpattern;
        this.callback = callback;
        this.ns = ns || "http://www.w3.org/2000/svg";
        this.initSVGPattern();
        this.sliderAcceleration = speed;
        this.sliderX = new SliderAnimation(this.onXYChange.bind(this), this.sliderAcceleration);
        this.sliderY = new SliderAnimation(() => {}, this.sliderAcceleration);
        this.sliderS = new SliderAnimation(this.onSizeChange.bind(this), this.sliderAcceleration);
    }
    initSVGPattern() {
        this.svgpattern.setAttributeNS(null, "patternUnits", "userSpaceOnUse");
        this.image = document.createElementNS(this.ns, "image");
        this.svgpattern.appendChild(this.image)
        this.patternSize = 8;
    }
    onXYChange() {
        const x = this.sliderX.position,
              y = this.sliderY.position,
              s = this.sliderS.position;
        this.svgpattern.setAttributeNS(null, "x", (0.5-x) * this.patternSize);
        this.svgpattern.setAttributeNS(null, "y", (0.5-y) * this.patternSize);
        this.callback(x, y, s);
    }
    get patternSize() {
        return this._patternSize;
    }
    set patternSize(value) {
        this._patternSize = value;
        this.svgpattern.setAttributeNS(null, "width", value);
        this.svgpattern.setAttributeNS(null, "height", value);
        this.image.setAttributeNS(null, "width", value);
        this.image.setAttributeNS(null, "height", value);
    }
    onSizeChange(percentage) {
        this.patternSize = 12 + 8 * percentage;
    }
    setImage(href) {
        this.image.setAttributeNS(null, "href", href);
    }
    setAcceleration(newValue) {
        this.sliderX.setAcceleration(newValue);
        this.sliderY.setAcceleration(newValue);
        this.sliderS.setAcceleration(newValue);
    }
}