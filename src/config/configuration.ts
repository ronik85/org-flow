export default () => ({
  app: {
    name: process.env.APPNAME,
    version: process.env.APPVERSION,
    port: parseInt(process.env.APP_PORT ?? '4000', 10),
  },
});
