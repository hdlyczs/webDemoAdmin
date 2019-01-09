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
		//新增
		handleAdd(){
			this.addFormVisible = true;
		},
		handleEdit(index,row){},
		handleDel(index,row){},
	},
	created(){
		this.getTableList();
	}
}
</script>