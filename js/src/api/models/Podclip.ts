/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Podcast } from './Podcast';
export type Podclip = {
    id: string;
    /**
     * Title of the podclip.
     */
    title: string;
    /**
     * Description of the podclip.
     */
    description: string;
    /**
     * Audio file with intro/outro.
     */
    audio_url: string;
    /**
     * Duration in seconds including intro/outro.
     */
    duration: number;
    /**
     * The podcast that the clip was extracted from.
     */
    podcast: Podcast;
    /**
     * Start time in seconds in the parent podcast.
     */
    start_time: number;
    /**
     * End time in seconds in the parent podcast.
     */
    end_time: number;
};

