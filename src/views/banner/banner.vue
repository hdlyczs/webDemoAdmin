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
			<el-table-column prop="bannerName" label="图片名称"></el-table-column>
			<el-table-column prop="bannerType" label="图片位置" :formatter="formatType"></el-table-column>
			<el-table-column prop="bigImgUrl" label="PC端大图">
				<template slot-scope="scope">
					<img  :src="scope.row.bigImgUrl" alt="" style="width: 150px;height: 50px;vertical-align: middle;padding:10px 0;">
				</template>
			</el-table-column>
			<el-table-column prop="bigMessage" label="标题"></el-table-column>
			<el-table-column prop="smallMessage" label="描述"></el-table-column>
			<el-table-column prop="smallImgUrl" label="移动端小图">
				<template slot-scope="scope">
					<img  :src="scope.row.smallImgUrl" alt="" style="width: 150px;height: 50px;vertical-align: middle;padding:10px 0;">
				</template>
			</el-table-column>
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
			<el-form :model="addForm" label-width="100px" :rules="addFormRules" ref="addForm">
				<el-form-item label="图片名称" prop="bannerName">
					<el-input v-model="addForm.bannerName" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="图片位置" prop="bannerType">
					<el-radio-group v-model="addForm.bannerType">
						<el-radio class="radio" :label="1">首页</el-radio>
						<el-radio class="radio" :label="2">内页</el-radio>
					</el-radio-group>
				</el-form-item>
				<el-form-item label="标题">
					<el-input v-model="addForm.bigMessage" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="描述">
					<el-input v-model="addForm.smallMessage" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="PC端大图" class="inline">
					<el-upload class="avatar-uploader" :action="uploadUrl()" :on-success="bigHandleSuccess" :show-file-list="false">
						<img v-if="imageUrl.bigImgUrl" :src="imageUrl.bigImgUrl" class="avatar">
  						<i v-else class="el-icon-plus avatar-uploader-icon"></i>
					</el-upload>
				</el-form-item>
				<el-form-item label="移动端小图" class="inline">
					<el-upload class="avatar-uploader" :action="uploadUrl()" :on-success="smallHandleSuccess" :show-file-list="false">
						<img v-if="imageUrl.smallImgUrl" :src="imageUrl.smallImgUrl" class="avatar">
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
			<el-form :model="editForm" label-width="100px" :rules="editFormRules" ref="editForm">
				<el-form-item label="图片名称" prop="bannerName">
					<el-input v-model="editForm.bannerName" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="图片位置" prop="bannerType">
					<el-radio-group v-model="editForm.bannerType">
						<el-radio class="radio" :label="1">首页</el-radio>
						<el-radio class="radio" :label="2">内页</el-radio>
					</el-radio-group>
				</el-form-item>
				<el-form-item label="标题">
					<el-input v-model="editForm.bigMessage" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="描述">
					<el-input v-model="editForm.smallMessage" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="PC端大图" class="inline">
					<el-upload class="avatar-uploader" :action="uploadUrl()" :on-success="bigHandleSuccess" :show-file-list="false">
						<img v-if="imageUrl.bigImgUrl" :src="imageUrl.bigImgUrl" class="avatar">
  						<i v-else class="el-icon-plus avatar-uploader-icon"></i>
					</el-upload>
				</el-form-item>
				<el-form-item label="移动端小图" class="inline">
					<el-upload class="avatar-uploader" :action="uploadUrl()" :on-success="smallHandleSuccess" :show-file-list="false">
						<img v-if="imageUrl.smallImgUrl" :src="imageUrl.smallImgUrl" class="avatar">
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
				bigImgUrl:'',
				smallImgUrl:''
			},
			//新增
			addFormVisible:false,
			addLoading:false,
			addForm:{},
			addFormRules:{
		    	bannerType: [
					{ type:'number', required: true, message: '请选择图片位置', trigger: 'change' }
				]
		    },
			//编辑
			editFormVisible:false,
			editLoading:false,
			editForm:{},
			editFormRules:{
		    	bannerType: [
					{ type:'number', required: true, message: '请选择图片位置', trigger: 'change' }
				]
		    },
		}
	},
	methods:{
		//测试用
		// transFormDataSource(arr){
		// 	for(var i = 0;i<arr.length;i++){
		// 		arr[i].bigImgUrl = 'api'+arr[i].bigImgUrl;
		// 		arr[i].smallImgUrl = 'api'+arr[i].smallImgUrl
		// 	}
		// 	return arr;
		// },
		//测完删除
		getTableList(){
			this.listLoading = true;
			let option = {
				pageNum:this.pageNum,
				pageSize:this.pageSize
			}
			ajax.bannerList(option).then(res => {
				this.dataSource = res.data.rows;//测试完成后去掉注释
				// this.dataSource = this.transFormDataSource(res.data.rows);//测试完成后删除
				this.total = res.data.total;
				this.listLoading = false;
			})
		},
		formatType: function (row,column) {
			return row.bannerType == 1 ? '首页' : row.bannerType == 2 ? '内页' : '未知';
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
		bigHandleSuccess(data) {
	    	if(this.editFormVisible){
	        	this.editForm.bigImgUrl = data.data.url;
	    	}else{
	    		this.addForm.bigImgUrl = data.data.url;
	    	}
	        this.imageUrl.bigImgUrl = data.data.url; //测试完成后去除‘’中的内容
	    },
	    smallHandleSuccess(data) {
	    	if(this.editFormVisible){
	        	this.editForm.smallImgUrl = data.data.url;
	    	}else{
	    		this.addForm.smallImgUrl = data.data.url;
	    	}
	        this.imageUrl.smallImgUrl = data.data.url; //测试完成后去除‘’中的内容
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
						ajax.bannerAdd(row).then(res => {
							this.addLoading = false;
							this.$message({
								message: '添加成功',
								type: 'success'
							});
							this.$refs['addForm'].resetFields();
							this.imageUrl.bigImgUrl = '';
							this.imageUrl.smallImgUrl = '';
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
			this.imageUrl.bigImgUrl = this.editForm.bigImgUrl; //测试完成后去除‘’中的内容
			this.imageUrl.smallImgUrl = +this.editForm.smallImgUrl; //测试完成后去除‘’中的内容
		},
		//编辑提交
		editSubmit: function(){
			this.$refs.editForm.validate( valid => {
				if(valid){
					this.editLoading = true;
					let row = Object.assign({}, this.editForm);
					delete row.createBy;delete row.createTime;delete row.delFlag;delete row.updateBy;delete row.updateTime;
					ajax.bannerUpdate(row).then(data => {
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
			this.imageUrl.bigImgUrl = '';
			this.imageUrl.smallImgUrl = '';
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
				ajax.bannerDelete(option).then(res => {
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
<style scoped>
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