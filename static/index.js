import router from "./router.js"
import Navbar from "./components/Navbar.js"
import Banner from "./components/Banner.js"
import store from "./vuex.js"


new Vue({
    el : "#app",
    template:  
    `<div>
        <Banner />
        <Navbar />
        <router-view :key='rerender'/>
    </div>`,
    router,
    store,
    components : {
        Banner,
        Navbar,
    },
    data(){
        return{
            rerender:false,
        }
    },
    watch: {
        $route: {
            immediate: true,
            handler(to, from) {
                document.title = to.name;
            }
        },
    },
    methods:{
        forceRerender(){
            this.rerender=!this.rerender;
        }
    }
})