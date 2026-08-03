-- Script pour mettre à jour les informations de contact dans la base de données
UPDATE public.contact_info
SET 
  address = '47 Rue Rémy-DUMONCEL 75014 PARIS',
  hours_fr = 'Lundi au vendredi de 9 heures- 20 heures',
  hours_en = 'Monday to Friday, 9:00 AM - 8:00 PM',
  email = 'manuela.diabate@mdi-avocats.com',
  phone = '06 59 76 42 51',
  whatsapp_number = '06 59 76 42 51';
