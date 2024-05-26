# 3D Engine from Scratch

Aplikasi ini dibuat sebagai cara tim pengembang untuk mengenal lebih lanjut terkait penggunaan WebGL dan GLSL dalam pembuatan game 3D. Aplikasi ini dibuat menggunakan Next.js sebagai *frontend framework* dan WebGL murni tanpa menggunakan *library* lain apapun. Aplikasi ini menyimulasikan *3D engine* yang dapat menampilkan objek 3D melalui kamera beserta efek tesktur dan cahaya.

## Cara Menjalanakan Aplikasi
1. Clone repository ini dengan menjalankan perintah `git clone https://github.com/GAIB20/tugas-besar-grafkom-2-sabeb`
2. Masuk ke direktori hasil clone repository dengan menjalankan perintah `cd tugas-besar-grafkom-2-sabeb`
3. Install *dependencies* yang dibutuhkan dengan menjalankan perintah `npm install`
4. Jalankan aplikasi dengan menjalankan perintah `npm run dev`
5. Buka browser dan akses `http://localhost:3000`

## Panduan Penggunaan Aplikasi
Halaman utama aplikasi terdiri atas beberapa *section*:
![](/screenshots/ss1.png)

1. *Header section* yang berada di bagian atas halaman, memiliki tombol *load* dan *save* file dengan ekstensi .gltf. Kedua tombol ini digunakan untuk melakukan *load* scene 3D yang pernah dibuat atau menyimpan scene 3D yang sedang ditampilkan.

2. *Left-sidebar* yang berada di bagian kiri halaman, memiliki *animation controller* dan *component tree*. *Animation controller* digunakan untuk mengatur animasi yang ada pada objek 3D yang sedang ditampilkan. *Component tree* digunakan untuk melihat struktur *tree* dari objek 3D yang sedang ditampilkan beserta objek-objek lain yang ada di dalam *scene* (termasuk kamera dan cahaya).

3. *Right-sidebar* yang berada di bagian kanan halaman, memiliki berbagai kontrol untuk transformasi objek; properti kamera utama dan kamera sekunder; pilihan shader; serta properti cahaya, material, dan tekstur.

Pengguna dapat menekan tombol *load* dan memilih salah satu model yang ada di dalam folder `test`. Dalam panduan ini, digunakan CubeModel.gltf. Setelah model berhasil dimuat, model akan muncul pada kedua canvas.

Secara *default*, objek utama yang ditampilkan akan dijadikan objek yang sedang dipilih. Transformasi objek yang sedang dipilih dapat diubah melalui *right-sidebar*. Pengguna dapat memilih objek lain dengan menekan nama objek yang ada di *component tree*. Pengguna juga dapat meng-*expand* struktur objek dengan menekan tombol panah di sebelah kiri nama objek pada *component tree* tersebut.

Kamera pada kedua canvas secara *default* mengarah ke objek yang sedang dipilih. Namun, ketika dilakukan translasi pada objek yang sedang dipilih, kamera tidak mengikuti objek tersebut. Pengguna dapat membuat kamera untuk kembali focus pada objek yang sedang dipilih dengan menekan kembali objek tersebut pada *component tree*.


## Pembagian Tugas
|NIM|Nama|Tugas|Model *Articulated* dan Animasinya|Model *Hollow* dan Animasinya
|-|-|-|-|-|
|13521108|Michael Leon Putra Widhi|[tambahin sendiri]|LeonModel|HollowLeonModel|
|13521117|Maggie Zeta Rosida S|*No contribution*|MaggieModel|*No Contribution*|
|13521144|Bintang Dwi Marthen|[tambahin sendiri]|MarthenModel|HollowMarthenModel|
|13521148|Johanes Lee|*GLTF data classes; math classes (matrix, vector, quaternion); mesh; model framework; file export and import; GL utilities; rendering; orthographic and oblique camera; displacement texture; UI integration*|JojoModel|HollowJojoModel|
