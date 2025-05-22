import { createLambdaProxyAuthHandler } from "vercel-github-oauth-proxy";

export default createLambdaProxyAuthHandler({
  githubClientId: process.env.OAUTH_CLIENT_ID,
  githubClientSecret: process.env.OAUTH_CLIENT_SECRET,
  githubOrgName: 'kroescontrol',
  githubPersonalAccessToken: process.env.ACCESS_TOKEN,
});