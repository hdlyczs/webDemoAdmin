<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true">
				<el-form-item>
					<el-button type="primary" @click="handleAdd">新增</el-button>
				</el-form-item>
			</el-form>
		</el-col>
		<!--工具条-->
		<!--列表-->
		<el-table :data="dataSource" highlight-current-row v-loading="listLoading" style="width: 100%;">
			<el-table-column prop="imgUrl" label="图片">
				<template slot-scope="scope">
					<img  :src="scope.row.imgUrl" alt="" style="width: 240px;height: 70px;vertical-align: middle;padding:10px 0;">
				</template>
			</el-table-column>
			<el-table-column prop="bigMessage" label="标题"></el-table-column>
			<el-table-column prop="smallMessage" label="描述"></el-table-column>
			<el-table-column label="操作">
				<template slot-scope="scope">
					<el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
					<el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>
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
		<!--新增界面-->
		<el-dialog title="新增" v-model="addFormVisible" :close-on-click-modal="true">
			<el-form :model="addForm" label-width="100px" ref="addForm">
				<el-form-item label="标题">
					<el-input v-model="addForm.bigMessage" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="描述">
					<el-input v-model="addForm.smallMessage" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="图片" class="inline">
					<el-upload class="avatar-uploader" :action="uploadUrl()" :on-success="HandleSuccess" :show-file-list="false">
						<img v-if="imageUrl.imgUrl" :src="imageUrl.imgUrl" class="avatar">
  						<i v-else class="el-icon-plus avatar-uploader-icon"></i>
					</el-upload>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="addFormVisible = false">取消</el-button>
				<el-button type="primary" @click.native="addSubmit" :loading="addLoading">提交</el-button>
			</div>
		</el-dialog>
		<!--新增界面-->
		<!--编辑界面-->
		<el-dialog title="编辑" v-model="editFormVisible" :close-on-click-modal="true" @close="handleClose">
			<el-form :model="editForm" label-width="100px" ref="editForm">
				<el-form-item label="标题">
					<el-input v-model="editForm.bigMessage" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="描述">
					<el-input v-model="editForm.smallMessage" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="图片" class="inline">
					<el-upload class="avatar-uploader" :action="uploadUrl()" :on-success="HandleSuccess" :show-file-list="false">
						<img v-if="imageUrl.imgUrl" :src="imageUrl.imgUrl" class="avatar">
  						<i v-else class="el-icon-plus avatar-uploader-icon"></i>
					</el-upload>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="editFormVisible = false">取消</el-button>
				<el-button type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button>
			</div>
		</el-dialog>
		<!--编辑界面-->
	</section>
</template>
<script>
import ajax from '@/api/request'
export default {
	data(){
		return {
			dataSource:[],
			listLoading:false,
			//表格分页
			pageNum: 1,
			pageSize:10,
			total:0,
			//数据存储
			imageUrl:{
				imgUrl:'',
			},
			//新增
			addFormVisible:false,
			addLoading:false,
			addForm:{},
			//编辑
			editFormVisible:false,
			editLoading:false,
			editForm:{},
		}
	},
	methods:{
		getTableList(){
			this.listLoading = true;
			let option = {
				pageNum:this.pageNum,
				pageSize:this.pageSize
			}
			ajax.adList(option).then(res => {
				this.dataSource = res.data.rows;//测试完成后去掉注释
				// this.dataSource = this.transFormDataSource(res.data.rows);//测试完成后删除
				this.total = res.data.total;
				this.listLoading = false;
			})
		},
		//分页
		handleCurrentChange(val) {
			this.pageNum = val;
			this.getTableList();
		},
		//图片上传
		uploadUrl(){
			return ajax.imgUpload();
		},
		HandleSuccess(data) {
	    	if(this.editFormVisible){
	        	this.editForm.imgUrl = data.data.url;
	    	}else{
	    		this.addForm.imgUrl = data.data.url;
	    	}
	        this.imageUrl.imgUrl = data.data.url; //测试完成后去除‘’中的内容
	    },
		//新增
		handleAdd(){
			this.addFormVisible = true;
		},
		//新增提交
		addSubmit() {
			this.$refs.addForm.validate((valid) => {
				if (valid) {
					this.$confirm('确认提交吗？', '提示', {}).then(() => {
						this.addLoading = true;
						let row = Object.assign({}, this.addForm);
						ajax.adAdd(row).then(res => {
							this.addLoading = false;
							this.$message({
								message: '添加成功',
								type: 'success'
							});
							this.$refs['addForm'].resetFields();
							this.imageUrl.imgUrl = '';
							this.addFormVisible = false;
							this.getTableList();
						}).catch(res =>{
							this.$message.error('添加失败了呢');
						})
					})
				}
			});
		},
		//编辑
		handleEdit: function (index, row) {
			this.editFormVisible = true;
			this.editForm = Object.assign({}, row);
			this.imageUrl.imgUrl = this.editForm.imgUrl; //测试完成后去除‘’中的内容
		},
		//编辑提交
		editSubmit: function(){
			this.$refs.editForm.validate( valid => {
				if(valid){
					this.editLoading = true;
					let row = Object.assign({}, this.editForm);
					delete row.createBy;delete row.createTime;delete row.delFlag;delete row.updateBy;delete row.updateTime;
					ajax.adUpdate(row).then(data => {
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
		handleClose(){
			this.imageUrl.imgUrl = '';
		},
		//删除
		handleDel(index,row){
			this.$confirm('此操作将永久删除该记录, 是否继续?', '提示', {  
				confirmButtonText: '确定',  
				cancelButtonText: '取消',  
				type: 'error'  
			}).then(() => {
				this.listLoading = true;
				let option = {
					oid:row.oid
				}
				ajax.adDelete(option).then(res => {
					this.listLoading = false;
					this.$message({
						message: '删除成功',
						type: 'success'
					});
					this.getTableList();
				}).catch(res =>{
					this.$message.error('删除失败了呢');
				}) 
				this.$message({  
					type: 'success',  
					message: '删除成功!'  
				})  
			}).catch(() => {  
				this.$message({  
					type: 'info',  
					message: '已取消删除'  
				})  
			})
		}
	},
	created(){
		this.getTableList();
	}
}
</script>
<style>
  .avatar-uploader {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    width: 384px;
    height: 128px;
  }
  .avatar-uploader:hover {
    border-color: #409EFF;
  }
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 384px;
    height: 128px;
    line-height: 128px;
    text-align: center;
  }
  .avatar {
    width: 384px;
    height: 128px;
    display: block;
  }
  .inline{
	/*display:inline-block*/
  }
</style>