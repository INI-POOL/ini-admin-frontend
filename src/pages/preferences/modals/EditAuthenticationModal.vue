<template>
    <VaModal
      :mobile-fullscreen="false"
      size="small"
      hide-default-actions
      max-width="380px"
      model-value
      close-button
      @update:modelValue="emits('cancel')"
    >
      <h1 class="va-h5 mb-4">谷歌认证</h1>
      <!-- <VaForm ref="form" @submit.prevent="submit"> -->
        <VaForm ref="form">  

        <VaImage
          class="w-full md:w-1/2 lg:w-1/3"
          :src="googleInfo?.qr_secret"
        />
        <!-- <VaInput v-model="googleInfo?.secret" class="mb-4" label="Email" placeholder="谷歌密钥" /> -->
        <VaInput v-model="google_code" class="mb-4" label="Name" placeholder="请输入谷歌认证码" />
        <div
          class="flex flex-col-reverse md:flex-row md:items-center md:justify-end md:space-x-4"
        >
          <VaButton
            :style="buttonStyles"
            preset="secondary"
            color="secondary"
            @click="emits('cancel')"
          >
            Cancel</VaButton
          >
          <VaButton
            :style="buttonStyles"
            class="mb-4 md:mb-0"
            type="submit"
            @click="submit"
          >
            Save</VaButton
          >
        </div>
      </VaForm>
    </VaModal>
  </template>
  <script lang="js" setup>
  import { ref } from "vue";
  import { useUserStore } from "../../../stores/user-store";
  import { getUser } from "../../../utils/auth";
  import { getGoogle, checkGoogleCode } from "../../../api/user";
  import { buttonStyles } from "../styles";
  import { useToast } from "vuestic-ui";
  
  const store = useUserStore();
  
  const { init } = useToast();
  
  const emits = defineEmits(["cancel"]);
  const form = ref();
  // const Name = ref<string>(store.userName);
  const googleInfo = ref();
  const google_code = ref('');
  
  const submit=()=>{
    if (!google_code.value) {
      const toastMessage = "谷歌认证码错误";    
      init({ message: toastMessage, color: "danger" });    
    }
    if (google_code.value) {
      const username=getUser(); 
      checkGoogleCode({user_name:username, google_code:google_code.value}).then(res=>{ 
        if(res==1){
          init({ message: "谷歌认证绑定成功", color: "success" }); 
          emits('cancel') 
          window.location.reload();
        }else{
          init({ message: "谷歌认证绑定失败", color: "danger" }); 
          emits('cancel') 
        }
      }).catch(err=>{
        init({ message: "谷歌认证绑定失败", color: "danger" }); 
        emits('cancel') 
      })  
    }
    
  };


const getGoogleInfo=async()=>{
  const username=getUser(); 
  const res=await getGoogle(username);
  // console.log(res);
  googleInfo.value=res;
  console.log(googleInfo.value);
}
getGoogleInfo();
</script>
  
<style lang="scss">
  // TODO temporary before https://github.com/epicmaxco/vuestic-ui/issues/4020 fix
  .va-modal__inner {
    min-width: 326px;
  }
  </style>
  