<script setup>
import { ref } from "vue";
import axios from "axios";

const name = ref("");
const phone = ref("");
const email = ref("");
const subject = ref("");
const message = ref("");
const successMessage = ref("");
const errorMessage = ref("");


/**
 * Mail sending function with form controll and error catching
 * @function
 * @async
 */
const sendEmail = async () => {
  if (!name.value || !phone.value || !email.value || !subject.value || !message.value) {
    errorMessage.value = "❌ Please fill out all fields.";
    successMessage.value = "";
    return;
  }
  try {
    await axios.post("http://localhost:3000/send-email", {
      name: name.value,
      phone: phone.value,
      email: email.value,
      subject: subject.value,
      message: message.value,
    });
    successMessage.value = "✅ Message sent successfully!";
    errorMessage.value = "";
    name.value = "";
    phone.value = "";
    email.value = "";
    subject.value = "";
    message.value = "";
    setTimeout(() => (successMessage.value = ""), 5000);
  } catch (error) {
    console.error("Error sending email:", error);
    errorMessage.value = "❌ Something went wrong. Please try again later.";
    successMessage.value = "";
    setTimeout(() => (errorMessage.value = ""), 5000);
  }
};
</script>

<template>
  <div class="container mt-5">
    <div class="card shadow-lg">
      <div class="card-body">
        <h2 class="text-center text-primary">📩 Contact Us</h2>
        <p class="text-center">Have a question? Fill out the form below, and we'll get back to you as soon as possible.</p>
        <form @submit.prevent="sendEmail">
          <div class="mb-3">
            <label class="form-label">Full Name</label>
            <input type="text" v-model="name" class="form-control" placeholder="John Doe" required />
          </div>
          <div class="mb-3">
            <label class="form-label">Phone Number</label>
            <input type="tel" v-model="phone" class="form-control" placeholder="+47 123 456 789" required />
          </div>
          <div class="mb-3">
            <label class="form-label">Email Address</label>
            <input type="email" v-model="email" class="form-control" placeholder="you@example.com" required />
          </div>
          <div class="mb-3">
            <label class="form-label">Subject</label>
            <input type="text" v-model="subject" class="form-control" placeholder="Order inquiry" required />
          </div>
          <div class="mb-3">
            <label class="form-label">Your Message</label>
            <textarea v-model="message" class="form-control" rows="4" placeholder="Type your message here..." required></textarea>
          </div>
          <button type="submit" class="btn btn-success w-100">📨 Send Message</button>
        </form>
        <div v-if="successMessage" class="alert alert-success mt-3">{{ successMessage }}</div>
        <div v-if="errorMessage" class="alert alert-danger mt-3">{{ errorMessage }}</div>
      </div>
    </div>
  </div>
</template>
