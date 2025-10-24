import os
import json
from config import Config

def load_users():
    """Carga usuarios desde JSON."""
    if not os.path.exists(Config.USERS_FILE):
        return []
    with open(Config.USERS_FILE, "r", encoding="utf-8") as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return []

def save_users(users):
    """Guarda usuarios en JSON."""
    with open(Config.USERS_FILE, "w", encoding="utf-8") as f:
        json.dump(users, f, indent=4, ensure_ascii=False)

def register_user_if_new(user_info):
    user_info = user_info
    pass
    '''
    users = load_users()
    email = user_info.get("email")

    for u in users:
        if u["email"] == email:
            return False

    new_user = {
        "id": str(uuid.uuid4()),
        "name": user_info.get("name"),
        "email": email,
        "picture": user_info.get("picture")
    }
    users.append(new_user)
    save_users(users)
    return True
    '''