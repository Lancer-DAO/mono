import { Router } from "express";
import { PublicKey } from "@solana/web3.js";
import {
  insertAccount,
  getAccount,
  insertIssue,
  getIssueByNumber,
  getIssueByTitle,
  updateIssueNumber,
  updateIssueState,
  insertPullRequest,
  getPullRequestByNumber,
  insertAccountIssue,
  getAccountIssue,
  insertAccountPullRequest,
  getAccountPullRequest,
  newAccountIssue,
  newPullRequest,
  linkPullRequest,
  getFullPullRequestByNumber,
  updatePullRequestPayout,
} from "../controllers";
import {
  ACCOUNT_API_ROUTE,
  ACCOUNT_ISSUE_API_ROUTE,
  ACCOUNT_PULL_REQUEST_API_ROUTE,
  FULL_PULL_REQUEST_API_ROUTE,
  ISSUE_API_ROUTE,
  LINK_PULL_REQUEST_API_ROUTE,
  MERGE_PULL_REQUEST_API_ROUTE,
  NEW_ISSUE_API_ROUTE,
  NEW_PULL_REQUEST_API_ROUTE,
  PULL_REQUEST_API_ROUTE,
} from "../constants";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import axios from "axios";
import { Octokit } from "octokit";
dayjs.extend(timezone);

const router = Router();

// USERS

router.post(`/${ACCOUNT_API_ROUTE}`, async function (req, res, next) {
  try {
    return res.json(
      await insertAccount({ githubLogin: req.query.githubLogin as string,
        githubId: req.query.githubId as string,
        solanaKey: new PublicKey(req.query.solana_key as string) })
    );
  } catch (err) {
    next(err);
  }
});

router.get(`/${ACCOUNT_API_ROUTE}`, async function (req, res, next) {
  try {
    return res.json(
      await getAccount({ githubLogin: req.query.githubLogin as string, })
    );
  } catch (err) {
    next(err);
  }
});

// ISSUE

router.post(`/${ISSUE_API_ROUTE}`, async function (req, res, next) {
  try {
    return res.json(
      await insertIssue({
        fundingHash: req.query.fundingHash as string,
         fundingAmount: parseFloat(req.query.fundingAmount as string),
         title: req.query.title as string,
         repo: req.query.repo as string,
         org: req.query.org as string
        })
    );
  } catch (err) {
    next(err);
  }
});

router.get(`/${ISSUE_API_ROUTE}`, async function (req, res, next) {
  try {
    if(req.query.issueNumber) {
      return res.json(
        await getIssueByNumber({
           title: req.query.title as string,
           repo: req.query.repo as string,
           org: req.query.org as string,
           issueNumber: parseInt(req.query.issueNumber as string)
          })
      );
    }
    return res.json(
      await getIssueByTitle({
         title: req.query.title as string,
         repo: req.query.repo as string,
         org: req.query.org as string
        })
    );
  } catch (err) {
    next(err);
  }
});

router.put(`/${ISSUE_API_ROUTE}`, async function (req, res, next) {
  try {
    if(req.query.state) {
      return res.json(
        await updateIssueState({
           title: req.query.title as string,
           repo: req.query.repo as string,
           org: req.query.org as string,
           state: req.query.state as string,
           issueNumber: parseInt(req.query.issueNumber as string)
          })
      );
    }
      return res.json(
        await updateIssueNumber({
           title: req.query.title as string,
           repo: req.query.repo as string,
           org: req.query.org as string,
           issueNumber: parseInt(req.query.issueNumber as string)
          })
      );
  } catch (err) {
    next(err);
  }
});

// PULL REQUEST

router.post(`/${PULL_REQUEST_API_ROUTE}`, async function (req, res, next) {
  try {
    return res.json(
      await insertPullRequest({
         title: req.query.title as string,
         repo: req.query.repo as string,
         org: req.query.org as string,
         pullNumber: parseInt(req.query.pullNumber as string)
        })
    );
  } catch (err) {
    next(err);
  }
});

router.get(`/${PULL_REQUEST_API_ROUTE}`, async function (req, res, next) {
  try {
    return res.json(
      await getPullRequestByNumber({
         repo: req.query.repo as string,
         org: req.query.org as string,
         pullNumber: parseInt(req.query.pullNumber as string)
        })
    );
  } catch (err) {
    next(err);
  }
});

router.put(`/${LINK_PULL_REQUEST_API_ROUTE}`, async function (req, res, next) {
  try {
    return res.json(
      await linkPullRequest({
         title: req.query.title as string,
         repo: req.query.repo as string,
         org: req.query.org as string,
         pullNumber: parseInt(req.query.pullNumber as string)
        })
    );
  } catch (err) {
    next(err);
  }
});

// ACCOUNT ISSUE

router.post(`/${ACCOUNT_ISSUE_API_ROUTE}`, async function (req, res, next) {
  try {
    return res.json(
      await insertAccountIssue({
         title: req.query.title as string,
         repo: req.query.repo as string,
         org: req.query.org as string,githubLogin: req.query.githubLogin as string,
        })
    );
  } catch (err) {
    next(err);
  }
});

