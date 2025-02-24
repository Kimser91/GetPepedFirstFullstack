<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import axios from "../axiosInstance";
import ProductCard from "./ProductCard.vue";

const route = useRoute();
const products = ref([]);
const props = defineProps({
  darkMode: Boolean,
});
const fetchProducts = async (category) => {
  try {
    const response = await axios.get(`http://localhost:3000/Components?type=${category}`);
    products.value = response.data;
  } catch (error) {
    console.error("Feil ved henting av produkter:", error);
  }
};

onMounted(() => {
  fetchProducts(route.params.categoryName);
});

watch(
  () => route.params.categoryName,
  fetchProducts
);
</script>

<template>
  <div class="container mt-4">
    <h1 class="text-center text-primary">Category: {{ route.params.categoryName }}</h1>

    <div v-if="products.length === 0" class="alert alert-warning text-center">
      No Products Found!
    </div>

    <div v-else class="row">
  <div class="col-lg-3 col-md-4 col-sm-6 mb-4" v-for="product in products" :key="product.ID">
    <ProductCard :product="product" :darkMode="darkMode" />
  </div>
</div>
  </div>
</template>

