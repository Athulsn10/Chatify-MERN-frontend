import React, { useEffect, useState } from 'react'
import { ChatState } from '../context/ChatProvider';
import {getSender, getSenderFull} from '../config/ChatLogic'
import Modalprofile from './chatarea/Modalprofile'
import EditGroupModal from './chatarea/EditGroupModal';
import Spinner from 'react-bootstrap/Spinner';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import ScrollableChat from './ScrollabelChat';
import io from 'socket.io-client'
import { Avatar } from '@mui/material';
import { BASE_URL } from '../context/url';



var socket, selectedChatCompare;

function SingleChat() {
    const {fetchAgain,setFetchAgain,user,selectedChat,setSelectedChat } = ChatState();
    // console.log(selectedChat);
    const [messages, setMessages] = useState([]);
    const [loading ,setLoading] = useState(false);
    const [newMessage, setNewMessage] = useState();
    const [socketConnected, setSocketConnected] = useState(false)

    const sendMessage= async(event)=>{
      if(event.key === 'Enter' && newMessage){
        try{
          const config = {
            headers: {
              "Content-type": "application/json",
              Authorization: `Bearer ${user.token}`,
            },
          }
          setNewMessage('');
          const{data} = await axios.post(`${BASE_URL}/api/message`,
          
          {
            content: newMessage,
            chatId: selectedChat._id
          }, config)
          socket.emit('new message', data)
          setMessages([...messages,data])
          // console.log(data);
        }catch(error){
            toast.error('Failed to sent')
        }
      }
    }

    const fetchMessages= async()=>{
      if(!selectedChat){
        return
      }
      try {
        const config ={
          headers: {
            Authorization: `Bearer ${user.token}`
          },
        }
        const {data} = await axios.get(`${BASE_URL}/api/message/${selectedChat._id}`
        ,config
        )
        setMessages(data)
        setLoading(false)
        socket.emit('join chat', selectedChat._id)
        // console.log(data);
      } catch (error) {
        toast.error('')
      }
    }

    useEffect(()=>{
      socket = io(BASE_URL);
      socket.emit('setup',user);
      socket.on('connection',()=>{ setSocketConnected(true)})
    },[])

    useEffect(()=>{
      fetchMessages()
      selectedChatCompare = selectedChat;
    },[selectedChat])

    useEffect(()=>{
      socket.on("message recieved",(newMessageRecieved)=>{
        if(!selectedChatCompare || selectedChatCompare._id !== newMessageRecieved.chat._id){
            // notification
        }else{
          setMessages([...messages, newMessageRecieved]);
        }
      })
    })

    const typingHandler=(e)=>{
      setNewMessage(e.target.value);
      // typing indicator
    }

   
  return (
    <>
      {selectedChat ? (
        <>
          <div
            style={{ overflowY: "hidden",backgroundColor:'black',borderBottom:'2px',color:'white',borderColor:"white" }}
            className="d-flex p-4  align-items-center w-100 px-2"
          >
            <i
              className="fa-solid fa-arrow-left-long me-2"
              onClick={() => setSelectedChat("")}
            ></i>
            {!selectedChat.isGroupChat ? (
              <>
                <Modalprofile selectedChat={selectedChat} user={getSenderFull(user, selectedChat.users)} />
                {getSender(user, selectedChat.users)}
              </>
            ) : (
              <>
                <EditGroupModal fetchMessages={fetchMessages}></EditGroupModal>
                <p className="p-0 m-0 fw-bolder" style={{ fontSize: "20px" }}>
                  {selectedChat.chatName}
                </p>{" "}
              </>
            )}
          </div>
          <div
            className="flex-column justify-content-end w-100 h-100 p-3"
            style={{ backgroundColor: "black" }}
          >
            {loading ? (
              <div className="h-100 d-flex justify-content-center align-items-center">
                <Spinner animation="border" />
              </div>
            ) : (
              <>
                <div
                  style={{ overflowY: "scroll",height:"100vh" }}
                  className="messages flex-column"
                >
                  <ScrollableChat messages={messages} />
                </div>
              </>
            )}
          </div>
       <div className='w-100 mb-3' sticky="bottom">
            <input
              onChange={typingHandler}
              placeholder="Type a message"
              type="text"
              value={newMessage}
              required
              style={{ boxShadow: "none",backgroundColor:'black',color:'white' }}
              onKeyDown={sendMessage}
              className="form-control w-100  mb-4 mt-3  p-3 rounded chat-input"
            />
       </div>
        </>
      ) : (
        <div className="d-flex align-items-center justify-content-center">
          <h3 style={{ color: "black" }}>Chatify</h3>
        </div>
      )}

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </>
  );
}

export default SingleChat