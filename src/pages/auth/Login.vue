<template>
  <VaForm ref="form" @submit.prevent="submit">
    <h1 class="font-semibold text-4xl mb-4">登陆</h1>

    <VaInput
      v-model="formData.username"
      :rules="[validators.required, validators.username]"
      class="mb-4"
      label="用户名"
      type="text"
    />
    <VaValue v-slot="isPasswordVisible" :default-value="false">
      <VaInput
        v-model="formData.password"
        :rules="[validators.required]"
        :type="isPasswordVisible.value ? 'text' : 'password'"
        class="mb-4"
        label="密码"
        @clickAppendInner.stop="
          isPasswordVisible.value = !isPasswordVisible.value
        "
      >
        <template #appendInner>
          <VaIcon
            :name="
              isPasswordVisible.value ? 'mso-visibility_off' : 'mso-visibility'
            "
            class="cursor-pointer"
            color="secondary"
          />
        </template>
      </VaInput>
    </VaValue>

    <div class="flex justify-center mt-4">
      <VaButton class="w-full" @click="submit"> 登陆</VaButton>
    </div>
  </VaForm>
</template>

<script lang="ts" setup>
import { reactive } from "vue";
import { useRouter } from "vue-router";
import { useForm, useToast } from "vuestic-ui";
import { validators } from "../../services/utils";
// import { login } from '../../api/user'
import { setToken } from "../../utils/auth";
import { generateToken } from "../../services/utils";

const { validate } = useForm("form");
const { push } = useRouter();
const { init } = useToast();

const formData = reactive({
  username: "",
  password: "",
  keepLoggedIn: false,
});

const submit = () => {
  // ||  (formData.username === "umpool" &&
  // formData.password === "gT9@pY6uV*2S")
  if (
    formData.username === "admin" &&
    formData.password === "A3f!7#b2Pz9L"
  ) {
    const token = generateToken();
    setToken(token);
    init({ message: "登陆成功！", color: "success" });
    push({ name: "withdraw" });
  } else {
    init({ message: "登陆失败！", color: "error" });
  }
};

// const handleLogin = async () => {
//   const res = await login(formData)
//   if (res.token) {
//     setToken(res.token)
//     push({ name: 'dashboard' })
//   }
// }

/* ******接口调用******* */
// export default defineComponent({
//   setup() {
//     const router = useRouter()
//     const route = useRoute()

//     const handleLogin = async (formData: any) => {
//       try {
//         const res = await login(formData)
//         if (res.token) {
//           setToken(res.token)
//           // 获取重定向地址或默认跳转到首页
//           const redirectPath = route.query.redirect as string || '/'
//           router.push(redirectPath)
//         }
//       } catch (error) {
//         console.error('登录失败:', error)
//       }
//     }

//     return {
//       handleLogin
//     }
//   }
// })
</script>
