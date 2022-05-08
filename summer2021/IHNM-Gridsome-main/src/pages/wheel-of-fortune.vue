<template>
  <Layout :title="$t('wof.title')">
    <main>
      <WheelOfFortune class="wof__wheel"
                      :sectors="dataVariants"
                      :angle="dataAngle"
                      :imageDisplayMode="dataImageDidplayMode"
                      :highlightSegment="sectorToHighlight"
                      @wofMouseDown="wheelMouseDownHandler"
                      @wofTouchStart="wheelTouchStartHandler"
                      @wofTouchEnd="wheelTouchEndHandler"
                      ref="wheel"/>

      <div class="wof__controls">
        <button @click="spinClockWise">{{$t("wof.spinCWButton")}}<StatesIcon :images="['rotate-to-right-button.svg']"/></button>
        <button @click="spinCounterClockWise">{{$t("wof.spinCCWButton")}}<StatesIcon :images="['rotate-to-left-button.svg']"/></button>
        <button @mousedown="startBrake" @touchstart="touchStartBrake" @touchend="touchEndBrake">{{$t("wof.brakeButton")}}<StatesIcon :images="['underline-button.svg']"/></button>
        <button @mousedown="startAcceleration" @touchstart="touchStartAcceleration" @touchend="touchEndAcceleration">{{$t("wof.accelerateButton")}}<StatesIcon :images="['motorcycle.svg']"/></button>
        <button @click="stop">{{$t("wof.stopButton")}}<StatesIcon :images="['pause-button.svg']"/></button>
        <button @click="exclude">{{$t("wof.excludeButton")}}<StatesIcon :images="['swap.svg']"/></button>
      </div>

      <div class="wof__variants">
        <div class="wof__variants__item" v-for="(variant, i) in dataVariants">
          <input :key="'color-' + variant.id" type="color" class="color-input wof__variants__item--color-input" v-model="variant.color"/>

          <div :key="'image-'+variant.id" class="wof__variants__item--image">
            <FileInput accept="image/*" @fiChange="onVariantImageChange($event,variant)" @click="onVariantImageClick($event,variant)">
              <StatesIcon :images='["image1.svg", "image2.svg"]' :state="variant.imageBlob ? 1 : 0" />
            </FileInput>
          </div>

          <TextInput :key="'input-' + variant.id"
                     stretchAxis="y"
                     v-model="variant.label"
                     class="wof__variants__item--text-input"
                     @input="onVariantInputInput($event, variant)"
                     @keydown="onVariantInputKeydown($event, i)"
                     @focus="variant.focus=true"
                     @blur="variant.focus=false"
                     @mouseenter="variant.hover=true"
                     @mouseleave="variant.hover=false"
                     :ref="'variantInput' + i"
                     :placeholder="variant.imageName"/>

          <div :key="'active-'+variant.id" class="wof__variants__item--checkbox">
            <button @click="onVariantCheckboxClick(variant)">
              <StatesIcon :images='["blank.svg", "checked.svg"]' :state="variant.active ? 1 : 0" />
            </button>
          </div>

          <div :key="'delete-'+variant.id" class="wof__variants__item--delete">
            <button @click="onVariantDeleteButtonClick(variant)">
              <StatesIcon :images='["close.svg"]' :state="0" />
            </button>
          </div>
        </div>
      </div>

      <button class="wof__add-variant-button" @click="addVariant({})">
        {{$t("wof.addSector")}}
      </button>

      <div class="wof__variants-options">
        <button @click="shuffleVariants">
          <StatesIcon :images="['shuffle.svg']"/>
          {{$t("wof.shuffle")}}
        </button>
        <button @click="randomizeColors">
          <StatesIcon :images="['round-rgb-button.svg']"/>
          {{$t("wof.randomizeColors")}}
        </button>
        <div>
          {{$t("wof.imageDisplayMode")}}{{$t("wof.imageDisplayMode" + dataImageDidplayMode)}}
          <Dropdown>
            <template v-for="v in displayMods">
              <DropdownItem @click="changeImageDisplayMode(v)">
                <StatesIcon :images="['circle-outline.svg', 'radio-on-button.svg']" :state="dataImageDidplayMode === v ? 1 : 0"/>
                {{$t("wof.imageDisplayMode" + v)}}
              </DropdownItem>
            </template>
          </Dropdown>
        </div>
      </div>
    </main>
  </Layout>
</template>

