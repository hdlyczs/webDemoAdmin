<template>
<section>
	<!--工具条-->
	<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
		<el-form :inline="true" :model="filters">
			<el-form-item>
				<el-input v-model="filters.name" placeholder="类目名称" @keyup.enter.native="searchWord"></el-input>
			</el-form-item>
			<el-form-item>
				<el-button type="primary" v-on:click.native="searchWord">查询</el-button>
			</el-form-item>
		</el-form>
	</el-col>
	<!--工具条-->
	<!--列表-->
	<el-table  :data="data"  border  style="width: 100%"  :row-style="showTr" v-loading="listLoading">  
		<el-table-column v-for="(column, index) in columns" :key="column.dataIndex"  :label="column.text">  
			<template slot-scope="scope">  
				<span v-if="spaceIconShow(index)" v-for="(space, levelIndex) in scope.row._level" class="ms-tree-space"></span>  
				<span class="button is-outlined is-primary is-small" v-if="toggleIconShow(index,scope.row)" @click="toggle(scope.$index)">  
					<i v-if="!scope.row._expanded" class="iconfont icon-arrow-right" aria-hidden="true"></i>  
					<i v-if="scope.row._expanded" class="iconfont icon-fold-small" aria-hidden="true"></i>  
				</span>  
				<span v-else-if="index===0" class="ms-tree-space"></span>  
				{{scope.row[column.dataIndex]}}  
			</template>  
		</el-table-column>  
		<el-table-column label="操作" v-if="treeType === 'normal'" width="260">  
			<template slot-scope="scope">  
				<el-button size="small" v-show="scope.row._level == 2" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
				<el-button size="small" v-show="scope.row._level == 2"type="danger" @click="handleDelete(scope.$index, scope.row)">删除</el-button>
				<el-button size="small" v-show="scope.row._level == 1" @click="handleAdd(scope.$index, scope.row)">添加/编辑商品</el-button>  
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
	<el-dialog title="新增" v-model="addFormVisible" :close-on-click-modal="true" @close="handleClose">
		<el-form :inline="true" :model="addForm" :rules="addFormRules" ref="addForm">	
			<el-form-item label="一级类目" prop="firstName">
				<el-input v-model="addForm.firstName" auto-complete="off" disabled="disabled"></el-input>
			</el-form-item>
			<el-form-item label="二级类目" prop="secondName">
				<el-input v-model="addForm.secondName" auto-complete="off" disabled="disabled"></el-input>
			</el-form-item>
			<el-form-item label="商品名称" prop="name">
				<el-input v-model="addForm.name" auto-complete="off"></el-input>
			</el-form-item>
			<el-form-item>
				<el-button type="primary"  v-on:click.native="searchGoods">查询</el-button>
			</el-form-item>
		</el-form>
		<el-table :data="goodsList" highlight-current-row  style="width:100%" v-loading="goodsListLoading">
			<el-table-column type="index" width="60"></el-table-column>
			<el-table-column label="类别编码" prop="pcode" width="160"></el-table-column>
			<el-table-column label="商品名称" prop="name" min-width="300"></el-table-column>
			<el-table-column label="操作" width="150">
				<template slot-scope="scope">
					<el-button size="small" @click="goodsEdit(scope.$index, scope.row)">编辑</el-button>
					<el-button type="danger" size="small" @click="goodsDelete(scope.$index, scope.row)">删除</el-button>
				</template>
			</el-table-column>
		</el-table>
		<el-col :span="24" class="toolbar">
			<el-pagination layout="prev, pager, next" :current-page="goodsPageNum" @current-change="goodsHandleCurrentChange" :page-size="10" :total="goodsTotal"  style="float:right;">
			</el-pagination>
		</el-col>
		<div slot="footer" class="dialog-footer">
			<el-button @click.native="addFormVisible = false;">取消</el-button>
			<el-button type="primary" @click.native="addSubmit" :loading="addLoading">添加</el-button>
		</div>
		<!--编辑界面-->
		<el-dialog width="300" title="编辑" append-to-body :modal="false" v-model="editFormVisible">
			<el-form :model="editForm" label-width="80px" :rules="editFormRules" ref="editForm">
				<el-form-item label="商品名" prop="name">
					<el-input v-model="editForm.name" auto-complete="off"></el-input>
				</el-form-item>
			</el-form>	
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="editFormVisible = false">取消</el-button>
				<el-button type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button>
			</div>			
     	</el-dialog>
     	<!--编辑界面-->
	</el-dialog>
	<!--新增界面-->
