import { Router } from "express";
import { PublicKey } from "@solana/web3.js";
import {
  insertAccountIssue,
  getAccountIssue,
  newAccountIssue,
} from "../../controllers";
import {
  ACCOUNT_ISSUE_API_ROUTE,
  NEW_ISSUE_API_ROUTE,
} from "../../constants";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import { createGithubIssue } from "../../controllers/github";
dayjs.extend(timezone);

const router = Router();

// ACCOUNT ISSUE

router.post(`/${ACCOUNT_ISSUE_API_ROUTE}`, async function (req, res, next) {
  try {
    return res.json(
      await insertAccountIssue({
         title: req.query.title as string,
         repo: req.query.repo as string,
         org: req.query.org as string,
         githubLogin: req.query.githubLogin as string,
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
      const requestData = req.body;
      console.log('data',requestData)
      // const issueCreationResp = await createGithubIssue(
      //     req.body
      // );
      // console.log(issueCreationResp)
      // const fullIssueData = {...requestData, issueNumber: issueCreationResp.data.number, githubLogin: issueCreationResp.data.user?.login}
    return res.json(
      await newAccountIssue(requestData)
    );
  } catch (err) {
    next(err);
  }
});

export default router