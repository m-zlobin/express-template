const express = require("express"),
    router = express.Router(),
    passport = require("passport"),
    logger = require("@logger"),
    config = require("@config"),
    store = require("@store"),
    { xhrOnly } = require("@lib/filters");

router.get("/", xhrOnly, function (req, res) {
    return res.json({
        isAuthenticated: req.isAuthenticated(),
        registrationEnabled: req.app.get("registration-enabled"),
    });
});

router.get("/check-email/:email", xhrOnly, async function (req, res) {
    var email = req.params.email,
        user = await store.users.getByEmail(email);
    return res.json(!user);
});

router.get("/check-username/:username", xhrOnly, async function (req, res) {
    var username = req.params.username,
        user = await store.users.getByUsername(username);
    return res.json(!user);
});

router.post(["/signin", "/register"], xhrOnly, function (req, res, next) {
    let action = req.url.slice(1);
    passport.authenticate(action, function (err, user, info) {
        if (err) {
            logger.error(err);
            return res.status(400).json({ message: "Unknown error" });
        }
        if (!user) {
            return res.status(400).json(info);
        }
        req.login(user, function (err) {
            if (err) {
                logger.error(err);
                return res.status(400).json({ message: "Unknown error" });
            }
            return res.end();
        });
    })(req, res, next);
});

// redirect to Google to authenticate
router.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

// redirect to Facebook to authenticate
router.get(
    "/facebook",
    passport.authenticate("facebook", {
        scope: ["email"],
    })
);

// the callback after google/facebook has authenticated the user
router.get(["/google/callback", "/facebook/callback"], (req, res, next) => {
    let provider = req.url.split("/")[1],
        unknownError = encodeURIComponent("Unknown error");

    $DEBUG$ && console.log("OAuth callback", provider, "URL:", req.url);

    passport.authenticate(provider, function (err, user, info) {
        if (err) {
            logger.error(err);
            return res.redirect(
                `${config.dashboardUrl}/auth?error=${unknownError}`
            );
        }
        if (!user) {
            let errorMessage = encodeURIComponent(info.message);
            return res.redirect(
                `${config.dashboardUrl}/auth?error=${errorMessage}`
            );
        }
        req.login(user, function (err) {
            if (err) {
                logger.error(err);
                return res.redirect(
                    `${config.dashboardUrl}/auth?error=${unknownError}`
                );
            }
            return res.redirect(config.dashboardUrl);
        });
    })(req, res, next);
});

router.get("/signout", function (req, res) {
    req.logout();
    req.session.destroy();
    if (req.xhr) {
        return res.json(true);
    }
    return res.redirect("/");
});

module.exports = router;
