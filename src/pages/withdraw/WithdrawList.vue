<template>
  <div class="withdraw-list">
    <div class="mb-4">
      <h1 class="text-2xl font-bold">提现管理 (热钱包余额：{{ hotAddressBalance || 0 }})</h1>
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
                v-if="row"
                size="small"
                preset="primary"
                @click="handleView(row)"
              >
                查看
              </VaButton>
              <VaButton
                v-if="row && Number(row.rowData.audit_status) === 0"
                size="small"
                preset="primary"
                @click="handleAudit(row)"
              >
              <!-- <VaButton
                v-if="row"
                size="small"
                preset="primary"
                @click="handleAudit(row)"
              > -->
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
            当前提现金额：{{ removeTrailingZeros(currentItem?.amount) || 0 }} {{ currentItem?.currency || '' }} 
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
          <div class="mb-2" style="padding-top: 0.62rem;">谷歌认证</div>
          <VaInput v-model="auditForm.google_code" width="200px" placeholder="请输入谷歌认证码" />
        </div>
      </div>
    </VaModal>

    <!--查看详情-->
    <!-- <VaModal
      v-model="detailVisible"
      title="查看详情"
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
    </VaModal> -->

       <!-- 转账详情弹框 -->
      <VaModal v-model="detailVisible" title="转账详情" size="medium"  class="mr-6 my-1"  close-button >
      <template #content>
        <!-- 头部信息 -->
        <div class="transfer-header" style="display: flex; align-items: center; justify-content: center;flex-direction: column;gap: 0.62rem; padding-top: 1rem;">
             <VaAvatar v-if="transfer.status === 0" color="info">
              <span class="material-symbols-outlined" style="font-size: 40px;">
              more_horiz
              </span>
             </VaAvatar>
             <VaAvatar v-else-if="transfer.status === 1" color="success">
              <span  class="material-symbols-outlined" style="font-size: 40px;">
              check
              </span>
             </VaAvatar>
             <VaAvatar v-else-if="transfer.status === 2" color="danger" >
              <span class="material-symbols-outlined" style="font-size: 40px;">
              close
              </span>
             </VaAvatar>
             <VaAvatar v-else-if="transfer.status === 3" color="warning">
              <span class="material-symbols-outlined" style="font-size: 40px;">
              directory_sync
              </span>
             </VaAvatar>
             <VaAvatar v-else-if="transfer.status === 4" color="danger">
              <span  class="material-symbols-outlined" style="font-size: 40px;">
              check
              </span>
             </VaAvatar>
          <div class="status">
            {{ getWithdrawStatusText(transfer.status) }}</div>
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
            <!-- <VaButton icon="copy" @click="copyText(transfer.sender)" size="small" preset="secondary" /> -->
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
          <!-- <VaButton icon="copy" @click="copyText(transfer.tx_id)" size="small" preset="secondary" /> -->
        </div></div>
      </template>

      <!-- <template #footer>
        <VaButton color="danger" @click="showModal = false">关闭</VaButton>
      </template> -->
    </VaModal>
  </div>
</template>

<script lang="js" setup>
import { ref, reactive, onMounted } from "vue";
import { useToast } from "vuestic-ui";
import { getWithdrawList, auditWithdraw, getHotAddressBalance } from "../../api/withdraw";
import { formatDateTime } from "../../utils/date.ts";
import {removeTrailingZeros} from "../../utils/index";
import { getUser } from "../../utils/auth";

const { init: toast } = useToast();

// 表格列定义
const columns = [
  { key: "id", label: "订单号" },
  { key: "user_id", label: "用户编号" },
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

// 复制功能
const copyText = async (text) => {
 
  // try {
  //   await navigator.clipboard.writeText(text)
  //   toast({ message: "复制成功",color: "success"})
  // } catch (err) {
  //   toast({ message: '复制失败', color: 'danger' })
  // }
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      // console.log('复制成功');
      toast({ message: "复制成功",color: "success"})
    }).catch(err => {
      // console.error('复制失败', err);
      toast({ message: "复制成功",color: "success"})
    });
  } else {
    // 备用方式，比如使用 document.execCommand()
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    // console.log('复制成功');
    toast({ message: "复制成功",color: "success"})
  }
}

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
    0: "处理中",
    1: "成功",
    2: "失败",
    3: "确认中",
    4: "提现异常",
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
  let color= map[status] || "primary";
  console.log(map[status]);
  return color;
};

