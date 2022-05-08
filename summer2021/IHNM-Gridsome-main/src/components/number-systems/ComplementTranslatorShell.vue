<template>
  <TranslatorShell :error="dataError" :warning="dataWarning">

    <template v-slot:radix-content>
      <template v-if="isOnesComplement">{{$t("ns.ComplementTranslator.Ones")}}</template>
      <template v-if="isTwosComplement">{{$t("ns.ComplementTranslator.Twos")}} </template>
      <NumberInputStrict v-model="dataRanks"
                         :minValue="2"
                         :maxValue="1024"
                         :step="0"
                         @input="onRanksInput" />{{$t("ns.ComplementTranslator.rankedBinary")}}
    </template>

    <template v-slot:dropdown-options>
      <slot name="dropdown-options" />
    </template>

    <template v-slot:number-content>
      <NumberInput v-model="dataPresentation"
                   :crease="!step.isZero()"
                   :placeholder="dataPlaceholder"
                   @decrease="handleNumberDecrease"
                   @input="handleNumberInput"
                   @increase="handleNumberIncrease" />
    </template>

  </TranslatorShell>
</template>

<script>
  import TranslatorShell, { TranslatorError } from "~/components/number-systems/TranslatorShell";
  import BigNumber from "bignumber.js";

  export default {
    props: {
         alphabet: { required: true,   type: String    },
        precision: { required: true,   type: Number    },
             step: { required: true,   type: BigNumber },
            value: { required: true,   type: BigNumber },
          leading: { required: true,   type: Boolean   },
            ranks: { default: 16,      type: Number    },
        usingMode: { default: "one's", type: String    }, // "one's" or "two's"
    },
    data() {
      return {
        dataValue: this.value,
        dataRanks: this.ranks,
        dataError: "",
        dataWarning: "",
        dataPresentation: "",
        dataMode: this.usingMode,
        dataPlaceholder: "",
      };
    },
    created() {
      this.dataPresentation = this.fromDecimal(this.dataRanks, this.dataValue);
      this.$emit("input", this.dataValue);
    },
    methods: {
      onRanksInput() {
        this.clearMessages();
        if (this.leading) {
          this.dataValue = this.toDecimal(this.dataRanks, this.dataPresentation);
        }
        else {
          this.dataPresentation = this.fromDecimal(this.dataRanks, this.dataValue);
        }
        this.$emit("input", this.dataValue);
      },
      creaseValue(addition) {
        if (this.succeeded) {
          this.clearMessages();
          this.dataValue = this.leading ? this.dataValue.plus(addition) : this.value.plus(addition);
          if (this.dataValue.lt(this.minValue) || this.dataValue.gt(this.maxValue)) {
            this.dataWarning = this.$t("ns.ComplementTranslator.tooLittleRanks");
          }
          else {
            this.dataPresentation = this.fromDecimal(this.dataRanks, this.dataValue);
            this.$emit("input", this.dataValue);
            this.$emit("applyLeading");
          }
        }
      },
      handleNumberDecrease() {
        this.creaseValue(this.step.times(-1));
      },
      handleNumberIncrease() {
        this.creaseValue(this.step.times(+1));
      },
      handleNumberInput() {
        this.clearMessages();
        this.dataValue = this.toDecimal(this.dataRanks, this.dataPresentation);
        this.$emit("input", this.dataValue);
        this.$emit("applyLeading");
      },
      toDecimal(ranks, presentation) {
        try {
          let strval = presentation.replace(/\s+/g, "");
          if (strval === "") {
            throw new TranslatorError(this.$t("ns.ComplementTranslator.emptyNumberInput"));
          }
          if (strval.includes(".") || strval.includes(",")) {
            throw new TranslatorError(this.$t("ns.ComplementTranslator.fractionsNotSupported"));
          }
          let neededZeros = ranks - strval.length;
          if (neededZeros > 0) {
            strval = this.zero.repeat(neededZeros) + strval;
            this.dataWarning = this.$t("ns.ComplementTranslator.fillZeros", { amount: neededZeros });
          }
          else if (neededZeros < 0) {
            throw new TranslatorError(this.$t("ns.ComplementTranslator.tooLargeValue"));
          }
          let value = new BigNumber(strval.slice(1), 2);
          if (strval[0] === this.one) {
            value = (new BigNumber(2).pow(ranks - 1)).minus(value).times(-1);
          }
          return value;
        }
        catch (e) {
          if (!this.showError(e)) {
            throw e;
          }
          return new BigNumber(0);
        }
      },
      fromDecimal(ranks, value) {
        try {
          if (!value.isInteger()) {
            this.dataWarning = this.$t("ns.ComplementTranslator.fractionsDiscarded");
            value = value.integerValue(BigNumber.ROUND_FLOOR);
          }
          if (value.gt(this.maxValue) || value.lt(this.minValue)) {
            throw new TranslatorError(this.$t("ns.ComplementTranslator.ranksNotEnough"));
          }
          let signBit = this.zero;
          let complement = "";
          if (value.isNegative()) {
            if (this.isOnesComplement) {
              signBit = this.one;
              complement = this.maxValue.plus(value).toString(2);
            }
            if (this.isTwosComplement) {
              if (value.isZero()) {
                signBit = this.zero;
                complement = "";
              }
              else {
                signBit = this.one;
                complement = this.maxValue.plus(value).plus(1).toString(2)
              }
            }
          }
          else {
            complement = value.toString(2);
          }
          let zerosNeeded = ranks - 1 - complement.length;
          let presentation = signBit + this.zero.repeat(zerosNeeded > 0 ? zerosNeeded : 0) + complement;
          return presentation.match(/.{1,4}(?=(.{4})*$)/g).join(" ");
        }
        catch (e) {
          if (!this.showError(e)) {
            throw e;
          }
          this.dataPlaceholder = "-";
          return "";
        }
      },
      showError(e) {
        if (e instanceof TranslatorError) {
          this.dataError = e.message;
          return true;
        }
        if (e.message.indexOf("[BigNumber Error]") === 0) {
          this.dataError = this.$t("ns.ComplementTranslator.parsingError");
          return true;
        }
        this.dataError = "Internal error";
        return false;
      },
      clearMessages() {
        this.dataError = this.dataWarning = "";
        this.dataPlaceholder = "";
      },
    },
    computed: {
      isOnesComplement() {
        return this.dataMode === "one's";
      },
      isTwosComplement() {
        return this.dataMode === "two's";
      },
      twoToPowerRanks() {
        return BigNumber(2).pow(this.dataRanks - 1);
      },
      maxValue() {
        if (this.isOnesComplement) {
          return this.twoToPowerRanks.minus(1);
        }
        if (this.isTwosComplement) {
          return this.twoToPowerRanks.minus(1);
        }
      },
      minValue() {
        if (this.isOnesComplement) {
          return this.twoToPowerRanks.minus(1).times(-1);
        }
        if (this.isTwosComplement) {
          return this.twoToPowerRanks.times(-1);
        }
      },
      zero() {
        return BigNumber.config().ALPHABET[0];
      },
      one() {
        return BigNumber.config().ALPHABET[1];
      },
      succeeded: function() {
        return this.dataError === "";
      },
    },
    watch: {
      value: function(newVal, oldVal) {
        if (!this.leading) {
          this.clearMessages();
          this.dataValue = newVal;
          this.dataError = this.dataWarning = "";
          this.dataPresentation = this.fromDecimal(this.dataRanks, this.dataValue);
        }
      },
      alphabet: function(newVal, oldVal) {
        this.clearMessages();
        this.dataPresentation = this.fromDecimal(this.dataRanks, this.dataValue);
      }
    },
    components: {
      "TranslatorShell": TranslatorShell,
    },
  };
</script>

<style lang="scss" scoped>
  .ns__translator__number {
    width: 100%;
    min-width: 128px;
    .number-input {
      width: 100%;
    }
  }
</style>
