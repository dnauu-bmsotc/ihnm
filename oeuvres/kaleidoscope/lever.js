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
    delete() {
        this.svgcanvas.remove();
        this.patternAnimation.delete();
    }
    setTypeChaos() {
        this.patternAnimation.setTypeChaos();
    }
    setTypeSpiral() {
        this.patternAnimation.setTypeSpiral();
    }
}

function createLever(id) {
    const container = document.createElement("div");
    container.classList.add("lever-svg-container");
    document.getElementById("lever").appendChild(container);

    const leverEl = document.createElementNS(ns, "svg");
    leverEl.setAttributeNS(null, "width", 128);
    leverEl.setAttributeNS(null, "height", 128);
    leverEl.setAttributeNS(null, "viewBox", "0 0 100 100");
    leverEl.classList.add("lever-svg");
    container.appendChild(leverEl);

    const animationButtonsContainer = document.createElement("div");
    animationButtonsContainer.classList.add("lever-animation-type-container");

    const button1 = document.createElement("button");
    button1.classList.add("animation-button-spiral");
    button1.addEventListener("click", () => lever.setTypeSpiral());
    animationButtonsContainer.appendChild(button1);

    const button2 = document.createElement("button");
    button2.classList.add("animation-button-chaos");
    button2.addEventListener("click", () => lever.setTypeChaos());
    animationButtonsContainer.appendChild(button2);

    container.appendChild(animationButtonsContainer);

    const lever = new Lever(
        leverEl, id, Number(document.getElementById('speed-slider').value)
    );
    lever.setTypeChaos();
    leverEl.addEventListener("click", () => setActiveLever(lever));
    leverEl.addEventListener("speedChange", e => lever.setSpeed(e.detail.value));

    return [container, lever];
}