<script>
  import WheelOfFortune from "~/components/wheel-of-fortune/WheelOfFortune.vue";

  export default {
    metaInfo() {
      return {
        title: this.$t("wof.title"),
      }
    },
    data() {
      return {
        dataVariants: [],
        dataVariantsCreated: 0,
        dataImageDidplayMode: "Resize",
        displayMods: [],
        dataAngle: 0,
        dataVelocity: 0,
        dataLastDragXPosition: null,
        dataLastDragYPosition: null,
        dataDragXPosition: null,
        dataDragYPosition: null,
        dataAccelerationButtonPressed: false,
        dataBrakeButtonPressed: false,
        dataIsDragged: false,
        dataDragTouch: 0,
        dataLastFrameTime: 0,
      };
    },
    created() {
      // Friction does not depend on velocity but I want it to.
      this.frictionMultilplier = 0.99975;
      this.frictionSubtraction = Math.PI * 0.0000018;
      this.acceleration = 0.0003;
      this.brake = 0.99;
      this.maxVelocity = Math.PI * 0.3;
      this.minSpinForce = Math.PI * 0.08;
      this.maxSpinForce = Math.PI * 0.17;
      this.dragSmoother = 0.0000012;

      this.addVariant({label: "Label1"});
      this.addVariant({label: "Label2"});
      this.addVariant({label: "Label3"});
      this.addVariant({label: "Label4"});
      this.addVariant({label: "Label5"});
    },
    mounted() {
      this.displayMods = this.$refs.wheel.getDisplayMods();
      window.addEventListener("mouseup", this.mouseUpHandler);
      this.dataLastFrameTime = Date.now();
      requestAnimationFrame(this.wheelAnimation);
    },
    beforeDestroy() {
      window.removeEventListener("mouseup", this.mouseUpHandler);
    },
    methods: {
      resetDragData() {
        this.dataIsDragged = false;
        this.dataLastDragMoment = 0;
        this.dataLastDragXPosition = null;
        this.dataLastDragYPosition = null;
        this.dataDragXPosition = null;
        this.dataDragYPosition = null;
        this.dataDragTouch = 0;
      },
      mouseUpHandler: function(e) {
        this.endBrake();
        this.endAcceleration();
        window.removeEventListener("mousemove", this.mouseMoveHandler);
        this.resetDragData();
      },
      startDragging(x, y) {
        this.dataLastDragXPosition = this.dataDragXPosition = x;
        this.dataLastDragYPosition = this.dataDragYPosition = y;
        this.dataIsDragged = true;
      },
      wheelMouseDownHandler: function(e) {
        window.addEventListener("mousemove", this.mouseMoveHandler);
        this.startDragging(e.clientX, e.clientY);
      },
      registerMouseMove(x, y) {
        let wheelX = this.$refs.wheel.getCenterX();
        let wheelY = this.$refs.wheel.getCenterY();
        let wheelR = this.$refs.wheel.getRadius();
        let distanceToCenter = Math.hypot(wheelX - x, wheelY - y);
        if (distanceToCenter > wheelR) {
          this.dataDragXPosition = wheelX + (x - wheelX) / distanceToCenter * wheelR;
          this.dataDragYPosition = wheelY + (y - wheelY) / distanceToCenter * wheelR;
        }
        else {
          this.dataDragXPosition = x;
          this.dataDragYPosition = y;
        }
      },
      mouseMoveHandler: function(e) {
        this.registerMouseMove(e.clientX, e.clientY);
      },
      wheelTouchStartHandler: function(e, i) {
        this.dataDragTouch = i;
        window.addEventListener("touchmove", this.touchMoveHandler);
        this.startDragging(e.touches[this.dataDragTouch].clientX, e.touches[this.dataDragTouch].clientY);
        e.preventDefault();
      },
      wheelTouchEndHandler: function(e) {
        window.removeEventListener("touchmove", this.touchMoveHandler);
        this.resetDragData();
      },
      touchMoveHandler: function(e) {
        this.registerMouseMove(e.touches[this.dataDragTouch].clientX, e.touches[this.dataDragTouch].clientY);
      },
      onVariantInputKeydown(e, order) {
        switch (event.keyCode) {
          case 13: // Enter
            order = parseInt(order);
            this.addVariant({}, order + 1);
            this.focusVariant(order + 1);
            e.preventDefault();
            break;
          case 38: // Arrow up
            this.focusVariant(order - 1 >= 0 ? order - 1 : this.dataVariants.length - 1);
            e.preventDefault();
            break;
          case 40: // Arrow down
            this.focusVariant(order + 1 < this.dataVariants.length ? order + 1 : 0);
            e.preventDefault();
            break;
        }
      },
      focusVariant(order) {
        this.$nextTick(() => {
          let refName = "variantInput" + order;
          this.$refs[refName][0].focus();
        });
      },
      onVariantInputInput(e, variant) {

      },
      spinClockWise() {
        this.dataVelocity -= this.minSpinForce + Math.random() * this.spinForceRange;
        this.dataVelocity = Math.max(this.dataVelocity, -this.maxVelocity);
      },
      spinCounterClockWise() {
        this.dataVelocity += this.minSpinForce + Math.random() * this.spinForceRange;
        this.dataVelocity = Math.min(this.dataVelocity, this.maxVelocity);
      },
      startBrake(e) {
        if (e.button === 0) {
          this.dataBrakeButtonPressed = true;
        }
      },
      endBrake(e) {
        this.dataBrakeButtonPressed = false;
      },
      touchStartBrake(e) {
        this.dataBrakeButtonPressed = true;
      },
      touchEndBrake(e) {
        this.dataBrakeButtonPressed = false;
      },
      startAcceleration(e) {
        if (e.button === 0) {
          this.dataAccelerationButtonPressed = true;
        }
      },
      endAcceleration(e) {
        this.dataAccelerationButtonPressed = false;
      },
      touchStartAcceleration(e) {
        this.dataAccelerationButtonPressed = true;
      },
      touchEndAcceleration(e) {
        this.dataAccelerationButtonPressed = false;
      },
      stop() {
        this.dataVelocity = 0;
        clearInterval(this.dataTimerId);
        this.dataTimerId = null;
      },
      triangleSquareThreeDots(x1, y1, x2, y2, x3, y3) {
        return 1 / 2 * (x2 - x1) * (y3 - y1) - (x3 - x1) * (y2 - y1);
      },
      wheelAnimation() {
        let timeNow = Date.now();
        let deltaTime = timeNow - this.dataLastFrameTime;
        this.dataAngle = (this.dataAngle + this.dataVelocity) % (Math.PI * 2);
        this.dataVelocity *= Math.pow(this.frictionMultilplier, deltaTime);
        if (this.dataVelocity > 0) {
          this.dataVelocity = Math.max(0, this.dataVelocity - this.frictionSubtraction * deltaTime);
        }
        else {
          this.dataVelocity = Math.min(0, this.dataVelocity + this.frictionSubtraction * deltaTime);
        }
        if (this.dataAccelerationButtonPressed) {
          if (this.dataVelocity > 0) {
            this.dataVelocity += this.acceleration * deltaTime;
          }
          else {
            this.dataVelocity -= this.acceleration * deltaTime;
          }
        }
        if (this.dataBrakeButtonPressed) {
          this.dataVelocity *= Math.pow(this.brake, deltaTime);
        }
        if (this.dataIsDragged) {
          let triangleSquare = this.triangleSquareThreeDots(
            this.dataDragXPosition, this.dataDragYPosition,
            this.dataLastDragXPosition, this.dataLastDragYPosition,
            this.$refs.wheel.getCenterX(), this.$refs.wheel.getCenterY()
          );
          this.dataVelocity = triangleSquare * this.dragSmoother * deltaTime;
          if (this.dataVelocity > 0) {
            this.dataVelocity = Math.min(this.dataVelocity, this.maxVelocity);
          }
          else {
            this.dataVelocity = Math.max(this.dataVelocity, -this.maxVelocity);
          }
          this.dataLastDragXPosition = this.dataDragXPosition;
          this.dataLastDragYPosition = this.dataDragYPosition;
        }
        this.dataLastFrameTime = timeNow;
        requestAnimationFrame(this.wheelAnimation);
      },
      addVariant(variant, index) {
        if (typeof variant !== "object") {
          variant = {};
        }
        // Properties should be defined before pushing into array so Vue processes it correctly
        const defineIfItIsNot = (variant, property, defaultValue) => {
          if (typeof variant[property] === "undefined") {
            variant[property] = defaultValue;
          }
        };
        defineIfItIsNot(variant, "color",         this.getRandomColor());
        defineIfItIsNot(variant, "image",         null);
        defineIfItIsNot(variant, "imageBlob",     "");
        defineIfItIsNot(variant, "imageName",     "");
        defineIfItIsNot(variant, "label",         "");
        defineIfItIsNot(variant, "active",        true);
        defineIfItIsNot(variant, "focus",         false);
        defineIfItIsNot(variant, "hover",         false);
        defineIfItIsNot(variant, "imageIsLoaded", false);
        defineIfItIsNot(variant, "id",            this.dataVariantsCreated);

        this.dataVariantsCreated += 1;
        if (typeof index === "undefined") {
          this.dataVariants.push(variant);
        }
        else {
          this.dataVariants.splice(index, 0, variant);
        }
      },
      getRandomColor() {
        let exponentialDistribution = function(lambda, x) {
          return Math.pow(lambda * Math.E, -lambda * x);
        }

        let h = Math.random() * 360;
        let s = Math.random() > 0.5
          ? (1 - exponentialDistribution(1, Math.random() * 4)) * 100
          : (0 + exponentialDistribution(1, Math.random() * 2)) * 100;
        let b = 100 - exponentialDistribution(1, Math.random() * 5) * 20;

        const HSBToRGB = (h, s, b) => {
          s /= 100;
          b /= 100;
          const k = (n) => (n + h / 60) % 6;
          const f = (n) => b * (1 - s * Math.max(0, Math.min(k(n), 4 - k(n), 1)));
          return [255 * f(5), 255 * f(3), 255 * f(1)];
        };

        const RGBToHex = (r, g, b) =>
          ((r << 16) + (g << 8) + b).toString(16).padStart(6, '0');

        return "#" + RGBToHex(...HSBToRGB(h, s, b).map(x => Math.round(x)));
      },
      randomizeColors() {
        for (let v of this.dataVariants) {
          v.color = this.getRandomColor();
        }
      },
      shuffleVariants() {
        let currentIndex = this.dataVariants.length, randomIndex;
        // While there remain elements to shuffle...
        while (0 !== currentIndex) {
          // Pick a remaining element...
          randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex--;
          // And swap it with the current element.
          let a = this.dataVariants[currentIndex];
          let b = this.dataVariants[randomIndex];
          this.dataVariants.splice(currentIndex, 1, b);
          this.dataVariants.splice(randomIndex, 1, a);
        }
      },
      onVariantDeleteButtonClick(variant) {
        this.dataVariants.splice(this.dataVariants.indexOf(variant), 1);
      },
      onVariantCheckboxClick(variant) {
        variant.active = !variant.active;
      },
      exclude(e) {
        if (this.$refs.wheel.activeSectors.length > 0) {
          this.$refs.wheel.selectedSector.active = false;
        }
      },
      onVariantImageChange(e, variant) {
        variant.imageBlob = URL.createObjectURL(e.target.files[0]);
        variant.image = new Image();
        variant.image.src = variant.imageBlob;
        variant.image.onload = function() {
          this.imageIsLoaded = true;
        }.bind(variant);
        variant.imageName = e.target.files[0].name;
      },
      onVariantImageClick(e, variant) {
        if (variant.imageBlob) {
          variant.image = null;
          variant.imageBlob = "";
          variant.imageIsLoaded = false;
          e.preventDefault();
        }
      },
      changeImageDisplayMode(mode) {
        this.dataImageDidplayMode = mode;
      },
    },
    computed: {
      spinForceRange: function() {
        return this.maxSpinForce - this.minSpinForce;
      },
      sectorToHighlight: function() {
        let hover = -1;
        for (let i = 0; i < this.dataVariants.length; i++) {
          if (this.dataVariants[i].focus && this.dataVariants[i].active) {
            return i;
          }
          if (this.dataVariants[i].hover && this.dataVariants[i].active) {
            hover = i;
          }
        }
        return hover;
      },
    },
    watch: {

    },
    components: {
      "WheelOfFortune": WheelOfFortune,
    },
  };
