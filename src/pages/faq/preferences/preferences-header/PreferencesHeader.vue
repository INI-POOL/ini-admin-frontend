<template>
  <!-- <VaAvatar size="large" color="warning"
    >
    <span class="text-4xl"> 😍 </span></VaAvatar
  > -->
  <VaAvatar color="warning"> U.M </VaAvatar>
  <div class="flex flex-col justify-center">
    <h2 class="text-[28px] md:text-[32px] leading-10 font-bold">
      <!-- {{ store.userName }} -->
        {{ user }}
    </h2>
    <!-- <div class="flex space-x-1 text-[13px] leading-4">
      <p>Member since</p>
      <p>{{ store.memberSince }}</p>
    </div> -->
  </div>
</template>
<script lang="ts" setup>
import { useUserStore } from "../../../stores/user-store";
import{ getUser } from "../../../utils/auth";
const user = getUser();
const store = useUserStore();
</script>
