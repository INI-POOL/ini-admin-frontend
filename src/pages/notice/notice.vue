<template>
    <va-card class="machines-list">
        <!-- 搜索和过滤区域 -->
        <div class="mb-4">
            <div class="filters-row">
				内容查询：
				<va-input v-model="searchContent" placeholder="请输入消息内容" class="mb-1 mr-6" :style="{ maxWidth: '13%' }">
				    <template #prepend>
				        <!-- <va-icon name="mobile" /> -->
				    </template>
				</va-input>
				类型筛选：
				<va-select
				    v-model="selectNotice"
				    :options="noticeTypeOptions"
				    placeholder="请选择通知类型"
				    class="mb-1"
				    :style="{ maxWidth: '16%' }"
				/>
				<va-button @click="addVersionForm" color="rgb(47, 148, 172)" class="mb-1 ml-6">
				    新增通知
				</va-button>
				<va-button @click="refreshData" color="rgb(47, 148, 172)" class="mb-1 ml-6">
				    刷新
				</va-button>
				<VaModal
				    v-model="isAddModalVisible"
				    title="新增版本"
				    @cancel="onAddCancel"
				    @ok="onAddOk"
					:ok-disabled="true"
				>
				    <VaForm>
						<VaInput
						    v-model="addForm.version"
						    label="版本号"
							:rules="[validateVersion]"
							required
						    class="mb-2"
							placeholder="v1.0.0"
						/>
							<va-select
								v-model="addForm.system"
								label="操作系统"
								:options="systemWithOutAllOptions"
								placeholder="IOS"
								class="mb-2"
							/>
				        <VaInput
				            v-model="addForm.download_url"
				            label="下载链接"
				            type="url"
				            :rules="[validateURL]"
				            required
				            class="mb-2"
							placeholder="https://apps.apple.com/app/..."
				        />
						<VaInput
						    v-model="addForm.release_notes"
						    label="更新日志 (如需换行请用','隔开)"
						    type="textarea"
						    class="mb-2"
						/>
						<VaInput
						    v-model="addForm.release_notes_en"
						    label="更新日志英文版 (如需换行请用','隔开)"
						    type="textarea"
						    class="mb-2"
						/>
				    </VaForm>
				</VaModal>		
            </div>
        </div>

        <!-- 列表区域 -->
        <div class="table-responsive">
            
            <VaDataTable :items="notices" :columns="columns" striped class="responsive-table">
				<template #cell(created_time)="{ value }">
				    {{ formatDateTime(value) }}
				</template>
				<template #cell(content)="{ value }">
				   <template v-if="!value">无</template>
				
				   <a v-else :title="value" :href="value" target="_blank">  <!-- 悬浮显示完整内容 -->
					 {{ truncateText(value, 10) }}
				   </a>
				</template>
                <template #cell(actions)="{ row }">
					  <div class="action-container">
					    <!-- 主要操作：紧凑图标按钮 -->
						<va-button-group>
							<!-- <va-button 
								size="small"
								icon="edit"
								color="rgb(47, 148, 172)"
								@click="editVersion(row)"
								title="修改通知内容"
								class="action-icon"
							/>
							<va-button
							  icon="rocket_launch"
							  size="small"
							  color="rgb(47, 148, 172)"
							  title="推送"
							  @click="confirmPublish(row)"
							  class="action-icon"
							/> -->
							<va-button
							  size="small"
							  icon="delete"
							  color="rgb(208, 24, 39)"
							  title="删除版本"
							  @click="openDeleteConfirm(row.rowData)"
							  class="action-icon"
							/>
						</va-button-group>
					  </div>
                </template>
            </VaDataTable>
            
            <!-- 添加编辑弹窗 -->
            <VaModal
                v-model="isEditModalVisible"
                title="修改版本信息"
                @cancel="onCancel"
                @ok="onOk"
				:ok-props="{ color: 'rgb(47, 148, 172)', textColor: 'white' }"
				:cancel-props="{ color: 'rgb(47, 148, 172)', textColor: 'white' }"
            >
                <VaForm>
					<VaInput
					    v-model="editForm.version"
					    label="版本号"
					    type="string"
					    class="mb-3"
						readonly
					/>
					<VaInput
					    v-model="editForm.system"
					    label="系统"
					    type="string"
					    class="mb-3"
						readonly
					/>
                    <VaInput
                        v-model="editForm.download_url"
                        label="下载链接"
                        type="string"
                        class="mb-3"
                    />	
					<VaInput
					    v-model="editForm.release_notes"
					    label="更新日志 (如需换行请用','隔开)"
					    type="textarea"
					    class="mb-3"
					/>	
					<VaInput
					    v-model="editForm.release_notes_en"
					    label="更新日志英文版 (如需换行请用','隔开)"
					    type="textarea"
					    class="mb-3"
					/>	
                </VaForm>
            </VaModal>
			
			<va-modal v-model="isDatePickerVisible" hide-default-actions title="选择发布时间">
			    <VaDateInput v-model="date" />
				<VaTimeInput v-model="time" class="ml-2" />
			
			    <va-button-group>
					<va-button
					  block 
					  @click="onCronCancel"
					  color="rgb(47, 148, 172)"
					  class="mt-4"
					>
					  取消
					</va-button>
					<va-button
					  block 
					  @click="handleCronPublish"
					  :disabled="!isDateTimeValid"
					  color="rgb(47, 148, 172)"
					  class="mt-4 ml-2"
					>
					  确认发布
					</va-button>
				</va-button-group>

			  </va-modal>
			  			
			<VaModal
			    v-model="showConfirmDialog"
				title="系统提示"
				ok-text="🚀 确认发布"
				cancel-text="暂不发布"
			    @ok="handleConfirm"
			    @cancel="handleCancel"
			  >
				<template #header>
				  <div class="dialog-header">
					<va-icon name="warning" color="warning" />
					<span class="header-text">版本发布确认</span>
				  </div>
				</template>
			
				<div class="dialog-content">
				  <p class="version-info">
					即将为 <span class="system-highlight">{{ getSystemText(pendingSystem) }}</span> 系统发布版本：<span class="version-highlight">{{ pendingVersion }}</span>
				  </p>
				  <va-divider />
				  <p class="confirm-text">该操作将立即生效且不可逆转，请确认是否继续？</p>
				</div>
			  </VaModal>
			  
			    <VaModal
			      v-model="isDeleteConfirmVisible"
			      title="系统提示"
			      size="small"
			      :message="deleteConfirmMessage"
			      @ok="confirmDelete"
			      @cancel="cancelDelete"
			      ok-text="确认"
			      cancel-text="取消"
			      :ok-props="{ color: 'danger' }"
			    >
					<template #header>
					  <div class="dialog-header">
						<va-icon name="warning" color="warning" />
						<span class="header-text">确认删除？</span>
					  </div>
					</template>
				</VaModal>
				
				<va-modal v-model="showAddModal" hide-default-actions size="medium">
				      <template #header>
				        <h5 class="va-h5">发布新通知</h5>
				      </template>
				
				      <div class="modal-content">
				        <!-- 标题输入 -->
				        <va-input
				          v-model="title"
				          label="标题"
				          placeholder="请输入标题..."
				          class="mb-4"
				          :max-length="50"
				          counter
				        >
				          <template #counter="{ valueLength }">
				            <span :class="{ 'text-danger': valueLength > 50 }">
				              {{ valueLength }}/50
				            </span>
				          </template>
				        </va-input>
						
						<va-input
						  v-model="spec"
						  label="概述"
						  placeholder="请输入概述..."
						  class="mb-4"
						  :max-length="100"
						  counter
						>
						  <template #counter="{ valueLength }">
						    <span :class="{ 'text-danger': valueLength > 100 }">
						      {{ valueLength }}/100
						    </span>
						  </template>
						</va-input>
				
				        <!-- 内容输入 -->
				        <VaTextarea
				          v-model="content"
				          label="内容 (支持HTML语言)"
				          placeholder="请输入详细内容..."
				          autosize
				          :min-rows="10"
						  :max-rows="20"
				          :max-length="2000"
				          counter
				          class="mb-6"
						  :style="{ width: '1000px' }"
				        >
				          <template #counter="{ valueLength }">
				            <span :class="{ 'text-danger': valueLength > 2000 }">
				              {{ valueLength }}/2000
				            </span>
				          </template>
				        </VaTextarea>
				
				        <!-- 操作按钮 -->
				        <div class="flex justify-end gap-4">
				          <va-button
				            color="secondary"
				            @click="cancel"
				          >
				            取消
				          </va-button>
				          <va-button
				            :disabled="!isFormValid"
				            @click="handleSubmit"
				          >
				            提交
				          </va-button>
				        </div>
				      </div>
				    </va-modal>
					
        </div>

        <!-- 分页 -->
        <div class="flex justify-end mt-4">
            <VaPagination
                v-model="currentStartIndex"
                :page-size="queryParams.pagesize"
                visible-pages="5"
                :total="totalItems"
                buttons-preset="secondary"
                boundary-numbers
                @update:modelValue="handlePageChange"
            />
            <span class="ml-4 self-center text-gray-600">
                共 {{ totalItems }} 条记录
            </span>
        </div>
    </va-card>
