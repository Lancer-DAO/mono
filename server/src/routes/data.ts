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
  newAccountPullRequest,
  linkPullRequest,
} from "../controllers";
import {
  ACCOUNT_API_ROUTE,
  ACCOUNT_ISSUE_API_ROUTE,
  ACCOUNT_PULL_REQUEST_API_ROUTE,
  ISSUE_API_ROUTE,
  LINK_PULL_REQUEST_API_ROUTE,
  NEW_ISSUE_API_ROUTE,
  NEW_PULL_REQUEST_API_ROUTE,
  PULL_REQUEST_API_ROUTE,
} from "../constants";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
dayjs.extend(timezone);

const router = Router();

// USERS

router.post(`/${ACCOUNT_API_ROUTE}`, async function (req, res, next) {
  try {
    return res.json(
      await insertAccount({ githubId: req.query.github_id as string, solanaKey: new PublicKey(req.query.solana_key as string) })
    );
  } catch (err) {
    next(err);
  }
});

router.get(`/${ACCOUNT_API_ROUTE}`, async function (req, res, next) {
  try {
    return res.json(
      await getAccount({ githubId: req.query.github_id as string })
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
         fundingAmount: parseInt(req.query.fundingAmount as string),
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
           state: req.query.state as string
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
         org: req.query.org as string,
         githubId: req.query.github_id as string
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
         org: req.query.org as string,
         githubId: req.query.github_id as string
        })
    );
  } catch (err) {
    next(err);
  }
});

router.post(`/${NEW_ISSUE_API_ROUTE}`, async function (req, res, next) {
  try {
    return res.json(
      await newAccountIssue({
         githubId: req.query.github_id as string,
         fundingHash: req.query.fundingHash as string,
         fundingAmount: parseInt(req.query.fundingAmount as string),
         title: req.query.title as string,
         repo: req.query.repo as string,
         org: req.query.org as string,
         solanaKey: new PublicKey(req.query.solana_key as string)
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
         org: req.query.org as string,
         githubId: req.query.github_id as string,
         pullNumber: parseInt(req.query.pullNumber as string),
         amount: parseInt(req.query.amount as string)
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
        org: req.query.org as string,
        githubId: req.query.github_id as string,
        pullNumber: parseInt(req.query.pullNumber as string),
        amount: parseInt(req.query.amount as string)
       })
    );
  } catch (err) {
    next(err);
  }
});

router.post(`/${NEW_PULL_REQUEST_API_ROUTE}`, async function (req, res, next) {
  try {
    return res.json(
      await newAccountPullRequest({
         githubId: req.query.github_id as string,
         solanaKey: new PublicKey(req.query.solana_key as string),
         title: req.query.title as string,
         repo: req.query.repo as string,
         org: req.query.org as string,
         pullNumber: parseInt(req.query.pullNumber as string),
         amount: parseInt(req.query.amount as string)
        })
    );
  } catch (err) {
    next(err);
  }
});

export default router