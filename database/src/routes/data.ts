import { Router } from "express";
import { PublicKey } from "@solana/web3.js";
import {
  insertUser,
  getUser,
  insertRaffle,
  insertRaffleEntry,
  updateRaffleEntry,
  getRaffleEntry,
} from "../controllers";
import {
  USER_API_ROUTE,
  RAFFLE_API_ROUTE,
  RAFFLE_ENTRY_API_ROUTE,
  TICKET_API_ROUTE,
} from "../constants";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
dayjs.extend(timezone);

const router = Router();

// USERS

router.post(`/${USER_API_ROUTE}`, async function (req, res, next) {
  try {
    return res.json(
      await insertUser({ userKey: new PublicKey(req.query.user_key) })
    );
  } catch (err) {
    next(err);
  }
});

router.get(`/${USER_API_ROUTE}`, async function (req, res, next) {
  try {
    return res.json(
      await getUser({ userKey: new PublicKey(req.query.user_key) })
    );
  } catch (err) {
    next(err);
  }
});

// RAFFLE

router.post(`/${RAFFLE_API_ROUTE}`, async function (req, res, next) {
  try {
    console.log("hi");
    const raffleKey = new PublicKey(req.query.raffle_key);
    console.log("key", raffleKey);
    const raffleMint = req.query.raffle_mint
      ? new PublicKey(req.query.raffle_mint)
      : undefined;
    console.log("mint", raffleMint);
    const expiration = dayjs(req.query.expiration);
    console.log("expiration", expiration);
    return res.json(
      await insertRaffle({
        raffleKey: raffleKey,
        raffleType: req.query.raffle_type,
        raffleMint: raffleMint,
        maxTickets: req.query.max_tickets,
        expiration: expiration,
        hidden: req.query.hidden,
      })
    );
  } catch (err) {
    next(err);
  }
});

// RAFFLE ENTRY

router.post(`/${RAFFLE_ENTRY_API_ROUTE}`, async function (req, res, next) {
  try {
    const userKey = new PublicKey(req.query.user_key);
    const raffleKey = new PublicKey(req.query.raffle_key);
    return res.json(
      await insertRaffleEntry({
        userKey: userKey,
        raffleKey: raffleKey,
        count: req.query.count,
      })
    );
  } catch (err) {
    next(err);
  }
});

router.put(`/${RAFFLE_ENTRY_API_ROUTE}`, async function (req, res, next) {
  try {
    const userKey = new PublicKey(req.query.user_key);
    const raffleKey = new PublicKey(req.query.raffle_key);
    return res.json(
      await updateRaffleEntry({
        userKey: userKey,
        raffleKey: raffleKey,
        count: req.query.count,
      })
    );
  } catch (err) {
    next(err);
  }
});

router.get(`/${RAFFLE_ENTRY_API_ROUTE}`, async function (req, res, next) {
  try {
    const userKey = new PublicKey(req.query.user_key);
    const raffleKey = new PublicKey(req.query.raffle_key);
    return res.json(
      await getRaffleEntry({
        userKey: userKey,
        raffleKey: raffleKey,
      })
    );
  } catch (err) {
    next(err);
  }
});

// TICKET

router.post(`/${TICKET_API_ROUTE}`, async function (req, res, next) {
  try {
    const userKey = new PublicKey(req.query.user_key);
    const raffleKey = new PublicKey(req.query.raffle_key);
    const userExists = (await getUser({ userKey })).rowCount > 0;
    if (!userExists) {
      insertUser({ userKey: userKey });
    }

    const maybeRaffleEntry = await getRaffleEntry({ userKey, raffleKey });
    const raffleEntryExists = maybeRaffleEntry.length > 0;

    if (raffleEntryExists) {
      const totalTickets =
        parseInt(req.query.count) + parseInt(maybeRaffleEntry[0].count);
      return res.json(
        await updateRaffleEntry({
          userKey: userKey,
          raffleKey: raffleKey,
          count: totalTickets,
        })
      );
    } else {
      return res.json(
        await insertRaffleEntry({
          userKey: userKey,
          raffleKey: raffleKey,
          count: req.query.count,
        })
      );
    }
  } catch (err) {
    next(err);
  }
});

router.get(`/${TICKET_API_ROUTE}`, async function (req, res, next) {
  try {
    const userKey = new PublicKey(req.query.user_key);
    const raffleKey = new PublicKey(req.query.raffle_key);
    const maybeRaffleEntry = await getRaffleEntry({
      userKey: userKey,
      raffleKey: raffleKey,
    });
    if (maybeRaffleEntry.length > 0) {
      return res.json(maybeRaffleEntry[0]);
    } else {
      return res.json({ count: 0 });
    }
  } catch (err) {
    next(err);
  }
});

export default router;
