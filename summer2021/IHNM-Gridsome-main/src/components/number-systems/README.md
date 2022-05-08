# Creating new types of translators

При создании нового типа переводчика учитывайте следующие детали:
1. Новый тип переводчика нужно зарегистрировать в компоненте Translator.vue
   и там же добавить соответствующую опцию в выпадающем списке (метод render);
2. publicData должен содержать данные, по которым можно воссоздать переводчик;
3. publicData обязательно должен содержать свойство value типа BigNumber;
4. При обновлении свойств publicData должно генерироваться событие
   publicDataUpdate и передаваться сам объект publicData. Он не будет
   изменяться извне;
5. Чтобы сделать переводчик ведущим, нужно сгенерировать событие applyLeading и
   передать объект publicData;
6. Ошибки класса TranslatorError должны обрабатываться внутри самого
   переводчика.
7. Других жёстких требований нет, но рекомендую использовать следующий шаблон:

```javascript
<template>
  <AbstractTranslatorShell :error="dataError" :warning="dataWarning">

    <template v-slot:radix-content>
      Система счисления
    </template>

    <template v-slot:dropdown-options>
      <DropdownItem>Опция</DropdownItem>
      <DropdownSeparator />
      <!-- В слот ниже позже добавятся опции смены типа переводчика и его удаления -->
      <slot name="dropdown-options" />
    </template>

    <template v-slot:number-content>
      <NumberInput stretchAxis="y"
                   v-model="presentation"
                   :crease="true"
                   @decrease="handleNumberDecrease"
                   @input="handleNumberInput"
                   @increase="handleNumberIncrease"/>
    </template>

  </AbstractTranslatorShell>
</template>

<script>
  import AbstractTranslatorShell, { TranslatorError } from "~/components/number-systems/AbstractTranslatorShell";
  import NumberInput from "~/components/UI/NumberInput.vue";
  import BigNumber from "bignumber.js";

  export default {
    props: {
       alphabet: { required: true, type: String    }, // smth like "012..90ABC.."
      precision: { required: true, type: Number    }, // maximum number of decimal places
           step: { required: true, type: BigNumber }, // difference made by plus or minus buttons if translator has it
          value: { required: true, type: BigNumber }, // if this translator is not leading then it should watch this prop
        leading: { required: true, type: Boolean   }, // if other translators catch this one up
    },
    data() {
      return {
        dataValue: this.value,
        dataPresentation: "",
        dataError: "",
        dataWarning: "",
      };
    },
    created() {
      this.dataPresentation = this.fromDecimal(this.dataValue);
      this.$emit("publicDataUpdate", this.publicData);
    },
    methods: {
      clearMessages() {
        this.dataError = this.dataWarning = "";
      },
      onInput() {
        try {
          this.clearMessages();
          this.dataValue = this.toDecimal(this.dataPresentation);
        }
        catch(e) {
          if (e instanceof TranslatorError) {
            this.dataRadixError = e.message;
          }
          else if (e.message.indexOf("[BigNumber Error]") === 0) {
            this.dataNumberError = "Не удалось прочесть число";
          }
          else {
            this.dataError = "Internal error";
            throw e;
          }
          return "-";
        }
        finally {
          this.$emit("publicDataUpdate", this.publicData);
          this.$emit("applyLeading", this.publicData);
        }
      },
      toDecimal(presentation) {
        return BigNumber(presentation);
      },
      fromDecimal(value) {
        return value.toString();
      },
      showError(e) {
        if (e instanceof TranslatorError) {
          this.dataError = e.message;
          return true;
        }
        if (e.message.indexOf("[BigNumber Error]") === 0) {
          this.dataError = "Не удалось прочесть число";
          return true;
        }
        this.dataError = "Internal error";
        return false;
      },
    },
    computed: {
      publicData: function() {
        return {
          type: "NumericTranslator",
          presentation: this.dataPresentation,
          value: this.dataValue,
        }
      },
      succeeded: function() {
        return this.dataError === "";
      },
    },
    watch: {
      value: function(newVal, oldVal) {
        if (!this.leading) {
          this.dataValue = newVal;
          this.clearMessages();
          this.dataPresentation = this.fromDecimal(this.dataValue);
        }
      },
      alphabet: function(newVal, oldVal) {

      },
      precision: function(newVal, oldVal) {

      },
    },
    components: {
      "AbstractTranslatorShell": AbstractTranslatorShell,
      "NumberInput": NumberInput,
    },
  };
</script>

<style lang="scss" scoped>
</style>
```
