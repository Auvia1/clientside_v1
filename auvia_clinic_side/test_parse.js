const call = {
  transcript: '[{"speaker": "ai", "text": "Thank you for calling Bright Smile Dental, how can I help you today?", "timestamp": "00:00:01"}, {"speaker": "caller", "text": "Hi, I need to reschedule my appointment on Friday.", "timestamp": "00:00:06"}]'
};

let parsedTranscript = call.transcript;

if (typeof parsedTranscript === 'string') {
  try {
    parsedTranscript = JSON.parse(parsedTranscript);
  } catch (e) {
    console.error("Failed to parse transcript string:", e);
  }
}

if (typeof parsedTranscript === 'string') {
  try {
    parsedTranscript = JSON.parse(parsedTranscript);
  } catch (e) {
    console.error("Failed to double parse transcript string:", e);
  }
}

if (!parsedTranscript || !Array.isArray(parsedTranscript) || parsedTranscript.length === 0) {
  console.log("No transcription available for this call.");
} else {
  parsedTranscript.forEach(msg => {
    const role = msg.role || msg.speaker || (msg.isUser ? "user" : "assistant");
    const text = msg.text || msg.content || msg.msg || "";
    console.log(`Role: ${role}, Text: ${text}`);
  });
}
