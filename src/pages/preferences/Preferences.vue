<template>
  <h1 class="page-title">双重认证</h1>
  <div class="flex flex-col p-4 space-y-10 bg-backgroundSecondary rounded-lg">
    <div class="flex space-x-5">
      <PreferencesHeader />
    </div>
    <div class="space-y-4 md:space-y-6">
      <Settings
        @openNameModal="isEditNameModalOpen = true"
        @openResetPasswordModal="isResetPasswordModalOpen = true"
        @openAuthenticationModal="isEditAuthenticationModalOpen = true"
      />
    </div>
  </div>
  <EditNameModal
    v-if="isEditNameModalOpen"
    @cancel="isEditNameModalOpen = false"
  />
  <EditAuthenticationModal
    v-if="isEditAuthenticationModalOpen"
    @cancel="isEditAuthenticationModalOpen = false"
  />
   <!--<ResetPasswordModal
    v-if="isResetPasswordModalOpen"
    @cancel="isResetPasswordModalOpen = false"
  /> -->
</template>
<script lang="ts" setup>
import { ref } from "vue";

import PreferencesHeader from "./preferences-header/PreferencesHeader.vue";
import Settings from "./settings/Settings.vue";
import EditNameModal from "./modals/EditNameModal.vue";
import EditAuthenticationModal  from "./modals/EditAuthenticationModal.vue";
// import ResetPasswordModal from "./modals/ResetPasswordModal.vue";

const isEditNameModalOpen = ref(false);
const isResetPasswordModalOpen = ref(false);
const isEditAuthenticationModalOpen = ref(false);
</script>
