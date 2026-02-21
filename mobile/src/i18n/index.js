import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from '../../../../shared/i18n/en.json';
import fr from '../../../../shared/i18n/fr.json';

const initI18n = async () => {
    const savedLanguage = await AsyncStorage.getItem('language');
    i18n.use(initReactI18next).init({
        resources: {
            en: { translation: en },
            fr: { translation: fr },
        },
        lng: savedLanguage || 'en',
        fallbackLng: 'en',
        interpolation: { escapeValue: false },
    });
};

initI18n();

export default i18n;
