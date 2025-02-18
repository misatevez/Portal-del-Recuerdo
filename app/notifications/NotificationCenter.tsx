"use client"

import { useState } from "react"
import { Bell } from "lucide-react"

export function NotificationCenter() {
  const [notificationCount, setNotificationCount] = useState(0)

  // TODO: Implement fetching of actual notification count

  return (
    <div className="relative">
      <Bell className="w-6 h-6 text-primary cursor-pointer" />
      {notificationCount > 0 && (
        <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-primary text-xs text-background rounded-full px-1">
          {notificationCount}
        </span>
      )}
    </div>
  )
}

