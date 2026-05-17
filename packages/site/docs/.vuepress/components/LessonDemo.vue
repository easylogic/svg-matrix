<script setup>
const props = defineProps({
  id: {
    type: String,
    required: true
  }
});
</script>

<template>
  <div class="lesson-demo">
    <iframe :title="`Lesson ${props.id} demo`" :src="`/lesson_${props.id}/?embed=1`" />
  </div>
</template>

<style scoped>
.lesson-demo {
  margin: 32px 0;
  border: 1px solid var(--c-border);
  background: var(--c-bg);
}

.lesson-demo iframe {
  display: block;
  width: 100%;
  height: 680px;
  border: 0;
  touch-action: none;
}
</style>
