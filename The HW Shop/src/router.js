// src/router.js
import { createRouter, createWebHistory } from 'vue-router';
import Home from './components/mainBody.vue';         
import Login from './components/login.vue';         
import ShoppingCart from './components/ShoppingCart.vue';
import About from './components/about.vue';      
import Contact from './components/contact.vue';
import Category from './components/category.vue';
import ProductItem from './components/ProductItem.vue';
import WelcomePage from './components/WelcomePage.vue';

const routes = [
  {
    path: '/',
    name: 'WelcomePage',
    component: WelcomePage
  },
  {
    path: '/home',
    name: 'Home',
    component: Home
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/cart',
    name: 'Cart',
    component: ShoppingCart
  },
  {
    path: '/about',
    name: 'About',
    component: About
  },
  {
    path: '/contact',
    name: 'Contact',
    component: Contact
  },
  {
    path: '/category/:categoryName',
    name: 'Category',
    component: Category,
    props: true
  },
  {
    path: '/product/:id',
    name: 'ProductDetail',
    component: ProductItem,
    props: true
  },
  {
    path: "/admin",
    name: "AdminView",
    component: () => import("./components/adminViewMainBody.vue"),
    meta: { requiresAuth: true, requiresAdmin: true }
  }
  
  
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");

  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!token) {
      next("/login");
    } else {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (to.matched.some((record) => record.meta.requiresAdmin) && !payload.isAdmin) {
        next("/");
      } else {
        next();
      }
    }
  } else {
    next();
  }
});

export default router;
