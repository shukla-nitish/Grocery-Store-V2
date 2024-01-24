export default {
    template: 
    `<nav class="navbar navbar-expand-lg bg-body-tertiary">
        <div class="container-fluid">
            <p class="navbar-brand h3 me-0 mb-0 ms-5">Welcome</p>

            <div class="collapse navbar-collapse justify-content-end" id="navbarSupportedContent">
                <form class="d-flex mx-auto" role="search" v-on:submit.prevent="search" method="post" v-if="$route.path =='/'">
                    <input class="form-control " type="search" placeholder="Search for products" aria-label="Search" v-model="search_key" required>
                    <button class="btn btn-link" type="submit">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" class="bi bi-search" alt= "search" viewBox="0 0 16 16">
                            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                        </svg>
                    </button>
                    <router-link to="/filtered_search" class = "pt-2 link-underline link-underline-opacity-0">Filter</router-link>
                </form>
                <ul class="navbar-nav ms-2 mb-1 me-5">
                    <li class="nav-item dropdown" v-if='name'>
                        <a class="nav-link dropdown-toggle active" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                        {{name}}
                        </a>
                        <ul class="dropdown-menu">

                            <template v-if= "!['admin','mngr'].includes(role)">
                                <li><router-link class="dropdown-item" to="/orders">Orders</router-link></li>
                                <!-- Button trigger modal -->
                                <li><button type="button" class="btn btn-link dropdown-item" data-bs-toggle="modal" data-bs-target="#confirmationModal">Delete Account</button></li>
                            </template>

                            <li v-else-if= "role=='mngr'"><router-link class="dropdown-item" to="/manager_dashboard">Dashboard</router-link></li>

                            <li v-if="role=='admin' && $route.path!='/requests'""><router-link class="dropdown-item" to="/requests">Requests</router-link></li>
                            <li v-if="role=='admin' && $route.path!='/managers'""><router-link class="dropdown-item" to="/managers">Managers</router-link></li>

                            <li><router-link class="dropdown-item" to="/change_password">Change Password</router-link></li>

                            <li><hr class="dropdown-divider"></li>
                            <li><button class="dropdown-item" @click="sign_out">Sign Out</button></li>
                        </ul>
                    </li>
                    <li class="nav-item" v-else>
                        <router-link class="nav-link active" to="/login" v-if="$route.path!='/login'">Login</router-link>
                    </li>
                    <li class="nav-item" v-if="role==='cust'">
                        <router-link class="nav-link active" to = "/cart">
                            <img style="width:18px;height:18px" src="/static/cart-plus-fill.svg" alt="cart">
                        </router-link>
                    </li>
                </ul>
                <div v-if="!['admin','mngr'].includes(role)" class="modal fade" id="confirmationModal" tabindex="-1" aria-labelledby="confirmationModalLabel" aria-hidden="true">
                    <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header">
                        <h5 class="modal-title">Confirm Again</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                        <p>Are you sure, you want to delete your account?</p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">No</button>
                            <button type="button" class="btn btn-primary" data-bs-dismiss="modal" @click="delete_account">Yes</button>
                        </div>
                    </div>
                    </div>
                </div>
            </div>
        </div>
    </nav>`,

    data(){
        return{
            search_key:null,
        }
    },

    computed:{
        role(){
            return this.$store.getters.get_role;
        },
        name(){
            return this.$store.getters.get_name;
        },
    },
    methods:{
        async search(){
            try{
                const res = await fetch(`/search/${this.search_key}`);
                const search_data = await res.json();
                if (res.ok){
                    if(search_data.result_type == "category"){
                        this.$router.push(`/category/${search_data.result}`);
                    }else if(search_data.result_type == "product"){
                        if(this.role == "mngr"){
                            this.$router.push(`/${search_data.result.category}/product/${search_data.result.product}/edit`);
                        }else{
                            this.$router.push(`/${search_data.result.category}/${search_data.result.product}`);
                        }
                    }
                }else{
                    alert("No search result.");
                }
            }catch(err){
                console.error(err);
                alert("Something went wrong.");
            }
        },
        sign_out(){
            this.$store.commit("del_user_cred")
            this.$router.push("/login")
        },
        async delete_account(){
            try{
                const res = await fetch("/api/user",{
                    method: "DELETE",
                    headers:{
                        "Authentication-Token" : this.$store.getters.get_token,
                    },
                })

                const data = await res.json();
                if (res.ok){
                    this.$store.commit("del_user_cred")
                }else{
                    alert(data.message)
                }
            }catch{
                alert("Something went wrong. Try again.")
            }
        },
    }
}