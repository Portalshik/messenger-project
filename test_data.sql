-- Очистка существующих данных
DELETE FROM messages;
DELETE FROM rel_users_to_chat;
DELETE FROM chats;
DELETE FROM users;

-- Добавление тестовых пользователей
INSERT INTO users (username, hashed_password, email, active, created_at, avatar) VALUES
('ivan_petrov', '$2b$12$WZ3QfS5i2KC7/g.kyph0A.uqPxihVP.cyYuLZlBM4Xjufch4ZnOvq', 'ivan@example.com', true, NOW(), 'https://i.pravatar.cc/150?img=1'),
('anna_smirnova', '$2b$12$/LWgnXmVvMehgOdgd7K0LOc9XnKlPkyEl1Yy7MX4BrdOW1ydUzCuO', 'anna@example.com', true, NOW(), 'https://i.pravatar.cc/150?img=2'),
('alex_ivanov', '$2b$12$CjHJz35Mcg/m.OFyjYl7AeNG2TVosmRcBKH5c6eLk6G0d1hj2Kku6', 'alex@example.com', true, NOW(), 'https://i.pravatar.cc/150?img=3'),
('maria_kuznetsova', '$2b$12$Ud1RfSgiDr102eu9oypuBuVKx8ACIvcHaNaKZ8TTfnEi7byK3Yq8y', 'maria@example.com', true, NOW(), 'https://i.pravatar.cc/150?img=4'),
('dmitry_sokolov', '$2b$12$ldSLq3khXTP8B76jS0tj1u497KCIv165JkbtSaz9HIHPchaJ1eHma', 'dmitry@example.com', true, NOW(), 'https://i.pravatar.cc/150?img=5');

-- Комментарий: Пароли для тестовых пользователей:
-- ivan_petrov: Ivan2024!
-- anna_smirnova: Anna2024!
-- alex_ivanov: Alex2024!
-- maria_kuznetsova: Maria2024!
-- dmitry_sokolov: Dmitry2024!

-- Сброс последовательностей
ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE chats_id_seq RESTART WITH 1;
ALTER SEQUENCE messages_id_seq RESTART WITH 1;

-- Создание личных чатов
INSERT INTO chats (name, is_group, admin_id) VALUES
('Чат с Анной', false, 1),
('Чат с Алексеем', false, 1),
('Чат с Марией', false, 2),
('Чат с Дмитрием', false, 3);

-- Добавление участников в чаты
INSERT INTO rel_users_to_chat (user_id, chat_id) VALUES
(1, 1), (2, 1),  -- Иван и Анна
(1, 2), (3, 2),  -- Иван и Алексей
(2, 3), (4, 3),  -- Анна и Мария
(3, 4), (5, 4);  -- Алексей и Дмитрий

-- Добавление сообщений в чат Ивана и Анны
INSERT INTO messages (chat_id, sender_id, content, sended_at) VALUES
(1, 1, 'Привет, Анна! Как дела?', NOW() - interval '2 days'),
(1, 2, 'Привет! Всё хорошо, спасибо! Как ты?', NOW() - interval '2 days' + interval '5 minutes'),
(1, 1, 'Тоже неплохо! Готовишься к завтрашней встрече?', NOW() - interval '2 days' + interval '10 minutes'),
(1, 2, 'Да, уже почти всё готово. Ты презентацию подготовил?', NOW() - interval '2 days' + interval '15 minutes'),
(1, 1, 'Да, вчера закончил. Можешь посмотреть, если хочешь', NOW() - interval '2 days' + interval '20 minutes');

-- Добавление сообщений в чат Ивана и Алексея
INSERT INTO messages (chat_id, sender_id, content, sended_at) VALUES
(2, 1, 'Алексей, привет! Ты не забыл про футбол в субботу?', NOW() - interval '1 day'),
(2, 3, 'Привет! Нет, не забыл. Во сколько встречаемся?', NOW() - interval '1 day' + interval '2 minutes'),
(2, 1, 'В 15:00 на стадионе. Принеси мяч, я забуду', NOW() - interval '1 day' + interval '5 minutes'),
(2, 3, 'Хорошо, не проблема. Кто ещё идёт?', NOW() - interval '1 day' + interval '7 minutes'),
(2, 1, 'Дмитрий и Сергей точно будут, остальные пока не ответили', NOW() - interval '1 day' + interval '10 minutes');

-- Добавление сообщений в чат Анны и Марии
INSERT INTO messages (chat_id, sender_id, content, sended_at) VALUES
(3, 2, 'Маша, привет! Ты не знаешь, где можно купить хороший кофе?', NOW() - interval '3 hours'),
(3, 4, 'Привет! Да, есть отличная кофейня на Ленина, 15. Там очень вкусный эспрессо', NOW() - interval '3 hours' + interval '3 minutes'),
(3, 2, 'Спасибо! А цены нормальные?', NOW() - interval '3 hours' + interval '5 minutes'),
(3, 4, 'Да, вполне. Эспрессо стоит 150 рублей, капучино 200', NOW() - interval '3 hours' + interval '7 minutes'),
(3, 2, 'Отлично, зайду сегодня после работы', NOW() - interval '3 hours' + interval '10 minutes');

-- Добавление сообщений в чат Алексея и Дмитрия
INSERT INTO messages (chat_id, sender_id, content, sended_at) VALUES
(4, 3, 'Дмитрий, привет! Как прошла вчерашняя встреча?', NOW() - interval '12 hours'),
(4, 5, 'Привет! Всё прошло хорошо, проект одобрили', NOW() - interval '12 hours' + interval '5 minutes'),
(4, 3, 'Отлично! А когда начинаем работу?', NOW() - interval '12 hours' + interval '8 minutes'),
(4, 5, 'С понедельника. Кстати, тебе нужно будет подготовить документацию', NOW() - interval '12 hours' + interval '10 minutes'),
(4, 3, 'Понял, займусь этим в выходные', NOW() - interval '12 hours' + interval '12 minutes'); 