# Apple App Store & Google Play Store Deployment Guide

This platform is configured with **Capacitor**, the industry-standard native mobile framework used by leading enterprises to deploy React & Next.js applications directly to the **Apple App Store** and **Google Play Store**.

---

## 1. Apple App Store Deployment (iOS)

### Prerequisites
1. **Apple Developer Account** ([developer.apple.com](https://developer.apple.com) — $99/year).
2. **Mac Computer** with **Xcode** (free from Mac App Store) & CocoaPods (`sudo gem install cocoapods`).

---

### Step-by-Step iOS Build & Submission

#### Step 1: Generate the Native iOS Project
Run the following command in your terminal to create the native Xcode project:
```bash
npm run mobile:add:ios
```
*This generates an `ios/` folder containing the full native Swift/Xcode workspace.*

#### Step 2: Sync Web Assets
Whenever you make updates to the web app, sync them to iOS:
```bash
npm run mobile:sync
```

#### Step 3: Open in Xcode
Open the project directly in Xcode:
```bash
npm run mobile:ios
```
*(Or manually open `ios/App/App.xcworkspace` in Xcode).*

#### Step 4: Configure Apple Signing & Bundle ID
1. In the left navigator of Xcode, click on **App** (top-level project).
2. Under **Signing & Capabilities**:
   - Check **"Automatically manage signing"**.
   - Select your **Apple Developer Team**.
   - Verify Bundle Identifier: `com.srimanjunatha.billing`.

#### Step 5: Verify Camera & Biometric Permissions (`Info.plist`)
Apple requires permission strings in `Info.plist` (already configured in Capacitor):
```xml
<key>NSCameraUsageDescription</key>
<string>Sri Manjunatha Engineering Works requires camera access for employee face biometric attendance and barcode scanning.</string>
<key>NSFaceIDUsageDescription</key>
<string>Biometric authentication for operator attendance and fast sign-in.</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>Upload company logos, invoices, and item catalog photos.</string>
```

#### Step 6: Archive & Upload to App Store Connect / TestFlight
1. In Xcode, set the target device to **Any iOS Device (arm64)** (top toolbar).
2. Go to menu: **Product → Archive**.
3. Once the archive builds, Xcode Organizer opens automatically:
   - Click **Distribute App**.
   - Select **App Store Connect**.
   - Choose **Upload** and click **Next**.
4. In **App Store Connect** ([appstoreconnect.apple.com](https://appstoreconnect.apple.com)):
   - Your build will appear in the **TestFlight** tab within 10–15 minutes.
   - Fill in your app description, privacy policy, and pricing.
   - Click **Submit for Review**.

---

## 2. Google Play Store Deployment (Android)

### Prerequisites
1. **Google Play Console Account** ([play.google.com/console](https://play.google.com/console) — $25 one-time registration).
2. **Android Studio** (free for Windows/Mac/Linux).

---

### Step-by-Step Android Build & Submission

#### Step 1: Generate the Native Android Project
Run:
```bash
npm run mobile:add:android
```
*This creates the `android/` directory containing the native Gradle project.*

#### Step 2: Sync Web Assets
```bash
npm run mobile:sync
```

#### Step 3: Open in Android Studio
```bash
npm run mobile:android
```

#### Step 4: Generate Signed Release AAB (Android App Bundle)
1. In Android Studio, go to menu: **Build → Generate Signed Bundle / APK...**.
2. Select **Android App Bundle (.aab)** (required by Google Play).
3. Click **Create new...** to create a keystore file (e.g. `srimanjunatha-release.jks`), set passwords, and remember them safely.
4. Select destination folder and choose build variant: **release**.
5. Click **Finish**. Android Studio will generate the signed `.aab` file!

#### Step 5: Upload to Google Play Console
1. Log in to [Google Play Console](https://play.google.com/console).
2. Click **Create App** → Enter name: *Sri Manjunatha Engineering Works*.
3. Go to **Production** (or **Closed Testing**) → **Create new release**.
4. Drag and drop your generated `.aab` file.
5. Complete the Store Listing (screenshots, description, privacy policy URL) and click **Send for Review**!

---

## 3. Instant Shop-Floor Installation (PWA)

While your App Store review is pending, workers and managers on the shop floor can use the app **immediately** on any Android or iPhone without downloading from an app store:

1. Open the website on Chrome (Android) or Safari (iPhone).
2. On Android: Tap the 3 dots → **"Install App"** (or tap the bottom install banner).
3. On iPhone: Tap the Share button → **"Add to Home Screen"**.
4. The app installs as a native standalone app with its own app icon, splash screen, and full-screen layout without any browser address bar!
