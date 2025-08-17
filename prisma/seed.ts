import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Translation data from JSON files
const translations = {
  // Header translations
  'Header.storeName': {
    lv: 'Martas Mēbeles',
    en: "Marta's Furniture", 
    ru: 'Мебель Марты'
  },
  'Header.products': {
    lv: 'Produkti',
    en: 'Products',
    ru: 'Товары'
  },
  'Header.categories': {
    lv: 'Kategorijas',
    en: 'Categories',
    ru: 'Категории'
  },
  'Header.about': {
    lv: 'Par mums',
    en: 'About',
    ru: 'О нас'
  },
  'Header.contact': {
    lv: 'Kontakti',
    en: 'Contact',
    ru: 'Контакты'
  },
  'Header.cart': {
    lv: 'Grozs',
    en: 'Cart',
    ru: 'Корзина'
  },
  'Header.account': {
    lv: 'Konts',
    en: 'Account',
    ru: 'Аккаунт'
  },
  'Header.login': {
    lv: 'Pierakstīties',
    en: 'Login',
    ru: 'Войти'
  },
  'Header.register': {
    lv: 'Reģistrēties',
    en: 'Register',
    ru: 'Регистрация'
  },
  'Header.profile': {
    lv: 'Profils',
    en: 'Profile',
    ru: 'Профиль'
  },
  'Header.orders': {
    lv: 'Pasūtījumi',
    en: 'Orders',
    ru: 'Заказы'
  },
  'Header.signOut': {
    lv: 'Izrakstīties',
    en: 'Sign Out',
    ru: 'Выйти'
  },

  // Footer translations
  'Footer.storeName': {
    lv: 'Martas Mēbeles',
    en: "Marta's Furniture",
    ru: 'Мебель Марты'
  },
  'Footer.description': {
    lv: 'Kvalitatīvas mēbeles jūsu mājām un birojam. Plašs sortiments par labākajām cenām.',
    en: 'Quality furniture for your home and office. Wide selection at the best prices.',
    ru: 'Качественная мебель для вашего дома и офиса. Широкий выбор по лучшим ценам.'
  },
  'Footer.quickLinks': {
    lv: 'Ātrās saites',
    en: 'Quick Links',
    ru: 'Быстрые ссылки'
  },
  'Footer.products': {
    lv: 'Produkti',
    en: 'Products',
    ru: 'Товары'
  },
  'Footer.categories': {
    lv: 'Kategorijas',
    en: 'Categories',
    ru: 'Категории'
  },
  'Footer.about': {
    lv: 'Par mums',
    en: 'About',
    ru: 'О нас'
  },
  'Footer.contact': {
    lv: 'Kontakti',
    en: 'Contact',
    ru: 'Контакты'
  },
  'Footer.customerService': {
    lv: 'Klientu serviss',
    en: 'Customer Service',
    ru: 'Служба поддержки'
  },
  'Footer.shipping': {
    lv: 'Piegāde',
    en: 'Shipping',
    ru: 'Доставка'
  },
  'Footer.returns': {
    lv: 'Atgriešana',
    en: 'Returns',
    ru: 'Возврат'
  },
  'Footer.warranty': {
    lv: 'Garantija',
    en: 'Warranty',
    ru: 'Гарантия'
  },
  'Footer.faq': {
    lv: 'BUJ',
    en: 'FAQ',
    ru: 'FAQ'
  },
  'Footer.phone': {
    lv: 'Tālrunis',
    en: 'Phone',
    ru: 'Телефон'
  },
  'Footer.email': {
    lv: 'E-pasts',
    en: 'Email',
    ru: 'E-Mail'
  },
  'Footer.address': {
    lv: 'Adrese',
    en: 'Address',
    ru: 'Адрес'
  },
  'Footer.allRightsReserved': {
    lv: 'Visas tiesības aizsargātas',
    en: 'All rights reserved',
    ru: 'Все права защищены'
  },

  // TopBar translations
  'TopBar.message': {
    lv: '🎉 BEZMAKSAS piegāde pasūtījumiem virs €50! Ātra piegāde visā Latvijā',
    en: '🎉 FREE shipping on orders over €50! Fast delivery across Latvia',
    ru: '🎉 БЕСПЛАТНАЯ доставка при заказе от €50! Быстрая доставка по всей Латвии'
  },

  // HomePage Hero translations
  'HomePage.Hero.title': {
    lv: 'Kvalitatīvas mēbeles jūsu mājām',
    en: 'Quality furniture for your home',
    ru: 'Качественная мебель для вашего дома'
  },
  'HomePage.Hero.subtitle': {
    lv: 'Atklājiet mūsu plašo mēbeļu sortimentu - no mūsdienīgām līdz klasiskām. Augsta kvalitāte un pievilcīgas cenas.',
    en: 'Discover our wide range of furniture - from modern to classic. High quality and attractive prices.',
    ru: 'Откройте для себя наш широкий ассортимент мебели - от современной до классической. Высокое качество и привлекательные цены.'
  },
  'HomePage.Hero.shopNow': {
    lv: 'Iepirkties tagad',
    en: 'Shop Now',
    ru: 'Купить сейчас'
  },
  'HomePage.Hero.browseCategories': {
    lv: 'Apskatīt kategorijas',
    en: 'Browse Categories',
    ru: 'Просмотреть категории'
  },

  // HomePage Categories translations
  'HomePage.Categories.title': {
    lv: 'Populārākās kategorijas',
    en: 'Popular Categories',
    ru: 'Популярные категории'
  },
  'HomePage.Categories.subtitle': {
    lv: 'Izvēlieties no mūsu plašā kategoriju klāsta',
    en: 'Choose from our wide range of categories',
    ru: 'Выберите из нашего широкого ассортимента категорий'
  },
  'HomePage.Categories.livingRoom': {
    lv: 'Viesistaba',
    en: 'Living Room',
    ru: 'Гостиная'
  },
  'HomePage.Categories.livingRoomDesc': {
    lv: 'Ērtas dīvāni, krēsli un galdiņi viesistabai',
    en: 'Comfortable sofas, chairs and tables for the living room',
    ru: 'Удобные диваны, кресла и столики для гостиной'
  },
  'HomePage.Categories.bedroom': {
    lv: 'Guļamistaba',
    en: 'Bedroom',
    ru: 'Спальня'
  },
  'HomePage.Categories.bedroomDesc': {
    lv: 'Gultas, skapji un nakts galdiņi',
    en: 'Beds, wardrobes and nightstands',
    ru: 'Кровати, шкафы и тумбочки'
  },
  'HomePage.Categories.kitchen': {
    lv: 'Virtuve',
    en: 'Kitchen',
    ru: 'Кухня'
  },
  'HomePage.Categories.kitchenDesc': {
    lv: 'Virtuves mēbeles un uzglabāšanas risinājumi',
    en: 'Kitchen furniture and storage solutions',
    ru: 'Кухонная мебель и решения для хранения'
  },
  'HomePage.Categories.office': {
    lv: 'Birojs',
    en: 'Office',
    ru: 'Офис'
  },
  'HomePage.Categories.officeDesc': {
    lv: 'Darba galdi un biroja krēsli',
    en: 'Desks and office chairs',
    ru: 'Письменные столы и офисные кресла'
  },
  'HomePage.Categories.viewCategory': {
    lv: 'Apskatīt kategoriju',
    en: 'View Category',
    ru: 'Посмотреть категорию'
  },

  // HomePage Products translations
  'HomePage.Products.title': {
    lv: 'Piedāvājuma produkti',
    en: 'Featured Products',
    ru: 'Рекомендуемые товары'
  },
  'HomePage.Products.subtitle': {
    lv: 'Apskatiet mūsu labākos produktus ar īpašām cenām',
    en: 'Check out our best products with special prices',
    ru: 'Посмотрите наши лучшие товары по специальным ценам'
  },
  'HomePage.Products.product1Name': {
    lv: 'Mūsdienīgs dīvāns',
    en: 'Modern Sofa',
    ru: 'Современный диван'
  },
  'HomePage.Products.product1Desc': {
    lv: 'Ērts un stilīgs dīvāns jūsu viesistabai',
    en: 'Comfortable and stylish sofa for your living room',
    ru: 'Удобный и стильный диван для вашей гостиной'
  },
  'HomePage.Products.product2Name': {
    lv: 'Koka galds',
    en: 'Wood Table',
    ru: 'Деревянный стол'
  },
  'HomePage.Products.product2Desc': {
    lv: 'Dabīga koka galds no kvalitatīviem materiāliem',
    en: 'Natural wood table made from quality materials',
    ru: 'Натуральный деревянный стол из качественных материалов'
  },
  'HomePage.Products.product3Name': {
    lv: 'Biroja krēsls',
    en: 'Office Chair',
    ru: 'Офисное кресло'
  },
  'HomePage.Products.product3Desc': {
    lv: 'Ergonomisks biroja krēsls ilgām darba stundām',
    en: 'Ergonomic office chair for long work hours',
    ru: 'Эргономичное офисное кресло для долгих рабочих часов'
  },
  'HomePage.Products.product4Name': {
    lv: 'Drēbju skapis',
    en: 'Wardrobe',
    ru: 'Шкаф для одежды'
  },
  'HomePage.Products.product4Desc': {
    lv: 'Plašs skapis ar daudz uzglabāšanas vietas',
    en: 'Spacious wardrobe with plenty of storage space',
    ru: 'Просторный шкаф с большим количеством места для хранения'
  },
  'HomePage.Products.sale': {
    lv: 'Atlaide',
    en: 'Sale',
    ru: 'Скидка'
  },
  'HomePage.Products.addToCart': {
    lv: 'Pievienot grozam',
    en: 'Add to Cart',
    ru: 'В корзину'
  },
  'HomePage.Products.viewAllProducts': {
    lv: 'Apskatīt visus produktus',
    en: 'View All Products',
    ru: 'Посмотреть все товары'
  },

  // Auth Login translations
  'Auth.login.title': {
    lv: 'Pierakstīties',
    en: 'Login',
    ru: 'Войти'
  },
  'Auth.login.subtitle': {
    lv: 'Ieejiet savā kontā',
    en: 'Sign in to your account',
    ru: 'Войдите в свой аккаунт'
  },
  'Auth.login.signupLink': {
    lv: 'reģistrējieties',
    en: 'sign up',
    ru: 'зарегистрируйтесь'
  },
  'Auth.login.email': {
    lv: 'E-pasta adrese',
    en: 'Email address',
    ru: 'Адрес электронной почты'
  },
  'Auth.login.password': {
    lv: 'Parole',
    en: 'Password',
    ru: 'Пароль'
  },
  'Auth.login.forgotPassword': {
    lv: 'Aizmirsi paroli?',
    en: 'Forgot password?',
    ru: 'Забыли пароль?'
  },
  'Auth.login.loading': {
    lv: 'Notiek pieteikšanās...',
    en: 'Signing in...',
    ru: 'Вход в систему...'
  },
  'Auth.login.submit': {
    lv: 'Pierakstīties',
    en: 'Sign In',
    ru: 'Войти'
  },

  // Auth Register translations
  'Auth.register.title': {
    lv: 'Reģistrēties',
    en: 'Register',
    ru: 'Регистрация'
  },
  'Auth.register.subtitle': {
    lv: 'Izveidojiet jaunu kontu',
    en: 'Create a new account',
    ru: 'Создать новый аккаунт'
  },
  'Auth.register.loginLink': {
    lv: 'pierakstieties',
    en: 'sign in',
    ru: 'войти'
  },
  'Auth.register.fullName': {
    lv: 'Pilns vārds',
    en: 'Full name',
    ru: 'Полное имя'
  },
  'Auth.register.email': {
    lv: 'E-pasta adrese',
    en: 'Email address',
    ru: 'Адрес электронной почты'
  },
  'Auth.register.password': {
    lv: 'Parole',
    en: 'Password',
    ru: 'Пароль'
  },
  'Auth.register.confirmPassword': {
    lv: 'Apstiprināt paroli',
    en: 'Confirm password',
    ru: 'Подтвердите пароль'
  },
  'Auth.register.passwordMismatch': {
    lv: 'Paroles nesakrīt',
    en: 'Passwords do not match',
    ru: 'Пароли не совпадают'
  },
  'Auth.register.passwordTooShort': {
    lv: 'Parolei jābūt vismaz 6 simbolus garai',
    en: 'Password must be at least 6 characters long',
    ru: 'Пароль должен содержать не менее 6 символов'
  },
  'Auth.register.loading': {
    lv: 'Notiek reģistrācija...',
    en: 'Creating account...',
    ru: 'Создание аккаунта...'
  },
  'Auth.register.submit': {
    lv: 'Reģistrēties',
    en: 'Register',
    ru: 'Зарегистрироваться'
  },
  'Auth.register.successTitle': {
    lv: 'Reģistrācija veiksmīga!',
    en: 'Registration successful!',
    ru: 'Регистрация успешна!'
  },
  'Auth.register.successMessage': {
    lv: 'Lūdzu, pārbaudiet savu e-pastu, lai apstiprinātu kontu.',
    en: 'Please check your email to confirm your account.',
    ru: 'Пожалуйста, проверьте свою электронную почту для подтверждения аккаунта.'
  },
  'Auth.register.backToLogin': {
    lv: 'Atgriezties pie pierakstīšanās',
    en: 'Back to login',
    ru: 'Вернуться к входу'
  },

  // Auth VerifyEmail translations
  'Auth.verifyEmail.title': {
    lv: 'Apstipriniet savu e-pastu',
    en: 'Verify your email',
    ru: 'Подтвердите электронную почту'
  },
  'Auth.verifyEmail.instruction': {
    lv: 'Lūdzu, pārbaudiet savu e-pasta kontu un noklikšķiniet uz apstiprinājuma saites.',
    en: 'Please check your email and click the confirmation link.',
    ru: 'Пожалуйста, проверьте свою электронную почту и нажмите на ссылку подтверждения.'
  },
  'Auth.verifyEmail.instructionWithEmail': {
    lv: 'Mēs nosūtījām apstiprinājuma saiti uz:',
    en: 'We sent a confirmation link to:',
    ru: 'Мы отправили ссылку подтверждения на:'
  },
  'Auth.verifyEmail.emailLabel': {
    lv: 'E-pasta adrese',
    en: 'Email address',
    ru: 'Адрес электронной почты'
  },
  'Auth.verifyEmail.emailPlaceholder': {
    lv: 'Ievadiet savu e-pasta adresi',
    en: 'Enter your email address',
    ru: 'Введите адрес электронной почты'
  },
  'Auth.verifyEmail.resendButton': {
    lv: 'Nosūtīt vēlreiz',
    en: 'Resend email',
    ru: 'Отправить повторно'
  },
  'Auth.verifyEmail.resending': {
    lv: 'Nosūta...',
    en: 'Sending...',
    ru: 'Отправка...'
  },
  'Auth.verifyEmail.alreadyVerified': {
    lv: 'Jau apstiprinājāt savu e-pastu?',
    en: 'Already verified your email?',
    ru: 'Уже подтвердили электронную почту?'
  },
  'Auth.verifyEmail.loginLink': {
    lv: 'Pierakstieties',
    en: 'Sign in',
    ru: 'Войти'
  },
  'Auth.verifyEmail.backToHome': {
    lv: 'Atgriezties uz sākumlapu',
    en: 'Back to home',
    ru: 'Вернуться на главную'
  },

  // Profile translations
  'Profile.title': {
    lv: 'Profils',
    en: 'Profile',
    ru: 'Профиль'
  },
  'Profile.customerProfileNotFound': {
    lv: 'Klienta profils nav atrasts',
    en: 'Customer Profile Not Found',
    ru: 'Профиль клиента не найден'
  },
  'Profile.profileNotCreated': {
    lv: 'Jūsu klienta profils vēl nav izveidots. Noklikšķiniet uz pogas augšā, lai to izveidotu.',
    en: 'Your customer profile hasn\'t been created yet. Click the button above to create it.',
    ru: 'Ваш профиль клиента еще не создан. Нажмите кнопку выше, чтобы создать его.'
  },
  'Profile.createProfile': {
    lv: 'Izveidot profilu',
    en: 'Create Profile',
    ru: 'Создать профиль'
  },
  'Profile.creating': {
    lv: 'Izveido...',
    en: 'Creating...',
    ru: 'Создание...'
  },
  'Profile.fullName': {
    lv: 'Pilns vārds',
    en: 'Full Name',
    ru: 'Полное имя'
  },
  'Profile.email': {
    lv: 'E-pasts',
    en: 'Email',
    ru: 'E-Mail'
  },
  'Profile.phone': {
    lv: 'Tālrunis',
    en: 'Phone',
    ru: 'Телефон'
  },
  'Profile.country': {
    lv: 'Valsts',
    en: 'Country',
    ru: 'Страна'
  },
  'Profile.city': {
    lv: 'Pilsēta',
    en: 'City',
    ru: 'Город'
  },
  'Profile.preferredLanguage': {
    lv: 'Vēlamā valoda',
    en: 'Preferred Language',
    ru: 'Предпочитаемый язык'
  },
  'Profile.accountCreated': {
    lv: 'Konts izveidots',
    en: 'Account Created',
    ru: 'Аккаунт создан'
  },
  'Profile.emailVerified': {
    lv: 'E-pasts apstiprināts',
    en: 'Email Verified',
    ru: 'E-Mail подтвержден'
  },
  'Profile.lastLogin': {
    lv: 'Pēdējā pieteikšanās',
    en: 'Last Login',
    ru: 'Последний вход'
  },
  'Profile.never': {
    lv: 'Nekad',
    en: 'Never',
    ru: 'Никогда'
  },
  'Profile.yes': {
    lv: 'Jā',
    en: 'Yes',
    ru: 'Да'
  },
  'Profile.no': {
    lv: 'Nē',
    en: 'No',
    ru: 'Нет'
  },
  'Profile.notProvided': {
    lv: 'Nav norādīts',
    en: 'Not provided',
    ru: 'Не указано'
  },
  'Profile.loading': {
    lv: 'Ielādē...',
    en: 'Loading...',
    ru: 'Загрузка...'
  },
  'Profile.supabaseAccount': {
    lv: 'Jūsu Supabase konts:',
    en: 'Your Supabase account:',
    ru: 'Ваш Supabase аккаунт:'
  }
};

async function main() {
  console.log('🌱 Starting translation seed...');

  // Clear existing translations
  await prisma.translation.deleteMany({});
  console.log('🧹 Cleared existing translations');

  // Insert all translations
  const translationRecords = [];
  
  for (const [key, translations_for_key] of Object.entries(translations)) {
    const namespace = key.split('.')[0]; // Extract namespace (e.g., 'Header' from 'Header.title')
    
    for (const [locale, value] of Object.entries(translations_for_key)) {
      translationRecords.push({
        key,
        locale,
        value,
        namespace
      });
    }
  }

  // Batch insert all translations
  await prisma.translation.createMany({
    data: translationRecords
  });

  console.log(`✅ Seeded ${translationRecords.length} translations`);
  console.log(`📊 Keys: ${Object.keys(translations).length}`);
  console.log(`🌍 Locales: lv, en, ru`);
  console.log(`📦 Namespaces: ${[...new Set(translationRecords.map(t => t.namespace))].join(', ')}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });