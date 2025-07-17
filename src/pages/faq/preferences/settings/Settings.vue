<template>
  <div
    class="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-6 min-h-[36px] leading-5"
  >
    <p class="font-bold w-[200px]">绑定谷歌认证器</p>
    <div class="flex-1">
      <div class="max-w-[748px]">
        <!-- {{ twoFA.content }} -->
        为您的帐户增加一层额外的安全保护。
        登录时，除了用户名和密码外，您还需要提供一个谷歌验证码（安全认证器）。
      </div>
    </div>
    <VaButton
      v-if="InipoolISGoogle==0"
      :style="buttonStyles"
      class="w-fit h-fit"
      preset="primary"
      @click="emits('openAuthenticationModal')"
    >
      绑定
    </VaButton>
    <!-- <VaButton
      :style="buttonStyles"
      class="w-fit h-fit"
      preset="primary"
      :color="twoFA.color"
      @click="toggle2FA"
    >
      {{ twoFA.button }}
    </VaButton> -->
  </div>
  <VaDivider />
 
</template>
<script lang="ts" setup>
import { computed,ref,onMounted } from "vue";

import { useToast } from "vuestic-ui";

import { useUserStore } from "../../../stores/user-store";
import {isNeedGoogle} from "../../../api/user";
import { getUser } from "../../../utils/auth";

import { buttonStyles } from "../styles";
const store = useUserStore();

const { init } = useToast();
const InipoolISGoogle=ref(0)// 判断Inipool是否有谷歌认证

onMounted(async () => {
  await checkUserGoogleCode();
});
const checkUserGoogleCode = async () => {
  try {
    const username=getUser();
    const res = await isNeedGoogle(username);
    // console.log(res);
    InipoolISGoogle.value = res;
  } catch (error) {
    console.error("Error checking Google code requirement:", error);
  }
}

const toastMessage = computed(() =>
  store.is2FAEnabled ? "2FA successfully enabled" : "2FA successfully disabled",
);

const twoFA = computed(() => {
  if (store.is2FAEnabled) {
    return {
      color: "danger",
      button: "Disable 2FA",
      content:
        "Two-Factor Authentication (2FA) is now enabled for your account, adding an extra layer of security to your sign-ins.",
    };
  } else {
    return {
      color: "primary",
      button: "Set up 2FA",
      content:
        "Add an extra layer of security to your account. To sign in, you’ll need to provide a code along with your username and password.",
    };
  }
});

const toggle2FA = () => {
  store.toggle2FA();
  init({ message: toastMessage.value, color: "success" });
};

const emits = defineEmits(["openNameModal", "openResetPasswordModal"]);

</script>
