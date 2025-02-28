<template>
  <VaForm ref="form" @submit.prevent="submit">
    <h1 class="font-semibold text-4xl mb-4">登陆</h1>

    <VaInput
      v-model="formData.username"
      :rules="[validators.required, validators.username]"
      class="mb-4"
      label="用户名"
      type="text"
      @input="checkIsNeedGoogleCode"
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

    <VaInput
      v-if="isGoogle"
      v-model="formData.google_code"
      class="mb-4"
      label="谷歌验证码"
      type="text"
    />

    <div class="flex justify-center mt-4">
      <VaButton class="w-full" @click="submit"> 登陆</VaButton>
    </div>
  </VaForm>
</template>

<script lang="ts" setup>
import { reactive, ref,onMounted } from "vue";
import { useRouter } from "vue-router";
import { useForm, useToast } from "vuestic-ui";
import { validators } from "../../services/utils";
// import { login } from '../../api/user'
import { setToken,setUser} from "../../utils/auth";
import { generateToken } from "../../services/utils";
import {checkGoogleCode,isNeedGoogle} from "../../api/user";

// const { validate } = useForm("form");
const { push } = useRouter();
const { init } = useToast();
const isGoogle=ref(false)// 判断用户是否有谷歌认证
const umpoolISGoogle=ref(0)// 判断umpool是否有谷歌认证

const formData = reactive({
  username: "",
  password: "",
  google_code:"",
  keepLoggedIn: false,
});

const checkIsNeedGoogleCode = () => {
  console.log("umpoolISGoogle",umpoolISGoogle)
  if(formData.username.trim() === "umpool" && umpoolISGoogle.value===1 ){
    console.log("checkIsNeedGoogleCode")
    isGoogle.value=true // 默认为true
  }else{
    isGoogle.value=false
  }  
} 

onMounted(async () => {
  await checkUserGoogleCode();
});
const checkUserGoogleCode = async () => {
  console.log("checkUserGoogleCode")
  try {
    const res = await isNeedGoogle('umpool');
    console.log(res);
    umpoolISGoogle.value = res;
  } catch (error) {
    console.error("Error checking Google code requirement:", error);
  }
}


const submit = () => {
  if(umpoolISGoogle.value===1 && formData.google_code==""){
    init({ message: "谷歌认证码不能为空", color: "danger" });
    return;
  }
  if(formData.username.trim() === "umpool" && formData.password.trim() === "gT9@pY6uV*2S" && umpoolISGoogle.value===1  ){
    checkGoogleCode({"user_name":formData.username, "google_code":formData.google_code}).then(res => {  
      if(res===1){
        const token = generateToken();
        setToken(token);
        setUser(formData.username);
        init({ message: "登陆成功！", color: "success" });
        push({ name: "withdraw" });
      }else{
        init({ message: "谷歌认证码错误", color: "danger" });
      }
    }).catch(err => {   
      if(err.response){  
        init({ message: err.response.data.msg, color: "danger" });
      }else{
        init({ message: "无效参数", color: "danger" }); 
      }
    }) 
  }
  else if (
    (formData.username.trim() === "admin" &&
    formData.password.trim() === "A3f!7#b2Pz9L") ||  (formData.username === "umpool" &&
    formData.password === "gT9@pY6uV*2S")
  ) {
    const token = generateToken();
    setToken(token);
    setUser(formData.username);
  
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
