import express from "express";
import debug from "debug";
import axios from "axios";

// @ts-expect-error
const discordWebhookUrl: string = process.env.DISCORD_DONATION_WEBHOOK;
// @ts-expect-error
const paypalIpnUrl: string = process.env.PAYPAL_IPN_URL;
const log: debug.IDebugger = debug('app:donations-controllers');

class DonationsController {
    async sendToDiscord(req: express.Request, res: express.Response) {
        // @ts-ignore
        axios.post(paypalIpnUrl, `cmd=_notify-validate&${req.textBody}`, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'FModel/api.fmodel.app/verify-ipn'
            }
        })
            .then(function (response) {
                if (response.data === "VERIFIED") {
                    let name = req.body.payer_business_name;
                    if (name === undefined) name = req.body.first_name;
                    
                    axios.post(discordWebhookUrl, {
                        username: 'Paypal',
                        avatar_url: 'https://www.paypalobjects.com/webstatic/icon/pp258.png',
                        content: `Received ${req.body.mc_gross} ${req.body.mc_currency} from ${name}\nThank you very much for the support :heart:`,
                    })
                        .then(function (response) {
                            log('paypal webhook transferred to discord');
                        })
                        .catch(function (error) {
                            log('something went wrong while sending the payment to discord');
                        });
                } else {
                    log('lol nice try');
                }
            })
            .catch(function (error) {
                log('something went wrong while verifying the payment');
            });
        
        res.status(200).send();
    }
}

export default new DonationsController();