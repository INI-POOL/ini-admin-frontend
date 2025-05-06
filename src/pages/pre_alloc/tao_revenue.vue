<template>
    <va-card class="machines-list">
        <!-- 搜索和过滤区域 -->
        <div class="mb-4">
            <div class="filters-row">
				<va-input v-model="searchHotkey" placeholder="搜索地址名" class="mr-5" :style="{ maxWidth: '13%'}">
				    <template #prepend>
				        <!-- <va-icon name="va-calendar" /> -->
				    </template>
				</va-input>
                <va-date-input
                    v-model="searchDate"
                    placeholder="选择日期"
                    class="mr-5"
                    :style="{ maxWidth: '12%'}"
					:allowed-days="(date) => !isDateDisabled(date)"
                />
				<va-select v-model="searchGroup" :options="groupOptions" placeholder="组名" class="filter-item mr-6" :style="{ maxWidth: '12%' }" />
                <va-button @click="refreshData" class="" color="rgb(47, 148, 172)">
                    重置
                </va-button>
            </div>
        </div>
		<div class="mb-4">
			<h4 class="va-h6">
				总收益: {{totalProfit}} TAO (最近更新时间:{{latestDate}})
			</h4>
		</div>

        <!-- 列表区域 -->
        <div class="table-responsive">
            
            <VaDataTable :items="poolProfits" :columns="columns" striped class="responsive-table">
                <template #cell(record_date)="{ value }">
                    {{ value ? value.split('T')[0] : '' }}
                </template>
				<template #cell(need_allocate)="{ value }">
				    {{ getIsAllocate(value)}}
				</template>
				<template #cell(hotkey)="{ value }">
				   <template v-if="!value">无</template>
				
				   <a v-else :title="value" target="_blank">  <!-- 悬浮显示完整内容 -->
					 {{ truncateText(value, 20) }}
				   </a>
				</template>
				<template #cell(coldkey)="{ value }">
				   <template v-if="!value">无</template>
				
				   <a v-else :title="value" target="_blank">  <!-- 悬浮显示完整内容 -->
					 {{ truncateText(value, 20) }}
				   </a>
				</template>
                <template #cell(actions)="{ row }">
                    <va-button-group>
                        <va-button icon="edit" size="small" color="rgb(47, 148, 172)" @click="editProfit(row)" />
                    </va-button-group>
                </template>
            </VaDataTable>
            
            <!-- 添加编辑弹窗 -->
            <VaModal
                v-model="isEditModalVisible"
                title="修改记录"
                @cancel="onCancel"
                @ok="onOk"
            >
                <VaForm>
                    <va-select
                        v-model="editForm.need_allocate"
                        label="是否需要分配"
                        :options="allocateOptions"
                        placeholder="请选择"
                        class="mb-2"
                    />
                </VaForm>
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
import { ref, reactive } from 'vue'
import { getPoolProfits, updatePoolProfit } from "../../api/node"
import { taoProfitOptions } from "../../api/machines"
import { formatDateTime,isDateDisabled,formatReleaseTime } from "../../utils/date.ts"
import { useToast } from "vuestic-ui"

const { init: toast } = useToast()

// 响应式状态
// 获取默认日期（当前日期减一天）


// 修改初始值
const searchDate = ref()
const searchHotkey = ref()
const searchCurrency = ref('')

const groupOptions = ref([]);
const searchGroup = ref(groupOptions[0]);
const totalProfit = ref(0)
const latestDate = ref('')

const convertToOptions = (arr) => 
  arr.map(item => ({ value: item, text: item }));
const fetchMachineOptions = async () => {
  try {
    const response = await taoProfitOptions()
      // 带空值保护的转换
	  const defaultOption = { value: '', text: '所有' };
	  groupOptions.value = [defaultOption, ...convertToOptions(response || [])];
  } catch (error) {
    console.error('接口调用失败:', error)
    // 异常处理逻辑
  }
}

const truncateText = (text, maxLength) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  const ellipsis = '...';
  if (maxLength <= ellipsis.length) {
    return ellipsis.slice(0, maxLength);
  }
  const availableLength = maxLength - ellipsis.length;
  const frontLength = Math.floor(availableLength / 2);
  const backLength = availableLength - frontLength;
  return text.slice(0, frontLength) + ellipsis + text.slice(-backLength);
};

