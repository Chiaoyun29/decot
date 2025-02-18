import React, { useState, useContext, useEffect } from 'react';
import { createMessage } from '../services/api';
import { useParams } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';

const ChatFooter=({ setMessages, socket })=>{
    const [message, setMessage]=useState([]);
    const { workspaceId, messageId, userId } = useParams();
    const { token } = useAuthContext();

    const sendMessage = (e) => {
        e.preventDefault();
        const newMessage={
            id: `${socket.id}${Math.random()}`,
            message,
            timestamp: new Date().toLocaleTimeString(),
            userId: userId,
            socketId: socket.id,
        };
        setMessages((prevMessages) => [...prevMessages, newMessage]); 
        socket.emit('message', newMessage);
        try {
            const response = createMessage(token, message, workspaceId);
            console.log("dgjgshd",response);
            if (response.message) {
              setMessage('');
            }
        } catch (error) {
          console.error('Error sending message:', error);
        }
        setMessage('');
    }; 

    return(
        <div className="chat_footer">
            <div className="flex">
                <input
                    type="text"
                    placeholder="Enter a message"
                    className="w-full border rounded p-2 focus:outline-none focus:border-blue-500"
                    value={message}
                    onChange={(ev) => {
                        setMessage(ev.target.value);
                    }}
                    onKeyPress={(event) => {
                        event.key === "Enter" && sendMessage();
                    }}
                />
                <button
                    onClick={sendMessage}
                    className="bg-blue-500 text-white px-4 py-2 rounded-full ml-2"
                >
                    Send
                </button>
            </div>
        </div>
    );
};
export default ChatFooter;