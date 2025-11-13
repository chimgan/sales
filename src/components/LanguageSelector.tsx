import { IconButton, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const LanguageSelector = () => {
  const { language, setLanguage } = useLanguage();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (lang: 'ru' | 'en' | 'tr') => {
    setLanguage(lang);
    handleClose();
  };

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        sx={{ ml: 1 }}
        title="Change Language / Изменить язык / Dili Değiştir"
      >
        <LanguageIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem
          onClick={() => handleLanguageChange('tr')}
          selected={language === 'tr'}
        >
          <ListItemText>🇹🇷 Türkçe</ListItemText>
          {language === 'tr' && ' ✓'}
        </MenuItem>
        <MenuItem
          onClick={() => handleLanguageChange('en')}
          selected={language === 'en'}
        >
          <ListItemText>🇬🇧 English</ListItemText>
          {language === 'en' && ' ✓'}
        </MenuItem>
        <MenuItem
          onClick={() => handleLanguageChange('ru')}
          selected={language === 'ru'}
        >
          <ListItemText>🇷🇺 Русский</ListItemText>
          {language === 'ru' && ' ✓'}
        </MenuItem>
      </Menu>
    </>
  );
};

export default LanguageSelector;
