<template>
  <div class="wof__wheel-of-fortune">
    <svg class="wof__svg-wheel"
         ref="wheel"
         height="100%"
         width="100%"
         preserveAspectRatio="none"
         :viewBox="`0 0 ${svgWidth} ${svgHeight}`"
         @mousedown="handleMouseDown"
         @touchstart="handleTouchStart"
         @touchend="handleTouchEnd">

      <defs v-if="imageDisplayMode === 'Pattern' || imageDisplayMode === 'Resize'">
        <clipPath id="sector-clip">
          <path :d="createSvgArc(0, 0, svgContentRadius, -arcRadians / 2, arcRadians / 2)" />
        </clipPath>
      </defs>

     <!-- A circle shown if no sectors active -->
      <circle fill="#ccc"
              :cx="svgCenterX"
              :cy="svgCenterY"
              :r="svgContentRadius" />

      <g :transform="`translate(${svgCenterX} ${svgCenterY}) rotate(${-angle / Math.PI * 180})`">
        <template v-for="(sector, i) in processedSectors">
          <!-- Drawing sector -->
          <path :d="createSvgArc(0, 0, svgContentRadius, arcRadians * i, arcRadians * (i+1))"
                :fill="sector.color"
                :stroke="colors.textColor"
                :key="'arc'+sector.id"
                :stroke-width="svgStroke"/>
          <!-- Drawing image -->
          <g clip-path="url(#sector-clip)" :transform="'rotate(' + -(arcDegrees * (i + 0.5)) + ')'">
          <image v-if="imageDisplayMode === 'Fit' || imageDisplayMode === 'Resize'"
                 :transform="sector.transform"
                 x="0"
                 y="-1"
                 :width="sector.imageRatio"
                 height="1"
                 :href="sector.imageBlob"/>
          </g>
          <g :transform="'rotate(' + -(arcDegrees * (i + 0.5)) + ')'"
             :key="'labelGroup'+sector.id">
            <!-- Drawing labels -->
            <text :transform="'translate(' + (svgContentRadius / 2 + svgCenterRadius) +' 1)'"
                  font-size="6"
                  font-family="serif"
                  :key="'label'+sector.id"
                  :fill="colors.textColor"
                  text-anchor="middle"
                  pointer-events="none">
              {{sector.label}}
            </text>
          </g>
        </template>

        <!-- Highlighting variant selected by wheel -->
        <path :d="createSvgArc(0, 0, svgContentRadius, arcRadians * selectedSectorOrder, arcRadians * (selectedSectorOrder + 1))"
              fill="transparent"
              :stroke="colors.textColor"
              :stroke-width="svgFatStroke"/>
        <!-- Highlighting variant selected by user -->
        <path :d="createSvgArc(0, 0, svgContentRadius, arcRadians * highlightSegment, arcRadians * (highlightSegment + 1))"
              fill="transparent"
              v-show="highlightSegment !== -1"
              :stroke="colors.lowshadowColor"
              :stroke-width="svgFatStroke"/>
      </g>

      <polyline points="48,0 52,0 50,4" :fill="colors.textColor" />
      <circle :cx="svgCenterX" :cy="svgCenterY" :r="svgCenterRadius" :fill="colors.textColor" :stroke="colors.textColor"/>
    </svg>
  </div>
</template>

