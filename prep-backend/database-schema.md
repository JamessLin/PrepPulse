# schedules:
id (uuid, primary key)
user_id (uuid, foreign key to profiles.id)
scheduled_time (timestamptz)
interview_type (varchar)
interview_mode (varchar, e.g., "peer-to-peer", "you-vs-ai", "you-vs-friend")
friend_email (varchar, nullable)
friend_status (varchar, nullable, e.g., "invited", "accepted")
status (varchar)
created_at (timestamptz)


# matches:
id (uuid, primary key)
schedule_id_1 (uuid, foreign key to schedules.id)
schedule_id_2 (uuid, foreign key to schedules.id, nullable)
participant_2_type (varchar, e.g., "user", "ai", "friend")
participant_2_id (varchar, e.g., "ai", friend email, or user ID)
room_name (varchar)
session_id (varchar)
ai_settings (jsonb, nullable, e.g., {"accent": "British"})
status (varchar)
created_at (timestamptz)


# resumes (new, optional):
id (uuid, primary key)
user_id (uuid, foreign key to profiles.id)
content (jsonb)
created_at (timestamptz)
updated_at (timestamptz)