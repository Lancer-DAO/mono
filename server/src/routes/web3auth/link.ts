import {merge, isArray} from 'lodash';
import { Router } from "express";


const router = Router();


router.post("/", (req, res) => {
  const { connection, email, userid } = req.body;
  // save userid in session.
  req.appSession.linking = { targetUserId: userid };

  const authorizationParams = {
    max_age: 0,
    login_hint: email,
    connection: connection,
  };
  // Passwordless connection doesn't work with connection param.
  if (["email", "sms"].includes(authorizationParams.connection))
    delete authorizationParams.connection;
  // [re]-authenticate target account before account linking
  res.openid.login({
    returnTo: "/user",
    authorizationParams,
  });
});

router.post("/delete", async (req, res) => {
  const { provider, userId } = req.body;
  const { sub } = req.appSession.claims;
  try {
    await auth0Client.unlinkAccounts(sub, provider, userId);
  } catch (err) {
    debug("unlinkAccounts failed: %o", err);
  } finally {
    res.redirect("/user");
  }
});

/*
 * Recursively merges user_metadata and app_metadata from secondary into primary user.
 * Data of primary user takes preponderance.
 * Array fields are joined.
 */
async function mergeMetadata(primaryUserId, secondaryUserId) {
  // load both users with metedata.
  const [primaryUser, secondaryUser] = await Promise.all(
    [primaryUserId, secondaryUserId].map((uid) => auth0Client.getUser(uid))
  );

  const customizerCallback = function (objectValue, sourceValue) {
    if (isArray(objectValue)) {
      return sourceValue.concat(objectValue);
    }
  };
  const mergedUserMetadata = merge(
    {},
    secondaryUser.user_metadata,
    primaryUser.user_metadata,
    customizerCallback
  );
  const mergedAppMetadata = merge(
    {},
    secondaryUser.app_metadata,
    primaryUser.app_metadata,
    customizerCallback
  );
  await auth0Client.updateUser(primaryUserId, {
    user_metadata: mergedUserMetadata,
    app_metadata: mergedAppMetadata,
  });
}

async function accountLink(req, res, next) {
  const {
    linking: { targetUserId },
  } = req.appSession;
  const { sub: authenticatedTargetUserId } = req.openidTokens.claims();
  if (authenticatedTargetUserId !== targetUserId) {
    debug(
      "Skipping account linking as the authenticated user(%s) is different than target linking user (%s)",
      authenticatedTargetUserId,
      targetUserId
    );
    set(req, Errors.WrongAccount);
    return next();
  }

  debug(
    "User %s succesfully authenticated. Account linking with %s... ",
    authenticatedTargetUserId,
    targetUserId
  );
  const { id_token: targetIdToken } = req.openidTokens;
  const { sub: primaryUserId } = req.appSession.claims;

  try {
    await mergeMetadata(primaryUserId, authenticatedTargetUserId);
    await auth0Client.linkAccounts(primaryUserId, targetIdToken);
    debug("Accounts linked.");
  } catch (err) {
    debug("Linking failed %o", err);
  } finally {
    next();
  }
}

export default router;