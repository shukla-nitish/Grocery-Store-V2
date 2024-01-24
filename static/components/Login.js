export default {
    template :
    `<div class = "container-fluid">   
        <div class="row justify-content-center">
            <div class="col-3 py-5">
            <form id="login" method="post" v-on:submit.prevent="login">
                <h3 class="text-center pt-2 mb-1" v-if="invalid_input">Login</h3>
                <h3 class="text-center pt-2 mb-1 pb-4" v-else >Login</h3>

                <p class="mb-0 mx-2 text-danger" v-if="invalid_input"><small>
                    Either email or password is incorrect. Please try again.
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
            fetch("/user-login",{
                method: "POST",
                headers:{
                    "Content-Type" : "application/json",
                },
                body: JSON.stringify(this.cred),
            })
            .then(response => {
                const data = response.json();
                if (!response.ok){
                    this.invalid_input = true;
                }
                return data;
            })
            .then(data => {
                if ("token" in data){
                    this.$store.commit("set_user_cred", data)
                    this.$router.push("/");
                }
                else{
                    this.invalid_input = true;
                }
            })
            .catch(err => console.log(err))
        }
    }
    
}