<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="filters">
				<el-form-item>
					<el-input v-model="filters.userNickName" placeholder="微信昵称" @keyup.enter.native="searchUser"></el-input>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" v-on:click="searchUser">查询</el-button>
				</el-form-item>
			</el-form>
		</el-col>
		<!--工具条-->
		<!--列表-->
		<el-table :data="userList" highlight-current-row v-loading="listLoading"  border style="width: 100%;">
			<el-table-column type="index" width="60">
			</el-table-column>
			<el-table-column prop="userAvatarUrl" label="用户头像" width="140">
				<template slot-scope="scope">
					<img  :src="scope.row.userAvatarUrl" alt="" style="width: 50px;height: 50px;vertical-align: middle;border-radius:50%;padding:10px 0;">
				</template>
			</el-table-column>
			<el-table-column prop="userNickName" label="微信昵称" width="180">
			</el-table-column>
			<el-table-column prop="userGender" label="性别" width="100" :formatter="formatSex">
			</el-table-column>
			<el-table-column prop="telephone" label="手机号码" min-width="180">
			</el-table-column>
			<el-table-column label="操作" width="150">
				<template slot-scope="scope">
					<el-button size="small" type="danger" @click="handleDetail(scope.$index, scope.row)">详情</el-button>
				</template>
			</el-table-column>
		</el-table>
		<!--列表-->
		<!--分页-->
		<el-col :span="24" class="toolbar">
			<el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="10" :total="total" style="float:right;">
			</el-pagination>
		</el-col>
		<!--分页-->
		<!--details界面-->
		<el-dialog title="详情" v-model="detailFormVisible" :close-on-click-modal="true" v-loading="detailLoading" @close="handleClose">
			<el-form :inline="true" :model="detailForm" label-width="80px">
				<el-form-item label="微信昵称">
					<el-input v-model="detailForm.userNickName" auto-complete="off" disabled="disabled"></el-input>
				</el-form-item>
				<el-form-item label="手机号码">
					<el-input v-model="detailForm.telephone" auto-complete="off" disabled="disabled"></el-input>
				</el-form-item>
				<el-form-item label="性别">
					<el-radio-group v-model="detailForm.userGender">
						<el-radio class="radio" :label="1">男</el-radio>
						<el-radio class="radio" :label="2">女</el-radio>
					</el-radio-group>
				</el-form-item>
			</el-form>
			<el-tabs type="card" value='log' @tab-click="handleClick">
				<el-tab-pane label="登录日志" name="log">
					<el-table :data="logList" highlight-current-row  border style="width: 100%;">
						<el-table-column prop="brand" label="登录设备"></el-table-column>
						<el-table-column prop="loginTime" label="登录时间"></el-table-column>
					</el-table>
					<!--分页-->
					<el-col :span="24" class="toolbar">
						<el-pagination layout="prev, pager, next" :current-page="logPageNum" @current-change="logHandleCurrentChange" :page-size="10" :total="logTotal" style="float:right;">
						</el-pagination>
					</el-col>
					<!--分页-->
				</el-tab-pane>
		    	<el-tab-pane label="用户查询历史" name="history">
		    		<el-table :data="historyList" highlight-current-row  border style="width: 100%;">
						<el-table-column prop="searchDate" label="搜索时间"></el-table-column>
						<el-table-column prop="searchName" label="搜索类目"></el-table-column>
						<el-table-column prop="word" label="搜索商标名"></el-table-column>
						<el-table-column prop="searchType" label="搜索结果" :formatter="formatType"></el-table-column>
					</el-table>
					<!--分页-->
					<el-col :span="24" class="toolbar">
						<el-pagination layout="prev, pager, next" :current-page="historyPageNum" @current-change="historyHandleCurrentChange" :page-size="10" :total="historyTotal" style="float:right;">
						</el-pagination>
					</el-col>
					<!--分页-->
		    	</el-tab-pane>
			</el-tabs>
		</el-dialog>
		<!--details界面-->
	</section>
</template>
<script>
import ajax from '@/api/request'
import util from '../../common/js/util'
export default{
	data() {
		return {
			filters: {},
			userList: [],
			total: 0,
			pageNum: 1,
			pageSize:10,
			listLoading: false,
			detailFormVisible: false,
			detailForm: {},
			detailLoading:false,
			logList: [],
			logTotal:0,
			logPageNum:1,
			logPageSize:10,
			historyList: [],
			historyTotal:0,
			historyPageNum:1,
			historyPageSize:10
		}
	},
	methods: {
		//性别显示转换
		formatSex: function (row, column) {
			return row.userGender == 1 ? '男' : row.userGender == 2 ? '女' : '未知';
		},
		formatType: function (row,column) {
			return row.searchType == 1 ? '可以注册' : row.searchType == 2 ? '可尝试注册' : '不推荐注册';
		},
		//搜索用户
		searchUser() {
			this.getTableList(this.filters.userNickName)
		},
		//获取用户列表
		getTableList(w) {
			this.listLoading = true;
			let option = {
				data:{
					userNickName:w?w:'',
					pageNum:this.pageNum,
					pageSize:this.pageSize
				},
				userOid:this.$store.state.userOid,
				token:this.$store.state.token
			}
			ajax.userList(option).then((res) => {
				this.userList = res.data.rows;
				this.total = res.data.total;
				this.listLoading = false;
				// console.log(res)
			});
		},
		//获取用户登录日子列表
		getLogList() {
			this.detailLoading = true;
			let option = {
				data:{
					userOid:this.detailForm.userOid,
					pageNum:this.logPageNum,
					pageSize:this.logPageSize
				},
				userOid:this.$store.state.userOid,
				token:this.$store.state.token	
			}
			ajax.userLogList(option).then( res=> {
				this.detailLoading = false;
				this.logList = res.data.rows;
				this.logTotal = res.data.total;
				// console.log(res)
			})
		},
		//获取用户查询历史
		getHistory() {
			this.detailLoading = true;
			let option = {
				data:{
					userOid:this.detailForm.userOid,
					pageNum:this.historyPageNum,
					pageSize:this.historyPageSize
				},
				userOid:this.$store.state.userOid,
				token:this.$store.state.token	
			}
			ajax.userHistory(option).then( res=> {
				this.detailLoading = false;
				this.historyList = res.data.rows;
				this.historyTotal = res.data.total;
				// console.log(res)
			})
		},
		//分页
		handleCurrentChange(val) {
			this.pageNum = val;
			this.getTableList();
		},
		logHandleCurrentChange(val){
			this.logPageNum = val;
			this.getLogList();
		},
		historyHandleCurrentChange(val){
			this.historyPageNum = val;
			this.getHistory();
		},
		//显示详情界面
		handleDetail: function (index, row) {
			this.detailFormVisible = true;
			this.detailForm = Object.assign({}, row);
			this.getLogList();
			this.getHistory();
		},
		handleClose(){
			this.logPageNum = 1;
			this.historyPageNum =1;
		},
		//弹出层的选项卡
		handleClick(tab, event) {
	        // console.log(tab, event);
	    }
	},
	created() {
		this.getTableList();
	},
	watch:{
		filters:{
			handler:function(){
				if(this.filters.userNickName == ''){
					this.getTableList()
				}
			},
			deep:true
		}
	}
}
</script>
<style scoped>
	
</style>