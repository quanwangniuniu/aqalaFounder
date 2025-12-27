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
      
      // Members subcollection - keep private (only authenticated users can read)
      match /members/{memberId} {
        allow read: if request.auth != null;
        allow create: if request.auth != null;
        allow update: if request.auth != null;
        allow delete: if request.auth != null;
      }
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
- Consider if this level of public access aligns with your application's privacy requirements

## Testing

After updating the rules, verify:
1. Unauthenticated users can browse the rooms list
2. Unauthenticated users can view individual room pages
3. Unauthenticated users can see live translations
4. Unauthenticated users cannot create/update/delete rooms or translations
5. Member information is not accessible to unauthenticated users

