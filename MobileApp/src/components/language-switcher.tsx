import React from 'react';
import { Button, cn } from '../heroui-native';
import { useI18n } from '../contexts/i18n-context';
import { AppText } from '../components/app-text';

interface LanguageSwitcherProps {
  className?: string;
}

export const LanguageSwitcher = ({ className }: LanguageSwitcherProps) => {
  const { language, changeLanguage } = useI18n();

  const toggleLanguage = () => {
    const newLang = language === 'kh' ? 'en' : 'kh';
    changeLanguage(newLang);
  };

  return (
    <Button 
      variant="outline" 
      className={cn("px-3 py-1", className)}
      onPress={toggleLanguage}
    >
      <AppText className="text-foreground text-sm">
        {language === 'kh' ? 'ខ្មែរ' : 'EN'}
      </AppText>
    </Button>
  );
};

export default LanguageSwitcher;