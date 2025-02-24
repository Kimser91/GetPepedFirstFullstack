<script setup>
import { ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "../axiosInstance";
import { authToken } from "../auth.js";

const route = useRoute();
const router = useRouter();
const product = ref(null);

const fetchProductDetails = async (id) => {
  try {
    const response = await axios.get(`http://localhost:3000/Components?id=${id}`);
    if (response.data && response.data.length > 0) {
      product.value = response.data[0];
    } else {
      product.value = null;
      console.error("No product found with id:", id);
    }
  } catch (error) {
    console.error("Error fetching product details:", error);
  }
};

onMounted(() => {
  fetchProductDetails(route.params.id);
});

watch(
  () => route.params.id,
  (newId, oldId) => {
    if (newId !== oldId) {
      fetchProductDetails(newId);
    }
  }
);

const addToCart = async () => {
  if (!product.value) return;
  if (product.value.inStock === 0) return alert("Not in stock");
  
  if (confirm(`Do you want to add "${product.value.Name}" to your cart?`)) {
    try {
      const token = authToken.value || localStorage.getItem("token");
      await axios.post(
        "http://localhost:3000/cart/add",
        { componentId: product.value.ID, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("✅ Product added to cart!");
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Could not add product to cart.");
    }
  }
};

const goBack = () => {
  router.back();
};
</script>

<template>
  <div class="container my-4">
    <div class="row justify-content-center">
      <div class="col-lg-6">
        <div v-if="!product" class="text-center">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p>Loading Detail Page...</p>
        </div>

        <div v-else class="card shadow-sm">
          <div class="card-body text-center">
            <h2 class="card-title">{{ product.Name }}</h2>
            <p class="card-text"><strong>💰 Price:</strong> ${{ product.Price }}</p>
            <p class="card-text"><strong>🔧 Type:</strong> {{ product.Type }}</p>
            <p
              class="card-text"
              :class="{ 'text-success': product.inStock > 0, 'text-danger': product.inStock === 0 }"
            >
              <strong>📦 In Stock:</strong> {{ product.inStock }}
            </p>
            <div class="d-grid gap-2">
              <button @click="addToCart" class="btn btn-primary">
                🛒 Add To Cart
              </button>
              <button @click="goBack" class="btn btn-secondary">
                🔙 Back
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
  background-color: #ffffff;
  border-radius: 10px;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.card:hover {
  transform: translateY(-3px);
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.2);
}
</style>
