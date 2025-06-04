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
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  Add as AddIcon,
  PersonAdd as PersonAddIcon,
  Image as ImageIcon,
  Group as GroupIcon,
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import ImageViewer from '../components/ImageViewer';
import { api } from '../contexts/AuthContext';
import { API_URL } from '../contexts/AuthContext';
import Profile from './Profile';

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
  const [selectedImage, setSelectedImage] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleNewMessage = useCallback((message) => {
    if (message.chat_id === selectedChat?.id) {
      setMessages((prev) => [...prev, message]);
      scrollToBottom();
    }
  }, [selectedChat]);

  const loadMessages = useCallback(async (chatId) => {
    try {
      const response = await api.get(`/api/chat/${chatId}/messages`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  }, []);

  useEffect(() => {
    if (!selectedChat) return;

    const fetchMessages = async () => {
      await loadMessages(selectedChat.id);
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);

    return () => clearInterval(interval);
  }, [selectedChat, loadMessages]);

  const loadChats = async () => {
    try {
      const response = await api.get('/api/chat/list');
      setChats(response.data);
    } catch (error) {
      console.error('Error loading chats:', error);
    }
  };

  useEffect(() => {
    loadChats();
    const interval = setInterval(loadChats, 5000);
    return () => clearInterval(interval);
  }, []);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && !selectedFile) || !selectedChat) return;

    const messageToSend = newMessage;
    setNewMessage('');

    try {
      let response;
      if (selectedFile) {
        const albumResponse = await api.post('/api/media/albums');
        const albumId = albumResponse.data.id;
        const formData = new FormData();
        formData.append('file', selectedFile);
        await api.post(
          `/api/media/upload/${albumId}`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        const messageData = {
          content: messageToSend || 'Медиа-сообщение',
          chat_id: selectedChat.id,
          album_id: albumId
        };
        response = await api.post(`/api/chat/${selectedChat.id}/send`, messageData);
        setSelectedFile(null);
      } else {
        response = await api.post(`/api/chat/${selectedChat.id}/send`, {
          content: messageToSend,
          chat_id: selectedChat.id,
        });
      }
      setMessages(prev => [...prev, response.data]);
      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleFileUpload = async (event) => {
    const files = event.target.files;
    if (!files.length || !selectedChat) return;

    let albumId = null;
    try {
      const albumResponse = await api.post('/api/media/albums');
      albumId = albumResponse.data.id;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);
        await api.post(
          `/api/media/upload/${albumId}`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
      }

      const messageData = {
        content: 'Медиа-сообщение',
        chat_id: selectedChat.id,
        album_id: albumId
      };
      await api.post(`/api/chat/${selectedChat.id}/send`, messageData);

    } catch (error) {
      console.error('Error uploading file:', error);
    }
    setSelectedFile(null);
    loadMessages(selectedChat.id);
  };

  const handleUserSearch = async (e) => {
    setUserSearch(e.target.value);
    if (e.target.value.length < 2) {
      setUserResults([]);
      return;
    }
    try {
      const response = await api.get(`/api/user/search?query=${e.target.value}`);
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
          await api.post(`/api/chat/${selectedChat.id}/add_user/${userId}`);
        }
      } else if (selectedUsers.length === 1) {
        await api.post(`/api/chat/${selectedChat.id}/add_user/${selectedUsers[0]}`);
      }
      setOpenInvite(false);
      setUserSearch('');
      setUserResults([]);
      setSelectedUsers([]);
      loadChats();
    } catch (error) {
      console.error('Error inviting user:', error);
    }
  };

  const handleCreateChat = async () => {
    try {
      const response = await api.post('/api/chat/create', {
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
      if (!isGroup && newChatSelectedUser) {
        await api.post(`/api/chat/${chat.id}/add_user/${newChatSelectedUser.id}`);
      }
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  const handleNewChatUserSearch = async (e) => {
    setNewChatUserSearch(e.target.value);
    if (e.target.value.length < 2) {
      setNewChatUserResults([]);
      return;
    }
    try {
      const response = await api.get(`/api/user/search?query=${e.target.value}`);
      setNewChatUserResults(response.data);
    } catch (error) {
      setNewChatUserResults([]);
    }
  };

  const handleAvatarClick = async () => {
    try {
      const response = await api.get(`/api/chat/${selectedChat.id}`);
      const otherUser = response.data.participants.find(p => p.id !== user.id);
      if (otherUser) {
        setSelectedUser(otherUser);
        setShowProfile(true);
      }
    } catch (error) {
      console.error('Ошибка при загрузке информации о пользователе:', error);
    }
  };

  const Message = ({ message, isOwn }) => {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: isOwn ? 'flex-end' : 'flex-start',
          mb: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-end', mb: 0.5 }}>
          {!isOwn && (
            <Avatar src={message.sender_avatar ? `${API_URL}${message.sender_avatar}` : undefined} sx={{ width: 32, height: 32, mr: 1 }}>
              {message.sender_name ? message.sender_name[0]?.toUpperCase() : '?'}
            </Avatar>
          )}
          <Box sx={{ flex: 1 }}>
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
                    src={`${API_URL}${imgPath}`}
                    alt={`Медиа ${idx + 1}`}
                    onClick={() => setSelectedImage(`${API_URL}${imgPath}`)}
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
      </Box>
    );
  };

  return (
    <Box sx={{ display: 'flex', height: '100%' }}>
      {/* Список чатов */}
      <Paper
        sx={{
          width: { xs: '100%', sm: 300 },
          borderRight: '1px solid',
          borderColor: 'divider',
          display: { xs: selectedChat ? 'none' : 'block', sm: 'block' },
          position: { xs: 'fixed', sm: 'static' },
          top: { xs: 64 },
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: { xs: 1000, sm: 1 },
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
        <List sx={{ overflow: 'auto', maxHeight: { xs: 'calc(100vh - 120px)', sm: 'calc(100vh - 120px)' } }}>
          {chats.map((chat) => (
            <ListItem
              button
              key={chat.id}
              selected={selectedChat?.id === chat.id}
              onClick={() => {
                setSelectedChat(chat);
                if (isMobile) {
                  document.body.style.overflow = 'hidden';
                }
              }}
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
                <Avatar src={(!chat.is_group && chat.participants && chat.participants.length > 0 && chat.participants.find(u => u.id !== user.id)?.avatar) ? `${API_URL}${chat.participants.find(u => u.id !== user.id)?.avatar}` : undefined}>
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
          width: { xs: '100%', sm: 'calc(100% - 300px)' },
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
                position: { xs: 'sticky', sm: 'static' },
                top: 0,
                zIndex: 1,
                backgroundColor: 'background.paper',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton
                  sx={{ display: { xs: 'flex', sm: 'none' }, mr: 1 }}
                  onClick={() => {
                    setSelectedChat(null);
                    document.body.style.overflow = 'auto';
                  }}
                >
                  <ArrowBackIcon />
                </IconButton>
                <Box sx={{ mr: 2, cursor: 'pointer' }} onClick={handleAvatarClick}>
                  <Avatar
                    src={
                      !selectedChat.is_group &&
                      selectedChat.participants &&
                      selectedChat.participants.length > 0 &&
                      selectedChat.participants.find(u => u.id !== user.id)?.avatar
                        ? `${API_URL}${selectedChat.participants.find(u => u.id !== user.id)?.avatar}`
                        : undefined
                    }
                  >
                    {selectedChat.is_group ? (
                      <GroupIcon />
                    ) : (
                      selectedChat.name?.[0]?.toUpperCase()
                    )}
                  </Avatar>
                </Box>
                <Box>
                  <Typography variant="h6">{selectedChat.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedChat.is_group ? 'Групповой чат' : 'Личный чат'}
                  </Typography>
                </Box>
              </Box>
              {selectedChat.is_group && (
                <Tooltip title="Пригласить пользователей">
                  <span>
                    <IconButton onClick={() => setOpenInvite(true)} color="primary">
                      <PersonAddIcon />
                    </IconButton>
                  </span>
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
                pb: { xs: 8, sm: 2 },
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
                position: { xs: 'fixed', sm: 'static' },
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 2,
                backgroundColor: 'background.paper',
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
                      maxWidth: { xs: '50%', sm: '30%' },
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
                  onKeyDown={(e) => {
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
              p: 2,
            }}
          >
            <Typography variant="h6" color="text.secondary" align="center">
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
      <Dialog 
        open={openNewChat} 
        onClose={() => setOpenNewChat(false)}
        fullWidth
        maxWidth="sm"
      >
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

      <Dialog 
        open={openInvite} 
        onClose={() => setOpenInvite(false)}
        fullWidth
        maxWidth="sm"
      >
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

      {/* Диалог профиля */}
      <Dialog
        open={showProfile}
        onClose={() => setShowProfile(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent>
          {selectedUser && (
            <Profile user={selectedUser} />
          )}
        </DialogContent>
      </Dialog>

      {selectedImage && (
        <ImageViewer
          imageUrl={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </Box>
  );
}

export default Chat; 