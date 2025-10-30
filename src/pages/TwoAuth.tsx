import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import QRCode from "qrcode";

const TwoAuth = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [secret, setSecret] = useState<string>("");
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [enableEmail, setEnableEmail] = useState<boolean>(true);
  const [enableGithub, setEnableGithub] = useState<boolean>(false);

  useEffect(() => {
    if (user === undefined) {
      navigate('/login');
      return;
    }
  }, [user, navigate]);

  // generate random secret and QR
  useEffect(() => {
    const s = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
    setSecret(s);
  }, []);

  useEffect(() => {
    if (!secret) return;
    const payload = `quickshow://2fa?secret=${secret}`;
    QRCode.toDataURL(payload, { width: 220, margin: 2 })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(""));
  }, [secret]);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Two-Factor Authentication</h1>
          <Button variant="ghost" onClick={() => navigate('/settings')}>Back</Button>
        </div>

        <div className="grid gap-6">
          <section className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
            <h2 className="font-semibold mb-4">Providers</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-sm text-gray-400">Send one-time codes to your email</p>
                </div>
                <Switch checked={enableEmail} onCheckedChange={setEnableEmail} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">GitHub</p>
                  <p className="text-sm text-gray-400">Use GitHub as a second factor</p>
                </div>
                <Switch checked={enableGithub} onCheckedChange={setEnableGithub} />
              </div>
            </div>
          </section>

          <section className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
            <h2 className="font-semibold mb-4">Authenticator App</h2>
            <p className="text-sm text-gray-400 mb-4">Scan this QR code with your mobile authenticator.</p>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-[240px] h-[240px] bg-gray-800 rounded-xl flex items-center justify-center border border-gray-700">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="QR" className="w-[220px] h-[220px]" />
                ) : (
                  <div className="text-gray-500 text-sm">Generating QR...</div>
                )}
              </div>
              <div className="flex-1 w-full">
                <label className="text-xs text-gray-400">Secret</label>
                <Input value={secret} readOnly className="bg-gray-800 border-gray-700 mb-3" />
                <div className="flex gap-3">
                  <Button onClick={() => navigator.clipboard.writeText(secret)} variant="outline" className="border-gray-700">Copy Secret</Button>
                  <Button className="md:hidden" variant="secondary">Scan</Button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TwoAuth;


