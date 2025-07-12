
'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { LogOut, Trash2, Download, RefreshCcw, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { useDashboardData } from '@/app/dashboard/dashboard-context';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger } from '@/components/ui/dialog';
import { useRef } from 'react';
import bcrypt from 'bcryptjs';

type MostViewedVideo = { id: string; title: string; thumbnail: string; url: string; viewCount: string };
type YoutubeChannel = { id: string; title: string; thumbnail: string; url: string; subscriberCount?: string; viewCount?: string; mostViewedVideo?: MostViewedVideo | null };
type Device = { id: string; device: string; userAgent: string; createdAt: string; lastActive: string };

export default function SettingsPage() {
  const [theme, setTheme] = useState('system');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('creator@email.com');
  const [phone, setPhone] = useState('');
  const [twoFA, setTwoFA] = useState(false);
  const [twoFASetup, setTwoFASetup] = useState(false);
  const [twoFAQR, setTwoFAQR] = useState('');
  const [twoFASecret, setTwoFASecret] = useState('');
  const [twoFACode, setTwoFACode] = useState('');
  const [twoFALoading, setTwoFALoading] = useState(false);
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [twoFAError, setTwoFAError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [dangerLoading, setDangerLoading] = useState({ export: false, reset: false, delete: false });
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanged, setHasChanged] = useState(false);
  const [accountLoading, setAccountLoading] = useState(true);
  const [youtubeChannelId, setYoutubeChannelId] = useState('');
  const [youtubeChannel, setYoutubeChannel] = useState<YoutubeChannel | null>(null);
  const [platformLoading, setPlatformLoading] = useState(false);
  const [youtubeError, setYoutubeError] = useState('');
  const { toast } = useToast();
  const { t } = useTranslation();
  const router = useRouter();
  const { setTheme: setThemeNext, theme: currentTheme } = useTheme();
  const dashboardData = useDashboardData();
  const user = dashboardData?.user;
  const profileName = user?.youtubeChannel?.title || user?.displayName || user?.name || 'Creator';
  const profileAvatar = user?.avatar || '/default-avatar.png';

  // Track changes for enabling Save button
  useEffect(() => {
    setHasChanged(true);
  }, [theme, fullName]);

  // Auto-fill name and email from user when available
  useEffect(() => {
    if (user) {
      setFullName(user.displayName || user.name || '');
      setEmail(user.email || '');
      setAccountLoading(false);
    }
  }, [user]);

  // Dummy devices list
  const [devices, setDevices] = useState<Device[]>([]);
  const [devicesLoading, setDevicesLoading] = useState(false);
  const [devicesError, setDevicesError] = useState('');
  const [securityChanged, setSecurityChanged] = useState(false);
  const [securitySaving, setSecuritySaving] = useState(false);

  // Sync YouTube channel state with dashboardData.user
  useEffect(() => {
    if (user?.youtubeChannelId && user?.youtubeChannel) {
      setYoutubeChannelId(user.youtubeChannelId);
      setYoutubeChannel({
        ...user.youtubeChannel,
        url: (user.youtubeChannel as any).url || ''
      });
    } else {
      setYoutubeChannelId('');
      setYoutubeChannel(null);
    }
  }, [user?.youtubeChannelId, user?.youtubeChannel]);

  // Sync 2FA enabled state with backend
  useEffect(() => {
    if (user && typeof user.twoFactorEnabled === 'boolean') {
      setTwoFAEnabled(user.twoFactorEnabled);
    }
  }, [user]);

  // Only reset 2FA setup form when the user changes
  useEffect(() => {
    setTwoFASetup(false);
    setTwoFACode('');
    setTwoFAQR('');
    setTwoFASecret('');
    setTwoFAError('');
  }, [user]);

  // Fetch devices on mount
  useEffect(() => {
    setDevicesLoading(true);
    fetch(`/api/settings/devices?email=${email}`)
      .then(res => res.json())
      .then(data => {
        setDevices(data.devices || []);
        setDevicesLoading(false);
      })
      .catch(() => {
        setDevicesError('Failed to load devices');
        setDevicesLoading(false);
      });
  }, [email]);

  // Track changes for enabling Security Save button
  useEffect(() => {
    setSecurityChanged(true);
  }, [phone, twoFA]);

  const [showDisconnectInfo, setShowDisconnectInfo] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const passwordInputRef = useRef(null);
  const [twoFASetupMode, setTwoFASetupMode] = useState<null | 'setup' | 'disable'>(null);

  return (
    <div className="min-h-screen w-full px-2 md:px-0">
      <div className="max-w-3xl mx-auto pt-8 pb-4">
        {/* Profile summary card */}
        <div className="flex items-center gap-4 bg-card/80 backdrop-blur border border-border shadow-xl rounded-2xl px-8 py-7 mb-10 animate-fade-in">
          <img src={profileAvatar} alt="Avatar" className="w-16 h-16 rounded-full border-2 border-primary/60 shadow-md" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-primary">{profileName}</span>
              {youtubeChannel && <span className="ml-2 px-2 py-0.5 text-xs rounded bg-green-700/30 text-green-400 font-semibold">YouTube Connected</span>}
            </div>
            <div className="text-muted-foreground text-sm">{email}</div>
          </div>
        </div>
        {/* 2-column grid for main settings cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* General Section */}
          <div className="bg-card/80 backdrop-blur border border-primary/30 shadow-xl rounded-2xl p-8 animate-slide-in-up relative overflow-hidden">
            <div className="absolute left-0 top-6 h-8 w-1 bg-primary rounded-r-full" />
            <h2 className="text-xl font-bold mb-6 pl-4 flex items-center gap-2">General</h2>
            <div className="flex flex-col gap-6">
              <div>
                <label className="block mb-1 font-medium">{t('Theme')}</label>
                <div className="flex gap-4">
                  <Button variant={theme === 'light' ? 'default' : 'outline'} onClick={() => { setTheme('light'); setThemeNext('light'); }}>{t('Light') || 'Light'}</Button>
                  <Button variant={theme === 'dark' ? 'default' : 'outline'} onClick={() => { setTheme('dark'); setThemeNext('dark'); }}>{t('Dark') || 'Dark'}</Button>
                  <Button variant={theme === 'system' ? 'default' : 'outline'} onClick={() => { setTheme('system'); setThemeNext('system'); }}>{t('System') || 'System'}</Button>
                </div>
              </div>
              <Button
                className="mt-4"
                disabled={!hasChanged || isSaving}
                onClick={async () => {
                  setIsSaving(true);
                  try {
                    const res = await fetch('/api/save-user', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        email,
                        name: fullName,
                        theme,
                      }),
                    });
                    const data = await res.json();
                    if (data.success) {
                      toast({ title: t('Profile updated') || 'Profile updated', description: t('Your settings have been saved.') || 'Your settings have been saved.' });
                      setHasChanged(false);
                    } else {
                      toast({ title: t('Error') || 'Error', description: data.error || t('Failed to update profile') || 'Failed to update profile', variant: 'destructive' });
                    }
                  } catch (err) {
                    toast({ title: t('Error') || 'Error', description: t('Failed to update profile') || 'Failed to update profile', variant: 'destructive' });
                  } finally {
                    setIsSaving(false);
                  }
                }}
              >
                {isSaving ? t('Saving...') || 'Saving...' : t('Save Changes')}
              </Button>
            </div>
          </div>
          {/* Account Section */}
          <div className="bg-card/80 backdrop-blur border border-border shadow-xl rounded-2xl p-8 animate-slide-in-up relative overflow-hidden">
            <div className="absolute left-0 top-6 h-8 w-1 bg-blue-500 rounded-r-full" />
            <h2 className="text-xl font-bold mb-6 pl-4 flex items-center gap-2">Account</h2>
            <div className="flex flex-col gap-6">
              <div>
                <label className="block mb-1 font-medium">{t('Legal Full Name')}</label>
                {accountLoading ? (
                  <div className="h-10 bg-muted rounded animate-pulse w-full" />
                ) : (
                  <Input value={fullName} readOnly className="opacity-70 cursor-not-allowed" />
                )}
              </div>
              <div>
                <label className="block mb-1 font-medium">{t('Email')}</label>
                {accountLoading ? (
                  <div className="h-10 bg-muted rounded animate-pulse w-full" />
                ) : (
                  <Input value={email} readOnly className="opacity-70 cursor-not-allowed" />
                )}
              </div>
              <div>
                <label className="block mb-1 font-medium">{t('Password')}</label>
                <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="mt-1">{t('Change Password')}</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Change Password</DialogTitle>
                      <DialogDescription>
                        Please remember your new password. Use a strong, alphanumeric password for your security.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={async e => {
                      e.preventDefault();
                      setPasswordLoading(true);
                      setPasswordError('');
                      setPasswordSuccess('');
                      try {
                        if (!newPassword || newPassword.length < 8 || !/[A-Za-z]/.test(newPassword) || !/\d/.test(newPassword)) {
                          setPasswordError('Password must be at least 8 characters and alphanumeric.');
                          setPasswordLoading(false);
                          return;
                        }
                        const hashed = await bcrypt.hash(newPassword, 10);
                        const res = await fetch('/api/save-user', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ email, password: hashed }),
                        });
                        const data = await res.json();
                        if (data.success) {
                          setPasswordSuccess('Password updated successfully. Please use your new password next time you log in.');
                          setNewPassword('');
                        } else {
                          setPasswordError(data.error || 'Failed to update password.');
                        }
                      } catch (err) {
                        setPasswordError('Failed to update password.');
                      } finally {
                        setPasswordLoading(false);
                      }
                    }}>
                      <Input
                        ref={passwordInputRef}
                        type="password"
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        minLength={8}
                        required
                        className="mb-2"
                      />
                      {passwordError && <div className="text-destructive text-sm mb-2">{passwordError}</div>}
                      {passwordSuccess && <div className="text-green-700 text-sm mb-2">{passwordSuccess}</div>}
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button type="button" variant="ghost" disabled={passwordLoading}>Cancel</Button>
                        </DialogClose>
                        <Button type="submit" disabled={passwordLoading}>
                          {passwordLoading ? 'Saving...' : 'Save Password'}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
          {/* Security Section */}
          <div className="bg-card/80 backdrop-blur border border-border shadow-xl rounded-2xl p-8 animate-slide-in-up relative overflow-hidden">
            <div className="absolute left-0 top-6 h-8 w-1 bg-yellow-500 rounded-r-full" />
            <h2 className="text-xl font-bold mb-6 pl-4 flex items-center gap-2">Security</h2>
            <div className="flex flex-col gap-6">
              <div>
                <label className="block mb-1 font-medium">Phone Number</label>
                <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Add or update phone number" />
              </div>
              <div>
                <span className="font-medium">Two-Factor Authentication</span>
                {twoFAEnabled ? (
                  <div className="mt-2">
                    <div className="text-green-600 font-medium mb-2">2FA is enabled</div>
                    <Button
                      variant="outline"
                      className="mb-2"
                      onClick={() => {
                        setTwoFASetupMode('disable');
                        setTwoFACode('');
                        setTwoFAError('');
                      }}
                      disabled={twoFALoading}
                    >
                      Disable 2FA
                    </Button>
                    {twoFASetupMode === 'disable' && (
                      <form
                        key="disable"
                        className="flex flex-col gap-2 mt-2"
                        onSubmit={async e => {
                          e.preventDefault();
                          setTwoFALoading(true);
                          setTwoFAError('');
                          try {
                            const res = await fetch('/api/settings/2fa/disable', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ email, code: twoFACode }),
                            });
                            const data = await res.json();
                            if (data.success) {
                              setTwoFAEnabled(false);
                              setTwoFASetupMode(null);
                              setTwoFACode('');
                              toast({ title: '2FA Disabled', description: 'Two-factor authentication has been disabled.' });
                            } else {
                              setTwoFAError(data.error || 'Invalid code');
                            }
                          } catch {
                            setTwoFAError('Failed to disable 2FA');
                          } finally {
                            setTwoFALoading(false);
                          }
                        }}
                      >
                        <Input
                          value={twoFACode}
                          onChange={e => setTwoFACode(e.target.value)}
                          placeholder="Enter 6-digit code"
                          maxLength={6}
                          className="w-40"
                          required
                        />
                        <div className="flex gap-2">
                          <Button type="submit" disabled={twoFALoading} variant="destructive">
                            {twoFALoading ? 'Disabling...' : 'Confirm Disable'}
                          </Button>
                          <Button type="button" variant="ghost" onClick={() => setTwoFASetupMode(null)} disabled={twoFALoading}>Cancel</Button>
                        </div>
                        {twoFAError && <div className="text-destructive text-sm">{twoFAError}</div>}
                      </form>
                    )}
                  </div>
                ) : (
                  <div className="mt-2">
                    <Button
                      variant="outline"
                      onClick={async () => {
                        setTwoFALoading(true);
                        setTwoFAError('');
                        try {
                          const res = await fetch('/api/settings/2fa/setup', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email }),
                          });
                          const data = await res.json();
                          setTwoFAQR(data.qr);
                          setTwoFASecret(data.secret);
                          setTwoFASetupMode('setup');
                          setTwoFACode('');
                          setTwoFAError('');
                        } catch {
                          setTwoFAError('Failed to start 2FA setup');
                        } finally {
                          setTwoFALoading(false);
                        }
                      }}
                      disabled={twoFALoading}
                    >
                      Set up 2FA
                    </Button>
                    {twoFASetupMode === 'setup' && (
                      <form
                        key="setup"
                        className="flex flex-col gap-2 mt-2"
                        onSubmit={async e => {
                          e.preventDefault();
                          setTwoFALoading(true);
                          setTwoFAError('');
                          try {
                            const res = await fetch('/api/settings/2fa/verify', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ email, code: twoFACode }),
                            });
                            const data = await res.json();
                            if (data.success) {
                              setTwoFAEnabled(true);
                              setTwoFASetupMode(null);
                              setTwoFACode('');
                              toast({ title: '2FA Enabled', description: 'Two-factor authentication is now enabled.' });
                            } else {
                              setTwoFAError(data.error || 'Invalid code');
                            }
                          } catch {
                            setTwoFAError('Failed to enable 2FA');
                          } finally {
                            setTwoFALoading(false);
                          }
                        }}
                      >
                        {twoFAQR && (
                          <img src={twoFAQR} alt="2FA QR Code" className="w-40 h-40 mb-2 border rounded" />
                        )}
                        <Input
                          value={twoFACode}
                          onChange={e => setTwoFACode(e.target.value)}
                          placeholder="Enter 6-digit code"
                          maxLength={6}
                          className="w-40"
                          required
                        />
                        <div className="flex gap-2">
                          <Button type="submit" disabled={twoFALoading}>
                            {twoFALoading ? 'Enabling...' : 'Verify & Enable'}
                          </Button>
                          <Button type="button" variant="ghost" onClick={() => setTwoFASetupMode(null)} disabled={twoFALoading}>Cancel</Button>
                        </div>
                        {twoFAError && <div className="text-destructive text-sm">{twoFAError}</div>}
                      </form>
                    )}
                  </div>
                )}
              </div>
              <Button
                className="mt-4"
                disabled={!securityChanged || securitySaving}
                onClick={async () => {
                  setSecuritySaving(true);
                  try {
                    const res = await fetch('/api/settings/security', {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        email,
                        phone,
                        twoFactorEnabled: twoFA,
                      }),
                    });
                    const data = await res.json();
                    if (data.success) {
                      toast({ title: 'Security updated', description: 'Your security settings have been saved.' });
                      setSecurityChanged(false);
                    } else {
                      toast({ title: 'Error', description: data.error || 'Failed to update security settings', variant: 'destructive' });
                    }
                  } catch (err) {
                    toast({ title: 'Error', description: 'Failed to update security settings', variant: 'destructive' });
                  } finally {
                    setSecuritySaving(false);
                  }
                }}
              >
                {securitySaving ? 'Saving...' : 'Save Changes'}
              </Button>
              <div>
                <label className="block mb-1 font-medium">Logged-in Devices</label>
                {devicesLoading ? (
                  <div className="text-muted-foreground text-sm">Loading devices...</div>
                ) : devicesError ? (
                  <div className="text-destructive text-sm">{devicesError}</div>
                ) : (
                  <ul className="space-y-2">
                   {devices.length === 0 ? (
                     <li className="text-muted-foreground text-sm">No active devices found.</li>
                   ) : devices.map(device => (
                     <li key={device.id} className="flex flex-col md:flex-row md:items-center md:justify-between bg-muted rounded px-3 py-2">
                       <div>
                         <div className="font-medium">{device.device || 'Unknown Device'}</div>
                         <div className="text-xs text-muted-foreground break-all">{device.userAgent}</div>
                         <div className="text-xs text-muted-foreground">Last active: {device.lastActive ? new Date(device.lastActive).toLocaleString() : 'Unknown'}</div>
                       </div>
                       <Button
                         size="sm"
                         variant="outline"
                         className="mt-2 md:mt-0"
                         onClick={async () => {
                           const res = await fetch('/api/settings/devices', {
                             method: 'DELETE',
                             headers: { 'Content-Type': 'application/json' },
                             body: JSON.stringify({ email, sessionId: device.id }),
                           });
                           const data = await res.json();
                           if (data.success) {
                             setDevices(devices.filter(d => d.id !== device.id));
                             toast({ title: 'Device revoked', description: `Device has been revoked.` });
                           } else {
                             toast({ title: 'Error', description: data.error || 'Failed to revoke device', variant: 'destructive' });
                           }
                         }}
                       >
                         Revoke
                       </Button>
                     </li>
                   ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
          {/* Platforms Section */}
          <div className="bg-card/80 backdrop-blur border border-border shadow-xl rounded-2xl p-8 animate-slide-in-up relative overflow-hidden">
            <div className="absolute left-0 top-6 h-8 w-1 bg-red-500 rounded-r-full" />
            <h2 className="text-xl font-bold mb-6 pl-4 flex items-center gap-2">Platforms</h2>
            <div className="flex flex-col gap-6">
              <div>
                <label className="block mb-1 font-medium">YouTube</label>
                {youtubeChannelId && youtubeChannel ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <img src={youtubeChannel.thumbnail} alt="Channel" className="w-10 h-10 rounded-full border" />
                      <div>
                        <div className="font-medium">{youtubeChannel.title}</div>
                        <a href={youtubeChannel.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-xs underline">{youtubeChannel.url}</a>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      disabled={platformLoading}
                      onClick={() => setShowDisconnectInfo(true)}
                    >
                      Disconnect
                    </Button>
                    {showDisconnectInfo && (
                      <div className="mt-2 p-3 bg-blue-50 border border-blue-300 rounded max-w-xl w-full flex items-start gap-3 animate-fade-in">
                        <Info className="w-6 h-6 text-blue-500 mt-1 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="font-semibold text-blue-800 mb-1">Channel disconnection is restricted</div>
                          <div className="text-blue-700 text-sm mb-2" style={{whiteSpace: 'normal'}}>
                            For your security, direct channel disconnection is disabled to prevent unauthorized or accidental removal of your YouTube channel. <br />
                            If you wish to disconnect, please submit a request to the admin via the Feedback section.
                          </div>
                          <div className="flex justify-end">
                            <Button size="sm" variant="outline" onClick={() => setShowDisconnectInfo(false)}>OK</Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <form
                    className="flex flex-col gap-2 md:flex-row md:items-center"
                    onSubmit={async e => {
                      e.preventDefault();
                      setPlatformLoading(true);
                      setYoutubeError('');
                      try {
                        // 1. Verify channel
                        const verifyRes = await fetch('/api/youtube/verify-channel', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ channelId: youtubeChannelId }),
                        });
                        const verifyData = await verifyRes.json();
                        console.log('YouTube verify response:', verifyData);
                        if (!verifyRes.ok) {
                          setYoutubeError(verifyData.error || 'Invalid channel ID');
                          setPlatformLoading(false);
                          return;
                        }
                        // 2. Save to user profile
                        const saveRes = await fetch('/api/save-user', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            email,
                            youtubeChannelId: verifyData.id,
                            youtubeChannel: {
                              id: verifyData.id,
                              title: verifyData.title,
                              thumbnail: verifyData.thumbnail,
                              url: verifyData.url,
                              subscriberCount: verifyData.subscriberCount,
                              viewCount: verifyData.viewCount,
                              mostViewedVideo: verifyData.mostViewedVideo,
                            },
                          }),
                        });
                        const saveData = await saveRes.json();
                        console.log('Save user response:', saveData);
                        if (saveData.success) {
                          setYoutubeChannelId(verifyData.id);
                          setYoutubeChannel({
                            id: verifyData.id,
                            title: verifyData.title,
                            thumbnail: verifyData.thumbnail,
                            url: verifyData.url,
                            subscriberCount: verifyData.subscriberCount,
                            viewCount: verifyData.viewCount,
                            mostViewedVideo: verifyData.mostViewedVideo,
                          });
                          if (typeof window !== 'undefined') {
                            const dashboardRefresh = (await import('@/app/dashboard/dashboard-context')).useDashboardRefresh;
                            if (dashboardRefresh) await dashboardRefresh();
                            window.location.reload();
                          }
                          toast({ title: 'Connected', description: 'YouTube channel connected.' });
                        } else {
                          setYoutubeError(saveData.error || 'Failed to connect');
                        }
                      } catch (err) {
                        console.error('YouTube connect error:', err);
                        setYoutubeError('Failed to connect');
                      } finally {
                        setPlatformLoading(false);
                      }
                    }}
                  >
                    <Input
                      value={youtubeChannelId}
                      onChange={e => setYoutubeChannelId(e.target.value)}
                      placeholder="Enter YouTube Channel ID"
                      className="w-64"
                      required
                      disabled={platformLoading}
                    />
                    <Button type="submit" disabled={platformLoading}>
                      {platformLoading ? 'Connecting...' : 'Connect'}
                    </Button>
                    {youtubeError && <div className="text-destructive text-sm mt-1">{youtubeError}</div>}
                  </form>
                )}
              </div>
            </div>
          </div>
          {/* Divider before Danger Zone */}
          <div className="col-span-2 my-2">
            <div className="border-t border-destructive/30 w-full" />
          </div>
          {/* Danger Zone Section - full width */}
          <div className="col-span-2 bg-card/80 backdrop-blur border border-destructive/60 shadow-xl rounded-2xl p-8 animate-slide-in-up relative overflow-hidden mt-2">
            <div className="absolute left-0 top-6 h-8 w-1 bg-destructive rounded-r-full" />
            <h2 className="text-xl font-bold mb-6 pl-4 flex items-center gap-2 text-destructive"><Trash2 className="w-5 h-5" /> Danger Zone</h2>
            <div className="flex flex-col gap-8">
              <Button
                variant="outline"
                className="border-destructive text-destructive hover:bg-destructive/10 flex items-center gap-2"
                disabled={dangerLoading.export}
                onClick={async () => {
                  setDangerLoading(l => ({ ...l, export: true }));
                  try {
                    const res = await fetch(`/api/settings/export?email=${email}`);
                    if (!res.ok) throw new Error('Failed to export data');
                    const blob = await res.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'my-data.json';
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    window.URL.revokeObjectURL(url);
                    toast({ title: 'Exported', description: 'Your data has been downloaded.' });
                  } catch {
                    toast({ title: 'Error', description: 'Failed to export data', variant: 'destructive' });
                  } finally {
                    setDangerLoading(l => ({ ...l, export: false }));
                  }
                }}
              >
                {dangerLoading.export ? 'Exporting...' : <><Download className="w-4 h-4" /> Export My Data</>}
              </Button>
              <Button
                variant="outline"
                className="border-destructive text-destructive hover:bg-destructive/10 flex items-center gap-2"
                disabled={dangerLoading.reset}
                onClick={async () => {
                  setDangerLoading(l => ({ ...l, reset: true }));
                  try {
                    const res = await fetch('/api/settings/reset-connections', { method: 'POST' });
                    const data = await res.json();
                    if (data.success) {
                      toast({ title: 'Connections reset', description: 'All connections have been reset.' });
                    } else {
                      toast({ title: 'Error', description: data.error || 'Failed to reset connections', variant: 'destructive' });
                    }
                  } catch {
                    toast({ title: 'Error', description: 'Failed to reset connections', variant: 'destructive' });
                  } finally {
                    setDangerLoading(l => ({ ...l, reset: false }));
                  }
                }}
              >
                {dangerLoading.reset ? 'Resetting...' : <><RefreshCcw className="w-4 h-4" /> Reset All Connections</>}
              </Button>
              <Button
                variant="destructive"
                className="flex items-center gap-2"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={dangerLoading.delete}
              >
                <Trash2 className="w-4 h-4" /> Delete My Account
              </Button>
              {showDeleteConfirm && (
                <div className="mt-4 p-4 bg-destructive/10 border border-destructive rounded-lg">
                  <p className="mb-2 text-destructive font-semibold">Are you sure you want to delete your account? This action cannot be undone.</p>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} disabled={dangerLoading.delete}>Cancel</Button>
                    <Button
                      variant="destructive"
                      disabled={dangerLoading.delete}
                      onClick={async () => {
                        setDangerLoading(l => ({ ...l, delete: true }));
                        try {
                          const res = await fetch('/api/settings/delete-account', {
                            method: 'DELETE',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email }),
                          });
                          const data = await res.json();
                          if (data.success) {
                            toast({ title: 'Account deleted', description: 'Your account has been deleted.' });
                            await signOut({ redirect: false });
                            router.push('/auth/login');
                          } else {
                            toast({ title: 'Error', description: data.error || 'Failed to delete account', variant: 'destructive' });
                          }
                        } catch {
                          toast({ title: 'Error', description: 'Failed to delete account', variant: 'destructive' });
                        } finally {
                          setDangerLoading(l => ({ ...l, delete: false }));
                        }
                      }}
                    >
                      {dangerLoading.delete ? 'Deleting...' : 'Yes, Delete Permanently'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
