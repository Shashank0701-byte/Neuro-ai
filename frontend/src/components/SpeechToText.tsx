import React, { useState, useRef, useEffect, useCallback } from 'react'
import { 
  Mic, 
  Upload, 
  Play, 
  Pause, 
  Square, 
  Download,
  FileAudio,
  Loader2,
  CheckCircle,
  AlertCircle,
  Volume2,
  VolumeX,
  RotateCcw,
  Trash2
} from 'lucide-react'

interface AudioData {
  file: File | null
  url: string
  duration: number
  size: number
}

interface TranscriptionResult {
  text: string
  confidence: number
  timestamp: string
  processingTime: number
}

const SpeechToText = () => {
  // Recording states
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioLevel, setAudioLevel] = useState(0)
  
  // Audio states
  const [audioData, setAudioData] = useState<AudioData | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackTime, setPlaybackTime] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  
  // Processing states
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [transcriptionResult, setTranscriptionResult] = useState<TranscriptionResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  // UI states
  const [isDragOver, setIsDragOver] = useState(false)
  const [activeTab, setActiveTab] = useState<'record' | 'upload'>('record')
  
  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const recordingIntervalRef = useRef<number | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  // Cleanup function
  const cleanup = useCallback(() => {
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current)
      recordingIntervalRef.current = null
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
  }, [])

  // Initialize audio context for recording
  const initializeAudioContext = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      audioContextRef.current = new AudioContext()
      analyserRef.current = audioContextRef.current.createAnalyser()
      
      const source = audioContextRef.current.createMediaStreamSource(stream)
      source.connect(analyserRef.current)
      
      analyserRef.current.fftSize = 256
      
      return stream
    } catch (err) {
      setError('Microphone access denied. Please allow microphone permissions.')
      throw err
    }
  }

  // Audio level monitoring
  const monitorAudioLevel = useCallback(() => {
    if (!analyserRef.current) return
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
    analyserRef.current.getByteFrequencyData(dataArray)
    
    const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length
    setAudioLevel(average / 255)
    
    animationFrameRef.current = requestAnimationFrame(monitorAudioLevel)
  }, [])

  // Start recording
  const startRecording = async () => {
    try {
      setError(null)
      const stream = await initializeAudioContext()
      
      mediaRecorderRef.current = new MediaRecorder(stream)
      const chunks: BlobPart[] = []
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }
      
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' })
        const file = new File([blob], `recording-${Date.now()}.wav`, { type: 'audio/wav' })
        const url = URL.createObjectURL(blob)
        
        setAudioData({
          file,
          url,
          duration: recordingTime,
          size: blob.size
        })
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())
      }
      
      mediaRecorderRef.current.start()
      setIsRecording(true)
      setRecordingTime(0)
      
      // Start monitoring audio level
      monitorAudioLevel()
      
      // Start recording timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
      
    } catch (err) {
      console.error('Error starting recording:', err)
    }
  }

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsPaused(false)
      cleanup()
    }
  }

  // Pause/Resume recording
  const togglePauseRecording = () => {
    if (mediaRecorderRef.current) {
      if (isPaused) {
        mediaRecorderRef.current.resume()
        recordingIntervalRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1)
        }, 1000)
      } else {
        mediaRecorderRef.current.pause()
        if (recordingIntervalRef.current) {
          clearInterval(recordingIntervalRef.current)
        }
      }
      setIsPaused(!isPaused)
    }
  }

  // Handle file upload
  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('audio/')) {
      setError('Please upload an audio file')
      return
    }
    
    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      setError('File size must be less than 50MB')
      return
    }
    
    const url = URL.createObjectURL(file)
    setAudioData({
      file,
      url,
      duration: 0,
      size: file.size
    })
    setError(null)
  }

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  // Audio playback controls
  const togglePlayback = () => {
    if (!audioRef.current || !audioData) return
    
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
  }

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  // Process transcription
  const processTranscription = async () => {
    if (!audioData?.file) return
    
    setIsProcessing(true)
    setUploadProgress(0)
    setError(null)
    
    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)
      
      // Simulate API call (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      clearInterval(progressInterval)
      setUploadProgress(100)
      
      // Mock transcription result
      const mockResult: TranscriptionResult = {
        text: "Hello, this is a sample transcription of your audio recording. The AI has successfully processed your speech and converted it to text with high accuracy.",
        confidence: 0.95,
        timestamp: new Date().toISOString(),
        processingTime: 2.8
      }
      
      setTranscriptionResult(mockResult)
      
    } catch (err) {
      setError('Failed to process transcription. Please try again.')
    } finally {
      setIsProcessing(false)
      setUploadProgress(0)
    }
  }

  // Reset everything
  const resetAll = () => {
    stopRecording()
    setAudioData(null)
    setTranscriptionResult(null)
    setError(null)
    setPlaybackTime(0)
    setIsPlaying(false)
    if (audioRef.current) {
      audioRef.current.currentTime = 0
    }
  }

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Cleanup on unmount
  useEffect(() => {
    return cleanup
  }, [cleanup])

  // Audio element event handlers
  useEffect(() => {
    if (audioRef.current && audioData) {
      const audio = audioRef.current
      
      const handleLoadedMetadata = () => {
        setAudioData(prev => prev ? { ...prev, duration: audio.duration } : null)
      }
      
      const handleTimeUpdate = () => {
        setPlaybackTime(audio.currentTime)
      }
      
      const handleEnded = () => {
        setIsPlaying(false)
        setPlaybackTime(0)
      }
      
      audio.addEventListener('loadedmetadata', handleLoadedMetadata)
      audio.addEventListener('timeupdate', handleTimeUpdate)
      audio.addEventListener('ended', handleEnded)
      
      return () => {
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
        audio.removeEventListener('timeupdate', handleTimeUpdate)
        audio.removeEventListener('ended', handleEnded)
      }
    }
  }, [audioData])

  return (
    <section id="speech-to-text" className="py-20 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Speech-to-Text Analysis
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Record your voice or upload an audio file to get AI-powered transcription and cognitive analysis
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('record')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'record'
                  ? 'bg-primary-50 text-primary-600 border-b-2 border-primary-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Mic className="h-5 w-5 inline-block mr-2" />
              Record Audio
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'upload'
                  ? 'bg-primary-50 text-primary-600 border-b-2 border-primary-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Upload className="h-5 w-5 inline-block mr-2" />
              Upload File
            </button>
          </div>

          <div className="p-8">
            {/* Recording Tab */}
            {activeTab === 'record' && (
              <div className="space-y-6">
                {/* Recording Controls */}
                <div className="text-center">
                  <div className="relative inline-block">
                    {/* Audio Level Visualization */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-400 to-secondary-400 opacity-20 animate-pulse"></div>
                    <div 
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-100"
                      style={{ 
                        opacity: audioLevel * 0.5,
                        transform: `scale(${1 + audioLevel * 0.1})`
                      }}
                    ></div>
                    
                    <button
                      onClick={isRecording ? stopRecording : startRecording}
                      disabled={isProcessing}
                      className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center text-white font-medium transition-all duration-300 ${
                        isRecording
                          ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200'
                          : 'bg-gradient-to-r from-primary-500 to-secondary-500 hover:shadow-lg hover:shadow-primary-200'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {isRecording ? (
                        <Square className="h-8 w-8" />
                      ) : (
                        <Mic className="h-8 w-8" />
                      )}
                    </button>
                  </div>
                  
                  {isRecording && (
                    <div className="mt-4 space-y-2">
                      <div className="text-2xl font-mono text-gray-900">
                        {formatTime(recordingTime)}
                      </div>
                      <button
                        onClick={togglePauseRecording}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        {isPaused ? (
                          <Play className="h-4 w-4 inline-block mr-2" />
                        ) : (
                          <Pause className="h-4 w-4 inline-block mr-2" />
                        )}
                        {isPaused ? 'Resume' : 'Pause'}
                      </button>
                    </div>
                  )}
                  
                  {!isRecording && !audioData && (
                    <p className="mt-4 text-gray-600">
                      Click the microphone to start recording
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Upload Tab */}
            {activeTab === 'upload' && (
              <div className="space-y-6">
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                    isDragOver
                      ? 'border-primary-400 bg-primary-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <FileAudio className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    Drop your audio file here
                  </p>
                  <p className="text-gray-600 mb-4">
                    Supports MP3, WAV, M4A, and other audio formats (Max 50MB)
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg hover:shadow-lg transition-all duration-300"
                  >
                    Choose File
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                    className="hidden"
                  />
                </div>
              </div>
            )}

            {/* Audio Player */}
            {audioData && (
              <div className="mt-8 p-6 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Audio Preview</h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span>{formatFileSize(audioData.size)}</span>
                    <span>•</span>
                    <span>{formatTime(Math.floor(audioData.duration))}</span>
                  </div>
                </div>
                
                <audio
                  ref={audioRef}
                  src={audioData.url}
                  className="hidden"
                />
                
                <div className="flex items-center space-x-4">
                  <button
                    onClick={togglePlayback}
                    className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-full flex items-center justify-center hover:shadow-lg transition-all duration-300"
                  >
                    {isPlaying ? (
                      <Pause className="h-5 w-5" />
                    ) : (
                      <Play className="h-5 w-5 ml-0.5" />
                    )}
                  </button>
                  
                  <div className="flex-1">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-100"
                        style={{
                          width: audioData.duration ? `${(playbackTime / audioData.duration) * 100}%` : '0%'
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>{formatTime(Math.floor(playbackTime))}</span>
                      <span>{formatTime(Math.floor(audioData.duration))}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={toggleMute}
                      className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      {isMuted ? (
                        <VolumeX className="h-4 w-4" />
                      ) : (
                        <Volume2 className="h-4 w-4" />
                      )}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={handleVolumeChange}
                      className="w-20"
                    />
                  </div>
                  
                  <button
                    onClick={resetAll}
                    className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                    title="Reset"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Processing Section */}
            {audioData && !transcriptionResult && (
              <div className="mt-8 text-center">
                <button
                  onClick={processTranscription}
                  disabled={isProcessing}
                  className="px-8 py-4 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin inline-block mr-2" />
                      Processing...
                    </>
                  ) : (
                    'Start Transcription'
                  )}
                </button>
                
                {isProcessing && (
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      {uploadProgress < 90 ? 'Uploading...' : 'Processing transcription...'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Transcription Results */}
            {transcriptionResult && (
              <div className="mt-8 p-6 bg-green-50 rounded-xl border border-green-200">
                <div className="flex items-center mb-4">
                  <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
                  <h3 className="text-lg font-semibold text-green-900">
                    Transcription Complete
                  </h3>
                </div>
                
                <div className="bg-white p-4 rounded-lg mb-4">
                  <p className="text-gray-900 leading-relaxed">
                    {transcriptionResult.text}
                  </p>
                </div>
                
                <div className="flex items-center justify-between text-sm text-green-700">
                  <div className="flex items-center space-x-4">
                    <span>Confidence: {(transcriptionResult.confidence * 100).toFixed(1)}%</span>
                    <span>Processing Time: {transcriptionResult.processingTime}s</span>
                  </div>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 bg-green-100 hover:bg-green-200 rounded-md transition-colors">
                      <Download className="h-4 w-4 inline-block mr-1" />
                      Export
                    </button>
                    <button
                      onClick={resetAll}
                      className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                    >
                      <RotateCcw className="h-4 w-4 inline-block mr-1" />
                      New Recording
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                  <p className="text-red-800">{error}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default SpeechToText
