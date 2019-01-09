<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar">			
			<el-button type="primary" @click="handleAdd">新增</el-button>					
		</el-col>
		<!--工具条-->
		<el-table :data="adminList" highlight-current-row v-loading="listLoading"  border style="width: 100%;">
			<el-table-column type="index" width="60">
			</el-table-column>
			<el-table-column prop="createTime" label="创建时间">
			</el-table-column>
			<el-table-column prop="name" label="名称">
			</el-table-column>
			<el-table-column label="操作" width="85">
				<template slot-scope="scope">
					<el-button size="small" type="danger" @click="handleDelete(scope.$index, scope.row)" v-show="scope.row.name != '管理员'">删除</el-button>
				</template>
			</el-table-column>
		</el-table>
		<!--分页-->
		<el-col :span="24" class="toolbar">
			<el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="10" :total="total" style="float:right;">
			</el-pagination>
		</el-col>
		<!--分页-->
		<!--新增界面-->
		<el-dialog title="新增" v-model="addFormVisible" :close-on-click-modal="true" @close="handleClose">
			<el-form :model="addForm" label-width="80px" :rules="addFormRules" ref="addForm">
				<el-form-item label="账号" prop="username">
					<el-input v-model="addForm.username"></el-input>
				</el-form-item>
				<el-form-item label="昵称" prop="name">
					<el-input v-model="addForm.name"></el-input>
				</el-form-item>
				<el-form-item label="密码" prop="password">
					<el-input v-model="addForm.password" type="password"></el-input>
				</el-form-item>
				<el-form-item label="重复密码" prop="repassword">
					<el-input v-model="addForm.repassword" type="password"></el-input>
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
export default{
	data(){
		return{
			listLoading:false,
			adminList:[],
			pageNum:1,
			pageSize:10,
			total:0,
			//新增
			addFormVisible:false,
			addFormRules:{
				username: [
					{ required: true, message: '请输入账号', trigger: 'blur' }
				],
				name: [
					{ required: true, message: '请输入昵称', trigger: 'blur' }
				],
				password: [
					{ required: true, message: '请输入密码', trigger: 'blur' }
				],
				repassword: [
					{ required: true, message: '请重复密码', trigger: 'blur' }
				]
			},
			addForm:{},
			addLoading:false,
			//新增
		}
	},
	methods:{
		getTableList(){
			this.listLoading = true;
			let option = {				
				pageNum:this.pageNum,
				pageSize:this.pageSize
			}
			ajax.adminList(option).then(res => {
				this.listLoading = false;
				this.adminList = res.data.rows;
				this.total = res.data.total;
				// console.log(res)
			})
		},
		handleCurrentChange(val){
			this.pageNum = val;
			this.getTableList();
		},
		handleAdd(){
			this.addFormVisible = true;
		},
		addSubmit(){
			this.$refs.addForm.validate((valid) => {
				if (valid) {
					if(this.addForm.password == this.addForm.repassword){
						this.addLoading = true;
						let option = Object.assign({}, this.addForm);
						ajax.adminAdd(option).then(res => {
							if(res.restCode == 200){
								this.addLoading = false;
								this.$message({
									message: '添加成功',
									type: 'success'
								});
								this.$refs['addForm'].resetFields();
								this.addFormVisible = false;
								this.getTableList();
							}else{
								this.$message.error(res.msg+' 错误代码：'+res.restCode);
								this.addLoading = false;
							}
						}).catch(res =>{
							this.$message.error('添加失败了呢');
						})
					}else{
						this.$message.error('两次输入的密码不一致');
					}
				}
			});
		},
		handleClose(){
			this.addForm = {}
		},
		handleDelete(index,row){
			this.$confirm('确认删除该记录吗?', '提示', {
				type: 'warning'
			}).then(() => {
				this.listLoading = true;
				let option = {oid:row.oid}
				ajax.adminDelete(option).then(res => {
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
		}
	},
	created(){
		this.getTableList();
	}
}
</script>