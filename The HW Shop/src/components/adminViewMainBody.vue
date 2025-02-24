<script setup>
import { ref, onMounted } from "vue";
import axios from "../axiosInstance";

const activeTab = ref("users");
const users = ref([]);
const newUser = ref({ username: "", email: "", password: "", isAdmin: false });
const editingUser = ref(null);
const products = ref([]);
const newProduct = ref({ name: "", type: "", price: 0, inStock: 0 });
const editingProduct = ref(null);

const fetchUsers = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get("/admin/users", { headers: { Authorization: `Bearer ${token}` } });
    users.value = response.data;
  } catch (error) {
    console.error("Feil ved henting av brukere:", error);
  }
};

const fetchProducts = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get("/admin/products", { headers: { Authorization: `Bearer ${token}` } });
    products.value = response.data;
  } catch (error) {
    console.error("Feil ved henting av produkter:", error);
  }
};

const addUser = async () => {
  try {
    const token = localStorage.getItem("token");
    await axios.post("/admin/users", newUser.value, { headers: { Authorization: `Bearer ${token}` } });
    fetchUsers();
    newUser.value = { username: "", email: "", password: "", isAdmin: false };
  } catch (error) {
    console.error("Feil ved oppretting av bruker:", error);
  }
};

const updateUser = async (user) => {
  try {
    const token = localStorage.getItem("token");
    await axios.put(`/admin/users/${user.Id}`, user, {
      headers: { Authorization: `Bearer ${token}` }
    });
    editingUser.value = null;
    fetchUsers();
  } catch (error) {
    console.error("❌ Feil ved oppdatering av bruker:", error);
  }
};

const deleteUser = async (id) => {
  if (!confirm("Er du sikker på at du vil slette denne brukeren?")) return;
  try {
    const token = localStorage.getItem("token");
    await axios.delete(`/admin/users/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    fetchUsers();
  } catch (error) {
    console.error("Feil ved sletting av bruker:", error);
  }
};

const addProduct = async () => {
  try {
    const token = localStorage.getItem("token");
    await axios.post("/admin/products", newProduct.value, { headers: { Authorization: `Bearer ${token}` } });
    fetchProducts();
    newProduct.value = { name: "", type: "", price: 0, inStock: 0 };
  } catch (error) {
    console.error("Feil ved oppretting av produkt:", error);
  }
};

const updateProduct = async () => {
  if (!editingProduct.value || !editingProduct.value.Id) {
    alert("❌ Feil: Alle felter må fylles ut!");
    return;
  }

  try {
    const token = localStorage.getItem("token");
    await axios.put(`/admin/products/${editingProduct.value.Id}`, editingProduct.value, {
      headers: { Authorization: `Bearer ${token}` },
    });

    fetchProducts();
    editingProduct.value = null;
    alert("✅ Produkt oppdatert!");
  } catch (error) {
    console.error("❌ Feil ved oppdatering av produkt:", error);
    alert("Feil ved oppdatering av produkt.");
  }
};

const deleteProduct = async (id) => {
  if (!confirm("Er du sikker på at du vil slette dette produktet?")) return;
  try {
    const token = localStorage.getItem("token");
    await axios.delete(`/admin/products/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    fetchProducts();
  } catch (error) {
    console.error("Feil ved sletting av produkt:", error);
  }
};

const startEditingUser = (user) => {
  editingUser.value = { ...user };
};

const startEditingProduct = (product) => {
  editingProduct.value = { ...product };
};

onMounted(() => {
  fetchUsers();
  fetchProducts();
});
</script>

<template>
  <div class="container my-4">
    <ul class="nav nav-tabs">
      <li class="nav-item">
        <button class="nav-link" :class="{ active: activeTab === 'users' }" @click="activeTab = 'users'">
          Users
        </button>
      </li>
      <li class="nav-item">
        <button class="nav-link" :class="{ active: activeTab === 'products' }" @click="activeTab = 'products'">
          Products
        </button>
      </li>
    </ul>

    <div v-if="activeTab === 'users'" class="mt-4">
      <h2>User Management</h2>
      <table class="table table-striped">
        <thead>
          <tr><th>Username</th><th>Email</th><th>Admin</th><th>Actions</th></tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.Id">
            <td>{{ user.Username }}</td>
            <td>{{ user.Email }}</td>
            <td>{{ user.IsAdmin ? 'Yes' : 'No' }}</td>
            <td>
              <button class="btn btn-primary btn-sm" @click="startEditingUser(user)">Edit</button>
              <button class="btn btn-danger btn-sm" @click="deleteUser(user.Id)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>

      <button class="btn btn-success" @click="addUser">Add New User</button>
      
      <div v-if="editingUser" class="mt-4">
        <h3>Edit User</h3>
        <input v-model="editingUser.Username" class="form-control mb-2" placeholder="Username" />
        <input v-model="editingUser.Email" class="form-control mb-2" placeholder="Email" />
        <div class="form-check">
          <input type="checkbox" class="form-check-input" v-model="editingUser.IsAdmin" />
          <label class="form-check-label">Admin</label>
        </div>
        <button class="btn btn-primary mt-2" @click="updateUser(editingUser)">Save</button>
        <button class="btn btn-secondary mt-2" @click="editingUser = null">Cancel</button>
      </div>
    </div>

    <div v-if="activeTab === 'products'" class="mt-4">
      <h2>Product Management</h2>
      <table class="table table-striped">
        <thead>
          <tr><th>Name</th><th>Type</th><th>Price</th><th>Stock</th><th>Actions</th></tr>
        </thead>
        <tbody>
          <tr v-for="product in products" :key="product.Id">
            <td>{{ product.Name }}</td>
            <td>{{ product.Type }}</td>
            <td>${{ product.Price }}</td>
            <td>{{ product.inStock }}</td>
            <td>
              <button class="btn btn-primary btn-sm" @click="startEditingProduct(product)">Edit</button>
              <button class="btn btn-danger btn-sm" @click="deleteProduct(product.Id)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>

      <button class="btn btn-success" @click="addProduct">Add New Product</button>
      
      <div v-if="editingProduct" class="mt-4">
        <h3>Edit Product</h3>
        <input v-model="editingProduct.Name" class="form-control mb-2" placeholder="Name" />
        <input v-model="editingProduct.Type" class="form-control mb-2" placeholder="Type" />
        <input v-model="editingProduct.Price" type="number" class="form-control mb-2" placeholder="Price" />
        <input v-model="editingProduct.inStock" type="number" class="form-control mb-2" placeholder="Stock" />
        <button class="btn btn-primary" @click="updateProduct">Save</button>
        <button class="btn btn-secondary" @click="editingProduct = null">Cancel</button>
      </div>
    </div>
  </div>
</template>
