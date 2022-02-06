"use strict"

const allTranslators = [];
window.value = new BigNumber(2022);

function addTranslator(radix) {
  const translator = document.createElement("li");
  translator.append(document.getElementById("ns-template").content.cloneNode(true));
  const radInput = translator.querySelector(".ns-rad");
  const numInput = translator.querySelector(".ns-num");
  radInput.value = radix;

  // Узнал что такое замыкание и использую везде где попало
  numInput.addEventListener("input", e => {
    updateTranslators(new BigNumber(numInput.value.replace(/\,/g, "."), +radInput.value), translator);
  });

  radInput.addEventListener("input", e => {
    updateTranslator(translator, window.value);
  });

  allTranslators.push(translator);
  updateTranslator(translator, window.value);
  document.getElementById("ns-list").appendChild(translator);
}

function updateTranslator(t, value) {
  t.querySelector(".ns-num").value = value.toString(+t.querySelector(".ns-rad").value);
}

function updateTranslators(value, exception) {
  for (let t of allTranslators) (t !== exception) && updateTranslator(t, value);
}
