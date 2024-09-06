/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CreatePodcastRequest = {
    /**
     * Title of the podcast.
     */
    title: string;
    /**
     * Description of the podcast.
     */
    description: string;
    /**
     * Date and time of publication.
     */
    published_at: (string | null);
    /**
     * URL to the podcast cover image.
     */
    cover_url: (string | null);
    /**
     * Audio file with the full podcast.
     */
    audio_url: string;
};