</template>

<script setup>
import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'
import { ref, reactive, computed } from 'vue'
import { versionList, addVersion, modifyVersion, publishVersion,uploadApk,downloadApk,timedPublishVersion,deleteVersion } from "../../api/version"
import { noticeList, addNotice, modifyNotice, pushNotice,deleteNotice,noticeTypes } from "../../api/notice"
import { formatDateTime } from "../../utils/date.ts"
import { useToast, useForm } from "vuestic-ui"
import { saveAs } from 'file-saver'

const { init: toast } = useToast()

const { isValid, validate } = useForm('addFormRef')

const requiredAddRule = (value) => {
  return !!value?.trim() || '该字段为必填项'
}

const isDeleteConfirmVisible = ref(false)
const selectedVersion = ref(null)
const selectedSystem = ref(null)
const deleteId = ref(null)

const searchContent = ref('')

const selectNotice = ref('')

const showAddModal = ref(false)
const title = ref('')
const spec = ref('')
const content = ref('')

const noticeTypeOptions = ref([])

const openDeleteConfirm = (rowData) => {
  deleteId.value = rowData.id
  isDeleteConfirmVisible.value = true
}

const convertToOptions = (arr) => 
  arr.map(item => ({ value: item, text: item }));
const fetchNoticeOptions = async () => {
  try {
    const response = await noticeTypes()
	const defaultOption = { value: '', text: '所有' };
	noticeTypeOptions.value = [defaultOption, ...convertToOptions(response || [])];
  } catch (error) {
    toast({
      message: error,
      color: 'danger'
    })
  }
}

