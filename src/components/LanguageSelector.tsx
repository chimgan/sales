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

  const handleLanguageChange = (lang: 'ru' | 'en') => {
    setLanguage(lang);
    handleClose();
  };

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        sx={{ ml: 1 }}
        title="Change Language / Изменить язык"
      >
        <LanguageIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem
          onClick={() => handleLanguageChange('ru')}
          selected={language === 'ru'}
        >
          <ListItemText>Русский</ListItemText>
          {language === 'ru' && ' ✓'}
        </MenuItem>
        <MenuItem
          onClick={() => handleLanguageChange('en')}
          selected={language === 'en'}
        >
          <ListItemText>English</ListItemText>
          {language === 'en' && ' ✓'}
        </MenuItem>
      </Menu>
    </>
  );
};

export default LanguageSelector;