</section>
</template>
<script>
var CircularJSON = require('circular-json');
function transJson(option){
	return option = eval('(' + CircularJSON.stringify(option) + ')');
}
import ajax from '@/api/request'
import dataTransfer from '@/common/js/dataTranslate.js'
export default {
	name: 'tree-grid',
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
	data () {  
		return {
			columns:[
				{
	            	text: '类目编码',
	            	dataIndex: 'code'
	          	},
	          	{
	            	text: '类目名称',
	            	dataIndex: 'name'
	          	}
			],
			dataSource:[],
			filters:{
				name:''
			},
			listLoading:false,
			goodsListLoading:false,
			editFormVisible:false,
		    editLoading:false,
		    editForm:{},
		    editFormRules:{
		    	name: [
					{ required: true, message: '请输入商品名称', trigger: 'blur' }
				]
		    },
		    addLoading: false,
			addFormVisible: false,
			addFormRules: {
				name: [
					{ required: true, message: '请输入商品名称', trigger: 'blur' }
				]
			},
			addForm:{},
			rowObject:{},//临时存下点击传进的row
			goodsList:[],
			//表格分页
			pageNum: 1,
			pageSize:10,
			total:0,
			//商品分页
			goodsPageNum:1,
			goodsPageSize:10,
			goodsTotal:0
		}  
	},  
	computed: {  
		// 格式化数据源  
		data: function () {  
			let me = this  
			let data = dataTransfer.treeToArray(me.dataSource, null, null, me.defaultExpandAll)  
			//           console.log(data)  
			return data  			 		 
		}  
	},  
	methods: {
		openNotice:function(){
			this.$notify({
	          	title: '提示',
	          	message: '输入商品名称，点击右下角的提交来新增商品'
	        });
		},  
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
			if (index === 0 && record.childTrademarkClassify && record.childTrademarkClassify.length > 0) {  
				return true  
			}  
			return false  
		},
		//////////////////////////////////////////////////////////////////////////////////////////
		getTableList(w){
			this.listLoading = true;
			let option = {
				data:{
					name:w?w:'',
					pageNum:this.pageNum,
					pageSize:this.pageSize
				},
				userOid:this.$store.state.userOid,
				token:this.$store.state.token
			}
			ajax.goodsList(option).then(res => {
				this.dataSource = res.data.rows;
				this.total = res.data.total;
				this.listLoading = false;
			})
		},
		getGoodsList(row,w){
			this.goodsListLoading = true;
			let option = {
				data:{
					name:w?w:'',
					pcode:row.code,
					pageNum:this.goodsPageNum,
					pageSize:this.goodsPageSize
				},
				userOid:this.$store.state.userOid,
				token:this.$store.state.token
			}
			ajax.goodsList(option).then(res => {
				this.goodsList = res.data.rows;
				this.goodsTotal = res.data.total;
				this.goodsListLoading = false;
			})
		},
		handleAdd(index,row){
			this.addFormVisible = true;
			// console.log(index,row)
			this.addForm.firstName = row._parent.name;
			this.addForm.secondName = row.name;
			this.addForm.pcode = row.code;
			//显示产品表格
			this.rowObject = row;
			this.getGoodsList(row)
			//显示通知
			this.openNotice()		
		},
		handleClose(){
			this.addForm = {};
			this.rowObject = {};
			this.goodsPageNum = 1;
		},
		addSubmit(){
			this.$refs.addForm.validate((valid) => {
				if (valid) {
					this.$confirm('确认提交吗？', '提示', {}).then(() => {
						this.addLoading = true;
						let row = Object.assign({}, this.addForm);
						// console.log(row)
						let option = {
							data:row,
							userOid:this.$store.state.userOid,
							token:this.$store.state.token
						}
						option = transJson(option);
						ajax.goodsAdd(option).then(res => {
							this.addLoading = false;
							this.$message({
								message: '添加成功',
								type: 'success'
							});
							this.$refs['addForm'].resetFields();							
							this.getGoodsList(this.rowObject);
						}).catch(res =>{
							this.$message.error('添加失败了呢');
							this.addForm = {};//情况添加添加二级行业带的数据
						})
					})
				}
			});
		},
		goodsEdit(index,row){
			this.editFormVisible = true;
			this.editForm = Object.assign({}, row);			
			console.log(row)
		},
		//编辑提交
		editSubmit(){
			this.$refs.editForm.validate( valid => {
				if(valid){
					this.editLoading = true;
					// console.log(this.editForm)
					let option = {
						data:this.editForm,
						userOid:this.$store.state.userOid,
						token:this.$store.state.token
					}
					// option = transJson(option);
					ajax.goodsUpdate(option).then(res => {
						this.editLoading = false;
						this.$message({
							message: '修改成功',
							type: 'success'
						});
						this.$refs['editForm'].resetFields();
						this.editFormVisible = false;
						this.getGoodsList(this.rowObject);
					})
				}
			})
		}, 
		goodsDelete(index,row) {  
			this.$confirm('此操作将永久删除该记录, 是否继续?', '提示', {  
				confirmButtonText: '确定',  
				cancelButtonText: '取消',  
				type: 'error'  
			}).then(() => {
				this.listLoading = true;
				let option = {
						data:row,
						userOid:this.$store.state.userOid,
						token:this.$store.state.token
					}
				ajax.goodsDelete(option).then(res => {
					this.listLoading = false;
					this.$message({
						message: '删除成功',
						type: 'success'
					});
					this.getGoodsList(this.rowObject);
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
		},
		searchWord(){
			this.listLoading = true;
			this.getTableList(this.filters.name);
		},
		searchGoods(){
			this.getGoodsList(this.rowObject,this.addForm.name);
		},
		handleCurrentChange(val){
			this.pageNum = val;
			this.getTableList();
		},
		goodsHandleCurrentChange(val){
			this.goodsPageNum = val;
			this.getGoodsList(this.rowObject);
		} 
	},
	update(){
		this.addForm = {};
	},
	created(){
		this.getTableList();
	},
	watch:{
		filters:{
			handler:function(){
				if(this.filters.name == ''){
					this.getTableList(this.filters.name);
				}
			},
			deep:true
		}
	}
}
</script>

