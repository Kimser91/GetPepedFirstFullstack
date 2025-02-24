<script setup>
import { defineProps, reactive, ref, watch } from "vue";
import axios from "../axiosInstance";
import ToastNotification from "./ToastNotification.vue";


const props = defineProps({
  product: Object,
  darkMode: Boolean,
});

const productData = reactive({ ...props.product });

watch(
  () => props.product,
  (newVal) => {
    Object.assign(productData, newVal);
  }
);

const toastRef = ref(null);

const addToCart = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to add to cart.");
      return;
    }

    if (!productData?.ID) {
      console.error("Product ID is missing.");
      alert("Product ID is missing.");
      return;
    }

    await axios.post(
      "/cart/add",
      {
        componentId: productData.ID,
        quantity: 1
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    const response = await axios.get(`/Components?id=${productData.ID}`);
    if (response.data && response.data.length > 0) {
      console.log("🔄 Oppdatert inStock fra server:", response.data[0].inStock);
      productData.inStock = response.data[0].inStock ?? productData.inStock;
    } else {
      console.error("⚠️ Kunne ikke oppdatere lagerstatus, backend returnerte ingen data.");
    }

    if (toastRef.value) {
      toastRef.value.show();
    }
  } catch (error) {
    console.error("❌ Feil ved legging til i handlekurven:", error);
    alert("Kunne ikke legge varen til i handlekurven.");
  }
};

</script>

<template>
  <div class="card custom-card shadow-sm" :class="{ 'bg-dark text-white': darkMode }">
    <router-link
      :to="{ name: 'ProductDetail', params: { id: productData.ID } }"
      class="text-decoration-none flex-grow-1"
    >
      <div class="card-body d-flex flex-column text-center">
        <h5 class="card-title product-name" :class="{ 'text-white': darkMode, 'text-dark': !darkMode }">
          {{ productData.Name }}
        </h5>
        <p class="card-text price" :class="{ 'text-white': darkMode, 'text-dark': !darkMode }">
          💰 Price: <strong>${{ productData.Price }}</strong>
        </p>
        <p class="card-text stock" 
           :class="{
             'text-success': productData.inStock > 0,
             'text-danger': productData.inStock === 0,
             'text-white': darkMode,
             'text-dark': !darkMode
           }">
          🏪 In stock: <strong>{{ productData.inStock ?? 'N/A' }}</strong>
        </p>
      </div>
    </router-link>
    <div class="card-footer text-center" :class="{ 'bg-secondary text-white': darkMode }">
      <button 
        @click="addToCart" 
        class="btn w-100" 
        :class="darkMode ? 'btn-outline-light' : 'btn-primary'"
      >
        Add To Cart
      </button>
    </div>
    <ToastNotification ref="toastRef" message="✅ Product added to cart!" />
  </div>
</template>

<style scoped>
.custom-card {
  max-width: 18rem;
  height: 250px;
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  background-color: rgb(100, 100, 255);
}

.custom-card:hover {
  transform: translateY(-3px);
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.2);
}

.card-body {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.bg-dark {
  background-color: #333 !important;
}
.bg-secondary {
  background-color: #6c6c6c !important;
}
.text-white {
  color: white !important;
}
.text-dark {
  color: black !important;
}
.btn-outline-light {
  border: 1px solid white !important;
  color: white !important;
}
</style>

