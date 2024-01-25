export default {
    template:
    `<div>
        <div class="row text-center p-3 mb-2">
            <h4>Summary</h4>
        </div>
        <div class="row p-2">
            <div class="col-4 text-end">
                <h5 class = "d-inline"><small>Total Categories : </small></h5><h5 class = "text-success d-inline"><small>{{summary.total_categories}}</small></h5>
            </div>
            <div class="col-4 text-center">
                <h5 class = "d-inline"><small>Total Products : </small></h5><h5 class = "text-success d-inline"><small>{{summary.total_products}}</small></h5>
            </div>
            <div class="col-4 text-start">
                <h5 class = "d-inline"><small>Total Registered Customers : </small></h5><h5 class = "text-success d-inline"><small>{{summary.total_customers}}</small></h5>
            </div>
        </div>
        <div class="row p-2">
            <div class="col-4 text-end">
                <h5 class = "d-inline"><small>Total Orders : </small></h5><h5 class = "text-success d-inline"><small>{{summary.total_orders}}</small></h5>
            </div>
            <div class="col-4 text-center">
                <h5 class = "d-inline"><small>Total Sales : </small></h5><h5 class = "text-success d-inline"><small>&#8377 {{summary.total_sales}}</small></h5>
            </div>
            <div class="col-4 text-start">
                <h5 class = "d-inline"><small>Total Cart Value : </small></h5><h5 class = "text-success d-inline"><small>&#8377 {{summary.total_cart_value}}</small></h5>
            </div>
        </div>


        <div class="row justify-content-center">
            <div class="col-6">
                <div class="row text-center pt-5 pb-3 m-2">
                    <h4>Weekly Sales Trend</h4>
                </div>
                <div class="row justify-content-center">
                    <img style="width:600px;height:300px" src="/static/sales_trend.png" alt="sales trend bar chart">
                </div>
            </div>
            <div class="col-6">
                <div class="row text-center pt-5 pb-3 m-2">
                    <h4>Weekly Volume Trend</h4>
                </div>
                <div class="row justify-content-center">
                    <img style="width:600px;height:300px" src="/static/volume_trend.png" alt="volume trend bar chart">
                </div>
            </div>
        </div>
        <div class="row text-center pt-5 pb-3 m-2">
            <h4>Downloads</h4>
        </div>
        <div class="row justify-content-center p-2">
            <div class="col-3 text-center">
                <span class="px-2">Sales Data : </span>
                <button @click="download('sales')" class="btn btn-primary">Download as .csv</button>
            </div>
        </div>
        <div class="row justify-content-center p-2">
            <div class="col-3 text-center">
                <span class="px-2">Inventory Data : </span>
                <button @click="download('inventory')" class="btn btn-primary">Download as .csv </button>
                
            </div>
        </div>
        <div class="row justify-content-center p-2">
            <div class="col-3 text-center">
            <span v-if="isWaiting"> downloading...</span>
            </div>
        </div>
        <div class="p-5"></div>
    </div>`,

    data(){
        return{
            summary:null,
            isWaiting:false,
        }
    },
    async beforeMount(){
        try{
            const res = await fetch("/summary",{
                headers:{
                    "Authentication-Token" : this.$store.getters.get_token,
                },
            });
            const summary_data = await res.json();
            if (res.ok){
                this.summary = summary_data; 
            }else{
                alert("Something went wrong.");
            }
        }catch(err){
            console.error(err);
            alert("Something went wrong.");
        }
    },
    methods:{
        async download(data_type){
            this.isWaiting = true
            const res = await fetch("/summary",{
                method: "POST",
                headers:{
                    "Authentication-Token" : this.$store.getters.get_token,
                    "Content-Type" : "application/json",
                    "Accept" : "text/csv"
                },
                body: JSON.stringify({"data" : data_type})
            })
            const data = await res.json();
            if (res.ok){
                const task_id = data.task_id
                const intv = setInterval(async () => {
                    const res = await fetch(`/get_csv/${task_id}`,{
                        headers:{
                            "Authentication-Token" : this.$store.getters.get_token,
                        },
                    })
                    if (res.ok) {
                        this.isWaiting = false
                        clearInterval(intv)
                        const data = res.text();
                    
                        const blob = new Blob([data], { type: 'text/csv' });
                        const urlObject = URL.createObjectURL(blob);
                        const downloadAnchorElement = document.createElement('a');
                        downloadAnchorElement.href = urlObject;
                        downloadAnchorElement.download = `${data_type}.csv`;
                        document.body.appendChild(downloadAnchorElement);
                        downloadAnchorElement.click();
                    }
                  }, 1000)
            }
        },
    }
}