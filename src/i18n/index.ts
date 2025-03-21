import { createI18n } from "vue-i18n";

const loadLocaleMessages = async () => {
  const cn = await import('./locales/cn.json'); // 动态导入中文语言包
  const en = await import('./locales/gb.json'); // 动态导入英文语言包
  return {
    cn: cn.default,
    en: en.default,
  };
};

// const fileNameToLocaleModuleDict = import.meta.glob<{
//   default: Record<string, string>;
// }>("./locales/*.json", {
//   eager: true,
// });

// const messages: { [P: string]: Record<string, string> } = {};

// Object.entries(fileNameToLocaleModuleDict)
//   .map(([fileName, localeModule]) => {
//     const fileNameParts = fileName.split("/");
//     const fileNameWithoutPath = fileNameParts[fileNameParts.length - 1];
//     const localeName = fileNameWithoutPath.split(".json")[0];

//     return [localeName, localeModule.default] as const;
//   })
//   .forEach((localeNameLocaleMessagesTuple) => {
//     messages[localeNameLocaleMessagesTuple[0]] =
//       localeNameLocaleMessagesTuple[1];
//   });
const i18n = createI18n({
  locale: localStorage.getItem('language') || 'cn', // 默认语言，从 localStorage 中读取
  fallbackLocale: 'cn', // 回退语言
  messages: {}, // 初始为空，稍后动态加载
});

loadLocaleMessages().then((messages) => {
  i18n.global.setLocaleMessage('cn', messages.cn);
  i18n.global.setLocaleMessage('en', messages.en);
});

export default i18n;

// export default createI18n({
//   // legacy: false,
//   locale: localStorage.getItem('language') || 'cn',
//   fallbackLocale: "cn",
//   messages,
// });