</script>

<style lang="scss" scoped>
  .wof {
    &__wheel {
      width: 100%;
      max-width: 512px;
      margin: auto;
    }
    &__controls {
      margin: 16px 0px;
      display: grid;
      grid-template-columns: 47% 47%;
      grid-auto-rows: minmax(48px, auto);
      column-gap: 6%;
      row-gap: 32px;
      justify-items: stretch;
      align-items: stretch;
      button {
        user-select: none;
        padding: 8px 32px 8px 16px;
        font-size: 16px;
        position: relative;
        font-family: sans-serif;
        .states-icon {
          width: 20px;
          height: 20px;
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
        }
      }
    }
    &__variants {
      display: block;
      margin: 16px 0px;
      &__item {
        display: flex;
        flex-flow: row nowrap;
        align-items: flex-end;
        justify-items: stretch;
        margin-top: 8px;
        border-bottom: 1px solid $lowshadow-color;
        &--color-input {
          background-color: transparent;
          flex: 0 0 32px;
          padding: 2px 4px;
          box-sizing: border-box;
        }
        &--text-input {
          display: inline-block;
          width: 100%;
          border-bottom-width: 0px;
        }
        &--checkbox, &--delete, &--image {
          button, .button {
            flex: 0 0 32px;
            border-radius: 5px 5px 0px 0px;
            margin: 0px 4px;
          }
          .states-icon {
            width: 16px;
            height: 16px;
          }
        }
      }
    }
    &__add-variant-button {
      display: block;
      width: 100%;
      margin: 8px 0px;
      padding: 8px;
    }
    &__variants-options {
      display: flex;
      flex-flow: row wrap;
      align-items: center;
      & > * {
        margin: 4px;
      }
      button {
        padding: 8px;
        font-size: 14px;
        font-family: sans-serif;
        .states-icon {
          width: 16px;
          height: 16px;
          margin-right: 8px;
        }
      }
    }
  }
</style>
