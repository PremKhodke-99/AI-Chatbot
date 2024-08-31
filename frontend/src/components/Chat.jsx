import React, { useState } from 'react'
import { useMutation } from '@tanstack/react-query';
import { IoSend } from "react-icons/io5";
import { RiRobot3Fill } from "react-icons/ri";  
import axios from 'axios'
import './Chat.css'

const Chat = () => {
    const [message, setMessage] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [threadId, setThreadId] = useState(null);
    const [conversations, setConversations] = useState([
        { role: 'assistant', content: 'Hello! How can I assist you today?' }
    ]);

    const sendMessageApi = async (message) => {
        const res = await axios.post('http://localhost:5000/ask', {
            message,
            thread_id: threadId,
        });
        setThreadId(res.data.thread_id);
        return res.data;
    }

    const mutation = useMutation({
        mutationFn: sendMessageApi,
        mutationKey: ['chatbot'],
        onSuccess: (data) => {
            setIsTyping(false);
            setConversations((prevConversation) => [
                ...prevConversation,
                { role: 'assistant', content: data.message }
            ])
        }
    });

    const handleSubmitMessage = () => {
        const currentMessage = message.trim();
        if (!currentMessage) {
            alert("Please enter a message");
            return;
        }
        setConversations((prevConversation) => [
            ...prevConversation,
            { role: 'user', content: currentMessage }
        ]);
        setIsTyping(true);
        mutation.mutate(currentMessage);
        setMessage('');
    }

    return (
        <>
            <div className='header'>
                <h1 className='title'>AI Chatbot</h1>
                <p className='description'>Enter your message in the input below to chat with the AI</p>
                <div className='chat-container'>
                    <div className='conversation'>
                        {
                            conversations.map((entry, index) => (
                                <div className={`message ${entry.role}`} key={index}>
                                    <strong>
                                        {entry.role === 'user' ? 'You' : <RiRobot3Fill />}
                                    </strong>
                                    {entry.content}
                                </div>
                            ))
                        }
                        {
                            isTyping && (
                                <div className="message assistant">
                                    <h1>AI</h1>
                                    <strong>AI is Typing...</strong>
                                </div>
                            )
                        }
                    </div>
                    <div className="input-area">
                        <input
                            type="text"
                            placeholder='Enter message'
                            value={message}
                            className='input-message'
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSubmitMessage}
                        />
                        <button type='submit' className='send-btn' onClick={handleSubmitMessage}>
                            {mutation?.isPending ? <IoSend className="icon-spin" /> : <IoSend />}
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Chat