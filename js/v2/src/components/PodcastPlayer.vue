<template>
    <div id="player">
        <swiper @slide-change="onSlideChange" class="vertical-swiper" v-bind:class="{ miniplayer: miniplayer }" direction="vertical">
            <swiper-slide v-for="item in playlist" :key="item.title">
                <VerticalPlayer :title="item.title" :subtitle="item.subtitle" :miniplayer=miniplayer :variant="item.variant" :url="item.url" />
            </swiper-slide>
        </swiper>
    </div>
</template>

<script setup lang="ts">
import 'swiper/css';
import { ref } from 'vue';
import state from '@/state';
import { Swiper, SwiperSlide } from 'swiper/vue';
import VerticalPlayer from '@/components/VerticalPlayer.vue';

defineProps<{
    miniplayer: boolean;
}>();

const playlist = ref([
    { title: 'Title 1', subtitle: 'Subtitle 1', variant: 'v1', url: "https://octopod-ls.s3.amazonaws.com/05c3ced5-f4a5-458c-8b52-dc3918cc0a0f.mp3" },
    { title: 'Title 2', subtitle: 'Subtitle 2', variant: 'v2', url: "https://octopod-ls.s3.amazonaws.com/b0120617-ae3e-4f6e-8d97-2ec829997f61.mp3" },
    { title: 'Title 3', subtitle: 'Subtitle 3', variant: 'v3', url: "https://octopod-ls.s3.amazonaws.com/aead808a-c185-4282-8564-f5496c638a0b.mp3" },
]);

const onSlideChange = (swiper: any) => {
    state.active_item = playlist.value[swiper.activeIndex] as any;
    state.is_playing = true;
};
</script>

<style scoped>
.vertical-swiper {
    height: 100vh;
}

.vertical-swiper.miniplayer {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 140px;
}
</style>