const titleLength = () => {
	return title.value.trim().length
}

const specLength = () => {
	return spec.value.trim().length
}

const contentLength = () => {
	return content.value.trim().length
}

const isFormValid = () => {
	console.log("titleLength is",titleLength())
		console.log("contentLength is",contentLength())
			console.log("specLength is",specLength())
	return titleLength() > 0 && 
		 titleLength() <= 50 &&
		 specLength() > 0 &&
		 specLength() <= 100 &&
		 contentLength() > 0 &&
		 contentLength() <= 2000
}

const resetAddNoticeForm = () => {
   title.value = ''
   spec.value = ''
   content.value = ''
}

const handleSubmit = async () => {
      if (!isFormValid()) {
        toast({
          message: '请检查输入内容是否符合要求',
          color: 'danger'
        })
        return
      }
	  
	  const params = {
		  title: title.value,
		  title_en: title.value,
		  spec: spec.value,
		  spec_en: spec.value,
		  content: content.value,
		  content_en: content.value
	  }
	
	  try {				  
	    await addNotice(params)
	    toast({ message: '新增成功', color:'rgb(47, 148, 172)' })
	  } catch (error) {
	    toast({ 
	      message: `删除失败: ${error.message || '未知错误'}`, 
	      color: 'danger' 
	    })
	  } finally {
		fetchData()
		resetAddNoticeForm()
	    showAddModal.value = false
	  }
}

