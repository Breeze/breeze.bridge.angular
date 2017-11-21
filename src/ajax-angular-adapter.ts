import { Http, Headers, Request, RequestOptions, Response } from '@angular/http';
import { core, HttpResponse } from "breeze-client";
import { map } from "rxjs/operators/map";

import { DsaConfig } from "./common";

export class AjaxAngularAdapter {
    static adapterName = 'angular';
    name = AjaxAngularAdapter.adapterName;
    defaultSettings = {};
    requestInterceptor: (info: {}) => {};

    constructor(public http: Http) { }

    initialize() { }

    ajax(config: DsaConfig) {
        if (!this.http) {
            throw new Error('Unable to locate angular http module for ajax adapter');
        }

        // merge default DataSetAdapter Settings with config arg
        if (!core.isEmpty(this.defaultSettings)) {
            let compositeConfig = core.extend({}, this.defaultSettings);
            config = <DsaConfig>core.extend(compositeConfig, config);
            // extend is shallow; extend headers separately
            let headers = core.extend({}, this.defaultSettings['headers']); // copy default headers 1st
            config['headers'] = core.extend(headers, config.headers);
        }

        if (config.crossDomain) {
            throw new Error(this.name + ' does not support JSONP (jQuery.ajax:crossDomain) requests');
        }

        let url = config.url;
        if (!core.isEmpty(config.params)) {
            // Hack: Not sure how Angular handles writing 'search' parameters to the url.
            // so this approach takes over the url param writing completely.
            let delim = (url.indexOf('?') >= 0) ? '&' : '?';
            url = url + delim + encodeParams(config.params);
        }

        let headers = new Headers(config.headers || {});
        if (!headers.has('Content-Type')) {
            if (config.type != 'GET' && config.type != 'DELETE' && config.contentType !== false) {
                headers.set('Content-Type',
                    <string>config.contentType || 'application/json; charset=utf-8');
            }
        }

        // Create the http request body which must be stringified
        let body: any = config.data;
        if (body && typeof body !== 'string') {
            body = JSON.stringify(body);
        };

        let reqOptions = new RequestOptions({
            url: url,
            method: (config.type || 'GET').toUpperCase(),
            headers: headers,
            body: body,
        });

        let request = new Request(reqOptions);

        let requestInfo = {
            adapter: this,      // this adapter
            requestOptions: reqOptions, // angular's http requestOptions
            request: request,   // the http request from the requestOptions
            dsaConfig: config,  // the config arg from the calling Breeze DataServiceAdapter
            success: successFn, // adapter's success callback
            error: errorFn      // adapter's error callback
        };

        if (core.isFunction(this.requestInterceptor)) {
            this.requestInterceptor(requestInfo);
            if (this.requestInterceptor['oneTime']) {
                this.requestInterceptor = null;
            }
        }

        if (requestInfo.request) { // exists unless requestInterceptor killed it.
            const fmap = map(extractData);

            fmap(this.http.request(requestInfo.request))
                .forEach(requestInfo.success)
                .catch(requestInfo.error);
        }

        function extractData(response: Response) {
            let data: any;
            let dt = requestInfo.dsaConfig.dataType;
            // beware:`res.json` and `res.text` will be async some day
            if (dt && dt !== 'json') {
                data = response.text ? response.text() : null;
            } else {
                data = response.json ? response.json() : null;
            }
            return { data, response };
        }

        function successFn(arg: { data: any, response: Response }) {
            if (arg.response.status < 200 || arg.response.status >= 300) {
                throw { data: arg.data, response: arg.response };
            }

            let httpResponse: HttpResponse = {
                config: requestInfo.request,
                data: arg.data,
                getHeaders: makeGetHeaders(arg.response),
                status: arg.response.status
            };
            httpResponse['ngConfig'] = requestInfo.request;
            httpResponse['statusText'] = arg.response.statusText;
            httpResponse['response'] = arg.response;
            config.success(httpResponse);
        }

        function errorFn(arg: { data: any, response: Response } | Error | Response) {
            if (arg instanceof Error) {
                throw arg; // program error; nothing we can do
            } else {
                var data: any;
                var response: Response;
                if (arg instanceof Response) {
                    response = arg;
                    try {
                        data = arg.json();
                    } catch (e) {
                        data = arg.text();
                    }
                } else {
                    data = arg.data;
                    response = arg.response;
                }

                // Timeout appears as an error with status===0 and no data.
                if (response.status === 0 && data == null) {
                    data = 'timeout';
                }

                let errorMessage = response.status + ": " + response.statusText;
                if (data && typeof data === 'object') {
                    data["message"] = data["message"] || errorMessage;  // breeze looks at the message property
                }
                if (!data) {
                    data = errorMessage;   // Return the error message as data
                }
                let httpResponse: HttpResponse = {
                    config: requestInfo.request,
                    data: data,
                    getHeaders: makeGetHeaders(response),
                    status: response.status
                };
                httpResponse['ngConfig'] = requestInfo.request;
                httpResponse['statusText'] = response.statusText;
                httpResponse['response'] = response;

                config.error(httpResponse); // send error to breeze error handler
            }
        }
    };

}

///// Helpers ////

function encodeParams(obj: {}) {
    let query = '';
    let subValue: any, innerObj: any, fullSubName: any;

    for (let name in obj) {
        if (!obj.hasOwnProperty(name)) { continue; }

        let value = obj[name];

        if (value instanceof Array) {
            for (let i = 0; i < value.length; ++i) {
                subValue = value[i];
                fullSubName = name + '[' + i + ']';
                innerObj = {};
                innerObj[fullSubName] = subValue;
                query += encodeParams(innerObj) + '&';
            }
        } else if (value && value.toISOString) { // a feature of Date-like things
            query += encodeURIComponent(name) + '=' + encodeURIComponent(value.toISOString()) + '&';
        } else if (value instanceof Object) {
            for (let subName in value) {
                if (obj.hasOwnProperty(name)) {
                    subValue = value[subName];
                    fullSubName = name + '[' + subName + ']';
                    innerObj = {};
                    innerObj[fullSubName] = subValue;
                    query += encodeParams(innerObj) + '&';
                }
            }
        } else if (value === null) {
            query += encodeURIComponent(name) + '=&';
        } else if (value !== undefined) {
            query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
        }
    }

    return query.length ? query.substr(0, query.length - 1) : query;
}

function makeGetHeaders(res: Response) {
    let headers = res.headers;
    return function getHeaders(headerName?: string) { return headers.getAll(headerName).join('\r\n'); };
}