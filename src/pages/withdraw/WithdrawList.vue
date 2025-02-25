<template>
  <div class="withdraw-list">
    <div class="mb-4">
      <h1 class="text-2xl font-bold">提现管理</h1>
    </div>

    <!-- 搜索条件 -->
    <!-- <VaCard class="mb-4">
      <VaCardContent>
        <div class="flex gap-4 flex-wrap">
          <VaSelect v-model="queryParams.status" label="状态" :options="statusOptions" class="w-48" clearable />
          <VaButton @click="handleSearch">搜索</VaButton>
          <VaButton preset="secondary" @click="handleReset">重置</VaButton>
        </div>
      </VaCardContent>
    </VaCard> -->

    <!-- 列表 -->
    <VaCard>
      <VaCardContent>
        <VaDataTable
          :items="tableData"
          :loading="loading"
          :columns="columns"
          :items-per-page="queryParams.pagesize"
          :current-page="queryParams.page"
          :total-items="total"
          :selectable="false"
          :show-select="false"
          hoverable
          class="responsive-table"
        >
           <!-- 提现状态 -->
           <template #cell(amount)="{ value }">
              {{ removeTrailingZeros(value) }}
          </template>

           <!-- 提现状态 -->
           <template #cell(gas_fee)="{ value }">
              {{ removeTrailingZeros(value) }}
          </template>

          <!-- 提现状态 -->
          <template #cell(status)="{ value }">
            <VaBadge :color="getWithdrawStatusColor(value)">
              {{ getWithdrawStatusText(value) }}
            </VaBadge>
          </template>

          <!-- 审核状态 -->
          <template #cell(audit_status)="{ value }">
            <VaBadge :color="getAuditStatusColor(value)">
              {{ getAuditStatusText(value) }}
            </VaBadge>
          </template>

          <!-- 时间显示 -->
          <template #cell(created_time)="{ value }">
            {{ formatDateTime(value) }}
          </template>

          <!-- 操作列 -->
          <template #cell(action)="{ row }">
            <div class="action-buttons" style="text-align: center">
              <VaButton
                v-if="row && Number(row.rowData.audit_status) === 0"
                size="small"
                preset="primary"
                @click="handleAudit(row)"
              >
                审核
              </VaButton>
              <span v-else>--</span>
            </div>
          </template>
        </VaDataTable>

        <!-- 分页器 -->
        <div class="flex justify-end mt-4">
          <VaPagination
            v-model="currentStartIndex"
            :page-size="queryParams.pagesize"
            visible-pages="5"
            :total="total"
            buttons-preset="secondary"
            boundary-numbers
            @update:modelValue="handlePageChange"
          />
          <span class="ml-4 self-center text-gray-600">
            共 {{ total }} 条记录
          </span>
        </div>
      </VaCardContent>
    </VaCard>

    <!-- 审核弹窗 -->
    <VaModal
      v-model="auditVisible"
      title="提现审核"
      :ok-text="'确认'"
      :cancel-text="'取消'"
      size="small"
      class="audit-modal"
      @ok="handleAuditSubmit"
    >
      <div class="space-y-4">
        <div>
          <div class="mb-4">
            当前提现金额：{{ removeTrailingZeros(currentItem?.amount) || 0 }} 
          </div>
          <div class="mb-2">审核结果</div>
          <VaRadio
            v-model="auditForm.audit_status"
            :options="[
              {
                text: '同意',
                value: 1,
              },
              {
                text: '拒绝',
                value: 2,
              },
            ]"
            value-by="value"
          />
        </div>
      </div>
    </VaModal>
  </div>
</template>

<script lang="js" setup>
import { ref, reactive, onMounted } from "vue";
import { useToast } from "vuestic-ui";
import { getWithdrawList, auditWithdraw } from "../../api/withdraw";
import { formatDateTime } from "../../utils/date.ts";
import {removeTrailingZeros} from "../../utils/index";

const { init: toast } = useToast();

// 表格列定义
const columns = [
  { key: "mobile", label: "手机号" },
  { key: "amount", label: "提现金额" },
  { key: "gas_fee", label: "gas费" },
  { key: "currency", label: "币种" },
  { key: "status", label: "提现状态" },
  { key: "audit_status", label: "审核状态",sortable: true },
  { key: "created_time", label: "申请时间",sortable: true },
  { key: "action", label: "操作" },
];

// 查询参数
const queryParams = reactive({
  page: 1,
  pagesize: 10,
});

// 表格数据
const tableData = ref([]);
const total = ref(0);
const currentStartIndex = ref(1);
const loading = ref(false);

// 获取列表数据
const fetchData = async () => {
  loading.value = true;
  try {
    const res = await getWithdrawList(queryParams);
    // 确保返回的数据格式正确
    if (res && typeof res.Total === "number") {
      tableData.value = res.Withdraws || [];
      total.value = parseInt(res.Total); // 确保是数字类型
    } else {
      console.error("API返回数据格式错误:", res);
      toast({
        message: "数据格式错误",
        color: "danger",
      });
    }
  } catch (error) {
    console.error("获取数据失败:", error);
    toast({
      message: "获取数据失败",
      color: "danger",
    });
  } finally {
    loading.value = false;
  }
};

// 搜索
// const handleSearch = () => {
//   queryParams.page = 1
//   fetchData()
// }

