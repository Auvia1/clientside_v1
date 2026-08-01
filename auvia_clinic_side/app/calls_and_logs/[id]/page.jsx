"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import { callsApi } from "../../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { FiArrowLeft, FiPhone, FiPlay } from "react-icons/fi";
import { getLocalDateString } from "../../lib/utils";

function formatDuration(seconds) {
  if (!seconds) return "0m 0s";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

export default function CallDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [call, setCall] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeMonitoring, setActiveMonitoring] = useState(true);
  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  
  // Audio state
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    async function fetchCallDetails() {
      try {
        setLoading(true);
        const data = await callsApi.get(id);
        console.log("DEBUG: Call Data received from API:", data);
        setCall(data);
        setNotes(data.notes || "");
      } catch (err) {
        console.error(err);
        setError("Failed to load call details.");
      } finally {
        setLoading(false);
      }
    }
    fetchCallDetails();
  }, [id]);

  const handleSaveNotes = async () => {
    try {
      setSavingNotes(true);
      const response = await callsApi.update(id, { notes });
      if (response) {
        setCall((prev) => ({ ...prev, notes: response.notes }));
        alert("Notes saved successfully!");
      } else {
        alert("Failed to save notes.");
      }
    } catch (err) {
      console.error("Error saving notes:", err);
      alert("Failed to save notes.");
    } finally {
      setSavingNotes(false);
    }
  };

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const handlePlayRecording = async () => {
    if (audioUrl) return;
    try {
      const blob = await callsApi.playRecording(id);
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
    } catch (err) {
      console.error("Failed to play recording:", err);
      alert("Unable to play recording.");
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    if (/^\+?\d+$/.test(name)) return "U"; // fallback for numbers
    return name.substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f8fb] text-slate-900">
        <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[auto_1fr]">
          <Sidebar />
          <main className="flex flex-col gap-6 px-8 py-6">
            <Navbar activeMonitoring={activeMonitoring} onToggleMonitoring={setActiveMonitoring} />
            <div className="flex items-center justify-center h-full text-slate-500">Loading call details...</div>
          </main>
        </div>
      </div>
    );
  }

  if (error || !call) {
    return (
      <div className="min-h-screen bg-[#f5f8fb] text-slate-900">
        <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[auto_1fr]">
          <Sidebar />
          <main className="flex flex-col gap-6 px-8 py-6">
            <Navbar activeMonitoring={activeMonitoring} onToggleMonitoring={setActiveMonitoring} />
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <div className="text-red-500 font-medium">{error || "Call not found."}</div>
              <Button onClick={() => router.back()} variant="outline">Go Back</Button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const isPhoneNumber = /^\+?\d+$/.test(call.caller);
  const callerName = call.caller && !isPhoneNumber ? call.caller : null; 
  const callerPhone = isPhoneNumber ? call.caller : null; 
  const displayName = callerName || callerPhone || "Unknown Caller";
  // Map actual DB fields
  const creditsBilled = call.credits_used ? Number(call.credits_used).toFixed(2) : "0";
  
  // Format Transcript
  const renderTranscript = () => {
    let parsedTranscript = call.transcript;
    
    // Parse if it's a string (e.g. stringified JSON in the DB)
    if (typeof parsedTranscript === 'string') {
      try {
        parsedTranscript = JSON.parse(parsedTranscript);
      } catch (e) {
        console.error("Failed to parse transcript string:", e);
      }
    }
    
    // Double parse just in case it was double-encoded
    if (typeof parsedTranscript === 'string') {
      try {
        parsedTranscript = JSON.parse(parsedTranscript);
      } catch (e) {
        console.error("Failed to double parse transcript string:", e);
      }
    }

    if (!parsedTranscript || !Array.isArray(parsedTranscript) || parsedTranscript.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-slate-400 italic text-sm">
          No transcription available for this call.
        </div>
      );
    }

    return parsedTranscript.map((msg, index) => {
      // Handle common transcript schema (Vobiz/Vapi/Twilio style)
      const role = msg.role || msg.speaker || (msg.isUser ? "user" : "assistant");
      const text = msg.text || msg.content || msg.msg || "";
      const isAssistant = role === "assistant" || role === "ai" || role === "bot";
      
      if (isAssistant) {
        return (
          <div key={index} className="flex flex-col gap-1 max-w-[75%]">
            <div className="flex items-center gap-2 text-[10px] text-slate-500 mb-1">
              <div className="w-6 h-6 rounded-full bg-[#185579] flex items-center justify-center text-white text-[10px]">
                🤖
              </div>
              <span className="font-semibold text-slate-700">Auvia Assistant</span>
            </div>
            <div className="bg-slate-50 border border-slate-100 text-slate-800 rounded-2xl rounded-tl-sm px-4 py-3 text-sm self-start">
              {text}
            </div>
          </div>
        );
      } else {
        return (
          <div key={index} className="flex flex-col gap-1.5 max-w-[75%] self-end items-end mt-4">
            <div className="flex items-center gap-2 text-[10px] text-slate-500 mb-1 flex-row-reverse">
              <div className="w-6 h-6 rounded-full bg-blue-100/50 flex items-center justify-center text-blue-600 text-[10px] font-semibold">
                {getInitials(displayName)}
              </div>
              <span className="font-semibold text-slate-700">{displayName.split(' ')[0]}</span>
            </div>
            <div className="bg-[#0f172a] text-white rounded-2xl rounded-tr-sm px-5 py-3 text-sm self-end">
              {text}
            </div>
          </div>
        );
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#f5f8fb] text-slate-900">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[auto_1fr]">
        <Sidebar />
        <main className="flex flex-col gap-6 px-8 py-6">
          <Navbar activeMonitoring={activeMonitoring} onToggleMonitoring={setActiveMonitoring} />

          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => router.back()} 
              className="rounded-full h-10 w-10 p-0 flex items-center justify-center transition-transform hover:-translate-x-0.5"
            >
              <FiArrowLeft className="h-5 w-5 text-slate-600" />
            </Button>
            <h1 className="text-2xl font-semibold">Call Details</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="flex flex-col gap-6 lg:col-span-1">
              <Card className="border-slate-100 shadow-sm rounded-[2rem] overflow-hidden">
                <CardContent className="p-8">
                  <div className="flex justify-between items-start">
                    <div className="w-16 h-16 rounded-full bg-blue-100/50 text-blue-600 flex items-center justify-center text-xl font-semibold">
                      {getInitials(displayName)}
                    </div>
                    <Badge className="bg-emerald-50 text-emerald-600 hover:bg-emerald-50 border-0 px-3 py-1 font-medium rounded-full shadow-none">
                      Unpaid
                    </Badge>
                  </div>
                  <div className="mt-5">
                    <h2 className="text-xl font-semibold text-slate-800">{displayName}</h2>
                    {callerName && callerPhone && (
                      <div className="flex items-center text-sm text-slate-500 mt-1.5">
                        <FiPhone className="mr-2 h-3.5 w-3.5" />
                        {callerPhone}
                      </div>
                    )}
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-100 space-y-6">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        CALL DURATION
                      </p>
                      <p className="text-sm font-medium mt-1.5 text-slate-800">{formatDuration(call.duration)}</p>
                    </div>

                    <div className="pt-6 border-t border-slate-100">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        CREDITS BILLED
                      </p>
                      <p className="text-sm font-medium mt-1.5 text-slate-800">{creditsBilled} credits</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-100 shadow-sm rounded-3xl">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-semibold">Call History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative pl-5 border-l-2 border-slate-200/60 ml-2 space-y-6">
                    <div className="relative">
                      <div className="absolute -left-[27px] top-1 w-2.5 h-2.5 rounded-full bg-slate-800 ring-4 ring-white" />
                      <p className="text-xs text-slate-500 font-medium">Attempt #1</p>
                      <p className="text-sm font-semibold text-slate-800 mt-0.5">Completed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-6 lg:col-span-2">
              <Card className="border-slate-100 shadow-sm rounded-3xl">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="flex items-center gap-2 text-slate-800 font-semibold px-2 whitespace-nowrap">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-50 text-blue-600 mr-1">
                      <div className="w-1.5 h-3 border-r-2 border-blue-600"></div>
                      <div className="w-1.5 h-2 border-r-2 border-blue-600"></div>
                    </span> 
                    Recording
                  </div>
                  <div className="flex-1 flex items-center gap-3 bg-slate-50/80 rounded-2xl p-2 px-4">
                    {call.recording ? (
                      <>
                        {!audioUrl ? (
                          <Button 
                            variant="default" 
                            className="h-10 w-10 rounded-full p-0 bg-[#0f172a] hover:bg-slate-800 text-white flex-shrink-0 flex items-center justify-center shadow-md transition-transform hover:scale-105" 
                            onClick={handlePlayRecording}
                          >
                            <FiPlay className="h-4 w-4 ml-1" />
                          </Button>
                        ) : (
                          <div className="w-full flex items-center gap-2">
                            <audio
                              ref={audioRef}
                              controls
                              autoPlay
                              src={audioUrl}
                              className="w-full h-10"
                            />
                          </div>
                        )}
                        {!audioUrl && (
                           <div className="flex-1 flex items-center justify-between text-xs text-slate-400 font-medium px-2">
                             <span>0:00</span>
                             <div className="h-1.5 flex-1 mx-4 bg-slate-200 rounded-full overflow-hidden">
                                <div className="h-full w-0 bg-slate-800 rounded-full"></div>
                             </div>
                             <span>{formatDuration(call.duration)}</span>
                           </div>
                        )}
                      </>
                    ) : (
                      <span className="text-sm text-slate-500 italic py-2">No recording available</span>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-100 shadow-sm rounded-3xl flex-1 flex flex-col">
                <CardHeader className="border-b border-slate-100/80 pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold text-slate-800">AI Conversation Transcript</CardTitle>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      SENTIMENT: NEUTRAL
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="p-6 flex flex-col gap-5 overflow-y-auto max-h-[400px]">
                  {renderTranscript()}
                </CardContent>
              </Card>

              <Card className="border-slate-100 shadow-sm rounded-3xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">AI Summary</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {call.type === 'concurrency_error' ? (
                    <p className="text-sm text-red-600 font-semibold leading-relaxed">
                      Concurrency Error
                    </p>
                  ) : (
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {call.ai_summary || "No summary available for this call."}
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="border-slate-100 shadow-sm rounded-3xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">Follow-up Notes</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <textarea 
                    className="w-full h-[120px] border border-slate-200/80 rounded-2xl p-4 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)] focus:border-[var(--brand-primary)] resize-none text-slate-800 placeholder:text-slate-400"
                    placeholder="Add manual notes regarding this interaction..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                  <div className="flex justify-end mt-4">
                    <Button 
                      className="bg-[#0f172a] hover:bg-slate-800 text-white rounded-xl px-8 py-5 h-auto text-sm font-medium shadow-md transition-transform hover:-translate-y-0.5"
                      onClick={handleSaveNotes}
                      disabled={savingNotes}
                    >
                      {savingNotes ? "Saving..." : "Save Note"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
