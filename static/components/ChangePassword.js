export default {
    template:
    `<div class = "container-fluid">
        <div class="row justify-content-center">
            <div class="col-3 pt-0">
                <form v-on:submit.prevent="change_password" method="post">
                    
                    <h3 class="text-center pt-2 mb-1" v-if="error || wrong_pwd_error">Change Password</h3>
                    <h3 class="text-center pt-2 mb-1 pb-4" v-else >Change Password</h3>
                    <p class="mb-0 mx-2 text-danger text-center" v-if="error"><small>
                        *{{error}}
                    </small></p>
                    <p class="mb-0 mx-2 text-danger text-center" v-if="wrong_pwd_error"><small>
                        *{{wrong_pwd_error}}
                    </small></p>

                    <div class="form-floating mb-3">                       
                        <input type="password" class="form-control" id="floatingPassword1" placeholder="Password" name="curr_pwd" v-model="curr_pwd" required>
                        <label for="floatingPassword1">Current Password</label>
                    </div>

                    <div class="form-floating mb-3">                       
                        <input type="password" class="form-control" id="floatingPassword2" placeholder="Re-enter Password" name="new_pwd1" v-model="new_pwd1" required>
                        <label for="floatingPassword2">New Password</label>
                    </div>

                    <div class="form-floating mb-3 pb-3">                       
                        <input type="password" class="form-control" id="floatingPassword3" placeholder="Re-enter New Password" name="new_pwd2" v-model="new_pwd2" required>
                        <label for="floatingPassword3">Re-enter New Password</label>
                    </div>

                    <div class="mb-3 text-center">
                        <button type="submit" class="btn btn-primary px-4">Submit</button>
                    </div>                   
                </form>
            </div>
        </div>
    </div>`,

    data(){
        return{
            curr_pwd:null,
            new_pwd1:null,
            new_pwd2:null,
            error:null,
            wrong_pwd_error:null,
        }
    },
    computed:{
        pwd_mismatch: function(){
            return this.new_pwd1 != this.new_pwd2;
        },
    },
    watch:{
        new_pwd1 : function(pwd1_){
            if(pwd1_.length < 5){
                this.error = "Password is too short. Length should be at least 5.";
            }else if(this.pwd_mismatch){
                this.error = "Passwords in the two fields do not match. Try again.";
            }else{
                this.error = null;
            }
        },
        new_pwd2 : function(pwd2_){
            if(this.pwd_mismatch){
                this.error = "Passwords in the two fields do not match. Try again.";
            }else if(pwd2_.length < 5){
                this.error = "Password is too short. Length should be at least 5.";
            }else{
                this.error = null;
            }
        },
        error(){
            if(this.error){
                this.wrong_pwd_error = null;
            }
        }
    },
    methods:{
        async change_password(){
            if(!this.error){
                try{
                    const res = await fetch("/user-login",{
                        method: "POST",
                        headers:{
                            "Content-Type" : "application/json",
                        },
                        body: JSON.stringify({"email":this.$store.getters.get_user_email,"password": this.curr_pwd}),
                    });
                    const data = await res.json();
                    if(!res.ok){
                        this.wrong_pwd_error = "Current Password that you entered is incorrect!"
                    }else{
                        this.error = null
                    }
                }catch(err){ 
                    console.log(err)
                    alert("something went wrong.")
                }
                try{
                    const res = await fetch("/api/user",{
                        method: "PUT",
                        headers:{
                            "Authentication-Token" : this.$store.getters.get_token,
                            "Content-Type" : "application/json",
                        },
                        body: JSON.stringify({"password":this.new_pwd1}),
                    });
                    const data = await res.json();
                    if(res.ok){
                        alert("Password Changed Successfully.");
                        this.$store.commit("del_user_cred")
                        this.$router.push("/login");
                    }else{
                        alert("Something went wrong.")
                    }
                }catch(err){ 
                    console.log(err)
                    alert("something went wrong.")
                }
            }
        }
    }
}