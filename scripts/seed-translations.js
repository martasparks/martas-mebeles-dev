const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function seedTranslations() {
  console.log('🌱 Sākam tulkojumu sēšanu...');

  const locales = ['lv', 'en', 'ru'];
  
  for (const locale of locales) {
    try {
      const messagesPath = path.join(__dirname, '..', 'messages', `${locale}.json`);
      const messages = JSON.parse(fs.readFileSync(messagesPath, 'utf8'));
      
      console.log(`📥 Ielādējam tulkojumus priekš ${locale.toUpperCase()}...`);
      
      await processMessages(messages, '', locale);
      
      console.log(`✅ ${locale.toUpperCase()} tulkojumi veiksmīgi pievienoti`);
    } catch (error) {
      console.error(`❌ Kļūda ielādējot ${locale} tulkojumus:`, error);
    }
  }

  console.log('🎉 Tulkojumu sēšana pabeigta!');
  await prisma.$disconnect();
}

async function processMessages(obj, prefix, locale) {
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'object' && value !== null) {
      // Recursive for nested objects
      await processMessages(value, fullKey, locale);
    } else if (typeof value === 'string') {
      // Insert translation
      await prisma.translation.upsert({
        where: {
          key_locale: {
            key: fullKey,
            locale: locale
          }
        },
        update: {
          value: value,
          updatedAt: new Date()
        },
        create: {
          key: fullKey,
          locale: locale,
          value: value
        }
      });
    }
  }
}

seedTranslations()
  .catch((error) => {
    console.error('❌ Seed script neizdevās:', error);
    process.exit(1);
  });