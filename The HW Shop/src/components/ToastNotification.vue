<script setup>
import { ref, onUnmounted } from "vue";
import { useRouter } from "vue-router";

const props = defineProps({
  message: {
    type: String,
    default: "Vare lagt til i handlekurven!",
  },
  duration: {
    type: Number,
    default: 5000,
  },
});

const visible = ref(false);
const router = useRouter();
let timeoutId = null;

const show = () => {
  visible.value = true;
  timeoutId = setTimeout(() => {
    visible.value = false;
  }, props.duration);
};

const goToCart = () => {
  visible.value = false;
  router.push({ name: "Cart" });
};

onUnmounted(() => {
  if (timeoutId) clearTimeout(timeoutId);
});

defineExpose({ show });
</script>

<template>
  <div
    v-if="visible"
    class="toast-container position-fixed bottom-0 end-0 p-3"
    style="z-index: 1100"
  >
    <div class="toast show bg-success text-white" role="alert">
      <div class="toast-body d-flex justify-content-between align-items-center">
        <span>{{ message }}</span>
        <button @click="goToCart" class="btn btn-light btn-sm">
          🛒 Gå til handlekurv
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.toast-container {
  min-width: 250px;
}

.toast {
  box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.2);
  border-radius: 5px;
}

.toast-body {
  padding: 10px;
  font-size: 1rem;
  font-weight: bold;
}
</style>