<script>
  import SCSSVariables from "~/assets/variables.scss";

  export default {
    props: {
      imageDisplayMode: { default: "Resize", type: String }, // "Resize" || "Fit"
               sectors: { default: ()=>([]), type: Array  }, // [{color: "#000000", image=Image(), imageBlob="img.svg", imageIsLoaded=true, label="Label", active="true"}]
                 angle: { default: 0,        type: Number }, // in radians
      highlightSegment: { default: -1,       type: Number }, // index of sector to highlight. -1 to not highlight
    },
    data() {
      return {
        dataContext: null,
        dataResizeObserver: null,
        dataPatternMode: null,
      };
    },
    created() {
      this.svgWidth = 100;
      this.svgHeight = 100;
      this.svgStroke = 0.25;
      this.svgFatStroke = 1;
      this.svgRadius = Math.min(this.svgWidth, this.svgHeight) / 2;
      this.svgContentRadius = this.svgRadius - Math.max(this.svgStroke, this.svgFatStroke);
      this.svgCenterRadius = 4;
      this.svgCenterX = this.svgWidth / 2;
      this.svgCenterY = this.svgHeight / 2;
      this.colors = SCSSVariables;
    },
    methods: {
      createSvgArc(x, y, r, startAngle, endAngle) {
        if (startAngle > endAngle) {
          var s = startAngle;
          startAngle = endAngle;
          endAngle = s;
        }
        if (endAngle - startAngle > Math.PI * 2 - 0.00001) {
          startAngle = 0;
          endAngle = Math.PI * 1.99999;
        }

        let largeArc = endAngle - startAngle <= Math.PI ? 0 : 1;

        return [
          "M", x, y,
          "L", x + Math.cos(startAngle) * r, y - Math.sin(startAngle) * r,
          "A", r, r, 0, largeArc, 0, x + Math.cos(endAngle) * r, y - Math.sin(endAngle) * r,
          "L", x, y
        ].join(" ");
      },
      pointIsOnWheel(x, y) {
        const deltaX = Math.abs(x - this.getCenterX());
        const deltaY = Math.abs(y - this.getCenterY());
        const onWheel = Math.pow(deltaX, 2) + Math.pow(deltaY, 2) < Math.pow(this.getRadius(), 2);
        const onCenter = Math.pow(deltaX, 2) + Math.pow(deltaY, 2) < Math.pow(this.svgCenterRadius, 2);
        return onWheel && !onCenter;
      },
      handleMouseDown(e) {
        if (this.pointIsOnWheel(e.clientX, e.clientY)) {
          this.$emit("wofMouseDown", e);
        }
      },
      handleTouchStart(e) {
        for (let i = 0; i < e.touches.length; i++) {
          if (this.pointIsOnWheel(e.touches[i].clientX, e.touches[i].clientY)) {
            this.$emit("wofTouchStart", e, i);
            break;
          }
        }
      },
      handleTouchEnd(e) {
        this.$emit("wofTouchEnd", e);
      },
      getCenterX: function() {
        let rect = this.$refs.wheel.getBoundingClientRect();
        return (rect.left + rect.right) / 2;
      },
      getCenterY: function() {
        let rect = this.$refs.wheel.getBoundingClientRect();
        return (rect.top + rect.bottom) / 2;
      },
      getRadius: function() {
        let rect = this.$refs.wheel.getBoundingClientRect();
        return (rect.right - rect.left) / 2;
      },
      onWindowResize() {
        this.dataClientRect = this.$refs.wheel.getBoundingClientRect();
      },
      getDisplayMods() {
        return ["Resize", "Fit"];
      },
    },
    computed: {
      activeSectors: function() {
        return this.sectors.filter(s => s.active);
      },
      arcRadians: function() {
        return 2 * Math.PI / this.activeSectors.length;
      },
      arcDegrees: function() {
        return 360 / this.activeSectors.length;
      },
      sectorChord: function() {
        return 2 * this.svgContentRadius * Math.sin(this.arcRadians / 2);
      },
      sectorChordHeight: function() {
        let a = this.svgContentRadius;
        let b = this.sectorChord;
        let s = 1 / 2 * a * a * Math.sin(this.arcRadians);
        return s / b * 2;
      },
      sectorCenterChord: function() {
        return this.sectorChord / this.svgContentRadius * this.svgCenterRadius;
      },
      sectorCenterChordHeight: function() {
        return this.sectorChordHeight / this.svgContentRadius * this.svgCenterRadius;
      },
      processedSectors: function() {
        let r = this.activeSectors.filter(() => true);

        for (let i = 0; i < r.length; i++) {
          if (r[i].imageIsLoaded) {
            let rotate = "";

            let imageRatio = r[i].image.width / r[i].image.height;
            let sectorRatio = (this.activeSectors.length === 1)
              ? 1 // sectorChord is 0 if sector fills the whole circle
              : this.svgContentRadius / this.sectorChord;
            let scale, scaleValue, xOffset;
            switch (this.imageDisplayMode) {
              case "Fit":
                if (r.length === 1) {
                  scaleValue = 2 * this.svgContentRadius * Math.sin(Math.atan(1/imageRatio));
                  xOffset = -imageRatio / 2;
                }
                else {
                  // Made a geogebra applet: https://www.geogebra.org/m/adwf8jbc
                  let tg1 = 1 / (imageRatio * 2);
                  let tg2 = Math.tan(this.arcRadians / 2);
                  let inboundRadiansHalf = Math.atan(tg1 * tg2 / (tg1 + tg2));
                  let inboundHeight = 2 * this.svgContentRadius * Math.sin(inboundRadiansHalf);
                  scaleValue = inboundHeight;
                  xOffset = inboundHeight / 2 / Math.tan(inboundRadiansHalf) / scaleValue - imageRatio;
                }
                break;

              default:
              case "Resize":
                if (r.length === 1) {
                  scaleValue = this.svgContentRadius * 2;
                  xOffset = -imageRatio / 2;
                }
                else {
                  scaleValue = (imageRatio < sectorRatio)
                    ? this.svgContentRadius / imageRatio
                    : this.svgContentRadius / sectorRatio;
                  xOffset = this.sectorCenterChordHeight / scaleValue;
                }
                break;
            }

            scale = "scale(" + scaleValue + ")";
            let translate = "translate(" + xOffset + " " + (this.svgCenterY / 100) + ")";

            r[i].imageRatio = imageRatio;
            r[i].transform = [scale, rotate, translate].join(" ");
          }
          else {
            r[i].imageRatio = 1;
            r[i].transform = "";
          }
        }
        return r;
      },
      selectedSectorOrder: function() {
        return Math.floor((Math.PI * 2 - this.angle + Math.PI / 2) % (Math.PI * 2) / this.arcRadians);
      },
      selectedSector: function() {
        return this.activeSectors[this.selectedSectorOrder];
      },
    },
  };
</script>

<style lang="scss" scoped>
  .wof {
    &__wheel-of-fortune {

    }
    &__svg-wheel {
      width: 100%;
    }
  }
</style>
