const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const MicrosoftStrategy = require('passport-microsoft').Strategy;
const User = require('../models/User');

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) { done(err, null); }
});

async function findOrCreate(provider, oauthId, name, email) {
  let user = await User.findOne({ oauthId, provider });
  if (!user) {
    const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim());
    user = await User.create({
      provider, oauthId, name, email,
      role: adminEmails.includes(email) ? 'admin' : 'user'
    });
  }
  return user;
}

// Google
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: `${process.env.BACKEND_URL || 'http://localhost:4000'}/api/auth/google/callback`
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const user = await findOrCreate('google', profile.id, profile.displayName, profile.emails?.[0]?.value);
    done(null, user);
  } catch (err) { done(err, null); }
}));

// GitHub
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: `${process.env.BACKEND_URL || 'http://localhost:4000'}/api/auth/github/callback`
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const user = await findOrCreate('github', String(profile.id), profile.displayName || profile.username, profile.emails?.[0]?.value);
    done(null, user);
  } catch (err) { done(err, null); }
}));

// Microsoft
passport.use(new MicrosoftStrategy({
  clientID: process.env.MICROSOFT_CLIENT_ID,
  clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
  callbackURL: `${process.env.BACKEND_URL || 'http://localhost:4000'}/api/auth/microsoft/callback`,
  scope: ['user.read']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails?.[0]?.value || profile._json?.mail || profile._json?.userPrincipalName;
    const user = await findOrCreate('microsoft', profile.id, profile.displayName, email);
    done(null, user);
  } catch (err) { done(err, null); }
}));

module.exports = passport;