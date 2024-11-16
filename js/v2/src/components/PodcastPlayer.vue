<template>
    <div id="player">
        <swiper @slide-change="onSlideChange" class="vertical-swiper" v-bind:class="{ miniplayer: miniplayer }" direction="vertical">
            <swiper-slide v-for="item in playlist" :key="item.title">
                <VerticalPlayer :title="item.title" :subtitle="item.subtitle" :cover_url="item.cover_url" :miniplayer=miniplayer :variant="item.variant" :url="item.url" />
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
import { playlist as playlistApi } from "@/api"

defineProps<{
    miniplayer: boolean;
}>();

const playlist = ref([] as any[]);

const onSlideChange = (swiper: any) => {
    state.active_item = playlist.value[swiper.activeIndex] as any;
    state.is_playing = true;
};

playlistApi({
    query: {
        seconds: 3000,
    },
}).then((res) => {
    res.data?.results.forEach((podclip) => {
        playlist.value.push({
            title: podclip.title,
            subtitle: podclip.podcast.creator_name,
            cover_url: podclip.podcast.cover_url,
            variant: ["v1", "v2", "v3"][Math.floor(Math.random() * 3)],
            url: podclip.audio_url,
        });
    });
})
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
    height: 120px;
}
</style>
