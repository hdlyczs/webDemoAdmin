//test
export const increment = ({commit}) => {
    commit('INCREMENT')
}
export const decrement = ({commit}) => {
    commit('DECREMENT')
}
export const loginAction = ({commit}) => {
	commit('checkLogin',1)
}
export const logoutAction = ({commit}) => {
	commit('checkLogin',0)
}
