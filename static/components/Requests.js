export default {
    template:
    `<div>
    <div class="row text-center pt-5 pb-3 m-2">
        <h4>New Category Requests</h4>
    </div>
    <template v-if="new_categories.length!=0">
    <div class="row justify-content-center">
        <!-- card for each category -->
        <div v-for="category in new_categories" class="col-2 text-center my-auto p-3">
            <div class="card border border-success-subtle">
                <div class="card-body p-2 m-1 my-2">
                    <img class="text-center" style="width:125px;height:125px" :src="category.img_path" alt="category image">
                    <h5 class="card-text py-1 m-0"><small>{{category.name}}</small></h5>
                    <div class="row align-item-center">
                        <div class="col justify-content-between">
                            <button @click="approve_category(category.category_id)" class="btn btn-primary">Approve</button>
                            <button class="btn btn-danger" data-bs-toggle="modal" :data-bs-target="'#confirmationModal' + category.category_id">Delete</button>
                            <!-- Modal -->
                            <div class="modal fade" :id="'confirmationModal' + category.category_id" tabindex="-1" aria-labelledby="confirmationModalLabel" aria-hidden="true">
                                <div class="modal-dialog modal-dialog-centered">
                                    <div class="modal-content">
                                        <div class="modal-header">
                                            <h5 class="modal-title">Confirm Again</h5>
                                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                        </div>
                                        <div class="modal-body">
                                            <h5><small>Are you sure, you want to delete category {{category.name}}?</small></h5>
                                        </div>
                                        <div class="modal-footer">
                                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">No</button>
                                            <button type="button" class="btn btn-primary" data-bs-dismiss="modal" @click="delete_category(category.category_id)">Yes</button>
                                        </div>
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
    <template v-else>
    <p class="text-center">New category requests will appear here...</p>
    </template>
    <div class="row text-center pt-5 pb-3 m-2">
        <h4>Edit Category Requests</h4>
    </div>
    <template v-if="edit_categories.length!=0">
    <div class="row justify-content-center">
        <div v-for="category in edit_categories" class="col-3 m-2 border rounded border-success text-center my-auto">
        <div class="row">
            <div class="col-6 p-2">
                <div class="card border border-success-subtle p-2">
                    <div class="card-body">
                        <p class="text-center text-decoration-underline">Existing</p>
                        <img class="text-center" style="width:125px;height:125px" :src="category.img_path" alt="category image">
                        <h5 class="card-text py-1 m-0"><small>{{category.name}}</small></h5>          
                    </div>
                </div>
            </div>
            <div class="col-6 p-2">
                <div class="card border border-success-subtle p-2">
                    <div class="card-body">
                        <p class="text-center text-decoration-underline">Edits</p>
                        <img v-if="category.edited_img_path" class="text-center" style="width:125px;height:125px" :src="category.edited_img_path" alt="category image">
                        <h5 v-if="category.edited_name" class="card-text py-1 m-0"><small>{{category.edited_name}}</small></h5>            
                        
                    </div>
                </div>
            </div>
            <div class="row align-item-center p-2">
                <div class="col justify-content-between">
                    <button @click="approve_edit_category(category.category_id)" class="btn btn-primary me-1">Approve</button>
                    <button class="btn btn-danger ms-1" data-bs-toggle="modal" :data-bs-target="'#confirmationModal' + category.category_id">Cancel</button>
                    <!-- Modal -->
                    <div class="modal fade" :id="'confirmationModal' + category.category_id" tabindex="-1" aria-labelledby="confirmationModalLabel" aria-hidden="true">
                        <div class="modal-dialog modal-dialog-centered">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <h5 class="modal-title">Confirm Again</h5>
                                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                </div>
                                <div class="modal-body">
                                    <h5><small>Are you sure, you want to cancel edits of category {{category.name}}?</small></h5>
                                </div>
                                <div class="modal-footer">
                                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">No</button>
                                    <button type="button" class="btn btn-primary" data-bs-dismiss="modal" @click="cancel_edit_category(category.category_id)">Yes</button>
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
    <template v-else>
        <p class="text-center">Edit category requests will appear here...</p>
    </template>
    <div class="row text-center pt-5 pb-3 m-2">
        <h4>Delete Category Requests</h4>
    </div>
    <template v-if="delete_categories.length!=0">
    <div class="row justify-content-center">
        <div v-for="category in delete_categories" class="col-2 text-center my-auto p-3">
            <!-- card for each category -->
            <div class="card border border-success-subtle">
                <div class="card-body p-2 m-1 my-2">
                    <img class="text-center" style="width:125px;height:125px" :src="category.img_path" alt="category image">
                    <h5 class="card-text py-1 m-0"><small>{{category.name}}</small></h5>
                    <div class="row align-item-center">
                        <div class="col justify-content-between">
                            <button class="btn btn-danger" data-bs-toggle="modal" :data-bs-target="'#confirmationModal' + category.category_id">Delete</button>
                            <button @click="cancel_delete_category(category.category_id)" class="btn btn-primary">Cancel</button>
                            <!-- Modal -->
                            <div class="modal fade" :id="'confirmationModal' + category.category_id" tabindex="-1" aria-labelledby="confirmationModalLabel" aria-hidden="true">
                                <div class="modal-dialog modal-dialog-centered">
                                    <div class="modal-content">
                                        <div class="modal-header">
                                            <h5 class="modal-title">Confirm Again</h5>
                                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                        </div>
                                        <div class="modal-body">
                                            <h5><small>Are you sure, you want to delete category {{category.name}}?</small></h5>
                                        </div>
                                        <div class="modal-footer">
                                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">No</button>
                                            <button type="button" class="btn btn-primary" data-bs-dismiss="modal" @click="delete_category(category.category_id)">Yes</button>
                                        </div>
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
    <template v-else>
    <p class="text-center">Delete category requests will appear here...</p>
    </template>
    <div class="row p-5"></div>
    </div>`,
    data(){
        return{
            new_categories:[],
            edit_categories:[],
            delete_categories:[],
        }
    },
    async beforeMount(){
        try{
            const res = await fetch(`/api/category`,{
                headers:{
                    "Authentication-Token" : this.$store.getters.get_token,
                }
            })
            const category = await res.json();
            if (res.ok){
                // console.log(category)
                for(let i = 0; i < category.length; i++){
                    if(!category[i].is_approved){
                        this.new_categories.push(category[i]);
                    }else if(category[i].edit_request){
                        this.edit_categories.push(category[i]);
                    }else if(category[i].delete_request){
                        this.delete_categories.push(category[i]);
                    }
                }
            }
        }catch(err){
            alert("Something went wrong. Try again.");
            console.error(err);
        }
    },
    methods:{
        async approve_category(id){
            try{
                const res = await fetch(`/category/approve/${id}`,{
                    headers:{
                        "Authentication-Token" : this.$store.getters.get_token,
                    }
                })
                const data = await res.json();
                if (res.ok){
                    this.$parent.forceRerender();
                    alert("Category Approved!")
                }
            }catch(err){
                alert("Something went wrong. Try again.");
                console.error(err);
            }
        },
        async approve_edit_category(id){
            try{
                const res = await fetch(`/category/approve_edit/${id}`,{
                    headers:{
                        "Authentication-Token" : this.$store.getters.get_token,
                    }
                })
                const data = await res.json();
                if (res.ok){
                    this.$parent.forceRerender();
                    alert("Edits Approved!")
                }
            }catch(err){
                alert("Something went wrong. Try again.");
                console.error(err);
            }
        },
        async cancel_edit_category(id){
            try{
                const res = await fetch(`/category/cancel_edit/${id}`,{
                    headers:{
                        "Authentication-Token" : this.$store.getters.get_token,
                    }
                })
                const data = await res.json();
                if (res.ok){
                    this.$parent.forceRerender();
                    alert("Edits Cancelled!")
                }
            }catch(err){
                alert("Something went wrong. Try again.");
                console.error(err);
            }
        },
        async delete_category(id){
            try{
                const res = await fetch(`/category/approve_delete/${id}`,{
                    headers:{
                        "Authentication-Token" : this.$store.getters.get_token,
                    }
                })
                const data = await res.json();
                if (res.ok){
                    this.$parent.forceRerender();
                    alert("Category Deleted Successfully.")
                }
            }catch(err){
                alert("Something went wrong. Try again.");
                console.error(err);
            }
        },
        async cancel_delete_category(id){
            try{
                const res = await fetch(`/category/cancel_delete/${id}`,{
                    headers:{
                        "Authentication-Token" : this.$store.getters.get_token,
                    }
                })
                const data = await res.json();
                if (res.ok){
                    this.$parent.forceRerender();
                    alert("Category Deletion Cancelled.")
                }
            }catch(err){
                alert("Something went wrong. Try again.");
                console.error(err);
            }
        }
    }
}