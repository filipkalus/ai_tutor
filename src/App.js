import React, { useState } from 'react';
import { useWhisper } from '@chengsokdara/use-whisper';
import { Configuration, OpenAIApi } from 'openai';
import './App.css';

// NOTE As the description in OpenAI page, text-davinci-003 is recognized as GPT 3.5
// https://learn.microsoft.com/en-us/answers/questions/1165570/is-text-davinci-003-gpt-3-0-and-different-from-cha

// NOTE open ai error handling: https://github.com/openai/openai-node
// const response = await openai.createChatCompletion(completeOptions);

async function sendToChatGPT(openai, text) {
  const inputs = [
    { role: "system", content: "I want you to act as a spoken English teacher and improver. I will speak to you in English and you will reply to me in English to practice my spoken English. I want you to keep your reply neat, limiting the reply to 100 words. I want you to strictly correct my grammar mistakes, typos, and factual errors. I want you to ask me a question in your reply. Now let's start practicing, you could ask me a question first. Remember, I want you to strictly correct my grammar mistakes, typos, and factual errors." },
    { role: "user", content: text },
  ];

  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: inputs,
    max_tokens: 100,
    temperature: 0.7,
    temperature: 0,
    max_tokens: 100,
    top_p: 1,
    frequency_penalty: 0.0,
    presence_penalty: 0.0,
  });

  // NOTE open ai error handling: https://github.com/openai/openai-node
  // const response = await openai.createChatCompletion(completeOptions);
  console.log(response);

  return response.data.choices[0].message.content.trim();
}

const App = () => {
  const {
    recording,
    speaking,
    transcribing,
    transcript,
    pauseRecording,
    startRecording,
    stopRecording,
  } = useWhisper({
    apiKey: process.env.REACT_APP_OPENAI_API_TOKEN,
    streaming: true,
    timeSlice: 1_000, // 1 second
    whisperConfig: {
      language: 'en',
    },
  })


  const configuration = new Configuration({
    apiKey: process.env.REACT_APP_OPENAI_API_TOKEN,
  });
  const openai = new OpenAIApi(configuration);

  const [chatGPTResponse, setChatGPTResponse] = useState('');

  const handleStopRecording = async () => {
    stopRecording();
    const response = await sendToChatGPT(openai, transcript.text);
    setChatGPTResponse(response);
  };

  return (
    <div className="App">
      <div className="App-content">
        {process.env.REACT_APP_OPENAI_API_TOKEN}
        <div className="info-container">
          <div className="info-tooltip">
            <img
              src="https://img.icons8.com/clouds/100/null/reminders.png"
              className="info-icon"
            />
            <span className="tooltiptext">
              <b>TODO</b>
              <br />
              - ChatGPT output streaming
              <br />
              - Max ChatGPT response lenght (max_tokens)
              <br />
              - Audio recording, Time Slice, Nonstop Flag, Stop Timeout
              <br />
              - Active speaking indication
              <br />
              - ChatGPT output to ElevenLabs
              <br />
              - ElevenLabs stream to audio output
              <br />
              - Animated Avatar using audio ElevenLabs stream
              <br />
              - GPT, Whisper model and voice tuning
              <br />
              - Conversation history storage
              <br />
              - Proper backend, database and stuff
              <br />
              - Redo UI - using proper ways and practices :)
            </span>
          </div>
        </div>

        <h1>English AI Tutor</h1>
        <div className="avatar"></div>
        <button onClick={() => startRecording()} disabled={recording}>Start Recording</button>
        <button onClick={handleStopRecording} disabled={!recording}>Stop Recording</button>

        <p>Speak and see it displayed in the box below:</p>
        <p>Transcribed Text: {transcript.text}</p>
        <p>ChatGPT Response: {chatGPTResponse}</p>

      </div>
    </div>
  );
};

export default App;