import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  Fade,
  Badge,
  Tooltip,
} from '@mui/material';
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  Add as AddIcon,
  PersonAdd as PersonAddIcon,
  Image as ImageIcon,
  Group as GroupIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

function Chat() {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [openNewChat, setOpenNewChat] = useState(false);
  const [newChatName, setNewChatName] = useState('');
  const [isGroup, setIsGroup] = useState(false);
  const messagesEndRef = useRef(null);
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [openInvite, setOpenInvite] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [userResults, setUserResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [newChatUserSearch, setNewChatUserSearch] = useState('');
  const [newChatUserResults, setNewChatUserResults] = useState([]);
  const [newChatSelectedUser, setNewChatSelectedUser] = useState(null);

  const handleNewMessage = useCallback((message) => {
    if (message.chat_id === selectedChat?.id) {
      setMessages((prev) => [...prev, message]);
      scrollToBottom();
    }
  }, [selectedChat]);

  const loadMessages = useCallback(async (chatId) => {
    try {
      const response = await axios.get(`/api/chat/${chatId}/messages`);
      console.log('Полученные сообщения:', response.data);
      setMessages(response.data);
      scrollToBottom();
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  }, []);

  // Polling для сообщений
  useEffect(() => {
    if (!selectedChat) return;

    // Функция для загрузки сообщений
    const fetchMessages = async () => {
      await loadMessages(selectedChat.id);
    };

    // Сразу загружаем
    fetchMessages();

    // Запускаем polling
    const interval = setInterval(fetchMessages, 3000); // каждые 3 секунды

    // Очищаем при смене чата или размонтировании
    return () => clearInterval(interval);
  }, [selectedChat, loadMessages]);

  const loadChats = async () => {
    try {
      const response = await axios.get('/api/chat/list');
      setChats(response.data);
    } catch (error) {
      console.error('Error loading chats:', error);
    }
  };

  // Polling для списка чатов
  useEffect(() => {
    loadChats();
    const interval = setInterval(loadChats, 5000); // каждые 5 секунд
    return () => clearInterval(interval);
  }, []);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    const messageToSend = newMessage; // сохраняем текст сообщения
    setNewMessage(''); // очищаем поле сразу

    try {
      await axios.post(`/api/chat/${selectedChat.id}/send`, {
        content: messageToSend,
        chat_id: selectedChat.id,
      });
    } catch (error) {
      console.error('Error sending message:', error);
      // Если хотите, можно вернуть текст обратно в поле при ошибке:
      setNewMessage(messageToSend);
    }
  };

  const handleNewChatUserSearch = async (e) => {
    setNewChatUserSearch(e.target.value);
    if (e.target.value.length < 2) {
      setNewChatUserResults([]);
      return;
    }
    try {
      const response = await axios.get(`/api/user/search?query=${e.target.value}`);
      setNewChatUserResults(response.data);
    } catch (error) {
      setNewChatUserResults([]);
    }
  };

  const handleCreateChat = async () => {
    try {
      const response = await axios.post('/api/chat/create', {
        name: newChatName,
        is_group: isGroup,
      });
      const chat = response.data;
      setChats((prev) => [...prev, chat]);
      setOpenNewChat(false);
      setNewChatName('');
      setIsGroup(false);
      setNewChatUserSearch('');
      setNewChatUserResults([]);
      setNewChatSelectedUser(null);
      // Если личный чат — сразу добавляем выбранного пользователя
      if (!isGroup && newChatSelectedUser) {
        await axios.post(`/api/chat/${chat.id}/add_user/${newChatSelectedUser.id}`);
      }
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  const handleFileSelect = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleFileUpload = async (event) => {
    const files = event.target.files;
    if (!files.length || !selectedChat) return;

    let albumId = null;
    try {
      // Создаём альбом только один раз
      const albumResponse = await axios.post('/api/media/albums');
      albumId = albumResponse.data.id;

      // Загружаем все файлы в этот альбом
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);
        await axios.post(
          `/api/media/upload/${albumId}`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
      }

      // Отправляем сообщение с медиа
      const messageData = {
        content: 'Медиа-сообщение',
        chat_id: selectedChat.id,
        album_id: albumId
      };
      await axios.post(`/api/chat/${selectedChat.id}/send`, messageData);

    } catch (error) {
      console.error('Error uploading file:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
    }
    setSelectedFile(null);
    // После отправки обновляем сообщения
    loadMessages(selectedChat.id);
  };

  const handleUserSearch = async (e) => {
    setUserSearch(e.target.value);
    if (e.target.value.length < 2) {
      setUserResults([]);
      return;
    }
    try {
      const response = await axios.get(`/api/user/search?query=${e.target.value}`);
      setUserResults(response.data);
    } catch (error) {
      setUserResults([]);
    }
  };

  const handleSelectUser = (user) => {
    if (selectedChat && selectedChat.is_group) {
      setSelectedUsers((prev) =>
        prev.includes(user.id)
          ? prev.filter((id) => id !== user.id)
          : [...prev, user.id]
      );
    } else {
      setSelectedUsers([user.id]);
    }
  };

  const handleInvite = async () => {
    if (!selectedChat) return;
    try {
      if (selectedChat.is_group) {
        for (const userId of selectedUsers) {
          await axios.post(`/api/chat/${selectedChat.id}/add_user/${userId}`);
        }
      } else if (selectedUsers.length === 1) {
        await axios.post(`/api/chat/${selectedChat.id}/add_user/${selectedUsers[0]}`);
      }
      setOpenInvite(false);
      setUserSearch('');
      setUserResults([]);
      setSelectedUsers([]);
      loadChats();
    } catch (error) {
      alert('Ошибка при приглашении пользователя');
    }
  };

  const Message = ({ message, isOwn }) => {
    console.log('message:', message);
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: isOwn ? 'flex-end' : 'flex-start',
          mb: 2,
        }}
      >
        {!isOwn && (
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              mb: 0.5,
              ml: 1,
            }}
          >
            {message.sender_name}
          </Typography>
        )}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: isOwn ? 'flex-end' : 'flex-start',
            maxWidth: '70%',
          }}
        >
          {Array.isArray(message.media_paths) && message.media_paths.length > 0 && (
            <Box
              sx={{
                mb: 1,
                borderRadius: 2,
                overflow: 'hidden',
                maxWidth: '100%',
                display: 'flex',
                gap: 1,
                flexWrap: 'wrap',
                '& img': {
                  maxWidth: 120,
                  maxHeight: 120,
                  borderRadius: 2,
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.02)',
                  },
                },
              }}
            >
              {message.media_paths.map((imgPath, idx) => (
                <img
                  key={idx}
                  src={`http://localhost:8080${imgPath}`}
                  alt={`Медиа ${idx + 1}`}
                  onClick={() => window.open(`http://localhost:8080${imgPath}`, '_blank')}
                  onError={e => { e.target.style.display = 'none'; }}
                />
              ))}
            </Box>
          )}
          <Paper
            elevation={1}
            sx={(theme) => ({
              p: 1.5,
              backgroundColor: isOwn ? theme.palette.primary.main : theme.palette.background.paper,
              color: isOwn ? 'white' : theme.palette.text.primary,
              borderRadius: 2,
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: '50%',
                [isOwn ? 'right' : 'left']: -8,
                transform: 'translateY(-50%)',
                borderStyle: 'solid',
                borderWidth: '8px 8px 8px 0',
                borderColor: isOwn
                  ? `transparent transparent transparent ${theme.palette.primary.main}`
                  : `transparent ${theme.palette.background.paper} transparent transparent`,
              },
            })}
          >
            <Typography variant="body1">{message.content}</Typography>
          </Paper>
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              mt: 0.5,
              ml: isOwn ? 0 : 1,
              mr: isOwn ? 1 : 0,
            }}
          >
            {new Date(message.sended_at).toLocaleTimeString()}
          </Typography>
        </Box>
      </Box>
    );
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)' }}>
      {/* Список чатов */}
      <Paper
        sx={{
          width: 300,
          borderRight: '1px solid',
          borderColor: 'divider',
          display: { xs: selectedChat ? 'none' : 'block', sm: 'block' },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Чаты</Typography>
          <Tooltip title="Новый чат">
            <IconButton onClick={() => setOpenNewChat(true)} color="primary">
            <AddIcon />
          </IconButton>
          </Tooltip>
        </Box>
        <Divider />
        <List sx={{ overflow: 'auto', maxHeight: 'calc(100vh - 120px)' }}>
          {chats.map((chat) => (
            <ListItem
              button
              key={chat.id}
              selected={selectedChat?.id === chat.id}
              onClick={() => setSelectedChat(chat)}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                },
                transition: 'all 0.2s',
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <ListItemAvatar>
                <Avatar>
                  {chat.is_group ? <GroupIcon /> : chat.name?.[0]?.toUpperCase()}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={chat.name}
                secondary={chat.is_group ? 'Групповой чат' : 'Личный чат'}
                primaryTypographyProps={{
                  fontWeight: selectedChat?.id === chat.id ? 'bold' : 'normal',
                }}
              />
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Область сообщений */}
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
      >
        {selectedChat ? (
          <>
            {/* Заголовок чата */}
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ mr: 2 }}>
                  {selectedChat.is_group ? (
                    <GroupIcon />
                  ) : (
                    selectedChat.name?.[0]?.toUpperCase()
                  )}
                </Avatar>
                <Box>
                  <Typography variant="h6">{selectedChat.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedChat.is_group ? 'Групповой чат' : 'Личный чат'}
              </Typography>
                </Box>
              </Box>
              {selectedChat.is_group && (
                <Tooltip title="Пригласить пользователей">
                  <IconButton onClick={() => setOpenInvite(true)} color="primary">
                <PersonAddIcon />
              </IconButton>
                </Tooltip>
              )}
            </Paper>

            {/* Сообщения */}
            <Box
              sx={{
                flexGrow: 1,
                overflow: 'auto',
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              {messages.map((message) => (
                <Fade in={true} key={message.id}>
                  <div>
                    <Message message={message} isOwn={message.sender_id === user.id} />
                  </div>
                </Fade>
              ))}
              <div ref={messagesEndRef} />
            </Box>

            {/* Поле ввода */}
            <Paper
              sx={{
                p: 2,
                borderTop: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Tooltip title="Прикрепить файл">
                  <IconButton component="label" color="primary">
                  <input
                    type="file"
                    hidden
                    multiple
                    onChange={handleFileUpload}
                  />
                  <AttachFileIcon />
                </IconButton>
                </Tooltip>
                {selectedFile && (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      p: 1,
                      borderRadius: 1,
                      backgroundColor: 'action.hover',
                    }}
                  >
                    <ImageIcon color="primary" />
                    <Typography variant="body2" noWrap>
                      {selectedFile.name}
                    </Typography>
                  </Box>
                )}
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Введите сообщение..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  multiline
                  maxRows={4}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
                <Tooltip title="Отправить">
                <IconButton
                  color="primary"
                  onClick={handleSendMessage}
                    disabled={!newMessage.trim() && !selectedFile}
                >
                  <SendIcon />
                </IconButton>
                </Tooltip>
              </Box>
            </Paper>
          </>
        ) : (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <Typography variant="h6" color="text.secondary">
              Выберите чат для начала общения
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenNewChat(true)}
            >
              Создать новый чат
            </Button>
          </Box>
        )}
      </Box>

      {/* Диалоги */}
      <Dialog open={openNewChat} onClose={() => setOpenNewChat(false)}>
        <DialogTitle>Создать новый чат</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Название чата"
            fullWidth
            value={newChatName}
            onChange={(e) => setNewChatName(e.target.value)}
          />
          <Button
            variant={isGroup ? 'contained' : 'outlined'}
            onClick={() => setIsGroup(!isGroup)}
            sx={{ mt: 2 }}
          >
            {isGroup ? 'Групповой чат' : 'Личный чат'}
          </Button>
          {!isGroup && (
            <>
              <TextField
                margin="dense"
                label="Пользователь для чата"
                fullWidth
                value={newChatUserSearch}
                onChange={handleNewChatUserSearch}
              />
              <List>
                {newChatUserResults.map((user) => (
                  <ListItem
                    key={user.id}
                    button
                    selected={newChatSelectedUser?.id === user.id}
                    onClick={() => setNewChatSelectedUser(user)}
                  >
                    <ListItemText primary={user.username} secondary={user.full_name} />
                  </ListItem>
                ))}
              </List>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNewChat(false)}>Отмена</Button>
          <Button
            onClick={handleCreateChat}
            variant="contained"
            disabled={!isGroup && !newChatSelectedUser}
          >
            Создать
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openInvite} onClose={() => setOpenInvite(false)}>
        <DialogTitle>Пригласить пользователя</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Поиск пользователя"
            fullWidth
            value={userSearch}
            onChange={handleUserSearch}
          />
          <List>
            {userResults.map((user) => (
              <ListItem
                key={user.id}
                button
                onClick={() => handleSelectUser(user)}
                disabled={
                  !selectedChat?.is_group && selectedUsers.length === 1 && !selectedUsers.includes(user.id)
                }
              >
                {selectedChat?.is_group && (
                  <Checkbox checked={selectedUsers.includes(user.id)} />
                )}
                <ListItemText primary={user.username} secondary={user.full_name} />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenInvite(false)}>Отмена</Button>
          <Button
            onClick={handleInvite}
            variant="contained"
            disabled={selectedUsers.length === 0}
          >
            Пригласить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Chat; 