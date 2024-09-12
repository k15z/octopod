// This file is auto-generated by @hey-api/openapi-ts

import { createClient, createConfig, type Options, urlSearchParamsBodySerializer } from '@hey-api/client-fetch';
import type { ListPodcastsData, ListPodcastsError, ListPodcastsResponse2, CreatePodcastData, CreatePodcastError, CreatePodcastResponse, GetPodcastData, GetPodcastError, GetPodcastResponse, UpdatePodcastData, UpdatePodcastError, UpdatePodcastResponse, DeletePodcastData, DeletePodcastError, DeletePodcastResponse, ListPodclipsData, ListPodclipsError, ListPodclipsResponse2, GetPodclipData, GetPodclipError, GetPodclipResponse, UpdatePodclipData, UpdatePodclipError, UpdatePodclipResponse, DeletePodclipData, DeletePodclipError, DeletePodclipResponse, SkipPodclipData, SkipPodclipError, SkipPodclipResponse, TipPodclipData, TipPodclipError, TipPodclipResponse, PlayPodclipData, PlayPodclipError, PlayPodclipResponse, PlaylistData, PlaylistError, PlaylistResponse, PresignUrlData, PresignUrlError, PresignUrlResponse, CreatorRegisterData, CreatorRegisterError, CreatorRegisterResponse, CreatorTokenData, CreatorTokenError, CreatorTokenResponse, CreatorProfileError, CreatorProfileResponse, CreatorPaymentsError, CreatorPaymentsResponse, UserRegisterData, UserRegisterError, UserRegisterResponse, UserTokenData, UserTokenError, UserTokenResponse, UserProfileError, UserProfileResponse, UserStatisticsError, UserStatisticsResponse } from './types.gen';

export const client = createClient(createConfig());

/**
 * List Podcasts
 */
export const listPodcasts = <ThrowOnError extends boolean = false>(options?: Options<ListPodcastsData, ThrowOnError>) => { return (options?.client ?? client).get<ListPodcastsResponse2, ListPodcastsError, ThrowOnError>({
    ...options,
    url: '/content/podcast'
}); };

/**
 * Create Podcast
 */
export const createPodcast = <ThrowOnError extends boolean = false>(options: Options<CreatePodcastData, ThrowOnError>) => { return (options?.client ?? client).put<CreatePodcastResponse, CreatePodcastError, ThrowOnError>({
    ...options,
    url: '/content/podcast'
}); };

/**
 * Get Podcast
 */
export const getPodcast = <ThrowOnError extends boolean = false>(options: Options<GetPodcastData, ThrowOnError>) => { return (options?.client ?? client).get<GetPodcastResponse, GetPodcastError, ThrowOnError>({
    ...options,
    url: '/content/podcast/{podcast_id}'
}); };

/**
 * Update Podcast
 */
export const updatePodcast = <ThrowOnError extends boolean = false>(options: Options<UpdatePodcastData, ThrowOnError>) => { return (options?.client ?? client).put<UpdatePodcastResponse, UpdatePodcastError, ThrowOnError>({
    ...options,
    url: '/content/podcast/{podcast_id}'
}); };

/**
 * Delete Podcast
 */
export const deletePodcast = <ThrowOnError extends boolean = false>(options: Options<DeletePodcastData, ThrowOnError>) => { return (options?.client ?? client).delete<DeletePodcastResponse, DeletePodcastError, ThrowOnError>({
    ...options,
    url: '/content/podcast/{podcast_id}'
}); };

/**
 * List Podclips
 */
export const listPodclips = <ThrowOnError extends boolean = false>(options?: Options<ListPodclipsData, ThrowOnError>) => { return (options?.client ?? client).get<ListPodclipsResponse2, ListPodclipsError, ThrowOnError>({
    ...options,
    url: '/content/podclips'
}); };

/**
 * Get Podclip
 */
export const getPodclip = <ThrowOnError extends boolean = false>(options: Options<GetPodclipData, ThrowOnError>) => { return (options?.client ?? client).get<GetPodclipResponse, GetPodclipError, ThrowOnError>({
    ...options,
    url: '/content/podclip/{podclip_id}'
}); };

/**
 * Update Podclip
 */
export const updatePodclip = <ThrowOnError extends boolean = false>(options: Options<UpdatePodclipData, ThrowOnError>) => { return (options?.client ?? client).put<UpdatePodclipResponse, UpdatePodclipError, ThrowOnError>({
    ...options,
    url: '/content/podclip/{podclip_id}'
}); };

/**
 * Delete Podclip
 */
