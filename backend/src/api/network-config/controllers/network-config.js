'use strict';

/**
 * network-config controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::network-config.network-config', ({ strapi }) => ({
  async find(ctx) {
    // Get the default response first
    const response = await super.find(ctx);

    if (response?.data?.id) {
      const entityId = response.data.id;

      const extraData = await strapi.db.query('api::network-config.network-config').findOne({
        where: { id: entityId },
        populate: {
          survey: { populate: { questions: true } },
          consent: { populate: { statements: true } }
        }
      });

      if (extraData?.survey) response.data.attributes.survey = extraData.survey;
      if (extraData?.consent) response.data.attributes.consent = extraData.consent;
    }

    return response;
  }
}));
