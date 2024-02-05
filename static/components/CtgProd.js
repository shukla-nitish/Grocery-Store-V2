export default {

    props: ["role"],
    template:
    `<div class="container-fluid pb-5">
        <div class="row justify-content-center px-4 pt-2 pb-4 m-2">
            <p v-if="role!='mngr'" class="text-success text-center">BIG DISCOUNT !!! New customers !!! Flat 20% off on your first purchase. Use Coupon code FIRSTBUY20.</p>
            <div v-if="ctg_products.length == 0" class="row align-items-center">
                <h3 class="text-center p-5">No Category Added.</h3>
            </div>
            <template v-for="obj in ctg_products">
            <div class="col-1 p-0 m-3 text-center">
                <router-link class="link-underline link-underline-opacity-0 link-dark" :to="{path:'/category/' + obj.ctg.name}">
                    <img style="width:100px;height:100px" :src="obj.ctg.img_path" alt="category image">
                    {{obj.ctg.name}}
                </router-link>
            </div>
            </template>

            <div v-if="role=='mngr'" class="col-1 p-0 m-2 text-center my-auto">
                <router-link to="/category/add">
                    <img data-bs-toggle="tooltip" data-bs-placement="bottom" data-bs-title="click to add category" style="width:50px;height:50px" src="/static/plus.png" alt="Click here to add category">
                </router-link>
            </div>

        </div>
        <template v-for="obj in ctg_prods">
            <!-- showing category names in rows -->
            <div class="row p-2 mx-5 my-3 shadow-sm bg-light bg-gradient border-bottom border-success rounded-4 rounded-top ">
                <div class="col-10">
                    <h3><small>{{obj.ctg.name}}</small></h3>
                </div>
                <div class="col-2 p-0 m-0">
                <h5 v-if="obj.ctg.is_approved" class = "text-end pt-2"><router-link class="link-underline link-underline-opacity-0 link-success" :to="{path:/category/ + obj.ctg.name}">see more</router-link></h5>
                </div>  
            </div>
            <!-- showing products for each category in a row-->
            <div class="row p-2 mx-4">
                    <h3 v-if="role=='mngr' && !obj.ctg.is_approved" class="p-2 text-center text-danger">Waiting for approval from admin.</h3>
                    <template v-if="obj.prods.length==0 && obj.ctg.is_approved">
                        <h3 class="p-2 text-center">No products added!</h3>
                        <div v-if="role=='mngr'" class="row text-center my auto">
                            <router-link :to="{path: '/category/' + obj.ctg.name +'/add_product'}">
                                <img class="text-center" data-bs-toggle="tooltip" data-bs-placement="bottom" data-bs-title="click to add product" style="width:50px;height:50px" src="/static/plus.png" alt="Click here to add product">
                            </router-link>
                        </div>
                    </template>
                    
                <!-- iterates over products from index 1 to n -->
                <template v-for="j in Math.min(obj.prods.length,6)">
                    <div class="col-2 text-center my-auto">
                        <!-- card for each product -->
                        
                        <router-link v-if="role=='mngr' && j==5" :to="{path: '/category/' + obj.ctg.name + '/add_product'}">
                            <img class="text-center" data-bs-toggle="tooltip" data-bs-placement="bottom" data-bs-title="click to add product" style="width:50px;height:50px" src="/static/plus.png" alt="Click here to add product">
                        </router-link>
                    
                        <div class="card border border-success-subtle">
                            <div class="card-body p-2 m-1 my-2">


                                <template v-if="role!='mngr'">
                                    <router-link class="link-dark link-underline-opacity-0" :to="{path:'/'+ obj.ctg.name + '/' + obj.prods[j-1].name}">
                                        <img class="text-center" style="width:125px;height:125px" :src="obj.prods[j-1].img_path" alt="product image">
                                        <h5 class="card-text py-1 m-0 a"><small>{{obj.prods[j-1].name}}</small></h5>

                                        <p v-if="obj.prods[j-1].avg_rating!=0" class="p-0 m-0"><small>{{obj.prods[j-1].avg_rating}}<img style="width:20px;height:20px" src="/static/star.png"></small><p>

                                        <p class="a"><small>{{obj.prods[j-1].description}}</small></p>
                                    </router-link>
                                </template>
                                <template v-else>
                                    <img class="text-center" style="width:125px;height:125px" :src="obj.prods[j-1].img_path" alt="product image">
                                    <h5 class="card-text py-1 m-0 a"><small>{{obj.prods[j-1].name}}</small></h5>

                                    <p v-if="obj.prods[j-1].avg_rating!=0" class="p-0 m-0"><small>{{obj.prods[j-1].avg_rating}}<img style="width:20px;height:20px" src="/static/star.png"></small><p>

                                    <p class="a"><small>{{obj.prods[j-1].description}}</small></p>
                                </template>
                                
                                <p v-if="obj.prods[j-1].available_quantity!=0">&#8377 {{obj.prods[j-1].price}} / {{obj.prods[j-1].unitDescription}}</p>


                                <template v-if="!['admin','mngr'].includes(role) && obj.prods[j-1].available_quantity!=0">
                                    <form class="row align-item-center" v-on:submit.prevent="add_to_cart(obj.prods[j-1].stock_id)" method="post">
                                        <div class="col-2">
                                            <label for="qty" class="col-form-label">Qty.</label>
                                        </div>
                                        <div class="col-5">
                                            <input type="number" class="form-control" name = "quantity" min="1" max="5" value="1" v-bind="quantity">
                                        </div>
                                        
                                        <div class="col-5">
                                            <button type="submit" :id="obj.prods[j-1].stock_id" value = "Submit Request" class="btn btn-outline-primary">Add</button>
                                        </div>
                                    </form>
                                </template>
                                <p v-if="obj.prods[j-1].available_quantity==0" class="text-danger"><small>Out of Stock</small></p>
                                

                                <router-link v-if="role=='mngr'" class="btn btn-outline-primary" :to="{path:'/'+ obj.ctg.name + '/product/' + obj.prods[j-1].name + '/edit'}">Edit</router-link>
                
                            </div>
                        </div>
                        
                    </div>
                </template>
                    
                    <div v-if="role=='mngr' && obj.prods.length < 6 && obj.prods.length!=0" class="col-2 text-center my-auto">
                        <router-link :to="{path:'/category/'+ obj.ctg.name + '/add_product'}">
                            <img class="text-center" data-bs-toggle="tooltip" data-bs-placement="bottom" data-bs-title="click to add product" style="width:50px;height:50px" src="/static/plus.png" alt="Click here to add product">
                        </router-link>
                    </div>
            </div>
        </template>
    </div>`,

    data(){
        return{
            ctg_products : [],
            quantity : 1,
            add_button_class:"btn btn-outline-primary"
        };
    },

    async beforeMount(){
        try{
            const res = await fetch("/api/category",{
                headers:{
                    "Authentication-Token" : this.$store.getters.get_token,
                },
            });
            const ctg_data = await res.json();
            if (res.ok){
                for(const catg of ctg_data){
                    const ctg_name = catg.name;
                    try{
                        const res = await fetch(`/api/${ctg_name}/products`);
                        const prod_data = await res.json();
                        if (res.ok){
                            const obj = {ctg : catg, prods : prod_data};
                            this.ctg_products.push(obj);
                        }else{
                            const obj = {ctg : catg, prods : []};
                            this.ctg_products.push(obj);
                        }
                    }catch(err){
                        console.log(err);
                        alert("something went wrong.");
                    }
                }
            }else{
                console.log(ctg_data.message);
            }
        }catch(err){
            console.log(err);
            alert("Something went wrong.");
        }
    },
    
    computed:{
        ctg_prods(){
            if(this.ctg_products.length <= 5){
                return this.ctg_products
            }else{
                return this.ctg_products.slice(0,5);
            }
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
                        const btn = document.getElementById(stock_id)
                        btn.className = "btn btn-success"
                        console.log(data.message);
                    }else{
                        console.log(data.message);
                        alert(data.message);
                    }
                }catch(err){
                    console.error(err);
                    alert("Something went wrong.");
                }
            }else{
                alert("Please fill the quantity to add to cart.");
            }
        }
    }
}