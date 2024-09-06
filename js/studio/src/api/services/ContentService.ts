/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreatePodcastRequest } from '../models/CreatePodcastRequest';
import type { ListPodcastsResponse } from '../models/ListPodcastsResponse';
import type { ListPodclipsResponse } from '../models/ListPodclipsResponse';
import type { MakePlaylistResponse } from '../models/MakePlaylistResponse';
import type { Podcast } from '../models/Podcast';
import type { Podclip } from '../models/Podclip';
import type { PresignedUrlResponse } from '../models/PresignedUrlResponse';
import type { UpdatePodcastRequest } from '../models/UpdatePodcastRequest';
import type { UpdatePodclipRequest } from '../models/UpdatePodclipRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ContentService {
    /**
     * List Podcasts
     * @param q
     * @returns ListPodcastsResponse Successful Response
     * @throws ApiError
     */
    public static listPodcasts(
        q: string = '',
    ): CancelablePromise<ListPodcastsResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/content/podcast',
            query: {
                'q': q,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Create Podcast
     * @param requestBody
     * @returns Podcast Successful Response
     * @throws ApiError
     */
    public static createPodcast(
        requestBody: CreatePodcastRequest,
    ): CancelablePromise<Podcast> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/content/podcast',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Podcast
     * @param podcastId
     * @returns Podcast Successful Response
     * @throws ApiError
     */
    public static getPodcast(
        podcastId: string,
    ): CancelablePromise<Podcast> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/content/podcast/{podcast_id}',
            path: {
                'podcast_id': podcastId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Podcast
     * @param podcastId
     * @param requestBody
     * @returns Podcast Successful Response
     * @throws ApiError
     */
    public static updatePodcast(
        podcastId: string,
        requestBody: UpdatePodcastRequest,
    ): CancelablePromise<Podcast> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/content/podcast/{podcast_id}',
            path: {
                'podcast_id': podcastId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Podcast
     * @param podcastId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deletePodcast(
        podcastId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/content/podcast/{podcast_id}',
            path: {
                'podcast_id': podcastId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Podclips
     * @param q
     * @param minDuration
     * @param maxDuration
     * @param podcastId
     * @returns ListPodclipsResponse Successful Response
     * @throws ApiError
     */
    public static listPodclips(
        q: string = '',
        minDuration?: number,
        maxDuration: number = 360000,
        podcastId?: (string | null),
    ): CancelablePromise<ListPodclipsResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/content/podclips',
            query: {
                'q': q,
                'min_duration': minDuration,
                'max_duration': maxDuration,
                'podcast_id': podcastId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Podclip
     * @param podclipId
     * @returns Podclip Successful Response
     * @throws ApiError
     */
    public static getPodclip(
        podclipId: string,
    ): CancelablePromise<Podclip> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/content/podclip/{podclip_id}',
            path: {
                'podclip_id': podclipId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Podclip
     * @param podclipId
     * @param requestBody
     * @returns Podclip Successful Response
     * @throws ApiError
     */
    public static updatePodclip(
        podclipId: string,
        requestBody: UpdatePodclipRequest,
    ): CancelablePromise<Podclip> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/content/podclip/{podclip_id}',
            path: {
                'podclip_id': podclipId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Podclip
     * @param podclipId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deletePodclip(
        podclipId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/content/podclip/{podclip_id}',
            path: {
                'podclip_id': podclipId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Skip Podclip
     * @param podclipId
     * @param skipTime
     * @returns any Successful Response
     * @throws ApiError
     */
    public static skipPodclip(
        podclipId: string,
        skipTime: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/content/podclip/{podclip_id}/report/skipped',
            path: {
                'podclip_id': podclipId,
            },
            query: {
                'skip_time': skipTime,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Tip Podclip
     * @param podclipId
     * @param amount
     * @returns any Successful Response
     * @throws ApiError
     */
    public static tipPodclip(
        podclipId: string,
        amount: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/content/podclip/{podclip_id}/report/tipped',
            path: {
                'podclip_id': podclipId,
            },
            query: {
                'amount': amount,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Play Podclip
     * @param podclipId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static playPodclip(
        podclipId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/content/podclip/{podclip_id}/report/played',
            path: {
                'podclip_id': podclipId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Playlist
     * @param seconds
     * @returns MakePlaylistResponse Successful Response
     * @throws ApiError
     */
    public static playlist(
        seconds: number,
    ): CancelablePromise<MakePlaylistResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/content/playlist',
            query: {
                'seconds': seconds,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Presign Url
     * Generate a presigned URL for uploading a file to S3.
     *
     * Warning: Very insecure, do not use in production.
     * @param kind
     * @returns PresignedUrlResponse Successful Response
     * @throws ApiError
     */
    public static presignUrl(
        kind: 'audio' | 'image',
    ): CancelablePromise<PresignedUrlResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/content/presign_url',
            query: {
                'kind': kind,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
