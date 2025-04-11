<template>
    <va-card class="machines-list">
        <!-- 搜索和过滤区域 -->
        <div class="mb-4">
            <div class="filters-row">
          <!--      <va-button @click="addNewVersion" class="ml-5">
                    新增版本
                </va-button> -->
				选择系统:
				<va-select
				    v-model="searchSystem"
				    :options="systemOptions"
				    placeholder="系统筛选"
				    class="ml-2"
				    :style="{ maxWidth: '10%' }"
				/>
				<va-button @click="addVersionForm" color="rgb(47, 148, 172)" class="ml-5">
				    新增版本
				</va-button>
				<va-button @click="refreshData" color="rgb(47, 148, 172)" class="ml-2">
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
            
            <VaDataTable :items="versions" :columns="columns" striped class="responsive-table">
<!--                <template #cell(record_date)="{ value }">
                    {{ value ? value.split('T')[0] : '' }}
                </template>
				formatHashRate -->
				<template #cell(release_time)="{ value }">
				    {{ formatReleaseTime(value) }}
				</template>
				<template #cell(system)="{ value }">
				    {{ getSystemText(value) }}
				</template>
				<template #cell(download_url)="{ value }">
				   <template v-if="!value">无</template>
				
				   <a v-else :title="value" :href="value" target="_blank">  <!-- 悬浮显示完整内容 -->
					 {{ truncateText(value, 13) }}
				   </a>
				</template>
				<template #cell(is_latest)="{ value }">
<!-- 				    {{ (value === '1' || value === 1) ? '已发布':'未发布' }} -->
					<div class="status-indicator">
						<!-- 已发布状态 -->
						<template v-if="value === '1' || value === 1">
						  <span class="published">
							<svg width="20" height="20" viewBox="0 0 16 16">
							  <circle cx="8" cy="8" r="7" fill="#67C23A"/>
							  <path 
								d="M6.5 10.793L4.354 8.646a.5.5 0 0 0-.708.708l2.5 2.5a.5.5 0 0 0 .708 0l5-5a.5.5 0 1 0-.708-.708L6.5 10.793z"
								fill="#fff"
							  />
							</svg>
						  </span>
						</template>
						<template v-else>
						  <span class="unpublished">
							<svg width="20" height="20" viewBox="0 0 16 16">
							  <circle cx="8" cy="8" r="7" fill="#909399"/>
							  <g transform="translate(4.5, 5.5)">
								<circle cx="1" cy="1" r="1" fill="#fff"/>
								<circle cx="4" cy="1" r="1" fill="#fff"/>
								<circle cx="7" cy="1" r="1" fill="#fff"/>
							  </g>
							</svg>
						  </span>
						</template>
					</div>
				</template>
				<template #cell(release_notes)="{ value }">
				   <template v-if="!value">无</template>
				
				   <span v-else :title="value">  <!-- 悬浮显示完整内容 -->
					 {{ truncateText(value, 10) }}
				   </span>
				</template>
				<template #cell(release_notes_en)="{ value }">
				   <template v-if="!value">无</template>
				
				   <span v-else :title="value">  <!-- 悬浮显示完整内容 -->
					 {{ truncateText(value, 10) }}
				   </span>
				</template>
                <template #cell(actions)="{ row }">
					  <div class="action-container">
					    <!-- 主要操作：紧凑图标按钮 -->
					    <va-button-group class="compact-buttons">
					      <va-button 
					        size="small"
					        icon="edit"
					        color="rgb(47, 148, 172)"
					        @click="editProfit(row)"
					        title="修改版本信息"
					        class="action-icon"
					      />
					
					      <!-- 条件操作按钮组 -->
					      <template v-if="row?.rowData?.is_latest === 0">
					        <va-button
					          icon="rocket_launch"
					          size="small"
					          color="rgb(47, 148, 172)"
					          title="立即发布"
					          @click="confirmPublish(row)"
					          class="action-icon"
					        />
					
					        <va-button
					          icon="schedule"
					          size="small"
					          color="rgb(47, 148, 172)"
					          title="定时发布"
					          @click="openDatePicker(row)"
					          class="action-icon"
					        />
					      </template>
					
					      <!-- 下载按钮 -->
					      <va-button
					        icon="file_download"
					        size="small"
					        color="rgb(47, 148, 172)"
							:disabled="!hasValidFilePath(row)"
					        title="下载安装包"
					        @click="handleDownload(row)"
					        class="action-icon"
							:loading="downloading[row?.rowData?.id]"
					      />
					    </va-button-group>					
						<va-file-upload
						  v-model="uploadFiles[row?.rowData?.id]"
						  file-types=".apk,.ipa,.dmg"
						  @file-added="(files) => handleUpload(files, row)"
						  preset="plain"
						  hide-file-list
						  hide-default-mark
						  title="上传安装包"
						  class="compact-upload"  
						>
							<va-button
								icon="file_upload"
								size="small"
								color="rgb(47, 148, 172)"
								title="上传文件"
								class="action-icon"
								:loading="uploading[row?.rowData?.id]"
							/>
						</va-file-upload>
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
			
			<!-- onCronCancel -->
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
					即将发布版本：<span class="version-highlight">{{ pendingVersion }}</span>
				  </p>
				  <va-divider />
				  <p class="confirm-text">该操作将立即生效且不可逆转，请确认是否继续？</p>
				</div>
			  </VaModal>
			  
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
import { ElMessage, ElLoading } from 'element-plus'
import { ref, reactive,computed } from 'vue'
import { getPoolProfits, updatePoolProfit } from "../../api/node"
import { versionList, addVersion, modifyVersion, publishVersion,uploadApk,downloadApk,timedPublishVersion } from "../../api/version"
import { formatHashRate,convertDateTimeToDate,formatReleaseTime } from "../../utils/date.ts"
import { useToast, useForm } from "vuestic-ui"
import { saveAs } from 'file-saver'

