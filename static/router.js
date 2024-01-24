import Home from "./components/Home.js"
import Login from "./components/Login.js"
import SignUp from "./components/SignUp.js"
import AddProduct from "./components/AddProduct.js"
import EditProduct from "./components/EditProduct.js"
import AddStock from "./components/AddStock.js"
import EditStock from "./components/EditStock.js"
import AddCategory from "./components/AddCategory.js"
import Category from "./components/Category.js"
import EditCategory from "./components/EditCategory.js"
import Product from "./components/Product.js"
import Cart from "./components/Cart.js"
import Orders from "./components/Orders.js"
import ChangePassword from "./components/ChangePassword.js"
import FilteredSearch from "./components/FilteredSearch.js"
import ManagerDashboard from "./components/ManagerDashboard.js"
import AddManager from "./components/AddManager.js"
import Managers from "./components/Managers.js"
import Requests from "./components/Requests.js"

const routes = [ 
    {path: "/", component: Home, name: "Home"},
    {path: "/login", component: Login, name:"Login"},
    {path: "/sign_up", component: SignUp, name:"Sign Up"},
    {path: "/category/:ctg_name/add_product", component: AddProduct, name:"Add Product"},
    {path: "/:ctg_name/product/:prod_name/edit", component: EditProduct, name:"Edit Product"},
    {path: "/:ctg_name/:prod_name/add_stock", component: AddStock, name:"Add Stock"},
    {path: "/:ctg_name/:prod_name/edit_stock/:stock_id", component: EditStock, name:"Edit Stock"},
    {path: "/category/add", component: AddCategory, name:"Add Category"},
    {path: "/category/:ctg_name", component: Category, name:"Category Page"},
    {path: "/category/:ctg_name/edit", component: EditCategory, name:"Edit Category"},
    {path: "/:ctg_name/:prod_name", component: Product, name:"Product Page"},
    {path: "/cart", component: Cart, name:"Cart"},
    {path: "/orders", component: Orders, name:"Orders"},
    {path: "/change_password", component: ChangePassword, name:"Change Password"},
    {path: "/filtered_search", component: FilteredSearch, name:"Search"},
    {path: "/manager_dashboard", component: ManagerDashboard, name:"Dashboard"},
    {path: "/add_manager", component: AddManager, name:"Add Manager"},
    {path: "/managers", component: Managers, name:"Managers"},
    {path: "/requests", component: Requests, name:"Requests"},

]

export default new VueRouter({
    routes,
})