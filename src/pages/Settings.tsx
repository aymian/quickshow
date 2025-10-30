import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/lib/supabase";
import { toast } from "sonner";
import { useTheme } from "next-themes";

const Settings = () => {
  const navigate = useNavigate();
  const { user, profile, signOut, refreshProfile } = useAuth();
  const [isPrivate, setIsPrivate] = useState<boolean>(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [email, setEmail] = useState("");
  const { theme, setTheme, systemTheme } = useTheme();
  const [prefNotifications, setPrefNotifications] = useState<boolean>(() => localStorage.getItem('qs_pref_notifications') === 'true');
  const [prefSounds, setPrefSounds] = useState<boolean>(() => localStorage.getItem('qs_pref_sounds') === 'true');
  const [prefTypingDots, setPrefTypingDots] = useState<boolean>(() => localStorage.getItem('qs_pref_typing') !== 'false');

  useEffect(() => {
    if (user === undefined) {
      navigate("/login");
      return;
    }
    setIsPrivate(!!profile?.is_private);
    setEmail(profile?.email || user?.email || "");
  }, [user, profile, navigate]);

  const handlePrivacyChange = async (checked: boolean) => {
    setIsPrivate(checked);
    const { error } = await authService.updatePrivacy(checked);
    if (error) {
      toast.error("Failed to update privacy");
      setIsPrivate(!checked);
      return;
    }
    await refreshProfile();
    toast.success(checked ? "Account set to private" : "Account set to public");
  };

  const handleResend = async () => {
    if (!email || resendCooldown > 0) return;
    const { data, error } = await authService.resendConfirmation(email);
    if (error) {
      toast.error(error.message || "Failed to resend email");
      return;
    }
    toast.success("Confirmation email resent");
    setResendCooldown(10);
    const t = setInterval(() => {
      setResendCooldown((s) => {
        if (s <= 1) { clearInterval(t); return 0; }
        return s - 1;
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Settings</h1>
          <Button variant="ghost" onClick={() => navigate("/")}>Back</Button>
        </div>

        <div className="grid gap-6 max-w-3xl">
          <section className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
            <h2 className="font-semibold mb-4">Privacy</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Private account</p>
                <p className="text-sm text-gray-400">Only approved followers can see your content</p>
              </div>
              <Switch checked={isPrivate} onCheckedChange={handlePrivacyChange} />
            </div>
          </section>

          <section className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
            <h2 className="font-semibold mb-4">Appearance</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {(['light','dark','system'] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => setTheme(opt)}
                  className={`p-4 rounded-xl border transition-colors ${
                    (theme || 'system') === opt ? 'border-primary bg-primary/10' : 'border-gray-800 hover:bg-gray-800'
                  }`}
                >
                  <p className="font-medium capitalize">{opt}</p>
                  {opt === 'system' && (
                    <p className="text-xs text-gray-400">Current: {(systemTheme as string) || 'auto'}</p>
                  )}
                </button>
              ))}
            </div>
          </section>

          <section className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
            <h2 className="font-semibold mb-4">Preferences</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Notifications</p>
                  <p className="text-sm text-gray-400">Show in-app alerts</p>
                </div>
                <Switch checked={!!prefNotifications} onCheckedChange={(v) => { setPrefNotifications(v); localStorage.setItem('qs_pref_notifications', String(v)); }} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Sounds</p>
                  <p className="text-sm text-gray-400">Play sound on new message</p>
                </div>
                <Switch checked={!!prefSounds} onCheckedChange={(v) => { setPrefSounds(v); localStorage.setItem('qs_pref_sounds', String(v)); }} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Typing indicator</p>
                  <p className="text-sm text-gray-400">Show three dots while typing</p>
                </div>
                <Switch checked={!!prefTypingDots} onCheckedChange={(v) => { setPrefTypingDots(v); localStorage.setItem('qs_pref_typing', String(v)); }} />
              </div>
            </div>
          </section>

          <section className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
            <h2 className="font-semibold mb-4">Email</h2>
            <div className="flex gap-3 items-center">
              <Input value={email} onChange={(e) => setEmail(e.target.value)} className="bg-gray-800 border-gray-700" />
              <Button onClick={handleResend} disabled={resendCooldown > 0} variant="outline" className="border-gray-700">
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend confirmation'}
              </Button>
            </div>
            <p className="text-xs text-gray-400 mt-2">Make sure your Supabase Auth redirect is set to /onboarding.</p>
          </section>

          <section className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
            <h2 className="font-semibold mb-4">Session</h2>
            <Button onClick={async () => { await signOut(); navigate("/login"); }} className="bg-red-600 hover:bg-red-500">
              Sign out
            </Button>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Settings;


