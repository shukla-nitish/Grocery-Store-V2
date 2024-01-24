export default {
    template:
    `<div class = "container-fluid">
        <div class="row justify-content-center">
            <div class="col-4 pt-0">
                <form v-on:submit.prevent="edit_stock" method="post">
                    <h3 class="text-center pt-2 pb-1">Edit Stock</h3>
                    <div class="row justify-content-center p-1">
                        <div class="col-auto my-auto">
                            <img style="width:60px;height:60px" :src="prod.img_path" alt="product image">
                        </div>
                        <div class="col-auto my-auto">
                            <h5>{{prod.name}}</h5>
                        </div>
                    </div>
                    <div class="mt-2 py-1 px-2 row">
                        <div class="col-4 px-0 pe-2">
                            <label for="qty" class="form-label ms-3">Quantity</label>
                            <div class="input-group input-group-sm">
                                <input type="number" class="form-control form-control-sm" id="qty" name = "qty" value = {{stock.quantity}} v-model="qty">
                                <div class="input-group-text">{{prod.unitDescription}}</div>
                            </div>
                        </div>
                        <div class="col-4 px-0 pe-2 ">
                            <label for="price" class="form-label ms-3">Price</label>
                            <div class="input-group input-group-sm">
                                <div class="input-group-text">&#8377</div>
                                <input type="number" step = "0.01" class="form-control" id="price" name = "price" value = {{stock.price}} v-model="price">
                            </div>
                        </div>
                        <div class="col-4 px-0">
                            <label for="threshold" class="form-label ms-3">Threshold</label>
                            <input type="number" class="form-control form-control-sm" id="threshold" name = "threshold" value={{stock.threshold}} v-model="threshold">
                        </div>
                    </div>
                    <div class="mt-2 py-1 px-2 row">
                        <div class = "col-6 px-0 pe-2" >
                            <label for="mfd" class="form-label ms-3">Manufacturing Date</label>
                            <input type="date" class="form-control form-control-sm" id="mfd" name="mfd" value = {{stock.mfd}} v-model="mfd">
                        </div>
                        <div class="col-6 px-0">
                            <label for="expiry" class="form-label ms-3">Expiry period</label>
                            <div class="input-group input-group-sm">
                                <input type="number" id="expiry" class="form-control" name = "exp_period_value" value = "{{stock.expiry_days}}" min="1" v-model="exp_period_value">
                                <select class="form-select text-bg-light form-select-sm" name = "exp_period_type" v-model="exp_period_type">
                                    <option selected>Days</option>
                                    <option>Years</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div class="mt-3 pt-3 pb-5 text-center">
                        <button type="submit" class="btn btn-primary px-4">Submit</button>
                    </div>
                </form>
            </div>
        </div>
    </div>`,

    data(){
        return{
            prod_name: this.$route.params.prod_name,
            ctg_name:this.$route.params.ctg_name,
            stock_id:this.$route.params.stock_id,
            prod:null,
            stock:null,
            qty:null,
            price:null,
            mfd:null,
            threshold:null,
            exp_period_value:null,
            exp_period_type:null,
        }
    },
    async mounted(){
        try{
            const res = await fetch(`/api/${this.ctg_name}/products/${this.prod_name}`);
            const prod_data = await res.json();
            if (res.ok){
                this.prod=prod_data;
            }else{
                this.$router.push(`/${this.ctg_name}/product/${this.prod_name}/edit`);
                console.log(prod_data.message);
            }
        }catch(err){
            console.error(err);
            alert("Something went wrong.");
        }
        try{
            const res = await fetch(`/api/stock/${this.prod_name}/${this.stock_id}`);
            const stock_data = await res.json();
            if (res.ok){
                this.stock=stock_data;
            }else{
                console.log(stock_data.message);
            }
        }catch(err){
            console.error(err);
            alert("Something went wrong.");
        }
    },
    computed:{
        exp_days(){
            if (this.exp_period_type == "Days"){
                return this.exp_period_value ? this.exp_period_value*1 : 0;
            }else if(this.exp_period_type == "Years"){
                return this.exp_period_value ? this.exp_period_value*365 : 0;
            }else{
                return 0;
            }
        },
    },
    methods:{
        async edit_stock(){
            if(this.qty || this.price || this.mfd || this.threshold || this.exp_days){
                const stock = {};
                if(this.qty){stock["qty"] = this.qty};
                if(this.price){stock["price"] = this.price};
                if(this.mfd){stock["mfd"] = this.mfd};
                if(this.threshold){stock["threshold"] = this.threshold};
                if(this.exp_days){stock["expiry_days"] = this.exp_days};
                try{
                    const res = await fetch(`/api/stock/${this.prod_name}/${this.stock_id}`,{
                        method: "PUT",
                        headers:{
                            "Authentication-Token" : this.$store.getters.get_token,
                            "Content-Type" : "application/json",
                        },
                        body: JSON.stringify(stock),
                    })

                    const data = await res.json();
                    
                    if (res.ok){
                        this.$router.push(`/${this.ctg_name}/product/${this.prod_name}/edit`);
                    }else{
                        console.log(data.message)
                        alert(data.message)
                    }
                    }catch(err){
                        console.error(err);
                        alert("Something went wrong.");
                    }
            }else{
                alert("Please fill out one of the fields to edit stock.");
            }
        }
    }
}