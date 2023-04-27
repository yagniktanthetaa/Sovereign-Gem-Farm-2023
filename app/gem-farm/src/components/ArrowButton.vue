<template>
  <button :disabled="disabled">
    <div class="items"> <img src="../assets/right.svg" alt="right" :width="40" :height="40"
        :class="{ left: left, disabled: disabled }" /></div>
  </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  props: {
    left: Boolean,
    disabled: Boolean,
  },
  setup() {
    return {};
  },
});
</script>

<style scoped>
button,
img {
  outline: none !important;
}

.left {
  transform: scaleX(-1);
}

.disabled {
  opacity: 0;
}

.items {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
