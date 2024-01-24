export default {
    template:
    `<div class = "container-fluid">
        <div class="row justify-content-center">
            <div class="col-3 pt-0">
                <form v-on:submit.prevent="edit_category" method="post" enctype="multipart/form-data">
                    <h3 class="text-center pt-2 mb-4">Edit Category</h3>
                    <div class="row justify-content-center p-1">
                        <div class="col-auto my-auto">
                            <img style="width:50px;height:50px" :src="ctg.img_path" alt="category image">
                        </div>
                        <div class="col-auto my-auto">
                            <h4>{{ctg.name}}</h4>
                        </div>
                    </div>
                    <div class="mt-1 py-3 px-2 row">
                        <label for="category_name" class="form-label">Name</label>
                        <input type="text" class="form-control" id="category_name" name = "name" placeholder="Enter category name here" v-model="name">
                    </div>
                    <div class="my-1 py-1 px-2 row">
                        <label for="formFile" class="form-label mb-1">Upload image</label>
                        <p v-if="wrong_img_format" class="m-0 mx-2 p-0 text-danger"><small>Chosen file format is not correct!</small></p>
                        <p class="mt-0 mx-2 mb-1 p-0"><small>(allowed formats: .jpg, .png, .jpeg)</small></p>
                        <input class="form-control" type="file" id="formFile" name = "ctg_img" @change="upload_img" >
                    </div>
                    <div class="mt-3 pt-3 text-center">
                        <button type="submit" value = "Upload" class="btn btn-primary px-4">Submit</button>
                    </div>
                </form>
            </div>
        </div>
    </div>`,

    data(){
        return{
            ctg_name:this.$route.params.ctg_name,
            ctg:null,
            name:null,
            img:null,
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
                this.ctg = ctg_data; 
            }else{
                console.log(ctg_data.message);
                alert(ctg_data.message);
            }
        }catch(err){
            console.error(err);
            alert("Something went wrong.");
        }
    },
    computed:{
        wrong_img_format(){
            if(this.img){
                const ALLOWED_EXTENSIONS = ['png', 'jpg', 'jpeg'];
                const filename = this.img.name;
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
        upload_img(event){
            this.img = event.target.files[0];
        },
        async edit_category(){
            if(this.name || this.img){
                if (!this.wrong_img_format){
                    const formData = new FormData();
                    if(this.name){formData.append("name",this.name);};
                    if(this.img){formData.append("img",this.img);};

                    try{
                        const res = await fetch(`/api/category/${this.ctg_name}`,{
                            method: "PUT",
                            headers:{
                                "Authentication-Token" : this.$store.getters.get_token,
                            },
                            body: formData,
                        });
                        const ctg_data = await res.json();
                        if(res.ok){
                            alert("Request sent for Approval from admin")
                            this.$router.push(`/category/${this.ctg_name}`)
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
            }else{
                alert("Please fill out one of the fields to edit category.");
            }
        }
    }
}