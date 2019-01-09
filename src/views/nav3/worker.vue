<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar">			
			<el-button type="primary" @click="handleAdd">新增</el-button>					
		</el-col>
		<!--工具条-->
		<!--列表-->
		<el-table :data="workers" highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;">
			<el-table-column type="selection" width="55">
			</el-table-column>
			<el-table-column type="index" width="60">
			</el-table-column>
			<el-table-column prop="imgUrl" label="头像" width="140">
				<template slot-scope="scope">
					<img  :src="scope.row.imgUrl" alt="" style="width: 50px;height: 50px;vertical-align: middle;border-radius:50%;">
				</template>
			</el-table-column>
			<el-table-column prop="name" label="姓名" width="120">
			</el-table-column>
			<el-table-column prop="gender" label="性别" width="100" :formatter="formatSex" sortable>
			</el-table-column>
			<el-table-column prop="rank" label="职位" width="180">
			</el-table-column>
			<el-table-column prop="field" label="擅长领域" width="180">
			</el-table-column>
			<el-table-column prop="telephone" label="电话" width="180">
			</el-table-column>
			<el-table-column prop="wechat" label="微信号" min-width="180">
			</el-table-column>
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
				<el-form-item label="头像" prop="">
					<el-upload class="avatar-uploader" :action="uploadUrl()" :on-success="handleSuccess" :show-file-list="false">
						<img v-if="imageUrl" :src="imageUrl" class="avatar">
  						<i v-else class="el-icon-plus avatar-uploader-icon"></i>
					</el-upload>
				</el-form-item>
				<el-form-item label="姓名" prop="name">
					<el-input v-model="editForm.name" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="手机号码" prop="telephone">
					<el-input v-model="editForm.telephone" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="性别">
					<el-radio-group v-model="editForm.gender">
						<el-radio class="radio" :label="1">男</el-radio>
						<el-radio class="radio" :label="2">女</el-radio>
					</el-radio-group>
				</el-form-item>
				<el-form-item label="职位">
					<el-input v-model="editForm.rank" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="擅长领域">
					<el-input type="textarea" v-model="editForm.field"></el-input>
				</el-form-item>
				<el-form-item label="微信号" prop="wechat">
					<el-input v-model="editForm.wechat" auto-complete="off"></el-input>
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
				<el-form-item label="头像" prop="">
					<el-upload class="avatar-uploader" :action="uploadUrl()" :on-success="handleSuccess" :show-file-list="false">
						<img v-if="imageUrl" :src="imageUrl" class="avatar">
  						<i v-else class="el-icon-plus avatar-uploader-icon"></i>
					</el-upload>
				</el-form-item>
				<el-form-item label="姓名" prop="name">
					<el-input v-model="addForm.name" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="手机号码" prop="telephone">
					<el-input v-model="addForm.telephone" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="性别">
					<el-radio-group v-model="addForm.gender">
						<el-radio class="radio" :label="1">男</el-radio>
						<el-radio class="radio" :label="2">女</el-radio>
					</el-radio-group>
				</el-form-item>
				<el-form-item label="职位">
					<el-input v-model="addForm.rank" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="擅长领域">
					<el-input type="textarea" v-model="addForm.field"></el-input>
				</el-form-item>
				<el-form-item label="微信号" prop="wechat">
					<el-input v-model="addForm.wechat" auto-complete="off"></el-input>
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
// import option from '@/api/option'
export default{
	data(){
		return{
			workers:[],
			total: 0,
			pageNum: 1,
			pageSize:10,
			sels: [],//列表选中列
			listLoading: false,
			editLoading: false,
			editFormVisible: false,
			editFormRules: {
				name: [
					{ required: true, message: '请输入姓名', trigger: 'blur' }
				]
			},
			editForm:{},
			imageUrl:'',
			addFormVisible: false,//新增界面是否显示
			addLoading: false,
			addFormRules: {
				name: [
					{ required: true, message: '请输入姓名', trigger: 'blur' }
				]
			},
			//新增界面数据
			addForm: {}
		}
	},
	methods:{
		openNotice:function(){
			this.$notify({
	          	title: '提示',
	          	message: '点击头像上传新头像'
	        });
		},
		//性别显示转换
		formatSex: function (row, column) {
			return row.gender == 1 ? '男' : row.gender == 2 ? '女' : '未知';
		},
		selsChange: function (sels) {
			this.sels = sels;
		},
		//获取表格数据
		getTableList: function() {
			const This = this;
			This.listLoading = true;
			let option = {
				data:{
					pageNum:This.pageNum,
					pageSize:This.pageSize
				},
				userOid:this.$store.state.userOid,
				token:this.$store.state.token
			}
			ajax.workersList(option).then(data => {
				This.workers = data.data.rows;
				This.total = data.data.total;
				This.listLoading = false;
			})
		},
		//显示编辑界面
		handleEdit: function (index, row) {
			this.editFormVisible = true;
			this.editForm = Object.assign({}, row);
			this.imageUrl = this.editForm.imgUrl;
			this.openNotice()
		},
		uploadUrl: function() {
			return ajax.imgUpload();
		},
		//头像上传
	    handleSuccess(data) {
	    	if(this.editFormVisible){
	        	this.editForm.imgUrl = data.data.url;
	    	}else{
	    		this.addForm.imgUrl = data.data.url;
	    	}
	        this.imageUrl = data.data.url;
	    },
		//编辑提交
		editSubmit: function(){
			this.$refs.editForm.validate( valid => {
				if(valid){
					this.editLoading = true;
					// console.log(this.editForm)
					let option = {
						data:this.editForm,
						userOid:this.$store.state.userOid,
						token:this.$store.state.token
					}
					ajax.workersUpdate(option).then(data => {
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
				ajax.workersDelete(option).then(res => {
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
		//批量删除
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
		//显示新增界面
		handleAdd: function () {
			this.addFormVisible = true;
			this.imageUrl = '';
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
						ajax.workersAdd(option).then(res => {
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
		handleCurrentChange(val) {
			this.pageNum = val;
			this.getTableList();
		},
	},
	created(){
		this.getTableList();
	},
	mounted(){
				
	}
}
</script>
<style scoped>
	.avatar-uploader {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    width: 128px;
    height: 128px;
  }
  .avatar-uploader:hover {
    border-color: #409EFF;
  }
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 128px;
    height: 128px;
    line-height: 128px;
    text-align: center;
  }
  .avatar {
    width: 128px;
    height: 128px;
    display: block;
  }
</style>