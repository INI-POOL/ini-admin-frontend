<template>
    <va-card class="machines-list">
        <!-- 搜索和过滤区域 -->
        <div class="mb-4">
            <va-input v-model="searchQuery" placeholder="搜索矿机..." class="mb-2" :style="{ maxWidth: '100%' }">
                <template #prepend>
                    <va-icon name="search" />
                </template>
            </va-input>

            <div class="filters-row">
                <va-select v-model="statusFilter" :options="statusOptions" placeholder="状态筛选" class="filter-item" />
                <va-button @click="refreshList" class="ml-2">
                    <va-icon name="refresh" />
                    刷新
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

                <template #cell(actions)="{ row }">
                    <va-button-group>
                        <va-button small icon="edit" color="primary" @click="editMachine(row)" />
                        <va-button small icon="delete" color="danger" @click="deleteMachine(row)" />
                    </va-button-group>
                </template>
            </VaDataTable>

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


      <!-- 转账详情弹框 -->
      <VaModal v-model="detailVisible" title="转账详情" size="medium"  class="mr-6 my-1"  close-button >
      <template #content>
        <!-- 头部信息 -->
        <div class="transfer-header" style="display: flex; align-items: center; justify-content: center;flex-direction: column;gap: 0.62rem; padding-top: 1rem;">
          <div class="time">{{ formatDateTime(transfer.created_time) }}</div>
        </div>
        <VaDivider />

        <!-- 主要信息 -->
        <div class="transfer-info">
          <div class="info-row">
            <span class="label">数额：</span>
            <div class="value-box">
            <span class="value">{{removeTrailingZeros(transfer?.amount) || 0 }} {{ transfer.currency }}</span>
          </div>
          </div>
          <div class="info-row">
            <span class="label">提款手续费：</span>
            <div class="value-box">
            <span class="value">{{removeTrailingZeros(transfer?.gas_fee) || 0   }} {{ transfer.currency }}</span>
          </div>
          </div>
          <div class="info-row">
            <span class="label">收款地址：</span>
            <div class="value-box">
            <span class="value"  @click="copyText(transfer.to_addr)">{{ transfer.to_addr }}</span>
            <VaIcon class="material-icons" @click="copyText(transfer.to_addr)">
              content_copy
          </VaIcon>
          </div>
          </div>
          <div class="info-row">
            <span class="label">付款地址：</span>
            <div class="value-box">
            <span class="value"  @click="copyText(transfer.from_addr)">{{ transfer.from_addr }}</span>
            <VaIcon v-if="transfer.from_addr" class="material-icons" @click="copyText(transfer.from_addr)">
              content_copy
          </VaIcon>
          </div>
          </div>
        </div>
        <VaDivider />

        <!-- 交易号 -->
        <div class="transaction-id">
          <span class="label">交易号：</span>
          <div class="value-box">
          <span class="value"><a  :href="`https://mainnet.aleo123.io/transactionDetail/${transfer.tx_id}`" target="_blank">{{ transfer.tx_id }}</a> </span>
          <VaIcon  v-if="transfer.tx_id" class="material-icons" @click="copyText(transfer.tx_id)">
              content_copy
          </VaIcon>
        </div></div>
      </template>
    </VaModal>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { machinList, updateMachine } from "../../api/machines"
import { formatDateTime } from "../../utils/date.ts";
import { useToast } from "vuestic-ui";

const { init: toast } = useToast()

// 响应式状态
const searchQuery = ref('')
const statusFilter = ref(null)
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

const columns = [

    { key: 'id', label: '机器ID' },
    { key: 'hostname', label: '机器名' },
    { key: 'idc', label: '机房' },
    { key: 'hostname', label: '名称' },
    { key: 'currency', label: '币种' },
    { key: 'model_name', label: '机器类型' },
    { key:'sub_user_name', label: '子账户名' },
    { key:'uid', label: '用户UID' },
    { key: 'mobile', label: '手机号' },
    {key: 'last_seen', label: '上次提交时间' },
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
        const res = await machinList(queryParams)

        if (res && typeof res.total === "number") {
            machines.value = res.machines || []
            totalItems.value = res.total
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

const editMachine = async (machine) => {
    try {
        await updateMachine(machine.id, machine)
        toast({
            message: "更新成功",
            color: "success",
        })
        await fetchData()
    } catch (error) {
        console.error("更新失败:", error)
        toast({
            message: "更新失败",
            color: "danger",
        })
    }
}

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
</style>