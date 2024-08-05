/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Body_submit } from '../models/Body_submit';
import type { ListSubmissionResponse } from '../models/ListSubmissionResponse';
import type { SubmissionResponse } from '../models/SubmissionResponse';
import type { SubmissionWithHighlightsResponse } from '../models/SubmissionWithHighlightsResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class DefaultService {
    /**
     * Submit
     * Submit an audio file for processing.
     *
     * Example:
     * ```
     * curl -s http://localhost:8000/api/v1/submit -F "file=@examples/pharma.mp3"
     * ```
     * @param formData
     * @returns SubmissionResponse Successful Response
     * @throws ApiError
     */
    public static submit(
        formData: Body_submit,
    ): CancelablePromise<SubmissionResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/submit',
            formData: formData,
            mediaType: 'multipart/form-data',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Submissions
     * List all submission IDs.
     * @returns ListSubmissionResponse Successful Response
     * @throws ApiError
     */
    public static listSubmissions(): CancelablePromise<ListSubmissionResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/',
        });
    }
    /**
     * Get Submission
     * Get the most recent run for a submission.
     * @param submissionId
     * @returns SubmissionWithHighlightsResponse Successful Response
     * @throws ApiError
     */
    public static getSubmission(
        submissionId: string,
    ): CancelablePromise<SubmissionWithHighlightsResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/submission/{submission_id}',
            path: {
                'submission_id': submissionId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Highlight
     * Return the MP3 from S3.
     * @param highlightId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getHighlight(
        highlightId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/highlight/{highlight_id}',
            path: {
                'highlight_id': highlightId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
