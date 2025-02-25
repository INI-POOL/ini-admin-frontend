// // import globals from "globals";
// // import tseslint from "typescript-eslint";
// import pluginVue from "eslint-plugin-vue";

// .eslintrc.js
/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    extends: [],
    rules: {},
  },
];

// /** @type {import('eslint').Linter.Config[]} */
// export default [
//   {
//     rules: {
//       "no-console": "off",
//       "no-debugger": "off",
//       // 关闭所有规则
//       ...Object.fromEntries(
//         Object.entries(pluginVue.configs.recommended.rules).map(([key]) => [
//           key,
//           "off",
//         ]),
//       ),
//     },
//   },
//   // { files: ["**/*.{js,mjs,cjs,ts,vue}"] },
//   // { languageOptions: { globals: globals.browser } },
//   // ...tseslint.configs.recommended,
//   // ...pluginVue.configs["flat/essential"],
//   // {
//   //   files: ["**/*.vue"],
//   //   languageOptions: { parserOptions: { parser: tseslint.parser } },
//   // },
// ];
