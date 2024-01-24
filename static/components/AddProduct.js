export default {
    template: 
    `<div class = "container-fluid">
        <div class="row justify-content-center">
            <div class="col-5 pt-0">
                <form v-on:submit.prevent="add_product" method="post" enctype="multipart/form-data">
                    <h3 class="text-center pt-2 mb-4">Add Product</h3>
                    <div class="mt-2 py-1 px-2 row">
                        <label for="inputCateogry" class="form-label">Select Category</label>
                        <select id="inputCategory" class="form-select form-select-sm text-bg-light" name = "category" v-model="prod_cred.category" required>
                            <option selected>{{ctg_name}}</option>
                            <template v-for="ctg in categories">
                                <option v-if="ctg.name!=ctg_name && ctg.is_approved">{{ctg.name}}</option>
                            </template>
                        </select>
                    </div>
                    <div class="mt-2 py-1 px-2 row">
                        <div class = "col-5 px-0 pe-2" >
                            <label for="prod_name" class="form-label ms-3">Name</label>
                            <input type="text" class="form-control form-control-sm" id="prod_name" name = "prod_name" v-model="prod_cred.name" placeholder="Enter product name here" required>
                        </div>
                        <div class="col-7 px-0 ">
                            <label for="prod_desc" class="form-label ms-3">Description</label>
                            <input type="text" class="form-control form-control-sm" id="prod_desc" name = "prod_desc" v-model = "prod_cred.description" placeholder="Enter product description here" required>
                        </div>
                    </div>
                    <div class="mt-2 py-1 px-2 row">
                        <div class = "col-4 px-0 pe-2" >
                            <label for="unit" class="form-label ms-3">Unit</label>
                            <input type="text" class="form-control form-control-sm" id="unit" name = "unit" v-model="prod_cred.unitDescription" placeholder="Enter here" required>
                        </div>
                        <div class="col-4 px-0 pe-2">
                            <label for="qty" class="form-label ms-3">Quantity</label>
                            <input type="number" class="form-control form-control-sm" id="qty" name = "qty" v-model="qty" placeholder="Enter here" required>
                        </div>
                        <div class="col-4 px-0 ">
                            <label for="price" class="form-label ms-3">Price</label>
                            <div class="input-group input-group-sm">
                                <div class="input-group-text">&#8377</div>
                                <input type="number" step = "0.01" class="form-control" id="price" name = "price" v-model="price" placeholder="Enter here" required>
                            </div>
                        </div>
                    </div>
                    <div class="mt-2 py-1 px-2 row">
                        <div class = "col-4 px-0 pe-2" >
                            <label for="mfd" class="form-label ms-3">Manufacturing Date</label>
                            <input type="date" class="form-control form-control-sm" id="mfd" name="mfd" v-model="mfd" required>
                        </div>
                        <div class="col-4 px-0 pe-2">
                            <label for="expiry" class="form-label ms-3">Expiry period</label>
                            <div class="input-group input-group-sm">
                                <input type="number" id="expiry" class="form-control" name = "exp_period_value" v-model="exp_period_value" value = "1" min="1" required>
                                <select class="form-select text-bg-light form-select-sm" name = "exp_period_type" v-model="exp_period_type" required>
                                    <option selected>Days</option>
                                    <option>Years</option>
                                </select>
                            </div>
                        </div>
                        <div class="col-4 px-0">
                            <label for="threshold" class="form-label ms-3">Threshold</label>
                            <input type="number" class="form-control form-control-sm" id="threshold" name = "threshold" v-model="threshold" placeholder="Enter here" required>
                        </div>
                    </div>
                    <div class="my-2 py-1 px-2 row">
                        <label class="form-label mb-1">Upload image</label>
                        <p v-if="wrong_img_format" class="m-0 mx-2 p-0 text-danger"><small>Chosen file format is not correct!</small></p>
                        <p class="mt-0 mx-2 mb-1 p-0"><small>(allowed formats: .jpg, .png, .jpeg)</small></p>
                        <input class="form-control form-control-sm" type="file" name = "prod_img" @change="upload_img" required>
                    </div>
                    <div class="mt-3 pt-3 pb-5 text-center">
                        <button type="submit" value = "Upload" class="btn btn-primary px-4">Submit</button>
                    </div>
                </form>
            </div>
        </div>
    </div>`,

    data(){
        return{
            ctg_name: this.$route.params.ctg_name,
            categories:null,
            prod_cred:{
                category: null,
                name: null,
                description: null,
                unitDescription: null,
                img:null,
            },

            mfd: null,
            qty: null,
            price: null,
            threshold: null,
            exp_period_value: null,
            exp_period_type: null,
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
                this.categories = ctg_data
            }else{
                this.$router.push("/");
                console.log(ctg_data.message);
            }
        }catch(err){
            console.log(err);
            alert("Something went wrong.");
        }
    },
    computed: {
        expiry_days(){
            if (this.exp_period_type == "Days"){
                return this.exp_period_value*1;
            }else if(this.exp_period_type == "Years"){
                return this.exp_period_value*365;
            }
        },
        wrong_img_format(){
            if(this.prod_cred.img){
                const ALLOWED_EXTENSIONS = ['png', 'jpg', 'jpeg'];
                const filename = this.prod_cred.img.name;
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
        async add_product(){
            if (!this.wrong_img_format){
                const formData = new FormData();
                formData.append('category', this.prod_cred.category);
                formData.append("name",this.prod_cred.name);
                formData.append("description",this.prod_cred.description);
                formData.append("unitDescription",this.prod_cred.unitDescription);
                formData.append("img",this.prod_cred.img);

                try{
                    const res = await fetch(`/api/${this.ctg_name}/products`,{
                        method: "POST",
                        headers:{
                            "Authentication-Token" : this.$store.getters.get_token,
                        },
                        body: formData,
                    });
                    const prod_data = await res.json();
                    if(res.ok){
                        try{
                            const res = await fetch(`/api/stock/${this.prod_cred.name}`,{
                                method: "POST",
                                headers:{
                                    "Authentication-Token" : this.$store.getters.get_token,
                                    "Content-Type" : "application/json",
                                },
                                body: JSON.stringify(
                                    {mfd:this.mfd,
                                     expiry_days: this.expiry_days,
                                     qty:this.qty,
                                     price:this.price,
                                     threshold:this.threshold}),
                            });
                            const stock_data = await res.json();
                            if(res.ok){
                                $router.push(`/category/${this.prod_cred.category}`);
                                console.log("prod_added");
                            }else{
                                console.log(stock_data.message);
                            }
                        }catch(err){
                            console.log(err);
                            alert("Something went wrong.");
                        }
                    }else{
                        console.log(prod_data.message);
                    }
                }catch(err){
                    console.log(err);
                    alert("Something went wrong.");
                }
            }
        },
        upload_img(event){
            this.prod_cred.img = event.target.files[0];
        }
    }
}