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
		<el-table :data="dataSource" highlight-current-row v-loading="listLoading" style="width: 100%;" border>
			<el-table-column prop="title" label="标题"></el-table-column>
			<el-table-column prop="type" label="类型优势" :formatter="formatType"></el-table-column>
			<el-table-column prop="imgUrl" label="背景图片">
				<template slot-scope="scope">
					<img  :src="scope.row.imgUrl" alt="" style="width: 150px;height: 50px;vertical-align: middle;padding:10px 0;">
				</template>
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
			<el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="10" :total="total" style="float:right;">
			</el-pagination>
		</el-col>
		<!--分页-->
		<!--新增界面-->
		<el-dialog title="新增" v-model="addFormVisible" :close-on-click-modal="true">
			<el-form :model="addForm" label-width="100px" :rules="addFormRules" ref="addForm">
				<el-form-item label="标题" prop="title">
					<el-input v-model="addForm.title" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="图片位置" prop="type">
					<el-radio-group v-model="addForm.type">
						<el-radio class="radio" :label="1">产品</el-radio>
						<el-radio class="radio" :label="2">公司</el-radio>
					</el-radio-group>
				</el-form-item>
				<transition name="el-zoom-in-top">
					<el-form-item label="描述" prop="description" v-show="addForm.type != 2" class="transition-box">
						<el-input v-model="addForm.description" auto-complete="off"></el-input>
					</el-form-item>
				</transition>
				<transition name="el-zoom-in-top">
					<el-form-item label="选择内页" prop="optionValue" v-show="addForm.type != 2" class="transition-box">
						<el-select v-model="addForm.optionValue" value-key="id" placeholder="请选择">
						    <el-option v-for="item in bannerList" :key="item.id" :label="item.bannerName" :value="item"></el-option>
						</el-select>
					</el-form-item>
				</transition>
				<el-form-item label="内容" prop="content">
					<el-input v-model="addForm.content" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="背景图片" prop="imgUrl">
					<el-upload class="avatar-uploader" :action="uploadUrl()" :on-success="handleSuccess" :show-file-list="false">
						<img v-if="addForm.imgUrl" :src="addForm.imgUrl" class="avatar">
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
		<el-dialog title="新增" v-model="editFormVisible" :close-on-click-modal="true">
			<el-form :model="editForm" label-width="100px" :rules="editFormRules" ref="editForm">
				<el-form-item label="标题" prop="title">
					<el-input v-model="editForm.title" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="图片位置" prop="type">
					<el-radio-group v-model="editForm.type">
						<el-radio class="radio" :label="1">产品</el-radio>
						<el-radio class="radio" :label="2">公司</el-radio>
					</el-radio-group>
				</el-form-item>
				<transition name="el-zoom-in-top">
					<el-form-item label="描述" prop="description" v-show="editForm.type != 2" class="transition-box">
						<el-input v-model="editForm.description" auto-complete="off"></el-input>
					</el-form-item>
				</transition>
				<transition name="el-zoom-in-top">
					<el-form-item label="选择内页" prop="bannerOid" v-show="editForm.type != 2" class="transition-box">
						<el-select v-model="editForm.bannerOid" value-key="id" placeholder="请选择">
						    <el-option v-for="item in bannerList" :key="item.id" :label="item.bannerName" :value="item.oid"></el-option>
						</el-select>
					</el-form-item>
				</transition>
				<el-form-item label="内容" prop="content">
					<el-input v-model="editForm.content" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="背景图片" prop="imgUrl">
					<el-upload class="avatar-uploader" :action="uploadUrl()" :on-success="handleSuccess" :show-file-list="false">
						<img v-if="editForm.imgUrl" :src="editForm.imgUrl" class="avatar">
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
			bannerList:[],
			//新增
			addFormVisible:false,
			addLoading:false,
			addForm:{
				imgUrl:''
			},
			addFormRules:{
		    	title: [
					{ required: true, message: '请输入标题', trigger: 'blur' }
				]
		    },
			//编辑
			editFormVisible:false,
			editLoading:false,
			editForm:{
				imgUrl:''
			},
			editFormRules:{
		    	title: [
					{ required: true, message: '请输入标题', trigger: 'blur' }
				]
		    },
		}
	},
	methods:{
		//测试用
		// transFormDataSource(arr){
		// 	for(var i = 0;i<arr.length;i++){
		// 		arr[i].imgUrl = 'api'+arr[i].imgUrl;
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
			ajax.advantageList(option).then(res => {
				this.dataSource = res.data.rows;//测试完成后去掉注释
				// this.dataSource = this.transFormDataSource(res.data.rows);//测试完成后删除
				this.total = res.data.total;
				this.listLoading = false;
			})
		},
		getBannerList(){
			return new Promise ((resolve,reject) => {
				ajax.bannerList().then(res => {
					resolve(res)
				}).catch(err => {
					reject(err)
				})
			})
		},
		formatType(row,column) {
			return row.type == 1 ? '产品' : row.type == 2 ? '公司' : '未知';
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
		handleSuccess(res){
			if(this.editFormVisible){
	        	this.editForm.imgUrl = res.data.url;
	    	}else{
	    		this.addForm.imgUrl = res.data.url;
	    	}
		},
		//新增
		handleAdd(){
			this.getBannerList().then(res => {
				this.addFormVisible = true;
				this.bannerList = res.data.rows;
			}).catch(err => {
				this.$message.error('获取banner列表失败了呢!');
			})
		},
		addSubmit(){
			this.$refs.addForm.validate((valid) => {
				if (valid) {
					this.$confirm('确认提交吗？', '提示', {}).then(() => {
						this.addLoading = true;
						let option = {
							bannerOid:this.addForm.type == 1 ? this.addForm.optionValue.oid : '',
							title:this.addForm.title,
							description:this.addForm.type == 1 ? this.addForm.description : '',
							type:this.addForm.type,
							content:this.addForm.content,
							imgUrl:this.addForm.imgUrl
						}
						ajax.advantageAdd(option).then(res => {
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
		handleEdit(index,row){
			this.getBannerList().then(res => {
				this.bannerList = res.data.rows;
				this.editFormVisible = true;
				this.editForm = Object.assign({}, row);
			}).catch(err => {
				this.$message.error('获取banner列表失败了呢!');
			})
		},
		editSubmit(){
			this.$refs.editForm.validate( valid => {
				if(valid){
					this.editLoading = true;
					let row = Object.assign({}, this.editForm);
					let option = {
						oid:row.oid,
						bannerOid:row.type == 1 ? row.bannerOid : '',
						title:row.title,
						description:row.type == 1 ? row.description : '',
						type:row.type,
						content:row.content,
						imgUrl:row.imgUrl
					}
					ajax.advantageUpdate(option).then(data => {
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
				ajax.advantageDelete(option).then(res => {
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