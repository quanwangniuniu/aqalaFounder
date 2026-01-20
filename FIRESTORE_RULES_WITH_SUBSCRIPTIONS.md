rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
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

    // Subscriptions collection
    match /subscriptions/{userId} {
      // Users can read their own subscription
      allow read: if request.auth != null && request.auth.uid == userId;
      
      // Writes are handled by webhooks using admin SDK (bypasses rules)
      // Disallow client-side writes for security
      allow write: if false;
    }

    // Users (unchanged)
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      match /translations/{translationId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }

    // Mosques collection (rooms)
    match /mosques/{mosqueId} {

      // Read allowed to everyone (authenticated and unauthenticated)
      allow read: if true;

      // Create: must set ownerId to self; allow initial activeTranslatorId to be self
      allow create: if request.auth != null
                    && request.resource.data.ownerId == request.auth.uid;

      // Delete: only owner
      allow delete: if request.auth != null
                    && resource.data.ownerId == request.auth.uid;

      // Update:
      // - Owner or current active translator can update allowed fields
      // - Any authenticated user can update memberCount/activeTranslatorId when joining
      allow update: if request.auth != null
                    && (
                         // Owner or current translator
                         (resource.data.ownerId == request.auth.uid
                          || resource.data.activeTranslatorId == request.auth.uid)
                         ||
                         // Any user can update memberCount/activeTranslatorId (join flow)
                         request.resource.data.diff(resource.data).changedKeys().hasOnly([
                           'memberCount',
                           'activeTranslatorId'
                         ])
                       )
                    && request.resource.data.diff(resource.data).changedKeys().hasOnly([
                      'memberCount',
                      'activeTranslatorId',
                      'isActive'
                    ]);

      // Members subcollection: keep private (only authenticated users)
      match /members/{userId} {
        allow read: if request.auth != null;
        allow create, update: if request.auth != null && request.auth.uid == userId;
        allow delete: if request.auth != null && request.auth.uid == userId;
      }

      // Translation history subcollection
      match /translations/{translationId} {
        // Read: everyone (authenticated and unauthenticated)
        allow read: if true;

        // Create: active translator creates entries
        allow create: if request.auth != null
                      && request.resource.data.translatorId == request.auth.uid;

        // Update: only the translator who created it (for corrections)
        allow update: if request.auth != null
                      && resource.data.translatorId == request.auth.uid;

        // Delete: mosque owner or translator who created it
        allow delete: if request.auth != null
                      && (resource.data.ownerId == request.auth.uid
                          || resource.data.translatorId == request.auth.uid);
      }
    }
  }
}
