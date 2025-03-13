<template>
    <va-card class="machines-list">
        <!-- 搜索和过滤区域 -->
        <div class="mb-4">
            <va-input v-model="searchMachine" placeholder="搜索机器名" class="mb-1 mr-5" :style="{ maxWidth: '20%'}">
                <template #prepend>
                    <!-- <va-icon name="va-calendar" /> -->
                </template>
            </va-input>
            <va-input v-model="searchMobile" placeholder="搜索手机号" class="mb-1 mr-5" :style="{ maxWidth: '20%' }">
                <template #prepend>
                    <!-- <va-icon name="mobile" /> -->
                </template>
            </va-input>
			<va-input v-model="searchSubUser" placeholder="搜索子账户" class="mb-1 mr-5" :style="{ maxWidth: '20%' }">
			    <template #prepend>
			        <!-- <va-icon name="sub" /> -->
			    </template>
			</va-input>
			<va-input v-model="searchUid" placeholder="搜索用户UID" class="mb-1 mr-5" :style="{ maxWidth: '20%' }">
			    <template #prepend>
			        <!-- <va-icon name="sub" /> -->
			    </template>
			</va-input>
            <div class="filters-row mt-4">
				<va-select v-model="searchCurrency" :options="currencyOptions" placeholder="币种筛选" class="filter-item mr-5" :style="{ maxWidth: '16%' }" />
               <va-select v-model="searchIdc" :options="idcOptions" placeholder="机房筛选" class="filter-item" :style="{ maxWidth: '16%' }" />
                <va-button @click="refreshList" class="ml-5">
                    <!-- <va-icon name="refresh" /> -->
                    搜索
                </va-button>
            </div>
        </div>

        <!-- 列表区域 -->
        <div class="table-responsive">
            <!-- 桌面端显示表格 -->
            <VaDataTable :items="machines" :columns="columns" striped  class="responsive-table">
                <!-- 时间显示 -->
                <template #cell(created_time)="{ value }">
                    {{ formatDateTime(value) }}
                </template>
				<template #cell(last_seen)="{ value }">
				    {{ convertDateTime(value) }}
				</template>

                <template #cell(actions)="{ row }">
                    <va-button-group>
                        <va-button small icon="edit" color="primary" @click="editMachine(row)" />
                        <!-- <va-button small icon="delete" color="danger" @click="deleteMachine(row)" /> -->
                    </va-button-group>
                </template>
            </VaDataTable>
			
			<VaModal
			  v-model="isEditModalVisible"
			  title="编辑机器信息"
			  @cancel="onCancel"
			  @ok="onOk"
			>
			  <VaForm>
			    <VaInput
			      v-model="editForm.hostname"
			      label="机器名"
			      placeholder="请输入机器名"
				  class="mb-2"
			    />
				<VaInput
				  v-model="editForm.sub_user_name"
				  label="子账户名"
				  placeholder="请输入子账户名"
				  class="mb-2"
				/>
				<va-select
				        v-model="editForm.currency"
				        label="币种"
				        :options="currencyOptions"
				        placeholder="请选择币种"
				        class="mb-2"
				/>
				<va-select
				        v-model="editForm.group"
				        label="分组"
				        :options="groupOptions"
				        placeholder="请选择分组"
				        class="mb-2"
			    />
			    <va-select
					 v-model="editForm.is_in_black_list"
					 label="是否参与分配"
					 :options="allocateOptions"
					 placeholder="请选择"
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
import { ref, reactive } from 'vue'
import { machinList, updateMachine } from "../../api/machines"
import { formatDateTime,convertDateTime } from "../../utils/date.ts";
import { useToast } from "vuestic-ui";

const { init: toast } = useToast()

// 响应式状态
const searchMachine = ref('');
const searchMobile = ref('');
const searchSubUser = ref('');
const searchCurrency = ref('');
const searchUid = ref('');
const searchIdc = ref('');
const statusFilter = ref(null);
const isEditModalVisible = ref(false);
const editForm = reactive({
  id: null,
  hostname: "",
  sub_user_name: "",
  currency: "",
  group: "",
  is_in_black_list: "",
});

