import React from "react";
import { Monitor, RefreshCcw, Home, AlertTriangle, Bug, Server, WifiOff, Cpu } from "lucide-react";
import { motion } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { Stars, Float } from "@react-three/drei";

// 3D Glitch Cube Component
const GlitchCube = () => {
  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial 
          color="#ef4444"
          wireframe
          transparent
          opacity={0.6}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      <pointLight position={[2, 2, 2]} intensity={1.5} color="#ef4444" />
    </Float>
  );
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0a0a0f] text-white overflow-hidden">
          {/* Background Layers */}
          <div className="fixed inset-0 pointer-events-none">
            {/* Animated Grid */}
            <div 
              className="absolute inset-0 opacity-5"
              style={{
                backgroundImage: `
                  linear-gradient(to right, #ef4444 1px, transparent 1px),
                  linear-gradient(to bottom, #ef4444 1px, transparent 1px)
                `,
                backgroundSize: '50px 50px',
                animation: 'gridMove 20s linear infinite'
              }}
            />
            
            {/* Red Glow Effects */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/10 blur-[100px] rounded-full animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-600/10 blur-[100px] rounded-full animate-pulse delay-1000" />
            
            {/* 3D Scene */}
            <div className="absolute inset-0">
              <Canvas>
                <ambientLight intensity={0.2} />
                <pointLight position={[10, 10, 10]} intensity={1} color="#ef4444" />
                <Stars radius={50} depth={50} count={1000} factor={4} fade speed={1} />
                <GlitchCube />
              </Canvas>
            </div>
          </div>

          {/* Glitch Text Animation */}
          <div className="absolute top-8 left-0 right-0 text-center">
            <motion.div
              animate={{ 
                x: [0, -2, 2, -2, 2, 0],
                opacity: [1, 0.8, 0.6, 0.8, 1]
              }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="text-sm font-mono text-red-400"
            >
              SYSTEM_GLITCH_DETECTED
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="max-w-lg w-full"
            >
              <div className="bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-2xl rounded-[2.5rem] border border-red-500/20 p-12 shadow-2xl relative overflow-hidden">
                {/* Animated Border */}
                <div className="absolute inset-0 rounded-[2.5rem] border-2 border-transparent animate-border-spin">
                  <div className="absolute inset-0 rounded-[2.5rem] border-2 border-red-500/30" />
                </div>

                {/* Error Icon */}
                <div className="relative mb-10">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-600/30 to-pink-600/30 rounded-full blur-3xl" />
                  <motion.div
                    animate={{ 
                      rotate: [0, 10, -10, 10, 0],
                      scale: [1, 1.05, 0.95, 1.05, 1]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="relative w-32 h-32 mx-auto bg-gradient-to-br from-red-900/30 to-pink-900/30 rounded-3xl flex items-center justify-center border border-red-500/30 shadow-2xl"
                  >
                    <div className="relative">
                      <AlertTriangle className="w-20 h-20 text-red-400" />
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="absolute inset-0 bg-red-400 rounded-full blur-md opacity-30"
                      />
                    </div>
                  </motion.div>
                </div>

                {/* Error Details */}
                <div className="space-y-6 text-center">
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent mb-4">
                      Matrix Failure
                    </h1>
                    <p className="text-gray-300 text-lg leading-relaxed">
                      The system encountered a critical error. Our neural network is attempting to resolve the issue.
                    </p>
                  </motion.div>

                  {/* Error Code */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-black/50 rounded-2xl p-6 border border-gray-800"
                  >
                    <div className="font-mono text-sm text-gray-400 space-y-2">
                      <div className="flex items-center gap-2">
                        <Server className="w-4 h-4 text-red-400" />
                        <span>ERROR_CODE: 0x{Math.random().toString(16).substr(2, 8).toUpperCase()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-blue-400" />
                        <span>TIMESTAMP: {new Date().toISOString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Bug className="w-4 h-4 text-yellow-400" />
                        <span>STATUS: RECOVERABLE</span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Action Buttons */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-col gap-4"
                  >
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => window.location.reload()}
                      className="group relative w-full py-5 bg-gradient-to-r from-red-600 to-pink-600 rounded-2xl font-bold text-lg overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                      <div className="relative flex items-center justify-center gap-3">
                        <RefreshCcw className="w-5 h-5" />
                        Reboot System
                      </div>
                    </motion.button>

                    <motion.a
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      href="/"
                      className="group relative w-full py-5 bg-gradient-to-br from-gray-900 to-black rounded-2xl font-bold text-lg border border-gray-800 overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-gray-800/0 via-gray-800/50 to-gray-800/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      <div className="relative flex items-center justify-center gap-3">
                        <Home className="w-5 h-5" />
                        Return to Mainframe
                      </div>
                    </motion.a>

                    {/* Debug Info */}
                    <motion.button
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      onClick={() => console.log(this.state.error)}
                      className="text-sm text-gray-500 hover:text-gray-300 transition-colors pt-4"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <WifiOff className="w-4 h-4" />
                        Click for debug information
                      </div>
                    </motion.button>
                  </motion.div>
                </div>

                {/* Bottom Status */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="mt-10 pt-6 border-t border-gray-800/50 text-center"
                >
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900/50 rounded-full">
                    <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                    <span className="text-xs font-mono text-gray-400">
                      SYSTEM RECOVERY IN PROGRESS
                    </span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Custom Animation Styles */}
          <style>{`
            @keyframes gridMove {
              0% { transform: translateY(0) translateX(0); }
              100% { transform: translateY(50px) translateX(50px); }
            }
            
            @keyframes border-spin {
              0% { 
                clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
                transform: rotate(0deg);
              }
              25% { 
                clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
              }
              50% { 
                clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
              }
              75% { 
                clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
              }
              100% { 
                clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
                transform: rotate(360deg);
              }
            }
            
            .animate-border-spin {
              animation: border-spin 4s linear infinite;
            }
            
            .animate-pulse {
              animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
            }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;