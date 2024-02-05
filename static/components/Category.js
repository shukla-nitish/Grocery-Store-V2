export default {
    template:
    `<div>
        <div class="row justify-content-center p-3">
            <div class="col-auto my-auto">
                <img style="width:100px;height:100px" :src="category.img_path" alt="category image">
            </div>
            <div class="col-auto my-auto">
                <h2>{{category.name}}</h2>
            </div>
        </div>
        <div v-if="role=='mngr'" class="text-center pb-3">
            <router-link :to="{path: '/category/'+ category.name + '/edit'}" class="col-2 me-3 px-2 py-0 mx-auto" data-bs-toggle="tooltip" data-bs-placement="bottom" data-bs-title="Edit"><img style="width:25px;height:25px" src="/static/pen.svg" alt="Edit"></router-link>
            <button class="btn btn-link px-2 py-0 m-0" data-bs-toggle="tooltip" data-bs-placement="bottom" data-bs-title="Delete">
                <span data-bs-toggle="modal" data-bs-target="#confirmationModalDelCategory"><img style="width:28px;height:28px" src="/static/x-circle.svg" alt="Delete"></span>
            </button>
            <!-- Modal -->
            <div class="modal fade" id="confirmationModalDelCategory" tabindex="-1" aria-labelledby="confirmationModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Confirm Again</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <h5><small>Are you sure, you want to delete this category?</small></h5>
                        <h5><small>It may require approval from admin.</small></h5>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">No</button>
                        <button type="button" class="btn btn-primary" data-bs-dismiss="modal" @click="delete_category">Yes</button>
                    </div>
                </div>
                </div>
            </div>
        </div>
        <div class="row p-2 mx-4 justify-content-center">
            <h3 v-if="!category.is_approved && role=='mngr'" class="p-2 text-center text-danger">Waiting for approval from admin...</h3>
            <template v-else-if="products.length == 0">
                <h3 class="p-2 text-center">No products added!</h3>
                <div v-if="role=='mngr'" class="row text-center my auto">
                    <router-link :to="{path: '/category/'+ category.name + '/add_product'}">
                        <img class="text-center" data-bs-toggle="tooltip" data-bs-placement="bottom" data-bs-title="click to add product" style="width:50px;height:50px" src="/static/plus.png" alt="Click here to add product">
                    </router-link>
                </div>
            </template>
                
            <!-- iterates over products from index 1 to n -->
            <template v-for="j in products.length">
                <div class="col-2 text-center my-auto">
                    <!-- card for each product -->
                    
                    <router-link v-if="role=='mngr' && j==5" :to="{path: '/category/' + cateogry.name + '/add_product'}">
                        <img class="text-center" data-bs-toggle="tooltip" data-bs-placement="bottom" data-bs-title="click to add product" style="width:50px;height:50px" src="/static/plus.png" alt="Click here to add product">
                    </router-link>
                
                    <div class="card border border-success-subtle">
                        <div class="card-body p-2 m-1 my-2">
                            <template v-if="role!='mngr'">
                                <router-link class="link-dark link-underline-opacity-0" :to="{path:'/'+ category.name + '/' + products[j-1].name}">
                                    <img class="text-center" style="width:125px;height:125px" :src="products[j-1].img_path" alt="product image">
                                    <h5 class="card-text py-1 m-0 a"><small>{{products[j-1].name}}</small></h5>

                                    <p v-if="products[j-1].avg_rating!=0" class="p-0 m-0"><small>{{products[j-1].avg_rating}}<img style="width:20px;height:20px" src="/static/star.png"></small><p>

                                    <p class="a"><small>{{products[j-1].description}}</small></p>
                                </router-link>
                            </template>
                            <template v-else>
                                <img class="text-center" style="width:125px;height:125px" :src="products[j-1].img_path" alt="product image">
                                <h5 class="card-text py-1 m-0 a"><small>{{products[j-1].name}}</small></h5>

                                <p v-if="products[j-1].avg_rating!=0" class="p-0 m-0"><small>{{products[j-1].avg_rating}}<img style="width:20px;height:20px" src="/static/star.png"></small><p>

                                <p class="a"><small>{{products[j-1].description}}</small></p>
                            </template>
                            
                            <p v-if="products[j-1].available_quantity!=0">&#8377 {{products[j-1].price}} / {{products[j-1].unitDescription}}</p>


                            <template v-if="!['admin','mngr'].includes(role) && products[j-1].available_quantity!=0">
                                <form class="row align-item-center" v-on:submit.prevent="add_to_cart(products[j-1].stock_id)" method="post">
                                    <div class="col-2">
                                        <label for="qty" class="col-form-label">Qty.</label>
                                    </div>
                                    <div class="col-5">
                                        <input type="number" id="qty" class="form-control" name = "quantity" min="1" max="5" value="1" v-model="quantity">
                                    </div>
                                    
                                    <div class="col-5">
                                        <button type="submit" value = "Submit Request" :class="add_button_class">Add</button>
                                    </div>
                                </form>
                            </template>
                            <p v-if="products[j-1].available_quantity==0" class="text-danger"><small>Out of Stock</small></p>
                            

                            <router-link v-if="role=='mngr'" class="btn btn-outline-primary" :to="{path:'/'+ category.name + '/product/' + products[j-1].name + '/edit'}">Edit</router-link>
            
                        </div>
                    </div>
                    
                </div>
            </template>
                
                <div v-if="role=='mngr' && products.length < 6 && products.length!=0" class="col-2 text-center my-auto">
                    <router-link :to="{path:'/category/'+ category.name + '/add_product'}">
                        <img class="text-center" data-bs-toggle="tooltip" data-bs-placement="bottom" data-bs-title="click to add product" style="width:50px;height:50px" src="/static/plus.png" alt="Click here to add product">
                    </router-link>
                </div>
        </div>
        <div class="row p-5"></div>
    </div>`,

    data(){
        return{
            ctg_name:this.$route.params.ctg_name,
            category:null,
            products:[],
            quantity:null,
            add_button_class:"btn btn-outline-primary",
        }
    },
    async mounted(){
        try{
            const res = await fetch(`/api/category/${this.ctg_name}`,{
                headers:{
                    "Authentication-Token" : this.$store.getters.get_token,
                },
            });
            const ctg_data = await res.json();
            if (res.ok){
                this.category = ctg_data; 
            }else{
                console.log(ctg_data);
                if("message" in ctg_data){
                    alert(ctg_data.message);
                }
                this.$router.push("/")
            }
        }catch(err){
            console.error(err);
            alert("Something went wrong.");
        }
        try{
            const res = await fetch(`/api/${this.ctg_name}/products`,{
                headers:{
                    "Authentication-Token" : this.$store.getters.get_token,
                }
            });
            const prod_data = await res.json();
            if (res.ok){
                this.products=prod_data;
            }else{
                console.log(prod_data);
            }
        }catch(err){
            console.error(err);
            alert("Something went wrong.");
        }
    },
    computed:{
        role(){
            return this.$store.getters.get_role;
        },
    },
    methods:{
        async add_to_cart(stock_id){
            if(this.$store.getters.get_role !== "cust"){
                this.$router.push("/login")
            }else if(this.quantity){
                const cart_item = {"stock_id":stock_id, "quantity": this.quantity};
                try{
                    const res = await fetch(`/api/cart/cart_items`,{
                        method: "POST",
                        headers:{
                            "Authentication-Token" : this.$store.getters.get_token,
                            "Content-Type" : "application/json",
                        },
                        body: JSON.stringify(cart_item),
                    })

                    const data = await res.json();
                    
                    if (res.ok){
                        this.add_button_class="btn btn-success";
                        console.log(data.message);
                    }else{
                        console.log(data);
                        if("message" in data){
                            alert(data.message);
                        }
                    }
                }catch(err){
                    console.error(err);
                    alert("Something went wrong.");
                }
            }else{
                alert("Please fill the quantity to add to cart.");
            }
        },
        async delete_category(){
            try{
                const res = await fetch(`/api/category/${this.ctg_name}`,{
                    method: "DELETE",
                    headers:{
                        "Authentication-Token" : this.$store.getters.get_token,
                    }
                });
                const ctg_data = await res.json();
                if(res.ok){
                    this.$router.push(`/`);
                    if(this.category.is_approved){
                        alert("Request sent for Approval from admin");
                    }else{
                        alert("Category deleted Successfully.")
                    }
                }else{
                    console.log(ctg_data);
                    if ("message" in ctg_data){
                        alert(ctg_data.message);
                    }
                }
            }catch(err){
                console.error(err);
                alert("Something went wrong.");
            }
        }
    }
}