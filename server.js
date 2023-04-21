const express = require('express')
const cors = require('cors')
const axios = require('axios')
const fs = require('fs')
var bodyParser = require('body-parser');

require('dotenv').config()
const app = express()
app.use(cors())
app.use(bodyParser.json({
  limit: '20mb'
}));

app.use(bodyParser.urlencoded({
  limit: '20mb',
  parameterLimit: 100000,
  extended: true
}));

const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_TOKEN;
const WHISPER_API_URL = 'https://api.openai.com/v1/audio/transcriptions';
const CHAT_GPT_API_URL = 'https://api.openai.com/v1/chat/completions';

app.post('/chatGPT', async (req, res) => {
  try {
    const body = {
      "model": "gpt-3.5-turbo",
      "max_tokens": 100,
      "temperature": 0.7,
      "messages": [
        { "role": "system", "content": "I want you to act as a spoken English teacher and improver. I will speak to you in English and you will reply to me in English to practice my spoken English. I want you to keep your reply neat, limiting the reply to 100 words. I want you to strictly correct my grammar mistakes, typos, and factual errors. I want you to ask me a question in your reply. Now let's start practicing, you could ask me a question first. Remember, I want you to strictly correct my grammar mistakes, typos, and factual errors." },
        { "role": "user", "content": req.body['message'] }
      ]
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    }
    
    const response = await axios.post(CHAT_GPT_API_URL, body, {
      headers,
    })

    res.json(response.data.choices[0].message['content']);

  } catch (error) {
    console.error(error);
    res.json(error)
  }
});

app.post('/transcript', async (req, res) => {
  try {
    // const { default: fetch } = await import('node-fetch')
    // const blob = await(fetch(req.body['file']).then(res => res.blob()))
    fs.writeFileSync(
      "./tmp/speech.mp3",
      Buffer.from(
        req.body['file'].replace("data:audio/mpeg;base64,", ""),
        "base64"
      )
    );
    file = fs.createReadStream("./tmp/speech.mp3")

    const body = {}
    body['model'] = 'whisper-1'
    body['language'] = 'en'
    body['response_format'] = 'json'
    body['temperature'] = '0.7'
    body['file'] = file

    const headers = {}
    headers['Authorization'] = `Bearer ${OPENAI_API_KEY}`
    headers['Content-Type'] = 'multipart/form-data'

    const response = await axios.post(WHISPER_API_URL, body, {
      headers,
    })

    res.json(response.data);

  } catch (error) {
    console.error(error);
    res.json(error)
  }
});

const PORT = process.env.REACT_APP_SERVER_PORT;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});