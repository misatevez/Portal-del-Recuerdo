import ProfileData from "./ProfileData"
import { AuthProvider } from "../auth/AuthProvider"
import { CreditManager } from "../components/credits/CreditManager"

export default function ProfilePage() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-surface pt-20">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <ProfileData />
          <div className="mb-8">
            <CreditManager userId={user.id} />
          </div>
        </div>
      </div>
    </AuthProvider>
  )
}

