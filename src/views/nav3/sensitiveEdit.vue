<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="filters">
				<el-form-item>
					<el-input v-model="filters.word" placeholder="敏感词" @keyup.enter.native="searchWord"></el-input>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" v-on:click="searchWord">查询</el-button>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="handleAdd">新增</el-button>
				</el-form-item>
			</el-form>
		</el-col>
		<!--列表-->
		<el-table :data="sensitiveList" highlight-current-row v-loading="listLoading" style="width:100%">
			<el-table-column type="index" width="60"></el-table-column>
			<el-table-column type="expand">
				<template slot-scope="props">
					<el-form label-position="left" inline class="demo-table-expand">
						<el-form-item label="创建者：">
							<span>{{ props.row.createBy }}</span>
						</el-form-item>
						<el-form-item label="创建时间：">
							<span>{{ getTime(props.row.createTime) }}</span>
						</el-form-item>
						<el-form-item label="更新者：">
							<span>{{ props.row.updateBy }}</span>
						</el-form-item>
						<el-form-item label="更新时间：">
							<span>{{ getTime(props.row.updateTime) }}</span>
						</el-form-item>
					</el-form>
				</template>
			</el-table-column>
			<el-table-column label="敏感词" prop="word" width="320"></el-table-column>
			<el-table-column label="原因" prop="reason" min-width="600"></el-table-column>
			<el-table-column label="操作" width="150">
				<template slot-scope="scope">
					<el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
					<el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>
				</template>
			</el-table-column>
		</el-table>
		<!--列表-->
		<!--分页-->
		<el-col :span="24" class="toolbar">
			<el-button type="danger" @click="batchRemove" :disabled="this.sels.length===0">批量删除</el-button>
			<el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="10" :total="total" style="float:right;">
			</el-pagination>
		</el-col>
		<!--分页-->
		<!--编辑界面-->
		<el-dialog title="编辑" v-model="editFormVisible" :close-on-click-modal="true">
			<el-form :model="editForm" label-width="80px" :rules="editFormRules" ref="editForm">
				<el-form-item label="敏感词" prop="word">
					<el-input v-model="editForm.word" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="原因" prop="reason">
					<el-input type="textarea" v-model="editForm.reason"></el-input>
				</el-form-item>
				<el-form-item label="更新者">
					<el-input v-model="editForm.updateBy" auto-complete="off"></el-input>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="editFormVisible = false">取消</el-button>
				<el-button type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button>
			</div>
		</el-dialog>
		<!--编辑界面-->
		<!--新增界面-->
		<el-dialog title="新增" v-model="addFormVisible" :close-on-click-modal="true">
			<el-form :model="addForm" label-width="80px" :rules="addFormRules" ref="addForm">
				<el-form-item label="敏感词" prop="word">
					<el-input v-model="addForm.word" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="原因" prop="reason">
					<el-input type="textarea" v-model="addForm.reason"></el-input>
				</el-form-item>
				<el-form-item label="更新者">
					<el-input v-model="addForm.updateBy" auto-complete="off"></el-input>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="addFormVisible = false">取消</el-button>
				<el-button type="primary" @click.native="addSubmit" :loading="addLoading">提交</el-button>
			</div>
		</el-dialog>
		<!--新增界面-->
	</section>
