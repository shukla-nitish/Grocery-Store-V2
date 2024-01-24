export default {
    template :
    `<div class = "container-fluid">
        <div class="row justify-content-center">
            <div class="col-3 pt-0">
            <form id="signup" method="post" v-on:submit.prevent="sign_up">
                <h3 class="text-center pt-2 mb-1" v-if="error">Create an Account</h3>
                <h3 class="text-center pt-2 mb-1 pb-4" v-else >Create an Account</h3>

                <p class="mb-0 mx-2 text-danger text-center" v-if="error"><small>
                    *{{error}}
                </small></p>


                <div class="form-floating mb-3">                   
                    <input type="text" class="form-control" id="floatingInput" placeholder="example_name" v-model="name" required>
                    <label for="floatingInput">Name</label>
                </div>

                <div class="form-floating mb-3">                   
                    <input type="email" class="form-control" id="floatingEmail" placeholder="name@example.com" v-model="email" aria-describedby="emailHelp" required>
                    <label for="floatingInput">Email</label>
                </div>

                <div class="form-floating mb-3">                       
                    <input type="password" class="form-control" id="floatingPassword1" placeholder="Password" v-model="pwd1" required>
                    <label for="floatingPassword">Password</label>
                </div>

                <div class="form-floating mb-3 pb-3">                       
                    <input type="password" class="form-control" id="floatingPassword2" placeholder="Re-enter Password" v-model="pwd2" required>
                    <label for="floatingPassword">Re-enter Password</label>
                </div>

                <div class="mb-3 text-center">
                    <button type="submit" class="btn btn-primary px-4">Sign Up</button>
                </div>

                <div class="text-center pt-2">
                    Already have an account? <router-link to="/login">Sign in</router-link>
                </div>
            </form>
            </div>
        </div>
    </div>`,

    data : function(){
        return{
            name : null,
            email : null,
            pwd1 : null,
            pwd2 : null,
            error : null,
        }
    },

    beforeMount: function(){
        const token = localStorage.getItem("auth-token");
        if (token){
            this.$router.push("/");
        }
    },
    computed:{
        pwd_mismatch: function(){
            return this.pwd1 != this.pwd2;
        },
        cred: function(){
            return{
                name : this.name,
                email : this.email,
                password : this.pwd1,
                role : "customer"
            }
        }
    },

    watch:{
        pwd1 : function(pwd1_){
            if(pwd1_.length < 5){
                this.error = "Password is too short. Length should be at least 5.";
            }else if(this.pwd_mismatch){
                this.error = "Passwords in the two fields do not match. Try again.";
            }else{
                this.error = null;
            }
        },
        pwd2 : function(pwd2_){
            if(this.pwd_mismatch){
                this.error = "Passwords in the two fields do not match. Try again.";
            }else if(pwd2_.length < 5){
                this.error = "Password is too short. Length should be at least 5.";
            }else{
                this.error = null;
            }
        },
    },

    methods: {
        async sign_up(){
            if(!this.error){
                try{
                const res = await fetch("/api/user",{
                    method: "POST",
                    headers:{
                        "Content-Type" : "application/json",
                    },
                    body: JSON.stringify(this.cred),
                })

                const data = await res.json();
                
                if (res.ok){
                    this.$store.commit("set_user_cred", data)
                    this.$router.push("/");
                }else{
                    this.error = data.message;
                }
                }catch(err){
                    this.error = "Something went wrong. Try again.";
                    // console.log(err);
                }
            }
        }
    }

}