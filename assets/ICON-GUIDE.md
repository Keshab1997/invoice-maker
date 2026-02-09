# 📱 Icon Upload Guide

## এই ফোল্ডারে যে আইকনগুলো আপলোড করবেন:

### **Required Icons (অবশ্যই লাগবে):**

1. **icon-192.png** - 192x192px (Android small icon)
2. **icon-512.png** - 512x512px (Android large icon, PWA)
3. **apple-touch-icon.png** - 180x180px (iOS home screen)
4. **favicon.ico** - 32x32px (Browser tab icon)

### **Optional Icons (ভালো হলে দিবেন):**

5. **icon-72.png** - 72x72px
6. **icon-96.png** - 96x96px
7. **icon-128.png** - 128x128px
8. **icon-144.png** - 144x144px
9. **icon-152.png** - 152x152px
10. **icon-384.png** - 384x384px

---

## 🎨 AI Prompt for Icon Generation:

```
Create a professional mobile app icon for "Invoice Maker" cash management app.

Requirements:
- Size: 512x512px, square format
- Background: Purple to blue gradient (#667eea to #764ba2)
- Icon: Golden money bag or invoice document in center
- Style: Modern, flat design, minimalist
- No text on icon
- Professional business look
- Should look good when scaled down to 48px

Design: Clean, premium, trustworthy, financial app aesthetic
```

---

## 📝 Icon তৈরির স্টেপ:

### **Step 1: AI দিয়ে 512x512 আইকন বানান**
- DALL-E, Midjourney, Leonardo.ai, বা Canva AI ব্যবহার করুন
- উপরের প্রম্পট দিন

### **Step 2: Resize করুন**
- Online tool: https://www.iloveimg.com/resize-image
- অথবা: https://imageresizer.com/
- সব সাইজের আইকন বানান (192px, 180px, 32px etc.)

### **Step 3: Favicon তৈরি**
- Website: https://favicon.io/
- 32x32 PNG আপলোড করে .ico ফাইল ডাউনলোড করুন

### **Step 4: এই ফোল্ডারে আপলোড করুন**
- সব আইকন `/assets/` ফোল্ডারে রাখুন
- ঠিক নাম দিন (icon-192.png, icon-512.png etc.)

---

## ✅ আপলোড করার পর:
আমাকে বলবেন, আমি `manifest.json` এবং `index.html` আপডেট করে দেব।

---

## 🎯 Quick Icon Names Checklist:

```
/assets/
  ├── icon-72.png       (72x72)
  ├── icon-96.png       (96x96)
  ├── icon-128.png      (128x128)
  ├── icon-144.png      (144x144)
  ├── icon-152.png      (152x152)
  ├── icon-192.png      (192x192) ✅ REQUIRED
  ├── icon-384.png      (384x384)
  ├── icon-512.png      (512x512) ✅ REQUIRED
  ├── apple-touch-icon.png (180x180) ✅ REQUIRED
  └── favicon.ico       (32x32)   ✅ REQUIRED
```

---

**Note:** শুধু 4টা required আইকন দিলেই চলবে। বাকিগুলো optional।
