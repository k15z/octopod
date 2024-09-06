<template></template>

<script lang="ts" setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

onMounted(() => {
    const router = useRouter();
    router.push('/dashboard');
});
</script>