/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BTCPrice } from '../models/BTCPrice';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class DefaultService {
    /**
     * Btc Price
     * @returns BTCPrice Successful Response
     * @throws ApiError
     */
    public static btcPrice(): CancelablePromise<BTCPrice> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/btc_price',
        });
    }
}
