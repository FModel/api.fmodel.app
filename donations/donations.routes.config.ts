import {CommonRoutesConfig} from "../common/common.routes.config";
import express from "express";
import DonationsController from "../donations/controllers/donations.controller";

export class DonationsRoutes extends CommonRoutesConfig {
    constructor(app: express.Application) {
        super(app,  'DonationsRoutes');
    }

    configureRoutes(): express.Application {
        this.app.get(`/v1/donations/donators`, [
            DonationsController.getAllDonators
        ]);

        this.app.post(`/v1/webhooks`, [
            DonationsController.sendToDiscord
        ]);

        return this.app;
    }
}