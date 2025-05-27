import React, { useState, useEffect, useRef } from 'react';
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
} from '@mui/material';
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  Add as AddIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import { io } from 'socket.io-client';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

function Chat() {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
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

  useEffect(() => {
    // Загружаем список чатов
    loadChats();

    // Подключаемся к WebSocket
    const newSocket = io('http://localhost:8080', {
      auth: {
        token: localStorage.getItem('token'),
      },
    });

    newSocket.on('message', handleNewMessage);
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!selectedChat) return;
    const interval = setInterval(() => {
      loadMessages(selectedChat.id);
    }, 2000); // каждые 2 секунды
    return () => clearInterval(interval);
  }, [selectedChat]);

  const loadChats = async () => {
    try {
      const response = await axios.get('/api/chat/list');
      setChats(response.data);
    } catch (error) {
      console.error('Error loading chats:', error);
    }
  };

  const loadMessages = async (chatId) => {
    try {
      const response = await axios.get(`/api/chat/${chatId}/messages`);
      setMessages(response.data);
      scrollToBottom();
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleNewMessage = (message) => {
    if (message.chat_id === selectedChat?.id) {
      setMessages((prev) => [...prev, message]);
      scrollToBottom();
    }
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    try {
      await axios.post(`/api/chat/${selectedChat.id}/send`, {
        content: newMessage,
        chat_id: selectedChat.id,
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
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

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('file', file);
      try {
        // Сначала создаем альбом
        const albumResponse = await axios.post('/api/media/albums');
        const albumId = albumResponse.data.id;
        // Загружаем файл в альбом
        await axios.post(
          `/api/media/upload/${albumId}`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
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

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 88px)' }}>
      {/* Список чатов */}
      <Paper
        sx={{
          width: 300,
          overflow: 'auto',
          borderRight: '1px solid rgba(255, 255, 255, 0.12)',
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6">Чаты</Typography>
          <IconButton onClick={() => setOpenNewChat(true)}>
            <AddIcon />
          </IconButton>
        </Box>
        <Divider />
        <List>
          {chats.map((chat) => (
            <ListItem
              button
              key={chat.id}
              selected={selectedChat?.id === chat.id}
              onClick={() => {
                setSelectedChat(chat);
                loadMessages(chat.id);
              }}
            >
              <ListItemAvatar>
                <Avatar>{chat.name?.[0]?.toUpperCase() || 'C'}</Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={chat.name || 'Без названия'}
                secondary={chat.is_group ? 'Групповой чат' : 'Личный чат'}
              />
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Область сообщений */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {selectedChat ? (
          <>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6">
                {selectedChat.name || 'Без названия'}
              </Typography>
              <IconButton onClick={() => setOpenInvite(true)} title="Пригласить пользователя">
                <PersonAddIcon />
              </IconButton>
            </Paper>
            <Box
              sx={{
                flexGrow: 1,
                overflow: 'auto',
                p: 2,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {messages.map((message) => (
                <Box
                  key={message.id}
                  sx={{
                    display: 'flex',
                    justifyContent:
                      message.sender_id === user.id ? 'flex-end' : 'flex-start',
                    mb: 2,
                  }}
                >
                  <Paper
                    sx={{
                      p: 2,
                      maxWidth: '70%',
                      backgroundColor:
                        message.sender_id === user.id
                          ? 'primary.main'
                          : 'background.paper',
                    }}
                  >
                    <Typography variant="subtitle2" color="text.secondary">
                      {message.sender_name}
                    </Typography>
                    <Typography>{message.content}</Typography>
                    {message.media_path && (
                      <Box sx={{ mt: 1 }}>
                        <img
                          src={`http://localhost:8080${message.media_path}`}
                          alt="media"
                          style={{ maxWidth: '200px', borderRadius: 8 }}
                        />
                      </Box>
                    )}
                  </Paper>
                </Box>
              ))}
              <div ref={messagesEndRef} />
            </Box>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton component="label">
                  <input
                    type="file"
                    hidden
                    multiple
                    onChange={handleFileUpload}
                  />
                  <AttachFileIcon />
                </IconButton>
                {selectedFile && (
                  <Box sx={{ mt: 1 }}>
                    <img
                      src={URL.createObjectURL(selectedFile)}
                      alt="preview"
                      style={{ maxWidth: '200px', borderRadius: 8 }}
                    />
                  </Box>
                )}
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Введите сообщение..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSendMessage();
                    }
                  }}
                />
                <IconButton
                  color="primary"
                  onClick={handleSendMessage}
                >
                  <SendIcon />
                </IconButton>
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
            }}
          >
            <Typography variant="h6" color="text.secondary">
              Выберите чат для начала общения
            </Typography>
          </Box>
        )}
      </Box>

      {/* Диалог создания нового чата */}
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

      {/* Диалог приглашения пользователей */}
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