// 重置
// const handleReset = () => {
//   queryParams.status = ''
//   queryParams.startDate = ''
//   queryParams.endDate = ''
//   queryParams.page = 1
//   queryParams.pagesize = 10
//   fetchData()
// }

// 分页
const handlePageChange = (startIndex) => {
  queryParams.page = Math.ceil(startIndex / queryParams.pagesize);
  currentStartIndex.value = startIndex;
  fetchData();
};

// 每页条数改变
// const handlePageSizeChange = (pageSize) => {
//   queryParams.pagesize = pageSize.value
//   queryParams.page = 1 // 切换每页条数时重置为第一页
//   fetchData()
// }

// 格式化金额
// const formatMoney = (value: number) => {
//   return value ? `¥ ${value.toFixed(2)}` : '¥ 0.00'
// }

// 提现状态
const getWithdrawStatusText = (status) => {
  const map = {
    0: "申请中",
    1: "提现成功",
    2: "提现失败",
    3: "提现异常",
  };
  return map[status] || "未知状态";
};

const getWithdrawStatusColor = (status) => {
  const map = {
    0: "warning",
    1: "success",
    2: "info",
    3: "danger",
  };
  return map[status] || "primary";
};

// 审核状态
const getAuditStatusText = (status) => {
  const map = {
    0: "待审核",
    1: "审核成功",
    2: "审核失败",
  };
  return map[status] || "未知状态";
};

const getAuditStatusColor = (status) => {
  const map = {
    0: "warning",
    1: "success",
    2: "danger",
  };
  return map[status] || "primary";
};

// 审核选项
// const auditOptions = [
//   {
//     label: '通过审核',
//     value: 1,
//     color: 'success', // 可选：设置颜色
//   },
//   {
//     label: '拒绝提现',
//     value: 2,
//     color: 'danger', // 可选：设置颜色
//   },
// ]

// 审核相关
const auditVisible = ref(false);
const currentItem = ref(null);
const auditForm = reactive({
  audit_status: 1, // 默认选中通过
});

const handleAudit = (row) => {
  if (!row) {
    return;
  }
  currentItem.value = row.rowData;
  auditForm.audit_status = 1; // 每次打开弹窗时重置为通过
  auditVisible.value = true;
};

const handleAuditSubmit = async () => {
  if (!currentItem.value) return;

  try {
    await auditWithdraw({
      id: currentItem.value.id,
      audit_status: auditForm.audit_status,
    });

    toast({
      message: "审核成功",
      color: "success",
    });
    auditVisible.value = false;
    fetchData();
  } catch (error) {
    toast({
      message: "审核失败",
      color: "danger",
    });
  }
};

// 查看详情
// const handleView = (row: any) => {
//   if (!row) {
//     console.error('行数据为空')
//     return
//   }
//   console.log('查看详情:', row)
//   // 实现查看详情逻辑
// }

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.withdraw-list {
  /* padding: 1rem; */
}

.audit-buttons {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 1rem;
}

.audit-btn {
  min-width: 100px;
  padding: 0.5rem 2rem;
  background-color: white;
  color: #666;
  border: 1px solid white;
  transition: all 0.3s;
}

.audit-btn:hover {
  background-color: white;
}

.audit-btn.active {
  &:first-child {
    background-color: var(--va-success);
    color: white;
    border-color: var(--va-success);
  }

  &:last-child {
    background-color: var(--va-danger);
    color: white;
    border-color: var(--va-danger);
  }
}

.radio-group {
  display: flex;
  justify-content: center;
  gap: 3rem;
  margin-top: 1rem;
}

.radio-item {
  padding: 0.5rem 1rem;
}

:deep(.va-radio__label) {
  font-size: 1rem;
  font-weight: 500;
  margin-left: 0.5rem;
}

:deep(.va-radio__input) {
  margin-right: 0.5rem;
}

:deep(.va-radio--selected) {
  .va-radio__label {
    /* color: var(--va-primary); */
  }
}

/* 自定义弹窗样式 */
:deep(.audit-modal) {
  max-width: 400px !important; /* 设置最大宽度 */
}

/* 响应式表格样式 */
:deep(.responsive-table) {
  overflow-x: auto;

  /* 确保操作列固定在右侧 */
  .va-data-table__table {
    min-width: 800px; /* 设置最小宽度 */
    position: relative;
  }

  /* 操作列样式 */
  th:last-child,
  td:last-child {
    text-align: center;
    position: sticky;
    right: 0;
    background: white;
    z-index: 1;
    /* 添加阴影效果 */
    &::after {
      content: "";
      position: absolute;
      left: -5px;
      top: 0;
      bottom: 0;
      width: 5px;
      background: linear-gradient(to right, transparent, rgba(0,0,0,0.1));
    }
  }
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  padding-left: 5px;
  padding-right: 5px;
  min-width: 40px; /* 确保按钮有足够空间 */
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
  :deep(.responsive-table) {
    /*margin: 0 -1rem; *//* 移除边距 */
    margin: 0;

    .va-data-table__table {
      min-width: 600px; /* 调整移动端最小宽度 */
    }

    /* 调整操作列样式 */
    td:last-child {
      padding: 0.5rem;
      min-width: 80px;
    }
  }

  .action-buttons {
    flex-direction: column;
    gap: 0.25rem;
  }
}
</style>
