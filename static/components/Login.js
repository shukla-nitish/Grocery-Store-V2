export default {
    template :
    `<div class = "container-fluid">   
        <div class="row justify-content-center">
            <div class="col-3 py-5">
            <form id="login" method="post" v-on:submit.prevent="login">
                <h3 class="text-center pt-2 mb-1" v-if="invalid_input">Login</h3>
                <h3 class="text-center pt-2 mb-1" v-else-if="account_deactivated">Login</h3>
                <h3 class="text-center pt-2 mb-1 pb-4" v-else >Login</h3>

                <p class="mb-0 mx-2 text-danger text-center" v-if="invalid_input"><small>
                    Either email or password is incorrect. Please try again.
                </small></p>
                <p class="mb-0 mx-2 text-danger text-center" v-if="account_deactivated"><small>
                    This account has been temporarily deactivated.
                </small></p>

                <div class="form-floating mb-3">
                    <input type="email" class="form-control" id="floatingInput" v-model="cred.email" placeholder="name@example.com" name="email" aria-describedby="emailHelp" required>
                    <label for="floatingInput">Email</label>
                    <p id="emailHelp" class="form-text mx-2">We'll never share your email with anyone else.</p>
                </div>

                <div class="form-floating mb-3 pb-3"> 
                    <input type="password" class="form-control" id="floatingPassword" v-model="cred.password" placeholder="Password" name="pwd" required>
                    <label for="floatingPassword">Password</label>
                </div>

                <div class="mb-3 text-center">
                    <button type="submit" class="btn btn-primary px-4">Login</button>
                    <p class="text-center d-inline mx-2">or</p>
                    <router-link class="btn btn-primary px-3" to="/sign_up" role="button">Sign up</router-link>
                </div>

                <div class="text-center pt-3">
                <p>To continue without login <router-link to="/">click here</router-link></p>
                </div>
            </form>
            </div>
        </div>
    </div>`,

    data : function(){
        return{
            cred:{
                email: null,
                password: null,
            },
            account_deactivated:false,
            invalid_input : false,
        }
    },
    beforeMount: function(){
        const token = this.$store.getters.get_token
        if (token){
            this.$router.push("/");
        }
    },

    methods :{
        async login(){
            this.account_deactivated = false;
            this.invalid_input = false;
            try{
                const response = await fetch("/user-login",{
                    method: "POST",
                    headers:{
                        "Content-Type" : "application/json",
                    },
                    body: JSON.stringify(this.cred),
                })
                const data = await response.json();
                if (response.status === 403){
                    this.account_deactivated = true;
                }else if (!response.ok){
                    this.invalid_input = true;
                }else if ("token" in data){
                    this.$store.commit("set_user_cred", data)
                    this.$router.push("/");
                }else{
                    alert("something went wrong")
                }
            }catch(err){
                console.error(err);
            }
        }
    }
    
}