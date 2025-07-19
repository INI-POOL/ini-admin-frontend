<template>
    <va-card class="machines-list">
        <!-- 搜索和过滤区域 -->
        <div class="mb-4">
            <va-date-input
                v-model="searchDate"
                placeholder="选择日期"
                class="mb-1 mr-8"
                :style="{ maxWidth: '12%'}"
				:allowed-days="(date) => !isDateDisabled(date)"
            />
			<va-select v-model="searchCurrency" :options="currencyOptions" placeholder="币种筛选" class="mb-1 mr-5" :style="{ maxWidth: '12%' }" />
           <va-button @click="refreshData" class="ml-5" color="rgb(47, 148, 172)">
               刷新
           </va-button>
        </div>

		<div class="mb-4">
		  <va-progress-bar
			:indeterminate="isLoading"
			:label="currentStep"
			color="primary"
			class="mb-2"
		  />
		</div>
	
        <!-- 列表区域 -->
        <div class="table-responsive">
            
            <VaDataTable :items="tasks" :columns="columns" striped class="responsive-table">
                <template #cell(record_date)="{ value }">
                    {{ value ? value.split('T')[0] : '' }}
                </template>
                <template #cell(need_allocate)="{ value }">
                    {{ value === 1 ? '是' : '否' }}
                </template>
                <template #cell(status)="{ value }">
                    {{ statusMap[value]}}
                </template>
                <template #cell(actions)="{ row }">
                    <va-button-group>
                        <va-button v-if="row.rowData.currency != 'tao' && row.rowData.currency != 'ltc'" size="medium" color="rgb(47, 148, 172)" class="mr-4"  @click="fetchDataAndShowModal(row,'hashrate')">模拟分配</va-button>
						<!-- <va-button v-if="row.rowData.currency != 'tao' && row.rowData.currency != 'ltc'" size="medium" color="rgb(47, 148, 172)" class="mr-4" @click="fetchDataAndShowModal(row,'time')">模拟 (时长)</va-button> -->
						<va-button v-if="row.rowData.currency === 'tao' || row.rowData.currency === 'ltc'" size="medium" color="rgb(47, 148, 172)" class="mr-4" @click="fetchDataAndShowModal(row,'')">模拟分配</va-button>
						<va-button size="medium" :disabled="row.rowData.status === 1" color="danger" class="mr-4" @click="confirmAlloc(row)">实际分配</va-button>
					</va-button-group>
					<va-modal
					  v-model="isNewModalVisible"
					  title="实际分配 (算力)"
					  :ok-text="'确认'"
					  :cancel-text="'取消'"
					  size="small"
					  class="audit-modal"
					  @ok="allocOnline(currentRow,'hashrate')"
					>
					<div class="space-y-4">
					    <div>
					      <div class="mb-2" style="padding-top: 0.62rem;">谷歌认证</div>
					      <VaInput v-model="auditForm.google_code" width="200px" placeholder="请输入谷歌认证码" />
					    </div>
					  </div>
					</va-modal>
					 <va-modal v-model="isModalVisible" title="模拟分配数据">
					        <va-card class="mb-4">
					              <va-card-content>
					                <div class="grid grid-cols-2 gap-4">
					                  <div>
					                    <va-text class="font-bold">分配日期：</va-text>
					                    <va-text>{{ apiData["record_date"] }}</va-text>
					                  </div>
									  <div>
									    <va-text class="font-bold">总机器数：</va-text>
									    <va-text>{{ apiData["total_machines"] }}</va-text>
									  </div>
									  <div>
									    <va-text class="font-bold">币种：</va-text>
									    <va-text>{{ apiData["currency"]?.toUpperCase() || 'Unknown' }}</va-text>
									  </div>
									  <div>
									    <va-text class="font-bold">总分配收益：</va-text>
									    <va-text>{{ apiData["total_alloc_profits"]?.toFixed(6) }}</va-text>
									  </div>
					                  <div>
					                    <va-text class="font-bold">节点收益：</va-text>
					                    <va-text>{{ apiData["total_profits"]?.toFixed(6) }}</va-text>
					                  </div>
					                  <div>
					                    <va-text class="font-bold">总手续费：</va-text>
					                    <va-text>{{ apiData["total_fees"]?.toFixed(6) }}</va-text>
					                  </div>
					                </div>
					              </va-card-content>
					            </va-card>
					      
					            <!-- 用户分配详情表格 -->
					            <va-card>
					              <va-card-title>用户分配详情</va-card-title>
					              <va-card-content>
					                <VaDataTable
					                  :items="apiData['user_alloc_detail']"
					                  :columns="columnsNew"
					                  striped
					                  hoverable
					                >
										<template #cell(day_profits)="{ value }">
											{{ parseFloat(value).toFixed(6) }}
										</template>
										<template #cell(fees)="{ value }">
											{{ parseFloat(value).toFixed(6) }}
										</template>
									</VaDataTable>									
					              </va-card-content>
					            </va-card>
					 </va-modal>
                </template>
            </VaDataTable>
			<va-loading v-if="isLoading" :message="currentStep" />
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
import { ref, reactive,computed,h } from 'vue'
import { getAllocTasks,preAlloc,alloc } from "../../api/allocate"
import { machineOptions } from "../../api/machines"
import { formatDateTime,isDateDisabled,getYesterday,convertDateTimeToDate,getColumns } from "../../utils/date.ts"
import { useToast } from "vuestic-ui"
import { getUser } from "../../utils/auth";
import { useRouter } from 'vue-router';

