'use client'
import {useState} from "react"
import {Box, Stack, TextField, Button, Typography} from '@mui/material'
import React from 'react'
import ReactMarkdown from 'react-markdown'

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Hi! I'm the Wander Bot. I'm here to help you plan your next adventure. How can I assist you today?`
    }
  ])

  const [message, setMessage] = useState('')

  const sendMessage = async() => {
    setMessage('')
    setMessages((messages)=>[
      ...messages, 
      {role: "user", content: message},
      {role: "assistant", content: ''},
    ])
    const response = fetch('/api/chat', {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([...messages, {role: 'user', content: message}]),
    }).then( async (res) => {
      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      let result = ''
      return reader.read().then(function processText({done, value}){
        if (done) {
          return result
        }
        const text = decoder.decode(value || new Int8Array(), {stream: true})
        setMessages((messages)=> {
          let lastMessage = messages[messages.length - 1]
          let otherMessages = messages.slice(0, messages.length - 1)
          return [
            ...otherMessages,
            {
              ...lastMessage,
              content: lastMessage.content + text,
            },
          ]
        })
        return reader.read().then(processText)
      })
    })
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      sendMessage();
    }
  }

  return (
    <Box 
      width="100vw" 
      height="100vh" 
      display="flex" 
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      bgcolor="#CCCCFF"
    >
      <Box 
        width="620px" 
        height="100px" 
        border="1px solid #CF9FFF"
        borderRadius={10}
        display="flex" 
        alignItems="center" 
        justifyContent="center"
        margin={1}
        bgcolor="#CF9FFF"
        boxShadow={10}
      >
        <Typography variant="h2" color="white">
          WANDER BOT
        </Typography>
      </Box>
      <Stack
        direction="column"
        width="800px"
        height="700px"
        border="1px solid #f0f0f0"
        borderRadius={8}
        p={2}
        spacing={3}
        bgcolor="#f0f0f0"
        boxShadow={24}
      >
        <Stack
          direction="column"
          spacing={2}
          flexGrow={1}
          overflow="auto"
          maxHeight="100%"
        >
          {
            messages.map((message, index) => (
              <Box
                key={index}
                display="flex"
                justifyContent={
                  message.role === 'assistant' ? 'flex-start' : 'flex-end'
                }
              >
                <Box
                  bgcolor={
                    message.role === 'assistant' ? '#51087E' : 'secondary.main'
                  }
                  color="white"
                  borderRadius={16}
                  p={3}
                >
                  {message.role === 'user' ? 'You' : 'Assistant'}:
                  <ReactMarkdown>
                    {message.content}
                  </ReactMarkdown>
                </Box>
              </Box>
            ))
          }
        </Stack>
        <Stack direction="row" spacing={2}>
          <TextField
            label="message"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Button variant="contained" onClick={sendMessage}>
            Send
          </Button>
        </Stack>
      </Stack>
    </Box>
  )
}