</template>
<script>
import ajax from '@/api/request'
import util from '../../common/js/util'
export default{
	data(){
		return{
			listLoading:false, 
			sensitiveList:[],
			pageNum: 1,
			pageSize:10,
			total:0,
			sels: [],//列表选中列
			editLoading: false,
			editFormVisible: false,
			editFormRules: {
				word: [
					{ required: true, message: '请输入敏感词', trigger: 'blur' }
				]
			},
			editForm:{},
			addLoading: false,
			addFormVisible: false,
			addFormRules: {
				word: [
					{ required: true, message: '请输入敏感词', trigger: 'blur' }
				]
			},
			addForm:{},
			filters:{
				word:''
			},
		}
	},
	methods:{
		//时间转换
		getTime:function(t){
			return util.formatDate.stringToTime(t)
		},
		//获取表格数据
		getTableList:function(w){
			const This = this;
			this.listLoading = true;
			let option = {
				data:{
					word:w? w : '',
					pageNum:this.pageNum,
					pageSize:this.pageSize
				},
				userOid:this.$store.state.userOid,
				token:this.$store.state.token
			}
			ajax.sensitiveList(option).then(data => {
				this.sensitiveList = data.data.rows;
				this.total = data.data.total;
				this.listLoading = false;
				// console.log(this.sensitiveList)
			})
		},
		//编辑
		handleEdit:function(index,row){
			this.editFormVisible = true;
			this.editForm = Object.assign({}, row);
		},
		//编辑提交
		editSubmit:function(){
			this.$refs.editForm.validate( valid => {
				if(valid){
					this.editLoading = true;
					// console.log(this.editForm)
					let option = {
						data:this.editForm,
						userOid:this.$store.state.userOid,
						token:this.$store.state.token
					}
					ajax.sensitiveUpdate(option).then(data => {
						this.editLoading = false;
						this.$message({
							message: '提交成功',
							type: 'success'
						});
						this.$refs['editForm'].resetFields();
						this.editFormVisible = false;
						this.getTableList();
					})
				}
			})
		},
		handleAdd: function () {
			this.addFormVisible = true;
		},
		//新增
		addSubmit: function () {
			this.$refs.addForm.validate((valid) => {
				if (valid) {
					this.$confirm('确认提交吗？', '提示', {}).then(() => {
						this.addLoading = true;
						let row = Object.assign({}, this.addForm);
						let option = {
							data:row,
							userOid:this.$store.state.userOid,
							token:this.$store.state.token
						}
						ajax.sensitiveAdd(option).then(res => {
							this.addLoading = false;
							this.$message({
								message: '添加成功',
								type: 'success'
							});
							this.$refs['addForm'].resetFields();
							this.addFormVisible = false;
							this.getTableList();
						}).catch(res =>{
							this.$message.error('添加失败了呢');
						})
					})
				}
			});
		},
		//单条删除
		handleDel: function (index, row) {
			this.$confirm('确认删除该记录吗?', '提示', {
				type: 'warning'
			}).then(() => {
				this.listLoading = true;
				let option = {
						data:row,
						userOid:this.$store.state.userOid,
						token:this.$store.state.token
					}
				ajax.sensitiveDelete(option).then(res => {
					this.listLoading = false;
					this.$message({
						message: '删除成功',
						type: 'success'
					});
					this.getTableList();
				}).catch(res =>{
					this.$message.error('删除失败了呢');
				})
			}).catch(() => {

			});
		},
		//批量删除(暂时没有做)
		batchRemove: function () {
			var items = this.sels.map(item => item)
			this.$confirm('确认删除选中记录吗？', '提示', {
				type: 'warning'
			}).then(() => {
				// this.listLoading = true;
				console.log(items)
				this.$notify({
					title:'警告',
					message:'批量删除功能暂时没有开放，如有需求请联系李蒙',
					type:'warning',
					duration:0
				})
			}).catch(() => {

			});
		},
		//敏感词查询
		searchWord:function(){
			this.listLoading = true;
			this.getTableList(this.filters.word);
		},
		//分页
		handleCurrentChange(val) {
			this.pageNum = val;
			this.getTableList();
		},
	},
	created(){
		this.getTableList();
		// console.log(util.formatDate.stringToTime(1541402140000))
	},
	watch:{
		filters:{
			handler:function(){
				if(this.filters.word == ''){
					this.getTableList()
				}
			},
			deep:true
		}
	}
}
</script>
<style>
  .demo-table-expand {
    font-size: 0;
  }
  .demo-table-expand label {
    width: 90px;
    color: #99a9bf;
  }
  .demo-table-expand .el-form-item {
    margin-right: 0;
    margin-bottom: 0;
    width: 50%;
  }
</style>