DROP TRIGGER update_room_states_trigger ON room_states;
DROP TRIGGER update_rooms_trigger ON rooms;
DROP TRIGGER update_topic_states_trigger ON topic_states;
DROP TRIGGER update_topics_trigger ON topics;
DROP TRIGGER update_icons_trigger ON icons;
DROP TRIGGER update_admins_trigger ON admins;
DROP TRIGGER update_sender_types_trigger ON sender_types;
DROP TRIGGER update_chat_item_types_trigger ON chat_item_types;
DROP TRIGGER update_service_admins_trigger ON service_admins;

DROP FUNCTION set_update_time();

DROP TABLE IF EXISTS service_admins;

DROP TABLE IF EXISTS stamps;

DROP TABLE IF EXISTS topics_pinned_chat_items;
DROP TABLE IF EXISTS chat_items;
DROP TABLE IF EXISTS chat_item_types;
DROP TABLE IF EXISTS sender_types;

DROP TABLE IF EXISTS rooms_admins;
DROP TABLE IF EXISTS admins;

DROP TABLE IF EXISTS topics_speakers;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS icons;

DROP TABLE IF EXISTS topic_opened_at;
DROP TABLE IF EXISTS topic_paused_at;
DROP TABLE IF EXISTS topics;
DROP TABLE IF EXISTS topic_states;

DROP TABLE IF EXISTS rooms;
DROP TABLE IF EXISTS room_states;
