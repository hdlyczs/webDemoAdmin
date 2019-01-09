<template>
	<section>
		<el-table :data="dataList" border highlight-current-row v-loading="listLoading" style="width: 100%;">
			<el-table-column label="类目编码" prop="code" ></el-table-column>
			<el-table-column label="类目名称" prop="name" ></el-table-column>
			<el-table-column label="操作" width="262">
				<template slot-scope="scope">
					<el-button size="small" @click="relationEdit(scope.$index, scope.row)">关联分类</el-button>
				</template>
			</el-table-column>
		</el-table>
		<el-col :span="24" class="toolbar">
			<el-pagination layout="prev, pager, next" :current-page="pageNum" @current-change="handleCurrentChange" :page-size="10" :total="total"  style="float:right;">
			</el-pagination>
		</el-col>
		<!--关联界面-->
	<el-dialog title="关联" v-model="editFormVisible" :close-on-click-modal="true" @close="handleClose" v-loading="relationLoading">
		<el-form :model="editForm" :label-position="'left'" label-width="80px">	
			<el-form-item label="类目名称" prop="name">
				<el-col :span="8">
					<el-input v-model="editForm.name" auto-complete="off" disabled="disabled"></el-input>
				</el-col>
			</el-form-item>		
		</el-form>
		<el-tabs type="card" value='core' @tab-click="handleClick">
		    <el-tab-pane label="核心" name="core"></el-tab-pane>
		    <el-tab-pane label="重要" name="important"></el-tab-pane>
		    <el-tab-pane label="关联" name="relative"></el-tab-pane>
		</el-tabs>
		<el-button size="small" type="danger" @click="relationAdd" style="margin-bottom:15px">添加分类</el-button>
		<el-table :data="switchTab" border highlight-current-row style="width: 100%;">
			<el-table-column label="类目编码" prop="code" ></el-table-column>
			<el-table-column label="类目名称" prop="name" ></el-table-column>
			<el-table-column label="操作" width="80">
				<template slot-scope="scope">
					<el-button size="small" type="danger" @click="relationDelete(scope.$index, scope.row)">删除</el-button>
				</template>
			</el-table-column>
		</el-table>				
		<el-dialog width="300" title="添加" append-to-body :modal="false" v-model="addFormVisible" @close="addHandleClose">
			<el-form :model="addForm" :label-position="'left'">
				<el-form-item label="关联类别">
					<el-col :span="8">
						<el-input v-model="transChinese" auto-complete="off" disabled="disabled"></el-input>
					</el-col>
				</el-form-item>
				<!-- 1130 17:00 -->
				<el-form-item label="请选择" prop="">
					<el-select v-model="optionValue" value-key="id" placeholder="请选择">
					    <el-option v-for="item in allDataList" :key="item.id" :label="item.code+'类 '+item.name" :value="item"></el-option>
					</el-select>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="addFormVisible = false">取消</el-button>
				<el-button type="primary" @click.native="addSubmit" :loading="addLoading">提交</el-button>
			</div>
		</el-dialog>
	</el-dialog>
	<!--新增界面-->
	</section>
</template>
<script>
import ajax from '@/api/request'
export default {
	data(){
		return{
			dataList:[],
			allDataList:[],//做select框
			//表格分页
			pageNum: 1,
			pageSize:10,
			total:0,
			listLoading:false,
			editLoading:false,
			relationLoading:false,
			editFormVisible:false,
			editForm:{},
			status:'core',
			coreList:[],//核心列表
			importantList:[],//重要列表
			relativeList:[],//关联列表
			//添加关联
			addFormVisible:false,
			addForm:{},
			optionValue:{},//1130 17:00
			addLoading:false,
			relationType:0,
		}
	},
	computed:{
		switchTab:function(){
			if(this.status == 'core'){
				return this.coreList;
			}else if(this.status == 'important'){
				return this.importantList;
			}else{
				return this.relativeList;
			}
		},
		transChinese:function(){
			if(this.status == 'core'){
				this.relationType = 1 
				return '核心';
			}else if(this.status == 'important'){
				this.relationType = 2
				return '重要'
			}else{
				this.relationType = 3
				return '关联'
			}
		}
	},
	methods:{
		getTableList:function(all){
			this.listLoading = true;
			let option = {
      			data:{
      				pageNum:all?'':this.pageNum,
      				pageSize:all?'':this.pageSize
      			},
      			userOid:this.$store.state.userOid,
				token:this.$store.state.token
      		}
      		ajax.getClassifyList(option).then(data => {
      			if(all){
      				this.allDataList = data.data.rows
      			}else{
      				this.dataList = data.data.rows
      			}
      			this.total = data.data.total;
            	this.listLoading = false;
      		})
		},
		getRelationList:function(){
			this.relationLoading = true;
			let option = {
      			data:{
      				oid:this.editForm.oid
      			},
      			userOid:this.$store.state.userOid,
				token:this.$store.state.token
      		}
      		ajax.relationList(option).then(data => {
      			this.relationLoading = false;
      			//清空数据 => 弱智方法 el-table自带的筛选不符合需求 对row进行v-show我TM又搞不定 你吗B的
				this.coreList = [];this.importantList = [];this.relativeList = [];
				//弱智行为结束
      			// console.log(data)//11/30 13:51
      			var arr = data.data;
      			for(let i = 0;i<arr.length;i++){
      				if(arr[i].relationType == 1){
      					this.coreList.push(arr[i])
      				}else if(arr[i].relationType == 2){
      					this.importantList.push(arr[i])
      				}else{
      					this.relativeList.push(arr[i])
      				}
      			}
      		})
		},
		classifyRelationAdd:function(oid,roid){
			this.addLoading = true;
			let option = {
				data:{
					classifyOid:oid,
					relationClassifyOid:roid,
					relationType:this.relationType
				},
				userOid:this.$store.state.userOid,
				token:this.$store.state.token
			}
			ajax.relationAdd(option).then( res => {
				this.addLoading = false;
				this.$message({
					message: '添加成功',
					type: 'success'
				});
				this.addFormVisible = false;
				this.getRelationList();//更新表格
			})
		},
		classifyRelationDelete:function(roid){
			this.$confirm('确认删除该记录吗?', '提示', {
				type: 'warning'
			}).then(() => {
				this.relationLoading = true;
				let option = {
						data:{
							oid:roid
						},
						userOid:this.$store.state.userOid,
						token:this.$store.state.token
					}
				ajax.relationDelete(option).then(res => {
					this.relationLoading = false;
					this.$message({
						message: '删除成功',
						type: 'success'
					});
					this.getRelationList();//更新表格
				}).catch(res =>{
					this.$message.error('删除失败了呢');
				})
			}).catch(() => {

			});
		},
		handleCurrentChange(val){
			this.pageNum = val;
			this.getTableList();
		},
		relationEdit:function(index,row){
			this.editFormVisible = true;
			this.editForm = Object.assign({}, row);
			//
			this.getRelationList();
		},
		relationAdd:function(all){
			this.addFormVisible = true;
			this.getTableList(all);
		},
		addSubmit:function(){
			// console.log(this.optionValue)
			this.classifyRelationAdd(this.editForm.oid,this.optionValue.oid)
			this.optionValue = {};
		},
		addHandleClose:function(){
			this.optionValue = {};
		},
		relationDelete:function(index,row){
			// console.log(row)
			this.classifyRelationDelete(row.trademarkClassifyRelationOid)
		},
		//弹出层的选项卡
		handleClick(tab, event) {
	        // console.log(tab, event);
	        this.status = tab.name;
	    },
		handleClose:function(){},
	},
	created(){
		this.getTableList()
	}
}
</script>