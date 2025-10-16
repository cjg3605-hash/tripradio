'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

interface SplashScreenProps {
  onComplete?: () => void
  children: React.ReactNode
}

export default function SplashScreen({ onComplete, children }: SplashScreenProps) {
  const [showSplash, setShowSplash] = useState(true)
  const [isHydrated, setIsHydrated] = useState(false)
  const [systemsReady, setSystemsReady] = useState(false)

  useEffect(() => {
    // 🚀 하이드레이션 완료 확인
    setIsHydrated(true)
    
    // 🎯 시스템 초기화 대기
    const initializeSystems = async () => {
      // 언어 시스템, NextAuth, Context 초기화 대기
      await new Promise(resolve => setTimeout(resolve, 800)) // 최소 0.8초 대기
      setSystemsReady(true)
    }

    // 하이드레이션 후 시스템 초기화
    if (isHydrated) {
      initializeSystems()
    }
  }, [isHydrated])

  useEffect(() => {
    // 🎉 모든 시스템이 준비되면 스플래시 종료
    if (systemsReady) {
      const timer = setTimeout(() => {
        setShowSplash(false)
        // onComplete이 함수인 경우에만 호출
        if (typeof onComplete === 'function') {
          setTimeout(onComplete, 300) // 페이드아웃 완료 후 콜백
        }
      }, 200) // 추가 0.2초 여유

      return () => clearTimeout(timer)
    }
    
    return () => {} // 빈 cleanup 함수 반환
  }, [systemsReady, onComplete])

  return (
    <>
      <AnimatePresence mode="wait">
        {showSplash && (
          <motion.div
            key="splash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            {...({ className: "fixed inset-0 z-[9999] flex items-center justify-center bg-white backdrop-blur-sm" } as any)}
          >
            {/* 메인 로고 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                duration: 0.4,
                ease: "easeOut"
              }}
              {...({ className: "flex items-center justify-center relative z-[10000]" } as any)}
            >
              <Image
                src="/logo.png"
                alt="TripRadio Logo"
                width={200}
                height={200}
                className="w-48 h-48 object-contain"
                priority
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 메인 컨텐츠 */}
      <AnimatePresence>
        {!showSplash && (
          <motion.div
            key="main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}