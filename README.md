# Nexium Resume Tailor - AI-Powered Resume Analysis & Enhancement Platform

Nexium Resume Tailor is a comprehensive AI-powered platform built with Next.js 15, TypeScript, and Supabase that helps job seekers optimize their resumes for specific positions. The platform analyzes resumes against job descriptions using advanced AI models, provides detailed feedback, and generates enhanced versions to improve job application success rates.

## 🚀 Core Features

### **AI-Powered Resume Analysis**

- ✅ **Smart Resume Analysis** - AI evaluation of resume-job fit with 1-10 scoring
- ✅ **Detailed Feedback** - Comprehensive strengths, weaknesses, and improvement suggestions
- ✅ **Risk Assessment** - Low/Medium/High risk analysis for hiring decisions
- ✅ **Reward Potential** - Best-case scenario projections and fit duration estimates
- ✅ **Job Description Matching** - Tailored analysis based on specific job requirements
- ✅ **Enhanced Resume Generation** - AI-optimized resume versions for better ATS compatibility

### **File Management & Processing**

- ✅ **Multi-Format Support** - PDF and DOCX resume upload with validation
- ✅ **Secure File Storage** - Supabase Storage integration with user-isolated file management
- ✅ **Document Processing** - Intelligent text extraction and content analysis
- ✅ **Download Options** - Access both original and AI-enhanced resume versions

### **User Experience & Authentication**

- ✅ **Secure Authentication** - Email/password and magic link sign-in options
- ✅ **User Dashboard** - Centralized resume management and analysis history
- ✅ **Real-time Status** - Live updates on analysis progress and completion
- ✅ **Responsive Design** - Modern, mobile-friendly interface with custom styling
- ✅ **Profile Management** - User account settings and preferences

### **Technical Excellence**

- ✅ **TypeScript** - Full type safety and enhanced developer experience
- ✅ **Next.js 15** - Latest React framework with App Router and SSR
- ✅ **Supabase Integration** - Real-time database, authentication, and storage
- ✅ **External AI Pipeline** - n8n workflow integration for AI processing
- ✅ **Row Level Security** - Database-level security policies for data protection

## 📊 Database Schema

The platform uses a comprehensive database schema optimized for AI-powered resume analysis:

```sql
-- User Profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Resume Storage and Analysis Results
CREATE TABLE resumes (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- File Management
  original_file_name VARCHAR(255) NOT NULL,
  enhanced_file_name VARCHAR(255),
  storage_path TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type VARCHAR(100) NOT NULL,

  -- Job Context
  job_description TEXT,

  -- Processing Status
  status VARCHAR(50) DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'analyzing', 'analyzed', 'error')),

  -- AI Analysis Results (JSONB for flexible schema)
  analysis_result JSONB,
  enhanced_resume_text TEXT,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  analyzed_at TIMESTAMP
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
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
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

### 1. **Dashboard Features**

- **Profile Management**: Update your name and view account details
- **Resume Management**: View all your uploaded resumes (integrated with your existing `resumes` table)
- **Sign Out**: Securely logout from the application

### 2. **Protected Routes**

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
