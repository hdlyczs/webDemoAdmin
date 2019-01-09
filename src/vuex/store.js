import Vue from 'vue'
import Vuex from 'vuex'
import Cookies from 'js-cookie'
import ajax from '@/api/request'

Vue.use(Vuex)

// 应用初始状态
const state = {
    isLogin:false
}

// 定义所需的 mutations
const mutations = {
    checkLogin(state,status) {
        state.isLogin = status;
    }
}

//定义action
const actions = {
    login({ commit },object) {
        return new Promise((resolve,reject) => {
            ajax.adminLogin(object).then( res => {
                if(res.restCode == 200){
                    commit('checkLogin',true);
                    Cookies.set('userName', res.data.name, { expires: 1 });//cookie时间为1天
                    resolve();
                }else{
                    reject({msg:res.msg,restCode:res.restCode})
                }
            }).catch(error => {
                reject(error)
            })
        })
    },
    logout({ commit }) {
        return new Promise((resolve,reject) => {
            commit('checkLogin',false);
            Cookies.remove('userName');
            resolve();
        })
    }
}

// 创建 store 实例
export default new Vuex.Store({
    actions,
    state,
    mutations
})