const currentStartIndex = ref(1);
const totalItems = ref(100)
const machines = ref([])
const loading = ref(false)
// 查询参数
const queryParams = reactive({
  page: 1,
  pagesize: 10,
})

// 常量数据
const statusOptions = [
    { value: 'active', text: '运行中' },
    { value: 'inactive', text: '已停止' },
    { value: 'error', text: '错误' }
]

const currencyOptions = [
    { value: 'aleo', text: 'aleo' },
	{ value: 'ltc', text: 'ltc' },
]

const groupOptions = [
    { value: 'default', text: 'default' },
	{ value: 'um001', text: 'um001' },
]

const allocateOptions = [
    { value: '0', text: '是' },
	{ value: '1', text: '否' },
]

const idcOptions = [
	{ value: 'HAIAN', text: 'HAIAN' },
	{ value: 'QINGPU', text: 'QINGPU' },
]

const columns = [

    { key: 'id', label: '机器ID' },
    { key: 'hostname', label: '机器名' },
    { key: 'idc', label: '机房' },
    { key: 'currency', label: '币种' },
    { key: 'model_name', label: '机器类型' },
    { key:'sub_user_name', label: '子账户名' },
    { key:'uid', label: '用户UID' },
    { key: 'mobile', label: '手机号' },
    {key: 'last_seen', label: '最近提交时间' },
    {key: 'created_time', label: '创建时间' },
    // { key: 'status', label: '状态' },
    { key: 'actions', label: '操作' }
]

// 计算属性
// const filteredMachines = computed(() => {
//     return machines.value.filter(machine => {
//         const matchesSearch = machine.name.toLowerCase().includes(searchQuery.value.toLowerCase())
//         const matchesStatus = !statusFilter.value || machine.status === statusFilter.value
//         return matchesSearch && matchesStatus
//     })
// })

// 分页
const handlePageChange = (startIndex) => {
    queryParams.page = Math.ceil(startIndex / queryParams.pagesize);
    currentStartIndex.value = startIndex;
    fetchData();
};

// 方法
const fetchData = async () => {
    loading.value = true
    try {
		const params = {
		      ...queryParams,
		      mobile: searchMobile.value,
		      hostname: searchMachine.value,
			  sub_user_name: searchSubUser.value,
			  currency: searchCurrency.value.value,
			  uid: searchUid.value,
			  idc: searchIdc.value.value
		    };
        const res = await machinList(params)

        if (res && Array.isArray(res.machines) && typeof res.total === "number") {
              machines.value = res.machines;
              totalItems.value = res.total;
		} else {
            console.error("API返回数据格式错误:", res)
            toast({
                message: "数据格式错误",
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

const refreshList = () => {
    fetchData()
}

const editMachine = (machine) => {
  // 绑定当前行的数据到编辑表单
  editForm.id = machine.rowData.id;
  editForm.hostname = machine.rowData.hostname;
  editForm.sub_user_name = machine.rowData.sub_user_name;
  editForm.currency = machine.rowData.currency;
  editForm.group = machine.rowData.group;
  editForm.idc = machine.rowData.idc;
  editForm.is_in_black_list = getAllocate(machine.rowData.is_in_black_list);
  // 显示弹窗
  isEditModalVisible.value = true;
};

const getAllocate = (isNotAllocate) => {
	if (isNotAllocate === '0') {
		return '是'
	}
	return '否'
}

const onCancel = () => {
  isEditModalVisible.value = false;
  resetForm();
};

const onOk = async () => {
  try {
    // 提交修改
    const msg = await updateMachine(editForm.id, {
      hostname: editForm.hostname,
	  sub_user_name: editForm.sub_user_name,
	  idc: editForm.idc,
	  currency:editForm.currency.value,
	  is_in_black_list:editForm.is_in_black_list.value,
	  group:editForm.group.value
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
      message: "更新失败",
      color: "danger",
    });
  }
};

const resetForm = () => {
  editForm.id = null;
  editForm.hostname = "";
  editForm.mobile = "";
};

const deleteMachine = async (machine) => {
    // 实现删除逻辑
}

// 初始化加载数据
fetchData()
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