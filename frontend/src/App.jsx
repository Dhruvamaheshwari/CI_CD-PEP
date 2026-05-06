import { useState, useEffect, useRef } from 'react'
import { Send, User as UserIcon, LogOut, Copy, Camera, Check, Plus, MessageSquare, Trash2, UserMinus } from 'lucide-react'
import axios from 'axios'
import { io } from 'socket.io-client'

const socket = io(import.meta.env.DEV ? 'http://localhost:5000' : '/')

function App() {
  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const [username, setUsername] = useState(() => localStorage.getItem('chatUsername') || '')
  const [avatar, setAvatar] = useState(() => localStorage.getItem('chatAvatar') || null)
  const [isJoined, setIsJoined] = useState(() => localStorage.getItem('chatIsJoined') === 'true')
  const [copied, setCopied] = useState(false)
  const messagesEndRef = useRef(null)

  // Rooms State
  const [rooms, setRooms] = useState([])
  const [activeRoomId, setActiveRoomId] = useState('')
  const [newRoomName, setNewRoomName] = useState('')

  // 1. Check URL for invite code on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const roomParam = params.get('room')
    if (roomParam) {
      setActiveRoomId(roomParam)
    }
  }, [])

  // 2. Main Effect: Load Rooms & Join Sockets
  useEffect(() => {
    if (!isJoined) return

    // Fetch existing rooms from API
    axios.get('/api/rooms').then(res => {
      const fetchedRooms = Array.isArray(res.data) ? res.data : []
      // Make sure the active room (e.g. from invite link) is in our list
      let finalRooms = [...fetchedRooms]
      if (activeRoomId && !finalRooms.includes(activeRoomId)) {
        finalRooms.push(activeRoomId)
      }
      setRooms(finalRooms)

      // Join all rooms in socket to listen broadly, or at least active ones
      finalRooms.forEach(room => socket.emit('join_room', room))

      // If no room is active, default to the first one available
      if (!activeRoomId && finalRooms.length > 0) {
        setActiveRoomId(finalRooms[0])
      }
    }).catch(err => console.error("Error fetching rooms:", err))
  }, [isJoined])

  // Better stable listener for messages that always reads latest activeRoomId
  useEffect(() => {
    if (!isJoined) return
    const handleReceive = (newMsg) => {
      // ONLY push messages if they belong to the current ACTIVE room!
      if (newMsg.roomId === activeRoomId) {
        setMessages(prev => [...prev, newMsg])
      }

      // If the message is for a new room we don't know about, we could add it to our list
      setRooms(prev => {
        if (!prev.includes(newMsg.roomId)) {
          return [...prev, newMsg.roomId]
        }
        return prev
      })
    }

    socket.on('receive_message', handleReceive)
    return () => socket.off('receive_message', handleReceive)
  }, [isJoined, activeRoomId])

  // 3. Load Chat History When Active Room Changes
  useEffect(() => {
    if (!isJoined || !activeRoomId) return

    // Load history for the newly selected room
    axios.get(`/api/chat?roomId=${activeRoomId}`).then(res => {
      setMessages(Array.isArray(res.data) ? res.data : [])
    }).catch(err => {
      console.error("Error fetching chats:", err)
      setMessages([])
    })

    // Pre-join socket just in case it's a newly created room
    socket.emit('join_room', activeRoomId)

    // Auto-update URL
    window.history.pushState({}, '', `?room=${activeRoomId}`)
  }, [activeRoomId, isJoined])

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Handlers
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setAvatar(reader.result)
      reader.readAsDataURL(file)
    }
  }

  const joinChat = (e) => {
    e.preventDefault()
    if (username.trim()) {
      setIsJoined(true)
      localStorage.setItem('chatUsername', username)
      if (avatar) localStorage.setItem('chatAvatar', avatar)
      localStorage.setItem('chatIsJoined', 'true')
    }
  }

  const createOrJoinRoom = (e) => {
    e.preventDefault()
    if (!newRoomName.trim()) return
    const formattedId = newRoomName.trim().replace(/\s+/g, '-').toLowerCase()

    if (!rooms.includes(formattedId)) {
      setRooms(prev => [...prev, formattedId])
    }
    socket.emit('join_room', formattedId)
    setActiveRoomId(formattedId)
    setNewRoomName('')
  }

  const copyInvite = () => {
    const inviteLink = `${window.location.origin}?room=${activeRoomId}`
    navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const switchRoom = (roomId) => {
    setActiveRoomId(roomId)
  }

  const sendMessage = (e) => {
    e.preventDefault()
    if (!inputText.trim() || !activeRoomId) return

    const msgData = {
      roomId: activeRoomId,
      user: username,
      avatar,
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    socket.emit('send_message', msgData)
    setInputText('')
  }

  const deleteRoom = async (roomId, e) => {
    e?.stopPropagation()
    if (window.confirm(`Are you sure you want to delete room "${roomId}"?`)) {
      await axios.delete(`/api/rooms/${roomId}`)
      setRooms(prev => prev.filter(r => r !== roomId))
      setActiveRoomId(current => current === roomId ? '' : current)
    }
  }

  const deleteMessage = async (msgId) => {
    if (window.confirm("Delete this message?")) {
      await axios.delete(`/api/chat/${activeRoomId}/${msgId}`)
      setMessages(prev => prev.filter(m => m.id !== msgId))
    }
  }

  const deleteUser = async (targetUser) => {
    if (window.confirm(`Delete all messages by user "${targetUser}"?`)) {
      await axios.delete(`/api/user/${targetUser}`)
      setMessages(prev => prev.filter(m => m.user !== targetUser))
    }
  }

  // Add socket listeners for deletions
  useEffect(() => {
    if (!isJoined) return
    const onRoomAdd = (rId) => setRooms(prev => prev.includes(rId) ? prev : [...prev, rId])
    const onRoomDel = (rId) => {
      setRooms(prev => prev.filter(r => r !== rId))
      setActiveRoomId(current => (current === rId ? '' : current))
    }
    const onMsgDel = (mId) => setMessages(prev => prev.filter(m => m.id !== mId))
    const onUserDel = (uName) => setMessages(prev => prev.filter(m => m.user !== uName))

    socket.on('room_added', onRoomAdd)
    socket.on('room_deleted', onRoomDel)
    socket.on('message_deleted', onMsgDel)
    socket.on('user_deleted', onUserDel)

    return () => {
      socket.off('room_added', onRoomAdd)
      socket.off('room_deleted', onRoomDel)
      socket.off('message_deleted', onMsgDel)
      socket.off('user_deleted', onUserDel)
    }
  }, [isJoined])

  // --- SCREEN 1: LOGIN ---
  if (!isJoined) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4 font-sans text-zinc-900">
        <form onSubmit={joinChat} className="bg-white p-8 rounded-2xl shadow-sm border border-zinc-200 max-w-sm w-full space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Sign In</h1>
            <p className="text-sm text-zinc-500">Pick a display name to get started.</p>
          </div>

          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="relative group">
              <div className="w-20 h-20 rounded-full bg-zinc-100 border-2 border-dashed border-zinc-300 flex items-center justify-center overflow-hidden">
                {avatar ? (
                  <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-8 h-8 text-zinc-400" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 p-1.5 bg-zinc-900 text-white rounded-full cursor-pointer hover:bg-zinc-800 transition-colors shadow-sm">
                <Camera className="w-4 h-4" />
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              </label>
            </div>
            <span className="text-xs font-medium text-zinc-500">Upload Photo (Optional)</span>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-700">Display Name</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. Alex"
                className="w-full border border-zinc-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all placeholder:text-zinc-400"
              />
            </div>
            {activeRoomId && (
              <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center gap-2">
                <Check className="w-4 h-4 text-indigo-500" />
                <span className="text-xs text-indigo-700 font-medium">Invited to join: <b>{activeRoomId}</b></span>
              </div>
            )}
          </div>
          <button type="submit" className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-medium py-2.5 rounded-lg transition-colors shadow-sm text-sm">
            Continue to Chat
          </button>
        </form>
      </div>
    )
  }

  // --- SCREEN 2: CHAT INTERFACE (WhatsApp layout) ---
  return (
    <div className="min-h-screen bg-zinc-100 flex items-center justify-center p-2 sm:p-4 font-sans text-zinc-900">
      <div className="max-w-[70rem] w-full bg-white shadow-lg border border-zinc-200 overflow-hidden flex h-[92vh] sm:rounded-2xl rounded-lg">

        {/* Left Sidebar: Room List */}
        <div className="w-[30%] min-w-[260px] max-w-[340px] bg-zinc-50 flex flex-col border-r border-zinc-200">
          <div className="px-4 py-4 border-b border-zinc-200 bg-white/80 flex items-center gap-3 backdrop-blur-sm z-10">
            {avatar ? (
              <img src={avatar} alt="Me" className="w-9 h-9 rounded-full object-cover shadow-sm ring-2 ring-zinc-100" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-600 shadow-sm border border-zinc-300">
                {username.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="font-semibold text-sm truncate flex-1">{username}</div>
            <button onClick={() => {
              setIsJoined(false);
              localStorage.removeItem('chatIsJoined');
              window.history.pushState({}, '', '/');
            }}
              className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors" title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3 border-b border-zinc-200 bg-white">
            <form onSubmit={createOrJoinRoom} className="flex gap-2">
              <input
                type="text"
                placeholder="New or existing room name..."
                value={newRoomName}
                onChange={e => setNewRoomName(e.target.value)}
                className="flex-1 bg-zinc-50 border border-zinc-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all font-medium placeholder:text-zinc-400"
              />
              <button disabled={!newRoomName.trim()} type="submit" className="bg-zinc-900 disabled:bg-zinc-300 text-white p-2 rounded-md hover:bg-zinc-800 transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </form>
          </div>

          <div className="flex-1 overflow-y-auto w-full pt-1 pb-4">
            {rooms.length === 0 ? (
              <div className="p-6 text-center text-zinc-400 text-xs font-medium">No rooms available yet. Create one!</div>
            ) : (
              rooms.map(room => (
                <div
                  key={room}
                  onClick={() => switchRoom(room)}
                  className={`px-4 py-3 mx-2 my-1.5 rounded-xl cursor-pointer flex items-center gap-3 transition-all ${activeRoomId === room ? 'bg-zinc-200/60 border border-zinc-300/50 shadow-sm' : 'hover:bg-zinc-100 border border-transparent'
                    }`}
                >
                  <div className="w-12 h-12 rounded-full bg-white border border-zinc-200 shadow-sm flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-5 h-5 text-zinc-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-[15px] font-semibold truncate ${activeRoomId === room ? 'text-zinc-900' : 'text-zinc-700'}`}>{room}</h3>
                    <p className="text-[13px] text-zinc-400 truncate mt-0.5">{activeRoomId === room ? 'Viewing chat...' : 'Tap to read'}</p>
                  </div>
                  <button
                    onClick={(e) => deleteRoom(room, e)}
                    className="p-2 text-zinc-400 hover:text-red-500 hover:bg-white rounded-full transition-colors flex-shrink-0"
                    title="Delete Room"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Main Panel: Active Chat */}
        <div className="flex-1 flex flex-col bg-zinc-50/50">
          {!activeRoomId ? (
            <div className="flex-1 flex items-center justify-center flex-col text-zinc-400 bg-white">
              <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-[15px] font-medium">Select a room from the left to start messaging</p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between bg-white z-10 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-5 h-5 text-zinc-600" />
                  </div>
                  <div>
                    <h2 className="text-[16px] font-bold tracking-tight text-zinc-800">{activeRoomId}</h2>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                      <span className="text-[11px] uppercase font-bold text-zinc-500 tracking-wider">Live Chat</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={copyInvite}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-zinc-700 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 shadow-sm rounded-lg transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Link Copied!' : 'Share Room Link'}
                </button>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center flex-col text-zinc-400">
                    <p className="text-sm font-medium bg-white border border-zinc-200 px-5 py-2.5 rounded-full shadow-sm">
                      It's quiet in {activeRoomId}. Send the first message!
                    </p>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isMe = msg.user === username
                    return (
                      <div key={idx} className={`group flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                        {/* Avatar */}
                        <div className="flex-shrink-0 mt-1">
                          {msg.avatar ? (
                            <img src={msg.avatar} alt={msg.user} className="w-8 h-8 rounded-full border border-zinc-200 object-cover shadow-sm bg-white" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center shadow-sm">
                              <span className="text-xs font-bold text-zinc-500">{msg.user.charAt(0).toUpperCase()}</span>
                            </div>
                          )}
                        </div>

                        {/* Message Bubble */}
                        <div className={`max-w-[75%] sm:max-w-[65%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                          <div className="flex items-baseline gap-1.5 mx-1 mb-1">
                            <span className="text-xs font-semibold text-zinc-700">{isMe ? 'You' : msg.user}</span>
                            <span className="text-[10px] text-zinc-400 font-medium">{msg.time}</span>
                          </div>
                          <div className={`px-4 py-2.5 text-[15px] shadow-sm ${isMe
                            ? 'bg-zinc-900 text-white rounded-2xl rounded-tr-sm'
                            : 'bg-white border border-zinc-200 text-zinc-800 rounded-2xl rounded-tl-sm'
                            }`}>
                            <div className="leading-relaxed break-words whitespace-pre-wrap">{msg.text}</div>
                          </div>
                          <div className={`flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity ${isMe ? 'self-end' : 'self-start'}`}>
                            {isMe ? (
                              <button onClick={() => deleteMessage(msg.id)} title="Delete message" className="p-1 px-1.5 text-zinc-400 hover:text-red-500 rounded transition-colors text-[10px] uppercase font-bold tracking-wider flex items-center gap-1">
                                <Trash2 className="w-3 h-3" /> Delete
                              </button>
                            ) : (
                              <button onClick={() => deleteUser(msg.user)} title={`Delete all messages from ${msg.user}`} className="p-1 px-1.5 text-zinc-400 hover:text-red-500 rounded transition-colors text-[10px] uppercase font-bold tracking-wider flex items-center gap-1">
                                <UserMinus className="w-3 h-3" /> Ban {msg.user}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Form */}
              <div className="p-4 bg-white border-t border-zinc-200">
                <form onSubmit={sendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-5 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all font-medium placeholder:text-zinc-400"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-200 disabled:text-zinc-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors shadow-sm"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  )
}

export default App
