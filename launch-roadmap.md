# 🚀 Koti Stores: Zero-Cost Launch Roadmap

Follow these steps to move your ecosystem from your Mac to the real world.

## 🏁 Step 1: Deploy the Admin Panel (Vercel)
**Cost: ₹0**
1. Go to [vercel.com](https://vercel.com) and login with your GitHub.
2. Click **"Add New"** -> **"Project"**.
3. Import your `koti-stores-ecosystem` repo.
4. Select the `koti-admin` folder.
5. Click **Deploy**.
   - *Your Admin Panel is now live at something like `koti-admin.vercel.app`!*

## 🏁 Step 2: Build the Mobile Apps (EAS)
**Cost: ₹0**
1. In your terminal, run:
   ```bash
   npm install -g eas-cli
   eas login
   ```
2. Navigate to your app folders and run:
   ```bash
   cd koti-stores && eas build -p android --profile preview
   cd koti-delivery && eas build -p android --profile preview
   ```
3. EAS will give you a link to download the `.apk` files. 
   - *Send these APKs to your first 10 customers and riders via WhatsApp to start testing!*

## 🏁 Step 3: Global Config Sync
1. Open your live **Admin Panel** on the web.
2. Go to **Settings**.
3. Ensure your **Firebase Config** is identical to what we used in development.
4. *Your apps and web panel are now talking to each other across the internet!*

## 🏁 Step 4: The Domain (Optional)
- **Truly Free**: Use the provided `vercel.app` or `expo.dev` links.
- **Professional**: Buy a `.com` for ~$12/year from Namecheap or Google Domains. 
- *Pro Tip: I recommend sticking with the free Vercel domain for the first 30 days of testing.*

## 🏁 Step 5: Start Selling
1. Create your first live product in the Admin Panel.
2. Create a "WELCOME100" coupon.
3. Have a friend place an order using the Store APK.
4. Watch the Rider app ping and the Admin Panel update in real-time.

**You are now a business owner.** 🍾🎉🏆
