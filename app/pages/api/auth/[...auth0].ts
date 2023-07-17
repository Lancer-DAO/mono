import { handleAuth, handleLogin } from "@auth0/nextjs-auth0";

export default handleAuth({
  async login(req, res) {
    try {
      // Pass in custom params to your handler
      console.log("hey");
      await handleLogin(req, res, {
        authorizationParams: { customParam: "foo" },
      });
      // Add your own custom logging.
    } catch (error) {
      // Add you own custom error logging.
      console.log("error");
      res.status(error.status || 500).end();
    }
  },
});
