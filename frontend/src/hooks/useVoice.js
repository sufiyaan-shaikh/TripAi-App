"use client"
import { useState, useEffect, useRef } from "react"

export function useVoice(onTranscript) {
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState(null)
  const recognitionRef = useRef(null)

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setError("Browser does not support speech recognition.")
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = "en-US"

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      if (onTranscript) {
        onTranscript(transcript)
      }
      setIsListening(false)
    }

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error)
      setError(event.error)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition
  }, [onTranscript])

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
    } else {
      setError(null)
      try {
        recognitionRef.current?.start()
        setIsListening(true)
      } catch (err) {
        console.error("Failed to start speech recognition:", err)
        setError("Failed to start speech recognition.")
      }
    }
  }

  return { isListening, toggleListening, error }
}
