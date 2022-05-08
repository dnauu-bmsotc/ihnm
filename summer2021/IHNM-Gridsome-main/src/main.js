// This is the main.js file. Import global CSS and scripts here.
// The Client API can be used here. Learn more: gridsome.org/docs/client-api

import DefaultLayout from "~/layouts/Default.vue";
import Dropdown from "~/components/UI/Dropdown.vue";
import DropdownItem from "~/components/UI/DropdownItem.vue";
import DropdownSeparator from "~/components/UI/DropdownSeparator.vue";
import TextInput from "~/components/UI/TextInput.vue";
import NumberInput from "~/components/UI/NumberInput.vue";
import NumberInputStrict from "~/components/UI/NumberInputStrict.vue";
import StatesIcon from "~/components/UI/StatesIcon.vue";
import FileInput from "~/components/UI/FileInput.vue";
import "~/assets/styles.scss";

export default function (Vue, { router, head, isClient }) {
  // Set default layout as a global component
  Vue.component("Layout", DefaultLayout);
  Vue.component("Dropdown", Dropdown);
  Vue.component("DropdownItem", DropdownItem);
  Vue.component("DropdownSeparator", DropdownSeparator);
  Vue.component("TextInput", TextInput);
  Vue.component("NumberInput", NumberInput);
  Vue.component("NumberInputStrict", NumberInputStrict);
  Vue.component("StatesIcon", StatesIcon);
  Vue.component("FileInput", FileInput);
};
