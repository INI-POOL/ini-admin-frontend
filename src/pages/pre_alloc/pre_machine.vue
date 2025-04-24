<template>
    <va-card class="machines-list">
        <!-- 搜索和过滤区域 -->
        <div class="mb-4">
			<va-input v-model="searchMachine" placeholder="搜索机器名" class="mb-1 mr-8" :style="{ maxWidth: '13%'}">
			    <template #prepend>
			        <!-- <va-icon name="va-calendar" /> -->
			    </template>
			</va-input>
			<va-select
			    v-model="searchCurrency"
			    :options="currencyOptions"
			    placeholder="请选择币种"
			    class="mb-1 mr-8"
			    :style="{ maxWidth: '12%' }"
			/>
			<va-date-input
			      v-model="searchDate"
			      placeholder="选择日期"
			      class="mb-1 mr-8"
			      :style="{ maxWidth: '16%'}"
				  :allowed-days="(date) => !isDateDisabled(date)"
			/>
			<va-select v-model="searchGroup" :options="groupOptions" placeholder="组名" class="filter-item mb-1 mr-8" :style="{ maxWidth: '13%' }" />
			参与分配：
			<va-select v-model="searchAlloc" :options="allocateOptions" placeholder="是否参与分配" class="filter-item mb-1 mr-8" :style="{ maxWidth: '10%' }" />
			<va-button @click="refreshData" class="mb-1 mr-8" color="rgb(47, 148, 172)">
			刷新
			</va-button>
        </div>

        <!-- 列表区域 -->
        <div class="table-responsive">
            <!-- 桌面端显示表格 -->
            <VaDataTable :items="machines" :columns="columns" striped  class="responsive-table">
                <!-- 时间显示 -->
                <template #cell(created_time)="{ value }">
                    {{ formatDateTime(value) }}
                </template>
				<template #cell(hashrate)="{ value }">
				    {{ formatHashRate(value) }}
				</template>
				<template #cell(record_date)="{ value }">
				    {{ convertDateTimeToDate(value) }}
				</template>
				<template #cell(is_in_black_list)="{ value }">
				    {{ getAllocate(value) }}
				</template>

                <template #cell(actions)="{ row }">
                    <va-button-group>
                        <va-button size="small" color="rgb(47, 148, 172)" icon="edit" @click="editMachine(row)" />
                        <!-- <va-button small icon="delete" color="danger" @click="deleteMachine(row)" /> -->
                    </va-button-group>
                </template>
            </VaDataTable>
			
			<VaModal
			  v-model="isEditModalVisible"
			  title="修改机器信息"
			  @cancel="onCancel"
			  @ok="onOk"
			>
			  <VaForm>
			    <VaInput
			      v-model="editForm.hostname"
			      label="机器名"
				  class="mb-2"
				  readonly
			    />
				<VaInput
				  v-model="editForm.record_date"
				  label="记录日期"
				  class="mb-2"
				  readonly
				/>
				<va-input
				        v-model="editForm.online_points"
				        label="在线时长点数"
						type="number"
						placeholder="请输入0~288的整数"
						:min="0"
						:max="288"
						selected-top-shown
				        class="mb-2"
						@input="validateOnlinePoints"
				>
				  <template #messages>
					<div v-if="errorMessage" class="va-text-danger">{{ errorMessage }}</div>
				  </template>
				</va-input>
				<VaInput
				  v-model="editForm.hashrate"
				  label="算力"
				  type="number"
				  placeholder="请输入算力"
				  class="mb-2"
				/>	  
			  </VaForm>
			</VaModal>
			
            <!-- 移动端显示卡片列表 -->
            <!-- <div class="mobile-list hidden-md-and-up">
                <va-card v-for="machine in filteredMachines" :key="machine.id" class="mb-3">
                    <div class="mobile-list-item">
                        <div class="mb-2">
                            <strong>ID:</strong> {{ machine.id }}
                        </div>
                        <div class="mb-2">
                            <strong>名称:</strong> {{ machine.name }}
                        </div>
                        <div class="mb-2">
                            <strong>状态:</strong>
                            <va-badge :color="getStatusColor(machine.status)">
                                {{ machine.status }}
                            </va-badge>
                        </div>
                        <div class="mobile-actions">
                            <va-button-group>
                                <va-button small icon="edit" color="primary" @click="editMachine(machine)" />
                                <va-button small icon="delete" color="danger" @click="deleteMachine(machine)" />
                            </va-button-group>
                        </div>
                    </div>
                </va-card>
            </div> -->
        </div>

        <!-- 分页 -->
        <!-- <va-pagination v-model="currentPage" :total="totalItems" :per-page="perPage" class="mt-4" /> -->
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
import { ref, reactive, computed, watch } from 'vue'
import { preMachineList, preMachineModify, machineOptions } from "../../api/machines"
import { formatDateTime,convertDateTimeToDate,isDateDisabled,getYesterday,formatHashRate } from "../../utils/date.ts";
import { useToast,VaDatePicker, VaButton, VaIcon,VaPopover } from "vuestic-ui";
import { useI18n } from "vue-i18n";
const { t } = useI18n();

const { init: toast } = useToast()

const allocateOptions = [
    { value: '0', text: '是' },
	{ value: '1', text: '否' },
];
const groupOptions = ref([]);

const searchDate = ref(getYesterday(8)) // 存储 Date 对象
const searchMachine = ref('');
const searchAlloc = ref(allocateOptions[0]);
const searchGroup = ref(groupOptions[0]);
const searchCurrency = ref('')
const currencyOptions = ref([])

