import { Container, Typography, Box, Paper, Divider } from '@mui/material';
import { useLanguage } from '../contexts/LanguageContext';

const TermsOfService = () => {
  const { language } = useLanguage();

  const termsContent = {
    tr: {
      title: 'Kullanım Koşulları',
      lastUpdated: 'Son Güncelleme: 13 Kasım 2024',
      sections: [
        {
          title: '1. Kabul ve Anlaşma',
          content: 'Bu platformu kullanarak, aşağıdaki kullanım koşullarını kabul etmiş olursunuz. Bu koşulları kabul etmiyorsanız, lütfen platformu kullanmayın.',
        },
        {
          title: '2. İlan Yayınlama Kuralları',
          content: 'Kullanıcılar yalnızca yasal olarak sahip oldukları, Türkiye Cumhuriyeti yasalarına uygun mal ve hizmetler için ilan yayınlayabilirler. Aşağıdaki içerikler kesinlikle yasaktır:\n\n' +
            '• Yasadışı ürünler veya hizmetler\n' +
            '• Telif hakkı ihlali yapan içerikler\n' +
            '• Sahte, yanıltıcı veya dolandırıcılık amaçlı ilanlar\n' +
            '• Şiddet, nefret söylemi veya ayrımcılık içeren içerikler\n' +
            '• Uyuşturucu, silah veya diğer yasadışı malzemeler\n' +
            '• Çalıntı mal veya hizmetler',
        },
        {
          title: '3. Kullanıcı Sorumlulukları',
          content: 'Kullanıcılar aşağıdakilerden sorumludur:\n\n' +
            '• İlanların doğruluğu ve yasallığı\n' +
            '• Satılan ürünlerin mülkiyeti ve kalitesi\n' +
            '• Alıcılarla yapılan tüm anlaşmalar ve iletişim\n' +
            '• Vergi ve yasal yükümlülüklerin yerine getirilmesi\n' +
            '• Hesap güvenliği ve gizliliği',
        },
        {
          title: '4. Platform Sorumluluğu ve Feragatname',
          content: 'Platform yönetimi:\n\n' +
            '• Kullanıcılar arasındaki işlemlerde aracı değildir\n' +
            '• İlanların içeriğinden sorumlu değildir\n' +
            '• Kullanıcılar arasındaki anlaşmazlıklarda taraf değildir\n' +
            '• Ürün veya hizmet kalitesini garanti etmez\n' +
            '• Kullanıcı kayıplarından sorumlu tutulamaz\n\n' +
            'Platform, yalnızca kullanıcıların ilan yayınlaması için bir alan sağlar. Tüm işlemler kullanıcılar arasında gerçekleşir ve platform bu işlemlerden sorumlu tutulamaz.',
        },
        {
          title: '5. İhlal ve Yaptırımlar',
          content: 'Bu koşulları ihlal eden kullanıcılar:\n\n' +
            '• Hesapları askıya alınabilir veya silinebilir\n' +
            '• İlanları kaldırılabilir\n' +
            '• Yasal işlem başlatılabilir\n' +
            '• Platform kullanım hakkı kalıcı olarak iptal edilebilir',
        },
        {
          title: '6. Değişiklikler',
          content: 'Platform yönetimi, bu koşulları önceden haber vermeksizin değiştirme hakkını saklı tutar. Değişiklikler yayınlandığı andan itibaren geçerlidir.',
        },
        {
          title: '7. İletişim',
          content: 'Sorularınız veya şikayetleriniz için lütfen platform yönetimiyle iletişime geçin.',
        },
        {
          title: '8. Uygulanacak Hukuk',
          content: 'Bu koşullar Türkiye Cumhuriyeti yasalarına tabidir. Uyuşmazlıklar Türk mahkemelerinde çözümlenecektir.',
        },
      ],
    },
    en: {
      title: 'Terms of Service',
      lastUpdated: 'Last Updated: November 13, 2024',
      sections: [
        {
          title: '1. Acceptance and Agreement',
          content: 'By using this platform, you agree to these terms of service. If you do not agree to these terms, please do not use the platform.',
        },
        {
          title: '2. Listing Rules',
          content: 'Users may only post listings for goods and services that they legally own and that comply with the laws of the Republic of Turkey. The following content is strictly prohibited:\n\n' +
            '• Illegal products or services\n' +
            '• Content that violates copyrights\n' +
            '• Fake, misleading, or fraudulent listings\n' +
            '• Content containing violence, hate speech, or discrimination\n' +
            '• Drugs, weapons, or other illegal materials\n' +
            '• Stolen goods or services',
        },
        {
          title: '3. User Responsibilities',
          content: 'Users are responsible for:\n\n' +
            '• The accuracy and legality of listings\n' +
            '• Ownership and quality of sold products\n' +
            '• All agreements and communications with buyers\n' +
            '• Fulfilling tax and legal obligations\n' +
            '• Account security and privacy',
        },
        {
          title: '4. Platform Liability and Disclaimer',
          content: 'The platform management:\n\n' +
            '• Is not an intermediary in transactions between users\n' +
            '• Is not responsible for the content of listings\n' +
            '• Is not a party to disputes between users\n' +
            '• Does not guarantee product or service quality\n' +
            '• Cannot be held responsible for user losses\n\n' +
            'The platform only provides a space for users to post listings. All transactions occur between users and the platform cannot be held responsible for these transactions.',
        },
        {
          title: '5. Violations and Sanctions',
          content: 'Users who violate these terms:\n\n' +
            '• May have their accounts suspended or deleted\n' +
            '• May have their listings removed\n' +
            '• May face legal action\n' +
            '• May have their platform usage rights permanently revoked',
        },
        {
          title: '6. Changes',
          content: 'The platform management reserves the right to change these terms without prior notice. Changes are effective from the moment of publication.',
        },
        {
          title: '7. Contact',
          content: 'For questions or complaints, please contact the platform management.',
        },
        {
          title: '8. Applicable Law',
          content: 'These terms are subject to the laws of the Republic of Turkey. Disputes will be resolved in Turkish courts.',
        },
      ],
    },
    ru: {
      title: 'Условия использования',
      lastUpdated: 'Последнее обновление: 13 ноября 2024 г.',
      sections: [
        {
          title: '1. Принятие и согласие',
          content: 'Используя эту платформу, вы соглашаетесь с настоящими условиями использования. Если вы не согласны с этими условиями, пожалуйста, не используйте платформу.',
        },
        {
          title: '2. Правила размещения объявлений',
          content: 'Пользователи могут размещать объявления только о товарах и услугах, которыми они законно владеют и которые соответствуют законам Турецкой Республики. Следующий контент строго запрещен:\n\n' +
            '• Нелегальные товары или услуги\n' +
            '• Контент, нарушающий авторские права\n' +
            '• Поддельные, вводящие в заблуждение или мошеннические объявления\n' +
            '• Контент, содержащий насилие, разжигание ненависти или дискриминацию\n' +
            '• Наркотики, оружие или другие незаконные материалы\n' +
            '• Украденные товары или услуги',
        },
        {
          title: '3. Обязанности пользователей',
          content: 'Пользователи несут ответственность за:\n\n' +
            '• Достоверность и законность объявлений\n' +
            '• Право собственности и качество продаваемых товаров\n' +
            '• Все соглашения и коммуникации с покупателями\n' +
            '• Выполнение налоговых и юридических обязательств\n' +
            '• Безопасность и конфиденциальность аккаунта',
        },
        {
          title: '4. Ответственность платформы и отказ от ответственности',
          content: 'Администрация платформы:\n\n' +
            '• Не является посредником в сделках между пользователями\n' +
            '• Не несет ответственности за содержание объявлений\n' +
            '• Не является стороной в спорах между пользователями\n' +
            '• Не гарантирует качество товаров или услуг\n' +
            '• Не может быть привлечена к ответственности за убытки пользователей\n\n' +
            'Платформа предоставляет только пространство для размещения объявлений пользователями. Все сделки происходят между пользователями, и платформа не может нести ответственность за эти сделки.',
        },
        {
          title: '5. Нарушения и санкции',
          content: 'Пользователи, нарушающие эти условия:\n\n' +
            '• Могут быть временно заблокированы или удалены\n' +
            '• Могут иметь удаленные объявления\n' +
            '• Могут столкнуться с юридическими действиями\n' +
            '• Могут быть навсегда лишены права использования платформы',
        },
        {
          title: '6. Изменения',
          content: 'Администрация платформы оставляет за собой право изменять эти условия без предварительного уведомления. Изменения вступают в силу с момента публикации.',
        },
        {
          title: '7. Контакты',
          content: 'По вопросам или жалобам, пожалуйста, свяжитесь с администрацией платформы.',
        },
        {
          title: '8. Применимое право',
          content: 'Настоящие условия регулируются законодательством Турецкой Республики. Споры будут разрешаться в турецких судах.',
        },
      ],
    },
  };

  const content = termsContent[language as keyof typeof termsContent] || termsContent.en;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          {content.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 4 }}>
          {content.lastUpdated}
        </Typography>
        
        <Divider sx={{ mb: 4 }} />

        {content.sections.map((section, index) => (
          <Box key={index} sx={{ mb: 4 }}>
            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
              {section.title}
            </Typography>
            <Typography 
              variant="body1" 
              paragraph 
              sx={{ whiteSpace: 'pre-line', lineHeight: 1.8, color: 'text.primary' }}
            >
              {section.content}
            </Typography>
          </Box>
        ))}

        <Divider sx={{ my: 4 }} />

        <Box sx={{ bgcolor: 'warning.light', p: 2, borderRadius: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {language === 'tr' && '⚠️ Önemli: Bu koşulları kabul ederek, yalnızca yasal mallarınız ve hizmetleriniz için ilan yayınlayacağınızı ve Türk yasalarına uyacağınızı taahhüt ediyorsunuz.'}
            {language === 'en' && '⚠️ Important: By accepting these terms, you commit to posting listings only for your legal goods and services and to comply with Turkish laws.'}
            {language === 'ru' && '⚠️ Важно: Принимая эти условия, вы обязуетесь размещать объявления только о ваших законных товарах и услугах и соблюдать турецкие законы.'}
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default TermsOfService;
