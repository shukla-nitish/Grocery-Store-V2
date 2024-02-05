export default {
    template:
    `<div>
        <div v-if= "!cart_is_empty" class="container">
            <div class="row justify-content-center">
                <div class="col-8">
                    <div class="row border-bottom text-center p-2 column-gap-2">
                        <div class="col-3 my-auto">
                            Product
                        </div>
                        <div class="col-2 my-auto">
                            Quantity
                        </div>
                        <div class="col-2 my-auto">
                            Price
                        </div>
                        <div class="col-1 my-auto">
                            Discount
                        </div>
                        <div class="col-1 my-auto">
                            Total
                        </div>
                    </div>
                    <div v-for="item in cart.items" class="row border-bottom p-0 m-0 column-gap-2">
                        <div class="col-3 my-0 ms-1 p-0 text-center ">
                            <div class="row mx-auto">
                                <div class="col-4 ms-2 pe-0"><router-link :to="{path: '/' + item.product_category + '/' + item.product_name}"><img class="text-center me-3" style="width:50px;height:50px" :src="item.product_img_path" alt="product image"></router-link></div>
                                <div class="col-6 my-auto ps-0 a" style="word-wrap:break-word"><router-link class="link-dark link-underline-opacity-0" :to="{path: '/' + item.product_category + '/' + item.product_name}">{{item.product_name}}</router-link></div>
                            </div>
                        </div>
                        <div v-if="!editing_qty|| editing_item_id !== item.item_id" class="col-2 my-auto text-center">
                            <p class="my-auto"><small>{{item.quantity}} {{item.unit_description}}</small></p>
                        </div>
                        <div v-if="editing_item_id === item.item_id" class="col-2 my-auto text-center">
                            <input type="number" class="form-control" min="1" max="5" value="1" v-model="edited_qty">
                        </div>
                        <template v-if="item.availability_status=='in-stock'">
                            <div class="col-2 my-auto text-center">
                                <p class="my-auto"><small>&#8377 {{item.price}} / {{item.unit_description}}</small></p>
                            </div>
                            <div class="col-1 my-auto text-center">
                                <p v-if="discount" class="my-auto"><small>{{discount}}%</small></p>
                                <p v-else class="my-auto"><small>No</small></p>
                            </div>
                            <div class="col-1 my-auto text-center">
                                <p v-if="!discount" class="my-auto"><small>&#8377 {{item.price*item.quantity}}</small></p>
                                <p v-else class="my-auto"><small>&#8377 {{item.price*item.quantity*(1-discount*0.01)}}</small></p>
                            </div>
                        </template>
                        <div v-if="item.availability_status=='insufficient-stock'" class="col-4 my-auto text-center">
                            <p class="text-danger pb-0 m-0"><small>Insufficient Stock</small></p>
                            <p class="text-danger pt-0 m-0"><small>You may try reducing the quantity!</small></p>
                        </div>
                        <div v-if="item.availability_status=='out-of-stock'" class="col-4 my-auto text-center">
                            <p class="text-danger my-auto"><small>Out Of Stock</small></p>
                        </div>
                        <div class="col-2 m-0 p-0 mx-auto d-flex gap-3">
                            <button @click="edit_quantity(item.item_id)" v-if="item.availability_status!='out-of-stock' && (!editing_qty|| editing_item_id !== item.item_id)" class="btn btn-link" data-bs-toggle="tooltip" data-bs-placement="bottom" data-bs-title="Edit Qty"><img style="width:18px;height:18px" src="/static/pen.svg" alt="Edit Qty"></button>
                            <button @click="save_quantity(item.item_id)" v-if="item.availability_status!='out-of-stock' && editing_qty && editing_item_id === item.item_id" class="btn btn-link link-underline link-underline-opacity-0 text-success">Save</button>
                            <button @click="delete_item(item.item_id)" class="btn btn-link" data-bs-toggle="tooltip" data-bs-placement="bottom" data-bs-title="Remove"><img style="width:18px;height:18px" src="/static/x-circle.svg" alt="Remove"></button>
                        </div>
                    </div>
                    <div class="row text-center px-5 pt-5 pb-2">
                        <h5>Cart Total : &#8377 {{cart_total}}</h5>
                    </div>

                    <div class="row text-center pt-2 pb-5 justify-content-center">
                        <div class="col-3">
                            <div class="form-floating mb-2">                   
                                <input type="text" class="form-control" id="floatingInput" placeholder="Coupon Code" v-model="coupon_code">
                                <label for="floatingInput">Enter Coupon code here</label>
                            </div>
                            <button @click="place_order" class="btn btn-success col-8" type="submit">Place Order</button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
        <div v-else class="row text-center p-5">
            <h5 class = "text-danger">Cart is Empty!</h5>
            <h5>Please add products to cart.</h5>
        </div>
    </div>`,

    data(){
        return{
            cart:null,
            cart_is_empty:false,
            discount:null,
            editing_qty:false,
            editing_item_id:null,
            edited_qty:null,
            coupon_code:null,
        }
    },
    async mounted(){
        try{
            const res = await fetch(`/api/cart`,{
                headers:{
                    "Authentication-Token" : this.$store.getters.get_token,
                },
            });
            const cart_data = await res.json();
            if (res.ok){
                console.log(cart_data);
                this.cart = cart_data; 
            }else{
                if (res.status == 404){
                    this.cart_is_empty = true;
                }else{
                    console.log(cart_data);
                    alert("Something went wrong");
                }
            }
        }catch(err){
            console.error(err);
            alert("Something went wrong.");
        }
    },
    watch:{
        coupon_code(new_code){
            if(new_code.toUpperCase() == "FIRSTBUY20"){
                this.discount = 20;
            }
        }
    },
    computed:{
        cart_total(){
            let disc = 0;
            if(this.discount){
                disc = this.discount;
            };
            let total = 0;
            for(const item of this.cart.items){
                if(item.availability_status == "in-stock"){
                    total += item.price*item.quantity*(1-0.01*disc)
                }
            };
            return total
        }
    },
    methods:{
        edit_quantity(item_id){
            this.editing_qty=true;
            this.editing_item_id = item_id;
        },
        async save_quantity(item_id){
            this.editing_qty=false;
            this.editing_item_id = null;
            if(this.edited_qty<1 || this.edited_qty>5){
                alert("Quantity should be in between 1 and 5.");
            }else{
                try{
                    const res = await fetch(`/api/cart/cart_items/${item_id}`,{
                        method: "PUT",
                        headers:{
                            "Authentication-Token" : this.$store.getters.get_token,
                            "Content-Type" : "application/json",
                        },
                        body: JSON.stringify({"quantity":this.edited_qty}),
                    })

                    const data = await res.json();
                    
                    if (res.ok){
                        this.$parent.forceRerender();
                        console.log(data.message);
                    }else{
                        console.log(data);
                        if(message in data){
                            alert(data.message);
                        }
                    }
                }catch(err){
                    console.error(err);
                    alert("Something went wrong.");
                }
            }
        },
        async delete_item(item_id){
            try{
                const res = await fetch(`/api/cart/cart_items/${item_id}`,{
                    method: "DELETE",
                    headers:{
                        "Authentication-Token" : this.$store.getters.get_token,
                    }
                })

                const data = await res.json();
                
                if (res.ok){
                    this.$parent.forceRerender();
                    console.log(data);
                }else{
                    console.log(data);
                    if(message in data){
                        alert(data.message);
                    }
                }
            }catch(err){
                console.error(err);
                alert("Something went wrong.");
            }
        },
        async place_order(){
            try{
                const res = await fetch(`/api/order`,{
                    method: "POST",
                    headers:{
                        "Authentication-Token" : this.$store.getters.get_token,
                        "Content-Type" : "application/json",
                    },
                    body: JSON.stringify({"coupon_code":this.coupon_code}),
                })
                const data = await res.json();
                if (res.ok){
                    this.$router.push("/orders");
                    console.log(data);
                }else{
                    console.log(data);
                    if(message in data){
                        alert(data.message);
                    }
                }
            }catch(err){
                console.error(err);
                alert("Something went wrong.");
            }
        }
    }
}