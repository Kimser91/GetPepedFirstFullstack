<script setup>
import leftSidebar from "./components/leftSidebar.vue";
import mainHeader from "./components/mainHeader.vue";
import { ref, onMounted, watch } from "vue";

const darkMode = ref(localStorage.getItem("darkMode") === "true");

const toggleDarkMode = () => {
  darkMode.value = !darkMode.value;
};

watch(darkMode, (newMode) => {
  document.body.setAttribute("data-bs-theme", newMode ? "dark" : "light");
  localStorage.setItem("darkMode", newMode);
});

onMounted(() => {
  document.body.setAttribute("data-bs-theme", darkMode.value ? "dark" : "light");
});
</script>

<template>
  <div class="d-flex" :class="{ 'dark-mode': darkMode }">
    <leftSidebar :darkMode="darkMode" />
    <div class="content flex-grow-1">
      <mainHeader :darkMode="darkMode" @toggle-dark-mode="toggleDarkMode" />
      <div class="mainBody flex-grow-1" :class="{ 'dark-mode': darkMode }">
        <router-view v-slot="{ Component }">
          <component :is="Component" :darkMode="darkMode" />
        </router-view>
      </div>
    </div>
  </div>
</template>


<style scoped>
.content {
  margin-left: 180px;
  width: calc(100% - 180px);
}

.header {
  background-color: #a8a8fc;
  height: 60px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
}

.mainBody {
  flex-grow: 1;
  min-height: calc(100vh - 60px);
  background-color: rgb(123, 123, 213);
  overflow: auto;
}

.dark-mode .header {
  background-color: #232354;
}

.dark-mode .mainBody {
  background-color: #1a1a3d;
}
</style>