router.get(`/${ACCOUNT_ISSUE_API_ROUTE}`, async function (req, res, next) {
  try {
    return res.json(
      await getAccountIssue({
         title: req.query.title as string,
         repo: req.query.repo as string,
         org: req.query.org as string,githubLogin: req.query.githubLogin as string,
        })
    );
  } catch (err) {
    next(err);
  }
});

router.post(`/${NEW_ISSUE_API_ROUTE}`, async function (req, res, next) {
  try {
    console.log(req.query)
    return res.json(
      await newAccountIssue({
        githubLogin: req.query.githubLogin as string,
         githubId: req.query.githubId as string,
         fundingHash: req.query.fundingHash as string,
         fundingAmount: parseFloat(req.query.fundingAmount as string),
         title: req.query.title as string,
         repo: req.query.repo as string,
         org: req.query.org as string,
         solanaKey: new PublicKey(req.query.solanaKey as string)
        })
    );
  } catch (err) {
    next(err);
  }
});



// ACCOUNT PULL REQUEST

router.post(`/${ACCOUNT_PULL_REQUEST_API_ROUTE}`, async function (req, res, next) {
  try {
    return res.json(
      await insertAccountPullRequest({
         repo: req.query.repo as string,
         org: req.query.org as string,githubLogin: req.query.githubLogin as string,
         pullNumber: parseInt(req.query.pullNumber as string),
         amount: parseFloat(req.query.amount as string)
        })
    );
  } catch (err) {
    next(err);
  }
});

router.get(`/${ACCOUNT_PULL_REQUEST_API_ROUTE}`, async function (req, res, next) {
  try {
    return res.json(
      await getAccountPullRequest({
        repo: req.query.repo as string,
        org: req.query.org as string,githubLogin: req.query.githubLogin as string,
        pullNumber: parseInt(req.query.pullNumber as string),
        amount: parseFloat(req.query.amount as string)
       })
    );
  } catch (err) {
    next(err);
  }
});

router.post(`/${NEW_PULL_REQUEST_API_ROUTE}`, async function (req, res, next) {
  try {
    return res.json(
      await newPullRequest({
         title: req.query.title as string,
         repo: req.query.repo as string,
         org: req.query.org as string,
         pullNumber: parseInt(req.query.pullNumber as string),
         githubLogin: req.query.githubLogin as string,
         issueNumber: parseInt(req.query.issueNumber as string)
        })
    );
  } catch (err) {
    next(err);
  }
});

router.get(`/${FULL_PULL_REQUEST_API_ROUTE}`, async function (req, res, next) {
  try {
    return res.json(
      await getFullPullRequestByNumber({
         repo: req.query.repo as string,
         org: req.query.org as string,
         pullNumber: parseInt(req.query.pullNumber as string),
         githubLogin: req.query.githubLogin as string,
         issueNumber: parseInt(req.query.issueNumber as string)
        })
    );
  } catch (err) {
    next(err);
  }
});

router.post(`/${MERGE_PULL_REQUEST_API_ROUTE}`, (req, res) => {
  //when a request from auth0 is received we get auth code as query param

  var pull_number = parseInt(req.query.pullNumber as string);
  var issue_number = parseInt(req.query.issueNumber as string);
  var org = req.query.org as string;
  var repo = req.query.repo as string;
  var payoutHash = req.query.payoutHash as string;
  var github_id = req.query.githubId;
  var options = {
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
  axios.request(options).then(function (response) {
    var code = response.data.access_token
    var options = {
      method: 'GET',
      url: `https://dev-kgvm1sxe.us.auth0.com/api/v2/users/${github_id}`,
      headers: {'content-type': 'application/x-www-form-urlencoded', 'Authorization': `Bearer ${code}`},
    };

    axios.request(options).then(function (response) {

    const gh_token = response.data.identities[0].access_token;
    console.log(gh_token)
    const octokit = new Octokit({
      auth: gh_token,
    });
    octokit.request('PUT /repos/{owner}/{repo}/pulls/{pull_number}/merge', {
      owner: org,
      repo: repo,
      pull_number: pull_number
    }).then((resp) => {
      console.log(resp)
      updateIssueState({
        org: org,
        repo: repo,
        issueNumber: issue_number,
        state: 'approved'
      })
      updatePullRequestPayout({
        org: org,
        repo: repo,
        pullNumber: pull_number,
        payoutHash: payoutHash
      })

      return res.status(200).json({message: 'token acquired', data: response.data})
    }).catch((error) => {

      console.error(error);

      return res.status(error.status).send({message: error})
    })
    }).catch(function (error) {
      console.error(error);

      return res.status(error.status).send({message: error})
    })
  }).catch(function (error) {
    console.error(error);
    return res.status(error.status).send({message: error})

  });
});

export default router