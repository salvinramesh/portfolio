export default (config, { strapi }) => {
  return async (ctx, next) => {
    // If the request is exactly to the root URL and it's a GET request
    if (ctx.request.path === '/' && ctx.request.method === 'GET') {
      ctx.redirect('/admin');
      return;
    }
    
    await next();
  };
};
