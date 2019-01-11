<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true">
				<el-form-item>
					<el-button type="primary" v-on:click.native="handleAdd">新增一级菜单</el-button>
				</el-form-item>
			</el-form>
		</el-col>
		<!--工具条-->
		<!--列表-->
		<el-table  :data="data"  border  style="width: 100%"  :row-style="showTr" v-loading="listLoading">  
			<el-table-column v-for="(column, index) in columns" :key="column.dataIndex"  :label="column.text">  
				<template slot-scope="scope">  
					<span v-if="spaceIconShow(index)" v-for="(space, levelIndex) in scope.row._level" class="ms-tree-space" :style="{marginLeft: scope.row._level * 23 + 'px'}"></span>  
					<span class="button is-outlined is-primary is-small" v-if="toggleIconShow(index,scope.row)" @click="toggle(scope.$index)">  
						<i v-if="!scope.row._expanded" class="iconfont icon-arrow-right" aria-hidden="true"></i>  
						<i v-if="scope.row._expanded" class="iconfont icon-fold-small" aria-hidden="true"></i>  
					</span>  
					<span v-else-if="index===0" class="ms-tree-space"></span>  
					{{scope.row[column.dataIndex]}}  
				</template>  
			</el-table-column>
			<!-- <el-table-column prop="type" label="页面模板" :formatter="formatModel">
			</el-table-column> -->  
			<el-table-column label="操作" v-if="treeType === 'normal'" width="300">  
				<template slot-scope="scope">  
					<el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
					<el-button size="small" type="danger" @click="handleDelete(scope.$index, scope.row)">删除</el-button>
					<el-button size="small" @click="handleAdd(scope.$index, scope.row)" v-show="scope.row._level == 0">添加二级菜单</el-button>  
					<el-button size="small" type="danger" @click="handleDetails(scope.$index, scope.row)" v-show="scope.row.viewType == 3">详情</el-button>  
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
		<!--编辑界面-->
		<el-dialog width="300" title="编辑" append-to-body :modal="false" v-model="editFormVisible" @close="editHandleClose">
			<el-form :model="editForm" label-width="120px" :rules="editFormRules" ref="editForm">
				<el-form-item label="菜单名称" prop="name">
					<el-input v-model="editForm.name" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="关联菜单" prop="" v-show="showSelect">
					<el-select v-model="optionValue" value-key="id" placeholder="请选择" disabled="disabled">
					    <el-option v-for="item in modelList" :key="item.id" :label="item.viewName+' 模板'" :value="item"></el-option>
					</el-select>
				</el-form-item>
				<!-- 二级菜单不展示 -->
				<el-form-item label="是否首页展示" prop="showPro" v-show="editForm._level == 0">
					<el-switch
						v-model="editForm.showPro"
						on-text=""
						off-text=""
						>
					</el-switch>
				</el-form-item>
				<!-- 二级菜单不展示 -->
				<!-- 二级产品详情首页展示 -->
				<div v-show = "editForm.parentDetailsShow == 1">
					<el-form-item label="关联内页" prop="bannerOid">
						<el-select v-model="editForm.bannerOid" value-key="id" placeholder="请选择" @change="change">
						    <el-option v-for="item in bannerList" :key="item.id" :label="item.bannerName" :value="item.oid"></el-option>
						</el-select>
					</el-form-item>
					<el-form-item label="第一张图片" prop="imgUrl">
						<el-upload class="avatar-uploader" :action="uploadUrl()" :on-success="firstHandleSuccess" :show-file-list="false">
							<img v-if="editForm.imgUrl" :src="editForm.imgUrl" class="avatar">
	  						<i v-else class="el-icon-plus avatar-uploader-icon"></i>
						</el-upload>
					</el-form-item>
					<el-form-item label="第二张图片" prop="blackImgUrl">
						<el-upload class="avatar-uploader" :action="uploadUrl()" :on-success="secondHandleSuccess" :show-file-list="false">
							<img v-if="editForm.blackImgUrl" :src="editForm.blackImgUrl" class="avatar">
	  						<i v-else class="el-icon-plus avatar-uploader-icon"></i>
						</el-upload>
					</el-form-item>
				</div>
				<!-- 二级新闻列表首页展示 -->
				<div v-show = "editForm.parentDetailsShow != 1 && editForm._level != 0">
					<el-form-item label="此列表是否首页展示" prop="showNews">
						<el-switch
							v-model="editForm.showNews"
							on-text=""
							off-text=""
							>
						</el-switch>
					</el-form-item>
				</div>
			</el-form>	
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="editFormVisible = false">取消</el-button>
				<el-button type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button>
			</div>			
     	</el-dialog>
     	<!--编辑界面-->
     	<!--新增界面-->
		<el-dialog width="300" title="新增" append-to-body :modal="false" v-model="addFormVisible" @close="addHandleClose">
			<el-form :model="addForm" label-width="120px" :rules="addFormRules" ref="addForm">
				<div v-if="addForm._level == 0">
					<el-form-item label="一级菜单名称" prop="firstName">
						<el-input v-model="addForm.firstName" auto-complete="off" disabled="disabled"></el-input>
					</el-form-item>
					<el-form-item label="二级菜单名称" prop="name">
						<el-input v-model="addForm.name" auto-complete="off"></el-input>
					</el-form-item>
					<el-form-item label="关联模板" prop="">
						<el-select v-model="optionValue" value-key="id" placeholder="请选择">
						    <el-option v-for="item in modelList" :key="item.id" :label="item.viewName+' 模板'" :value="item"></el-option>
						</el-select>
					</el-form-item>
					<div v-show = "addForm.detailsShow == 1">
						<el-form-item label="关联内页" prop="bannerOid">
							<el-select v-model="addForm.bannerOid" value-key="id" placeholder="请选择">
							    <el-option v-for="item in bannerList" :key="item.id" :label="item.bannerName" :value="item.oid"></el-option>
							</el-select>
						</el-form-item>
						<el-form-item label="第一张图片" prop="imgUrl">
							<el-upload class="avatar-uploader" :action="uploadUrl()" :on-success="firstHandleSuccess" :show-file-list="false">
								<img v-if="addForm.imgUrl" :src="addForm.imgUrl" class="avatar">
		  						<i v-else class="el-icon-plus avatar-uploader-icon"></i>
							</el-upload>
						</el-form-item>
						<el-form-item label="第二张图片" prop="blackImgUrl">
							<el-upload class="avatar-uploader" :action="uploadUrl()" :on-success="secondHandleSuccess" :show-file-list="false">
								<img v-if="addForm.blackImgUrl" :src="addForm.blackImgUrl" class="avatar">
		  						<i v-else class="el-icon-plus avatar-uploader-icon"></i>
							</el-upload>
						</el-form-item>
					</div>
					<div v-show = "addForm.detailsShow != 1 && this.optionValue.viewName == '列表页'">
						<el-form-item label="此列表是否首页展示" prop="showNews">
							<el-switch
								v-model="addForm.showNews"
								on-text=""
								off-text=""
								>
							</el-switch>
						</el-form-item>
					</div>
				</div>
				<div v-else>
					<el-form-item label="菜单名称" prop="name">
						<el-input v-model="addForm.name" auto-complete="off"></el-input>
					</el-form-item>
					<el-form-item label="关联菜单" prop="">
						<el-select v-model="optionValue" value-key="id" placeholder="请选择">
						    <el-option v-for="item in modelList" :key="item.id" :label="item.viewName+' 模板'" :value="item"></el-option>
						</el-select>
					</el-form-item>
					<el-form-item label="是否首页展示" prop="showPro">
						<el-switch
							v-model="addForm.showPro"
							on-text=""
							off-text=""
							>
						</el-switch>
					</el-form-item>
				</div>
			</el-form>	
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="addFormVisible = false">取消</el-button>
				<el-button type="primary" @click.native="addSubmit" :loading="addLoading">提交</el-button>
			</div>			
     	</el-dialog>
     	<!--新增界面-->
     	<!-- 详情界面 -->
     	<el-dialog title="详情" v-model="detailsFormVisible" :close-on-click-modal="true" @close="detailsClose">
			<el-form :model="detailsForm" label-width="100px" ref="detailsForm">
				<el-form-item label="菜单名称" prop="name">
					<el-input v-model="detailsForm.name" auto-complete="off" disabled="disabled"></el-input>
				</el-form-item>
				<el-form-item label="内容" prop="content">
					<div class="ql-container ql-snow">
					<quill-editor v-model="detailsForm.content"
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
				<el-button @click.native="detailsFormVisible = false">取消</el-button>
				<el-button type="primary" @click.native="detailsSubmit" :loading="detailsLoading">提交</el-button>
			</div>
		</el-dialog>
     	<!-- 详情界面 -->
	</section>
