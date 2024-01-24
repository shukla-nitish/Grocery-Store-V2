import CtgProd from "./CtgProd.js";
import AdminDashboard from "./AdminDashboard.js";

export default {
    template: 
    `<div>
        <CtgProd :role="role" v-if="role!='admin'"/>
        <AdminDashboard v-else />
    </div>`,

    data(){
        return{
            
        };
    },
    components:{
        CtgProd,
        AdminDashboard,
    },
    computed:{
        role(){
            return this.$store.getters.get_role;
        },
    }

}