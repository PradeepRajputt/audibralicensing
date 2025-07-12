import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      'Settings': 'Settings',
      'General': 'General',
      'Theme': 'Theme',
      'Language': 'Language',
      'Account': 'Account',
      'Legal Full Name': 'Legal Full Name',
      'Email': 'Email',
      'Password': 'Password',
      'Change Password': 'Change Password',
      'Security': 'Security',
      'Phone Number': 'Phone Number',
      'Two-Factor Authentication': 'Two-Factor Authentication',
      'Logged-in Devices': 'Logged-in Devices',
      'Revoke': 'Revoke',
      'Danger Zone': 'Danger Zone',
      'Export My Data': 'Export My Data',
      'Reset All Connections': 'Reset All Connections',
      'Delete My Account': 'Delete My Account',
      'Save Changes': 'Save Changes',
      'Cancel': 'Cancel',
      'Yes, Delete Permanently': 'Yes, Delete Permanently',
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // Always use English
    fallbackLng: 'en',
    interpolation: { escapeValue: false }
  });

export default i18n; 