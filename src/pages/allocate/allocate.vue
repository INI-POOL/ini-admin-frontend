<template>
    <va-card class="machines-list">
        <!-- 搜索和过滤区域 -->
        <div class="mb-4">
			选择日期：
            <va-date-input
                v-model="searchDate"
                placeholder="选择日期"
                class="mb-1 mr-5"
                :style="{ maxWidth: '20%'}"
				:allowed-days="(date) => !isDateDisabled(date)"
            />
			分组：
			<va-select v-model="searchGroup" :options="groupOptions" placeholder="组名" class="filter-item mb-1 mr-5" :style="{ maxWidth: '13%' }" />
<!--            <div class="filters-row mt-4">
                <va-button @click="refreshList" class="ml-5">
                    搜索
                </va-button>
                <va-button @click="refreshData" class="ml-5">
                    刷新
                </va-button>
            </div> -->
			币种筛选：
			<va-select v-model="searchCurrency" :options="currencyOptions" placeholder="币种" class="mb-1 mr-5" :style="{ maxWidth: '16%' }" />
        </div>

        <!-- 列表区域 -->
        <div class="table-responsive">
            
            <VaDataTable :items="user_profits" :columns="columns" striped class="responsive-table">
                <template #cell(record_date)="{ value }">
                    {{ value ? value.split('T')[0] : '' }}
                </template>
                <template #cell(need_allocate)="{ value }">
                    {{ value === 1 ? '是' : '否' }}
                </template>
                <template #cell(status)="{ value }">
                    {{ statusMap[value]}}
                </template>
				<template #cell(created_time)="{ value }">
				    {{ timestampToFormattedTime(value) }}
				</template>
            </VaDataTable>
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
import { machineOptions } from "../../api/machines"
import { allocated } from "../../api/allocate"
import { formatDateTime,isDateDisabled,getYesterday,convertDateTimeToDate,timestampToFormattedTime } from "../../utils/date.ts"
import { useToast } from "vuestic-ui"

const { init: toast } = useToast()

// 修改初始值
const searchDate = ref(getYesterday(8))

const searchCurrency = ref('')
const currencyOptions = ref([])
const searchMachine = ref('');

const allocOptions = ref([
    { value: 'hashrate', text: '算力' },
    { value: 'time', text: '时长' },
])
const groupOptions = ref([]);

const searchGroup = ref('')
const currentStartIndex = ref(1)
const totalItems = ref(0)
const user_profits = ref([])
const loading = ref(false)

// 修改查询参数的初始化
const queryParams = reactive({
    page: 1,
    pagesize: 15,
    date: new Date().toISOString().split('T')[0],
    currency: 'aleo'
})

const isModalVisible = ref(false); // 控制弹出框显示
const apiData = ref(null); // 存储后端返回数据

const columnsNew = [
  { key: 'uid', label: '用户UID'},
  { key: 'sub_user_name', label: '子账户名' },
  { key: 'machines', label: '机器数' },
  { key: 'day_profits', label: '分配收益 '},
  { key: 'fees', label: '手续费 ' },
];

const convertToOptions = (arr) => 
  arr.map(item => ({ value: item, text: item }));
const fetchMachineOptions = async () => {
  try {
    const response = await machineOptions()
    const defaultOption = { value: '', text: '所有' };
	currencyOptions.value = [defaultOption, ...convertToOptions(response.currencies || [])];
    groupOptions.value = [defaultOption, ...convertToOptions(response.groups || [])];
  } catch (error) {
    console.error('接口调用失败:', error)
    // 异常处理逻辑
  }
}

// 添加日期格式化函数
const formatDate = (date) => {
    if (!date) return ''
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

const allocOnline = async (row,allocType) => {
  loading.value = true; // 显示加载状态
  console.log("record_date is",row.rowData.record_date)
  try {
    const params = {
        date: convertDateTimeToDate(row.rowData.record_date),
        currency: row.rowData.currency,
		group: row.rowData.group,
		alloc_type: allocType
    }
    const response = await preAlloc(params)
	console.log("data is",response)

    apiData.value = response; // 存储返回数据
    isModalVisible.value = true; // 显示弹出框
  } catch (error) {
    console.error('获取数据失败:', error);
    alert('获取数据失败，请重试！');
  } finally {
    loading.value = false; // 隐藏加载状态
  }
};

// 修改 fetchData 方法
const fetchData = async () => {
    loading.value = true
    try {
        const params = {
			page: queryParams.page,
			pagesize: queryParams.pagesize,
            date: queryParams.date,
            currency: searchCurrency.value?.value
        }
        
        // 只有当选择了日期时才添加日期参数
        if (searchDate.value) {
            params.date = formatDate(searchDate.value)
        }
		
		if (searchGroup.value?.value) {
			params.group = searchGroup.value?.value
		}
		
        const res = await allocated(params)
        // 因为拦截器已经处理了 res.data 的解构，这里直接使用返回值
        if (res?.user_profits) {
            user_profits.value = res.user_profits
            totalItems.value = res.total
        } else {
            user_profits.value = []
            totalItems.value = 0
        }
    } catch (error) {
        console.error("获取数据失败:", error)
        toast({
            message: error.message || "获取数据失败",
            color: "danger",
        })
        user_profits.value = []
        totalItems.value = 0
    } finally {
        loading.value = false
    }
}

// 添加 watch 以监听搜索条件变化
import { watch } from 'vue'

watch([searchDate, searchCurrency,searchGroup], () => {
    queryParams.page = 1
    currentStartIndex.value = 1
    // fetchData()
	
})

const statusMap = {
                0: '未开始',
                1: '已完成',
                2: '已失败',
            }

const columns = [
	{ key: 'record_date', label: '记录日期' },
    { key: 'uid', label: '用户Uid' },
	{ key: 'sub_user_name', label: '子账户' },
	{ key: 'currency',label: '币种'},
    { key: 'machines', label: '机器数' },
    { key: 'profit', label: '分配收益' },
    { key: 'fee', label: '手续费' },
	{ key: 'group', label: '组名' },
    { key: 'created_time', label: '分配时间' },
]

// 添加编辑相关的响应式变量和方法
const isEditModalVisible = ref(false)
const editForm = reactive({
    id: null,
    real_power: '',
    real_reward: '',
    need_allocate: ''
})

const allocateOptions = [
    { value: '是', text: '是' },
    { value: '否', text: '否' }
]

const editProfit = (row) => {
    console.log('row:', row)
    editForm.id = row.rowData.id
    editForm.real_power = row.rowData.real_power
    editForm.real_reward = row.rowData.real_reward
    editForm.need_allocate = row.rowData.need_allocate === 1 ? '是' : '否'
    isEditModalVisible.value = true
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
    // fetchData()
}

const refreshList = () => {
    // fetchData()
	// fetchMachineOptions()
}

const refreshData = () => {
    // fetchData()
	// fetchMachineOptions()
}

// 初始化加载数据
// fetchData()
// fetchMachineOptions()
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