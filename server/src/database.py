from src.models import User, StatusEvent, StatusSync
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


def update_user(user: User) -> User:
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


def get_user_by_id(user_id: str) -> User:
    user = db.collection("users").document(user_id).get()
    return User(id=user.id, **user.to_dict())


# Get user by their email (should be unique)
def get_user_by_email(email: str) -> User:
    users = db.collection("users").where("email", "==", email).limit(1).stream()
    for doc in users:
        return User(id=doc.id, **doc.to_dict())
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
        return User(id=doc.id, **doc.to_dict())
    return None


def put_status_event(event: StatusEvent) -> StatusEvent:
    new_status_event = db.collection("status_events").document()
    status_event_data = {
        "user_id": event.user_id,
        "calendar_id": event.calendar_id,
        "event_id": event.event_id,
        "status_text": event.status_text,
        "status_emoji": event.status_emoji.model_dump() if event.status_emoji else None,
        "status_expiration": event.status_expiration,
        "start": event.start.isoformat(),  # Store timestamps as strings
        "end": event.end.isoformat(),
    }
    new_status_event.set(status_event_data)
    return StatusEvent(id=new_status_event.id, **status_event_data)


def update_status_event(event: StatusEvent) -> StatusEvent:
    db_event = db.collection("status_events").document(event.id)
    status_event_data = {
        "user_id": event.user_id,
        "calendar_id": event.calendar_id,
        "event_id": event.event_id,
        "status_text": event.status_text,
        "status_emoji": event.status_emoji.model_dump() if event.status_emoji else None,
        "status_expiration": event.status_expiration,
        "start": event.start.isoformat(),  # Store timestamps as strings
        "end": event.end.isoformat(),
    }
    db_event.update(status_event_data)
    return StatusEvent(id=event.id, **status_event_data)


def get_status_events_by_user(user_id: str):
    events = db.collection("status_events").where("user_id", "==", user_id).stream()
    return [StatusEvent(id=doc.id, **doc.to_dict()) for doc in events]


def get_status_event_by_id(id: str) -> StatusEvent:
    event = db.collection("status_events").document(id).get()
    return StatusEvent(id=event.id, **event.to_dict())


def delete_status_event(id: str):
    db.collection("status_events").document(id).delete()
    return True


def put_status_sync(status_sync: StatusSync) -> StatusSync:
    new_status_sync = db.collection("status_syncs").document()
    status_sync_data = {
        "task_id": status_sync.task_id,
        "status_event_id": status_sync.status_event_id,
        "user_id": status_sync.user_id,
        "scheduled_time": status_sync.scheduled_time.isoformat(),
        "status": status_sync.status,
    }
    new_status_sync.set(status_sync_data)
    return StatusSync(id=new_status_sync.id, **status_sync_data)


def get_status_sync_by_task_id(task_id: str):
    status_syncs = (
        db.collection("status_syncs").where("task_id", "==", task_id).limit(1).stream()
    )
    for doc in status_syncs:
        return StatusSync(id=doc.id, **doc.to_dict())
    return None


def delete_status_sync(id: str):
    db.collection("status_syncs").document(id).delete()
    return True