const isEditModalVisible = ref(false);

const editForm = reactive({
  id: null,
  online_points: 0.0,
  hashrate: 0.0,
  record_date: ''
});

const errorMessage = ref('');
const validateOnlinePoints = (value) => {
  const num = Number(value.data);
  console.log("num is",num)
  if (isNaN(num)) {
    errorMessage.value = '必须输入数字';
  } else if (!Number.isInteger(num)) {
    errorMessage.value = '必须为整数';
  } else if (num < 0 || num > 288) {
    errorMessage.value = '范围0~288';
  } else {
    errorMessage.value = '';
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
	  groupOptions.value = [defaultOption, ...convertToOptions(response.groups || [])];
  } catch (error) {
    console.error('接口调用失败:', error)
    // 异常处理逻辑
  }
}

const currentStartIndex = ref(1);
const totalItems = ref(100)
const machines = ref([])
const loading = ref(false)
const queryParams = reactive({
  page: 1,
  pagesize: 10,
})

const columns = [
	// { key: 'id',label: 'ID'},
    { key: 'mid', label: t('admin.mid') },
    { key: 'hostname', label: t('admin.mName') },
    { key: 'record_date', label: t('admin.recordDate') },
    { key: 'currency', label: t('admin.currency') },
	{ key:'uid', label: t('admin.userUid') },
    { key:'sub_user_name', label: t('admin.subUserName') },
    {key: 'online_time', label: t('admin.onlineTimes') },
    {key: 'online_points', label: t('admin.onlinePoints') },
	{ key: 'hashrate', label: t('admin.avgHashrate') },
	{key: 'is_in_black_list', label: t('admin.needAllocate')},
	{key: 'group', label: t('admin.groupName')},
    { key: 'actions', label: t('admin.operation') }
]

// 分页
const handlePageChange = (startIndex) => {
    queryParams.page = Math.ceil(startIndex / queryParams.pagesize);
    currentStartIndex.value = startIndex;
    fetchData();
};

const formatDate = (date) => {
    if (!date) return ''
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

// 方法
const fetchData = async () => {
    loading.value = true
    try {
	
		const params = {
		      ...queryParams,
			  is_in_black_list: searchAlloc.value.value,
			  hostname: searchMachine.value,
			  group: searchGroup.value?.value,
			  currency: searchCurrency.value?.value,
		    };
			
		if (searchDate.value) {
			params.record_date = formatDate(searchDate.value)
		}
			
        const res = await preMachineList(params)

        if (res && Array.isArray(res.machine_info) && typeof res.total === "number") {
              machines.value = res.machine_info;
              totalItems.value = res.total;
		} else if (res.machine_info === null) {
			machines.value = [];
			totalItems.value = 0;
		} else {
            toast({
                message: "查询错误",
                color: "danger",
            })
        }
    } catch (error) {
        console.error("获取数据失败:", error)
        toast({
            message: "获取数据失败",
            color: "danger",
        })
    } finally {
        loading.value = false
    }
}

const getStatusColor = (status) => {
    const colors = {
        active: 'success',
        inactive: 'warning',
        error: 'danger'
    }
    return colors[status] || 'gray'
}

watch([searchDate, searchAlloc,searchGroup,searchMachine,searchCurrency], () => {
    queryParams.page = 1
    currentStartIndex.value = 1
    fetchData()
})

const editMachine = (machine) => {
  // 绑定当前行的数据到编辑表单
  editForm.id = machine.rowData.id;
  editForm.hostname = machine.rowData.hostname;
  editForm.online_points = machine.rowData.online_points;
  editForm.hashrate = machine.rowData.hashrate;
  editForm.record_date = convertDateTimeToDate(machine.rowData.record_date);
  // 显示弹窗
  isEditModalVisible.value = true;
};

const getAllocate = (isNotAllocate) => {
	if ((isNotAllocate === 0) || (isNotAllocate === '0')) {
		return '是'
	}
	return '否'
}

const onCancel = () => {
  isEditModalVisible.value = false;
  resetForm();
};

const refreshData = () => {
	searchMachine.value = '';
	searchGroup.value = '';
	searchCurrency.value = '';
	searchAlloc.value.value = '0';
	searchAlloc.value.text = '是';
	// searchAlloc.value.value = "0";
	// searchAlloc.value.text = "是";
	// 分组不刷新
	if (searchDate.value) {
		searchDate.value = formatDate(getYesterday(8));
	}
	fetchData();
	fetchMachineOptions();
}

const onOk = async () => {
  try {
	  console.log("record_date is",editForm.record_date)
    const msg = await preMachineModify({
	  hostname: editForm.hostname,
	  record_date: editForm.record_date,
      online_points: editForm.online_points,
	  hashrate: editForm.hashrate,
    });
    toast({
      message: msg,
      color: "success",
    });
    // 刷新数据
    await fetchData();
    // 关闭弹窗
    isEditModalVisible.value = false;
  } catch (error) {
    console.error("更新失败:", error);
    toast({
      message: error,
      color: "danger",
    });
  }
};

const resetForm = () => {
  editForm.id = null;
  editForm.online_points = 0.0;
  editForm.hashrate = 0.0;
};

const deleteMachine = async (machine) => {
    // 实现删除逻辑
}

// 初始化加载数据
fetchData();
fetchMachineOptions();
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

.va-popover__content {
  z-index: 1000 !important;
  position: relative !important;
}
.va-date-picker {
  min-width: 300px !important;
}

</style>