const cancel = () => {
    resetAddNoticeForm()
    showAddModal.value = false
}

const confirmDelete = async () => {
  try {
    await deleteNotice(deleteId.value)
    toast({ message: '删除成功', color:'rgb(47, 148, 172)' })
    // 这里可以触发表格刷新逻辑
  } catch (error) {
    toast({ 
      message: `删除失败: ${error.message || '未知错误'}`, 
      color: 'danger' 
    })
  } finally {
	fetchData()
	fetchNoticeOptions()
    isDeleteConfirmVisible.value = false
  }
}

const cancelDelete = () => {
  toast({ message: '已取消删除', color: 'info' })
  isDeleteConfirmVisible.value = false
}

const uploading = ref({})
const downloading = ref({})

const hasValidFilePath = (row) => {
  // 检查对象层级
  if (!row || !row.rowData) return false
  
  // 检查路径有效性
  const path = row.rowData.file_path
  return typeof path === 'string' && path.trim().length > 0
}

const simulateStep = (delay) => {
  return new Promise((resolve) => setTimeout(resolve, delay));
};

const handleUpload = async (files, row) => {
  const rowId = row.rowData.id
  const file = files[0]
	
  const formData = new FormData()
  formData.append('file', file,file.name)
  formData.append('version', row.rowData.version)
  formData.append('system', row.rowData.system)
  	
  try {
	  
	  uploading.value[rowId] = true	  
	  const data = await uploadApk(formData)
	  if (data.success) {
	     uploadFiles.value[rowId] = []
	  }
	  await simulateStep(2000); 
	  uploading.value[rowId] = false
	  toast({
	      message: '上传成功',
	      color: "success",
		  duration: 5000
	  })
	  fetchData()
	  fetchNoticeOptions()
  } catch (error) {
	console.error('上传失败:', {
	  request: error.config,
	  status: error.response?.status,
	  data: error.response?.data  
	})
  }
}

const handleDownload = async (row) => {
  try {
	const rowId = row.rowData.id
	downloading.value[rowId] = true

    if (!row.rowData?.version || !row.rowData?.system) {
      ElMessage.error('请选择要下载的版本')
	  return
    }

    const response = await downloadApk({
      version: row.rowData.version,
      system: row.rowData.system
    })

    // 获取文件名（兼容大小写）
    const fileName = decodeURIComponent(
      response.headers['x-file-name'] || 
      response.headers['X-File-Name'] || 
      `${row.rowData.file_name}`
    )

    // 创建并触发下载
    saveAs(new Blob([response.data]), fileName)
	await simulateStep(2000); 
	downloading.value[rowId] = false
  } catch (error) {
    console.error('下载失败:', error)
    
    // 统一错误处理
    let message = '下载失败，请重试'
    
    if (error.response?.data instanceof Blob) {
      try {
        const text = await error.response.data.text()
        message = JSON.parse(text).error || message
      } catch {
        message = '服务器返回异常'
      }
    }
    
    ElMessage.error(message)
  }
}

const uploadFiles = reactive({})

const systemOptions = ref([
	{ value: '', text: '所有' },
    { value: 'ios', text: 'IOS' },
    { value: 'android', text: 'Android' },
])

const systemWithOutAllOptions = ref([
    { value: 'ios', text: 'IOS' },
    { value: 'android', text: 'Android' },
])