const router = useRouter();

const { init: toast } = useToast()

// 修改初始值
const searchDate = ref(getYesterday(8))

const searchCurrency = ref('')
const currencyOptions = ref([])

const allocOptions = ref([
    { value: 'hashrate', text: '算力' },
    { value: 'time', text: '时长' },
])

const currentStep = ref(''); // 当前步骤
// const progress = ref(0); // 进度百分比
const isLoading = ref(false);


const simulateStep = (delay) => {
  return new Promise((resolve) => setTimeout(resolve, delay));
};

const showSuccessToast = () => {
  toast({
    message: "",
    color: "success",
	duration: 50000,
    render: () =>
      h("div", [
        "分配成功，",
        h(
          "a",
          {
            href: "javascript:void(0);",
            style: "color: #fff; text-decoration: underline;",
            onClick: () => goToAllocTasks(),
          },
          "请前往分配记录查看"
        ),
      ]),
  });
};

const goToAllocTasks = () => {
  router.push({ name: "allocated" });
};

const auditForm = reactive({
});

const currentStartIndex = ref(1)
const totalItems = ref(0)
const tasks = ref([])
const loading = ref(false)
const currentRow = ref(null);

// 修改查询参数的初始化
const queryParams = reactive({
    page: 1,
    pagesize: 15,
    date: new Date().toISOString().split('T')[0],
    currency: 'aleo'
})

const isModalVisible = ref(false); // 控制弹出框显示
const isNewModalVisible = ref(false);
const apiData = ref(null); // 存储后端返回数据

let columnsNew = [
  { key: 'uid', label: '用户UID'},
  { key: 'sub_user_name', label: '子账户名' },
  { key: 'machines', label: '机器数' },
  { key: 'day_profits', label: '分配收益 '},
  { key: 'fees', label: '手续费 ' },
  { key: 'currency', label: '币种' }
];

// const columnsNew = getColumns()

const confirmAlloc = (row) => {
  currentRow.value = row; // 设置当前行
  isNewModalVisible.value = true;
};

