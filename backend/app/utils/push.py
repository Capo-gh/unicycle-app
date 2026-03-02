"""
Expo Push Notification utility.
Uses the Expo Push API to send notifications to mobile devices.
No Firebase/APNs credentials needed — Expo handles that.
"""
import httpx

EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send"


def send_push_notification(token: str, title: str, body: str, data: dict = None) -> bool:
    """
    Send a push notification via the Expo Push API.
    Returns True on success, False on failure.

    token: Expo push token (e.g. "ExponentPushToken[xxxxxx]")
    """
    if not token or not token.startswith("ExponentPushToken"):
        return False

    payload = {
        "to": token,
        "title": title,
        "body": body,
        "sound": "default",
        "badge": 1,
    }
    if data:
        payload["data"] = data

    try:
        resp = httpx.post(
            EXPO_PUSH_URL,
            json=payload,
            headers={
                "Accept": "application/json",
                "Accept-Encoding": "gzip, deflate",
                "Content-Type": "application/json",
            },
            timeout=5.0,
        )
        result = resp.json()
        # Expo returns {"data": {"status": "ok"}} or {"data": {"status": "error", ...}}
        ticket = result.get("data", {})
        if isinstance(ticket, list):
            ticket = ticket[0] if ticket else {}
        return ticket.get("status") == "ok"
    except Exception as e:
        print(f"[push] Failed to send push notification: {e}")
        return False
