<template>
    <va-card class="machines-list">
        <!-- 搜索和过滤区域 -->
        <div class="mb-4">
			<va-input v-model="searchUid" label="用户UID" placeholder="搜索用户UID" class="mb-1 mr-8" :style="{ maxWidth: '13%' }">
			    <template #prepend>
			        <!-- <va-icon name="mobile" /> -->
			    </template>
			</va-input>
			<va-input v-model="searchSub" label="子账户" placeholder="搜索子账户" class="mb-1 mr-8" :style="{ maxWidth: '13%' }">
			    <template #prepend>
			        <!-- <va-icon name="mobile" /> -->
			    </template>
			</va-input>
			<va-select
				v-model="searchCurrency"
				label="币种"
				:options="currencyOptions"
				placeholder="请选择币种"
				selected-top-shown
				class="filter-item mb-1 mr-8"
				:style="{ maxWidth: '13%' }"
			/>
			<va-button @click="refreshData" class="mt-5 mr-8" color="rgb(47, 148, 172)">
			    <!-- <va-icon name="refresh" /> -->
			    刷新
			</va-button>
        </div>

        <!-- 列表区域 -->
        <div class="table-responsive">
            
            <VaDataTable :items="sub_users" :columns="columns" striped class="responsive-table">
				<template #cell(created_time)="{ value }">
				    {{ timestampToFormattedTime(value) }}
				</template>
				
				<template #cell(real_rate)="{ rowData, rowIndex }">
					<div class="editable-rate">
						<template v-if="editMode[rowData.sub_user_name]">
						  <VaInput
							v-model.number="percentValues[rowData.sub_user_name]"
							type="number"
							step="1"
							min="0"
							max="100"
							@keyup.enter="saveRate(rowData)"
							@blur="saveRate(rowData)"
						  >
							<template #appendInner>
							  <span class="percent-symbol">%</span>
							</template>
						  </VaInput>
						</template>
						<template v-else>
						  <span>{{ Math.round(rowData.real_rate * 100) }}%</span>
						  <VaButton
							preset="plain"
							icon="edit"
							color="rgb(47, 148, 172)"
							class="ml-2"
							@click="startEdit(rowData)"
						  />
						</template>
					  </div>
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
import { getSubUsers, updateSubUserFee} from "../../api/sub_user"
import { convertDateTimeToDate,timestampToFormattedTime } from "../../utils/date.ts"
import { useToast } from "vuestic-ui"

const { init: toast } = useToast()

const editMode = ref({}) // 存储编辑状态 { [sub_user_name]: boolean }
const percentValues = ref({})

const startEdit = (row) => {
  editMode.value = { ...editMode.value, [row.sub_user_name]: true }
  percentValues.value = { 
    ...percentValues.value, 
    [row.sub_user_name]: Math.round(row.real_rate * 100)
  }
}

const saveRate = async (row) => {
  try {
    const percentValue = percentValues.value[row.sub_user_name]
    if (percentValue < 0 || percentValue > 100) {
      throw new Error("费率必须在0-100%之间")
    }

    await updateSubUserFee(row.sub_user_name,{
      fee: percentValue / 100
    })

    // 更新本地数据
    row.real_rate = percentValue / 100
    editMode.value = { ...editMode.value, [row.sub_user_name]: false }
  } catch (error) {
    // 错误处理...
  }
}

const searchCurrency = ref('aleo')
const currencyOptions = ref([])

const searchSub = ref('')
const sub_users = ref([])

const searchUid = ref('')

const currentStartIndex = ref(1)
const totalItems = ref(0)

const loading = ref(false)

// 修改查询参数的初始化
const queryParams = reactive({
    page: 1,
    pagesize: 15,
    currency: 'aleo'
})

const isModalVisible = ref(false); // 控制弹出框显示
const apiData = ref(null); // 存储后端返回数据

const convertToOptions = (arr) => 
  arr.map(item => ({ value: item, text: item }));
const fetchMachineOptions = async () => {
  try {
    const response = await machineOptions()
	const defaultOption = { value: '', text: '所有' };
	currencyOptions.value = [defaultOption, ...convertToOptions(response.currencies || [])];
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
			page: queryParams.page,
			pagesize: queryParams.pagesize,
            currency: searchCurrency.value?.value || 'aleo',
			sub_user_name: searchSub?.value,
			uid: searchUid?.value
        }
        
        const res = await getSubUsers(params)
        if (res?.sub_users) {
            sub_users.value = res.sub_users
            totalItems.value = res.total
        } else {
            sub_users.value = []
            totalItems.value = 0
        }
    } catch (error) {
        console.error("获取数据失败:", error)
        toast({
            message: error.message || "获取数据失败",
            color: "danger",
        })
        sub_users.value = []
        totalItems.value = 0
    } finally {
        loading.value = false
    }
}

// 添加 watch 以监听搜索条件变化
import { watch } from 'vue'

watch([searchCurrency,searchSub,searchUid], () => {
    queryParams.page = 1
    currentStartIndex.value = 1
    fetchData()
})

const columns = [
    { key: 'uid', label: '用户Uid' },
	{ key: 'sub_user_name', label: '子账户' },
    { key: 'currency', label: '币种' },
	{ key: 'machines', label: '机器数' },
    { key: 'real_rate', label: '费率(%)'},
	{ key: 'total_profit', label: '净收益' },
    { key: 'total_fee', label: '手续费' },
	{ key: 'created_time', label: '创建时间' },
]

// 分页
const handlePageChange = (startIndex) => {
    queryParams.page = Math.ceil(startIndex / queryParams.pagesize)
    currentStartIndex.value = startIndex
    fetchData()
}

const refreshData = () => {
	searchSub.value = ''
	searchUid.value = ''
    fetchData()
	fetchMachineOptions()
}

// 初始化加载数据
fetchData()
fetchMachineOptions()
</script>

<style scoped>
	
.editable-rate {
  display: flex;
  align-items: center;
  gap: 8px;

  .va-input-wrapper {
    width: 100px;
    position: relative;

    .percent-symbol {
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--va-secondary);
      pointer-events: none;
    }
  }
}
	  
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