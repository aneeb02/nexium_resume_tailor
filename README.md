# Next.js + Supabase Authentication System

This project implements a complete authentication system using Next.js 15 with TypeScript and Supabase. It includes user registration, login, profile management, and data integration with your custom database schema.

## Features

- ✅ **User Registration & Login** - Sign up/sign in with email and password
- ✅ **Magic Link Authentication** - Passwordless sign-in with email magic links
- ✅ **Profile Management** - Users can update their profile information
- ✅ **Protected Routes** - Authentication-based page access
- ✅ **Dashboard** - User dashboard with profile and resume management
- ✅ **Database Integration** - Works with your `profiles` and `resumes` tables
- ✅ **Responsive Design** - Mobile-friendly UI with Tailwind CSS
- ✅ **TypeScript** - Full type safety throughout the application
- ✅ **SSR Support** - Server-side rendering with Supabase SSR

## Database Schema

The application works with your existing database schema:

```sql
-- Profiles table (linked to Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  avatar_url TEXT
);

-- Resumes table
CREATE TABLE resumes (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  original_file_name VARCHAR(255),
  enhanced_file_name VARCHAR(255),
  job_description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Project Structure

```
src/
├── app/
│   ├── auth/
│   │   ├── callback/
│   │   │   └── page.tsx      # Magic link callback handler
│   │   └── page.tsx          # Authentication page (login/signup/magic link)
│   ├── layout.tsx            # Root layout with AuthProvider
│   └── page.tsx              # Home page (dashboard or welcome)
├── components/
│   ├── AuthForm.tsx          # Login/signup form component
│   ├── MagicLinkForm.tsx     # Magic link form component
│   └── Dashboard.tsx         # User dashboard component
├── contexts/
│   └── AuthContext.tsx       # Authentication context and provider
└── utils/
    └── supabase/
        ├── client.ts         # Supabase client for browser
        ├── server.ts         # Supabase client for server
        └── middleware.ts     # Authentication middleware
```

## Setup Instructions

### 1. Environment Variables

Your `.env.local` file is already configured with:
```
NEXT_PUBLIC_SUPABASE_URL=https://auwwkuubfmjofboqjxqk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. Supabase Configuration

Make sure your Supabase project has:

1. **Email Authentication enabled** in Authentication > Settings
2. **Magic Link enabled** in Authentication > Settings > Magic Link
3. **Site URL configured** in Authentication > Settings:
   - Site URL: `http://localhost:3000` (for development)
   - Redirect URLs: `http://localhost:3000/auth/callback`
4. **Row Level Security (RLS)** policies for your tables:

```sql
-- Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see/edit their own profile
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Enable RLS on resumes table
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see/edit their own resumes
CREATE POLICY "Users can view their own resumes" ON resumes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own resumes" ON resumes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own resumes" ON resumes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own resumes" ON resumes
  FOR DELETE USING (auth.uid() = user_id);
```

### 3. Database Triggers (Optional)

Create a trigger to automatically create a profile when a user signs up:

```sql
-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'name', '');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

### 4. Run the Application

```bash
npm install
npm run dev
```

The application will be available at `http://localhost:3000`

## How to Use

### 1. **Authentication Flow**

- Visit the homepage - you'll see a welcome screen if not logged in
- Click "Sign In / Sign Up" to go to the authentication page
- You can toggle between login and signup modes
- **Magic Link Option**: On the sign-in page, click "Sign in with Magic Link" for passwordless authentication
- After successful signup, users receive a confirmation email
- After login (or clicking magic link), users are redirected to their dashboard

### 2. **Dashboard Features**

- **Profile Management**: Update your name and view account details
- **Resume Management**: View all your uploaded resumes (integrated with your existing `resumes` table)
- **Sign Out**: Securely logout from the application

### 3. **Protected Routes**

- The home page shows the dashboard only for authenticated users
- Unauthenticated users see a welcome screen with login prompt
- All user data is securely filtered by user ID

## Key Components Explained

### AuthContext
- Manages authentication state across the application
- Handles login, signup, logout, and profile updates
- Automatically creates profiles for new users

### AuthForm
- Reusable form component for login/signup
- Includes validation and error handling
- Clean, responsive design

### Dashboard
- Shows user profile information
- Displays user's resumes from the database
- Allows profile editing
- Secure logout functionality

### Middleware
- Handles authentication state on every request
- Refreshes user sessions automatically
- Protects routes and maintains security

## Security Features

- Row Level Security (RLS) policies
- Server-side authentication validation
- Secure cookie handling
- CSRF protection
- Session management

## Customization

You can easily extend this system by:

1. **Adding new user fields** to the profiles table
2. **Creating new protected pages** using the `useAuth` hook
3. **Adding social login** (Google, GitHub, etc.)
4. **Implementing email verification** flows
5. **Adding password reset** functionality

## Troubleshooting

1. **Authentication not working?**
   - Check your Supabase URL and keys in `.env.local`
   - Verify email authentication is enabled in Supabase

2. **Database errors?**
   - Ensure RLS policies are correctly set up
   - Check that your tables exist and have proper permissions

3. **Build errors?**
   - Run `npm install` to ensure all dependencies are installed
   - Check TypeScript errors in your editor

## Next Steps

With this authentication system in place, you can now:

1. **Add file upload functionality** for resumes
2. **Implement AI-powered resume enhancement** using your preferred AI service
3. **Add email templates** for user notifications
4. **Create admin panels** for managing users and resumes
5. **Add analytics** to track user activity

The foundation is solid and ready for your specific business logic!
