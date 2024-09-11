<template>
    <template v-if="!is_ready">
        <v-file-input density="compact" variant="outlined" :model-value="modelValue" :error="!!error" :error-messages="error ? [error] : []"
            @update:model-value="onFileChange" :label="label"></v-file-input>
        <v-progress-linear v-if="is_loading" indeterminate></v-progress-linear>
    </template>
    <template v-else>
        <template v-if="kind === 'audio'">
            <audio :src="modelValue" controls></audio>
        </template>
        <template v-else>
            <v-img :src="modelValue" width="100" height="100"></v-img>
        </template>
    </template>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { ContentService } from '@/api';

const is_ready = ref(false);
const is_loading = ref(false);
const error = ref<string | null>(null);

const props = defineProps([
    'kind',
    'modelValue',
]);
const emits = defineEmits(['update:modelValue']);

const label = computed(() => {
    return props.kind === 'audio' ? 'Audio File' : 'Cover Image';
});

async function onFileChange(file: File | File[]) {
    if (Array.isArray(file)) {
        file = file[0];
    }
    try {
        is_loading.value = true;
        const presigned = await ContentService.presignUrl(props.kind);
        const response = await fetch(presigned.presigned_url, {
            method: 'PUT',
            body: file,
            headers: {
                'Content-Type': file.type
            }
        });

        if (response.ok) {
            console.log('File uploaded successfully');
            is_ready.value = true;
        } else {
            throw new Error('Upload failed');
        }
        emits('update:modelValue', presigned.file_url);
    } catch (err) {
        error.value = "" + err;
    } finally {
        is_loading.value = false;
    }
}
</script>