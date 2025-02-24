<script setup>
import { defineProps, defineEmits } from "vue";
import { useRouter } from "vue-router";

const props = defineProps(["darkMode"]);
const emit = defineEmits(["toggle-dark-mode"]);
const router = useRouter();
const goToWelcome = () => {
  router.push("/");
};

</script>

<template>
  <div class="sidebar" :class="{ 'dark-mode': darkMode }">
    <img src="..\assets\img\Logo.webp" alt="Logo" class="logo" @click="goToWelcome" />
    <h2 class="sidebar-title">Categories</h2>
    <div class="SidebarContainer">
      <router-link to="/home" class="MenueOption">All Components</router-link>
      <router-link to="/category/Motherboard" class="MenueOption">Motherboard</router-link>
      <router-link to="/category/CPU" class="MenueOption">CPU</router-link>
      <router-link to="/category/RAM" class="MenueOption">RAM</router-link>
      <router-link to="/category/SSD" class="MenueOption">SSD</router-link>
      <router-link to="/category/GPU" class="MenueOption">GPU</router-link>
      <router-link to="/category/PSU" class="MenueOption">PSU</router-link>
      <router-link to="/category/Case" class="MenueOption">Case</router-link>
    </div>
    <div class="sidebar-footer">
      <router-link to="/about" class="BottomTextOptions">About Us</router-link>
      <router-link to="/contact" class="BottomTextOptions">Contact Us</router-link>
    </div>
  </div>
</template>

<style scoped>

.sidebar {
  width: 180px;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  background-color: #a8a8fc;
  color: white;
  padding: 15px;
}

.sidebar.dark-mode {
  background-color: #1e1e1e;
  color: #ddd;
}

.logo {
  width: 100%;
  cursor: pointer;
  margin-bottom: 15px;
}

.sidebar-title {
  font-size: 1.2rem;
  font-weight: bold;
  text-align: center;
}

.SidebarContainer {
  display: flex;
  flex-direction: column;
}

.MenueOption {
  display: block;
  padding: 10px;
  text-align: center;
  font-weight: bold;
  color: white;
  text-decoration: none;
  background-color: #505050;
  border-radius: 5px;
  margin: 5px 0;
}

.MenueOption:hover {
  background-color: #606060;
}

.sidebar.dark-mode .MenueOption {
  background-color: #333;
  color: #bbb;
}

.sidebar.dark-mode .MenueOption:hover {
  background-color: #444;
}

.sidebar-footer {
  margin-top: auto;
  text-align: center;
}

.BottomTextOptions {
  display: block;
  color: white;
  text-decoration: none;
  padding: 5px;
}

.sidebar.dark-mode .BottomTextOptions {
  color: #bbb;
}

.BottomTextOptions:hover {
  opacity: 0.8;
}
</style>



