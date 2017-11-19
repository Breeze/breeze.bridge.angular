import { promises, HttpResponse } from "breeze-client";

/**
 * Minimum for breeze breeze Q/ES6 Promise adapter
 */
export var Q: promises.IPromiseService = {
    defer(): promises.IDeferred<any> {
        let resolve: (value?: {} | PromiseLike<{}>) => void;
        let reject: (reason?: any) => void;
        let promise = new Promise((_resolve, _reject) => {
            resolve = _resolve;
            reject = _reject;
        });
        return {
            promise: promise,
            resolve(value: any) { resolve(value); },
            reject(reason: any) { reject(reason); }
        };
    },

    resolve(value?: {} | PromiseLike<{}>) {
        let deferred = Q.defer();
        deferred.resolve(value);
        return deferred.promise;
    },


    reject(reason?: any) {
        let deferred = Q.defer();
        deferred.reject(reason);
        return deferred.promise;
    }
};

/**
 * DataServiceAdapter Ajax request configuration
 */
export interface DsaConfig {
    url: string;
    type?: string;
    dataType?: string;
    contentType?: string | boolean;
    crossDomain?: string;
    headers?: {};
    data?: any;
    params?: {};
    success: (res: HttpResponse) => void;
    error: (res: (HttpResponse | Error)) => void;
}

