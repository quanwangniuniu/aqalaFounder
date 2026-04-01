# Firebase Analytics — Aqala Mobile

All event names use **snake_case**. Validate in **Firebase DebugView** (development builds). Analytics collection follows **Privacy > Analytics** consent; when disabled, the native SDK does not collect events.

## User properties

| Property      | Type   | Description                                      |
|---------------|--------|--------------------------------------------------|
| `user_id`     | string | Firebase Auth UID                               |
| `is_premium`  | string | `"true"` / `"false"`                            |
| `signup_date` | string | Account `YYYY-MM-DD` from profile `createdAt`   |
| `country`     | string | Device region from locale (best effort)          |
| `app_version` | string | App version from `expo-constants`               |

## Events

### Listening

| Event             | Parameters |
|-------------------|------------|
| `listening_start` | `room_id` (string), `content_id` (string), `source` (string) |
| `listening_end`   | Same + `duration_sec` (number) |

`source` examples: `discover`, `direct`, `share`, `homepage`, `translate_flow`, `room_listener`.

Room listening uses `content_id` = `room_live` for the in-room WebView; standalone translate uses `translate_listen`.

### Auth

| Event     | Parameters |
|-----------|------------|
| `login`   | `method`: `email` \| `apple` \| `google`, `success` (boolean) |
| `sign_up` | Same |

`login` / `sign_up` are fired from the auth screens after a successful sign-in or sign-up (not on every cold start).

### Rooms

| Event        | Parameters |
|--------------|------------|
| `room_enter` | `room_id`, `entry_source`, `room_type` (`public` / `private`) |
| `room_exit`  | Same |

`entry_source` is passed via route query, e.g. `/room/{id}?entry_source=homepage`. Defaults to `direct` if omitted.

### Monetization

| Event               | Parameters |
|---------------------|------------|
| `donate`            | `amount`, `currency`, `product_id`, `payment_method`, optional `action` |
| `subscribe_premium` | Same + optional `screen_name` |
| `purchase_success`  | Same + `restored` (boolean) |

`payment_method` is typically `apple` or `google` for IAP. Donate screen views use `amount: 0`, `payment_method: none`.

### UI interaction

| Event           | Parameters |
|-----------------|------------|
| `button_click`  | `element_name`, `screen_name`, optional `target_id` |
| `card_click`    | Same |
| `share_click`   | Same |
| `follow_user`   | `element_name`, `screen_name`, `target_id`, `action` (`follow` / `unfollow`) |
| `like_content`  | `element_name`, `screen_name`, optional `target_id` |

## Funnels (examples)

- **Login → Room → Listen → Subscribe:** `login` → `room_enter` → `listening_end` (with `duration_sec` > 0) → `subscribe_premium` → `purchase_success`.

## DebugView

1. Enable debug mode for iOS (e.g. `-FIRDebugEnabled` / `-FIRAnalyticsDebugEnabled` per Firebase docs for your setup).
2. Open the app from Xcode or `npx expo run:ios` with debug arguments if needed.
3. Confirm events in Firebase console → Analytics → DebugView.
