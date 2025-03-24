from src.models import User, StatusEvent
from google.cloud import firestore

db = firestore.Client()


def put_user(user: User) -> User:
    # create new user
    new_user = db.collection("users").document()
    user_data = {
        "firebase_user_id": user.firebase_user_id,
        "email": user.email,
        "display_name": user.display_name,
    }
    new_user.set(user_data)
    return User(id=new_user.id, **user_data)


def patch_user(user: User) -> User:
    # update user
    db_user = db.collection("users").document(user.id)
    user_data = {
        "firebase_user_id": user.firebase_user_id,
        "email": user.email,
        "display_name": user.display_name,
        "slack_user_id": user.slack_user_id,
        "slack_access_token": user.slack_access_token,
    }
    db_user.update(user_data)
    return User(id=user.id, **user_data)


def get_user(user_id: str) -> User:
    user = db.collection("users").document(user_id).get()
    return User(id=user.id, **user.to_dict())


# Get user by their email (should be unique)
def get_user_by_email(email: str) -> User:
    users = db.collection("users").where("email", "==", email).limit(1).stream()
    for doc in users:
        return User(id=doc.id, **doc.to_dict())  # Firestore returns a dict
    return None


# Get user by their auth user_id
def get_user_by_firebase_user_id(firebase_user_id: str) -> User:
    users = (
        db.collection("users")
        .where("firebase_user_id", "==", firebase_user_id)
        .limit(1)
        .stream()
    )
    for doc in users:
        return User(id=doc.id, **doc.to_dict())  # Firestore returns a dict
    return None


def put_status_event(event: StatusEvent) -> StatusEvent:
    new_status_event = db.collection("status_events").document()
    status_event_data = {
        "user_id": event.user_id,
        "calendar_id": event.calendar_id,
        "event_id": event.event_id,
        "status_text": event.status_text,
        "status_emoji": event.status_emoji,
        "status_expiration": event.status_expiration,
        "start": event.start.isoformat(),  # Store timestamps as strings
        "end": event.end.isoformat(),
    }
    new_status_event.set(status_event_data)
    return StatusEvent(id=new_status_event.id, **status_event_data)


def get_status_events_by_user(user_id: str):
    events_ref = db.collection("status_events").where("user_id", "==", user_id).stream()
    return [StatusEvent(id=doc.id, **doc.to_dict()) for doc in events_ref]
