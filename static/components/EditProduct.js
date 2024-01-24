export default {
    template:
    `<div class = "container-fluid justify-content-center px-5">
    <form v-on:submit.prevent="edit_product" method="post" enctype="multipart/form-data">
        <h3 class="text-center pt-2 mb-4">Edit Product</h3>
        <div class="row mt-2 py-1 px-5">
            <div class="col-4">
                <label for="inputCateogry" class="form-label ms-3">Change Category</label>
                <select id="inputCategory" class="form-select form-select-sm text-bg-light" name = "category" v-model="prod_ctg">
                <option selected>{{ctg_name}}</option>
                    <option v-for="ctg in categories" v-if="ctg.name!=ctg_name && ctg.is_approved">{{ctg.name}}</option>
                </select>
            </div>
            <div class = "col-4" >
                <label for="prod_name" class="form-label ms-3">Change Name</label>
                <input type="text" class="form-control form-control-sm" id="prod_name" name = "prod_name" v-model="prod_name" :placeholder="prod.name">
            </div>
            <div class="col-4">
                <label for="prod_desc" class="form-label ms-3">Change Description</label>
                <input type="text" class="form-control form-control-sm" id="prod_desc" name = "prod_desc" v-model="prod_desc" :placeholder="prod.description">
            </div>
        </div>
        <div class="row mt-2 py-1 px-5">
            <div class = "col-6" >
                <label for="unit" class="form-label ms-3 mb-0">Change Unit <p class = "text-danger mt-0 mx-2 mb-1 p-0 d-inline"><small>(Changing unit will delete all the existing stock entries! You'll have to re-enter them manually with appropriate quantity adjustments.)</small></p></label>
                
                <input type="text" class="form-control form-control-sm" id="unit" name = "unit" v-model="unit_desc" :placeholder="prod.unitDescription" >
            </div>
            <div class="col-6">
                <label class="form-label ms-3 mb-0">Change image</label>
                <p v-if="wrong_img_format" class="m-0 mx-2 p-0 text-danger"><small>Chosen file format is not correct!</small></p>
                <p class="mt-0 mx-2 mb-1 p-0"><small>(allowed formats: .jpg, .png, .jpeg)</small></p>
                <input class="form-control form-control-sm" type="file" name = "prod_img" @change="upload_img">
            </div>
        </div>
        <div class="mt-3 pt-3 pb-2 text-center">
            <button type="submit" value = "Upload" class="btn btn-primary px-4">Submit</button>
        </div>
    </form>
    
    <h3 class="px-5 pt-5 mb-4 text-center">Available Stocks</h3>
    <div class="row px-5 pb-2 justify-content-center">
        <div class="col-8 text-center">
        <table class="table">
            <thead>
                <tr>
                <th scope="col">#</th>
                <th scope="col">MFD (yyyy/mm/dd)</th>
                <th scope="col">Expiry</th>
                <th scope="col">Threshold</th>
                <th scope="col">Quantity</th>
                <th scope="col">Price</th>
                <th scope="col" colspan="2">Action</th>
                </tr>
            </thead>
            <tbody>

            <template v-for="stock,i in stocks">
                <tr>
                    <th scope="row">{{i+1}}</th>
                    <td>{{stock.mfd.substring(0,10)}}</td>
                    <td>{{stock.expiry_days}} Days</td>
                    <td>{{stock.threshold}} Days</td>
                    <td>{{stock.quantity}} {{prod.unitDescription}}</td>
                    <td>&#8377 {{stock.price}}</td>
                    <td>
                        <router-link :to="{path: '/'+ stock.category + '/' + stock.product +'/edit_stock/' + stock.stock_id}" class="col-2 me-3 p-0 mx-auto" data-bs-toggle="tooltip" data-bs-placement="bottom" data-bs-title="Edit"><img style="width:18px;height:18px" src="/static/pen.svg" alt="Edit"></router-link>
                        <button class="btn btn-link p-0 m-0" data-bs-toggle="tooltip" data-bs-placement="bottom" data-bs-title="Delete">
                            <span data-bs-toggle="modal" :data-bs-target="'#confirmationModal' + i"><img class="pb-1" style="width:22px;height:22px" src="/static/x-circle.svg" alt="Delete"></span>
                        </button>
                        <!-- Modal -->
                        <div class="modal fade" :id="'confirmationModal' + i" tabindex="-1" aria-labelledby="confirmationModalLabel" aria-hidden="true">
                            <div class="modal-dialog modal-dialog-centered">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <h5 class="modal-title">Confirm Again</h5>
                                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                </div>
                                <div class="modal-body">
                                    <h5><small>Are you sure, you want to delete this stock?</small></h5>
                                </div>
                                <div class="modal-footer">
                                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">No</button>
                                    <button type="button" class="btn btn-primary" data-bs-dismiss="modal" @click="delete_stock(stock.stock_id)">Yes</button>
                                </div>
                            </div>
                            </div>
                        </div>
                    </td>
                </tr>
            </template>
            </tbody>
        </table>
        </div>
        <h5 v-if="stocks.length==0" class = "p-3 text-center">No stock available!</h5>
    </div>
    <div class="row pb-2 pt-2 px-5">
        <div class="col text-center">
            <router-link class = "btn btn-primary" :to="{path: '/'+ prod.category + '/'+ prod.name + '/add_stock'}">Add Stock</router-link>
        </div>
    </div>
    <h3 class="px-5 pt-5 mb-4 text-center">Delete Product</h3>
    <div class="text-center pb-5 pt-2">
        <p class="text-danger">Deleting this product will also delete all of its stock entries.</p>
        <button class="btn btn-danger text-center" data-bs-toggle="modal" data-bs-target="#confirmationModal">Delete</button>
    </div>
    <!-- Modal-->
    <div class="modal fade" id="confirmationModal" tabindex="-1" aria-labelledby="confirmationModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Confirm Again</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <h5><small>Are you sure, you want to delete this product?</small></h5>
            </div>
            <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">No</button>
                    <button type="button" class="btn btn-primary" data-bs-dismiss="modal" @click="delete_product">Yes</button>
            </div>
        </div>
        </div>
    </div>
</div>`,

    data(){
        return{
            product_name:this.$route.params.prod_name,
            ctg_name:this.$route.params.ctg_name,
            categories:null,
            prod:null,
            stocks:null,
            prod_ctg:null,
            prod_name:null,
            prod_desc:null,
            unit_desc:null,
            prod_img:null,
        }
    },
    async mounted(){
        try{
            const res = await fetch("/api/category",{
                headers:{
                    "Authentication-Token" : this.$store.getters.get_token,
                },
            });
            const ctg_data = await res.json();
            if (res.ok){
                this.categories = ctg_data; 
            }else{
                console.log(ctg_data.message);
            }
        }catch(err){
            console.error(err);
            alert("Something went wrong.");
        }
        try{
            const res = await fetch(`/api/${this.ctg_name}/products/${this.product_name}`);
            const prod_data = await res.json();
            if (res.ok){
                this.prod=prod_data;
            }else{
                this.$router.push("/");
                console.log(prod_data.message);
            }
        }catch(err){
            console.error(err);
            alert("Something went wrong.");
        }
        try{
            const res = await fetch(`/api/stock/${this.product_name}`,{
                headers:{
                    "Authentication-Token" : this.$store.getters.get_token,
                },
            });
            const stock_data = await res.json();
            if (res.ok){
                // console.log(stock_data)
                this.stocks=stock_data;
            }else{
                this.stocks = [];
                console.log(stock_data.message);
            }
        }catch(err){
            console.log(err);
            alert("Something went wrong.");
        }
    },

    computed:{
        // product_name(){
        //     return this.$route.params.prod_name;
        // },
        // ctg_name(){
        //     return this.$route.params.ctg_name;
        // },
        wrong_img_format(){
            if(this.prod_img){
                const ALLOWED_EXTENSIONS = ['png', 'jpg', 'jpeg'];
                const filename = this.prod_img.name;
                const temp = filename.split('.')
                const file_extension = temp[temp.length-1].toLowerCase();

                if (filename.includes(".") && ALLOWED_EXTENSIONS.includes(file_extension)){
                    return false;
                }
                return true;
            }
            return false
        }
    },
    methods:{
        async edit_product(){
            if(this.prod_ctg || this.prod_name || this.prod_desc || this.unit_desc || this.prod_img){
                if (!this.wrong_img_format){
                    const formData = new FormData();
                    if(this.prod_ctg){formData.append('category', this.prod_ctg);};
                    if(this.prod_name){formData.append("name",this.prod_name);};
                    if(this.prod_desc){formData.append("description",this.prod_desc);};
                    if(this.unit_desc){formData.append("unitDescription",this.unit_desc);};
                    if(this.prod_img){formData.append("img",this.prod_img);};

                    try{
                        const res = await fetch(`/api/${this.ctg_name}/products/${this.product_name}`,{
                            method: "PUT",
                            headers:{
                                "Authentication-Token" : this.$store.getters.get_token,
                            },
                            body: formData,
                        });
                        const prod_data = await res.json();
                        if(res.ok){
                            this.$router.push("/")
                        }else{
                            console.log(prod_data.message);
                            alert(prod_data.message);
                        }
                    }catch(err){
                        console.error(err);
                        alert("Something went wrong.");
                    }
                }
            }else{
                alert("Please fill out one of the fields to edit product.");
            }
        },
        async delete_product(){
            try{
                const res = await fetch(`/api/${this.ctg_name}/products/${this.product_name}`,{
                    method: "DELETE",
                    headers:{
                        "Authentication-Token" : this.$store.getters.get_token,
                    },
                });
                const del_status = await res.json();
                if(res.ok){
                    this.$router.push("/")
                    console.log(del_status.message);
                }else{
                    console.log(del_status.message);
                    alert(del_status.message);
                }
            }catch(err){
                console.log(err);
                alert("Something went wrong.");
            }
        },
        async delete_stock(stock_id){
            try{
                const res = await fetch(`/api/stock/${this.product_name}/${stock_id}`,{
                    method: "DELETE",
                    headers:{
                        "Authentication-Token" : this.$store.getters.get_token,
                    },
                });
                const del_status = await res.json();
                if(res.ok){
                    this.$parent.forceRerender();
                    console.log(del_status.message);
                }else{
                    console.log(del_status.message);
                    alert(del_status.message);
                }
            }catch(err){
                console.log(err);
                alert("Something went wrong.");
            }
        },

        upload_img(event){
            this.prod_img = event.target.files[0];
        }
    }

}