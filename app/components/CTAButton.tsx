"use client"

import Link from "next/link"
import type { CTAButtonProps } from "../types"

export default function CTAButton({ href, className, children }: CTAButtonProps) {
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  )
}

