import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Space } from "antd"
import {
  Float,
  Environment,
  Stars,
  PerspectiveCamera,
} from "@react-three/drei";
import { motion } from "framer-motion";
import { ArrowRight, Zap, Shield, Truck, Monitor } from "lucide-react";
import { Link } from "react-router-dom";

/* 3D Model Placeholder - A stylized Laptop composition */
const LaptopModel = () => {
  const group = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    group.current.rotation.y = Math.sin(t / 4) / 4;
    group.current.rotation.x = Math.sin(t / 4) / 8;
    group.current.position.y = Math.sin(t / 1.5) / 10;
  });

  return (
    <group ref={group} rotation={[0.4, 0, 0]}>
      {/* Base */}
      <mesh position={[0, -0.5, 0]}>
        <boxGeometry args={[4, 0.2, 2.5]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Screen */}
      <group position={[0, 0.6, -1.2]} rotation={[0.2, 0, 0]}>
        <mesh>
          <boxGeometry args={[4, 2.5, 0.1]} />
          <meshStandardMaterial
            color="#1a1a2e"
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>

        {/* Glow Screen */}
        <mesh position={[0, 0, 0.06]}>
          <planeGeometry args={[3.8, 2.3]} />
          <meshBasicMaterial
            color="#00d4ff"
            toneMapped={false}
            transparent
            opacity={0.8}
          />
        </mesh>

        {/* Abstract UI Elements on Screen */}
        <mesh position={[-1, 0.5, 0.07]}>
          <boxGeometry args={[1, 0.5, 0.01]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.5} />
        </mesh>
        <mesh position={[1, -0.5, 0.07]}>
          <circleGeometry args={[0.5, 32]} />
          <meshBasicMaterial color="#7c3aed" transparent opacity={0.5} />
        </mesh>
      </group>

      {/* Keyboard Area */}
      <mesh position={[0, -0.39, 0.5]} rotation={[-1.57, 0, 0]}>
        <planeGeometry args={[3.8, 1.2]} />
        <meshStandardMaterial color="#333" />
      </mesh>
    </group>
  );
};

const AnimatedSphere = () => {
  const mesh = useRef();
  useFrame((state) => {
    mesh.current.rotation.x = state.clock.getElapsedTime() * 0.2;
    mesh.current.rotation.y = state.clock.getElapsedTime() * 0.3;
  });

  return (
    <mesh ref={mesh} position={[3, 1, -2]}>
      <icosahedronGeometry args={[1, 0]} />
      <meshStandardMaterial wireframe color="#7c3aed" />
    </mesh>
  );
};

const HeroSection = () => {
  return (
    <div className="relative w-full min-h-[85vh] bg-[#0a0a0f] text-white overflow-hidden flex items-center">
      {/* 3D Scene Background */}
      <div className="absolute inset-0 z-0">
        <Canvas>
          <PerspectiveCamera makeDefault position={[0, 0, 8]} />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} color="#00d4ff" />
          <pointLight
            position={[-10, -10, -10]}
            intensity={1}
            color="#7c3aed"
          />
          <Stars
            radius={100}
            depth={50}
            count={2000}
            factor={4}
            saturation={0}
            fade
            speed={1}
          />

          <Float speed={2} rotationIntensity={1} floatIntensity={1}>
            <LaptopModel />
          </Float>

          <AnimatedSphere />
          <Environment preset="city" />
        </Canvas>
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 w-full">
        <Space direction="vertical" size={80} align="center" className="w-full">
          {/* Main Content */}
          <div className="flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl text-center"
            >
              <span className="inline-block px-4 py-2 rounded-full bg-white/5 border border-cyan-500/30 text-cyan-400 font-medium text-sm mb-6 backdrop-blur-sm tracking-wide">
                Next-Gen Tech is Here
              </span>
              <h1 className="text-5xl md:text-8xl font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-200 to-cyan-500 mb-4">
                Elevate Your <br className="hidden md:block" />
                Digital Experience
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl md:text-2xl text-gray-300 leading-relaxed max-w-2xl text-center"
            >
              Discover state-of-the-art laptops, powerful desktops, and premium
              accessories designed for professionals and gamers who demand the
              best.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap justify-center gap-6 pt-8"
            >
              <Link
                to="/products"
                className="btn btn-primary group px-8 py-4 text-lg min-w-[160px]"
              >
                Shop Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/about"
                className="btn btn-secondary px-8 py-4 text-lg min-w-[160px]"
              >
                Learn More
              </Link>
            </motion.div>
          </div>

          {/* Features Strip */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="w-fit"
          >
            <div className="bg-gradient-to-r from-cyan-500/10 via-transparent to-cyan-500/10 backdrop-blur-lg border border-white/10 rounded-2xl py-8 px-6">
              <div className="flex flex-wrap justify-center md:justify-between items-center gap-8 md:gap-12">
                <FeatureItem
                  icon={Zap}
                  title="Fast Delivery"
                  desc="Same day shipping"
                />
                <div className="hidden md:block h-8 w-px bg-white/20"></div>
                <FeatureItem
                  icon={Shield}
                  title="Secure Payments"
                  desc="256-bit encryption"
                />
                <div className="hidden md:block h-8 w-px bg-white/20"></div>
                <FeatureItem
                  icon={Truck}
                  title="Free Returns"
                  desc="30-day guarantee"
                />
                <div className="hidden md:block h-8 w-px bg-white/20"></div>
                <FeatureItem
                  icon={Monitor}
                  title="Expert Support"
                  desc="24/7 assistance"
                />
              </div>
            </div>
          </motion.div>
        </Space>
      </div>
    </div>
  );
};

const FeatureItem = ({ icon: Icon, title, desc }) => (
  <div className="flex items-center gap-3">
    <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <h4 className="font-semibold text-white text-sm">{title}</h4>
      <p className="text-gray-400 text-xs">{desc}</p>
    </div>
  </div>
);

export default HeroSection;