const searchSystem = ref(systemOptions[0])

const publishTime = ref()

const time = ref(new Date())
const date = ref(new Date())

const isDatePickerVisible = ref(false)
const selectedDateTime = ref(new Date())
const rowData = ref({}) // 根据实际数据结构调整

const requiredRule = value => !!value || '必须选择时间'
const dateValidationRule = value => {
  const now = new Date()
  const selected = new Date(value)
  
  // 时间必须晚于当前
  if (selected <= now) return '时间必须晚于当前'
  
  return true
}

const cronForm = reactive({
	version: '',
	system: ''
})

// 计算属性
const isDateTimeValid = computed(() => 

  requiredRule(date.value) === true &&
  dateValidationRule(time.value) === true
)

const showPublishButton = computed(() => 
  ['0', 0].includes(rowData.value.is_latest)
)

// 打开选择器
const openDatePicker = (row) => {
  time.value = new Date() // 重置为当前时间
  date.value = new Date()
  cronForm.version = row.rowData.version
  cronForm.system = row.rowData.system
  isDatePickerVisible.value = true
}

const getSystemText = (system) => {
	if (system === "android") {
		return "Android"
	}else {
		return "IOS"
	}
}
  
const currentStartIndex = ref(1)
const totalItems = ref(0)
const notices = ref([])
const loading = ref(false)

const showConfirmDialog = ref(false)
const pendingVersion = ref(null)
const pendingSystem = ref(null)
const deletePendingVersion = ref(null)
const deletePendingSystem = ref(null)

const confirmPublish = (row) => {
  pendingVersion.value = row.rowData.version
  pendingSystem.value = row.rowData.system
  showConfirmDialog.value = true
  
}

const handleConfirm = async () => {
  try {
	await publishNewVersion(pendingVersion.value,pendingSystem.value)
  } catch (error) {
  } finally {
	showConfirmDialog.value = false
  }
}

const handleCronPublish = async () => {
	const combinedDate = date.value
	combinedDate.setHours(time.value.getHours())
	combinedDate.setMinutes(time.value.getMinutes())
	combinedDate.setSeconds(0)

	const params = {
		version: cronForm.version,
		system: cronForm.system,
		release_time: combinedDate.toLocaleString()
	}
	try {
		await cronPublishVersion(params)
	} catch (error) {
	} finally {
		isDatePickerVisible.value = false
	}
}

const handleCancel = () => {
  toast({ message: '已取消发布', color: 'warning' })
  showConfirmDialog.value = false
}

const validateVersion = (value) => {
  if (!value) return '版本号不能为空'  // 补充空值判断
    const pattern = /^v\d+\.\d+\.\d+(-[a-zA-Z0-9]+)?$/
    return pattern.test(value) || '格式示例：v1.0.0 或 v2.3.4-beta'
}

// URL格式验证
const validateURL = (value) => {
	if (!value) return '下载链接不能为空'  // 补充空值判断
	  try {
		new URL(value)
		return true
	  } catch {
		return '请输入有效的URL地址'
	  }
}

const formValid = computed(() => {
	console.log("version is",addForm.version)
	console.log("download_url is",addForm.download_url)
  return validateVersion(addForm.version) === true &&
         validateURL(addForm.download_url) === true
})

const queryParams = reactive({
    page: 1,
    pagesize: 15,
})

const isAddModalVisible = ref(false)
const isPublishVisible = ref(false)
const addForm = reactive({
	version: '',
	system: '',
	download_url: '',
	release_notes: '',
	release_notes_en: ''
})

const addVersionForm = () => {
    showAddModal.value = true
}

const truncateText = (text, maxLength) => {
      if (!text) return ''
      return text.length > maxLength 
        ? text.slice(0, maxLength) + '...' 
        : text
}

