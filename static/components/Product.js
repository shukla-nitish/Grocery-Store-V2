export default {
    template:
    `<div class="row justify-content-center pt-2 pb-5">
        <div class="col-8 my-auto">

            <div class="row justify-content-center border-bottom border-success">
                <div class="col-4 text-center"><img style="width:250px;height:250px" :src="prod.img_path" alt="product image"></div>
                <div class="col-4 my-auto">
                    <h4>{{prod.name}}</h4>
                    <p v-if="prod.avg_rating!=0" class="p-0 m-0"><small>{{prod.avg_rating}}<img style="width:20px;height:20px" src="/static/star.png"></small><p> 
                    <p>{{prod.description}}</p>
                    <template v-if="prod.available_quantity!=0">
                        <p> Price : &#8377 {{prod.price}} / {{prod.unitDescription}}</p>
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
                        <p v-else class="text-danger"><small>Out of Stock</small></p>
                </div>
            </div>

            <div v-if="role=='cust'" class="row p-4 border-bottom border-success">
                <div class="col-3 mx-auto my-auto">
                    <h3 class="p-2">Rate Product</h3>
                </div>
                <div class="col-8">
                    <form v-on:submit.prevent="submit_review" method="post">
                        <div class="row p-2">

                            <div class="col-2 p-0 m-0 my-auto">
                            <span @click="submit_rating(1)" @mouseover="change_style(1)" class="btn btn-link"><img :style="style.a" src="/static/star.png"></span>
                            </div>

                            <div class="col-2 p-0 m-0 my-auto">
                            <span @click="submit_rating(2)" @mouseover="change_style(2)" class="btn btn-link"><img :style="style.b" src="/static/star.png"></span>
                            </div>

                            <div class="col-2 p-0 m-0 my-auto">
                            <span @click="submit_rating(3)" @mouseover="change_style(3)" class="btn btn-link"><img :style="style.c" src="/static/star.png"></span>    
                            </div>
                            
                            <div class="col-2 p-0 m-0 my-auto">
                            <span @click="submit_rating(4)" @mouseover="change_style(4)" class="btn btn-link"><img :style="style.d" src="/static/star.png"></span>
                            </div>
                        
                            <div class="col-2 p-0 m-0 my-auto">
                            <span @click="submit_rating(5)" @mouseover="change_style(5)" class="btn btn-link"><img :style="style.e" src="/static/star.png"></span>
                            </div>
                        </div>
                        <div class="row p-3">
                            <label for="comment area" class="form-label">Comment :</label>
                            <textarea class="form-control" id="comment_area" rows="3" name="comment" placeholder="Type your comment here." v-model="comment"></textarea>
                        </div>
                        <div class="row p-2 justify-content-center">
                            <div class="col-2">
                                <button type="submit"  class="btn btn-outline-primary ">Submit</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            <div class="row p-4 justify-content-center">
                <div class="col text-center">
                    <h3>Comments</h3>
                </div>
            </div>
            <template v-if="reviews.length != 0">
                <div v-if="user_review.comment" class="row justify-content-center">
                    <div class="col-6">
                        <div class="row justify-content-between border-top border-success">
                            <div class="col-4 pt-2 my-auto"><h5 class="my-auto">{{user_review.user}}</h5></div>
                            <div v-if="!editing_review" class="col-4 d-flex pt-2">
                                <h5 class="my-auto"><small>Rating : {{user_review.rating}}<img style="width:20px;height:20px" src="/static/star.png"></small></h5>
                                <button @click="edit_review" class="btn btn-link my-auto" data-bs-toggle="tooltip" data-bs-placement="bottom" data-bs-title="Edit Review"><img style="width:18px;height:18px" src="/static/pen.svg" alt="Edit Review"></button>
                            </div>
                            
                            <div v-else class="col-4 d-flex pt-2">
                                <input type="number" class="form-control" min="1" max="5" value="5" v-model="edited_rating">
                                <button @click="save_review(user_review.review_id)" class="px-2 my-auto btn btn-link link-underline link-underline-opacity-0 text-success"><img style="width:18px;height:18px" src="/static/tick.jpg" alt="Save"></button>
                                <button @click="cancel_edit_review" class="ps-1 pe-0 my-auto btn btn-link link-underline link-underline-opacity-0 text-danger"><img style="width:18px;height:18px" src="/static/x-circle.svg" alt="Cancel"></button>
                            </div>
                            
                            <p><small>Reviewed On : {{user_review.reviewed_on.substring(0,10)}}</small></p>
                        </div>
                        <div class="row">
                            <p v-if="!editing_review">{{user_review.comment}}</p>
                            <textarea v-else class="form-control" id="comment_area" rows="3" name="comment" placeholder="Type your comment here." v-model="edited_comment">{{user_review.comment}}</textarea>
                        </div>
                    </div>
                </div>
                <div v-for="review in reviews" v-if="review.comment && review.user_id != user_review.user_id" class="row justify-content-center">
                    <div class="col-6">
                        <div class="row justify-content-between border-top border-success">
                            <div class="col-4 pt-2"><h5>{{review.user}}</h5></div>
                            <div class="col-4 pt-2"><h5><small>Rating : {{review.rating}}<img style="width:20px;height:20px" src="/static/star.png"></small></h5></div>
                            <p><small>Reviewed On : {{review.reviewed_on.substring(0,10)}}</small></p>
                        </div>
                        <div class="row">
                            <p>{{review.comment}}</p>
                        </div>
                    </div>
                </div>
            </template>
            <div v-else class="row text-center">
                <h5>No comments yet!</h5>
            </div>
        </div>
    </div>`,

    data(){
        return{
            prod_name:this.$route.params.prod_name,
            ctg_name:this.$route.params.ctg_name,
            prod: null,
            reviews:[],
            user_review:null,
            quantity:null,
            rating:0,
            comment:null,
            add_button_class:"btn btn-outline-primary",
            style:{
                a:"width:40px;height:40px;opacity:0.5",
                b:"width:40px;height:40px;opacity:0.5",
                c:"width:40px;height:40px;opacity:0.5",
                d:"width:40px;height:40px;opacity:0.5",
                e:"width:40px;height:40px;opacity:0.5",
            },
            style_should_change:true,
            editing_review:false,
            edited_comment:null,
            edited_rating:null,
        }
    },
    async mounted(){
        try{
            const res = await fetch(`/api/${this.ctg_name}/products/${this.prod_name}`);
            const prod_data = await res.json();
            if (res.ok){
                this.prod=prod_data;
            }else{
                console.log(prod_data);
                if("message" in data){
                    alert(prod_data.message);
                }
            }
        }catch(err){
            console.error(err);
            alert("Something went wrong.");
        }
        if(this.role=="cust"){
            try{
                const res = await fetch(`/product/${this.prod_name}/reviews`);
                const review_data = await res.json();
                if (res.ok){
                    this.reviews=review_data;
                }else{
                    console.log(review_data);
                }
            }catch(err){
                console.error(err);
                alert("Something went wrong.");
            }
            try{
                const res = await fetch(`/user/${this.prod_name}/reviews`,{
                    headers:{
                        "Authentication-Token" : this.$store.getters.get_token,
                    }
                });
                const user_review_data = await res.json();
                if (res.ok){
                    this.user_review =user_review_data;
                }else{
                    console.log(user_review_data);
                }
            }catch(err){
                console.error(err);
                alert("Something went wrong.");
            }
        }
    },
    computed:{
        role(){
            return this.$store.getters.get_role;
        },
        user_id(){
            return this.$store.getters.get_user_id;
        }
    },
    methods:{
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
        async submit_review(){
            if(this.rating){
                const review = {};
                review["product_id"] = this.prod.product_id
                review["rating"] = this.rating;
                if(this.comment){review["comment"] = this.comment};
                try{
                    const res = await fetch(`/api/reviews`,{
                        method: "POST",
                        headers:{
                            "Authentication-Token" : this.$store.getters.get_token,
                            "Content-Type" : "application/json",
                        },
                        body: JSON.stringify(review),
                    })

                    const data = await res.json();
                    
                    if (res.ok){
                        this.$parent.forceRerender();
                        console.log(data.message)
                    }else{
                        console.log(data.message)
                        alert(data.message)
                    }
                }catch(err){
                    console.error(err);
                    alert("Something went wrong.");
                }
            }else{
                alert("Please click on one of the stars to submit your review.");
            }
        },
        change_style(j){
            if(this.style_should_change){
                const k={1:"a",2:"b",3:"c",4:"d",5:"e"}
                for(let i=1;i<=5;i++){
                    if(i<=j){
                        this.style[k[i]]="width:50px;height:50px";
                    }else{
                        this.style[k[i]]="width:40px;height:40px;opacity:0.5"; 
                    }
                }
            }
        },
        submit_rating(rating){
            const k={1:"a",2:"b",3:"c",4:"d",5:"e"}
            for(let i=1;i<=5;i++){
                if(i<=rating){
                    this.style[k[i]]="width:50px;height:50px";
                }else{
                    this.style[k[i]]="width:40px;height:40px;opacity:0.5"; 
            }
            this.rating=rating;
            this.style_should_change=false;
            }
        },
        edit_review(){
            this.editing_review=true;
        },
        cancel_edit_review(){
            this.editing_review=false;
        },
        async save_review(review_id){
            this.editing_review=false;
            if(this.edited_comment || this.edited_rating){
                if(this.edited_rating<1 || this.edited_rating>5){
                    alert("Rating should be in between 1 and 5.");
                }else{
                    const edited_review = {}
                    if(this.edited_comment){edited_review["comment"] = this.edited_comment}
                    if(this.edited_rating){edited_review["rating"] = this.edited_rating}
                    console.log(edited_review)
                    try{
                        const res = await fetch(`/api/reviews/${review_id}`,{
                            method: "PUT",
                            headers:{
                                "Authentication-Token" : this.$store.getters.get_token,
                                "Content-Type" : "application/json",
                            },
                            body: JSON.stringify(edited_review),
                        })

                        const data = await res.json();
                        
                        if (res.ok){
                            this.$parent.forceRerender();
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
                }
            }
        },
    }
}