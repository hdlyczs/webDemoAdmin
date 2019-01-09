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
		<el-table :data="dataSource" highlight-current-row v-loading="listLoading" style="width: 100%" border>
			<el-table-column type="index" width="60"></el-table-column>
			<el-table-column prop="title" label="标题"></el-table-column>
			<el-table-column prop="menuEntity.name" label="所属类别"></el-table-column>
			<el-table-column prop="isHot" label="是否热门" :formatter="formatHot" min-width="50"></el-table-column>
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
			<el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="20" :total="total" style="float:right;">
			</el-pagination>
		</el-col>
		<!--分页-->
		<!--新增界面-->
		<el-dialog title="新增" v-model="addFormVisible" :close-on-click-modal="true" @close="addHandleClose">
			<el-form :model="addForm" label-width="100px" :rules="addFormRules" ref="addForm">
				<el-form-item label="所属菜单" prop="optionValue">
					<el-select v-model="addForm.optionValue" value-key="oid" placeholder="请选择">
					    <el-option v-for="item in newsMenuList" :key="item.oid" :label="item.name" :value="item"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="文章标题" prop="title">
					<el-input v-model="addForm.title" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="是否热门" prop="hotValue">
					<el-switch
						v-model="addForm.hotValue"
						on-text=""
						off-text=""
						>
					</el-switch>
				</el-form-item>
				<el-form-item label="创建时间" prop="dateTime">
					<el-date-picker
				    	v-model="addForm.dateTime"
				    	type="date"
				    	format="yyyy-MM-dd"
				    	@change="formatTime"
				    	placeholder="选择日期">
				    </el-date-picker>
				</el-form-item>
				<el-form-item label="内容" prop="content">
					<div class="ql-container ql-snow">
					<quill-editor v-model="addForm.content"
					    ref="myQuillEditor"
					    :options="editorOption"
					    @blur="onEditorBlur($event)"
					    @focus="onEditorFocus($event)"
					    @ready="onEditorReady($event)">
					</quill-editor>
					</div>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="addFormVisible = false">取消</el-button>
				<el-button type="primary" @click.native="addSubmit" :loading="addLoading">提交</el-button>
			</div>
		</el-dialog>
		<!--新增界面-->
		<!--编辑界面-->
		<el-dialog title="编辑" v-model="editFormVisible" :close-on-click-modal="true" @close="editHandleClose">
			<el-form :model="editForm" label-width="100px" :rules="editFormRules" ref="editForm">
				<el-form-item label="所属菜单" prop="optionValue">
					<el-select v-model="editForm.optionValue" value-key="oid" placeholder="请选择">
					    <el-option v-for="item in newsMenuList" :key="item.oid" :label="item.name" :value="item"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="文章标题" prop="title">
					<el-input v-model="editForm.title" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="是否热门" prop="hotValue">
					<el-switch
						v-model="editForm.hotValue"
						on-text=""
						off-text=""
						>
					</el-switch>
				</el-form-item>
				<el-form-item label="创建时间" prop="dateTime">
					<el-date-picker
				    	v-model="editForm.dateTime"
				    	type="date"
				    	format="yyyy-MM-dd"
				    	@change="formatTime"
				    	placeholder="选择日期">
				    </el-date-picker>
				</el-form-item>
				<el-form-item label="内容" prop="content">
					<div class="ql-container ql-snow">
					<quill-editor v-model="editForm.content"
					    ref="myQuillEditor"
					    :options="editorOption"
					    @blur="onEditorBlur($event)"
					    @focus="onEditorFocus($event)"
					    @ready="onEditorReady($event)">
					</quill-editor>
					</div>
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
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
import { quillEditor,Quill } from 'vue-quill-editor'
import {container, ImageExtend, QuillWatch} from 'quill-image-extend-module'
Quill.register('modules/ImageExtend', ImageExtend)
export default {
	components: {
    	quillEditor
  	},
	data(){
		return {
			dataSource:[],
			//新闻菜单列表
			newsMenuList:[],
			listLoading:false,
			//表格分页
			pageNum: 1,
			pageSize:20,
			total:0,
			//数据存储
			imageUrl:{
				bigImgUrl:'',
				smallImgUrl:''
			},
			//新增
			addFormVisible:false,
			addLoading:false,
			addForm:{
				//选择是否热门
				hotValue:false,
				//select框
				optionValue:'',
				//创建时间
				dateTime:'',
			},
			addFormRules:{
		    	title: [
					{ required: true, message: '请输入文章标题', trigger: 'blur' }
				],
				optionValue: [
					{ type:'object', required: true, message: '请选择所属菜单', trigger: 'change' }
				]
		    },
			//编辑
			editFormVisible:false,
			editLoading:false,
			editForm:{
				//选择是否热门
				hotValue:false,
				//select框
				optionValue:'',
				//创建时间
				dateTime:'',
			},
			editFormRules:{
		    	title: [
					{ required: true, message: '请输入文章标题', trigger: 'blur' }
				],
				optionValue: [
					{ type:'object', required: true, message: '请选择所属菜单', trigger: 'change' }
				]
		    },
		    //富文本
		    // content: '',
	        editorOption: {
	        	placeholder: '请输入文本...',
	        	modules: {
	        		ImageExtend: {
	        			loading: true,
	        			name: 'file',
	        			action: ajax.imgUpload(),
	        			response: (res) => {
	        				return res.data.url
	        			}
	        		},
	        		toolbar: {
	        			container:container,
	        			handlers: {
	        				'image' : function(){
	        					QuillWatch.emit(this.quill.id);
	        				}
	        			}
	        		}
	        	}
	        }
		}
	},
	methods:{
		//富文本
		onEditorReady(editor) { // 准备编辑器
 
        },
        onEditorBlur(){}, // 失去焦点事件
        onEditorFocus(){}, // 获得焦点事件
        //富文本
        getMenuList(){
        	this.listLoading = true;
        	ajax.menuNews().then(res => {
        		this.newsMenuList = res.data;
        		this.listLoading = false;
        	})
        },
        //做select回显
        getMenuName(id){
        	let option = {
        		oid:id
        	}
        	return new Promise ((resolve,reject) => {
				ajax.menuDetails(option).then(res => {
					resolve(res)
				}).catch(err => {
					reject(err)
				})
			})
        },
        //做编辑
        getNewsDetails(id){
        	return new Promise ((resolve,reject) => {
        		let option = {
        			oid:id
        		}
        		ajax.newsDetails(option).then(res => {
        			resolve(res)
        		}).catch(err => {
        			reject(err)
        		})
        	})
        },
		getTableList(){
			this.listLoading = true;
			let option = {
				pageNum:this.pageNum,
				pageSize:this.pageSize
			}
			ajax.newsList(option).then(res => {
				this.dataSource = res.data.rows;
				// console.log(this.dataSource)
				this.total = res.data.total;
				this.listLoading = false;
			})
		},
		formatHot(row,column) {
			return row.isHot == 1 ? '是' : '否';
		},
		formatTime(val){
			if(this.addFormVisible){
				this.addForm.dateTime = val;
			}else{
				this.editForm.dateTime = val;
			}
		},
		formatIsHot(val){
			if(val){
				return 1
			}else{
				return 2
			}
		},
		//分页
		handleCurrentChange(val) {
			this.pageNum = val;
			this.getTableList();
		},
		clearAddForm(){
			this.addForm.dateTime;
			this.addForm.content;
		},
		handleAdd(){
			this.addFormVisible = true;
		},
		//新增提交
		addSubmit() {
			this.$refs.addForm.validate((valid) => {
				if (valid) {
					this.$confirm('确认提交吗？', '提示', {}).then(() => {
						this.addLoading = true;
						// let row = Object.assign({}, this.addForm);
						let option = {
							menuOid:this.addForm.optionValue.oid,
							title:this.addForm.title,
							isHot:this.formatIsHot(this.addForm.hotValue),
							publishDate:this.addForm.dateTime,
							content:this.addForm.content,
							type:2
						}
						ajax.newsAdd(option).then(res => {
							this.addLoading = false;
							this.$message({
								message: '添加成功',
								type: 'success'
							});
							this.$refs['addForm'].resetFields();
							this.clearAddForm();
							this.addFormVisible = false;
							this.getTableList();
						}).catch(res =>{
							this.$message.error('添加失败了呢');
						})
					})
				}
			});
		},
		addHandleClose(){
			this.$refs['addForm'].resetFields();
		},
		handleEdit(index,row){
			this.getNewsDetails(row.oid).then(res => {
				this.editFormVisible = true;
				this.editForm = Object.assign(this.editForm, res.data);
				this.editForm.hotValue = this.editForm.isHot == 1? true : false;//0107 发送ajax的时候用 formatIsHot(this.editForm.hotValue)转换值
				//日期选择器回显
				let arr = this.editForm.publishDate.split(' ');
				this.editForm.dateTime = arr[0];
				//日期选择器回显
				this.getMenuName(row.menuOid).then(res => {
					this.editForm.optionValue = res.data;
				}).catch(err => {
					this.$message.error('获取菜单信息失败了呢!');
				})
			}).catch(err => {
				this.$message.error('获取菜单信息失败了呢!');
			})
		},
		editSubmit(){
			this.$refs.editForm.validate( valid => {
				if(valid){
					this.editLoading = true;
					let row = Object.assign({}, this.editForm);
					let option = {
						oid:row.oid,
						menuOid:row.optionValue.oid,
						title:row.title,
						isHot:this.formatIsHot(row.hotValue),
						publishDate:row.dateTime,
						content:row.content,
						type:2
					}
					ajax.newsUpdate(option).then(data => {
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
		editHandleClose(){
			this.$refs['editForm'].resetFields();
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
				ajax.newsDelete(option).then(res => {
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
		this.getTableList()
		this.getMenuList()
	},
	computed: {
		editor() {
		    return this.$refs.myQuillEditor.quill;
		}
    }
}
</script>
<style>
.ql-snow .ql-picker{height: auto !important;}
</style>