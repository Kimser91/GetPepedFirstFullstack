<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import axios from "../axiosInstance";
import { authToken } from "../auth.js";

const router = useRouter();
const loginData = ref({ username: "", password: "" });
const registerData = ref({ username: "", email: "", password: "" });
const errorMessage = ref("");
const registerMessage = ref("");

const handleLogin = async () => {
  try {
    const response = await axios.post("/login", loginData.value);
    
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      authToken.value = response.data.token;
      const payload = JSON.parse(atob(response.data.token.split(".")[1]));
      if (payload.isAdmin) {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } else {
      errorMessage.value = "Ugyldig innloggingsrespons.";
    }
  } catch (error) {
    errorMessage.value = error.response?.data || "Feil brukernavn eller passord";
  }
};

const handleRegister = async () => {
  try {
    await axios.post("/register", registerData.value);
    registerMessage.value = "✅ Registrering vellykket! Logg inn.";
    registerData.value = { username: "", email: "", password: "" };
  } catch (error) {
    registerMessage.value = "❌ Feil ved registrering.";
    console.error("Feil ved registrering:", error);
  }
};
</script>

<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card shadow-sm">
          <div class="card-body">
            <h2 class="text-center text-primary">Login</h2>
            <form @submit.prevent="handleLogin">
              <div class="mb-3">
                <label class="form-label">Username</label>
                <input type="text" v-model="loginData.username" class="form-control" required />
              </div>
              <div class="mb-3">
                <label class="form-label">Password</label>
                <input type="password" v-model="loginData.password" class="form-control" required />
              </div>
              <button type="submit" class="btn btn-primary w-100">Login</button>
            </form>
            <div v-if="errorMessage" class="alert alert-danger mt-3">{{ errorMessage }}</div>
          </div>
        </div>
      </div>

      <div class="col-md-6">
        <div class="card shadow-sm">
          <div class="card-body">
            <h2 class="text-center text-secondary">Register</h2>
            <form @submit.prevent="handleRegister">
              <div class="mb-3">
                <label class="form-label">Username</label>
                <input type="text" v-model="registerData.username" class="form-control" required />
              </div>
              <div class="mb-3">
                <label class="form-label">Email</label>
                <input type="email" v-model="registerData.email" class="form-control" required />
              </div>
              <div class="mb-3">
                <label class="form-label">Password</label>
                <input type="password" v-model="registerData.password" class="form-control" required />
              </div>
              <button type="submit" class="btn btn-success w-100">Register</button>
            </form>
            <div v-if="registerMessage" class="alert alert-success mt-3">{{ registerMessage }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
