
import { ref } from 'vue';
export const authToken = ref(localStorage.getItem('token') || null);
