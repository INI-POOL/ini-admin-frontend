<template>
    <va-card class="machines-list">
        <!-- 搜索和过滤区域 -->
        <div class="mb-4">
            <div class="filters-row">
          <!--      <va-button @click="addNewVersion" class="ml-5">
                    新增版本
                </va-button> -->
                <va-button @click="addVersionForm" color="rgb(47, 148, 172)" class="ml-5">
                    新增版本
                </va-button>
				<VaModal
				    v-model="isAddModalVisible"
				    title="新增版本"
				    @cancel="onAddCancel"
				    @ok="onAddOk"
					:ok-disabled="!formValid"
				>
				    <VaForm>
						<VaInput
						    v-model="addForm.version"
						    label="版本号"
							:rules="[validateVersion]"
							required
						    type="string"
						    class="mb-2"
							 placeholder="v1.0.0"
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
				<template #cell(release_date)="{ value }">
				    {{ convertDateTimeToDate(value) }}
				</template>
				<template #cell(download_url)="{ value }">
				   <template v-if="!value">无</template>
				
				   <a v-else :title="value" :href="value" target="_blank">  <!-- 悬浮显示完整内容 -->
					 {{ value }}
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
					 {{ truncateText(value, 20) }}
				   </span>
				</template>
                <template #cell(actions)="{ row }">
					<va-button-group>
					    <va-button color="rgb(47, 148, 172)" size="small" class="mr-4" icon="edit" @click="editProfit(row)">修改</va-button>
						<va-button v-if="row?.rowData?.is_latest==='0'||row?.rowData?.is_latest===0" title="点击发布该版本" size="small" color="rgb(47, 148, 172)" icon="rocket" @click="confirmPublish(row?.rowData?.version)">发布</va-button>
					</va-button-group>
                </template>
            </VaDataTable>
            
            <!-- 添加编辑弹窗 -->
            <VaModal
                v-model="isEditModalVisible"
                title="修改版本信息"
                @cancel="onCancel"
                @ok="onOk"
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
                </VaForm>
            </VaModal>
			
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
import { ref, reactive,computed } from 'vue'
import { getPoolProfits, updatePoolProfit } from "../../api/node"
import { versionList, addVersion, modifyVersion, publishVersion } from "../../api/version"
import { formatDateTime,formatHashRate,convertDateTimeToDate } from "../../utils/date.ts"
import { useToast } from "vuestic-ui"

const { init: toast } = useToast()

// 响应式状态
// 获取默认日期（当前日期减一天）

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

const confirmPublish = (version) => {
  pendingVersion.value = version
  showConfirmDialog.value = true
  
  return new Promise((resolve) => {
	resolvePromise.value = resolve
  })
}

const handleConfirm = async () => {
  try {
	await publishNewVersion(pendingVersion.value)
	resolvePromise.value(true)
  } catch (error) {
	resolvePromise.value(false)
  } finally {
	showConfirmDialog.value = false
  }
}

const handleCancel = () => {
  toast({ message: '已取消发布', color: 'warning' })
  resolvePromise.value(false)
  showConfirmDialog.value = false
}

const validateVersion = (value) => {
  const pattern = /^v\d+\.\d+\.\d+(-[a-zA-Z0-9]+)?$/
  return pattern.test(value) || '格式示例：v1.0.0 或 v2.3.4-beta'
}

// URL格式验证
const validateURL = (value) => {
  try {
    new URL(value)
    return true
  } catch {
    return '请输入有效的URL地址'
  }
}

const requiredRule = (value) => !!value || '此字段必填'

const formValid = computed(() => {
  return validateVersion(addForm?.version) === true &&
         validateURL(addForm?.download_url) === true
})

const queryParams = reactive({
    page: 1,
    pagesize: 15,
})

const isAddModalVisible = ref(false)
const addForm = reactive({
	version: '',
	download_url: '',
	release_notes: ''
})

const addVersionForm = () => {
    isAddModalVisible.value = true
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
            pagesize: queryParams.pagesize
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

const columns = [
    { key: 'version', label: '版本号' },
	{ key: 'release_date', label: '发布日期' },
    { key: 'download_url', label: '下载链接' },
    { key: 'release_notes', label: '更新日志' },
    { key: 'is_latest', label: '发布状态' },
    { key: 'actions', label: '操作' }  // 添加操作列
]

const isEditModalVisible = ref(false)
const editForm = reactive({
	version: '',
	release_notes: '',
	download_url: ''
})

const editProfit = (row) => {
    editForm.version = row.rowData.version
	editForm.download_url = row.rowData.download_url
    editForm.release_notes = row.rowData.release_notes
    isEditModalVisible.value = true
}

const onOk = async () => {
    try {
        const msg = await modifyVersion(editForm.version, {
            download_url: editForm.download_url,
            release_notes: editForm.release_notes
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

const publishNewVersion = async (version) => {
    try {
        const msg = await publishVersion(version)
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

const onAddOk = async () => {
	if (formValid.value) {
		try {
		    const msg = await addVersion({
		        version: addForm.version,
		        download_url: addForm.download_url,
		        release_notes: addForm.release_notes
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
}

const onCancel = () => {
    isEditModalVisible.value = false
    resetForm()
}

const onAddCancel = () => {
    isAddModalVisible.value = false
    reseyAddForm()
}

const resetForm = () => {
    editForm.version = ''
    editForm.download_url = ''
    editForm.release_notes = ''
}

const reseyAddForm = () => {
	addForm.version = ''
	addForm.download_url = ''
	addForm.release_notes = ''
}

// 分页
const handlePageChange = (startIndex) => {
    queryParams.page = Math.ceil(startIndex / queryParams.pagesize)
    currentStartIndex.value = startIndex
    fetchData()
}

const refreshList = () => {
    fetchData()
}

const refreshData = () => {
    fetchData()
}


// 初始化加载数据
fetchData()
</script>

<style scoped>
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
  
</style>