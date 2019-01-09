<template>
  	<el-tabs v-model="activeName" @tab-click="handleClick">
    	<el-tab-pane label="行业编辑" name="first">
    		<industry-tree-grid :columns="columns" :tree-structure="true" :data-source="dataSource" :classifyList="classifyList" @getTableList="getTableList" v-loading="industryListLoading"></industry-tree-grid>
    	</el-tab-pane>
    	<el-tab-pane label="商品编辑" name="second">
         <goods-tree-grid></goods-tree-grid>
      </el-tab-pane>
      <el-tab-pane label="大类关联" name="third">
          <classify-relation></classify-relation>
      </el-tab-pane>
  	</el-tabs>
</template>
<script>
import ajax from '@/api/request'
import industryTreeGrid from '@/components/industryTreeTable/industryTreeGrid.vue'
import goodsTreeGrid from '@/components/goodsTreeTable/goodsTreeGrid.vue'
import classifyRelation from '@/components/classifyRelation/classifyRelation.vue'
export default {
    data() {
      	return {
        	activeName: 'first',
        	columns: [
	          {
	            text: '行业',
	            dataIndex: 'name'
	          },
	          {
	            text: '描述',
	            dataIndex: 'introduce'
	          }
	        ],
          industryListLoading:true,
  		    dataSource: [],
  		    classifyList:[]
      	}
    },
    methods: {
      	handleClick:function(tab, event) {
        	// console.log(tab, event);
      	},
      	getTableList:function(w){
      		let option = {
      			data:{
      				name:w?w : ''
      			},
      			userOid:this.$store.state.userOid,
            token:this.$store.state.token
      		}
      		ajax.industryList(option).then(data => {
      			// console.log(data)
      			this.dataSource = data.data.rows;
      			// console.log(this.dataSource)
      		})
      	},
      	getClassifyList:function(){
      		let option = {
      			data:{

      			},
      			userOid:this.$store.state.userOid,
            token:this.$store.state.token
      		}
      		ajax.getClassifyList(option).then(data => {
      			this.classifyList = data.data.rows;
            this.industryListLoading = false;
      		})
      	}
    },
    components: {
    	IndustryTreeGrid: industryTreeGrid,
      GoodsTreeGrid: goodsTreeGrid,
      ClassifyRelation:classifyRelation
    },
    created(){
    	this.getTableList()
    	this.getClassifyList()
    }
};
</script>