// 修改 fetchData 方法
const fetchData = async () => {
    loading.value = true
    try {
        const params = {
            page: queryParams.page,
            pagesize: queryParams.pagesize,
			content: searchContent?.value,
			type: selectNotice.value?.value
        }
		
		if (searchSystem) {
			params.system = searchSystem.value?.value
		}

        const res = await noticeList(params)
        // 因为拦截器已经处理了 res.data 的解构，这里直接使用返回值
        if (res?.notices) {
            notices.value = res.notices
            totalItems.value = res.total
        } else {
            notices.value = []
            totalItems.value = 0
        }
    } catch (error) {
        console.error("获取数据失败:", error)
        toast({
            message: error.message || "获取数据失败",
            color: "danger",
        })
        notices.value = []
        totalItems.value = 0
    } finally {
        loading.value = false
    }
}

import { watch } from 'vue'

watch([searchSystem,searchContent,selectNotice], () => {
    queryParams.page = 1
    currentStartIndex.value = 1
    fetchData()
	fetchNoticeOptions()
})

const columns = [
	 { key: 'id', label: '序号' },
    { key: 'title', label: '标题' },
	{ key: 'type', label: '通知类型' },
	{ key: 'spec', label: '概览' },
    { key: 'content', label: '内容' },
    { key: 'created_time', label: '通知时间' },
    { key: 'actions', label: '操作' }  // 添加操作列
]

const isEditModalVisible = ref(false)
const editForm = reactive({
	version: '',
	system: '',
	release_notes: '',
	release_notes_en: '',
	download_url: ''
})

const editVersion = (row) => {
    editForm.version = row.rowData.version
	editForm.system = row.rowData.system
	editForm.download_url = row.rowData.download_url
    editForm.release_notes = row.rowData.release_notes
	editForm.release_notes_en = row.rowData.release_notes_en
    isEditModalVisible.value = true
}

const onOk = async () => {
    try {
        const msg = await modifyVersion(editForm.version,editForm.system, {
            download_url: editForm.download_url,
            release_notes: editForm.release_notes,
			release_notes_en: editForm.release_notes_en
        })
        toast({
            message: msg,
            color: "success",
        })
        await fetchData()
        isEditModalVisible.value = false
    } catch (error) {
        console.error("修改失败:", error)
        toast({
            message: error.message || "修改失败",
            color: "danger",
        })
    }
}

const publishNewVersion = async (version,system) => {
    try {
        const msg = await publishVersion(version,system)
		toast({
		  message: msg,
		  color: 'success',
		  duration: 3000
		})
        await fetchData()
		fetchNoticeOptions()
    } catch (error) {
        toast({
            message: error.message || "发布失败",
            color: "danger",
			duration: 5000
        })
    }
}

const cronPublishVersion = async (params) => {
    try {
        const msg = await timedPublishVersion(params)
		toast({
		  message: msg,
		  color: 'success',
		  duration: 30000
		})
        await fetchData()
		fetchNoticeOptions()
    } catch (error) {
        toast({
            message: error.message || "定时发布失败",
            color: "danger",
			duration: 5000
        })
    }
}

const onAddOk = async () => {
		try {
		    const msg = await addVersion({
		        version: addForm.version,
				system: addForm.system?.value,
		        download_url: addForm.download_url,
		        release_notes: addForm.release_notes,
				release_notes_en: addForm.release_notes_en
		    })
		    toast({
		        message: msg,
		        color: "success",
		    })
		    await fetchData()
		    isAddModalVisible.value = false
		} catch (error) {
		    console.error("修改失败:", error)
		    toast({
		        message: error.message || "修改失败",
		        color: "danger",
		    })
		}	
}

const onCancel = () => {
    isEditModalVisible.value = false
    resetForm()
}

const onCronCancel = () => {
	isDatePickerVisible.value = false
}

const onAddCancel = () => {
    isAddModalVisible.value = false
    resetAddForm()
}

const resetForm = () => {
    editForm.version = ''
	editForm.system = ''
    editForm.download_url = ''
    editForm.release_notes = ''
	editForm.release_notes_en = ''
}

