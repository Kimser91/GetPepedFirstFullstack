<script setup>
import { ref, onMounted, computed } from "vue";
import axios from "../axiosInstance";

const cartItems = ref([]);

const fetchCart = async () => {
  try {
    const response = await axios.get("/cart");
    cartItems.value = response.data;
  } catch (error) {
    console.error("❌ Error fetching cart:", error);
    alert("Feil ved henting av handlekurven.");
  }
};

const removeItem = async (componentId) => {
  try {
    await axios.delete("/cart/remove", { 
      params: { componentId } 
    });
    await fetchCart();
  } catch (error) {
    console.error("❌ Error removing item:", error);
    alert("Feil ved fjerning av vare: " + (error.response?.data?.error || error.message));
  }
};

const clearCart = async () => {
  try {
    await axios.delete("/cart/clear");
    await fetchCart();
  } catch (error) {
    console.error("❌ Error clearing cart:", error);
    alert("Feil ved tømming av handlekurven: " + (error.response?.data?.error || error.message));
  }
};

const checkoutCart = async () => {
  try {
    const token = localStorage.getItem("token"); // 🔹 Hent token

    if (!token) {
      alert("Du må være logget inn for å sjekke ut.");
      return;
    }

    console.log("🔍 Sender checkout-request med token:", token);

    const response = await axios.post("/cart/checkout", {}, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log("✅ Checkout response:", response);

    if (response && response.data) {
      alert(response.data.message || "Bestilling fullført!");

      // 🛍️ Oppdater handlekurven etter checkout
      await fetchCart();
    } else {
      alert("❌ Feil: Tomt svar fra server.");
    }
  } catch (error) {
    console.error("❌ Feil ved checkout:", error);

    if (error.response) {
      console.error("❌ Server respons:", error.response);
      alert("Feil ved utsjekking: " + (error.response.data?.error || error.message));
    } else {
      alert("❌ Kunne ikke kontakte serveren. Sjekk internettforbindelsen.");
    }
  }
};




const totalPrice = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + (Number(item.Price) * Number(item.Quantity)), 0);
});

onMounted(() => {
  fetchCart();
});
</script>


<template>
  <div class="container mt-5">
    <div class="card shadow-sm">
      <div class="card-body">
        <h2 class="text-center text-primary">🛒 Handlekurv</h2>
        <div v-if="cartItems.length === 0" class="alert alert-warning text-center">
          🛍️ Handlekurven er tom.
        </div>
        <div v-else>
          <div v-for="item in cartItems" :key="item.Id" class="cart-item card mb-3">
            <div class="card-body d-flex justify-content-between align-items-center">
              <div>
                <h5 class="card-title">{{ item.Name }}</h5>
                <p class="card-text mb-0">Quantity: {{ item.Quantity }}</p>
                <p class="card-text">Price: ${{ item.Price.toFixed(2) }}</p>
              </div>
              <button @click="removeItem(item.ComponentId)" class="btn btn-danger btn-sm">❌ Remove</button>
            </div>
          </div>
          <div class="total-price alert alert-info text-center">
            🧾 Totalsum: <strong>${{ totalPrice.toFixed(2) }} USD</strong>
          </div>
          <div class="d-flex justify-content-between mt-3">
            <button @click="clearCart" class="btn btn-warning">🗑️ Tøm handlekurv</button>
            <button @click="checkoutCart" class="btn btn-success">✅ Gå til betaling</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cart-item {
  background: #f8f9fa;
  border-radius: 10px;
}

.total-price {
  font-size: 18px;
  font-weight: bold;
}

button {
  font-weight: bold;
}
</style>

