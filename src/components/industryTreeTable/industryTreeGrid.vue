<template>
<section>
	<!--工具条-->
	<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
		<el-form :inline="true" :model="filters">
			<el-form-item>
				<el-input v-model="filters.name" placeholder="行业" @keyup.enter.native="searchWord"></el-input>
			</el-form-item>
			<el-form-item>
				<el-button type="primary" v-on:click.native="searchWord">查询</el-button>
			</el-form-item>
			<el-form-item>
				<el-button type="primary" @click="handleAdd">新增</el-button>
			</el-form-item>
		</el-form>
	</el-col>
	<!--工具条-->
	<!--列表-->
	<el-table  :data="data"  border  style="width: 100%"  :row-style="showTr">  
		<el-table-column v-for="(column, index) in columns" :key="column.dataIndex"  :label="column.text">  
			<template slot-scope="scope">  
				<span v-if="spaceIconShow(index)" v-for="(space, levelIndex) in scope.row._level" class="ms-tree-space"></span>  
				<button class="button is-outlined is-primary is-small" v-if="toggleIconShow(index,scope.row)" @click="toggle(scope.$index)">  
					<i v-if="!scope.row._expanded" class="iconfont icon-arrow-right" aria-hidden="true"></i>  
					<i v-if="scope.row._expanded" class="iconfont icon-fold-small" aria-hidden="true"></i>  
				</button>  
				<span v-else-if="index===0" class="ms-tree-space"></span>  
				{{scope.row[column.dataIndex]}}  
			</template>  
		</el-table-column>  
		<el-table-column label="操作" v-if="treeType === 'normal'" width="260">  
			<template slot-scope="scope">  
				<el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
				<el-button size="small" type="danger" @click="handleDelete(scope.$index, scope.row)">删除</el-button>
				<el-button size="small" v-show="scope.row._level !=1" @click="handleAdd(scope.$index, scope.row)">添加二级行业</el-button>  
			</template>  
		</el-table-column>  
	</el-table>
	<!--列表-->
	<!--编辑界面-->
	<el-dialog title="编辑" v-model="editFormVisible" :close-on-click-modal="true" @close="handleClose">
		<el-form :model="editForm" label-width="80px" :rules="editFormRules" ref="editForm">
			<!-- 编辑二级行业 -->
			<div v-if="editForm._level != 0">
				<el-form-item label="行业" prop="firstName">
					<el-input v-model="editForm.firstName" auto-complete="off" disabled="disabled"></el-input>
				</el-form-item>
				<el-form-item label="二级行业" prop="name">
					<el-input v-model="editForm.name" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="关联分类" prop="">
					<el-select v-model="optionValue" value-key="id" placeholder="请选择">
					    <el-option v-for="item in classifyList" :key="item.id" :label="item.code+'类 '+item.name" :value="item"></el-option>
					</el-select>
				</el-form-item>
			</div>
			<!-- 新增已经级行业 -->
			<div v-else>
				<el-form-item label="行业" prop="name">
					<el-input v-model="editForm.name" auto-complete="off"></el-input>
				</el-form-item>
			</div>
			<el-form-item label="描述" prop="introduce">
				<el-input type="textarea" v-model="editForm.introduce"></el-input>
			</el-form-item>
		</el-form>
		<div slot="footer" class="dialog-footer">
			<el-button @click.native="editFormVisible = false">取消</el-button>
			<el-button type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button>
		</div>
	</el-dialog>
	<!--编辑界面-->
	<!--新增界面-->
	<el-dialog title="新增" v-model="addFormVisible" :close-on-click-modal="true" @close="handleClose">
		<el-form :model="addForm" label-width="80px" :rules="addFormRules" ref="addForm">
			<!-- 点击添加二级行业 -->
			<div v-if="addForm._level == 0">	
				<el-form-item label="行业" prop="firstName">
					<el-input v-model="addForm.firstName" auto-complete="off" disabled="disabled"></el-input>
				</el-form-item>
				<el-form-item label="二级行业" prop="name">
					<el-input v-model="addForm.name" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="关联分类" prop="">
					<el-select v-model="optionValue" value-key="id" placeholder="请选择">
					    <el-option v-for="item in classifyList" :key="item.id" :label="item.code+'类 '+item.name" :value="item"></el-option>
					</el-select>
				</el-form-item>
			</div>
			<!-- 新增已经级行业 -->
			<div v-else>
				<el-form-item label="行业" prop="name">
					<el-input v-model="addForm.name" auto-complete="off"></el-input>
				</el-form-item>
			</div>
			<el-form-item label="描述" prop="introduce">
				<el-input type="textarea" v-model="addForm.introduce"></el-input>
			</el-form-item>
		</el-form>
		<div slot="footer" class="dialog-footer">
			<el-button @click.native="addFormVisible = false;addForm = {}">取消</el-button>
			<el-button type="primary" @click.native="addSubmit" :loading="addLoading">提交</el-button>
		</div>
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
	// 该属性是确认父组件传过来的数据是否已经是树形结构了，如果是，则不需要进行树形格式化  
	  treeStructure: {  
	        type: Boolean,  
	        default: function () {  
		          return false  
	        }  
      },  
