var express = require("express");
var router = express.Router();
const User = require("../models/users");
const webpush = require("web-push");

webpush.setVapidDetails(
  "mailto:romainauthier@outlook.com",
  process.env.EXPO_PUBLIC_VAPID_PUBLIC_KEY,
  process.env.EXPO_PUBLIC_VAPID_PRIVATE_KEY,
);

// POST envoi notification
router.post("/send", async (req, res) => {
  const { tokenList, title, url, body } = req.body;

  try {
    const userList = await User.find({ token: { $in: tokenList } });

    const payload = { title, url, body };

    if (userList.length === 0) {
      return res.status(404).json({
        result: false,
        message: "Aucun.e utilisateur.ice à qui envoyer la notification",
      });
    }

    const notifPromises = userList
      .filter((user) => user.subscription)
      .map((user) => {
        return webpush
          .sendNotification(user.subscription, JSON.stringify(payload))
          .catch(async (err) => {
            if (err.statusCode === 410 || err.statusCode === 404) {
              console.log(
                `Subscription expirée pour ${user.name}, suppression.`,
              );
              await User.updateOne(
                { token: user.token },
                { subscription: null },
              );
            }
            throw err;
          });
      });

    const results = await Promise.allSettled(notifPromises);

    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        console.log(`Succès pour ${userList[index].name}`);
      } else {
        console.log(
          `Echec pour ${userList[index].name},`,
          result.reason.message,
        );
      }
    });

    if (results) {
      res
        .status(200)
        .json({ result: true, results, message: "Notifications envoyées !" });
    }
  } catch (err) {
    res.status(500).json({ result: false, message: err.message });
    console.error(err);
  }
});

module.exports = router;
