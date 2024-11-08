"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/AuthProvider";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import {
  Bell,
  Navigation,
  Home,
  Paintbrush,
  Globe,
  Accessibility,
  Check,
  Music,
  Link,
  Lock,
  Settings as SettingsIcon,
} from "lucide-react";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { user, logout, updateUserProfile } = useAuth();
  const [micPermission, setMicPermission] = useState<PermissionState>("prompt");
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(user?.displayName || "");
  const [position, setPosition] = useState(user?.photoURL || "");

  useEffect(() => {
    navigator.permissions
      .query({ name: "microphone" as PermissionName })
      .then((result) => {
        setMicPermission(result.state);
        result.onchange = () => setMicPermission(result.state);
      });
  }, []);

  const requestMicPermission = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicPermission("granted");
    } catch {
      setMicPermission("denied");
    }
  };

  const handleProfileUpdate = async () => {
    setLoading(true);
    try {
      await updateUserProfile(name, position);
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { icon: Bell, label: "Notifications", value: true },
    { icon: Navigation, label: "Navigation", value: false },
    { icon: Home, label: "Home", value: true },
    { icon: Paintbrush, label: "Appearance", value: false },
    { icon: Globe, label: "Language & region", value: true },
    { icon: Accessibility, label: "Accessibility", value: false },
    { icon: Check, label: "Mark as read", value: true },
    { icon: Music, label: "Audio & video", value: false },
    { icon: Link, label: "Connected accounts", value: true },
    { icon: Lock, label: "Privacy & visibility", value: false },
    { icon: SettingsIcon, label: "Advanced", value: true },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-zinc-950 text-white p-0">
        <div className="flex h-[600px]">
          <div className="w-64 border-r border-zinc-800 p-4">
            <div className="space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.label}
                  className="w-full flex items-center space-x-3 p-2 rounded hover:bg-zinc-900 transition-colors"
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold mb-4">Profile Settings</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Name</label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-zinc-900 border-zinc-800 mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Position</label>
                    <Input
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      className="bg-zinc-900 border-zinc-800 mt-1"
                    />
                  </div>
                  <Button
                    onClick={handleProfileUpdate}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Update Profile"
                    )}
                  </Button>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold mb-4">Permissions</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Microphone Access</h3>
                      <p className="text-sm text-zinc-400">
                        Required for audio recording
                      </p>
                    </div>
                    {micPermission === "prompt" ? (
                      <Button onClick={requestMicPermission}>
                        Allow Access
                      </Button>
                    ) : (
                      <Switch checked={micPermission === "granted"} disabled />
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-zinc-800">
                <Button
                  variant="destructive"
                  onClick={logout}
                  className="w-full"
                >
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
