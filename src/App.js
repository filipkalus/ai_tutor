import React, { useState, useRef } from 'react';
import { useWhisper } from '@chengsokdara/use-whisper';
import './App.css';
import axios from 'axios';
import { Mp3Encoder } from 'lamejs';

// NOTE As the description in OpenAI page, text-davinci-003 is recognized as GPT 3.5
// https://learn.microsoft.com/en-us/answers/questions/1165570/is-text-davinci-003-gpt-3-0-and-different-from-cha

// NOTE open ai error handling: https://github.com/openai/openai-node
// const response = await openai.createChatCompletion(completeOptions);

const App = () => {

  const chunks = useRef([])
  const [temp_transcript, setTempTranscript] = useState('')
  const encoder = useRef(undefined)
  encoder.current = new Mp3Encoder(1, 44100, 96)

  const streamToServer = async (data) => {
    try {
      const buffer = await data.arrayBuffer()
      const mp3chunk = encoder.current.encodeBuffer(new Int16Array(buffer))
      const mp3blob = new Blob([mp3chunk], { type: 'audio/mpeg' })
      chunks.current.push(mp3blob)

      const blob = new Blob(chunks.current, {
        type: 'audio/mpeg',
      })
    
      console.log(encoder.current)
      if (encoder.current) {
        const base64 = await new Promise(
          (resolve) => {
            const reader = new FileReader()
            reader.onloadend = () => resolve(reader.result)
            reader.readAsDataURL(blob)
          }
        )

        const response = await axios.post(`${process.env.REACT_APP_SERVER_CONNECTION_STRING}/transcript`, { 'file': base64 })
        const { text } = response.data
        setTempTranscript(text)

        return {
          blob, text
        }
      }
    } catch (error) {
      setTempTranscript('fail')
      console.error(error);
    }
  }

  const onTranscribe = async (blob) => {
    try {
      const base64 = await new Promise(
        (resolve) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result)
          reader.readAsDataURL(blob)
        }
      )

      const response = await axios.post(`${process.env.REACT_APP_SERVER_CONNECTION_STRING}/transcript`, { 'file': base64 })
      const { text } = response.data

      return {
        blob, text
      }

    } catch (error) {
      console.error('asdasdas');
    }
  }

  const {
    recording,
    transcript,
    startRecording,
    stopRecording,
  } = useWhisper({
    onTranscribe: onTranscribe,
    onDataAvailable: streamToServer,
    streaming: true,
    timeSlice: 2_000,
  })

  const handleStopRecording = async () => {
    stopRecording();
  };

  return (
    <div className="App">
      <div className="App-content">
        <div className="info-container">
          <div className="info-tooltip">
            <img
              src="https://img.icons8.com/clouds/100/null/reminders.png"
              className="info-icon"
              alt=""
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
        <p>Transcribed Text: {temp_transcript}</p>

      </div>
    </div>
  );
};

export default App;