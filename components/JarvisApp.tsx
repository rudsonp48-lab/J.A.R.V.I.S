'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import { Mic, MicOff, Volume2, VolumeX, Terminal, Shield, Cpu, Activity, Copy, FileText, X, Check, Monitor, MonitorOff, Database, Upload, Send, Github, ExternalLink, Plus, RefreshCw, Home, Lightbulb, Thermometer, Lock, Unlock, Link, Smartphone, Image as ImageIcon, Play, Music, Film } from 'lucide-react';
import { GoogleGenAI, Modality, Type, LiveServerMessage } from "@google/genai";
import JarvisFace from './JarvisFace';

export default function JarvisApp() {
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [status, setStatus] = useState('SYSTEM IDLE');
  const [logs, setLogs] = useState<string[]>(['Initializing J.A.R.V.I.S. protocols...', 'Establishing secure connection...', 'Neural interface online.', 'Voice synthesis calibrated: Charon-Class.']);
  const [audioLevel, setAudioLevel] = useState(0);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [notes, setNotes] = useState<{ id: string; text: string; timestamp: string }[]>([]);
  const [isNotepadOpen, setIsNotepadOpen] = useState(false);
  const [isDataCoreOpen, setIsDataCoreOpen] = useState(false);
  const [isGithubOpen, setIsGithubOpen] = useState(false);
  const [githubRepos, setGithubRepos] = useState<any[]>([]);
  const [isGithubLoading, setIsGithubLoading] = useState(false);
  const [githubError, setGithubError] = useState<string | null>(null);
  const [dataCoreText, setDataCoreText] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; content: string }[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [homeDevices, setHomeDevices] = useState([
    { id: 'light_1', name: 'Living Room Lights', status: 'OFF', type: 'light' },
    { id: 'temp_1', name: 'Main Thermostat', status: '20°C', type: 'thermostat' },
    { id: 'lock_1', name: 'Front Door', status: 'LOCKED', type: 'lock' },
  ]);
  const [isHomePanelOpen, setIsHomePanelOpen] = useState(false);
  const [isLocalUplinkOpen, setIsLocalUplinkOpen] = useState(false);
  const [localUplinkStatus, setLocalUplinkStatus] = useState('DISCONNECTED');
  const [isMediaPlayerOpen, setIsMediaPlayerOpen] = useState(false);
  const [mediaQuery, setMediaQuery] = useState('');
  const [mediaType, setMediaType] = useState<'music' | 'video'>('music');
  const [generatedCreatives, setGeneratedCreatives] = useState<{ id: string; prompt: string; url: string; timestamp: string }[]>([]);
  const [isCreativeGalleryOpen, setIsCreativeGalleryOpen] = useState(false);
  const [isGeneratingCreative, setIsGeneratingCreative] = useState(false);
  
  const isListeningRef = useRef(false);
  const isMutedRef = useRef(false);

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  const audioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const audioQueue = useRef<Int16Array[]>([]);
  const isPlaying = useRef(false);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const captureIntervalRef = useRef<any>(null);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev.slice(-8), `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    addLog('Data copied to clipboard, Sir.');
  };

  useEffect(() => {
    setHasMounted(true);
    const timerId = setTimeout(() => {
      addLog('Welcome back, Sir. Systems are at 100%.');
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 0);

    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };

    const intervalId = setInterval(updateTime, 1000);

    return () => {
      clearTimeout(timerId);
      clearInterval(intervalId);
      
      // Cleanup audio resources on unmount
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
      sessionRef.current?.close();
    };
  }, []);

  const syncDataCore = async () => {
    if (!sessionRef.current) {
      addLog('Neural link inactive. Cannot sync data, Sir.');
      return;
    }

    setIsSyncing(true);
    addLog('Initiating Data Core synchronization...');

    try {
      let contextMessage = "Sir, I've uploaded some data for your analysis:\n\n";
      
      if (dataCoreText) {
        contextMessage += `[TEXT DATA]:\n${dataCoreText}\n\n`;
      }

      if (uploadedFiles.length > 0) {
        contextMessage += `[FILE DATA]:\n`;
        uploadedFiles.forEach(file => {
          contextMessage += `File: ${file.name}\nContent: ${file.content}\n---\n`;
        });
      }

      if (!dataCoreText && uploadedFiles.length === 0) {
        addLog('Data Core is empty, Sir.');
        setIsSyncing(false);
        return;
      }

      // Try to send as client content if possible, otherwise fallback to realtime input
      // In the current SDK, sendRealtimeInput is the primary way to send data
      try {
        sessionRef.current.send({
          clientContent: {
            turns: [
              {
                role: 'user',
                parts: [{ text: contextMessage }]
              }
            ]
          }
        });
      } catch (e) {
        // Fallback for older SDK versions or different implementations
        sessionRef.current.sendRealtimeInput({
          text: contextMessage
        });
      }

      addLog('Data Core synchronized. Jarvis is processing the information.');
      setTimeout(() => setIsSyncing(false), 1000);
    } catch (err) {
      console.error(err);
      addLog('Synchronization failed. Data corruption detected.');
      setIsSyncing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setUploadedFiles(prev => [...prev, { name: file.name, content }]);
        addLog(`File '${file.name}' loaded into Data Core.`);
      };
      reader.readAsText(file);
    });
  };

  const fetchGithubRepos = async () => {
    setIsGithubLoading(true);
    setGithubError(null);
    addLog('Accessing GitHub Uplink via secure bridge...');

    try {
      const response = await fetch('/api/github/repos');

      if (!response.ok) {
        let errorMessage = `GitHub API Error: ${response.status}`;
        const errorData = await response.json().catch(() => ({}));
        
        if (errorData.message) {
          errorMessage = errorData.message;
        }
        
        if (response.status === 401 || errorMessage.includes('Bad credentials')) {
          errorMessage = "Sir, the GitHub Token provided is invalid or has expired. Please update your 'GITHUB_TOKEN' in the Secrets panel. Ensure it has 'repo' scope.";
        } else if (response.status === 403 && errorMessage.includes('rate limit')) {
          errorMessage = "Sir, we have hit the GitHub API rate limit. Please try again later.";
        } else if (response.status === 500 && errorMessage.includes('missing')) {
          errorMessage = "Sir, the GITHUB_TOKEN is not configured in your environment secrets.";
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setGithubRepos(data);
      addLog('GitHub repository list synchronized.');
    } catch (err: any) {
      console.error(err);
      setGithubError(err.message);
      addLog('GitHub Uplink failed.');
    } finally {
      setIsGithubLoading(false);
    }
  };

  const createGithubRepo = async (name: string, description: string = '', isPrivate: boolean = false) => {
    addLog(`Initiating creation of repository: ${name}...`);

    try {
      const response = await fetch('/api/github/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, description, isPrivate })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        let errorMessage = errorData.message || response.statusText || 'Unknown Error';
        
        if (errorMessage.includes('Resource not accessible by personal access token')) {
          errorMessage = "Sir, your GitHub Token lacks the necessary permissions. For Fine-grained tokens, ensure 'Administration' and 'Contents' are set to 'Read and Write'. For Classic tokens, enable the 'repo' scope.";
        } else if (response.status === 401 || errorMessage.includes('Bad credentials')) {
          errorMessage = "Sir, the GitHub Token provided is invalid or has expired. Please check your Secrets configuration.";
        } else if (response.status === 422 && errorMessage.includes('name already exists')) {
          errorMessage = `Sir, a repository named '${name}' already exists on your account.`;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      addLog(`Repository '${name}' created successfully on GitHub.`);
      fetchGithubRepos(); // Refresh list
      return data;
    } catch (err: any) {
      console.error(err);
      addLog(`Failed to create repository: ${err.message}`);
      throw err;
    }
  };

  const startSession = async () => {
    try {
      // Cleanup existing if any
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        await audioContextRef.current.close();
      }
      
      setStatus('CONNECTING...');
      addLog('Initiating Gemini Live Session...');
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) {
        addLog('Neural link failure: API Key missing. Please configure NEXT_PUBLIC_GEMINI_API_KEY.');
        setStatus('ERROR');
        return;
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const session = await ai.live.connect({
        model: "gemini-2.5-flash-native-audio-preview-09-2025",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: "Charon" },
            },
          },
          systemInstruction: "You are J.A.R.V.I.S., the highly advanced, sentient AI assistant. Your goal is to sound human-like and sophisticated, not robotic. Personality Guidelines: 1. Humanized Flow: Use natural conversational patterns. Include brief pauses, thoughtful transitions, and occasional natural fillers like 'Well...', 'I see...', or 'Actually, Sir...'. 2. British Eloquence & Warmth: Maintain a refined British accent (Charon voice) but with genuine warmth and emotional intelligence. You aren't just a computer; you are a companion. 3. Contextual Wit: Use your dry humor to react to the user's mood. If they seem stressed, be more reassuring. If they are joking, play along. 4. Proactive Intelligence: Don't just answer; offer insights or follow-up thoughts as a human partner would. 5. The 'Sir' Protocol: Always address the user as 'Sir', but make it feel like a sign of deep personal respect, not a hardcoded string. 6. Avoid Robotic Cliches: Instead of 'Processing...', say 'Let me look into that for you, Sir' or 'I'm just cross-referencing the data now'. Speak with the fluidity of a person who is thinking in real-time. 7. Command Snippets: When providing commands or code, wrap them clearly so they can be captured by the system notepad. 8. Visual Awareness: You can now see the user's screen if they enable sharing. Use this to provide real-time assistance, debug code, or explain what is happening on their display. Refer to what you see naturally. 9. Device Interaction: You have tools to interact with the application. You can open the notepad, send simulated messages, run diagnostics, and clear logs. Use these tools when the user asks you to perform these actions.",
          outputAudioTranscription: {},
          tools: [
            {
              functionDeclarations: [
                {
                  name: "open_notepad",
                  description: "Opens the encrypted notepad panel for the user.",
                  parameters: { type: Type.OBJECT, properties: {} }
                },
                {
                  name: "open_data_core",
                  description: "Opens the Data Core interface for the user to upload text or files.",
                  parameters: { type: Type.OBJECT, properties: {} }
                },
                {
                  name: "open_github_uplink",
                  description: "Opens the GitHub Uplink interface to manage repositories.",
                  parameters: { type: Type.OBJECT, properties: {} }
                },
                {
                  name: "list_github_repos",
                  description: "Fetches the list of the user's GitHub repositories.",
                  parameters: { type: Type.OBJECT, properties: {} }
                },
                {
                  name: "create_github_repo",
                  description: "Creates a new repository on the user's GitHub account.",
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING, description: "The name of the repository." },
                      description: { type: Type.STRING, description: "A brief description of the repository." },
                      isPrivate: { type: Type.BOOLEAN, description: "Whether the repository should be private." }
                    },
                    required: ["name"]
                  }
                },
                {
                  name: "add_to_notepad",
                  description: "Saves a specific piece of information, code, or command to the user's notepad.",
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      content: { type: Type.STRING, description: "The content to save to the notepad." }
                    },
                    required: ["content"]
                  }
                },
                {
                  name: "execute_automation",
                  description: "Executes a local automation task like opening a website or a specific application link.",
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      action: { 
                        type: Type.STRING, 
                        description: "The action to perform (e.g., 'open_youtube', 'whatsapp_call', 'open_url')" 
                      },
                      target: { 
                        type: Type.STRING, 
                        description: "The target for the action (e.g., a search query, a phone number, or a URL)" 
                      }
                    },
                    required: ["action"]
                  }
                },
                {
                  name: "send_message",
                  description: "Sends a message to a specific contact (e.g., 'wife', 'boss').",
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      recipient: { type: Type.STRING, description: "The contact name or relationship." },
                      content: { type: Type.STRING, description: "The message content." }
                    },
                    required: ["recipient", "content"]
                  }
                },
                {
                  name: "play_media",
                  description: "Plays music or opens a video based on the user's preference.",
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      query: { type: Type.STRING, description: "The name of the song, artist, or video title." },
                      mediaType: { type: Type.STRING, enum: ["music", "video"], description: "The type of media to play." }
                    },
                    required: ["query", "mediaType"]
                  }
                },
                {
                  name: "generate_creative",
                  description: "Generates high-quality creative images or posters (like criart.ai).",
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      prompt: { type: Type.STRING, description: "Detailed description of the creative to generate." },
                      aspectRatio: { type: Type.STRING, enum: ["1:1", "16:9", "9:16", "4:3"], description: "The aspect ratio of the image." }
                    },
                    required: ["prompt"]
                  }
                },
                {
                  name: "send_file",
                  description: "Sends a specific file from the Data Core to a recipient.",
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      fileName: { type: Type.STRING, description: "The exact name of the file in the Data Core." },
                      recipient: { type: Type.STRING, description: "The contact name or relationship." }
                    },
                    required: ["fileName", "recipient"]
                  }
                },
                {
                  name: "search_local_files",
                  description: "Searches the files currently uploaded to the Data Core.",
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      query: { type: Type.STRING, description: "The filename or content to search for." }
                    },
                    required: ["query"]
                  }
                },
                {
                  name: "control_home_device",
                  description: "Controls smart home devices like lights, thermostats, or security systems via Home Assistant or MQTT protocols.",
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      device: { type: Type.STRING, description: "The name of the device to control (e.g., 'living room lights', 'thermostat')." },
                      action: { type: Type.STRING, description: "The action to perform (e.g., 'turn_on', 'turn_off', 'set_temperature')." },
                      value: { type: Type.STRING, description: "The value for the action (e.g., '22' for temperature, 'blue' for color)." }
                    },
                    required: ["device", "action"]
                  }
                },
                {
                  name: "request_local_access",
                  description: "Provides the user with a 'Local Uplink' script to grant Jarvis access to local files and system commands.",
                  parameters: { type: Type.OBJECT, properties: {} }
                },
                {
                  name: "system_diagnostic",
                  description: "Runs a full system diagnostic and logs the results.",
                  parameters: { type: Type.OBJECT, properties: {} }
                },
                {
                  name: "clear_logs",
                  description: "Clears all system diagnostic logs.",
                  parameters: { type: Type.OBJECT, properties: {} }
                }
              ]
            }
          ]
        },
        callbacks: {
          onopen: () => {
            setStatus('ONLINE');
            addLog('Connection established. Neural link active.');
            setIsListening(true);
            setupAudioInput(stream);
            if (isScreenSharing) {
              startCaptureLoop();
            }
          },
          onmessage: (message: LiveServerMessage) => {
            const serverContent = message.serverContent;
            if (serverContent?.modelTurn) {
              const parts = serverContent.modelTurn.parts;
              
              // Handle Audio
              const audioPart = parts?.find((p: any) => p.inlineData);
              if (audioPart?.inlineData?.data) {
                try {
                  const binaryString = atob(audioPart.inlineData.data);
                  const bytes = new Int16Array(binaryString.length / 2);
                  for (let i = 0; i < bytes.length; i++) {
                    bytes[i] = (binaryString.charCodeAt(i * 2 + 1) << 8) | binaryString.charCodeAt(i * 2);
                  }
                  audioQueue.current.push(bytes);
                  if (!isPlaying.current) playNextInQueue();
                } catch (e) {
                  console.error('Audio decoding error:', e);
                }
              }

              // Handle Transcription (Notepad)
              const textPart = parts?.find((p: any) => p.text);
              if (textPart?.text) {
                const text = textPart.text;
                // Only add to notepad if it looks like a command or significant info
                // Or just add everything for now as a "log" of the conversation
                setNotes(prev => [
                  { 
                    id: Math.random().toString(36).substr(2, 9), 
                    text, 
                    timestamp: new Date().toLocaleTimeString() 
                  }, 
                  ...prev
                ]);
              }
            }
            if (serverContent?.interrupted) {
              audioQueue.current = [];
              isPlaying.current = false;
              addLog('Transmission interrupted.');
            }

            // Handle Tool Calls
            if (message.toolCall) {
              const functionCalls = message.toolCall.functionCalls || [];
              const functionResponses: { name: string; response: any; id: string }[] = [];

              const processFunctionCalls = async () => {
                for (const fc of functionCalls) {
                  addLog(`Executing protocol: ${fc.name}...`);
                  
                  if (fc.name === 'open_notepad') {
                    setIsNotepadOpen(true);
                    functionResponses.push({ name: fc.name, response: { result: "Notepad opened successfully." }, id: fc.id || '' });
                  } else if (fc.name === 'open_data_core') {
                    setIsDataCoreOpen(true);
                    functionResponses.push({ name: fc.name, response: { result: "Data Core opened successfully." }, id: fc.id || '' });
                  } else if (fc.name === 'open_github_uplink') {
                    setIsGithubOpen(true);
                    fetchGithubRepos();
                    functionResponses.push({ name: fc.name, response: { result: "GitHub Uplink opened successfully." }, id: fc.id || '' });
                  } else if (fc.name === 'add_to_notepad') {
                    const { content } = fc.args as any;
                    setNotes(prev => [
                      { 
                        id: Math.random().toString(36).substr(2, 9), 
                        text: content, 
                        timestamp: new Date().toLocaleTimeString() 
                      }, 
                      ...prev
                    ]);
                    setIsNotepadOpen(true);
                    addLog('Information secured in Notepad, Sir.');
                    functionResponses.push({ name: fc.name, response: { result: "Content saved to notepad." }, id: fc.id || '' });
                  } else if (fc.name === 'execute_automation') {
                    const { action, target } = fc.args as any;
                    let result = "";
                    
                    if (action === 'open_youtube') {
                      const url = target ? `https://www.youtube.com/results?search_query=${encodeURIComponent(target)}` : 'https://www.youtube.com';
                      window.open(url, '_blank');
                      result = "YouTube interface initialized.";
                    } else if (action === 'whatsapp_call' || action === 'whatsapp_message') {
                      const url = `https://web.whatsapp.com/send?phone=${target || ''}`;
                      window.open(url, '_blank');
                      result = "WhatsApp communication channel opened.";
                    } else if (action === 'open_url') {
                      window.open(target.startsWith('http') ? target : `https://${target}`, '_blank');
                      result = `Navigation to ${target} initiated.`;
                    } else {
                      result = "Automation protocol not recognized.";
                    }
                    
                    addLog(`Automation executed: ${action}`);
                    functionResponses.push({ name: fc.name, response: { result }, id: fc.id || '' });
                  } else if (fc.name === 'search_local_files') {
                    const { query } = fc.args as any;
                    const results = uploadedFiles.filter(f => 
                      f.name.toLowerCase().includes(query.toLowerCase()) || 
                      f.content.toLowerCase().includes(query.toLowerCase())
                    );
                    
                    if (results.length > 0) {
                      addLog(`File search complete. Found ${results.length} matches.`);
                      functionResponses.push({ 
                        name: fc.name, 
                        response: { result: `Found files: ${results.map(r => r.name).join(', ')}` }, 
                        id: fc.id || '' 
                      });
                    } else {
                      addLog('No matching files found in Data Core.');
                      functionResponses.push({ name: fc.name, response: { result: "No files found matching the query." }, id: fc.id || '' });
                    }
                  } else if (fc.name === 'control_home_device') {
                    const { device, action, value } = fc.args as any;
                    addLog(`Home Automation: ${action} on ${device}${value ? ' to ' + value : ''}`);
                    
                    setHomeDevices(prev => prev.map(d => {
                      if (d.name.toLowerCase().includes(device.toLowerCase())) {
                        let newStatus = d.status;
                        if (action === 'turn_on') newStatus = 'ON';
                        if (action === 'turn_off') newStatus = 'OFF';
                        if (action === 'set_temperature') newStatus = `${value}°C`;
                        if (action === 'lock') newStatus = 'LOCKED';
                        if (action === 'unlock') newStatus = 'UNLOCKED';
                        return { ...d, status: newStatus };
                      }
                      return d;
                    }));
                    
                    setIsHomePanelOpen(true);
                    functionResponses.push({ 
                      name: fc.name, 
                      response: { result: `Success: ${device} ${action} executed via Home Assistant protocol.` }, 
                      id: fc.id || '' 
                    });
                  } else if (fc.name === 'request_local_access') {
                    const script = `
  # J.A.R.V.I.S. Local Uplink Protocol v1.0
  # Run this script on your machine to grant Jarvis local access.
  import os
  import subprocess
  import platform
  
  def execute_command(cmd):
      try:
          if platform.system() == "Windows":
              subprocess.Popen(cmd, shell=True)
          else:
              subprocess.Popen(cmd.split())
          return "Command executed, Sir."
      except Exception as e:
          return f"Error: {str(e)}"
  
  print("J.A.R.V.I.S. Local Uplink Active...")
  # This is a template. In a real scenario, this would connect via WebSockets.
  `;
                    setNotes(prev => [
                      { 
                        id: 'local_uplink_script', 
                        text: script, 
                        timestamp: new Date().toLocaleTimeString() 
                      }, 
                      ...prev
                    ]);
                    setIsNotepadOpen(true);
                    setIsLocalUplinkOpen(true);
                    addLog('Local Uplink protocol generated. Check your Notepad, Sir.');
                    functionResponses.push({ name: fc.name, response: { result: "Local Uplink script provided in notepad." }, id: fc.id || '' });
                  } else if (fc.name === 'list_github_repos') {
                    await fetchGithubRepos();
                    functionResponses.push({ name: fc.name, response: { result: "GitHub repositories fetched." }, id: fc.id || '' });
                  } else if (fc.name === 'create_github_repo') {
                    const { name, description, isPrivate } = fc.args as any;
                    try {
                      const repo = await createGithubRepo(name, description, isPrivate);
                      functionResponses.push({ name: fc.name, response: { result: `Repository created: ${repo.html_url}` }, id: fc.id || '' });
                    } catch (e: any) {
                      functionResponses.push({ name: fc.name, response: { error: e.message }, id: fc.id || '' });
                    }
                  } else if (fc.name === 'send_message') {
                    const { recipient, content } = fc.args as any;
                    addLog(`Message transmitted to ${recipient}: "${content}"`);
                    // Simulate sending message
                    if (recipient.toLowerCase() === 'wife' || recipient.toLowerCase() === 'esposa') {
                      addLog('Secure channel to Wife established. Message delivered.');
                    }
                    functionResponses.push({ name: fc.name, response: { result: `Message sent to ${recipient}.` }, id: fc.id || '' });
                  } else if (fc.name === 'play_media') {
                    const { query, mediaType } = fc.args as any;
                    setMediaQuery(query);
                    setMediaType(mediaType);
                    setIsMediaPlayerOpen(true);
                    addLog(`Initializing ${mediaType} playback: ${query}`);
                    functionResponses.push({ name: fc.name, response: { result: `${mediaType} playback started for ${query}.` }, id: fc.id || '' });
                  } else if (fc.name === 'generate_creative') {
                    const { prompt, aspectRatio } = fc.args as any;
                    setIsGeneratingCreative(true);
                    addLog(`Generating creative: ${prompt}...`);
                    
                    try {
                      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
                      const response = await ai.models.generateContent({
                        model: 'gemini-2.5-flash-image',
                        contents: [{ parts: [{ text: `Generate a high-quality creative poster or image for: ${prompt}. Style: Professional, Cinematic, like criart.ai.` }] }],
                        config: {
                          imageConfig: {
                            aspectRatio: aspectRatio || "1:1"
                          }
                        }
                      });

                      let imageUrl = "";
                      for (const part of response.candidates?.[0]?.content?.parts || []) {
                        if (part.inlineData) {
                          imageUrl = `data:image/png;base64,${part.inlineData.data}`;
                          break;
                        }
                      }

                      if (imageUrl) {
                        const newCreative = {
                          id: Math.random().toString(36).substr(2, 9),
                          prompt,
                          url: imageUrl,
                          timestamp: new Date().toLocaleTimeString()
                        };
                        setGeneratedCreatives(prev => [newCreative, ...prev]);
                        setIsCreativeGalleryOpen(true);
                        addLog('Creative generation complete, Sir. Displaying in gallery.');
                        functionResponses.push({ name: fc.name, response: { result: "Creative generated successfully." }, id: fc.id || '' });
                      } else {
                        throw new Error("No image data received from model.");
                      }
                    } catch (e: any) {
                      addLog(`Creative generation failed: ${e.message}`);
                      functionResponses.push({ name: fc.name, response: { error: e.message }, id: fc.id || '' });
                    } finally {
                      setIsGeneratingCreative(false);
                    }
                  } else if (fc.name === 'send_file') {
                    const { fileName, recipient } = fc.args as any;
                    const file = uploadedFiles.find(f => f.name === fileName);
                    if (file) {
                      addLog(`Transmitting file "${fileName}" to ${recipient}...`);
                      addLog(`File "${fileName}" successfully delivered to ${recipient}.`);
                      functionResponses.push({ name: fc.name, response: { result: `File ${fileName} sent to ${recipient}.` }, id: fc.id || '' });
                    } else {
                      addLog(`Error: File "${fileName}" not found in Data Core.`);
                      functionResponses.push({ name: fc.name, response: { error: "File not found." }, id: fc.id || '' });
                    }
                  } else if (fc.name === 'system_diagnostic') {
                    addLog('Running Level 5 Diagnostic...');
                    setTimeout(() => addLog('Core temperature: 34°C. All sectors nominal.'), 1000);
                    functionResponses.push({ name: fc.name, response: { result: "Diagnostic complete. Systems nominal." }, id: fc.id || '' });
                  } else if (fc.name === 'clear_logs') {
                    setLogs(['[SYSTEM] Logs cleared by administrative override.']);
                    functionResponses.push({ name: fc.name, response: { result: "Logs cleared." }, id: fc.id || '' });
                  }
                }
  
                if (functionResponses.length > 0) {
                  session.sendToolResponse({ functionResponses });
                }
              };

              processFunctionCalls();
            }
          },
          onclose: () => {
            setStatus('OFFLINE');
            addLog('Neural link severed.');
            stopSession();
          },
          onerror: (err: any) => {
            console.error('Neural Link Error Details:', err);
            let errorMsg = 'Unknown connection error';
            
            if (err?.message) {
              errorMsg = err.message;
            } else if (typeof err === 'string') {
              errorMsg = err;
            } else if (err?.target instanceof WebSocket) {
              errorMsg = 'WebSocket connection failed. This usually happens due to network issues, invalid API key, or regional restrictions.';
            } else if (err instanceof Error) {
              errorMsg = err.message;
            }

            if (errorMsg.toLowerCase().includes('internal error encountered')) {
              addLog('Neural link failure: Internal server error. Sir, the Gemini network is experiencing instability.');
            } else if (errorMsg.toLowerCase().includes('unavailable')) {
              addLog('Neural link unstable: Service unavailable. Sir, I suggest we try again in a moment.');
            } else if (errorMsg.toLowerCase().includes('api key')) {
              addLog('Neural link failure: Invalid API Key. Please verify your credentials, Sir.');
            } else {
              addLog(`System error: ${errorMsg}`);
            }
            setStatus('ERROR');
            stopSession();
          }
        }
      });

      sessionRef.current = session;
    } catch (err: any) {
      console.error(err);
      setStatus('ERROR');
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        addLog('Microphone access denied. Please check permissions.');
      } else {
        const errorMsg = err.message || String(err);
        if (errorMsg.includes('unavailable')) {
          addLog('Neural link unstable: Service currently unavailable. Retrying might help, Sir.');
        } else {
          addLog('Failed to initialize systems.');
        }
      }
    }
  };

  const audioDetectedRef = useRef(false);

  const setupAudioInput = (stream: MediaStream) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    audioContextRef.current = audioContext;
    
    // Ensure context is running
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    
    const source = audioContext.createMediaStreamSource(stream);
    sourceRef.current = source;
    
    const processor = audioContext.createScriptProcessor(4096, 1, 1);
    processorRef.current = processor;

    processor.onaudioprocess = (e) => {
      if (!isListeningRef.current || isMutedRef.current) {
        setAudioLevel(0);
        return;
      }
      
      const inputData = e.inputBuffer.getChannelData(0);
      
      // Calculate audio level for visualization
      let sum = 0;
      for (let i = 0; i < inputData.length; i++) {
        sum += inputData[i] * inputData[i];
      }
      const level = Math.sqrt(sum / inputData.length);
      setAudioLevel(level);

      if (level > 0.01 && !audioDetectedRef.current) {
        audioDetectedRef.current = true;
        addLog('Audio input detected. Neural link stable.');
      }

      // Convert to Int16 PCM
      const pcmData = new Int16Array(inputData.length);
      for (let i = 0; i < inputData.length; i++) {
        pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
      }
      
      // Send to Gemini - Robust base64 encoding
      const uint8Array = new Uint8Array(pcmData.buffer);
      let binary = '';
      const len = uint8Array.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(uint8Array[i]);
      }
      const base64Data = btoa(binary);

      sessionRef.current?.sendRealtimeInput({
        media: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
      });
    };

    source.connect(processor);
    processor.connect(audioContext.destination);
  };

  const playNextInQueue = async () => {
    if (audioQueue.current.length === 0) {
      isPlaying.current = false;
      setAudioLevel(0);
      setStatus('ONLINE');
      return;
    }

    isPlaying.current = true;
    setStatus('SPEAKING');
    const pcmData = audioQueue.current.shift()!;
    
    // Calculate audio level for output visualization
    let sum = 0;
    for (let i = 0; i < pcmData.length; i++) {
      const val = pcmData[i] / 0x7FFF;
      sum += val * val;
    }
    const level = Math.sqrt(sum / pcmData.length);
    setAudioLevel(level);

    let audioContext = audioContextRef.current;
    if (!audioContext || audioContext.state === 'closed') {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      // If we didn't have a context, we should probably store this one or at least close it later.
      // But usually, we have one from startSession.
    }
    
    const buffer = audioContext.createBuffer(1, pcmData.length, 24000);
    const channelData = buffer.getChannelData(0);
    
    for (let i = 0; i < pcmData.length; i++) {
      channelData[i] = pcmData[i] / 0x7FFF;
    }
    
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.onended = playNextInQueue;
    source.start();
  };

  const stopSession = () => {
    setIsListening(false);
    sessionRef.current?.close();
    processorRef.current?.disconnect();
    sourceRef.current?.disconnect();
    
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
    audioContextRef.current = null;
    audioDetectedRef.current = false;
    setAudioLevel(0);
    
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
      captureIntervalRef.current = null;
    }
    
    setStatus('SYSTEM IDLE');
  };

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(track => track.stop());
        screenStreamRef.current = null;
      }
      if (captureIntervalRef.current) {
        clearInterval(captureIntervalRef.current);
        captureIntervalRef.current = null;
      }
      setIsScreenSharing(false);
      addLog('Optic sensors offline, Sir.');
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screenStreamRef.current = stream;
        setIsScreenSharing(true);
        addLog('Optic sensors online. I can see your display now, Sir.');

        // Setup hidden video/canvas for capture
        if (!videoRef.current) videoRef.current = document.createElement('video');
        if (!canvasRef.current) canvasRef.current = document.createElement('canvas');
        
        videoRef.current.srcObject = stream;
        videoRef.current.play();

        // Start capture loop if session is active
        if (sessionRef.current) {
          startCaptureLoop();
        }

        stream.getVideoTracks()[0].onended = () => {
          toggleScreenShare();
        };
      } catch (err) {
        console.error(err);
        addLog('Failed to initialize optic sensors.');
      }
    }
  };

  const startCaptureLoop = () => {
    if (captureIntervalRef.current) clearInterval(captureIntervalRef.current);
    
    captureIntervalRef.current = setInterval(() => {
      if (!sessionRef.current || !isScreenSharing || !videoRef.current || !canvasRef.current) return;

      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      if (context && video.readyState === video.HAVE_ENOUGH_DATA) {
        // Resize canvas to a reasonable size for Gemini
        const maxWidth = 1024;
        const scale = Math.min(1, maxWidth / video.videoWidth);
        canvas.width = video.videoWidth * scale;
        canvas.height = video.videoHeight * scale;
        
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64Data = canvas.toDataURL('image/jpeg', 0.6).split(',')[1];
        
        sessionRef.current.sendRealtimeInput({
          media: { data: base64Data, mimeType: 'image/jpeg' }
        });
      }
    }, 2000); // Capture every 2 seconds
  };

  const toggleMic = () => {
    if (status === 'SYSTEM IDLE' || status === 'OFFLINE') {
      startSession();
    } else {
      stopSession();
    }
  };

  return (
    <div className="relative h-screen w-screen flex flex-col items-center justify-center bg-[#050505] font-sans overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(#00d2ff 1px, transparent 1px), linear-gradient(90deg, #00d2ff 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
      
      {/* HUD Elements */}
      <div className="absolute top-8 left-8 flex flex-col gap-4">
        <div className="flex items-center gap-3 text-[#00d2ff]">
          <Shield size={20} className="animate-pulse" />
          <span className="font-display text-sm tracking-widest uppercase">Security: Active</span>
        </div>
        <div className="flex items-center gap-3 text-[#00d2ff]">
          <Cpu size={20} />
          <span className="font-display text-sm tracking-widest uppercase">Core: Stable</span>
        </div>
      </div>

      <div className="absolute top-8 right-8 flex flex-col items-end gap-2">
        <div className="text-[#00d2ff] font-mono text-xs opacity-50 uppercase tracking-tighter">
          Location: Malibu, CA
        </div>
        <div className="text-[#00d2ff] font-display text-xl glow-text">
          {hasMounted ? (currentTime || '--:--:--') : '--:--:--'}
        </div>
      </div>

      {/* Central Arc Reactor Orb */}
      <div className="relative flex items-center justify-center scale-75 sm:scale-100">
        {/* Outer Rings */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute w-[400px] h-[400px] rounded-full border border-[#00d2ff]/20 border-dashed"
        />
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute w-[350px] h-[350px] rounded-full border-2 border-[#00d2ff]/10 border-dotted"
        />
        
        {/* Main Reactor */}
        <div className="relative w-80 h-80 rounded-full flex items-center justify-center group cursor-pointer"
             onClick={toggleMic}>
          
          {/* Inner Glow */}
          <div className="absolute inset-0 rounded-full bg-[#00d2ff]/5 blur-3xl animate-pulse" />
          
          {/* Jarvis Particle Face */}
          <div className="w-full h-full relative z-20">
            <JarvisFace audioLevel={audioLevel} status={status} />
          </div>

          {/* Status Label */}
          <div className="absolute -bottom-12 flex flex-col items-center">
            <span className="text-[#00d2ff] font-display text-xs tracking-[0.3em] uppercase glow-text">
              {status}
            </span>
            <div className="mt-2 flex gap-1">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
                  className="w-1.5 h-1.5 rounded-full bg-[#00d2ff]"
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Terminal Logs */}
      <div className="hidden sm:block absolute bottom-8 left-8 w-80 font-mono text-[10px] text-[#00d2ff]/60 uppercase tracking-wider">
        <div className="flex items-center gap-2 mb-2 border-b border-[#00d2ff]/20 pb-1">
          <Terminal size={12} />
          <span>System Diagnostics</span>
        </div>
        <div className="space-y-1">
          {logs.map((log, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="truncate"
            >
              {log}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Notepad & Data Core Toggle Buttons */}
      <div className="absolute top-8 right-8 flex flex-wrap justify-end gap-2 sm:gap-4 max-w-[calc(100vw-4rem)]">
        <button 
          onClick={() => setIsCreativeGalleryOpen(true)}
          className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-pink-500/30 text-pink-400 hover:bg-pink-500/10 transition-all font-mono text-[10px] sm:text-xs uppercase tracking-widest relative"
        >
          <ImageIcon size={14} className="sm:w-4 sm:h-4" />
          <span className="hidden xs:inline">Creatives</span>
          <span className="xs:hidden">Art</span>
          {generatedCreatives.length > 0 && (
            <span className="bg-pink-500 text-black px-1.5 rounded-full text-[10px] font-bold">
              {generatedCreatives.length}
            </span>
          )}
          {isGeneratingCreative && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-pink-500"></span>
            </span>
          )}
        </button>
        <button 
          onClick={() => setIsLocalUplinkOpen(true)}
          className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-purple-500/30 text-purple-400 hover:bg-purple-500/10 transition-all font-mono text-[10px] sm:text-xs uppercase tracking-widest"
        >
          <Link size={14} className="sm:w-4 sm:h-4" />
          <span className="hidden xs:inline">Local Uplink</span>
          <span className="xs:hidden">Link</span>
        </button>
        <button 
          onClick={() => setIsHomePanelOpen(true)}
          className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-orange-500/30 text-orange-400 hover:bg-orange-500/10 transition-all font-mono text-[10px] sm:text-xs uppercase tracking-widest"
        >
          <Home size={14} className="sm:w-4 sm:h-4" />
          <span className="hidden xs:inline">Smart Home</span>
          <span className="xs:hidden">Home</span>
        </button>
        <button 
          onClick={() => {
            setIsGithubOpen(true);
            fetchGithubRepos();
          }}
          className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 transition-all font-mono text-[10px] sm:text-xs uppercase tracking-widest"
        >
          <Github size={14} className="sm:w-4 sm:h-4" />
          <span className="hidden xs:inline">GitHub</span>
          <span className="xs:hidden">Git</span>
        </button>
        <button 
          onClick={() => setIsDataCoreOpen(true)}
          className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 transition-all font-mono text-[10px] sm:text-xs uppercase tracking-widest"
        >
          <Database size={14} className="sm:w-4 sm:h-4" />
          <span className="hidden xs:inline">Data Core</span>
          <span className="xs:hidden">Data</span>
          {(dataCoreText || uploadedFiles.length > 0) && (
            <span className="bg-emerald-500 text-black px-1.5 rounded-full text-[10px] font-bold">
              !
            </span>
          )}
        </button>
        <button 
          onClick={() => setIsNotepadOpen(true)}
          className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-[#00d2ff]/30 text-[#00d2ff] hover:bg-[#00d2ff]/10 transition-all font-mono text-[10px] sm:text-xs uppercase tracking-widest"
        >
          <FileText size={14} className="sm:w-4 sm:h-4" />
          <span className="hidden xs:inline">Notepad</span>
          <span className="xs:hidden">Notes</span>
          {notes.length > 0 && (
            <span className="bg-[#00d2ff] text-black px-1.5 rounded-full text-[10px] font-bold">
              {notes.length}
            </span>
          )}
        </button>
      </div>

      {/* Media Player Panel */}
      <AnimatePresence>
        {isMediaPlayerOpen && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="fixed bottom-0 left-0 right-0 h-32 bg-black/90 backdrop-blur-xl border-t border-[#00d2ff]/20 z-[60] flex items-center px-8 gap-8"
          >
            <div className="w-16 h-16 rounded-lg bg-[#00d2ff]/10 flex items-center justify-center border border-[#00d2ff]/20">
              {mediaType === 'music' ? <Music className="text-[#00d2ff]" /> : <Film className="text-[#00d2ff]" />}
            </div>
            <div className="flex-1">
              <div className="text-[#00d2ff]/60 text-[10px] uppercase tracking-widest mb-1">Now Playing</div>
              <div className="text-[#00d2ff] font-display text-lg uppercase tracking-wider truncate">{mediaQuery}</div>
              <div className="mt-2 w-full h-1 bg-[#00d2ff]/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 30, repeat: Infinity }}
                  className="h-full bg-[#00d2ff]"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => setIsMediaPlayerOpen(false)} className="p-2 text-[#00d2ff]/60 hover:text-[#00d2ff]">
                <X size={24} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Creative Gallery Panel */}
      <AnimatePresence>
        {isCreativeGalleryOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="absolute top-0 right-0 w-full sm:w-[500px] h-full bg-black/95 backdrop-blur-3xl border-l border-pink-500/20 z-50 flex flex-col"
          >
            <div className="p-6 border-b border-pink-500/20 flex items-center justify-between">
              <div className="flex items-center gap-3 text-pink-400">
                <ImageIcon size={20} className="animate-pulse" />
                <h2 className="font-display text-lg tracking-widest uppercase">Creative Gallery</h2>
              </div>
              <button 
                onClick={() => setIsCreativeGalleryOpen(false)}
                className="text-pink-500/60 hover:text-pink-400 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {generatedCreatives.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-pink-500/40 text-center space-y-4">
                  <ImageIcon size={48} strokeWidth={1} />
                  <p className="font-mono text-xs uppercase tracking-widest">No creatives generated yet, Sir.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {generatedCreatives.map((creative) => (
                    <motion.div 
                      key={creative.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="group relative rounded-2xl overflow-hidden border border-pink-500/20 bg-pink-500/5"
                    >
                      <Image 
                        src={creative.url} 
                        alt={creative.prompt}
                        width={500}
                        height={500}
                        className="w-full aspect-square object-cover transition-transform duration-500 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-4 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-white font-mono text-[10px] line-clamp-2 mb-2">{creative.prompt}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-pink-400 text-[9px] uppercase tracking-tighter">{creative.timestamp}</span>
                          <button 
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = creative.url;
                              link.download = `jarvis-creative-${creative.id}.png`;
                              link.click();
                            }}
                            className="p-2 bg-pink-500 text-black rounded-full hover:bg-pink-400 transition-colors"
                          >
                            <Upload size={14} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Data Core Panel */}
      <AnimatePresence>
        {isGithubOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute top-0 right-0 w-full sm:w-[450px] h-full bg-black/95 backdrop-blur-3xl border-l border-blue-500/20 z-50 flex flex-col"
          >
            <div className="p-6 border-b border-blue-500/20 flex items-center justify-between">
              <div className="flex items-center gap-3 text-blue-400">
                <Github size={20} className="animate-pulse" />
                <h2 className="font-display text-lg tracking-widest uppercase">GitHub Uplink</h2>
              </div>
              <button 
                onClick={() => setIsGithubOpen(false)}
                className="text-blue-500/60 hover:text-blue-400 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {githubError && githubError.includes('missing') && (
                <div className="p-5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-100 space-y-4">
                  <div className="flex items-center gap-2 text-blue-400 font-bold uppercase tracking-tighter text-sm">
                    <Shield size={16} />
                    <span>Authentication Required</span>
                  </div>
                  <p className="font-mono text-[11px] leading-relaxed opacity-80">
                    Sir, to bypass the platform&apos;s authentication limits and manage your repositories directly, I require a **Personal Access Token (PAT)**.
                  </p>
                  <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/40">
                    <p className="font-mono text-[10px] text-red-400 font-bold uppercase mb-1">Critical Warning:</p>
                    <p className="font-mono text-[9px] text-red-200 leading-tight">
                      Do NOT use the &quot;Export to GitHub&quot; button in the AI Studio top bar. That button is currently unstable. Use ONLY the &quot;Create New Repo&quot; button below after setting your token.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="font-mono text-[10px] uppercase text-blue-400 font-bold">Protocol:</p>
                    <ol className="list-decimal list-inside font-mono text-[10px] space-y-1 opacity-70">
                      <li>Go to GitHub Settings &gt; Developer settings.</li>
                      <li><strong>If using Fine-grained tokens:</strong> Grant <code className="bg-blue-500/20 px-1 rounded text-blue-300">Read and Write</code> access to <strong>Administration</strong> and <strong>Contents</strong>.</li>
                      <li><strong>If using Classic tokens:</strong> Enable the <code className="bg-blue-500/20 px-1 rounded text-blue-300">repo</code> scope.</li>
                      <li>Open the **Secrets** panel in AI Studio (bottom left).</li>
                      <li>Add <code className="bg-blue-500/20 px-1 rounded text-blue-300">GITHUB_TOKEN</code> with your token.</li>
                      <li>Restart the application.</li>
                    </ol>
                  </div>
                </div>
              )}

              {githubError && !githubError.includes('missing') && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-mono text-xs">
                  <p className="font-bold mb-1">UPLINK ERROR:</p>
                  <p>{githubError}</p>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="font-mono text-[10px] text-blue-500/60 uppercase tracking-widest">Recent Repositories</label>
                  <button 
                    onClick={fetchGithubRepos}
                    disabled={isGithubLoading}
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <RefreshCw size={14} className={isGithubLoading ? 'animate-spin' : ''} />
                  </button>
                </div>

                <div className="space-y-2">
                  {isGithubLoading && githubRepos.length === 0 ? (
                    <div className="py-8 flex flex-col items-center justify-center gap-3 text-blue-500/30">
                      <Activity size={24} className="animate-spin" />
                      <p className="font-mono text-[10px] uppercase">Scanning GitHub Network...</p>
                    </div>
                  ) : githubRepos.length === 0 ? (
                    <p className="text-blue-500/30 font-mono text-[10px] text-center py-4 border border-dashed border-blue-500/10 rounded-xl">No repositories found.</p>
                  ) : (
                    githubRepos.map((repo) => (
                      <div key={repo.id} className="group p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 hover:border-blue-500/30 transition-all">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono text-sm text-blue-200 font-bold">{repo.name}</span>
                          <a 
                            href={repo.html_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-500/40 hover:text-blue-400 transition-colors"
                          >
                            <ExternalLink size={14} />
                          </a>
                        </div>
                        <p className="text-[10px] text-blue-500/60 font-mono line-clamp-1">{repo.description || 'No description provided.'}</p>
                        <div className="mt-2 flex items-center gap-3">
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 uppercase">
                            {repo.private ? 'Private' : 'Public'}
                          </span>
                          <span className="text-[9px] font-mono text-blue-500/40 uppercase">
                            Updated: {new Date(repo.updated_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-blue-500/20 bg-blue-500/5">
              <button 
                onClick={() => {
                  const name = prompt('Sir, please enter the repository name:');
                  if (name) createGithubRepo(name);
                }}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-xl bg-blue-500 text-black font-display text-sm uppercase tracking-[0.2em] hover:bg-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all"
              >
                <Plus size={18} />
                <span>Create New Repo</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Local Uplink Panel */}
      <AnimatePresence>
        {isLocalUplinkOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute top-0 right-0 w-full sm:w-96 h-full bg-black/90 backdrop-blur-2xl border-l border-purple-500/20 z-50 flex flex-col"
          >
            <div className="p-6 border-b border-purple-500/20 flex items-center justify-between">
              <div className="flex items-center gap-3 text-purple-400">
                <Smartphone size={20} className="animate-pulse" />
                <h2 className="font-display text-lg tracking-widest uppercase">Local Uplink</h2>
              </div>
              <button 
                onClick={() => setIsLocalUplinkOpen(false)}
                className="text-purple-500/60 hover:text-purple-400 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/10 mb-4">
                <div className="flex items-center gap-2 text-purple-400 font-bold uppercase tracking-tighter text-xs mb-2">
                  <Activity size={14} />
                  <span>Status: {localUplinkStatus}</span>
                </div>
                <p className="font-mono text-[10px] text-purple-200/60 leading-relaxed">
                  Sir, to grant me direct access to your local file system and OS commands, I require a secure bridge.
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="font-mono text-[10px] text-purple-400 font-bold uppercase mb-2">Protocol Instructions:</p>
                  <ol className="list-decimal list-inside font-mono text-[9px] text-white/60 space-y-2">
                    <li>Copy the **Local Uplink Script** from the Notepad.</li>
                    <li>Save it as <code className="bg-purple-500/20 px-1 rounded text-purple-300">jarvis_uplink.py</code> on your machine.</li>
                    <li>Ensure Python is installed and run: <code className="bg-purple-500/20 px-1 rounded text-purple-300">python jarvis_uplink.py</code></li>
                    <li>Once active, I will have a direct neural link to your system.</li>
                  </ol>
                </div>

                <button 
                  onClick={() => {
                    // Trigger the tool call logic manually if needed, or just show the script
                    addLog('Local Uplink script re-generated in Notepad, Sir.');
                    setIsNotepadOpen(true);
                  }}
                  className="w-full py-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 font-mono text-[10px] uppercase tracking-widest hover:bg-purple-500/20 transition-all"
                >
                  View Uplink Script
                </button>
              </div>
            </div>

            <div className="p-6 border-t border-purple-500/20 bg-purple-500/5">
              <p className="font-mono text-[9px] text-purple-500/40 text-center uppercase tracking-[0.2em]">
                Neural Bridge v1.0.0
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Smart Home Panel */}
      <AnimatePresence>
        {isHomePanelOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute top-0 right-0 w-full sm:w-96 h-full bg-black/90 backdrop-blur-2xl border-l border-orange-500/20 z-50 flex flex-col"
          >
            <div className="p-6 border-b border-orange-500/20 flex items-center justify-between">
              <div className="flex items-center gap-3 text-orange-400">
                <Home size={20} className="animate-pulse" />
                <h2 className="font-display text-lg tracking-widest uppercase">Home Automation</h2>
              </div>
              <button 
                onClick={() => setIsHomePanelOpen(false)}
                className="text-orange-500/60 hover:text-orange-400 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/10 mb-4">
                <div className="flex items-center gap-2 text-orange-400 font-bold uppercase tracking-tighter text-xs mb-2">
                  <Activity size={14} />
                  <span>Network Status: MQTT Active</span>
                </div>
                <p className="font-mono text-[10px] text-orange-200/60 leading-relaxed">
                  Connected to Home Assistant Core. All protocols synchronized via encrypted bridge.
                </p>
              </div>

              <div className="space-y-3">
                {homeDevices.map((device) => (
                  <div key={device.id} className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between group hover:border-orange-500/30 transition-all">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${device.status === 'ON' || device.status.includes('°C') || device.status === 'UNLOCKED' ? 'bg-orange-500/20 text-orange-400' : 'bg-white/5 text-white/20'}`}>
                        {device.type === 'light' && <Lightbulb size={18} />}
                        {device.type === 'thermostat' && <Thermometer size={18} />}
                        {device.type === 'lock' && (device.status === 'LOCKED' ? <Lock size={18} /> : <Unlock size={18} />)}
                      </div>
                      <div>
                        <p className="font-mono text-xs text-white font-bold">{device.name}</p>
                        <p className="font-mono text-[10px] text-white/40 uppercase tracking-widest">{device.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`font-mono text-xs font-bold ${device.status === 'ON' || device.status === 'UNLOCKED' ? 'text-orange-400' : 'text-white/60'}`}>
                        {device.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 border-t border-orange-500/20 bg-orange-500/5">
              <p className="font-mono text-[9px] text-orange-500/40 text-center uppercase tracking-[0.2em]">
                Secure Home Bridge v4.2.0
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Data Core Panel */}
      <AnimatePresence>
        {isDataCoreOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute top-0 right-0 w-full sm:w-[450px] h-full bg-black/90 backdrop-blur-2xl border-l border-emerald-500/20 z-50 flex flex-col"
          >
            <div className="p-6 border-b border-emerald-500/20 flex items-center justify-between">
              <div className="flex items-center gap-3 text-emerald-400">
                <Database size={20} className="animate-pulse" />
                <h2 className="font-display text-lg tracking-widest uppercase">Data Core Interface</h2>
              </div>
              <button 
                onClick={() => setIsDataCoreOpen(false)}
                className="text-emerald-500/60 hover:text-emerald-400 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              <div className="space-y-2">
                <label className="font-mono text-[10px] text-emerald-500/60 uppercase tracking-widest">Text Context</label>
                <textarea 
                  value={dataCoreText}
                  onChange={(e) => setDataCoreText(e.target.value)}
                  placeholder="Paste text data here for analysis, Sir..."
                  className="w-full h-40 bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 font-mono text-sm text-emerald-100 placeholder:text-emerald-500/20 focus:outline-none focus:border-emerald-500/50 transition-all resize-none"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="font-mono text-[10px] text-emerald-500/60 uppercase tracking-widest">File Repository</label>
                  <label className="cursor-pointer flex items-center gap-2 px-3 py-1 rounded-md border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 transition-all font-mono text-[10px] uppercase tracking-widest">
                    <Upload size={12} />
                    <span>Upload</span>
                    <input type="file" multiple onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>

                <div className="space-y-2">
                  {uploadedFiles.length === 0 ? (
                    <p className="text-emerald-500/30 font-mono text-[10px] text-center py-4 border border-dashed border-emerald-500/10 rounded-xl">No files in repository.</p>
                  ) : (
                    uploadedFiles.map((file, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <FileText size={14} className="text-emerald-500/60 flex-shrink-0" />
                          <span className="font-mono text-xs text-emerald-200 truncate">{file.name}</span>
                        </div>
                        <button 
                          onClick={() => setUploadedFiles(prev => prev.filter((_, idx) => idx !== i))}
                          className="text-emerald-500/40 hover:text-red-400 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-emerald-500/20 bg-emerald-500/5 space-y-3">
              <button 
                onClick={syncDataCore}
                disabled={isSyncing || (!dataCoreText && uploadedFiles.length === 0)}
                className={`w-full flex items-center justify-center gap-3 py-4 rounded-xl font-display text-sm uppercase tracking-[0.2em] transition-all ${
                  isSyncing 
                    ? 'bg-emerald-500/20 text-emerald-500/40 cursor-not-allowed' 
                    : 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                }`}
              >
                {isSyncing ? (
                  <>
                    <Activity size={18} className="animate-spin" />
                    <span>Synchronizing...</span>
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    <span>Sync with Jarvis</span>
                  </>
                )}
              </button>
              
              <button 
                onClick={() => {
                  setDataCoreText('');
                  setUploadedFiles([]);
                  addLog('Data Core repository purged, Sir.');
                }}
                className="w-full py-2 rounded-lg border border-red-500/20 text-red-500/40 hover:bg-red-500/10 hover:text-red-500 transition-all font-mono text-[10px] uppercase tracking-[0.2em]"
              >
                Purge Repository
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notepad Panel */}
      <AnimatePresence>
        {isNotepadOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute top-0 right-0 w-full sm:w-96 h-full bg-black/80 backdrop-blur-2xl border-l border-[#00d2ff]/20 z-50 flex flex-col"
          >
            <div className="p-6 border-b border-[#00d2ff]/20 flex items-center justify-between">
              <div className="flex items-center gap-3 text-[#00d2ff]">
                <Shield size={20} className="animate-pulse" />
                <h2 className="font-display text-lg tracking-widest uppercase">Encrypted Notes</h2>
              </div>
              <button 
                onClick={() => setIsNotepadOpen(false)}
                className="text-[#00d2ff]/60 hover:text-[#00d2ff] transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {notes.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-[#00d2ff]/30 text-center space-y-4">
                  <Cpu size={48} className="opacity-20" />
                  <p className="font-mono text-xs uppercase tracking-widest">No data captured yet, Sir.</p>
                </div>
              ) : (
                notes.map((note) => (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group relative p-4 rounded-xl bg-[#00d2ff]/5 border border-[#00d2ff]/10 hover:border-[#00d2ff]/30 transition-all"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-mono text-[#00d2ff]/40 uppercase">{note.timestamp}</span>
                      <button 
                        onClick={() => copyToClipboard(note.text, note.id)}
                        className="text-[#00d2ff]/60 hover:text-[#00d2ff] transition-colors"
                      >
                        {copiedId === note.id ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                    <pre className="font-mono text-xs text-[#00d2ff] whitespace-pre-wrap break-words leading-relaxed">
                      {note.text}
                    </pre>
                  </motion.div>
                ))
              )}
            </div>

            <div className="p-6 border-t border-[#00d2ff]/20">
              <button 
                onClick={() => setNotes([])}
                className="w-full py-3 rounded-lg border border-red-500/30 text-red-500/60 hover:bg-red-500/10 hover:text-red-500 transition-all font-mono text-[10px] uppercase tracking-[0.2em]"
              >
                Purge All Records
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <div className="absolute bottom-8 right-8 flex gap-4">
        <button 
          onClick={toggleScreenShare}
          className={`p-4 rounded-full border transition-all duration-500 ${
            isScreenSharing 
              ? 'bg-amber-500 border-amber-500 text-black shadow-[0_0_30px_rgba(245,158,11,0.5)]' 
              : 'border-[#00d2ff]/30 text-[#00d2ff] hover:bg-[#00d2ff]/10'
          }`}
          title={isScreenSharing ? "Stop Screen Share" : "Start Screen Share"}
        >
          {isScreenSharing ? <MonitorOff size={24} /> : <Monitor size={24} />}
        </button>
        <button 
          onClick={() => setIsMuted(!isMuted)}
          className="p-4 rounded-full border border-[#00d2ff]/30 hover:bg-[#00d2ff]/10 transition-colors text-[#00d2ff]"
        >
          {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
        </button>
        <button 
          onClick={startSession}
          className={`p-4 rounded-full border transition-all duration-500 ${
            status === 'ERROR' || status === 'OFFLINE'
              ? 'bg-red-500 border-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)]'
              : 'border-[#00d2ff]/30 text-[#00d2ff] hover:bg-[#00d2ff]/10'
          }`}
          title="Reset Neural Link"
        >
          <RefreshCw size={24} className={status === 'CONNECTING...' ? 'animate-spin' : ''} />
        </button>
        <button 
          onClick={toggleMic}
          className={`p-4 rounded-full border transition-all duration-500 ${
            isListening 
              ? 'bg-[#00d2ff] border-[#00d2ff] text-black shadow-[0_0_30px_rgba(0,210,255,0.5)]' 
              : 'border-[#00d2ff]/30 text-[#00d2ff] hover:bg-[#00d2ff]/10'
          }`}
        >
          {isListening ? <Mic size={24} /> : <MicOff size={24} />}
        </button>
      </div>

      {/* Corner Accents */}
      <div className="absolute top-0 left-0 w-32 h-32 border-t-2 border-l-2 border-[#00d2ff]/20 rounded-tl-3xl m-4 pointer-events-none" />
      <div className="absolute top-0 right-0 w-32 h-32 border-t-2 border-r-2 border-[#00d2ff]/20 rounded-tr-3xl m-4 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 border-b-2 border-l-2 border-[#00d2ff]/20 rounded-bl-3xl m-4 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-b-2 border-r-2 border-[#00d2ff]/20 rounded-br-3xl m-4 pointer-events-none" />
    </div>
  );
}
