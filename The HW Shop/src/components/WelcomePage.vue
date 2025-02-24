<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';

const router = useRouter();

const goToShop = () => {
  router.push('/home');
};

onMounted(() => {
  console.log("WelcomePage mounted!");
});
</script>

<template>
  <div class="container text-center mt-5">
    <div class="jumbotron bg-primary text-white p-5 rounded">
      <h1 class="display-3">Welcome to The HW Shop</h1>
      <p class="lead">Your one-stop destination for the best PC components and accessories.</p>
      <hr class="my-4">
      <p>Find the latest hardware at the best prices, from motherboards to high-end GPUs.</p>
      <button @click="goToShop" class="btn btn-light btn-lg mt-3">Start Shopping</button>
    </div>

    <div class="row mt-5">
      <div class="col-md-4">
        <div class="card shadow">
          <div class="card-body">
            <h5 class="card-title">Quality Components</h5>
            <p class="card-text">Only the best brands and parts for your custom build.</p>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card shadow">
          <div class="card-body">
            <h5 class="card-title">Fast Shipping</h5>
            <p class="card-text">Get your components delivered quickly and safely.</p>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card shadow">
          <div class="card-body">
            <h5 class="card-title">24/7 Support</h5>
            <p class="card-text">Our support team is always ready to assist you.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.jumbotron {
  background: linear-gradient(to right, #007bff, #0056b3);
}
</style>
