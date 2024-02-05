export default {
    template:
    `<div class="container-fluid pb-5">
        <div class="row p-3 justify-content-center">
            <div class="col-1 text-center">
                <h5><small>Add filters</small></h5>
            </div>
            <div class="col-11 my-auto">
                <form v-on:submit.prevent="filtered_search" method = "post" class="row g-2 align-items-center">
                    <div class="col-1 text-center">
                        <label for="inputCateogry" class="form-label">Category : </label>
                    </div>
                    <div class="col-2">
                        <select id="inputCategory" class="form-select form-select-sm text-bg-light" name = "ctg" v-model="category">
                        <option selected>Select...</option>
                        <option v-for="category in categories">{{category.name}}</option>
                        </select>
                    </div>
                    
                    <div class="col-1 text-center">
                        <label for="price_range" class="form-label">Price Range : </label>
                    </div>
                    <div class="col-2">
                        <div class="row">
                            <div class="col-auto input-group input-group-sm">
                                <div class="input-group-text">&#8377</div>
                                <input type="number" step = "0.01" class="form-control" id="price_range" name = "price_min" placeholder="min" min="0.01" v-model="price_min">
                                <div class="input-group-text">&#8377</div>
                                <input type="number" step="0.01" class="form-control" id="price_range" name = "price_max" placeholder="max" min="0.01" v-model="price_max">
                            </div>
                        </div>
                    </div>
                    <div class="col-1 text-center">
                        <label for="mfd" class="form-label">Mfd : </label>
                    </div>
                    <div class="col-2">
                        <input type="date" class="form-control form-control-sm" id="mfd" name="mfd" v-model="mfd">
                    </div>
                            
                    <div class="col-1 text-center">
                        <label for="rating" class="form-label">Rating : </label>
                    </div>
                    <div class="col-1">
                        <input type="number" step="0.1" class="form-control" id="rating" name = "rating" placeholder = "Type Here" min="0.1" max="5" v-model="rating">
                    </div>
                    <div class="col-1 px-2">
                        <button type="submit" class="btn btn-primary">Search</button>
                    </div>
                </form>
            </div>
        </div>
        <div v-if="search_results" class="row p-2 mx-4 justify-content-center">
            <div v-for="prod in search_results" class="card border border-success-subtle col-2 text-center my-auto">
                <div class="card-body p-2 m-1 my-2">
                    <template v-if="role!='mngr'">
                        <router-link class="link-dark link-underline-opacity-0" :to="{path:'/'+ prod.category + '/' + prod.name}">
                            <img class="text-center" style="width:125px;height:125px" :src="prod.img_path" alt="product image">
                            <h5 class="card-text py-1 m-0 a"><small>{{prod.name}}</small></h5>

                            <p v-if="prod.avg_rating!=0" class="p-0 m-0"><small>{{prod.avg_rating}}<img style="width:20px;height:20px" src="/static/star.png"></small><p>

                            <p class="a"><small>{{prod.description}}</small></p>
                        </router-link>
                    </template>
                    <template v-else>
                        <img class="text-center" style="width:125px;height:125px" :src="prod.img_path" alt="product image">
                        <h5 class="card-text py-1 m-0 a"><small>{{prod.name}}</small></h5>

                        <p v-if="prod.avg_rating!=0" class="p-0 m-0"><small>{{prod.avg_rating}}<img style="width:20px;height:20px" src="/static/star.png"></small><p>

                        <p class="a"><small>{{prod.description}}</small></p>
                    </template>
                    
                    <p v-if="prod.available_quantity!=0">&#8377 {{prod.price}} / {{prod.unitDescription}}</p>


                    <template v-if="!['admin','mngr'].includes(role) && prod.available_quantity!=0">
                        <form class="row align-item-center" v-on:submit.prevent="add_to_cart(prod.stock_id)" method="post">
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
                        <p v-if="prod.available_quantity==0" class="text-danger"><small>Out of Stock</small></p>
                    

                    <router-link v-if="role=='mngr'" class="btn btn-outline-primary" :to="{path:'/'+ prod.category + '/product/' + prod.name + '/edit'}">Edit</router-link>

                </div>
            </div>
        </div>
        <h5 v-if="error" class="text-center text-danger p-3">{{error}}</h5>
    </div>`,

    data(){
        return{
            categories:null,
            category:null,
            price_min:null,
            price_max:null,
            mfd:null,
            rating:null,
            search_results:null,
            quantity:null,
            add_button_class:"btn btn-outline-primary",
            error:null,
        }
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
                console.log(ctg_data)
                this.categories = ctg_data; 
            }else{
                this.categories = [];
                console.log(ctg_data.message);
                this.$router.push("/");
            }
        }catch(err){
            console.error(err);
            alert("Something went wrong.");
            this.$router.push("/");
        }
    },
    computed:{
        role(){
            return this.$store.getters.get_role;
        },
    },
    methods:{
        async filtered_search(){
            if(this.price_min || this.mfd || this.price_max || this.rating || this.category){
                const search_fields = {};
                if(this.category && this.category != "Select..."){search_fields["category"] = this.category};
                if(this.price_min){search_fields["price_min"] = this.price_min};
                if(this.price_max){search_fields["price_max"] = this.price_max};
                if(this.mfd){search_fields["mfd"] = this.mfd};
                if(this.rating){search_fields["rating"] = this.rating};
                console.log(search_fields)
                try{
                    const res = await fetch(`/filtered_search`,{
                        method: "POST",
                        headers:{
                            // "Authentication-Token" : this.$store.getters.get_token,
                            "Content-Type" : "application/json",
                        },
                        body: JSON.stringify(search_fields),
                    })

                    const data = await res.json();
                    
                    if (res.ok){
                        this.search_results = data
                        this.error = null;
                    }else{
                        this.search_results = null;
                        console.log(data)
                        if ("message" in data){
                            this.error = data.message;
                            // alert(data.message)
                        }
                    }
                    }catch(err){
                        console.error(err);
                        alert("Something went wrong.");
                    }
            }else{
                this.error = "Please fill out one of the fields to search.";
                // alert("Please fill out one of the fields to search.");
            }
        },
        async add_to_cart(stock_id){
            if(this.quantity){
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
        },
    }
}