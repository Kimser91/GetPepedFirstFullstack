<script setup>
import { computed, ref, watchEffect } from "vue";
import { useRouter } from "vue-router";
import { authToken } from "../auth.js";
import { jwtDecode } from "jwt-decode";

const props = defineProps(["darkMode"]);
const emit = defineEmits(["toggle-dark-mode"]);
const router = useRouter();
const searchQuery = ref("");
const isAuthenticated = computed(() => !!authToken.value);
const username = ref(null);

watchEffect(() => {
  if (authToken.value) {
    try {
      const decoded = jwtDecode(authToken.value);
      username.value = decoded.username || "Ukjent bruker";
    } catch (error) {
      console.error("Feil ved dekoding av JWT:", error);
      username.value = null;
    }
  } else {
    username.value = null;
  }
});

const handleSearch = () => {
  router.push({ name: "Home", query: { search: searchQuery.value } });
};

const handleAuthAction = () => {
  if (isAuthenticated.value) {
    localStorage.removeItem("token");
    authToken.value = null;
    router.push({ name: "Home" });
  } else {
    router.push({ name: "Login" });
  }
};

const goToCart = () => {
  router.push({ name: "Cart" });
};
</script>

<template>
  <header class="header d-flex align-items-center justify-content-between px-3">
    <div class="fw-bold"></div>
    <div class="search-container d-flex align-items-center">
      <input
        type="text"
        v-model="searchQuery"
        @keyup.enter="handleSearch"
        placeholder="Search..."
        class="form-control me-2"
      />
      <button @click="handleSearch" class="btn btn-outline-primary">🔍</button>
    </div>
    <div class="actions d-flex align-items-center">
      <button @click="handleAuthAction" class="btn btn-outline-primary me-2">
        {{ isAuthenticated ? username : "Sign In/Register" }}
      </button>
      <button @click="goToCart" class="btn btn-outline-secondary me-3">🛒 Cart</button>
      <div class="form-check form-switch">
        <input
          class="form-check-input" type="checkbox" id="darkModeToggle" :checked="props.darkMode" @change="$emit('toggle-dark-mode')" />
        <label class="form-check-label ms-1" for="darkModeToggle">
          {{ props.darkMode ? "🌙 Dark Mode" : "☀️ Light Mode" }}
        </label>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header {
  height: 60px;
  background-color: var(--bs-body-bg);
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
}

.search-container {
  flex-grow: 1;
  max-width: 400px;
}
</style>