const { init: toast } = useToast()

const { isValid, validate } = useForm('addFormRef')

const requiredAddRule = (value) => {
  return !!value?.trim() || '该字段为必填项'
}

const basic = ref([])

const hasMoreActions = ref(false)

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

// 禁用过去日期
const disabledDate = current => {
	
  return current && current < dayjs().startOf('day')
}

const getSystemText = (system) => {
	if (system === "android") {
		return "Android"
	}else {
		return "IOS"
	}
}

// 时间禁用规则
const disabledTime = (current) => {
  const now = dayjs()
  
  // 如果是今天
  if (current.isSame(now, 'day')) {
    return {
      disabledHours: () => [...Array(now.hour()).keys()], // 禁用过去小时
      disabledMinutes: (selectedHour) => {
        if (selectedHour === now.hour()) {
          return [...Array(now.minute() + 1).keys()] // 禁用当前小时已过分钟
        }
        return []
      },
      // 只允许整点和30分钟
      // disabledSeconds: () => [1,60].filter(v => v % 30 !== 0)
    }
  }
  
  // 未来日期允许所有时间但必须整点或30分
  return {
    // disabledSeconds: () => [1,60].filter(v => v % 30 !== 0)
  }
}

// 判断是否是今天
const isToday = current => {
  return dayjs().isSame(current, 'day')
}





// 响应式状态
// 获取默认日期（当前日期减一天）
const currentDate = new Date()
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth()+1;
const currentDay = currentDate.getDate();

const currentHour = currentDate.getHours()
const currentMinute = currentDate.getMinutes()

const selectedMonth = ref({
    text: `${currentMonth}月`,
    value: currentMonth
  })

const selectedDay = ref(null)
  
const selectedTime = ref(null)
const isFormValid = computed(() => 
  selectedMonth.value !== null &&
  selectedDay.value !== null &&
  selectedTime.value !== null
)

// const requiredRule = v => !!v || '必填项'
const timeValidationRule = () => {
  // const [hour, minute] = selectedTime.value.split(':').map(Number)
  // const selectedDate = new Date(
  //   currentDate.getFullYear(),
  //   selectedMonth.value,
  //   selectedDay.value,
  //   hour,
  //   minute
  // )
  
  // return selectedDate > currentDate || '时间必须晚于当前'
}

const monthOptions = Array.from({ length: 6 }, (_, i) => {
  const date = new Date()
  date.setMonth(date.getMonth() + i + 1)
  return {
    text: `${date.getMonth()}月`,
    value: date.getMonth()
  }
})

const dayOptions = ref([])

