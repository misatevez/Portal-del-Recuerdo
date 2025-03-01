"use client"

import React from "react"
import Link from "next/link"

// Definir el tipo localmente
interface CTAButtonProps {
  href: string;
  className?: string;
  children: React.ReactNode;
}

export default function CTAButton({ href, className, children }: CTAButtonProps) {
  return (
    <Link href={href} className={`elegant-button ${className || ""}`}>
      {children}
    </Link>
  )
}

