import { useConversation } from "@elevenlabs/react";
import { motion } from "framer-motion";
import { Mic, Loader2, Power } from "lucide-react";
import { useCallback, useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Agent() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const agentId = import.meta.env.VITE_ELEVENLABS_AGENT_ID;

  const conversation = useConversation({
    onConnect: () => console.log("Connected to ElevenLabs"),
    onDisconnect: () => {
      console.log("Disconnected from ElevenLabs");
      setIsSpeaking(false);
    },
    onMessage: (message) => console.log("Message:", message),
    onError: (error) => console.error("Error:", error),
    onModeChange: (mode) => setIsSpeaking(mode.mode === "speaking"),
  });

  const { status, startSession, endSession } = conversation;




  const [isStarting, setIsStarting] = useState(false);
  const isStartingRef = useRef(false);

  useEffect(() => {
    // Sync ref with state
    isStartingRef.current = isStarting;
  }, [isStarting]);

  useEffect(() => {
    if (status === "connected") {
      setIsStarting(false);
    }
  }, [status]);

  const toggleConversation = useCallback(async () => {
    if (status === "connected" || status === "connecting" || isStarting) {
      console.log("Ending session...");
      setIsStarting(false);
      try {
        await endSession();
      } catch (error) {
        console.error("Failed to end session:", error);
      }
      return;
    }

    if (!agentId || agentId === "your_agent_id_here") {
      alert("Please configure your VITE_ELEVENLABS_AGENT_ID in the .env file.");
      return;
    }

    setIsStarting(true);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // If the user cancelled during getUserMedia, abort
      if (!isStartingRef.current) {
        console.log("Start cancelled");
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await startSession({ agentId } as any);
    } catch (error) {
      console.error("Failed to start session:", error);
      setIsStarting(false);
      alert("Failed to start session or microphone access is denied.");
    }
  }, [status, endSession, agentId, startSession, isStarting]);




    useEffect(()=> {
    console.log(status)
  },[status])

  return (
    <section id="agent" className="py-16 bg-secondary/20 border-y border-border/50 relative overflow-hidden">
      <div className="container mx-auto px-6 text-center">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-xl mx-auto"
        >
          <div className="mb-8">
             <span className="inline-block text-sm font-medium text-primary uppercase tracking-widest mb-4">
              AI Assistant
            </span>
            <h2 className="font-display text-3xl font-bold mb-4">
              Talk to my AI Agent
            </h2>
            <p className="text-muted-foreground">
              Have questions? Start a voice conversation with my personal AI assistant powered by ElevenLabs.
            </p>
          </div>

          <div className="flex flex-col items-center">
            <div className="relative flex flex-col items-center justify-center min-h-[200px]">
              {status === "connected" ? (
                <div className="relative">
                  {/* Visualizer - purely decorative now when connected */}
                  <motion.div
                    className="absolute inset-0 bg-primary/20 rounded-full blur-xl"
                    animate={{ 
                      scale: isSpeaking ? [1, 1.5, 1] : [1, 1.2, 1],
                      opacity: isSpeaking ? [0.5, 0.8, 0.5] : [0.3, 0.5, 0.3] 
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <div className="w-32 h-32 rounded-full bg-primary/10 border-4 border-primary/20 flex items-center justify-center relative z-10 shadow-[0_0_30px_rgba(var(--primary),0.3)]">
                    <div className="w-24 h-24 rounded-full bg-primary/20 animate-pulse flex items-center justify-center">
                       <Mic className="w-10 h-10 text-primary" />
                    </div>
                  </div>
                </div>
              ) : (
                 /* Start Button */
                 <Button
                  size="lg"
                  onClick={toggleConversation}
                  disabled={status === "connecting" || isStarting}
                  className={cn(
                    "w-32 h-32 rounded-full flex flex-col items-center justify-center gap-2 transition-all duration-300 border-4",
                    "bg-primary hover:bg-primary/90 border-primary/20 shadow-lg hover:shadow-xl hover:scale-105"
                  )}
                >
                  {status === "connecting" || isStarting ? (
                    <Loader2 className="w-8 h-8 animate-spin" />
                  ) : (
                    <Mic className="w-8 h-8" />
                  )}
                  <span className="text-lg font-medium">
                    {status === "connecting" || isStarting ? "Starting" : "Start"}
                  </span>
                </Button>
              )}
            </div>

            {/* Controls Section */}
            <div className="flex flex-col items-center gap-4">
               {/* Status Indicator */}
               <div className="flex items-center gap-2 text-sm font-medium">
                <div 
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors",
                    status === "connected" ? "bg-green-500 shadow-[0_0_10px_#22c55e]" : "bg-neutral-400"
                  )} 
                />
                <span className="capitalize text-muted-foreground">
                  {status === "connected" 
                    ? (isSpeaking ? "Agent Speaking..." : "Listening...") 
                    : (status === "connecting" || isStarting ? "Connecting..." : "Ready to chat")
                  }
                </span>
              </div>

               {/* Action Buttons */}
               {(status === "connected" || status === "connecting" || isStarting) && (
                 <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                 >
                    <Button 
                      variant="destructive" 
                      size="lg"
                      onClick={toggleConversation}
                      className="rounded-full px-8 shadow-md hover:shadow-red-500/20"
                    >
                      <Power className="w-4 h-4 mr-2" />
                      {status === "connecting" || isStarting ? "Cancel Request" : "End Session"}
                    </Button>
                 </motion.div>
               )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
