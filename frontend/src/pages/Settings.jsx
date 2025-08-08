import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Button from '../components/Button';

const Settings = () => {
  const [prefs, setPrefs] = useState({ notifications: true, darkMode: false });

  const handleChange = e => setPrefs({ ...prefs, [e.target.name]: e.target.checked });

  const handleSave = e => {
    e.preventDefault();
    // TODO: Save preferences to backend
    alert('Preferences saved!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink via-loveRed to-maroon flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center px-4">
        <form onSubmit={handleSave} className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md mt-8 animate-fadeIn">
          <h2 className="text-2xl font-bold text-maroon mb-6 text-center">Settings</h2>
          <label className="flex items-center mb-4">
            <input type="checkbox" name="notifications" checked={prefs.notifications} onChange={handleChange} className="mr-2" />
            <span>Enable notifications</span>
          </label>
          <label className="flex items-center mb-6">
            <input type="checkbox" name="darkMode" checked={prefs.darkMode} onChange={handleChange} className="mr-2" />
            <span>Dark mode</span>
          </label>
          <Button type="submit" className="w-full">Save</Button>
        </form>
      </main>
    </div>
  );
};

export default Settings;