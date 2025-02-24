<script setup>
import { defineProps, ref, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import axios from "../axiosInstance";
import ProductCard from "./ProductCard.vue";

const props = defineProps({ darkMode: Boolean });
const route = useRoute();
const products = ref([]);

const fetchProducts = async () => {
  try {
    const searchTerm = route.query.search || "";
    let url = "http://localhost:3000/Components";
    if (searchTerm) {
      url += `?search=${encodeURIComponent(searchTerm)}`;
    }
    const response = await axios.get(url);
    products.value = response.data;
  } catch (error) {
    console.error("Feil ved henting av produkter:", error);
  }
};

onMounted(() => {
  fetchProducts();
});

watch(() => route.query.search, fetchProducts);

</script>

<template>
  <div class="container mt-4">
    <h2 class="text-center mb-4">
      {{ route.query.search ? "Search Results" : "All Components" }}
    </h2>
    <div v-if="products.length === 0" class="alert alert-warning text-center">
      No products found.
    </div>
    <div v-else class="row">
      <div class="col-lg-3 col-md-4 col-sm-6 mb-4" v-for="product in products" :key="product.ID">
        <ProductCard :product="product" :darkMode="props.darkMode" />
      </div>
    </div>
  </div>
</template>

