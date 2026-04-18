// Vouchers are now fetched from Supabase

import { Product } from './types';

export const PRODUCTS: Product[] = [
  {
    "appName": "NETFLIX",
    "category": "Streaming",
    "variants": [
      { "type": "Sharing 2 User", "duration": "1 Day", "price": 8000 },
      { "type": "Sharing 2 User", "duration": "1 Week", "price": 17000 },
      { "type": "Sharing 1 User", "duration": "1 Day", "price": 10000 },
      { "type": "Sharing 1 User", "duration": "1 Week", "price": 20000 },
      { "type": "Private", "duration": "1 Month", "price": 150000, "note": "Include access PIN, profile, reset password, dan link." }
    ]
  },
  {
    "appName": "VIDIO",
    "category": "Streaming",
    "tags": ["TERLARIS"],
    "variants": [
      { "type": "Sharing 2 User (Mobile Only)", "duration": "1 Month", "price": 22000 },
      { "type": "Private Mobile (No Sharing)", "duration": "1 Month", "price": 31000 },
      { "type": "Sharing 2 User (All Device)", "duration": "1 Month", "price": 28000 },
      { "type": "Private (TV Only)", "duration": "1 Year", "price": 15000 }
    ]
  },
  {
    "appName": "PRIME VIDEO",
    "category": "Streaming",
    "variants": [
      { "type": "Sharing", "duration": "1 Month", "price": 10000 },
      { "type": "Private", "duration": "1 Month", "price": 20000 }
    ]
  },
  {
    "appName": "AMAZON PRIME",
    "category": "Streaming",
    "variants": [
      { "type": "Sharing", "duration": "1 Month", "price": 8000 },
      { "type": "Private", "duration": "1 Month", "price": 15000 }
    ]
  },
  {
    "appName": "WETV",
    "category": "Streaming",
    "variants": [
      { "type": "Sharing 6 User", "duration": "1 Month", "price": 12000 }
    ]
  },
  {
    "appName": "VIU PREMIUM (PRIVATE)",
    "category": "Streaming",
    "variants": [
      { "type": "Anti Limit", "duration": "1 Month", "price": 2000 },
      { "type": "Anti Limit", "duration": "3 Month", "price": 3000 },
      { "type": "Anti Limit", "duration": "6 Month", "price": 3500 },
      { "type": "Anti Limit", "duration": "1 Year", "price": 5000 }
    ]
  },
  {
    "appName": "iQIYI",
    "category": "Streaming",
    "variants": [
      { "type": "Sharing (Standard)", "duration": "1 Month", "price": 8000 },
      { "type": "Sharing (Premium)", "duration": "1 Month", "price": 10000 },
      { "type": "Sharing", "duration": "3 Month", "price": 13000 }
    ]
  },
  {
    "appName": "HBO MAX",
    "category": "Streaming",
    "variants": [
      { "type": "Sharing", "duration": "1 Month", "price": 10000 }
    ]
  },
  {
    "appName": "DRAMA BOX",
    "category": "Streaming",
    "variants": [
      { "type": "Standard", "duration": "1 Month", "price": 9000 }
    ]
  },
  {
    "appName": "MOVIE BOX",
    "category": "Streaming",
    "variants": [
      { "type": "Standard", "duration": "1 Month", "price": 10000 }
    ]
  },
  {
    "appName": "BStation",
    "category": "Streaming",
    "variants": [
      { "type": "Sharing", "duration": "1 Month", "price": 7500 },
      { "type": "Sharing", "duration": "1 Year", "price": 20000 }
    ]
  },
  {
    "appName": "LOKLOK",
    "category": "Streaming",
    "variants": [
      { "type": "Basic Sharing 3 User", "duration": "1 Month", "price": 22000 }
    ]
  },
  {
    "appName": "SPOTIFY STUDENT",
    "category": "Music",
    "variants": [
      { "type": "Standard", "duration": "1 Month", "price": 12000 },
      { "type": "Bergaransi", "duration": "1 Month", "price": 20000 },
      { "type": "Tanpa Garansi", "duration": "3 Month", "price": 32000 }
    ]
  },
  {
    "appName": "APPLE MUSIC",
    "category": "Music",
    "variants": [
      { "type": "Via imessage", "duration": "1 Month", "price": 13000 }
    ]
  },
  {
    "appName": "YOUTUBE",
    "category": "Streaming",
    "variants": [
      { "type": "Family Plan", "duration": "1 Month", "price": 6000 },
      { "type": "Individu Plan", "duration": "1 Month", "price": 10000 }
    ]
  },
  {
    "appName": "CANVA",
    "category": "Design",
    "variants": [
      { "type": "Member Premium (Invite Link)", "duration": "1 Month", "price": 5000 },
      { "type": "Member Premium (Invite Link)", "duration": "6 Month", "price": 12000 },
      { "type": "Head/Owner (Invite 100 Member)", "duration": "Lifetime/Account", "price": 10000 }
    ]
  },
  {
    "appName": "CAPCUT",
    "category": "Design",
    "variants": [
      { "type": "Pro (Anti BackFree)", "duration": "5 Month", "price": 42000 },
      { "type": "Pro (Anti BackFree)", "duration": "35 Day", "price": 15000 },
      { "type": "Pro (Anti BackFree)", "duration": "28 Day", "price": 10000 },
      { "type": "Pro (Anti BackFree)", "duration": "21 Day", "price": 8000 }
    ]
  },
  {
    "appName": "ALIGHT MOTION",
    "category": "Design",
    "variants": [
      { "type": "Private", "duration": "1 Year", "price": 5000 }
    ]
  },
  {
    "appName": "IBIS PAINT X",
    "category": "Design",
    "variants": [
      { "type": "Sharing", "duration": "12 Month", "price": 15000 }
    ]
  },
  {
    "appName": "MEITU",
    "category": "Design",
    "variants": [
      { "type": "Sharing", "duration": "1 Month", "price": 15000 }
    ]
  },
  {
    "appName": "WATTPAD",
    "category": "Other",
    "variants": [
      { "type": "Sharing", "duration": "12 Month", "price": 12000 }
    ]
  },
  {
    "appName": "FIZZO NOVEL",
    "category": "Other",
    "variants": [
      { "type": "Sharing", "duration": "1 Month", "price": 8000 }
    ]
  },
  {
    "appName": "CHATGPT+",
    "category": "Productivity",
    "tags": ["NEW ITEM!!"],
    "variants": [
      { "type": "Sharing Via Invite", "duration": "1 Month", "price": 14000 },
      { "type": "Private (Tanpa Garansi)", "duration": "1 Month", "price": 20000 },
      { "type": "Private (Full Garansi)", "duration": "1 Month", "price": 25000 },
      { "type": "Head (Tanpa Garansi)", "duration": "1 Month", "price": 18000 },
      { "type": "Head (Full Garansi)", "duration": "1 Month", "price": 23000 }
    ]
  },
  {
    "appName": "ZOOM PRO",
    "category": "Productivity",
    "tags": ["NEW ITEM!!"],
    "variants": [
      { "type": "Pro", "duration": "30 Day", "price": 12000 }
    ]
  },
  {
    "appName": "PICSART",
    "category": "Design",
    "tags": ["NEW ITEM!!"],
    "variants": [
      { "type": "Private", "duration": "1 Month", "price": 10000 }
    ]
  }
];

export const formatRupiah = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};