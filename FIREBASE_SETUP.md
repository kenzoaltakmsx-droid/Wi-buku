# Panduan Konfigurasi Firebase - Hunter Wi-Buku ⚔️

Aplikasi Anda menggunakan Firebase Project eksternal dengan ID `chat-web-83cc5`. Untuk menyelesaikan error autentikasi dan sinkronisasi Firestore di lingkungan preview/development ini, Anda perlu melakukan beberapa konfigurasi sederhana di Firebase Console.

---

## 🔴 Masalah 1 & 2: `Missing or insufficient permissions`
**Penyebab:** Aturan keamanan (Security Rules) Firestore Anda memblokir penulisan dan pembacaan ke koleksi `users`.

### Solusi (Langkah-langkah di Firebase Console):
1. Buka [Firebase Console](https://console.firebase.google.com/).
2. Pilih proyek Anda: **chat-web-83cc5**.
3. Klik menu **Firestore Database** di sidebar kiri.
4. Buka tab **Rules** (Aturan) di bagian atas.
5. Ganti aturan keamanan yang ada dengan aturan di bawah ini:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Global safety net
    match /{document=**} {
      allow read, write: if false;
    }

    match /users/{userId} {
      // Izinkan semua pengguna yang masuk (authenticated) untuk membaca profil pengguna lain (untuk Leaderboard)
      allow read: if request.auth != null;

      // Hanya izinkan pemilik profil untuk menulis/membuat data mereka sendiri
      allow create: if request.auth != null && request.auth.uid == userId && request.resource.data.uid == userId;
      allow update, delete: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

6. Klik tombol **Publish** (Publikasikan) di kanan atas.

> **Catatan:** Aturan ini sangat aman karena hanya mengizinkan pengguna yang telah masuk (authenticated) untuk membaca dan menulis profil dan bookmark mereka sendiri.

---

## 🔴 Masalah 3: `auth/unauthorized-domain`
**Penyebab:** Google & GitHub sign-in menggunakan popup membutuhkan domain tempat aplikasi berjalan didaftarkan dalam daftar domain resmi (Authorized Domains) Firebase Authentication. 

> **💡 Penjelasan Penting tentang Domain:**
> * Firebase Console **sangat mendukung** penambahan domain berakhiran `.run.app` (seperti domain development/preview Anda).
> * Pastikan Anda **hanya memasukkan nama domain saja**, tanpa menyertakan `https://` atau tanda garis miring `/` di bagian akhir.
> * Domain `.com` bawaan dari Firebase (`chat-web-83cc5.firebaseapp.com`) sudah otomatis terdaftar secara default untuk perantara login, namun domain tempat Anda membuka web (yaitu domain `.run.app` di bawah) tetap wajib didaftarkan agar Firebase mengizinkan proses autentikasi dari halaman tersebut.

### Solusi (Langkah-langkah di Firebase Console):
1. Buka [Firebase Console](https://console.firebase.google.com/).
2. Pilih proyek Anda: **chat-web-83cc5**.
3. Klik menu **Authentication** di sidebar kiri.
4. Buka tab **Settings** (Pengaturan) di bagian atas.
5. Di panel sebelah kiri, pilih **Authorized domains** (Domain yang diizinkan).
6. Klik tombol **Add domain** (Tambahkan domain).
7. Copy-paste persis domain preview Anda di bawah ini (tanpa `https://`):
   * `ais-dev-ldlhi3ehuogpxqv42jugzv-74706606683.asia-southeast1.run.app`
   * `ais-pre-ldlhi3ehuogpxqv42jugzv-74706606683.asia-southeast1.run.app`
8. Klik **Add** (Tambahkan).

---

## 🟡 Masalah 0: `auth/email-already-in-use`
**Penyebab:** Anda mencoba melakukan registrasi baru dengan alamat email yang sudah pernah terdaftar di proyek Firebase ini.

### Solusi:
* Pada halaman Profil di aplikasi, gunakan tab **Masuk** (Login) bukan tab **Daftar** (Register).
* Masukkan email dan password Anda yang lama untuk menghubungkan profil ke cloud.
