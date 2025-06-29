import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcryptjs';
import { storage } from './storage';
import type { Express } from 'express';
import { nanoid } from 'nanoid';

// Configure Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value;
      if (!email) {
        return done(new Error('No email found in Google profile'), null);
      }

      // Check if user exists
      let user = await storage.getUserByEmail(email);
      
      if (user) {
        // Update profile image if available
        if (profile.photos?.[0]?.value && !user.profileImageUrl) {
          await storage.updateUser(user.id, {
            profileImageUrl: profile.photos[0].value
          });
          user.profileImageUrl = profile.photos[0].value;
        }
        return done(null, user);
      } else {
        // Create new user
        const newUser = await storage.upsertUser({
          id: nanoid(),
          email: email,
          firstName: profile.name?.givenName || '',
          lastName: profile.name?.familyName || '',
          profileImageUrl: profile.photos?.[0]?.value || null,
          userType: 'organization', // Default type, can be changed later
        });
        return done(null, newUser);
      }
    } catch (error) {
      return done(error, null);
    }
  }));
}

// Configure Local Strategy for email/password
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, async (email, password, done) => {
  try {
    const user = await storage.getUserByEmail(email);
    if (!user) {
      return done(null, false, { message: 'Invalid email or password' });
    }

    // Check if user has a password (might be OAuth-only user)
    if (!user.hashedPassword) {
      return done(null, false, { message: 'Please sign in with Google or reset your password' });
    }

    const isValidPassword = await bcrypt.compare(password, user.hashedPassword);
    if (!isValidPassword) {
      return done(null, false, { message: 'Invalid email or password' });
    }

    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}));

// Serialize/deserialize user for session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await storage.getUser(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export function setupAuth(app: Express) {
  app.use(passport.initialize());
  app.use(passport.session());

  // Google OAuth routes
  app.get('/api/auth/google',
    passport.authenticate('google', { 
      scope: ['profile', 'email'] 
    })
  );

  app.get('/api/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
      // Successful authentication
      res.redirect('/dashboard');
    }
  );

  // Local authentication routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { firstName, lastName, email, password, userType } = req.body;

      // Validate input
      if (!firstName || !lastName || !email || !password || !userType) {
        return res.status(400).json({ message: 'All fields are required' });
      }

      if (password.length < 8) {
        return res.status(400).json({ message: 'Password must be at least 8 characters' });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const newUser = await storage.upsertUser({
        id: nanoid(),
        email,
        firstName,
        lastName,
        userType,
        hashedPassword,
      });

      // Log user in
      req.login(newUser, (err) => {
        if (err) {
          return res.status(500).json({ message: 'Registration successful but login failed' });
        }
        res.json({ message: 'Registration successful', user: newUser });
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/auth/login',
    passport.authenticate('local'),
    (req, res) => {
      res.json({ message: 'Login successful', user: req.user });
    }
  );

  app.post('/api/auth/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: 'Logout failed' });
      }
      res.json({ message: 'Logout successful' });
    });
  });

  // Get current user
  app.get('/api/auth/user', (req, res) => {
    if (req.isAuthenticated()) {
      res.json(req.user);
    } else {
      res.status(401).json({ message: 'Not authenticated' });
    }
  });
}

// Middleware to protect routes
export function requireAuth(req: any, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Authentication required' });
}