// 添加日期格式化函数
const formatDate = (date) => {
    if (!date) return ''
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

// 点击按钮逻辑
const fetchDataAndShowModal = async (row,allocType) => {
  columnsNew = getColumns(row.rowData.currency)
  loading.value = true; // 显示加载状态
  console.log("record_date is",row.rowData.record_date)
  try {
    const params = {
        date: convertDateTimeToDate(row.rowData.record_date),
        currency: row.rowData.currency,
		group: row.rowData.group,
		alloc_type: allocType || 'hashrate'
    }
    const response = await preAlloc(params)
    apiData.value = response; // 存储返回数据
    isModalVisible.value = true; // 显示弹出框
  } catch (error) {
    toast({
      message: error,
      color: "danger",
    });
  } finally {
    loading.value = false; // 隐藏加载状态
  }
};

const allocOnline = async (row,allocType) => {
  isLoading.value = true; // 显示加载状态
  let username = getUser();
  
  if(!auditForm.google_code){
    toast({
      message: "谷歌认证码不能为空",
      color: "danger",
    });
    return;
  }
    
  try {	  
	const params = {
	  date: convertDateTimeToDate(row.rowData.record_date),
	  currency: row.rowData.currency,
	  group: row.rowData.group,
	  alloc_type: allocType,
	  user_name: username,
	  google_code: auditForm.google_code
	};
		
	currentStep.value = '正在校验参数...';
	toast({
	     message: currentStep.value,
	     color: "info",
	     duration: 5000
	})
	await simulateStep(2000);
		
	const response = await alloc(params)
		
	currentStep.value = '正在确认分配任务...';
	toast({
		 message: currentStep.value,
		 color: "info",
		 duration: 3000
	})
	await simulateStep(2000);
	
	currentStep.value = '正在检查机器运行情况...';
	toast({
	    message: currentStep.value,
	    color: "info",
		duration: 3000
	})
	await simulateStep(2000); // 模拟 2 秒执行时间
	
	currentStep.value = '正在检查节点收益...';
	toast({
	    message: currentStep.value,
	    color: "info",
		duration: 3000
	})
	await simulateStep(2000); // 模拟 2 秒执行时间
	
	currentStep.value = '开始分配...';
	toast({
	    message: currentStep.value,
	    color: "info",
		duration: 5000
	})
	await simulateStep(5000);
	
	if (response === '分币成功') {
		currentStep.value = '分配成功，请前往分配记录查看';
		showSuccessToast();
	}else {	
		toast({
			message: response,
			color: "danger",
			duration: 50000
		})
	}
  } catch (error) {
    toast({
        message: error || "获取数据失败",
        color: "info",
    })
  } finally {
    isLoading.value = false; // 隐藏加载状态
	// fetchData();
	// fetchMachineOptions()
  }
};

const convertToOptions = (arr) => 
  arr.map(item => ({ value: item, text: item }));
const fetchMachineOptions = async () => {
  try {
    const response = await machineOptions()
      // 带空值保护的转换
	  
	  const defaultOption = { value: '', text: '所有' };
	  currencyOptions.value = [defaultOption, ...convertToOptions(response.currencies || [])];
	  // groupOptions.value = [defaultOption, ...convertToOptions(response.groups || [])];
	  
  } catch (error) {
    console.error('接口调用失败:', error)
    // 异常处理逻辑
  }
}

// 修改 fetchData 方法
const fetchData = async () => {
    loading.value = true
    try {
        const params = {
            date: queryParams.date,
            currency: searchCurrency.value?.value
        }
        
        // 只有当选择了日期时才添加日期参数
        if (searchDate.value) {
            params.date = formatDate(searchDate.value)
        }
        
        const res = await getAllocTasks(params)
        // 因为拦截器已经处理了 res.data 的解构，这里直接使用返回值
        if (res?.tasks) {
            tasks.value = res.tasks
            console.log(tasks.value)
            totalItems.value = res.total
        } else {
            tasks.value = []
            totalItems.value = 0
        }
    } catch (error) {
        console.error("获取数据失败:", error)
        toast({
            message: error.message || "获取数据失败",
            color: "danger",
        })
        tasks.value = []
        totalItems.value = 0
    } finally {
        loading.value = false
    }
}

// 添加 watch 以监听搜索条件变化
import { watch } from 'vue'

watch([searchDate, searchCurrency], () => {
    queryParams.page = 1
    currentStartIndex.value = 1
  //   fetchData()
	// fetchMachineOptions()
})

const statusMap = {
                0: '未开始',
                1: '已完成',
                2: '已失败',
            }

const columns = [
    { key: 'id', label: 'ID' },
    { key: 'record_date', label: '日期' },
    { key: 'currency', label: '币种' },
    { key: 'group', label: '组名' },
    { key: 'status', label: '状态' },
    { key: 'actions', label: '分配' }  // 添加操作列
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
  //   fetchData()
	// fetchMachineOptions()
}

const refreshList = () => {
  //   fetchData()
	// fetchMachineOptions()
}

const refreshData = () => {
	searchDate.value = getYesterday(8);
	searchCurrency.value = '';
  //   fetchData()
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