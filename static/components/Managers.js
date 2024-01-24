export default {
    template:
    `<div>
        <div class="row justify-content-center p-3">
            <div class="col-auto my-auto">
                <h3>Managers</h3>
            </div>
        </div>
        <div v-if="managers" class="row p-2 mx-4 justify-content-center">
            <!-- iterates over managers -->
            <template v-for="manager in managers">
                <div class="col-2 text-center my-auto">
                    <!-- card for each manager -->
                    <div class="card border border-success-subtle">
                        <div class="card-body p-2 m-1 my-2">
                            <h5 class="card-text py-1 m-0 a"><small>{{manager.name}}</small></h5>          
                            <p class="py-1">Email: {{manager.email}}</p>
                            <p class="pt-0 pb-1">status: {{active_status(manager.active)}}</p>
                            <div class="row align-item-center">
                                <div class="col justify-content-between">
                                    <button @click="activate_manager(manager.user_id)" v-if="!manager.active" class="btn btn-primary">Activate</button>
                                    <button @click="deactivate_manager(manager.user_id)" v-else class="btn btn-danger">Deactivate</button>

                                    <button class="btn btn-danger" data-bs-toggle="modal" :data-bs-target="'#confirmationModal' + manager.user_id">Remove</button>
                                    <!-- Modal -->
                                    <div class="modal fade" :id="'confirmationModal' + manager.user_id" tabindex="-1" aria-labelledby="confirmationModalLabel" aria-hidden="true">
                                        <div class="modal-dialog modal-dialog-centered">
                                            <div class="modal-content">
                                                <div class="modal-header">
                                                    <h5 class="modal-title">Confirm Again</h5>
                                                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                                </div>
                                                <div class="modal-body">
                                                    <h5><small>Are you sure, you want to remove manager {{manager.name}}?</small></h5>
                                                </div>
                                                <div class="modal-footer">
                                                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">No</button>
                                                    <button type="button" class="btn btn-primary" data-bs-dismiss="modal" @click="remove_manager(manager.user_id)">Yes</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>            
                        </div>
                    </div> 
                </div>
            </template>
                
            <div class="col-2 text-center my-auto">
                <router-link to="/add_manager">
                    <img class="text-center" data-bs-toggle="tooltip" data-bs-placement="bottom" data-bs-title="click to add manager" style="width:50px;height:50px" src="/static/plus.png" alt="Click here to add manager">
                </router-link>
            </div>
        </div>

        <div v-else class="row p-2 mx-4 justify-content-center">
            <h4 class="text-center p-2">No Managers Added!</h4>
            <div class="row text-center my auto">
                    <router-link to="/add_manager">
                        <img class="text-center" data-bs-toggle="tooltip" data-bs-placement="bottom" data-bs-title="click to add manager" style="width:50px;height:50px" src="/static/plus.png" alt="Click here to add manager">
                    </router-link>
            </div>
        </div>
    </div>`,
    data(){
        return{
            managers:null,
        }
    },
    async beforeMount(){
        try{
            const res = await fetch(`/managers`,{
                headers:{
                    "Authentication-Token" : this.$store.getters.get_token,
                }
            })

            const data = await res.json();
            
            if (res.ok){
                this.managers = data;
            }
        }catch(err){
            alert("Something went wrong. Try again.");
            console.error(err);
        }
    },
    methods:{
        active_status(bool){
            if(bool){
                return "active";
            }else{
                return "inactive";
            }
        },
        async activate_manager(mngr_id){
            try{
                const res = await fetch(`/manager/activate/${mngr_id}`,{
                    headers:{
                        "Authentication-Token" : this.$store.getters.get_token,
                    }
                })

                const data = await res.json();
                
                if (res.ok){
                    this.$parent.forceRerender();
                }else{
                    if("message" in data){
                        alert(data.message);
                    }else{
                        alert("Something went wrong");
                    } 
                }
            }catch(err){
                alert("Something went wrong. Try again.");
                console.error(err);
            }
        },
        async deactivate_manager(mngr_id){
            try{
                const res = await fetch(`/manager/deactivate/${mngr_id}`,{
                    headers:{
                        "Authentication-Token" : this.$store.getters.get_token,
                    }
                })

                const data = await res.json();
                
                if (res.ok){
                    this.$parent.forceRerender();
                }else{
                    if("message" in data){
                        alert(data.message);
                    }else{
                        alert("Something went wrong");
                    } 
                }
            }catch(err){
                alert("Something went wrong. Try again.");
                console.error(err);
            }
        },
        async remove_manager(mngr_id){
            try{
                const res = await fetch(`/manager/delete/${mngr_id}`,{
                    headers:{
                        "Authentication-Token" : this.$store.getters.get_token,
                    }
                })

                const data = await res.json();
                
                if (res.ok){
                    this.$parent.forceRerender();
                }else{
                    if("message" in data){
                        alert(data.message);
                    }else{
                        alert("Something went wrong");
                    } 
                }
            }catch(err){
                alert("Something went wrong. Try again.");
                console.error(err);
            }
        },
    }
}