export const deletePodclip = <ThrowOnError extends boolean = false>(options: Options<DeletePodclipData, ThrowOnError>) => { return (options?.client ?? client).delete<DeletePodclipResponse, DeletePodclipError, ThrowOnError>({
    ...options,
    url: '/content/podclip/{podclip_id}'
}); };

/**
 * Skip Podclip
 */
export const skipPodclip = <ThrowOnError extends boolean = false>(options: Options<SkipPodclipData, ThrowOnError>) => { return (options?.client ?? client).post<SkipPodclipResponse, SkipPodclipError, ThrowOnError>({
    ...options,
    url: '/content/podclip/{podclip_id}/report/skipped'
}); };

/**
 * Tip Podclip
 */
export const tipPodclip = <ThrowOnError extends boolean = false>(options: Options<TipPodclipData, ThrowOnError>) => { return (options?.client ?? client).post<TipPodclipResponse, TipPodclipError, ThrowOnError>({
    ...options,
    url: '/content/podclip/{podclip_id}/report/tipped'
}); };

/**
 * Play Podclip
 */
export const playPodclip = <ThrowOnError extends boolean = false>(options: Options<PlayPodclipData, ThrowOnError>) => { return (options?.client ?? client).post<PlayPodclipResponse, PlayPodclipError, ThrowOnError>({
    ...options,
    url: '/content/podclip/{podclip_id}/report/played'
}); };

/**
 * Playlist
 */
export const playlist = <ThrowOnError extends boolean = false>(options: Options<PlaylistData, ThrowOnError>) => { return (options?.client ?? client).get<PlaylistResponse, PlaylistError, ThrowOnError>({
    ...options,
    url: '/content/playlist'
}); };

/**
 * Presign Url
 * Generate a presigned URL for uploading a file to S3.
 *
 * Warning: Very insecure, do not use in production.
 */
export const presignUrl = <ThrowOnError extends boolean = false>(options: Options<PresignUrlData, ThrowOnError>) => { return (options?.client ?? client).get<PresignUrlResponse, PresignUrlError, ThrowOnError>({
    ...options,
    url: '/content/presign_url'
}); };

/**
 * Creator Register
 */
export const creatorRegister = <ThrowOnError extends boolean = false>(options: Options<CreatorRegisterData, ThrowOnError>) => { return (options?.client ?? client).post<CreatorRegisterResponse, CreatorRegisterError, ThrowOnError>({
    ...options,
    url: '/creator/register'
}); };

/**
 * Creator Token
 */
export const creatorToken = <ThrowOnError extends boolean = false>(options: Options<CreatorTokenData, ThrowOnError>) => { return (options?.client ?? client).post<CreatorTokenResponse, CreatorTokenError, ThrowOnError>({
    ...options,
    ...urlSearchParamsBodySerializer,
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    },
    url: '/creator/token'
}); };

/**
 * Creator Profile
 */
export const creatorProfile = <ThrowOnError extends boolean = false>(options?: Options<unknown, ThrowOnError>) => { return (options?.client ?? client).get<CreatorProfileResponse, CreatorProfileError, ThrowOnError>({
    ...options,
    url: '/creator/profile'
}); };

/**
 * Creator Payments
 */
export const creatorPayments = <ThrowOnError extends boolean = false>(options?: Options<unknown, ThrowOnError>) => { return (options?.client ?? client).get<CreatorPaymentsResponse, CreatorPaymentsError, ThrowOnError>({
    ...options,
    url: '/creator/payments'
}); };

/**
 * User Register
 */
export const userRegister = <ThrowOnError extends boolean = false>(options: Options<UserRegisterData, ThrowOnError>) => { return (options?.client ?? client).post<UserRegisterResponse, UserRegisterError, ThrowOnError>({
    ...options,
    url: '/user/register'
}); };

/**
 * User Token
 */
export const userToken = <ThrowOnError extends boolean = false>(options: Options<UserTokenData, ThrowOnError>) => { return (options?.client ?? client).post<UserTokenResponse, UserTokenError, ThrowOnError>({
    ...options,
    ...urlSearchParamsBodySerializer,
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    },
    url: '/user/token'
}); };

/**
 * User Profile
 */
export const userProfile = <ThrowOnError extends boolean = false>(options?: Options<unknown, ThrowOnError>) => { return (options?.client ?? client).get<UserProfileResponse, UserProfileError, ThrowOnError>({
    ...options,
    url: '/user/profile'
}); };

/**
 * User Statistics
 */
export const userStatistics = <ThrowOnError extends boolean = false>(options?: Options<unknown, ThrowOnError>) => { return (options?.client ?? client).get<UserStatisticsResponse, UserStatisticsError, ThrowOnError>({
    ...options,
    url: '/user/statistics'
}); };