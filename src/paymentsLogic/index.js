'use strict';

const _ = require('lodash');
const rp = require('request-promise');

class PaymentsLogic {
    static async getPlan({ config }) {
        // this query use proxy ability to replace :account_id to currentAccountID
        // this ability use because we don`t know accountId
        const getPlanOpts = {
            uri: `${config.apiHost}/api/payments/:account_id/plan`,
            headers: {
                'x-access-token': config.env.apiKey
            }
        };

        let plan;

        try {
            const planRes = await rp(getPlanOpts);
            plan = JSON.parse(planRes);
        } catch (e) {
            throw new Error('Can`t get user payment plan ');
        }

        return plan;
    }

    static async getMaxUploadSizeDependingOnPlan({ config }) {
        const plan = await this.getPlan({ config });
        const uploadSize = config.paymentPlanMap[_.get(plan, 'id')];

        if (_.isNumber(uploadSize)) {
            return uploadSize;
        } else {
            throw new Error('Unsupported user payment plan');
        }
    }
}

module.exports = PaymentsLogic;
