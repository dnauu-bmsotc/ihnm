class Lever {
    constructor(svgcanvas, id, speed, ns) {
        this.svgcanvas = svgcanvas;
        this.svgcanvasWidth = 100;
        this.svgcanvasHeight = 100;
        this.speed = speed;
        this.ns = ns || "http://www.w3.org/2000/svg";

        this.svgpattern = document.createElementNS(this.ns, "pattern");
        this.patternAnimation = new PatternAnimation(
            this.svgpattern,
            this.speed,
            this.onPatternChange.bind(this)
        );
        this.svgpattern.id = id;
        this.svgcanvas.appendChild(this.svgpattern);

        this.bgImage = document.createElementNS(this.ns, "image");
        this.bgImage.setAttributeNS(null, "x", 0);
        this.bgImage.setAttributeNS(null, "y", 0);  
        this.bgImage.setAttributeNS(null, "width", this.svgcanvasWidth);
        this.bgImage.setAttributeNS(null, "height", this.svgcanvasHeight);
        this.svgcanvas.appendChild(this.bgImage);

        this.firefly = document.createElementNS(this.ns, "circle");
        this.firefly.setAttributeNS(null, "stroke", "black");
        this.firefly.setAttributeNS(null, "fill", "white");
        this.svgcanvas.appendChild(this.firefly);
    }
    setSpeed(speed) {
        this.patternAnimation.setAcceleration(speed);
    }
    setImage(href) {
        this.patternAnimation.setImage(href);
        this.bgImage.setAttribute("href", href);
    }
    onPatternChange(x, y, size) {
        this.firefly.setAttributeNS(null, "cx", x * this.svgcanvasWidth);
        this.firefly.setAttributeNS(null, "cy", y * this.svgcanvasHeight);
        this.firefly.setAttributeNS(null, "r", 1 + 5*size);
    }
}