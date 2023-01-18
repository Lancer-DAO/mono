import { Router } from "express";
import { DB } from "../db";

const router = Router();

router.get("/db-connection", async (req, res) => {
  try {
    await DB.query("SELECT $1::text as message", ["Hello world!"]);
    res.send("successfully connected to db.");
  } catch (err) {
    res.send("error connecting to db.");
  }
});

export default router;