// 这是相应的字段展示  
      columns: {  
	        type: Array,  
	        default: function () {  
		          return []  
	        }  
      },  
// 这是数据源  
      dataSource: {  
	        type: Array,  
	        default: function () {  
		          return []  
	        }  
      },  
// 这个作用是根据自己需求来的，比如在操作中涉及相关按钮编辑，删除等，需要向服务端发送请求，则可以把url传过来  
      requestUrl: {  
	        type: String,  
	        default: function () {  
		          return ''  
	        }  
      },  
// 这个是是否展示操作列  
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
	  classifyList:{
	  		type:Array
	  }  
    },
	data () {  
		return {
			optionValue:'',
			filters:{
				name:''
			},
			editFormVisible:false,
		    editLoading:false,
		    editForm:{},
		    editFormRules:{
		    	name: [
					{ required: true, message: '请输入行业名称', trigger: 'blur' }
				]
		    },
		    addLoading: false,
			addFormVisible: false,
			addFormRules: {
				name: [
					{ required: true, message: '请输入行业名称', trigger: 'blur' }
				]
			},
			addForm:{},
		}  
    },  
    computed: {  
    // 格式化数据源  
      data: function () {  
	        let me = this  
	        if (me.treeStructure) {  
		          let data = dataTransfer.treeToArray(me.dataSource, null, null, me.defaultExpandAll)  
		//           console.log(data)  
		          return data  
	        }  
	        return me.dataSource  
      }  
    },  
    methods: {  
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
	        if (me.treeStructure && index === 0) {  
		          return true  
	        }  
	        return false  
      },  
    // 点击展开和关闭的时候，图标的切换  
      toggleIconShow (index, record) {  
	        let me = this  
	        if (me.treeStructure && index === 0 && record.childIndustry && record.childIndustry.length > 0) {  
		          return true  
	        }  
	        return false  
      },
	//////////////////////////////////////////////////////////////////////////////////////////
		getCLassify(id){				//根据oid做select框的回显
			let option = {
				data:{
					oid:id
				},
				userOid:this.$store.state.userOid,
				token:this.$store.state.token
			}
			ajax.getClassifyDetails(option).then(data => {
				this.optionValue = data.data;
				// console.log(data)
			})
		},
		handleAdd(index,row){
			this.addFormVisible = true;
			// console.log(row)
			if(row){
				this.addForm.firstName = row.name;
				this.addForm.poid = row.oid;
				this.addForm._level = row._level;
			}
		},
		handleClose(){
			this.addForm = {};
			this.optionValue = '';
		},
		addSubmit(){
			this.$refs.addForm.validate((valid) => {
				if (valid) {
					this.$confirm('确认提交吗？', '提示', {}).then(() => {
						this.addLoading = true;
						let row = Object.assign({}, this.addForm);
						row.classifyOid = this.optionValue.oid? this.optionValue.oid:'';//这里添加select框传过来的值 
						let option = {
							data:row,
							userOid:this.$store.state.userOid,
							token:this.$store.state.token
						}
						option = transJson(option);
						ajax.industryAdd(option).then(res => {
							this.addLoading = false;
							this.addForm = {};//情况添加添加二级行业带的数据
							this.$message({
								message: '添加成功',
								type: 'success'
							});
							this.$refs['addForm'].resetFields();
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
		handleEdit(index,row){
			this.editFormVisible = true;
			this.editForm = Object.assign({}, row);
			this.editForm.firstName = row._parent? row._parent.name:'';
			if(this.editForm.classifyOid){				//做回显
				this.getCLassify(this.editForm.classifyOid)
			} 
			// console.log(row)
		},
		//编辑提交
		editSubmit(){
			this.$refs.editForm.validate( valid => {
				if(valid){
					this.editLoading = true;
					// console.log(this.editForm)
					this.editForm.classifyOid = this.optionValue.oid? this.optionValue.oid:'';//这里添加select框传过来的值
					let option = {
						data:this.editForm,
						userOid:this.$store.state.userOid,
						token:this.$store.state.token
					}
					option = transJson(option);
					ajax.industryUpdate(option).then(res => {
						this.editLoading = false;
						this.$message({
							message: '修改成功',
							type: 'success'
						});
						this.$refs['editForm'].resetFields();
						this.editFormVisible = false;
						this.$emit('getTableList');
					})
				}
			})
		}, 
		handleDelete (index,row) {  
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
				option = transJson(option);
				ajax.industryDelete(option).then(res => {
					this.listLoading = false;
					this.$message({
						message: '删除成功',
						type: 'success'
					});
					this.$emit('getTableList');
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
			this.$emit('getTableList',this.filters.name);
		} 
	},
	update(){
		this.addForm = {};
	},
	created(){
		// this.classifyList = this.$props.classifyList;
		// console.log(this.classifyList)
	},
	watch:{
		filters:{
			handler:function(){
				if(this.filters.name == ''){
					this.$emit('getTableList');
				}
			},
			deep:true
		}
	}
}
</script>

