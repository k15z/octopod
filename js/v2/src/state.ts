import { reactive } from 'vue';
import { watch } from 'vue';

const state = reactive({
    progress: 0,
    is_playing: false,
    active_item: null as any,
});


const player = new Audio();

watch(() => state.is_playing, (newState) => {
    if (newState && player.src) {
        player.play();
    } else if (!player.paused) {
        player.pause();
    }
});

watch(() => state.active_item, (newState, oldState) => {
    if (!oldState || oldState.url !== newState.url) {
        if (!player.paused) {
            player.pause();
        }
        player.src = newState.url;
        player.play();
    }
}, { deep: true });

setInterval(() => {
    state.progress = player.currentTime / player.duration;
}, 100);

export default state;