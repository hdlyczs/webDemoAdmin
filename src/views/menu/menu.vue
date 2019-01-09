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
			<el-table-column label="操作" v-if="treeType === 'normal'" width="260">  
				<template slot-scope="scope">  
					<el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
					<el-button size="small" type="danger" @click="handleDelete(scope.$index, scope.row)">删除</el-button>
					<el-button size="small" @click="handleAdd(scope.$index, scope.row)" v-show="scope.row._level == 0">添加二级菜单</el-button>  
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
			<el-form :model="editForm" label-width="80px" :rules="editFormRules" ref="editForm">
				<el-form-item label="菜单名称" prop="name">
					<el-input v-model="editForm.name" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="关联菜单" prop="" v-show="showSelect">
					<el-select v-model="optionValue" value-key="id" placeholder="请选择" disabled="disabled">
					    <el-option v-for="item in modelList" :key="item.id" :label="item.viewName+' 模板'" :value="item"></el-option>
					</el-select>
				</el-form-item>
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
					<el-form-item label="关联菜单" prop="">
						<el-select v-model="optionValue" value-key="id" placeholder="请选择">
						    <el-option v-for="item in modelList" :key="item.id" :label="item.viewName+' 模板'" :value="item"></el-option>
						</el-select>
					</el-form-item>
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
				</div>
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
import dataTransfer from '@/common/js/dataTranslate.js'
export default {
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
			//新增
			addFormVisible:false,
			addLoading:false,
			addForm:{},
			addFormRules:{
		    	name: [
					{ required: true, message: '请输入菜单名称', trigger: 'blur' }
				]
		    },
			//编辑
			editFormVisible:false,
			editLoading:false,
			editForm:{},
			editFormRules:{
		    	name: [
					{ required: true, message: '请输入菜单名称', trigger: 'blur' }
				]
		    },
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
		handleCurrentChange(val){
			this.pageNum = val;
			this.getTableList();
		},
		//新增一级菜单
		handleAdd(index,row){
			this.addFormVisible = true;
			if(row){
				this.addForm.firstName = row.name;
				this.addForm.poid = row.oid;
				this.addForm._level = row._level;
			}
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
						}
						//如果添加二级类目带上一级累的的oid
						if(this.addForm.poid){
							option.poid = this.addForm.poid;
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
							this.$emit('getTableList');
						}).catch(res =>{
							this.$message.error('添加失败了呢');
							this.addForm = {};//情况添加添加二级行业带的数据
						})
					})
				}
			});
		},
		addHandleClose(){
			this.addForm = {};
		},
		//菜单编辑
		handleEdit(index,row){
			this.editFormVisible = true;
			this.editForm = Object.assign({}, row);
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
		},
		//提交编辑
		editSubmit(){
			this.showSelect = true;
			this.$refs.editForm.validate( valid => {
				if(valid){
					this.editLoading = true;
					let option = {
						oid:this.editForm.oid,
						name:this.editForm.name
					}
					ajax.menuUpdate(option).then(res => {
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
		}		
	},
	created(){
		this.getTableList();
		this.getModelList();
	},
}
</script>
<style scoped>
	.icon-arrow-right,.icon-fold-small{
		position: absolute;
		left: 10px;
		cursor: pointer;
	}
</style>