// 审核状态
const getAuditStatusText = (status) => {
  const map = {
    0: "待审核",
    1: "已通过",
    2: "未通过",
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

// 提交审核
const handleAuditSubmit = async () => {
  if (!currentItem.value) return;
  let username=getUser();
  if(!auditForm.google_code){
    toast({
      message: "谷歌认证码不能为空",
      color: "danger",
    });
    return;
  }

  try {
    let data = await auditWithdraw({
      id: currentItem.value.id,
      audit_status: auditForm.audit_status,
      google_code: auditForm.google_code,
      user_name: username,
    });
	
	console.log("data is",data)
	if (data == 0){
		toast({
		  message: "审核失败, 余额不足",
		  color: "warning",
		});
	}else{
		toast({
		  message: "审核成功",
		  color: "success",
		});
		auditVisible.value = false;
		fetchData();
	}
  } catch (error) {
    toast({
      message: error,
      color: "danger",
    });
  }
};

// 查看详情
const detailVisible = ref(false);
const transfer = ref(null);
const handleView = (row) => {
  if (!row) {
    console.error('行数据为空')
    return
  }
  transfer.value = row.rowData;
  auditForm.audit_status = 1; // 每次打开弹窗时重置为通过
  detailVisible.value = true;

  // console.log('查看详情:', row)
  // 实现查看详情逻辑
}

// 获取热钱包余额
const hotAddressBalance = ref(0);
const getHotAddressBalanceData = async () => {
  try {
    const res = await getHotAddressBalance();
    
    if (res) {
      hotAddressBalance.value = parseFloat(res);
    } else {
      console.error('热钱包余额获取失败:', res);
    }
  } catch (error) {
    console.error('热钱包余额获取失败:', error);
  }
};

onMounted(() => {
  fetchData();
  getHotAddressBalanceData();
});
</script>

<style scoped lang="scss">
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
  
  
  /* 转账相关样式 */
  .transfer-header {
    /* display: flex; */
    /* justify-content: space-between; */
    font-weight: bold;
    margin-bottom: 10px;
  }
  
  .transfer-info .info-row,
  .transaction-id {
    display: flex;
    align-items: center;
    
    // justify-content: space-between;
    margin-bottom: 10px;
  }
  .info-row{

  }

  /* 左侧标题固定宽度 */
.label{
  font-weight: bold;
  width: 120px;
  min-width: 120px;
  text-align: left;
  margin-bottom: 5px;
  color: #A5A5A5;
  padding: 20px;
  padding-right: 0;
  // box-sizing: border-box;
  
  /* Body/Small */
  font-family: "PingFang SC";
  font-size: 0.75rem;
  font-style: normal;
  font-weight: 400;
  line-height: 1.25rem; /* 166.667% */
}
.time {
  color: #A5A5A5;
  font-family: "PingFang SC";
  font-size: 0.75rem;
  font-style: normal;
  font-weight: 400;
  line-height: 1.25rem; /* 166.667% */
}

/* 右侧数值区域 */
.value-box {
  display: flex;
  // align-items: center;
  justify-content: space-between;
  // background: #f5f5f5;
  // padding: 5px 10px;
  // border-radius: 5px;
  // flex-grow: 1; /* 右侧区域占用剩余空间 */
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */

}
  
  .value {
    // flex-grow: 1;
    word-break: break-all;
    margin-right: 10px;
    color: #000;

    /* Body/Small */
    font-family: "PingFang SC";
    font-size: 0.75rem;
    font-style: normal;
    font-weight: 400;
    line-height: 1.25rem; /* 166.667% */
    white-space: normal; /* 让文本自动换行 */
  }
</style>