const updateDateOptions = (selectedMonth) => {
	
  const year = new Date().getFullYear()
  const daysInMonth = new Date(year, selectedMonth?.value+1, 0).getDate()
  
  
  dayOptions.value = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1
	 const isValid = (
	    ((selectedMonth?.value) > currentMonth) ||
	    ((selectedMonth?.value) === currentMonth && day >= currentDay)
	  )
	  return isValid ? { text: `${day}日`, value: day } : null
  }).filter(Boolean);

  selectedDay.value = dayOptions.value[0]
  // .filter(day => {
  //   const isCurrentMonth = selectedMonth === currentDate.getMonth()
  //   return !isCurrentMonth || day.value > currentDate.getDate()
  // })
  
  
  
   console.log("daysInMonth  is ",daysInMonth)
  console.log("dayOptions after is ",dayOptions)
}

const timeOptions = ref([])
const updateTimeOptions = () => {
  const startHour = selectedDay.value === currentDay 
    ? currentHour + (currentMinute >= 30 ? 1 : 0)
    : 0
  
  const hours = Array.from({ length: 24 - startHour }, (_, i) => startHour + i)
  
  timeOptions.value = hours.flatMap(hour => [
    { text: `${hour}:00`, value: `${hour}:00` },
    { text: `${hour}:30`, value: `${hour}:30` }
  ]).filter(time => {
    if (selectedDay.value === currentDay) {
      const [h, m] = time.value.split(':').map(Number)
      return h > currentHour || (h === currentHour && m >= currentMinute)
    }
    return true
  })
}

const currencyOptions = ref([
    { value: 'aleo', text: 'Aleo' },
    // 其他币种选项
])

const currentStartIndex = ref(1)
const totalItems = ref(0)
const versions = ref([])
const loading = ref(false)

const showConfirmDialog = ref(false)
const pendingVersion = ref(null)
const pendingSystem = ref(null)

const confirmPublish = (row) => {
  pendingVersion.value = row.rowData.version
  pendingSystem.value = row.rowData.system
  showConfirmDialog.value = true
  
}

const handleConfirm = async () => {
	console.log("Version is",pendingVersion.value)
	console.log("system is",pendingSystem.value)
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
    isAddModalVisible.value = true
}

const publishVersionForm = () => {
	updateDateOptions(selectedMonth)
	updateTimeOptions()
	isPublishVisible.value = true
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
        }
		
		if (searchSystem) {
			params.system = searchSystem.value?.value
		}

        const res = await versionList(params)
        // 因为拦截器已经处理了 res.data 的解构，这里直接使用返回值
        if (res?.versions) {
            versions.value = res.versions
            totalItems.value = res.total
        } else {
            versions.value = []
            totalItems.value = 0
        }
    } catch (error) {
        console.error("获取数据失败:", error)
        toast({
            message: error.message || "获取数据失败",
            color: "danger",
        })
        versions.value = []
        totalItems.value = 0
    } finally {
        loading.value = false
    }
}

import { watch } from 'vue'

watch([searchSystem], () => {
    queryParams.page = 1
    currentStartIndex.value = 1
    fetchData()
})

const columns = [
	 { key: 'id', label: '序号' },
    { key: 'version', label: '版本号' },
	{ key: 'release_time', label: '发布时间' },
	{ key: 'system', label: '系统类型' },
    { key: 'download_url', label: '下载链接' },
    { key: 'release_notes', label: '更新日志' },
	{ key: 'release_notes_en', label: '更新日志（英文）'},
    { key: 'is_latest', label: '发布状态' },
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

const editProfit = (row) => {
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
	selectedMonth.value = null
	selectedDay.value = null
	selectedTime.value = null
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
}

const refreshData = () => {
	searchSystem.value = ''
    fetchData()
}

// 初始化加载数据
fetchData()
</script>

<style scoped>
/* 	.va-modal {
	  max-width: 400px;
	}
	
	.va-date-input {
	  width: 100%;
	} */
.time-indicator {
  font-size: 12px;
  color: #1890ff;
}
.va-input--error {
  border-color: var(--va-danger);
}

.va-input__message-text {
  color: var(--va-danger);
  font-size: 0.8rem;
  margin-top: 4px;
}
	
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

/* 上传组件优化 */
.compact-upload {
  display: inline-block;
  position: relative;
  margin-left: -4px;
  
  :deep(.va-file-upload__input) {
    opacity: 0;
    position: absolute;
    width: 100%;
    height: 100%;
    cursor: pointer;
  }
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


.upload-wrapper {
  display: inline-flex;
  align-items: center;
  height: 100%;  /* 保持与其他按钮等高 */
}

/* 覆盖文件上传组件的默认样式 */
:deep(.va-file-upload__container) {
  display: inline-flex !important;
  align-items: center;
  vertical-align: top;  /* 修复基线对齐 */
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
</style>