const resetAddForm = () => {
	addForm.version = ''
	addForm.system = ''
	addForm.download_url = ''
	addForm.release_notes = ''
	addForm.release_notes_en = ''
}

// 分页
const handlePageChange = (startIndex) => {
    queryParams.page = Math.ceil(startIndex / queryParams.pagesize)
    currentStartIndex.value = startIndex
    fetchData()
	fetchNoticeOptions()
}

const refreshData = () => {
	searchSystem.value = ''
	searchContent.value = ''
	selectNotice.value = ''
    fetchData()
	fetchNoticeOptions()
}

// 初始化加载数据
fetchData()
fetchNoticeOptions()
</script>

<style scoped>
.modal-content {
  padding: 1rem 2rem;
}

.text-danger {
  color: var(--va-danger);
}

.va-input--error {
  border-color: var(--va-danger);
}

/* .va-input__message-text {
  color: var(--va-danger);
  font-size: 0.8rem;
  margin-top: 4px;
} */
	
.dialog-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 0;
}

.header-text {
  font-size: 1.2em;
  font-weight: 600;
  color: var(--va-primary);
}

/* 内容区域样式 */
.dialog-content {
  line-height: 1.6;
  padding: 12px 0;
}

.version-info {
  font-size: 1.1em;
  margin-bottom: 12px;
}

.version-highlight {
  color: var(--va-success);
  font-weight: 500;
  font-family: monospace;
}

.system-highlight {
  color: #126fc4;
  font-weight: 500;
  font-family: monospace;
}

.confirm-text {
  color: var(--va-danger);
  margin-top: 16px;
  font-size: 0.95em;
}

/* 按钮样式覆盖 */
:deep(.va-modal__ok-button) {
  font-weight: 600;
  letter-spacing: 0.5px;
}

:deep(.va-modal__cancel-button) {
  opacity: 0.8;
}

.machines-list {
    padding: 20px;
}

.filters-row {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    margin-top: 0; /* 移除之前的 mt-4 */
}

.filter-item {
    min-width: 150px;
}

.mobile-list-item {
    padding: 10px;
}

.mobile-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 10px;
}

.action-buttons {
    display: flex;
    gap: 0.5rem;
    justify-content: center;
    padding-left: 5px;
    padding-right: 5px;
    min-width: 40px; /* 确保按钮有足够空间 */
  }

@media (max-width: 768px) {
    .machines-list {
        padding: 10px;
    }

    .filter-item {
        width: 100%;
        min-width: unset;
    }
}

.custom-modal .va-modal-footer {
  display: none; /* 隐藏默认的 footer */
}

.action-container {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 160px; /* 保持列宽一致 */
}

/* 图标按钮统一样式 */
.action-icon {
  width: 28px;
  height: 28px;
  padding: 6px;
  margin: 0 2px;
}

/* 悬停效果增强 */
.va-button:hover {
  transform: scale(1.1);
  transition: transform 0.2s;
}

/* 下拉菜单定位 */
.more-actions {
  margin-left: auto;
}

/* 统一按钮尺寸 */
.aligned-button {
  min-width: 28px !important;
  height: 28px !important;
  padding: 6px 8px !important;  /* 与其他按钮一致 */
  line-height: 1 !important;
}

/* 微调图标位置 */
:deep(.va-button__content) {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 确保所有按钮容器对齐 */
.action-container > * {
  vertical-align: middle;
}

.large-textarea {
  /* 固定宽度 */
  width: 800px;
  /* 最小高度 */
  min-height: 300px;
  
  /* 响应式适配 */
  @media (max-width: 768px) {
    width: 100%;
    min-height: 200px;
  }
  
  /* 文本域内部样式 */
  ::v-deep .va-input-wrapper__textarea {
    font-size: 16px;
    line-height: 1.6;
    padding: 1rem;
  }
}
</style>