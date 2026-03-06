// import type { Core } from '@strapi/strapi';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) { },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: { strapi: any }) {
    console.log('🚀 STRAPI BOOTSTRAP STARTED 🚀');

    try {
      // Enable Public Permissions
      const publicRole = await strapi.db.query('plugin::users-permissions.role').findOne({
        where: { type: 'public' },
      });

      if (publicRole) {
        const permissions = [
          'api::profile.profile.find',
          'api::profile.profile.findOne',
          'api::experience.experience.find',
          'api::experience.experience.findOne',
          'api::skill.skill.find',
          'api::skill.skill.findOne',
          'api::project.project.find',
          'api::project.project.findOne',
          'api::article.article.find',
          'api::article.article.findOne',
        ];

        await Promise.all(permissions.map(async (action) => {
          const permissionExists = await strapi.db.query('plugin::users-permissions.permission').findOne({
            where: {
              action,
              role: publicRole.id,
            },
          });

          if (!permissionExists) {
            await strapi.db.query('plugin::users-permissions.permission').create({
              data: {
                action,
                role: publicRole.id,
              },
            });
            console.log(`✅ ENABLED PERMISSION: ${action}`);
          }
        }));
      }
    } catch (error) {
      console.error('❌ BOOTSTRAP ERROR:', error);
    }
    console.log('✨ Bootstrap sequence completed.');
  },
};
