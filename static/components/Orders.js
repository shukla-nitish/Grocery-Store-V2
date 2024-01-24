export default {
    template:
    `<div>
        <div v-if="any_order_placed" class="container">
            <template v-for="order in orders">
            <div class="row justify-content-center p-3">
                <div class="col-10 text-center">
                    <div class="row justify-content-center">
                        <div class="col-5"><h5 class="ms-5">Order Date : {{order.order_date.substring(0,10)}}</h5></div>
                        <div class="col-5"><h5 class = "d-inline" >Status :</h5><h5 class="text-success me-5 d-inline"> {{order.status}}</h5></div>
                    </div>    
                </div>
            </div>
            <div class="row justify-content-center">
                <div class="col-7">
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
                        <div class="col-2 my-auto">
                            Discount
                        </div>
                        <div class="col-2 my-auto">
                            Total
                        </div>
                    </div>
                    
                    <div v-for="item in order.items" class="row border-bottom p-0 m-0 column-gap-2">
                        <div class="col-3 my-0 ms-1 p-0 text-center ">
                            <div class="row mx-auto">
                                <div class="col-4 ms-2 pe-0"><router-link :to="{path: '/'+ item.category_name+'/'+item.product_name}"><img class="text-center me-3" style="width:50px;height:50px" :src="item.product_img_path" alt="product image"></router-link></div>
                                <div class="col-6 my-auto ps-0 a" style="word-wrap:break-word"><router-link class="link-dark link-underline-opacity-0" :to="{path: '/'+ item.category_name+'/'+item.product_name}">{{item.product_name}}</router-link></div>
                            </div>
                        </div>
                        <div class="col-2 my-auto text-center">
                            <p class="my-auto"><small>{{item.quantity}} {{item.unitDescription}}</small></p>
                        </div>
                        <div class="col-2 my-auto text-center">
                            <p class="my-auto"><small>&#8377 {{item.price}} / {{item.unitDescription}}</small></p>
                        </div>
                        <div class="col-2 my-auto text-center">
                            <p v-if="item.percent_discount" class="my-auto"><small>{{item.percent_discount}}%</small></p>
                            <p v-else class="my-auto"><small>No</small></p>
                        </div>
                        <div class="col-2 my-auto text-center">
                            <p class="my-auto"><small>&#8377 {{item.amount}}</small></p>
                        </div>
                    </div>
                    
                    <div class="row text-center px-5 pt-3 pb-2">
                        <h5><small>Order Total : &#8377 {{order.order_total}}</small></h5>
                    </div>
                </div>
            </div>
            </template>
        </div>

        <div v-else class="row text-center p-5">
            <h5 class = "text-danger">No orders placed yet !</h5>
            <h5>Please check your cart and place order.</h5>
        </div>
    </div>`,
    data(){
        return{
            orders:[],
            any_order_placed:true,
        }
    },
    async mounted(){
        try{
            const res = await fetch(`/api/order`,{
                headers:{
                    "Authentication-Token" : this.$store.getters.get_token,
                },
            });
            const order_data = await res.json();
            if (res.ok){
                this.orders = order_data; 
            }else{
                if (res.status == 404){
                    this.any_order_placed = false;
                }else{
                    console.log(order_data);
                    alert("Something went wrong");
                }
            }
        }catch(err){
            console.error(err);
            alert("Something went wrong.");
        }
    },
}