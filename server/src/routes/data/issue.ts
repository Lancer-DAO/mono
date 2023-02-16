import { Router } from "express";
import {
  insertIssue,
  getIssueByNumber,
  getIssueByTitle,
  updateIssueNumber,
  updateIssueState,
  getAllIssues,
  updateIssueHash,
  newAccountIssue,
} from "../../controllers";
import {
    GITHUB_ISSUE_API_ROUTE,
  ISSUE_API_ROUTE,
} from "../../constants";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import { createGithubIssue } from "../../controllers/github";
dayjs.extend(timezone);

const router = Router();

// ISSUE

router.post(`/${ISSUE_API_ROUTE}`, async function (req, res, next) {
    try {
      return res.json(
        await insertIssue({
          fundingHash: req.query.fundingHash as string,
           fundingAmount: parseFloat(req.query.fundingAmount as string),
           title: req.query.title as string,
           repo: req.query.repo as string,
           org: req.query.org as string, 
           fundingMint: req.query.org as string,
           tags: req.query.tags as string[],
           private: req.query.private === 'true',
           estimatedTime: parseFloat(req.query.estimatedTime as string),
          })
      );
    } catch (err) {
      next(err);
    }
  });

router.post(`/${GITHUB_ISSUE_API_ROUTE}`, async function (req, res, next) {
  try {
    const requestData = req.body;
    console.log('data',requestData)
    const issueCreationResp = await createGithubIssue(
        req.body
    );
    console.log(issueCreationResp)
        const issueNumber = issueCreationResp.data.number;
    return res.json(
        await newAccountIssue({...requestData, issueNumber: issueNumber})
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

router.get(`/${ISSUE_API_ROUTE}s`, async function (req, res, next) {
  try {
    return res.json(await getAllIssues())
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

router.put(`/${ISSUE_API_ROUTE}/funding_hash`, async function (req, res, next) {
    try {
      const requestData = req.body;
        return res.json(
          await updateIssueHash(requestData)
        );
    } catch (err) {
      next(err);
    }
  });

export default router