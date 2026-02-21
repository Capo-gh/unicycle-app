import { useTranslation } from 'react-i18next';

export default function LanguageToggle({ className = '' }) {
    const { i18n } = useTranslation();
    const isEn = i18n.language === 'en';

    const toggle = () => {
        const next = isEn ? 'fr' : 'en';
        i18n.changeLanguage(next);
        localStorage.setItem('language', next);
    };

    return (
        <button
            onClick={toggle}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold border transition-colors hover:bg-gray-100 ${className}`}
            title={isEn ? 'Passer en français' : 'Switch to English'}
        >
            <span className={isEn ? 'text-gray-400' : 'text-unicycle-green font-extrabold'}>FR</span>
            <span className="text-gray-300">/</span>
            <span className={!isEn ? 'text-gray-400' : 'text-unicycle-green font-extrabold'}>EN</span>
        </button>
    );
}
