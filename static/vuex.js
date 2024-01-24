const store = new Vuex.Store({
    state : {
        token : null,
        name: null,
        role : null,
        user_id : null,
        email:null,
        // ctg_products:null,
    },
    mutations: {
        set_user_cred : function(state,payload){
            state.token = payload.token;
            state.name = payload.name;
            state.role = payload.role;
            state.user_id = payload.user_id;
            state.email = payload.email;
            localStorage.setItem("token",payload.token);
            localStorage.setItem("name", payload.name);
            localStorage.setItem("role", payload.role);
            localStorage.setItem("user_id", payload.user_id);
            localStorage.setItem("email", payload.email)

        },

        del_user_cred(state){
            localStorage.removeItem("token")
            localStorage.removeItem("name")
            localStorage.removeItem("role")
            localStorage.removeItem("user_id")
            localStorage.removeItem("email")
            state.token = null;
            state.name = null;
            state.role = null;
            state.user_id = null;
            state.email = null;
        },

        // update_ctg_products(state,payload){
        //     state.ctg_products = payload;
        // }
    },
    getters: {
        get_name(state){
            state.name = localStorage.getItem("name")
            return state.name
        },

        get_token(state){
            state.token = localStorage.getItem("token")
            return state.token
        },

        get_role(state){
            state.role = localStorage.getItem("role")
            return state.role
        },
        get_user_id(state){
            state.user_id = localStorage.getItem("user_id")
            return state.user_id
        },
        get_user_email(state){
            state.email = localStorage.getItem("email")
            return state.email
        },
        // get_categories(state){
        //     return state.categories;
        // },
        // get_ctg_products(state){
        //     return state.ctg_products;
        // },
    }

});

export default store