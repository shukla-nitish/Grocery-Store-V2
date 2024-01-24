export default {
    template:
    `<div class = "container-fluid">
        <div class="row justify-content-center">
            <div class="col-3 pt-0">
                <form v-on:submit.prevent="add_category" method="post" enctype="multipart/form-data">
                    <h3 class="text-center pt-2 mb-4">Add Category</h3>
                    <div class="mt-4 py-3 px-2 row">
                        <label for="category_name" class="form-label">Name</label>
                        <input type="text" class="form-control" id="category_name" name = "name" placeholder="Enter category name here" v-model="name" required>
                    </div>
                    <div class="my-1 py-1 px-2 row">
                        <label for="formFile" class="form-label mb-1">Upload image</label>

                        <p v-if="wrong_img_format" class="m-0 mx-2 p-0 text-danger"><small>Chosen file format is not correct!</small></p>

                        <p class="mt-0 mx-2 mb-1 p-0"><small>(allowed formats: .jpg, .png, .jpeg)</small></p>
                        <input class="form-control" type="file" id="formFile" name = "ctg_img" @change="upload_img" required>
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
            name:null,
            img:null,
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
        async add_category(){
            if (!this.wrong_img_format){
                const formData = new FormData();
                formData.append("name",this.name);
                formData.append("img",this.img);

                try{
                    const res = await fetch(`/api/category`,{
                        method: "POST",
                        headers:{
                            "Authentication-Token" : this.$store.getters.get_token,
                        },
                        body: formData,
                    });
                    const data = await res.json();
                    if(res.ok){
                        this.$router.push("/");
                    }else{
                        console.log(data.message);
                        alert(data.message);
                    }
                }catch(err){
                    console.log(err);
                    alert("Something went wrong.");
                }
            }
        },
    }
}