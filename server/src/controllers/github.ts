import axios from "axios";
import { Octokit } from "octokit";

interface CreateGithubIssueParams {
    githubId: string, org: string, repo: string, title: string, description: string
}

export const createGithubIssue = async (data: CreateGithubIssueParams) => {
    const auth0Options = {
      method: 'POST',
      url: 'https://dev-kgvm1sxe.us.auth0.com/oauth/token',
      headers: {'content-type': 'application/x-www-form-urlencoded'},
      data: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: process.env.CLIENT_ID || '', //auth0 clientID
        client_secret: process.env.CLIENT_SECRET || '', //auth0 client secret
        audience: `${process.env.BASE_URL}api/v2/`
      })
    };
    const auth0Data = await axios.request(auth0Options);
    const access_token = auth0Data.data.access_token;
    
    const githubOptions = {
        method: 'GET',
        url: `https://dev-kgvm1sxe.us.auth0.com/api/v2/users/${data.githubId}`,
        headers: {'content-type': 'application/x-www-form-urlencoded', 'Authorization': `Bearer ${access_token}`},
      };

      const githubData = await axios.request(githubOptions)
      
        // console.log('axios', response)
  
      const gh_token = githubData.data.identities[0].access_token;
      // console.log(gh_token)
      const octokit = new Octokit({
        auth: gh_token,
      });
      const octokitData = await octokit.request('POST /repos/{owner}/{repo}/issues', {
        owner: data.org,
        repo: data.repo,
        title: data.title,
        body: data.description
      })
      return octokitData;
  }