const currentStartIndex = ref(1)
const totalItems = ref(0)
const poolProfits = ref([])
const loading = ref(false)

// 修改查询参数的初始化
const queryParams = reactive({
    page: 1,
    pagesize: 15,
    date: new Date().toISOString().split('T')[0],
    currency: ''
})

// 添加日期格式化函数
const formatDate = (date) => {
    if (!date) return ''
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

// 修改 fetchData 方法
const fetchData = async () => {
    loading.value = true
    try {
        const params = {
            page: queryParams.page,
            pagesize: queryParams.pagesize,
            currency: 'tao',
			group: searchGroup.value?.value,
			hotkey: searchHotkey.value
        }
        
        // 只有当选择了日期时才添加日期参数
        if (searchDate.value) {
            params.date = formatDate(searchDate.value)
        }
        
        const res = await getPoolProfits(params)
        // 因为拦截器已经处理了 res.data 的解构，这里直接使用返回值
        if (res?.pool_profits) {
            poolProfits.value = res.pool_profits
            totalItems.value = res.total
			totalProfit.value = res.total_profit
			latestDate.value = formatReleaseTime(res.pool_profits[0].timestamp)
        } else {
            poolProfits.value = []
            totalItems.value = 0
        }
    } catch (error) {
        console.error("获取数据失败:", error)
        toast({
            message: error.message || "获取数据失败",
            color: "danger",
        })
        poolProfits.value = []
        totalItems.value = 0
    } finally {
        loading.value = false
    }
}

// 添加 watch 以监听搜索条件变化
import { watch } from 'vue'

watch([searchDate, searchCurrency,searchGroup,searchHotkey], () => {
    queryParams.page = 1
    currentStartIndex.value = 1
    fetchData()
	fetchMachineOptions()
})


const columns = [
    { key: 'id', label: 'ID',width:'100px' },
    { key: 'record_date', label: '记录日期',width:'160px' },
	{ key: 'group', label: '分组',width:'160px' },
	{ key: 'profit', label: '收益'},
    { key: 'hotkey', label: 'Hotkey',width:'240px' },
	{ key: 'coldkey', label: 'Coldkey',width:'240px' },
    // { key: 'network', label: '网络' },
    { key: 'subnet', label: '子网' },
    { key: 'need_allocate', label: '是否需要分配' },
    { key: 'actions', label: '操作' }  // 添加操作列
]

// 添加编辑相关的响应式变量和方法
const isEditModalVisible = ref(false)
const editForm = reactive({
    id: null,
    real_power: '',
    real_reward: '',
    need_allocate: '',
})

const allocateOptions = [
    { value: '1', text: '是' },
    { value: '0', text: '否' },
]

const getIsAllocate = (need_allocate) => {
	if (need_allocate === 1 || need_allocate === "1") {
		return '是'
	}
	return '否'
}

const editProfit = (row) => {
    editForm.id = row.rowData.id
    editForm.real_power = row.rowData.real_power
    editForm.real_reward = row.rowData.real_reward
    editForm.need_allocate = row.rowData.need_allocate === 1 ? "是" : "否" 
    isEditModalVisible.value = true
}

const onOk = async () => {
    try {
        const msg = await updatePoolProfit(editForm.id, {
            real_power: Number(editForm.real_power),
            real_reward: Number(editForm.real_reward),
            need_allocate: Number(editForm.need_allocate?.value)
        })
        toast({
            message: msg,
            color: "success",
        })
        await fetchData()
		await fetchMachineOptions()
        isEditModalVisible.value = false
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

const resetForm = () => {
    editForm.id = null
    editForm.real_power = ''
    editForm.real_reward = ''
    editForm.need_allocate = ''
}

// 分页
const handlePageChange = (startIndex) => {
    queryParams.page = Math.ceil(startIndex / queryParams.pagesize)
    currentStartIndex.value = startIndex
    fetchData()
	fetchMachineOptions()
}

const refreshData = () => {
	searchDate.value = null;
	searchGroup.value = '';
	searchCurrency.value = '';
	searchHotkey.value = ''
    fetchData()
	fetchMachineOptions()
}

// 初始化加载数据
fetchData()
fetchMachineOptions()
</script>

<style scoped>
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