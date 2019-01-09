import axios from 'axios'
var qs = require('qs');
function request(url,type = 'GET',data = {}) {
	return new Promise((resolve,reject) => {
		let options = {
			url,
			method:type,
			headers: {
			  'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' 
			},
			transformRequest:[function (data) { 
				data = qs.stringify(data);
				return data; 
			}],
			validateStatus(status){
				return (status >=200 && status <300) || status ===400
			}
		}
		if(type.toLowerCase() === 'get'){
			options.params = data;
		}else{
			options.data = data;
		}
		axios(options).then(res => {
			if(res.status === 200){
				resolve(res.data)
			}else{
				reject(res.data)
			}
		}).catch(err => {
			reject({msg: '网络异常啦',err})
		})
	})
}
const trans = '/api' //做调试转发
const url = {
	imgUpload : trans+'/file/upload',//图片上传 
	adminLogin : trans+'/admin/login',//后台登录
	adminAdd : trans+'/admin/add',//添加管理员
	adminDelete : trans+'/admin/delete',//删除管理员
	adminUpdate : trans+'/admin/update',//管理员编辑
	adminList : trans+'/admin/list',//管理员列表
	menuList : trans+'/menu/list',//菜单列表
	menuAdd : trans+'/menu/add',//菜单添加
	menuDelete : trans+'/menu/delete',//菜单删除
	menuUpdate : trans+'/menu/update',//菜单更新
	menuDetails : trans+'/menu/details',//菜单详情
	menuNews : trans+'/menu/news',//新闻菜单列表
	modelList : trans+'/view/list',//模板列表
	modelDetails : trans+'/view/details',//模板查询
	bannerAdd : trans+'/banner/add',//banner增加
	bannerDelete : trans+'/banner/delete',//banner删除
	bannerUpdate : trans+'/banner/update',//banner更新
	bannerList : trans+'/banner/list',//banner列表
	newsAdd : trans+'/news/add',//新闻添加
	newsDelete : trans+'/news/delete',//新闻删除
	newsDetails : trans+'/news/details',//新闻详情
	newsList : trans+'/news/list',//新闻列表
	newsUpdate : trans+'/news/update',//新闻更新
	advantageAdd : trans+'/advantage/add',//优势增加
	advantageDelete : trans+'/advantage/delete',//优势删除
	advantageList : trans+'/advantage/list',//优势列表
	advantageUpdate : trans+'/advantage/update',//优势更新
}

export default {
	imgUpload(){
		return url.imgUpload
	},
	adminLogin(object){
		return request(url.adminLogin,'POST',object)
	},
	adminAdd(object){
		return request(url.adminAdd,'POST',object)
	},
	adminDelete(object){
		return request(url.adminDelete,'POST',object)
	},
	adminUpdate(object){
		return request(url.adminUpdate,'POST',object)
	},
	adminList(object){
		return request(url.adminList,'POST',object)
	},
	menuList(object){
		return request(url.menuList,'POST',object)
	},
	menuAdd(object){
		return request(url.menuAdd,'POST',object)
	},
	menuDelete(object){
		return request(url.menuDelete,'POST',object)
	},
	menuUpdate(object){
		return request(url.menuUpdate,'POST',object)
	},
	menuDetails(object){
		return request(url.menuDetails,'POST',object)
	},
	menuNews(object){
		return request(url.menuNews,'POST',object)
	},
	modelList(object){
		return request(url.modelList,'POST',object)
	},
	modelDetails(object){
		return request(url.modelDetails,'POST',object)
	},
	bannerAdd(object){
		return request(url.bannerAdd,'POST',object)
	},
	bannerDelete(object){
		return request(url.bannerDelete,'POST',object)
	},
	bannerUpdate(object){
		return request(url.bannerUpdate,'POST',object)
	},
	bannerList(object){
		return request(url.bannerList,'POST',object)
	},
	newsAdd(object){
		return request(url.newsAdd,'POST',object)
	},
	newsDelete(object){
		return request(url.newsDelete,'POST',object)
	},
	newsDetails(object){
		return request(url.newsDetails,'POST',object)
	},
	newsList(object){
		return request(url.newsList,'POST',object)
	},
	newsUpdate(object){
		return request(url.newsUpdate,'POST',object)
	},
	advantageAdd(object){
		return request(url.advantageAdd,'POST',object)
	},
	advantageDelete(object){
		return request(url.advantageDelete,'POST',object)
	},
	advantageList(object){
		return request(url.advantageList,'POST',object)
	},
	advantageUpdate(object){
		return request(url.advantageUpdate,'POST',object)
	},
}