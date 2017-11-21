import { NgModule } from '@angular/core';
import { Http } from "@angular/http";
import { config } from "breeze-client";

import { AjaxAngularAdapter } from "./ajax-angular-adapter";
import { Q } from "./common";

@NgModule()
export class BreezeBridgeAngularModule {
    constructor(public http: Http) {
        // Configure Breeze for Angular ... exactly once.
        // config breeze to use the native 'backingStore' modeling adapter appropriate for Ng
        // 'backingStore' is the Breeze default but we set it here to be explicit.
        config.initializeAdapterInstance('modelLibrary', 'backingStore', true);
        config.setQ(Q);
        config.registerAdapter('ajax', () => new AjaxAngularAdapter(http));
        config.initializeAdapterInstance('ajax', AjaxAngularAdapter.adapterName, true);
    }
}