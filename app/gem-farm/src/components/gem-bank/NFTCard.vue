<template>
  <div
    class="m-1 card flex justify-center"
    :class="{ 'card-selected': selected }"
    @click="toggleSelect"
  >
    <img
      :src="nft.externalMetadata.image"
      :alt="nft.onchainMetadata.data.name"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
export default defineComponent({
  props: {
    nft: { type: Object, required: true },
  },
  emits: ['selected'],
  setup(props, ctx) {
    const selected = ref<boolean>(false);

    const toggleSelect = () => {
      selected.value = !selected.value;
      console.log('selected', props.nft.mint.toBase58());
      ctx.emit('selected', {
        nft: props.nft,
        selected: selected.value,
      });
    };

    return {
      selected,
      toggleSelect,
    };
  },
});
</script>

<style scoped>
img {
  max-width: 100%;
  max-height: 100%;
  height: auto;
  width: auto;
  border-radius: 10px;
}

.card {
  width: 150px;
  height: 150px;
  border-radius: 10px;
  transition: all 0.1s ease;
}

.card:hover {
  @apply border-4 border-solid ;
  border-color: #a07d3e !important;

}

.card-selected {
  @apply border-4 border-solid;
  border-radius: 10px;
  border-color: #a07d3e !important;
}
</style>
