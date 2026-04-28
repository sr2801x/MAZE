const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { User } = require("../models/User");

function initPassport(passport) {
  const clientID = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const callbackURL = process.env.GOOGLE_CALLBACK_URL;

  if (!clientID || !clientSecret || !callbackURL) {
    return;
  }

  passport.use(
    new GoogleStrategy(
      { clientID, clientSecret, callbackURL },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile?.emails?.[0]?.value;
          if (!email) return done(new Error("Google account has no email"));

          const existing = await User.findOne({ email });
          if (existing) {
            if (!existing.googleId) existing.googleId = profile.id;
            if (!existing.name) existing.name = profile.displayName;
            if (!existing.avatarUrl) existing.avatarUrl = profile?.photos?.[0]?.value;
            await existing.save();
            return done(null, existing);
          }

          const user = await User.create({
            name: profile.displayName,
            email,
            googleId: profile.id,
            avatarUrl: profile?.photos?.[0]?.value,
            credits: 5,
            plan: "free",
          });

          return done(null, user);
        } catch (e) {
          return done(e);
        }
      }
    )
  );
}

module.exports = { initPassport };

