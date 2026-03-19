'use strict';

/**
 * network-config controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::network-config.network-config', ({ strapi }) => ({
  async find(ctx) {
    // Get the default response first
    const response = await super.find(ctx);

    // If we have data, manually fetch the survey component
    if (response?.data?.id) {
      const entityId = response.data.id;

      // Query the survey component directly
      const surveyData = await strapi.db.query('api::network-config.network-config').findOne({
        where: { id: entityId },
        populate: {
          survey: {
            populate: {
              questions: true
            }
          }
        }
      });

      // Merge survey into the response
      if (surveyData?.survey) {
        response.data.attributes.survey = surveyData.survey;
      }
    }

    return response;
  }
}));
