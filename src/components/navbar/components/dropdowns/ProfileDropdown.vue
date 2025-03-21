<template>
  <div class="profile-dropdown-wrapper">
	      <div class="language-switcher mr-4">
	        <VaSelect
	          v-model="selectedLanguage"
	          :options="languageOptions"
	          @update:modelValue="changeLanguage"
	          class="language-select"
	        />
	      </div>
    <VaDropdown
      v-model="isShown"
      :offset="[9, 0]"
      class="profile-dropdown"
      stick-to-edges
    >
      <template #anchor>
        <VaButton preset="secondary" color="textPrimary">
          <span class="profile-dropdown__anchor min-w-max">
            <slot />
            <VaAvatar color="warning"> U.M </VaAvatar>
          </span>
        </VaButton>
      </template>

      <VaDropdownContent
        class="profile-dropdown__content md:w-60 px-0 py-4 w-full"
        :style="{ '--hover-color': hoverColor }"
      >
        <VaList v-for="group in options" :key="group.name">
          <!-- <header
            v-if="group.name"
            class="uppercase text-[var(--va-secondary)] opacity-80 font-bold text-xs px-4"
          >
            {{ t(`user.${group.name}`) }}
          </header> -->
          <VaListItem
            v-for="item in group.list"
            :key="item.name"
            class="menu-item px-4 text-base cursor-pointer h-8"
            v-bind="resolveLinkAttribute(item)"
          >
            <VaIcon :name="item.icon" class="pr-1" color="secondary" @click="" />
            {{ t(`admin.doubleCheck`) }}
          </VaListItem>
          <VaListItem
            key="logout"
            class="menu-item px-4 text-base cursor-pointer h-8"
            @click="logout"
          >
          <VaIcon name="mso-logout" class="pr-1" color="secondary"/>
            {{ t(`admin.logOut`) }}
          </VaListItem>

          <VaListSeparator v-if="group.separator" class="mx-3 my-2" />
        </VaList>
      </VaDropdownContent>
    </VaDropdown>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useColors } from "vuestic-ui";
import { removeToken } from "@/utils/auth";
import router from "@/router";
const { colors, setHSLAColor } = useColors();
const hoverColor = computed(() => setHSLAColor(colors.focus, { a: 0.1 }));

const { t } = useI18n();

// 语言选项
const languageOptions = [
  { value: 'cn', text: '中文' },
  { value: 'en', text: 'English' },
];
const selectedLanguage = ref(t.value || languageOptions[0]); // 当前选中的语言



// 切换语言
const changeLanguage = (language) => {
	console.log("t.value is",t.value)
	console.log("language is",language)
	// console.log('当前语言包:', i18n.global.messages);
  t.value = language; // 更新 i18n 的 locale
  localStorage.setItem('language', language.value); // 将语言设置保存到 localStorage
};

type ProfileListItem = {
  name: string;
  to?: string;
  href?: string;
  icon: string;
};

type ProfileOptions = {
  name: string;
  separator: boolean;
  list: ProfileListItem[];
};

withDefaults(
  defineProps<{
    options?: ProfileOptions[];
  }>(),
  {
    options: () => [
      {
        name: "account",
        separator: true,
        list: [
          {
            name: "profile",
            to: "preferences",
            icon: "health_and_safety",
          },
          // {
          //   name: "settings",
          //   to: "settings",
          //   icon: "mso-settings",
          // },
          // {
          //   name: "billing",
          //   to: "billing",
          //   icon: "mso-receipt_long",
          // },
          // {
          //   name: "projects",
          //   to: "projects",
          //   icon: "mso-favorite",
          // },
        ],
      },
      // {
      //   name: "explore",
      //   separator: true,
      //   list: [
      //     {
      //       name: "faq",
      //       to: "faq",
      //       icon: "mso-quiz",
      //     },
      //     {
      //       name: "helpAndSupport",
      //       href: "https://discord.gg/u7fQdqQt8c",
      //       icon: "mso-error",
      //     },
      //   ],
      // },
      // {
      //   name: "",
      //   separator: false,
      //   list: [
      //     {
      //       name: "logout",
      //       to: "login",
      //       icon: "mso-logout",
      //     },
      //   ],
      // },
    ],
  },
);

const isShown = ref(false);

const resolveLinkAttribute = (item: ProfileListItem) => {

  return item.to
    ? { to: { name: item.to } }
    : item.href
      ? { href: item.href, target: "_blank" }
      : {};
};
const logout = () => {
  removeToken();
  router.push({ name: "login" });
};
</script>

<style lang="scss">
.profile-dropdown {
  cursor: pointer;

  &__content {
    .menu-item:hover {
      background: var(--hover-color);
    }
  }

  &__anchor {
    display: inline-block;
  }
}
</style>
