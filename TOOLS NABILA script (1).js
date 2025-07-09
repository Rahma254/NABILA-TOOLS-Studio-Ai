'use strict';

// Tunggu hingga seluruh halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
    
    // =================================================================
    // ELEMEN DOM
    // =================================================================
    // Bagian ini mengambil semua elemen HTML yang kita perlukan
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const fileInfo = document.getElementById('file-info');
    const processBtn = document.getElementById('process-btn');
    const yearSpan = document.getElementById('year');

    const uploadSection = document.getElementById('upload-section');
    const processingSection = document.getElementById('processing-section');
    const resultsSection = document.getElementById('results-section');

    // Elemen Langkah Proses
    const stepClean = document.getElementById('step-clean');
    const stepTranscribe = document.getElementById('step-transcribe');
    const stepGenerate = document.getElementById('step-generate');
    const stepVoiceover = document.getElementById('step-voiceover');

    // Elemen Output Hasil
    const transcriptOutput = document.getElementById('transcript-output');
    const igCaptionOutput = document.getElementById('ig-caption-output');
    const ytTitleOutput = document.getElementById('yt-title-output');
    const narrativeOutput = document.getElementById('narrative-output');
    const poemOutput = document.getElementById('poem-output');
    const premiumVoiceoverOutput = document.getElementById('premium-voiceover-output');

    // Variabel untuk menyimpan state file
    let selectedFile = null;

    // =================================================================
    // KONFIGURASI & DATA DUMMY
    // =================================================================
    
    // Ganti URL ini dengan endpoint API asli Anda
    const API_ENDPOINTS = {
        CLEANVOICE: 'https://api.cleanvoice.ai/v1/dummy-clean', // Dummy
        ASSEMBLYAI: 'https://api.assemblyai.com/v2/dummy-transcribe', // Dummy
        OPENROUTER: 'https://openrouter.ai/api/v1/dummy-chat/completions', // Dummy
        PLAY_HT: 'https://api.play.ht/v1/dummy-voiceover' // Dummy
    };

    // Contoh hasil AI untuk ditampilkan (placeholder)
    const DUMMY_AI_RESULTS = {
        transcript: "Halo semuanya, selamat datang di channel Nabila Studio. Hari ini, kita akan membahas sebuah topik yang sangat menarik, yaitu bagaimana AI bisa mengubah cara kita membuat konten. Teknologi ini bukan lagi masa depan, tapi sudah menjadi bagian dari masa kini, membuka pintu kreativitas yang belum pernah ada sebelumnya.",
        igCaption: "Revolusi konten ada di sini! 🤖✨ AI bukan lagi sekadar alat, tapi partner kreatif kita. Dari audio biasa jadi insight luar biasa. Siap untuk level up?\n\n#AI #KontenKreator #NabilaStudio #Teknologi #MasaDepan",
        ytTitle: "STOP Bikin Konten Manual! AI Ini Bisa Ubah Suara Jadi Teks, Caption & Narasi Viral!",
        narrative: "Di sebuah dunia di mana setiap suara memiliki cerita, seorang kreator menemukan sebuah kunci. Kunci itu bukanlah sebuah benda, melainkan sebuah gema kecerdasan buatan. Dengan satu klik, bisikan yang hilang diubah menjadi skrip yang megah, mengubah rekaman sederhana menjadi sebuah mahakarya sinematik. Perjalanan baru saja dimulai.",
        poem: "Dalam sunyi gema terekam,\nSebuah suara, redup terpendam.\nLalu AI datang, sentuh dengan cahaya,\nKata demi kata, terungkap maknanya.\nDari bisu menjadi syair,\nEkspresi jiwa, kini mengalir."
    };


    // =================================================================
    // FUNGSI UTAMA & LOGIKA APLIKASI
    // =================================================================

    // Inisialisasi awal
    const init = () => {
        setupEventListeners();
        yearSpan.textContent = new Date().getFullYear();
    };

    // Kumpulan semua event listener
    const setupEventListeners = () => {
        dropZone.addEventListener('click', () => fileInput.click());
        dropZone.addEventListener('dragover', handleDragOver);
        dropZone.addEventListener('dragleave', handleDragLeave);
        dropZone.addEventListener('drop', handleDrop);
        fileInput.addEventListener('change', handleFileSelect);
        processBtn.addEventListener('click', startProcessingWorkflow);
        
        // Event listener untuk tombol aksi di hasil (copy, download, dll)
        // Menggunakan event delegation agar lebih efisien
        resultsSection.addEventListener('click', handleResultActions);
    };

    // Fungsi untuk memulai seluruh alur kerja pemrosesan
    const startProcessingWorkflow = async () => {
        if (!selectedFile) {
            alert("Silakan pilih file audio terlebih dahulu.");
            return;
        }

        // 1. Reset UI dan tampilkan progress
        resetUI();
        processBtn.disabled = true;
        processBtn.textContent = "Sedang Memproses...";
        uploadSection.classList.add('opacity-50');
        processingSection.classList.remove('hidden');

        try {
            // 2. Simulasi langkah-langkah API
            updateStepUI('clean', 'processing');
            await simulateApiCall(1500); // 1.5 detik untuk Cleanvoice.ai
            updateStepUI('clean', 'completed');

            updateStepUI('transcribe', 'processing');
            const transcript = await simulateApiCall(2000, DUMMY_AI_RESULTS.transcript); // 2 detik untuk AssemblyAI
            updateStepUI('transcribe', 'completed');
            
            updateStepUI('generate', 'processing');
            const generatedContent = await simulateApiCall(2500, DUMMY_AI_RESULTS); // 2.5 detik untuk OpenRouter
            updateStepUI('generate', 'completed');
            
            // (Opsional) Premium voiceover
            updateStepUI('voiceover', 'processing');
            await simulateApiCall(1000); // 1 detik untuk Play.ht
            updateStepUI('voiceover', 'completed');

            // 3. Tampilkan semua hasil
            displayResults(transcript, generatedContent);

        } catch (error) {
            console.error("Terjadi kesalahan selama pemrosesan:", error);
            alert("Oops, terjadi kesalahan. Silakan coba lagi.");
            resetToInitialState();
        }
    };
    
    // Fungsi untuk menampilkan hasil di UI
    const displayResults = (transcript, content) => {
        transcriptOutput.textContent = transcript;
        igCaptionOutput.textContent = content.igCaption;
        ytTitleOutput.textContent = content.ytTitle;
        narrativeOutput.textContent = content.narrative;
        poemOutput.textContent = content.poem;
        
        resultsSection.classList.remove('hidden');
        // Scroll ke bawah untuk melihat hasil
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    };

    // Fungsi untuk menangani aksi pada tombol hasil (Salin, Download, dll.)
    const handleResultActions = (e) => {
        const target = e.target.closest('button');
        if (!target) return;

        const resultCard = target.closest('.result-card');
        const textContent = resultCard.querySelector('p').textContent;

        if (target.classList.contains('btn-copy')) {
            copyToClipboard(textContent, target);
        } else if (target.classList.contains('btn-download')) {
            downloadAsTxt('transcript.txt', textContent);
        } else if (target.classList.contains('btn-send-to-voiceover')) {
            // Ini adalah trigger untuk fitur premium
            premiumVoiceoverOutput.classList.remove('hidden');
            premiumVoiceoverOutput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };


    // =================================================================
    // FUNGSI PEMBANTU (HELPERS)
    // =================================================================

    // Handler untuk event 'dragover'
    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.add('border-purple-400', 'bg-gray-700/50');
    };

    // Handler untuk event 'dragleave'
    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('border-purple-400', 'bg-gray-700/50');
    };

    // Handler untuk event 'drop'
    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('border-purple-400', 'bg-gray-700/50');
        const files = e.dataTransfer.files;
        if (files.length) {
            handleFile(files[0]);
        }
    };

    // Handler untuk pemilihan file dari input
    const handleFileSelect = (e) => {
        if (e.target.files.length) {
            handleFile(e.target.files[0]);
        }
    };
    
    // Memproses file yang dipilih
    const handleFile = (file) => {
        // Validasi tipe file
        if (!file.type.startsWith('audio/')) {
            alert('Harap pilih file audio (mp3 atau wav).');
            return;
        }
        selectedFile = file;
        fileInfo.textContent = `File terpilih: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
        fileInfo.classList.remove('hidden');
        processBtn.disabled = false;
    };
    
    // Mengupdate UI dari setiap langkah proses
    const updateStepUI = (step, status) => {
        const stepEl = document.getElementById(`step-${step}`);
        stepEl.classList.remove('processing', 'completed'); // Reset kelas
        if (status) {
            stepEl.classList.add(status);
        }
    };

    // Fungsi untuk menyalin teks ke clipboard
    const copyToClipboard = (text, button) => {
        navigator.clipboard.writeText(text).then(() => {
            const originalText = button.innerHTML;
            button.innerHTML = 'Tersalin! ✅';
            setTimeout(() => {
                button.innerHTML = originalText;
            }, 2000);
        }).catch(err => {
            console.error('Gagal menyalin:', err);
            alert('Gagal menyalin teks.');
        });
    };

    // Fungsi untuk mengunduh teks sebagai file .txt
    const downloadAsTxt = (filename, text) => {
        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    // Fungsi untuk mensimulasikan panggilan API dengan delay
    const simulateApiCall = (delay, result = { success: true }) => {
        // DI DUNIA NYATA: Ganti fungsi ini dengan fetch() ke endpoint API asli
        // contoh:
        // return fetch(API_ENDPOINTS.CLEANVOICE, {
        //   method: 'POST',
        //   headers: { 'Authorization': 'Bearer YOUR_API_KEY', 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ audio_file: ... })
        // }).then(res => res.json());

        console.log(`[DUMMY API] Memanggil API... akan selesai dalam ${delay}ms`);
        return new Promise(resolve => setTimeout(() => resolve(result), delay));
    };

    // Reset UI ke kondisi awal sebelum proses
    const resetUI = () => {
        processingSection.classList.add('hidden');
        resultsSection.classList.add('hidden');
        
        ['clean', 'transcribe', 'generate', 'voiceover'].forEach(step => {
            updateStepUI(step, null); // Hapus semua status
        });

        // Kosongkan hasil sebelumnya
        [transcriptOutput, igCaptionOutput, ytTitleOutput, narrativeOutput, poemOutput].forEach(el => {
            el.textContent = 'Memuat...';
        });
        premiumVoiceoverOutput.classList.add('hidden');
    };
    
    // Reset total ke state awal aplikasi
    const resetToInitialState = () => {
        resetUI();
        processBtn.disabled = false;
        processBtn.textContent = 'Proses Audio & Hasilkan Konten';
        uploadSection.classList.remove('opacity-50');
    };

    // Jalankan fungsi inisialisasi
    init();
});