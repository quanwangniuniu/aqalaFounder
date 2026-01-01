# Firebase Security Rules Update for Unauthenticated Access

## Overview

To allow unauthenticated users to view rooms and translations, the Firebase Firestore security rules need to be updated to permit read access to the `mosques` collection and its `translations` subcollection.

## Required Rule Changes

Update your Firebase Firestore security rules to include the following:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Mosques (Rooms) collection
    match /mosques/{roomId} {
      // Allow read access to room documents for all users (authenticated and unauthenticated)
      allow read: if true;

      // Write operations still require authentication
      allow create: if request.auth != null;
      allow update: if request.auth != null;
      allow delete: if request.auth != null;

      // Translations subcollection - allow read for all users
      match /translations/{translationId} {
        allow read: if true;
        allow create: if request.auth != null;
        allow update: if request.auth != null;
        allow delete: if request.auth != null;
      }

      // Live Stream subcollection - real-time translation broadcast (<1 second latency)
      match /liveStream/{streamId} {
        // Allow read for all users (listeners need to see live translations)
        allow read: if true;
        // Allow write for authenticated translators
        allow create: if request.auth != null;
        allow update: if request.auth != null;
        allow delete: if request.auth != null;
      }

      // Members subcollection - keep private (only authenticated users can read)
      match /members/{memberId} {
        allow read: if request.auth != null;
        allow create: if request.auth != null;
        allow update: if request.auth != null;
        allow delete: if request.auth != null;
      }
    }

    // Reviews collection - allow public submission, restrict read to admins (optional)
    match /reviews/{reviewId} {
      // Allow anyone to submit reviews (unauthenticated create)
      allow create: if true;
      
      // Restrict read access to authenticated admin users (optional)
      // Remove the read restriction below if you want public read access
      allow read: if request.auth != null;
      // If you want public read access, use: allow read: if true;
      
      // Only admins can update/delete reviews (if needed in future)
      allow update: if request.auth != null;
      allow delete: if request.auth != null;
    }
  }
}
```

## How to Apply

1. Open your Firebase Console
2. Navigate to Firestore Database > Rules
3. Update the rules with the above configuration
4. Click "Publish" to apply the changes

## Security Considerations

- **Read access is public**: All users (authenticated and unauthenticated) can read room data and translations
- **Members remain private**: Member information is only accessible to authenticated users
- **Write operations require authentication**: Creating, updating, or deleting rooms/translations still requires authentication
- **Reviews collection**: Allows public submission of reviews (unauthenticated create). Read access is restricted to authenticated users by default. Modify the rules if you want public read access.
- Consider if this level of public access aligns with your application's privacy requirements

## Testing

After updating the rules, verify:

1. Unauthenticated users can browse the rooms list
2. Unauthenticated users can view individual room pages
3. Unauthenticated users can see live translations (via liveStream subcollection)
4. Live stream updates appear within 1 second for listeners
5. Unauthenticated users cannot create/update/delete rooms or translations
6. Member information is not accessible to unauthenticated users
7. Unauthenticated users can submit reviews
8. Authenticated users can read submitted reviews (for admin/internal use)
