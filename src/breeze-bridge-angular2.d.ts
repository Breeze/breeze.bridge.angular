import { Http, Response } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
export declare class BreezeBridgeAngular2Module {
    http: Http;
    constructor(http: Http);
}
/**
 * Ajax http response abstraction expected by Breeze DataServiceAdapter
 */
export interface HttpResponse {
    config: {};
    data: any;
    getHeaders: (headerName?: string) => string[];
    ngConfig: {};
    status: number;
    statusText: string;
    response: Response;
}
/**
 * DataServiceAdapter Ajax request configuration\
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
    success: (res: HttpResponse) => HttpResponse;
    error: (res: (HttpResponse | Error)) => HttpResponse;
}
export declare class AjaxAngular2Adapter {
    http: Http;
    static adapterName: string;
    name: string;
    defaultSettings: {};
    requestInterceptor: (info: {}) => {};
    constructor(http: Http);
    initialize(): void;
    ajax(config: DsaConfig): Promise<void>;
}
