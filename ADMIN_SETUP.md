# Admin Panel Setup

This document explains how to set up and use the admin panel for managing user subscriptions.

## Environment Variable Setup

To enable admin access, you need to set the `ADMIN_USER_IDS` environment variable in your `.env` file:

```bash
ADMIN_USER_IDS=user_id_1,user_id_2,user_id_3
```

**How to get user IDs:**

1. Log in to your application with your Google account
2. Check the database `User` table for your user ID, or
3. Use the browser developer tools to inspect the session object

## Admin Panel Features

The admin panel is accessible at `/admin` and provides the following functionality:

### Authentication & Authorization

-   **Server-side authentication check**: Verifies user is logged in
-   **Admin authorization**: Checks if user ID is in the `ADMIN_USER_IDS` environment variable
-   **Automatic redirects**: Non-authenticated users go to `/login`, non-admin users go to `/`

### Subscription Management

-   **View all subscriptions**: See all user subscriptions in a table format
-   **Create new subscriptions**: Add subscriptions for any user
-   **Edit existing subscriptions**: Modify subscription details
-   **Delete subscriptions**: Remove subscriptions (with confirmation)

### Available Subscription Plans

-   **Free Plan**: Basic access with limited features
-   **Basic Plan**: Enhanced features for small businesses
-   **Pro Plan**: Advanced features for growing businesses
-   **Enterprise Plan**: Full features for large organizations

### Subscription Fields

-   **User**: Select from existing users
-   **Plan ID & Name**: Choose from predefined plans
-   **Status**: Active, Trialing, Past Due, Cancelled, Expired
-   **Billing Cycle**: Monthly or Yearly
-   **Amount**: Subscription price
-   **Feature Limits**: Max customers, jobs, and monthly invoices (null = unlimited)
-   **Billing Period**: Start and end dates for the current billing cycle

## API Endpoints

The admin panel uses the following API endpoints:

-   `GET /api/admin/users` - Fetch all users
-   `GET /api/admin/subscriptions` - Fetch all subscriptions
-   `POST /api/admin/subscriptions` - Create new subscription
-   `PUT /api/admin/subscriptions/[id]` - Update subscription
-   `DELETE /api/admin/subscriptions/[id]` - Delete subscription

All endpoints require:

1. Valid authentication session
2. User ID to be in the `ADMIN_USER_IDS` environment variable

## Security Features

-   **Server-side validation**: All admin checks happen on the server
-   **Environment-based access control**: Admin access controlled via environment variables
-   **Session validation**: Uses NextAuth session management
-   **Automatic subscription management**: Creating a new subscription automatically cancels existing active ones for the same user

## Usage Instructions

1. **Set up admin access**: Add your user ID to `ADMIN_USER_IDS` in your environment
2. **Access the admin panel**: Navigate to `/admin` while logged in
3. **Manage subscriptions**:
    - Click "Create Subscription" to add new ones
    - Click the edit icon to modify existing subscriptions
    - Click the delete icon to remove subscriptions (with confirmation)
4. **Monitor subscription status**: View all subscription details in the table

## Notes

-   When creating a new subscription, any existing active/trialing subscriptions for that user will be automatically cancelled
-   The admin panel respects the existing database schema and business logic
-   All changes are immediately reflected in the user's session and app functionality
-   The interface is built with Mantine UI components for a consistent look and feel