</template>
<script>
import ajax from '@/api/request'
import dataTransfer from '@/common/js/dataTranslate.js'
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
	props: {  
		treeType: {  
			type: String,  
			default: function () {  
				return 'normal'  
			}  
		},  
	// 是否默认展开所有树  
		defaultExpandAll: {  
			type: Boolean,  
			default: function () {  
				return false  
			}  
		},   
	},
	data(){
		return {
			columns:[
				{
	            	text: '菜单名称',
	            	dataIndex: 'name'
	          	}
			],
			dataSource:[],
			listLoading:false,
			//表格分页
			pageNum: 1,
			pageSize:10,
			total:0,
			//数据存储
			showSelect:true,
			optionValue:'',
			modelList:[],
			bannerList:[],
			//新增
			addFormVisible:false,
			addLoading:false,
			addForm:{
				imgUrl:'',
				blackImgUrl:''
			},
			addFormRules:{
		    	name: [
					{ required: true, message: '请输入菜单名称', trigger: 'blur' }
				]
		    },
			//编辑
			editFormVisible:false,
			editLoading:false,
			editForm:{
				showPro:'', //swicth做回显
				showNews:'',
				imgUrl:'',
				blackImgUrl:''
			},
			editFormRules:{
		    	name: [
					{ required: true, message: '请输入菜单名称', trigger: 'blur' }
				]
		    },
		    //详情
		    detailsFormVisible:false,
			detailsLoading:false,
			detailsForm:{},
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
	computed: {  
		// 格式化数据源  
		data: function () {  
			let me = this  
			let data = dataTransfer.treeToArray(me.dataSource, null, null, me.defaultExpandAll)   
			return data  			 		 
		}  
	},  
	methods:{
		// 显示行  
		showTr: function (row, index) {  
			let show = (row._parent ? (row._parent._expanded && row._parent._show) : true)  
			row._show = show  
			return show ? '' : 'display:none;'  
		},  
		// 展开下级  
		toggle: function (trIndex) {  
				let me = this  
				let record = me.data[trIndex]  
				record._expanded = !record._expanded  
		},  
		// 显示层级关系的空格和图标  
		spaceIconShow (index) {  
			let me = this  
			if (index === 0) {  
				return true  
			}  
			return false  
		},  
		// 点击展开和关闭的时候，图标的切换  
		toggleIconShow (index, record) {  
			let me = this  
			if (index === 0 && record.childMenu && record.childMenu.length > 0) {  
				return true  
			}  
			return false  
		},
		//富文本
		onEditorReady(editor) {},// 准备编辑器
        onEditorBlur(){}, // 失去焦点事件
        onEditorFocus(){}, // 获得焦点事件
        //富文本
		//////////////////////////////////////////////////////////////////////////////////////////
		formatModel: function (row, column) {
			return row.type == 1 ? '列表' : row.type == 2 ? '详情' : '未知';
		},
		//列表ajax
		getTableList(){
			this.listLoading = true;
			let option = {
				pageNum:this.pageNum,
				pageSize:this.pageSize
			}
			ajax.menuList(option).then(res => {
				this.dataSource = res.data.rows;
				this.total = res.data.total;
				this.listLoading = false;
			})
		},
		//模板列表ajax(select框选择用)
		getModelList(){
			ajax.modelList().then(res => {
				this.modelList = res.data.rows;
			})
		},
		//模板列表查询
		getModelDetails(option){
			return new Promise ((resolve,reject) => {
				ajax.modelDetails(option).then(res => {
					resolve(res)
				}).catch(err => {
					reject(err)
				})
			})
		},
		//关联内页列表(bannerOid)
		getBannerList(){
			return new Promise ((resolve,reject) => {
				ajax.bannerList().then(res => {
					resolve(res)
				}).catch(err => {
					reject(err)
				})
			})
		},
		//获取详情页内容
		getDetails(option){
			return new Promise ((resolve,reject) => {
				ajax.newsProduct(option).then(res => {
					resolve(res)
				}).catch(err => {
					reject(err)
				})
			})
		},
		//switch框转换
		formatValue(val){
			if(typeof(val) == 'boolean'){
				if(val){
					return 1
				}else{
					return 2
				}
			}else{
				if(val == 1){
					return true
				}else{
					return false
				}
			}
		},
		formatBannerList(arr){
			let newArr = [];
			for(var i = 0; i<arr.length; i++){
				if(arr[i].bannerType != 1){
					newArr.push(arr[i])
				}
			}
			return newArr;
		},
		//图片上传
		uploadUrl(){
			return ajax.imgUpload();
		},
		firstHandleSuccess(res){
			if(this.editFormVisible){
	        	this.editForm.imgUrl = res.data.url;
	    	}else{
	    		this.addForm.imgUrl = res.data.url;
	    	}
		},
		secondHandleSuccess(res){
			if(this.editFormVisible){
	        	this.editForm.blackImgUrl = res.data.url;
	    	}else{
	    		this.addForm.blackImgUrl = res.data.url;
	    	}
		},
		handleCurrentChange(val){
			this.pageNum = val;
			this.getTableList();
		},
		//新增一级菜单
		handleAdd(index,row){
			this.getBannerList().then(res => {
				this.bannerList = this.formatBannerList(res.data.rows);
				//添加一级菜单
				this.addFormVisible = true;
				if(row){	//添加二级菜单
					this.addForm.firstName = row.name;
					this.addForm.poid = row.oid;
					this.addForm._level = row._level;
					this.addForm.detailsShow = row.detailsShow;
				}
			}).catch(err => {
				this.$message.error('获取bannerList失败');
			})
			
		},
		addSubmit(){
			this.$refs.addForm.validate((valid) => {
				if (valid) {
					this.$confirm('确认提交吗？', '提示', {}).then(() => {
						this.addLoading = true;
						let row = Object.assign({}, this.addForm);
						let option = {
							name:row.name,
							type:this.optionValue.viewType - 1,
							viewOid:this.optionValue.oid,
							detailsShow:this.formatValue(row.showPro)
						}
						//如果添加二级类目带上一级累的的oid
						if(this.addForm.poid){
							option.poid = this.addForm.poid;
							option.detailsShow = ''; //添加二级菜单去掉detailsShow
						}
						//如果需要在首页显示的二级菜单
						if(this.addForm.detailsShow == 1){				//产品首页展示
							option.bannerOid = this.addForm.bannerOid;
							option.imgUrl = this.addForm.imgUrl;
							option.blackImgUrl = this.addForm.blackImgUrl
						}else{
							option.listShow = this.formatValue(row.showNews)  //新闻列表首页展示
						}
						ajax.menuAdd(option).then(res => {
							this.addLoading = false;
							this.addForm = {};//情况添加添加二级行业带的数据
							this.$message({
								message: '添加成功',
								type: 'success'
							});
							this.getTableList();
							this.addFormVisible = false;
							this.optionValue = '';
						}).catch(res =>{
							this.$message.error('添加失败了呢');
							this.addForm = {};//情况添加添加二级行业带的数据
						})
					})
				}
			});
		},
		addHandleClose(){
			this.addForm = {
				imgUrl:'',
				blackImgUrl:''
			};
		},
		//菜单编辑
		handleEdit(index,row){
			console.log(row)
			if(row._parent){
			// 二级菜单编辑
				this.getBannerList().then(res => {
					this.showSelect = false
					this.bannerList = this.formatBannerList(res.data.rows);
					this.editFormVisible = true;
					this.editForm = Object.assign(this.editForm, row);
					this.editForm.parentDetailsShow = row._parent.detailsShow;//显示图片配置
					this.editForm.bannerOid = row.bannerOid;
					this.editForm.showNews = this.editForm.listShow == 1? true:false; //switch做回显
				}).catch(err => {
					this.$message.error('获取bannerList失败');
				})
			// 二级菜单编辑
			}else{
			// 一级菜单编辑
				this.editFormVisible = true;
				this.editForm = Object.assign(this.editForm, row);
				this.editForm.showPro = this.editForm.detailsShow == 1? true:false; //switch做回显
				//1228做回显
				if(row.viewOid != ''){									//后台没搞好，有二级菜单的一级菜单不返viewOid
					this.getModelDetails({oid:row.viewOid}).then(res => {
						this.optionValue = res.data;
					}).catch(err => {
						this.$message.error('获取模板信息失败了呢!');
					})
				}else{
					this.showSelect = false;
				}
			}
			// 一级菜单编辑
		},
		//提交编辑
		editSubmit(){
			this.showSelect = true;
			this.$refs.editForm.validate( valid => {
				if(valid){
					this.editLoading = true;
					let option = {
						oid:this.editForm.oid,
						name:this.editForm.name,
						detailsShow:this.formatValue(this.editForm.showPro)
					}
					//二级菜单编辑
					if(this.editForm.parentDetailsShow == 1){  //产品
						option.detailsShow = '';
						option.bannerOid = this.editForm.bannerOid;
						option.imgUrl = this.editForm.imgUrl;
						option.blackImgUrl = this.editForm.blackImgUrl;
					}else{										//新闻
						option.detailsShow = '';
						option.listShow = this.formatValue(this.editForm.showNews)
					}
					ajax.menuUpdate(option).then(res => {
						this.editForm.parentDetailsShow = '';
						this.editLoading = false;
						this.$message({
							message: '修改成功',
							type: 'success'
						});
						this.$refs['editForm'].resetFields();
						this.editFormVisible = false;
						this.getTableList();
					})
				}
			})
		},
		//
		editHandleClose(){
			this.showSelect = true;
			this.editForm.parentDetailsShow = '';
		},
		handleDelete(index,row){
			this.$confirm('此操作将永久删除该记录, 是否继续?', '提示', {  
				confirmButtonText: '确定',  
				cancelButtonText: '取消',  
				type: 'error'  
			}).then(() => {
				this.listLoading = true;
				let option = {
					oid:row.oid		
				}
				ajax.menuDelete(option).then(res => {
					this.listLoading = false;
					this.$message({
						message: '删除成功',
						type: 'success'
					});
					this.getTableList();
				}).catch(res =>{
					this.listLoading = false
					this.$message.error('删除失败了呢');
				})   
			}).catch(() => {  
				this.$message({  
					type: 'info',  
					message: '已取消删除'  
				})  
			})
		},
		//详情
		handleDetails(index,row){
			let option = {
				menuOid:row.oid
			}
			this.getDetails(option).then(res => {
				// console.log(res.data)
				this.detailsForm.content = res.data === null ? '' : res.data.content;
				this.detailsForm.updateOid = res.data === null ? '' : res.data.oid;
				this.detailsForm.name = row.name;
				this.detailsForm.menuOid = row.oid;
				this.detailsFormVisible = true;
			})
		},
		detailsSubmit(){
			this.detailsLoading = true;
			let option = {
				content:this.detailsForm.content
			}
			if(this.detailsForm.updateOid == ''){
				option.menuOid = this.detailsForm.menuOid;
				ajax.newsAdd(option).then(res => {
					this.detailsLoading = false;
					this.$message({
						message: '提交成功',
						type: 'success'
					});
					this.detailsFormVisible = false;
					this.detailsForm = {}
					this.getTableList();
				}).catch(err => {
					this.$message.error('提交失败了呢');
					this.detailsForm = {}
				})
			}else{
				option.oid = this.detailsForm.updateOid;
				ajax.newsUpdate(option).then(res => {
					this.detailsLoading = false;
					this.$message({
						message: '更新成功',
						type: 'success'
					});
					this.detailsFormVisible = false;
					this.detailsForm = {}
					this.getTableList();
				}).catch(err => {
					this.$message.error('更新失败了呢');
					this.detailsForm = {}
				})
			}
		},
		detailsClose(){
			this.detailsForm = {}
		},
		change(){
			this.$forceUpdate()
		}	
	},
	created(){
		this.getTableList();
		this.getModelList();
	}
}
</script>
<style scoped>
	.icon-arrow-right,.icon-fold-small{
		position: absolute;
		left: 10px;
		cursor: pointer;
	}
</style>