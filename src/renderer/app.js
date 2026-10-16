/**
 * NARA - Renderer Application Logic
 * Features:
 * - Multi-Language Switcher (10 Languages: ID, EN, JA, ZH, ES, DE, FR, PT, RU, KO)
 * - Deterministic Total Frames & FPS Rendering Pipeline
 * - 1:1 Preview & Render Fidelity (Aspect Ratio, Transparency, Exact Hold Frame Logic)
 * - Per-Video Metadata Editing & Persistence for Microstock CSV Export
 */

document.addEventListener('DOMContentLoaded', async () => {
  if (!window.api) {
    console.error('Electron IPC bridge (window.api) not detected.');
    return;
  }

  // ==========================================================================
  // Internationalization (i18n) Dictionary
  // ==========================================================================

  const translations = {
    id: {
      soundEnabled: "Suara: On",
      soundDisabled: "Suara: Bisu",
      themeDark: "Mode Gelap",
      themeLight: "Mode Terang",
      appTitle: "NARA",
      appSubtitle: "Commercial 4K & ProRes 4444 Motion Studio",
      badgeStreamActive: "Headless Stream Aktif",
      badgeProresReady: "4444",
      btnOpenFolder: "Buka Folder Hasil",
      previewHeader: "Live Preview",
      alphaModeLabel: "Alpha:",
      alphaGrid: "Grid",
      alphaDark: "Gelap",
      alphaLight: "Terang",
      alphaGreen: "Hijau",
      previewPlaceholderText: "Pilih atau drop file animasi HTML untuk live preview & scrubbing",
      metaEditorHeading: "Metadata Editor (Per-Video)",
      metaAutoSaved: "Tersimpan otomatis per video",
      metaTitleLabel: "Judul Komersial (Title):",
      metaCategoryLabel: "Kategori (Category):",
      metaFramesLabel: "Total Frames:",
      metaKeywordsLabel: "Kata Kunci Microstock (Pisahkan dengan koma):",
      chkSeamlessLoopTitle: "Seamless Looping Animation",
      chkSeamlessLoopDesc: "Render frame 0 s/d (Total-1) mencegah micro-freeze pada sambungan loop",
      holdFrameLabel: "Hold Last Frame:",
      unitFrames: "frames",
      queueHeader: "Batch Queue & Engine Controls",
      dropPrimary: "Drag & Drop file animasi .HTML ke sini",
      dropSecondary: "atau pilih lewat tombol di bawah",
      btnBrowseFiles: "Pilih File HTML",
      btnBrowseFolder: "Scan Folder",
      exportSettingsHeading: "Konfigurasi Ekspor Global",
      labelPreset: "Preset Format & Codec",
      presetProres: "MOV ProRes 4444 (Alpha Transparan)",
      presetMp44k: "MP4 High Bitrate 4K (CRF 15 / yuv420p)",
      presetMp4Sosmed: "MP4 Sosmed 1080p (CRF 20 / yuv420p)",
      labelResolution: "Resolusi Render",
      labelFps: "Frame Rate (FPS)",
      fps60: "60 FPS (Ultra Smooth Stock)",
      fps30: "30 FPS (Standard Stock)",
      fps24: "24 FPS (Cinematic 24p)",
      labelGlobalFrames: "Default Total Frames",
      labelOutputDir: "Folder Hasil:",
      btnChangeOutputDir: "Ganti Folder",
      queueListHeading: "Daftar Antrean Render",
      btnApplyDefaults: "Terapkan Default ke Semua",
      btnClearQueue: "Hapus Semua",
      btnDeleteItem: "Hapus item ini",
      logItemDeleted: "[Queue] Item dihapus:",
      queueEmptyText: "Belum ada file di antrean. Seret file HTML atau gunakan tombol di atas.",
      progressReady: "Siap untuk render",
      btnStartRender: "Start Batch Render",
      btnCancelRender: "Batalkan Render",
      terminalTitle: "Render Stream & FFmpeg Logs",
      btnClearLog: "Clear",
      loopReady: "Seamless Loop",
      oneShotReady: "One-Shot Graphic",
      pillPending: "Pending",
      pillRendering: "Rendering",
      pillDone: "Done",
      pillError: "Error",
      previewFpsLabel: "FPS Preview",
      holdZoneTitle: "Hold Last Frame Zone",
      tooltipFullscreen: "Layar Penuh (F / ESC)",
      logAppReady: "[System] NARA siap digunakan.",
      logQueueCleared: "[Queue] Seluruh antrean berhasil dihapus.",
      logDefaultsApplied: "[Config] Pengaturan default global diterapkan ke semua item.",
      logRenderCancelled: "[Engine] Batch rendering dibatalkan oleh pengguna.",
      alertSelectValidHtml: "Hanya file .html atau .htm yang didukung.",
      tabQueueTitle: "Antrean Batch Render",
      tabStudioTitle: "Studio Generator ✨",
      studioBadge: "PREMIUM 4K MOTION TEMPLATES",
      studioTitle: "Motion Graphics Studio Generator",
      studioSubtitle: "Pilih kategori gerak komersial, sesuaikan parameter, lalu preview langsung atau kirim ke antrean render 4K / ProRes 4444 Alpha.",
      studioSelectCategory: "Pilih Gaya Animasi:",
      catKineticTitle: "Kinetic Typography",
      catKineticDesc: "Typo reveal staggered, neon pulse, crosshair telemetry",
      catParticleTitle: "Particle FX",
      catParticleDesc: "Cosmic galaxy, quantum spark stream, bokeh swirl",
      catIsoTitle: "Isometric 3D",
      catIsoDesc: "2.5D geometric ripple matrix, depth shading & pillars",
      catDataVizTitle: "Data Visualization",
      catDataVizDesc: "FinTech HUD, radial gauge, animated bar chart & telemetry",
      catAbstractTitle: "Abstract Motion",
      catAbstractDesc: "Hypnotic fluid wave ribbons, iridescent liquid neon",
      catFlatTitle: "Flat Animation",
      catFlatDesc: "Clean vector explainer, success badge, confetti burst",
      studioAlphaTitle: "Transparent Alpha Background",
      studioAlphaDesc: "Cocok untuk ProRes 4444 Alpha Channel overlay",
      btnStudioPreview: "Live Preview Sandbox",
      btnStudioSaveHtml: "Simpan File .HTML",
      btnStudioGenerateQueue: "Generate & Masukkan ke Antrean",
      logStudioGenerated: "[Studio] Template animasi berhasil dibuat & ditambahkan ke antrean:",
      logStudioSaved: "[Studio] File HTML berhasil disimpan:",
      logSoundActive: "[Sound] Suara notifikasi selesai: AKTIF (Audio Test OK)",
      logSoundMuted: "[Sound] Suara notifikasi selesai: BISU (Muted)",
      logQueueAdded: "[Queue] Ditambahkan ke antrean:",
      logTargetFolder: "[Config] Folder hasil target:",
      logBatchStart: "[Batch] Memulai pipeline render untuk",
      logBatchCancelling: "[Batch] Permintaan pembatalan dikirim ke engine...",
      logBatchComplete: "[Batch Selesai] Total:",
      logCsvExport: "[Ekspor CSV Stok] File CSV berhasil disimpan:",
      logEngineInit: "[Engine] Memulai render file:",
      logEngineTarget: "[Engine] Resolusi target:",
      logEnginePreset: "[Engine] Preset format:",
      logEngineFrames: "[Engine] Total frame direncanakan:",
      logStudioPreview: "[Studio] Live preview dimuat:",
      logStudioCancel: "[Studio] Penyimpanan HTML dibatalkan.",
      logThemeChanged: "[Theme] Tampilan tema diubah ke:",
      logPresetChanged: "[Config] Preset output diubah ke:",
      logEngineFfmpeg: "[Engine] Menggunakan binary FFmpeg:",
      logEnginePiped: "[Engine] Semua frame terkirim. Menutup stdin FFmpeg...",
      logEngineSuccess: "[Engine] Render selesai dengan sukses:",
      logEngineFailed: "[Engine Error] Render gagal:",
      btnHideToTray: "Tray",
      btnHideToTrayTitle: "Sembunyikan ke System Tray (Tetap Berjalan di Background)",
      logHiddenToTray: "[System] Aplikasi diminimalkan ke Tray & tetap aktif di background."
    },
    en: {
      soundEnabled: "Sound: On",
      soundDisabled: "Sound: Mute",
      themeDark: "Dark Mode",
      themeLight: "Light Mode",
      appTitle: "NARA",
      appSubtitle: "Commercial 4K & ProRes 4444 Motion Studio",
      badgeStreamActive: "Headless Stream Active",
      badgeProresReady: "4444",
      btnOpenFolder: "Open Output Folder",
      previewHeader: "Live Preview",
      alphaModeLabel: "Alpha:",
      alphaGrid: "Grid",
      alphaDark: "Dark",
      alphaLight: "Light",
      alphaGreen: "Green",
      previewPlaceholderText: "Select or drag & drop an HTML animation file for live preview & scrubbing",
      metaEditorHeading: "Metadata Editor (Per-Video)",
      metaAutoSaved: "Auto-saved per video",
      metaTitleLabel: "Commercial Title (Title):",
      metaCategoryLabel: "Category (Category):",
      metaFramesLabel: "Total Frames:",
      metaKeywordsLabel: "Microstock Keywords (Comma-separated):",
      chkSeamlessLoopTitle: "Seamless Looping Animation",
      chkSeamlessLoopDesc: "Renders frame 0 to (Total-1) to eliminate micro-freeze at loop junctions",
      holdFrameLabel: "Hold Last Frame:",
      unitFrames: "frames",
      queueHeader: "Batch Queue & Engine Controls",
      dropPrimary: "Drag & Drop .HTML animation files here",
      dropSecondary: "or browse using the buttons below",
      btnBrowseFiles: "Browse HTML Files",
      btnBrowseFolder: "Scan Folder",
      exportSettingsHeading: "Global Export Configuration",
      labelPreset: "Preset Format & Codec",
      presetProres: "MOV ProRes 4444 (Alpha Transparent)",
      presetMp44k: "MP4 High Bitrate 4K (CRF 15 / yuv420p)",
      presetMp4Sosmed: "MP4 Social 1080p (CRF 20 / yuv420p)",
      labelResolution: "Render Resolution",
      labelFps: "Frame Rate (FPS)",
      fps60: "60 FPS (Ultra Smooth Stock)",
      fps30: "30 FPS (Standard Stock)",
      fps24: "24 FPS (Cinematic 24p)",
      labelGlobalFrames: "Default Total Frames",
      labelOutputDir: "Output Folder:",
      btnChangeOutputDir: "Change Folder",
      queueListHeading: "Batch Queue List",
      btnApplyDefaults: "Apply Defaults to All",
      btnClearQueue: "Clear All",
      btnDeleteItem: "Delete this item",
      logItemDeleted: "[Queue] Item removed:",
      queueEmptyText: "Queue is empty. Drag & drop HTML files or click browse above.",
      progressReady: "Ready to render",
      btnStartRender: "Start Batch Render",
      btnCancelRender: "Cancel Render",
      terminalTitle: "Render Stream & FFmpeg Logs",
      btnClearLog: "Clear",
      loopReady: "Seamless Loop",
      oneShotReady: "One-Shot Graphic",
      pillPending: "Pending",
      pillRendering: "Rendering",
      pillDone: "Done",
      pillError: "Error",
      previewFpsLabel: "FPS Preview",
      holdZoneTitle: "Hold Last Frame Zone",
      tooltipFullscreen: "Fullscreen Preview (F / ESC)",
      logAppReady: "[System] NARA is ready.",
      logQueueCleared: "[Queue] All items cleared from queue.",
      logDefaultsApplied: "[Config] Global default settings applied to all queue items.",
      logRenderCancelled: "[Engine] Batch rendering cancelled by user.",
      alertSelectValidHtml: "Only .html or .htm files are supported.",
      tabQueueTitle: "Batch Render Queue",
      tabStudioTitle: "Studio Generator ✨",
      studioBadge: "PREMIUM 4K MOTION TEMPLATES",
      studioTitle: "Motion Graphics Studio Generator",
      studioSubtitle: "Select commercial motion category, adjust parameters, preview live or queue for 4K / ProRes 4444 Alpha rendering.",
      studioSelectCategory: "Select Motion Style:",
      catKineticTitle: "Kinetic Typography",
      catKineticDesc: "Typo reveal staggered, neon pulse, crosshair telemetry",
      catParticleTitle: "Particle FX",
      catParticleDesc: "Cosmic galaxy, quantum spark stream, bokeh swirl",
      catIsoTitle: "Isometric 3D",
      catIsoDesc: "2.5D geometric ripple matrix, depth shading & pillars",
      catDataVizTitle: "Data Visualization",
      catDataVizDesc: "FinTech HUD, radial gauge, animated bar chart & telemetry",
      catAbstractTitle: "Abstract Motion",
      catAbstractDesc: "Hypnotic fluid wave ribbons, iridescent liquid neon",
      catFlatTitle: "Flat Animation",
      catFlatDesc: "Clean vector explainer, success badge, confetti burst",
      studioAlphaTitle: "Transparent Alpha Background",
      studioAlphaDesc: "Ideal for ProRes 4444 Alpha Channel overlays",
      btnStudioPreview: "Live Preview Sandbox",
      btnStudioSaveHtml: "Save .HTML File",
      btnStudioGenerateQueue: "Generate & Add to Queue",
      logStudioGenerated: "[Studio] Animation template generated and queued:",
      logStudioSaved: "[Studio] HTML file saved successfully:",
      logSoundActive: "[Sound] Completion notification chime: ACTIVE (Audio Test OK)",
      logSoundMuted: "[Sound] Completion notification chime: MUTED",
      logQueueAdded: "[Queue] Added to batch queue:",
      logTargetFolder: "[Config] Target output folder:",
      logBatchStart: "[Batch] Starting render pipeline for",
      logBatchCancelling: "[Batch] Cancellation request sent to engine...",
      logBatchComplete: "[Batch Complete] Total:",
      logCsvExport: "[Stock CSV Export] Stock metadata CSV exported to:",
      logEngineInit: "[Engine] Initializing render for:",
      logEngineTarget: "[Engine] Target resolution:",
      logEnginePreset: "[Engine] Codec preset:",
      logEngineFrames: "[Engine] Frames planned:",
      logStudioPreview: "[Studio] Live preview loaded:",
      logStudioCancel: "[Studio] HTML save cancelled.",
      logThemeChanged: "[Theme] UI Theme switched to:",
      logPresetChanged: "[Config] Output preset changed to:",
      logEngineFfmpeg: "[Engine] Using FFmpeg binary:",
      logEnginePiped: "[Engine] All frames piped. Closing FFmpeg stdin...",
      logEngineSuccess: "[Engine] Render completed successfully:",
      logEngineFailed: "[Engine Error] Render failed:",
      btnHideToTray: "Tray",
      btnHideToTrayTitle: "Hide to System Tray (Keep Running in Background)",
      logHiddenToTray: "[System] App minimized to System Tray & active in background."
    },
    ja: {
      soundEnabled: "通知音: オン",
      soundDisabled: "通知音: 消音",
      themeDark: "ダークモード",
      themeLight: "ライトモード",
      appTitle: "NARA",
      appSubtitle: "商用4K＆ProRes 4444アルファ一括バッチパイプライン",
      badgeStreamActive: "ヘッドレス配信中",
      badgeProresReady: "4444",
      btnOpenFolder: "出力フォルダを開く",
      previewHeader: "Live Preview",
      alphaModeLabel: "アルファ:",
      alphaGrid: "グリッド",
      alphaDark: "ダーク",
      alphaLight: "ライト",
      alphaGreen: "グリーン",
      previewPlaceholderText: "HTMLアニメーションファイルを選択またはドラッグ＆ドロップしてください",
      metaEditorHeading: "メタデータエディター (動画別)",
      metaAutoSaved: "動画ごとに自動保存されます",
      metaTitleLabel: "商業タイトル (Title):",
      metaCategoryLabel: "カテゴリー (Category):",
      metaFramesLabel: "総フレーム数:",
      metaKeywordsLabel: "ストックキーワード (カンマ区切り):",
      chkSeamlessLoopTitle: "シームレスループアニメーション",
      chkSeamlessLoopDesc: "ループ接合部の停止を防ぐためフレーム0から(Total-1)までレンダリング",
      holdFrameLabel: "最終フレーム維持:",
      unitFrames: "フレーム",
      queueHeader: "バッチキュー＆エンジン設定",
      dropPrimary: ".HTMLアニメーションファイルをここにドラッグ＆ドロップ",
      dropSecondary: "または下のボタンから選択",
      btnBrowseFiles: "HTMLファイルを選択",
      btnBrowseFolder: "フォルダをスキャン",
      exportSettingsHeading: "グローバルエクスポート設定",
      labelPreset: "プリセット形式とコーデック",
      presetProres: "MOV ProRes 4444 (アルファ透明)",
      presetMp44k: "MP4 高ビットレート 4K (CRF 15 / yuv420p)",
      presetMp4Sosmed: "MP4 SNS用 1080p (CRF 20 / yuv420p)",
      labelResolution: "レンダリング解像度",
      labelFps: "フレームレート (FPS)",
      fps60: "60 FPS (最高品質ストック)",
      fps30: "30 FPS (標準ストック)",
      fps24: "24 FPS (シネマティック 24p)",
      labelGlobalFrames: "デフォルト総フレーム数",
      labelOutputDir: "出力先フォルダ:",
      btnChangeOutputDir: "変更",
      queueListHeading: "レンダリングキュー一覧",
      btnApplyDefaults: "すべてにデフォルトを適用",
      btnClearQueue: "すべて削除",
      btnDeleteItem: "この項目を削除",
      logItemDeleted: "[Queue] 項目を削除しました:",
      queueEmptyText: "キューが空です。HTMLファイルをドラッグするか上記ボタンで選択してください。",
      progressReady: "レンダリング準備完了",
      btnStartRender: "一括レンダリング開始",
      btnCancelRender: "レンダリング中止",
      terminalTitle: "Render Stream & FFmpeg Logs",
      btnClearLog: "Clear",
      loopReady: "シームレスループ",
      oneShotReady: "ワンショットグラフィック",
      pillPending: "待機中",
      pillRendering: "レンダリング中",
      pillDone: "完了",
      pillError: "エラー",
      previewFpsLabel: "FPS プレビュー",
      holdZoneTitle: "最終フレーム維持ゾーン",
      tooltipFullscreen: "全画面プレビュー (F / ESC)",
      logAppReady: "[System] NARA の準備が完了しました。",
      logQueueCleared: "[Queue] キュー内のすべての項目が削除されました。",
      logDefaultsApplied: "[Config] すべての項目にグローバル設定が適用されました。",
      logRenderCancelled: "[Engine] ユーザーによってレンダリングが中止されました。",
      alertSelectValidHtml: ".htmlまたは.htmファイルのみサポートされています。",
      logStudioGenerated: "[Studio] アニメーションテンプレートを作成しキューに追加:",
      logStudioSaved: "[Studio] HTMLファイルを正常に保存:",
      logSoundActive: "[Sound] 完了通知音: オン (オーディオテスト完了)",
      logSoundMuted: "[Sound] 完了通知音: 消音",
      logQueueAdded: "[Queue] キューに追加されました:",
      logTargetFolder: "[Config] 出力先フォルダ:",
      logBatchStart: "[Batch] レンダリングパイプラインを開始:",
      logBatchCancelling: "[Batch] 中止リクエストをエンジンに送信中...",
      logBatchComplete: "[Batch 完了] 合計:",
      logCsvExport: "[Stock CSV Export] ストックメタデータCSVを出力:",
      logEngineInit: "[Engine] レンダリングを初期化中:",
      logEngineTarget: "[Engine] ターゲット解像度:",
      logEnginePreset: "[Engine] コーデックプリセット:",
      logEngineFfmpeg: "[Engine] FFmpegバイナリを使用:",
      logEngineFrames: "[Engine] 計画フレーム数:",
      logEnginePiped: "[Engine] すべてのフレームの転送完了。FFmpeg stdinを閉じます...",
      logEngineSuccess: "[Engine] レンダリングが正常に完了しました:",
      logEngineFailed: "[Engine Error] レンダリング失敗:",
      logThemeChanged: "[Theme] UIテーマが変更されました:",
      logPresetChanged: "[Config] 出力プリセットを変更:",
      logStudioPreview: "[Studio] ライブプレビューをロードしました:",
      logStudioCancel: "[Studio] HTMLの保存がキャンセルされました。"
    },
    zh: {
      soundEnabled: "提示音: 开启",
      soundDisabled: "提示音: 静音",
      themeDark: "深色模式",
      themeLight: "浅色模式",
      appTitle: "NARA",
      appSubtitle: "商业级 4K 与 ProRes 4444 透明通道批量渲染引擎",
      badgeStreamActive: "无头流传输活跃",
      badgeProresReady: "4444",
      btnOpenFolder: "打开输出文件夹",
      previewHeader: "Live Preview",
      alphaModeLabel: "透明通道:",
      alphaGrid: "棋盘格",
      alphaDark: "深色",
      alphaLight: "浅色",
      alphaGreen: "绿色",
      previewPlaceholderText: "选择或拖放 HTML 动画文件以进行实时预览与时间轴拖动",
      metaEditorHeading: "元数据编辑器 (逐个视频)",
      metaAutoSaved: "每个视频独立自动保存",
      metaTitleLabel: "商业标题 (Title):",
      metaCategoryLabel: "分类类别 (Category):",
      metaFramesLabel: "总帧数:",
      metaKeywordsLabel: "微图库关键词 (英文逗号分隔):",
      chkSeamlessLoopTitle: "无缝循环动画 (Seamless Loop)",
      chkSeamlessLoopDesc: "渲染帧 0 至 (Total-1) 以防止循环拼接处的轻微卡顿",
      holdFrameLabel: "保持最后一帧:",
      unitFrames: "帧",
      queueHeader: "批量队列与引擎控制",
      dropPrimary: "将 .HTML 动画文件拖放到此处",
      dropSecondary: "或通过下方按钮选择",
      btnBrowseFiles: "浏览 HTML 文件",
      btnBrowseFolder: "扫描文件夹",
      exportSettingsHeading: "全局导出配置",
      labelPreset: "预设格式与编码",
      presetProres: "MOV ProRes 4444 (Alpha 透明通道)",
      presetMp44k: "MP4 高码率 4K (CRF 15 / yuv420p)",
      presetMp4Sosmed: "MP4 社交媒体 1080p (CRF 20 / yuv420p)",
      labelResolution: "渲染分辨率",
      labelFps: "帧率 (FPS)",
      fps60: "60 FPS (超流畅微图库标准)",
      fps30: "30 FPS (标准素材)",
      fps24: "24 FPS (电影级 24p)",
      labelGlobalFrames: "默认总帧数",
      labelOutputDir: "输出目录:",
      btnChangeOutputDir: "更改文件夹",
      queueListHeading: "渲染队列列表",
      btnApplyDefaults: "应用默认设置到全部",
      btnClearQueue: "清空全部",
      btnDeleteItem: "删除此项",
      logItemDeleted: "[Queue] 项目已删除:",
      queueEmptyText: "队列为空。请拖放 HTML 文件或点击上方按钮进行选择。",
      progressReady: "准备渲染",
      btnStartRender: "开始批量渲染",
      btnCancelRender: "取消渲染",
      terminalTitle: "Render Stream & FFmpeg Logs",
      btnClearLog: "Clear",
      loopReady: "无缝循环",
      oneShotReady: "单次动画 (One-Shot)",
      pillPending: "等待中",
      pillRendering: "渲染中",
      pillDone: "完成",
      pillError: "错误",
      previewFpsLabel: "FPS 预览",
      holdZoneTitle: "最后一帧保持区域",
      tooltipFullscreen: "全屏预览 (F / ESC)",
      logAppReady: "[System] NARA 已就绪。",
      logQueueCleared: "[Queue] 队列中所有项目已清空。",
      logDefaultsApplied: "[Config] 全局默认设置已应用到全部项目。",
      logRenderCancelled: "[Engine] 批量渲染已被用户取消。",
      alertSelectValidHtml: "仅支持 .html 或 .htm 格式文件。",
      logStudioGenerated: "[Studio] 动画模板已生成并加入队列:",
      logStudioSaved: "[Studio] HTML 文件保存成功:",
      logSoundActive: "[Sound] 完成提示音: 开启 (音频测试正常)",
      logSoundMuted: "[Sound] 完成提示音: 静音",
      logQueueAdded: "[Queue] 已添加到批量队列:",
      logTargetFolder: "[Config] 目标输出文件夹:",
      logBatchStart: "[Batch] 启动渲染流水线，共",
      logBatchCancelling: "[Batch] 正在向引擎发送取消请求...",
      logBatchComplete: "[Batch 完成] 总计:",
      logCsvExport: "[Stock CSV 导出] 图库元数据 CSV 已导出至:",
      logEngineInit: "[Engine] 正在初始化渲染:",
      logEngineTarget: "[Engine] 目标分辨率:",
      logEnginePreset: "[Engine] 编码预设:",
      logEngineFfmpeg: "[Engine] 正在使用 FFmpeg 二进制文件:",
      logEngineFrames: "[Engine] 计划总帧数:",
      logEnginePiped: "[Engine] 所有帧已传输完成。正在关闭 FFmpeg stdin...",
      logEngineSuccess: "[Engine] 渲染成功完成:",
      logEngineFailed: "[Engine 错误] 渲染失败:",
      logThemeChanged: "[Theme] 界面主题已切换为:",
      logPresetChanged: "[Config] 输出预设已更改为:",
      logStudioPreview: "[Studio] 实时预览已加载:",
      logStudioCancel: "[Studio] 已取消 HTML 保存。"
    },
    es: {
      soundEnabled: "Sonido: On",
      soundDisabled: "Sonido: Mudo",
      themeDark: "Modo Oscuro",
      themeLight: "Modo Claro",
      appTitle: "NARA",
      appSubtitle: "Pipeline Comercial 4K y ProRes 4444 Alpha por Lotes",
      badgeStreamActive: "Flujo Headless Activo",
      badgeProresReady: "4444",
      btnOpenFolder: "Abrir Carpeta de Salida",
      previewHeader: "Live Preview",
      alphaModeLabel: "Alfa:",
      alphaGrid: "Cuadrícula",
      alphaDark: "Oscuro",
      alphaLight: "Claro",
      alphaGreen: "Verde",
      previewPlaceholderText: "Selecciona o arrastra un archivo HTML para vista previa y control de fotogramas",
      metaEditorHeading: "Editor de Metadatos (Por Video)",
      metaAutoSaved: "Guardado automáticamente por video",
      metaTitleLabel: "Título Comercial (Title):",
      metaCategoryLabel: "Categoría (Category):",
      metaFramesLabel: "Fotogramas Totales:",
      metaKeywordsLabel: "Palabras Clave de Microstock (Separadas por comas):",
      chkSeamlessLoopTitle: "Animación en Bucle Continuo",
      chkSeamlessLoopDesc: "Renderiza fotogramas 0 a (Total-1) para evitar congelamientos en el bucle",
      holdFrameLabel: "Mantener Último Fotograma:",
      unitFrames: "fotogramas",
      queueHeader: "Cola por Lotes y Controles de Motor",
      dropPrimary: "Arrastra y suelta archivos .HTML aquí",
      dropSecondary: "o selecciona usando los botones abajo",
      btnBrowseFiles: "Elegir Archivos HTML",
      btnBrowseFolder: "Escanear Carpeta",
      exportSettingsHeading: "Configuración Global de Exportación",
      labelPreset: "Formato y Códec Preestablecido",
      presetProres: "MOV ProRes 4444 (Alfa Transparente)",
      presetMp44k: "MP4 Alta Tasa de Bits 4K (CRF 15 / yuv420p)",
      presetMp4Sosmed: "MP4 Redes Sociales 1080p (CRF 20 / yuv420p)",
      labelResolution: "Resolución de Renderizado",
      labelFps: "Tasa de Fotogramas (FPS)",
      fps60: "60 FPS (Stock Ultra Fluido)",
      fps30: "30 FPS (Stock Estándar)",
      fps24: "24 FPS (Cinematográfico 24p)",
      labelGlobalFrames: "Fotogramas Totales Predeterminados",
      labelOutputDir: "Carpeta de Salida:",
      btnChangeOutputDir: "Cambiar Carpeta",
      queueListHeading: "Lista de Cola de Renderizado",
      btnApplyDefaults: "Aplicar Predeterminados a Todos",
      btnClearQueue: "Borrar Todo",
      btnDeleteItem: "Eliminar este elemento",
      logItemDeleted: "[Queue] Elemento eliminado:",
      queueEmptyText: "La cola está vacía. Arrastra archivos HTML o haz clic en examinar arriba.",
      progressReady: "Listo para renderizar",
      btnStartRender: "Iniciar Renderizado por Lotes",
      btnCancelRender: "Cancelar Renderizado",
      terminalTitle: "Render Stream & FFmpeg Logs",
      btnClearLog: "Clear",
      loopReady: "Bucle Continuo",
      oneShotReady: "Gráfico de Una Toma",
      pillPending: "Pendiente",
      pillRendering: "Renderizando",
      pillDone: "Completado",
      pillError: "Error",
      previewFpsLabel: "FPS Vista Previa",
      holdZoneTitle: "Zona de Retención de Fotograma",
      tooltipFullscreen: "Vista Previa en Pantalla Completa (F / ESC)",
      logAppReady: "[System] NARA listo para usar.",
      logQueueCleared: "[Queue] Se han eliminado todos los elementos de la cola.",
      logDefaultsApplied: "[Config] Configuración global aplicada a todos los elementos.",
      logRenderCancelled: "[Engine] Renderizado por lotes cancelado por el usuario.",
      alertSelectValidHtml: "Solo se admiten archivos .html o .htm.",
      logStudioGenerated: "[Studio] Plantilla de animación generada y agregada a la cola:",
      logStudioSaved: "[Studio] Archivo HTML guardado con éxito:",
      logSoundActive: "[Sound] Sonido de finalización: ACTIVO (Prueba de audio OK)",
      logSoundMuted: "[Sound] Sonido de finalización: MUDO",
      logQueueAdded: "[Queue] Añadido a la cola por lotes:",
      logTargetFolder: "[Config] Carpeta de salida objetivo:",
      logBatchStart: "[Batch] Iniciando renderizado por lotes para",
      logBatchCancelling: "[Batch] Solicitud de cancelación enviada al motor...",
      logBatchComplete: "[Batch Completado] Total:",
      logCsvExport: "[Stock CSV Export] Metadatos CSV exportados a:",
      logEngineInit: "[Engine] Inicializando renderizado para:",
      logEngineTarget: "[Engine] Resolución objetivo:",
      logEnginePreset: "[Engine] Preajuste de códec:",
      logEngineFfmpeg: "[Engine] Usando binario FFmpeg:",
      logEngineFrames: "[Engine] Fotogramas planificados:",
      logEnginePiped: "[Engine] Todos los fotogramas enviados. Cerrando stdin de FFmpeg...",
      logEngineSuccess: "[Engine] Renderizado completado con éxito:",
      logEngineFailed: "[Engine Error] Fallo de renderizado:",
      logThemeChanged: "[Theme] Tema de interfaz cambiado a:",
      logPresetChanged: "[Config] Preajuste de salida cambiado a:",
      logStudioPreview: "[Studio] Vista previa en vivo cargada:",
      logStudioCancel: "[Studio] Guardado de HTML cancelado."
    },
    de: {
      soundEnabled: "Ton: An",
      soundDisabled: "Ton: Stumm",
      themeDark: "Dunkelmodus",
      themeLight: "Hellmodus",
      appTitle: "NARA",
      appSubtitle: "Kommerzielle 4K & ProRes 4444 Alpha Stapel-Pipeline",
      badgeStreamActive: "Headless-Stream Aktiv",
      badgeProresReady: "4444",
      btnOpenFolder: "Ausgabeordner öffnen",
      previewHeader: "Live Preview",
      alphaModeLabel: "Alpha:",
      alphaGrid: "Raster",
      alphaDark: "Dunkel",
      alphaLight: "Hell",
      alphaGreen: "Grün",
      previewPlaceholderText: "Wähle oder ziehe eine HTML-Animationsdatei für Live-Vorschau hinein",
      metaEditorHeading: "Metadaten-Editor (Pro Video)",
      metaAutoSaved: "Automatisch pro Video gespeichert",
      metaTitleLabel: "Kommerzieller Titel (Title):",
      metaCategoryLabel: "Kategorie (Category):",
      metaFramesLabel: "Gesamtbilder:",
      metaKeywordsLabel: "Microstock-Schlagwörter (Kommagetrennt):",
      chkSeamlessLoopTitle: "Nahtlose Endlosschleife",
      chkSeamlessLoopDesc: "Rendert Frames 0 bis (Total-1), um Mikroruckler am Schleifenübergang zu vermeiden",
      holdFrameLabel: "Letztes Bild halten:",
      unitFrames: "Frames",
      queueHeader: "Batch-Warteschlange & Engine-Steuerung",
      dropPrimary: ".HTML-Animationsdateien hierher ziehen",
      dropSecondary: "oder über die Schaltflächen unten auswählen",
      btnBrowseFiles: "HTML-Dateien wählen",
      btnBrowseFolder: "Ordner scannen",
      exportSettingsHeading: "Globale Exporteinstellungen",
      labelPreset: "Format- und Codec-Voreinstellung",
      presetProres: "MOV ProRes 4444 (Alpha Transparent)",
      presetMp44k: "MP4 Hohe Bitrate 4K (CRF 15 / yuv420p)",
      presetMp4Sosmed: "MP4 Social 1080p (CRF 20 / yuv420p)",
      labelResolution: "Render-Auflösung",
      labelFps: "Bildrate (FPS)",
      fps60: "60 FPS (Ultraflüssig)",
      fps30: "30 FPS (Standard-Stock)",
      fps24: "24 FPS (Kino 24p)",
      labelGlobalFrames: "Standard-Gesamtbilder (Frames)",
      labelOutputDir: "Ausgabeordner:",
      btnChangeOutputDir: "Ordner ändern",
      queueListHeading: "Render-Warteschlangenliste",
      btnApplyDefaults: "Standards auf alle anwenden",
      btnClearQueue: "Alle löschen",
      btnDeleteItem: "Dieses Element löschen",
      logItemDeleted: "[Queue] Element entfernt:",
      queueEmptyText: "Warteschlange ist leer. Ziehe HTML-Dateien hinein oder wähle sie oben aus.",
      progressReady: "Bereit zum Rendern",
      btnStartRender: "Batch-Rendering starten",
      btnCancelRender: "Rendering abbrechen",
      terminalTitle: "Render Stream & FFmpeg Logs",
      btnClearLog: "Clear",
      loopReady: "Endlosschleife",
      oneShotReady: "Einmalige Grafik",
      pillPending: "Ausstehend",
      pillRendering: "Rendert",
      pillDone: "Fertig",
      pillError: "Fehler",
      previewFpsLabel: "FPS Vorschau",
      holdZoneTitle: "Standbild-Zone",
      tooltipFullscreen: "Vollbild-Vorschau (F / ESC)",
      logAppReady: "[System] NARA ist bereit.",
      logQueueCleared: "[Queue] Alle Elemente aus der Warteschlange gelöscht.",
      logDefaultsApplied: "[Config] Globale Einstellungen auf alle Elemente angewendet.",
      logRenderCancelled: "[Engine] Batch-Rendering vom Benutzer abgebrochen.",
      alertSelectValidHtml: "Nur .html- oder .htm-Dateien werden unterstützt.",
      logStudioGenerated: "[Studio] Animationsvorlage generiert und zur Warteschlange hinzugefügt:",
      logStudioSaved: "[Studio] HTML-Datei erfolgreich gespeichert:",
      logSoundActive: "[Sound] Benachrichtigungston: AKTIV (Audiotest OK)",
      logSoundMuted: "[Sound] Benachrichtigungston: STUMM",
      logQueueAdded: "[Queue] Zur Warteschlange hinzugefügt:",
      logTargetFolder: "[Config] Ziel-Ausgabeordner:",
      logBatchStart: "[Batch] Starte Render-Pipeline für",
      logBatchCancelling: "[Batch] Abbruchanforderung an Engine gesendet...",
      logBatchComplete: "[Batch Fertig] Gesamt:",
      logCsvExport: "[Stock CSV Export] Stock-Metadaten CSV exportiert nach:",
      logEngineInit: "[Engine] Initialisiere Rendern für:",
      logEngineTarget: "[Engine] Zielauflösung:",
      logEnginePreset: "[Engine] Codec-Voreinstellung:",
      logEngineFfmpeg: "[Engine] Verwende FFmpeg-Binärdatei:",
      logEngineFrames: "[Engine] Geplante Frames:",
      logEnginePiped: "[Engine] Alle Frames übertragen. Schließe FFmpeg-Stdin...",
      logEngineSuccess: "[Engine] Rendern erfolgreich abgeschlossen:",
      logEngineFailed: "[Engine Fehler] Rendern fehlgeschlagen:",
      logThemeChanged: "[Theme] UI-Design gewechselt zu:",
      logPresetChanged: "[Config] Ausgabevoreinstellung geändert auf:",
      logStudioPreview: "[Studio] Live-Vorschau geladen:",
      logStudioCancel: "[Studio] HTML-Speichern abgebrochen."
    },
    fr: {
      soundEnabled: "Son: Activé",
      soundDisabled: "Son: Muet",
      themeDark: "Mode Sombre",
      themeLight: "Mode Clair",
      appTitle: "NARA",
      appSubtitle: "Pipeline de Rendu Commercial 4K & ProRes 4444 Alpha",
      badgeStreamActive: "Flux Headless Actif",
      badgeProresReady: "4444",
      btnOpenFolder: "Ouvrir le dossier de sortie",
      previewHeader: "Live Preview",
      alphaModeLabel: "Alpha:",
      alphaGrid: "Grille",
      alphaDark: "Sombre",
      alphaLight: "Clair",
      alphaGreen: "Vert",
      previewPlaceholderText: "Sélectionnez ou glissez-déposez un fichier HTML pour la prévisualisation",
      metaEditorHeading: "Éditeur de métadonnées (Par vidéo)",
      metaAutoSaved: "Enregistré automatiquement par vidéo",
      metaTitleLabel: "Titre commercial (Title):",
      metaCategoryLabel: "Catégorie (Category):",
      metaFramesLabel: "Images totales:",
      metaKeywordsLabel: "Mots-clés Microstock (Séparés par des virgules):",
      chkSeamlessLoopTitle: "Animation en boucle continue",
      chkSeamlessLoopDesc: "Rendu des images 0 à (Total-1) pour éliminer les micro-gels à la jonction",
      holdFrameLabel: "Maintenir la dernière image:",
      unitFrames: "images",
      queueHeader: "File d'attente et contrôles du moteur",
      dropPrimary: "Glissez-déposez les fichiers d'animation .HTML ici",
      dropSecondary: "ou parcourez à l'aide des boutons ci-dessous",
      btnBrowseFiles: "Parcourir les fichiers HTML",
      btnBrowseFolder: "Scanner le dossier",
      exportSettingsHeading: "Configuration globale d'exportation",
      labelPreset: "Format et codec prédéfinis",
      presetProres: "MOV ProRes 4444 (Alpha Transparent)",
      presetMp44k: "MP4 Débit élevé 4K (CRF 15 / yuv420p)",
      presetMp4Sosmed: "MP4 Médias sociaux 1080p (CRF 20 / yuv420p)",
      labelResolution: "Résolution de rendu",
      labelFps: "Fréquence d'images (FPS)",
      fps60: "60 FPS (Ultra fluide Stock)",
      fps30: "30 FPS (Stock Standard)",
      fps24: "24 FPS (Cinéma 24p)",
      labelGlobalFrames: "Images totales par défaut (Frames)",
      labelOutputDir: "Dossier de sortie:",
      btnChangeOutputDir: "Changer de dossier",
      queueListHeading: "Liste de la file de rendu",
      btnApplyDefaults: "Appliquer par défaut à tous",
      btnClearQueue: "Tout effacer",
      btnDeleteItem: "Supprimer cet élément",
      logItemDeleted: "[Queue] Élément supprimé:",
      queueEmptyText: "La file d'attente est vide. Glissez des fichiers HTML ou parcourez ci-dessus.",
      progressReady: "Prêt pour le rendu",
      btnStartRender: "Démarrer le rendu par lot",
      btnCancelRender: "Annuler le rendu",
      terminalTitle: "Render Stream & FFmpeg Logs",
      btnClearLog: "Clear",
      loopReady: "Boucle continue",
      oneShotReady: "Graphique One-Shot",
      pillPending: "En attente",
      pillRendering: "Rendu en cours",
      pillDone: "Terminé",
      pillError: "Erreur",
      previewFpsLabel: "FPS Aperçu",
      holdZoneTitle: "Zone de maintien d'image",
      tooltipFullscreen: "Aperçu plein écran (F / ESC)",
      logAppReady: "[System] NARA est prêt.",
      logQueueCleared: "[Queue] Tous les éléments ont été supprimés de la file d'attente.",
      logDefaultsApplied: "[Config] Paramètres globaux appliqués à tous les éléments.",
      logRenderCancelled: "[Engine] Rendu par lot annulé par l'utilisateur.",
      alertSelectValidHtml: "Seuls les fichiers .html ou .htm sont pris en charge.",
      logStudioGenerated: "[Studio] Modèle d'animation généré et ajouté à la file:",
      logStudioSaved: "[Studio] Fichier HTML enregistré avec succès:",
      logSoundActive: "[Sound] Son de notification: ACTIF (Test audio OK)",
      logSoundMuted: "[Sound] Son de notification: MUET",
      logQueueAdded: "[Queue] Ajouté à la file de rendu:",
      logTargetFolder: "[Config] Dossier de sortie cible:",
      logBatchStart: "[Batch] Démarrage du pipeline de rendu pour",
      logBatchCancelling: "[Batch] Demande d'annulation envoyée au moteur...",
      logBatchComplete: "[Batch Terminé] Total:",
      logCsvExport: "[Stock CSV Export] Métadonnées CSV exportées vers:",
      logEngineInit: "[Engine] Initialisation du rendu pour:",
      logEngineTarget: "[Engine] Résolution cible:",
      logEnginePreset: "[Engine] Préréglage de codec:",
      logEngineFfmpeg: "[Engine] Utilisation du binaire FFmpeg:",
      logEngineFrames: "[Engine] Images planifiées:",
      logEnginePiped: "[Engine] Toutes les images transmises. Fermeture de stdin FFmpeg...",
      logEngineSuccess: "[Engine] Rendu terminé avec succès:",
      logEngineFailed: "[Engine Erreur] Échec du rendu:",
      logThemeChanged: "[Theme] Thème de l'interface changé en:",
      logPresetChanged: "[Config] Préréglage de sortie modifié vers:",
      logStudioPreview: "[Studio] Aperçu en direct chargé:",
      logStudioCancel: "[Studio] Enregistrement HTML annulé."
    },
    pt: {
      soundEnabled: "Som: Ligado",
      soundDisabled: "Som: Mudo",
      themeDark: "Modo Escuro",
      themeLight: "Modo Claro",
      appTitle: "NARA",
      appSubtitle: "Pipeline Comercial em Lote 4K & ProRes 4444 Alpha",
      badgeStreamActive: "Fluxo Headless Ativo",
      badgeProresReady: "4444",
      btnOpenFolder: "Abrir Pasta de Saída",
      previewHeader: "Live Preview",
      alphaModeLabel: "Alfa:",
      alphaGrid: "Grade",
      alphaDark: "Escuro",
      alphaLight: "Claro",
      alphaGreen: "Verde",
      previewPlaceholderText: "Selecione ou arraste um arquivo de animação HTML para pré-visualização ao vivo",
      metaEditorHeading: "Editor de Metadados (Por Vídeo)",
      metaAutoSaved: "Salvo automaticamente por vídeo",
      metaTitleLabel: "Título Comercial (Title):",
      metaCategoryLabel: "Categoria (Category):",
      metaFramesLabel: "Total de Quadros:",
      metaKeywordsLabel: "Palavras-chave de Microstock (Separadas por vírgula):",
      chkSeamlessLoopTitle: "Animação em Loop Contínuo",
      chkSeamlessLoopDesc: "Renderiza quadros 0 a (Total-1) para evitar travamentos na emenda do loop",
      holdFrameLabel: "Manter Último Quadro:",
      unitFrames: "quadros",
      queueHeader: "Fila em Lote e Controles do Motor",
      dropPrimary: "Arraste e solte arquivos de animação .HTML aqui",
      dropSecondary: "ou selecione usando os botões abaixo",
      btnBrowseFiles: "Procurar Arquivos HTML",
      btnBrowseFolder: "Escanear Pasta",
      exportSettingsHeading: "Configurações Globais de Exportação",
      labelPreset: "Predefinição de Formato e Codec",
      presetProres: "MOV ProRes 4444 (Alfa Transparente)",
      presetMp44k: "MP4 Alta Taxa de Bits 4K (CRF 15 / yuv420p)",
      presetMp4Sosmed: "MP4 Redes Sociais 1080p (CRF 20 / yuv420p)",
      labelResolution: "Resolução de Renderização",
      labelFps: "Taxa de Quadros (FPS)",
      fps60: "60 FPS (Ultra Suave Stock)",
      fps30: "30 FPS (Stock Padrão)",
      fps24: "24 FPS (Cinema 24p)",
      labelGlobalFrames: "Total de Quadros Padrão (Frames)",
      labelOutputDir: "Pasta de Saída:",
      btnChangeOutputDir: "Alterar Pasta",
      queueListHeading: "Lista da Fila de Renderização",
      btnApplyDefaults: "Aplicar Padrões a Todos",
      btnClearQueue: "Limpar Tudo",
      btnDeleteItem: "Excluir este item",
      logItemDeleted: "[Queue] Item removido:",
      queueEmptyText: "A fila está vazia. Arraste arquivos HTML ou selecione acima.",
      progressReady: "Pronto para renderizar",
      btnStartRender: "Iniciar Renderização em Lote",
      btnCancelRender: "Cancelar Renderização",
      terminalTitle: "Render Stream & FFmpeg Logs",
      btnClearLog: "Clear",
      loopReady: "Loop Contínuo",
      oneShotReady: "Gráfico One-Shot",
      pillPending: "Pendente",
      pillRendering: "Renderizando",
      pillDone: "Concluído",
      pillError: "Erro",
      previewFpsLabel: "FPS Pré-visualização",
      holdZoneTitle: "Zona de Retenção de Quadro",
      tooltipFullscreen: "Pré-visualização em Tela Cheia (F / ESC)",
      logAppReady: "[System] NARA está pronto.",
      logQueueCleared: "[Queue] Todos os itens foram removidos da fila.",
      logDefaultsApplied: "[Config] Configurações padrão aplicadas a todos os itens.",
      logRenderCancelled: "[Engine] Renderização em lote cancelada pelo usuário.",
      alertSelectValidHtml: "Apenas arquivos .html ou .htm são suportados.",
      logStudioGenerated: "[Studio] Modelo de animação gerado e adicionado à fila:",
      logStudioSaved: "[Studio] Arquivo HTML salvo com sucesso:",
      logSoundActive: "[Sound] Som de notificação: ATIVO (Teste de áudio OK)",
      logSoundMuted: "[Sound] Som de notificação: MUDO",
      logQueueAdded: "[Queue] Adicionado à fila:",
      logTargetFolder: "[Config] Pasta de saída de destino:",
      logBatchStart: "[Batch] Iniciando pipeline de renderização para",
      logBatchCancelling: "[Batch] Solicitação de cancelamento enviada ao motor...",
      logBatchComplete: "[Batch Concluído] Total:",
      logCsvExport: "[Stock CSV Export] Metadados CSV exportados para:",
      logEngineInit: "[Engine] Inicializando renderização para:",
      logEngineTarget: "[Engine] Resolução alvo:",
      logEnginePreset: "[Engine] Predefinição de codec:",
      logEngineFfmpeg: "[Engine] Usando binário FFmpeg:",
      logEngineFrames: "[Engine] Quadros planejados:",
      logEnginePiped: "[Engine] Todos os quadros canalizados. Fechando stdin do FFmpeg...",
      logEngineSuccess: "[Engine] Renderização concluída com sucesso:",
      logEngineFailed: "[Engine Erro] Falha na renderização:",
      logThemeChanged: "[Theme] Tema da interface alterado para:",
      logPresetChanged: "[Config] Predefinição de saída alterada para:",
      logStudioPreview: "[Studio] Pré-visualização ao vivo carregada:",
      logStudioCancel: "[Studio] Salvamento de HTML cancelado."
    },
    ru: {
      soundEnabled: "Звук: Вкл",
      soundDisabled: "Звук: Выкл",
      themeDark: "Тёмная тема",
      themeLight: "Светлая тема",
      appTitle: "NARA",
      appSubtitle: "Пакетный пайплайн коммерческого видео 4K и ProRes 4444 Alpha",
      badgeStreamActive: "Headless-поток активен",
      badgeProresReady: "4444",
      btnOpenFolder: "Открыть папку вывода",
      previewHeader: "Live Preview",
      alphaModeLabel: "Альфа:",
      alphaGrid: "Сетка",
      alphaDark: "Тёмный",
      alphaLight: "Светлый",
      alphaGreen: "Зеленый",
      previewPlaceholderText: "Выберите или перетащите HTML-файл анимации для предпросмотра",
      metaEditorHeading: "Редактор метаданных (Для каждого видео)",
      metaAutoSaved: "Автосохранение для каждого видео",
      metaTitleLabel: "Коммерческое название (Title):",
      metaCategoryLabel: "Категория (Category):",
      metaFramesLabel: "Всего кадров:",
      metaKeywordsLabel: "Ключевые слова для стоков (Через запятую):",
      chkSeamlessLoopTitle: "Бесшовное зацикливание (Seamless Loop)",
      chkSeamlessLoopDesc: "Рендеринг кадров 0 до (Total-1) для предотвращения микрофризов на стыке",
      holdFrameLabel: "Удержание последнего кадра:",
      unitFrames: "кадров",
      queueHeader: "Очередь рендеринга и управление",
      dropPrimary: "Перетащите файлы анимации .HTML сюда",
      dropSecondary: "или выберите с помощью кнопок ниже",
      btnBrowseFiles: "Выбрать HTML файлы",
      btnBrowseFolder: "Сканировать папку",
      exportSettingsHeading: "Глобальные настройки экспорта",
      labelPreset: "Пресет формата и кодека",
      presetProres: "MOV ProRes 4444 (Прозрачный Alpha-канал)",
      presetMp44k: "MP4 Высокий битрейт 4K (CRF 15 / yuv420p)",
      presetMp4Sosmed: "MP4 Для соцсетей 1080p (CRF 20 / yuv420p)",
      labelResolution: "Разрешение рендеринга",
      labelFps: "Частота кадров (FPS)",
      fps60: "60 FPS (Ультра-плавный сток)",
      fps30: "30 FPS (Стандартный сток)",
      fps24: "24 FPS (Кинематографичный 24p)",
      labelGlobalFrames: "Всего кадров по умолчанию",
      labelOutputDir: "Папка вывода:",
      btnChangeOutputDir: "Изменить",
      queueListHeading: "Список очереди рендеринга",
      btnApplyDefaults: "Применить настройки ко всем",
      btnClearQueue: "Очистить всё",
      btnDeleteItem: "Удалить этот элемент",
      logItemDeleted: "[Queue] Элемент удалён:",
      queueEmptyText: "Очередь пуста. Перетащите HTML файлы или нажмите кнопку выше.",
      progressReady: "Готов к рендерингу",
      btnStartRender: "Начать пакетный рендеринг",
      btnCancelRender: "Отменить рендеринг",
      terminalTitle: "Render Stream & FFmpeg Logs",
      btnClearLog: "Clear",
      loopReady: "Бесшовный цикл",
      oneShotReady: "Одиночная анимация",
      pillPending: "В очереди",
      pillRendering: "Рендеринг",
      pillDone: "Готово",
      pillError: "Ошибка",
      previewFpsLabel: "FPS Предпросмотр",
      holdZoneTitle: "Зона удержания кадра",
      tooltipFullscreen: "Полноэкранный предпросмотр (F / ESC)",
      logAppReady: "[System] NARA готов к работе.",
      logQueueCleared: "[Queue] Все элементы удалены из очереди.",
      logDefaultsApplied: "[Config] Глобальные настройки применены ко всем элементам.",
      logRenderCancelled: "[Engine] Пакетный рендеринг отменён пользователем.",
      alertSelectValidHtml: "Поддерживаются только файлы .html или .htm.",
      logStudioGenerated: "[Studio] Шаблон анимации сгенерирован и добавлен в очередь:",
      logStudioSaved: "[Studio] HTML файл успешно сохранён:",
      logSoundActive: "[Sound] Звук завершения: ВКЛ (Аудиотест пройден)",
      logSoundMuted: "[Sound] Звук завершения: ВЫКЛ (Без звука)",
      logQueueAdded: "[Queue] Добавлено в очередь:",
      logTargetFolder: "[Config] Целевая папка вывода:",
      logBatchStart: "[Batch] Запуск конвейера рендеринга для",
      logBatchCancelling: "[Batch] Запрос на отмену отправлен в движок...",
      logBatchComplete: "[Batch Завершён] Всего:",
      logCsvExport: "[Stock CSV Export] CSV-метаданные экспортированы в:",
      logEngineInit: "[Engine] Инициализация рендеринга для:",
      logEngineTarget: "[Engine] Целевое разрешение:",
      logEnginePreset: "[Engine] Пресет кодека:",
      logEngineFfmpeg: "[Engine] Используется бинарник FFmpeg:",
      logEngineFrames: "[Engine] Запланировано кадров:",
      logEnginePiped: "[Engine] Все кадры переданы. Закрытие stdin FFmpeg...",
      logEngineSuccess: "[Engine] Рендеринг успешно завершён:",
      logEngineFailed: "[Engine Ошибка] Ошибка рендеринга:",
      logThemeChanged: "[Theme] Тема интерфейса изменена на:",
      logPresetChanged: "[Config] Пресет вывода изменён на:",
      logStudioPreview: "[Studio] Предпросмотр загружен:",
      logStudioCancel: "[Studio] Сохранение HTML отменено."
    },
    ko: {
      soundEnabled: "알림음: 켜짐",
      soundDisabled: "알림음: 음소거",
      themeDark: "다크 모드",
      themeLight: "라이트 모드",
      appTitle: "NARA",
      appSubtitle: "상업용 4K & ProRes 4444 알파 배치 렌더링 파이프라인",
      badgeStreamActive: "헤드리스 스트림 활성",
      badgeProresReady: "4444",
      btnOpenFolder: "출력 폴더 열기",
      previewHeader: "Live Preview",
      alphaModeLabel: "알파:",
      alphaGrid: "그리드",
      alphaDark: "어두움",
      alphaLight: "밝음",
      alphaGreen: "그린",
      previewPlaceholderText: "실시간 미리보기를 위해 HTML 애니메이션 파일을 선택하거나 드래그하세요",
      metaEditorHeading: "메타데이터 편집기 (동영상별)",
      metaAutoSaved: "동영상별 자동 저장됨",
      metaTitleLabel: "상업용 제목 (Title):",
      metaCategoryLabel: "카테고리 (Category):",
      metaFramesLabel: "총 프레임:",
      metaKeywordsLabel: "마이크로스톡 키워드 (쉼표로 구분):",
      chkSeamlessLoopTitle: "끊김 없는 루프 애니메이션 (Seamless Loop)",
      chkSeamlessLoopDesc: "루프 연결부의 미세 멈춤을 방지하기 위해 0부터 (Total-1) 프레임까지 렌더링",
      holdFrameLabel: "마지막 프레임 유지:",
      unitFrames: "프레임",
      queueHeader: "배치 대기열 및 엔진 제어",
      dropPrimary: ".HTML 애니메이션 파일을 여기에 드래그 앤 드롭",
      dropSecondary: "또는 아래 버튼으로 선택",
      btnBrowseFiles: "HTML 파일 선택",
      btnBrowseFolder: "폴더 스캔",
      exportSettingsHeading: "전역 내보내기 설정",
      labelPreset: "포맷 및 코덱 프리셋",
      presetProres: "MOV ProRes 4444 (투명 알파 채널)",
      presetMp44k: "MP4 고비트레이트 4K (CRF 15 / yuv420p)",
      presetMp4Sosmed: "MP4 소셜미디어 1080p (CRF 20 / yuv420p)",
      labelResolution: "렌더링 해상도",
      labelFps: "프레임 레이트 (FPS)",
      fps60: "60 FPS (초고화질 스톡)",
      fps30: "30 FPS (표준 스톡)",
      fps24: "24 FPS (영화 같은 24p)",
      labelGlobalFrames: "기본 총 프레임 수",
      labelOutputDir: "출력 폴더:",
      btnChangeOutputDir: "폴더 변경",
      queueListHeading: "렌더링 대기열 목록",
      btnApplyDefaults: "모든 항목에 기본값 적용",
      btnClearQueue: "모두 삭제",
      btnDeleteItem: "이 항목 삭제",
      logItemDeleted: "[Queue] 항목 삭제됨:",
      queueEmptyText: "대기열이 비어 있습니다. HTML 파일을 드래그하거나 위 버튼으로 선택하세요.",
      progressReady: "렌더링 준비 완료",
      btnStartRender: "배치 렌더링 시작",
      btnCancelRender: "렌더링 취소",
      terminalTitle: "Render Stream & FFmpeg Logs",
      btnClearLog: "Clear",
      loopReady: "심리스 루프",
      oneShotReady: "원샷 그래픽",
      pillPending: "대기 중",
      pillRendering: "렌더링 중",
      pillDone: "완료",
      pillError: "오류",
      previewFpsLabel: "FPS 미리보기",
      holdZoneTitle: "프레임 유지 구역",
      tooltipFullscreen: "전체 화면 미리보기 (F / ESC)",
      logAppReady: "[System] NARA 준비 완료.",
      logQueueCleared: "[Queue] 대기열의 모든 항목이 삭제되었습니다.",
      logDefaultsApplied: "[Config] 모든 항목에 전역 기본 설정이 적용되었습니다.",
      logRenderCancelled: "[Engine] 사용자가 배치 렌더링을 취소했습니다.",
      alertSelectValidHtml: ".html 또는 .htm 파일만 지원됩니다.",
      logStudioGenerated: "[Studio] 애니메이션 템플릿 생성 및 대기열 추가:",
      logStudioSaved: "[Studio] HTML 파일이 성공적으로 저장되었습니다:",
      logSoundActive: "[Sound] 완료 알림음: 켜짐 (오디오 테스트 완료)",
      logSoundMuted: "[Sound] 완료 알림음: 음소거",
      logQueueAdded: "[Queue] 대기열에 추가됨:",
      logTargetFolder: "[Config] 대상 출력 폴더:",
      logBatchStart: "[Batch] 렌더링 파이프라인 시작:",
      logBatchCancelling: "[Batch] 엔진에 취소 요청 전송 중...",
      logBatchComplete: "[Batch 완료] 총:",
      logCsvExport: "[Stock CSV 내보내기] 스톡 메타데이터 CSV 저장 경로:",
      logEngineInit: "[Engine] 렌더링 초기화 중:",
      logEngineTarget: "[Engine] 목표 해상도:",
      logEnginePreset: "[Engine] 코덱 프리셋:",
      logEngineFfmpeg: "[Engine] FFmpeg 바이너리 사용:",
      logEngineFrames: "[Engine] 계획된 프레임:",
      logEnginePiped: "[Engine] 모든 프레임 파이프 전달 완료. FFmpeg stdin 닫는 중...",
      logEngineSuccess: "[Engine] 렌더링이 성공적으로 완료되었습니다:",
      logEngineFailed: "[Engine 오류] 렌더링 실패:",
      logThemeChanged: "[Theme] UI 테마가 변경되었습니다:",
      logPresetChanged: "[Config] 출력 프리셋 변경:",
      logStudioPreview: "[Studio] 실시간 미리보기 로드됨:",
      logStudioCancel: "[Studio] HTML 저장이 취소되었습니다."
    }
  };

  let currentLang = localStorage.getItem('mse_language') || 'en';

  function applyLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('mse_language', lang);
    const dict = Object.assign({}, translations.en, translations[lang] || translations.id);

    // Update all elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = dict[key];
        } else {
          el.textContent = dict[key];
        }
      }
    });

    // Update select element options that have data-i18n
    document.querySelectorAll('option[data-i18n]').forEach((opt) => {
      const key = opt.getAttribute('data-i18n');
      if (dict[key]) opt.textContent = dict[key];
    });

    // Update all elements with data-i18n-title
    document.querySelectorAll('[data-i18n-title]').forEach((el) => {
      const key = el.getAttribute('data-i18n-title');
      if (dict[key]) el.title = dict[key];
    });

        const themeToggleLabel = document.getElementById("themeToggleLabel");
    if (themeToggleLabel) {
      themeToggleLabel.textContent = currentTheme === "light" ? dict.themeLight : dict.themeDark;
    }

        updateSoundToggleUI();

    if (btnFullscreenPreview && dict.tooltipFullscreen) {
      btnFullscreenPreview.title = dict.tooltipFullscreen;
    }

    updateQueueDisplay();
    updatePlaybackDisplay();

    // Re-translate all terminal log lines (initial and dynamic logs)
    const terminalLogsEl = document.getElementById('terminalLogs');
    if (terminalLogsEl) {
      terminalLogsEl.querySelectorAll('.log-line').forEach((line) => {
        const logKey = line.dataset.logKey || line.getAttribute('data-i18n');
        if (logKey && dict[logKey]) {
          const param = line.dataset.logParam || '';
          line.textContent = param ? `${dict[logKey]} ${param}` : dict[logKey];
        }
      });
    }
  }

  // ==========================================================================
  // State Management
  // ==========================================================================

  const state = {
    queue: [], // Array<{ id, filePath, filename, metadata, status, progress, outputPath, error }>
    activePreviewIndex: -1,
    activeStudioItem: null,
    currentOutputDirectory: '',
    isPlaying: false,
    currentFrame: 0,
    fps: 60,
    activeBgMode: 'checkerboard',
    isRendering: false,
    playInterval: null
  };

  // ==========================================================================
  // DOM Elements
  // ==========================================================================

  const selectAppLanguage = document.getElementById('selectAppLanguage');
  const btnOpenOutputDir = document.getElementById('btnOpenOutputDir');
  const terminalLogs = document.getElementById('terminalLogs');
  const btnClearLog = document.getElementById('btnClearLog');

  // Preview Stage
  const previewStageContainer = document.getElementById('previewStageContainer');
  const previewAspectBox = document.getElementById('previewAspectBox');
  const previewViewport = document.getElementById('previewViewport');
  const previewIframe = document.getElementById('previewIframe');
  const previewPlaceholder = document.getElementById('previewPlaceholder');
  const previewResolutionTag = document.getElementById('previewResolutionTag');
  const alphaToggleGroup = document.getElementById('alphaToggleGroup');
  const btnFullscreenPreview = document.getElementById('btnFullscreenPreview');
  const iconEnterFullscreen = document.getElementById('iconEnterFullscreen');
  const iconExitFullscreen = document.getElementById('iconExitFullscreen');
  const btnExitFloatingFullscreen = document.getElementById('btnExitFloatingFullscreen');

  // Playback Controls
  const frameScrubber = document.getElementById('frameScrubber');
  const holdIndicatorZone = document.getElementById('holdIndicatorZone');
  const currentTimecode = document.getElementById('currentTimecode');
  const totalTimecode = document.getElementById('totalTimecode');
  const btnPlayPause = document.getElementById('btnPlayPause');
  const iconPlay = document.getElementById('iconPlay');
  const iconPause = document.getElementById('iconPause');
  const btnRestart = document.getElementById('btnRestart');
  const btnStepPrev = document.getElementById('btnStepPrev');
  const btnStepNext = document.getElementById('btnStepNext');
  const previewFpsText = document.getElementById('previewFpsText');
  const previewModeTag = document.getElementById('previewModeTag');
  const playbackDot = document.getElementById('playbackDot');

  // Per-Video Metadata Editor
  const metadataCard = document.getElementById('metadataCard');
  const metaTypeBadge = document.getElementById('metaTypeBadge');
  const metaActiveFileTitle = document.getElementById('metaActiveFileTitle');
  const metaTitleInput = document.getElementById('metaTitleInput');
  const metaCategoryInput = document.getElementById('metaCategoryInput');
  const metaFramesInput = document.getElementById('metaFramesInput');
  const metaKeywordsInput = document.getElementById('metaKeywordsInput');
  const metaChkLoop = document.getElementById('metaChkLoop');
  const metaHoldFrameContainer = document.getElementById('metaHoldFrameContainer');
  const metaHoldFrameInput = document.getElementById('metaHoldFrameInput');

  // Tab Switching & Studio Generator Mode Elements
  const tabQueueMode = document.getElementById('tabQueueMode');
  const tabStudioMode = document.getElementById('tabStudioMode');
  const viewQueueContainer = document.getElementById('viewQueueContainer');
  const viewStudioContainer = document.getElementById('viewStudioContainer');
  const studioCategoryGrid = document.getElementById('studioCategoryGrid');
  const studioCategoryLabelName = document.getElementById('studioCategoryLabelName');
  const studioDynamicFields = document.getElementById('studioDynamicFields');
  const studioFramesInput = document.getElementById('studioFramesInput');
  const studioChkAlpha = document.getElementById('studioChkAlpha');
  const btnStudioPreview = document.getElementById('btnStudioPreview');
  const btnStudioSaveHtml = document.getElementById('btnStudioSaveHtml');
  const btnStudioGenerateQueue = document.getElementById('btnStudioGenerateQueue');

  // Queue & Global Controls
  const dropZone = document.getElementById('dropZone');
  const btnBrowseFiles = document.getElementById('btnBrowseFiles');
  const btnBrowseFolder = document.getElementById('btnBrowseFolder');
  const queueSummaryBadge = document.getElementById('queueSummaryBadge');
  const queueItemsList = document.getElementById('queueItemsList');
  const btnClearQueue = document.getElementById('btnClearQueue');
  const btnApplyDefaultsToAll = document.getElementById('btnApplyDefaultsToAll');

  // Global Settings
  const selectPreset = document.getElementById('selectPreset');
  const selectResolution = document.getElementById('selectResolution');
  const selectFps = document.getElementById('selectFps');
  const outputDirPath = document.getElementById('outputDirPath');
  const btnChangeOutputDir = document.getElementById('btnChangeOutputDir');

  // Execution
  const btnStartRender = document.getElementById('btnStartRender');
  const btnCancelRender = document.getElementById('btnCancelRender');
  const batchProgressBar = document.getElementById('batchProgressBar');
  const batchProgressText = document.getElementById('batchProgressText');
  const batchPercentText = document.getElementById('batchPercentText');

  // ==========================================================================
  // Helper & Logging Functions
  // ==========================================================================

  function t(key) {
    const dict = Object.assign({}, translations.en, translations[currentLang] || translations.id);
    return dict[key] || key;
  }

  function addTerminalLog(message, type = 'normal', i18nKey = null, param = '') {
    const line = document.createElement('div');
    line.className = `log-line ${type}`;
    if (i18nKey) {
      line.dataset.logKey = i18nKey;
      line.dataset.logParam = param || '';
      line.textContent = param ? `${t(i18nKey)} ${param}` : t(i18nKey);
    } else {
      line.textContent = message;
    }
    terminalLogs.appendChild(line);
    terminalLogs.scrollTop = terminalLogs.scrollHeight;
  }

  /**
   * Format frame indicator
   */
  function formatTime(frame, fps) {
    return `Frame: ${frame}`;
  }

  // ==========================================================================
  // Initialize Defaults & Language
  // ==========================================================================

  // ==========================================================================
  // Neumorphism Theme Management (Soft UI Dark / Light Mode)
  // ==========================================================================

  let currentTheme = localStorage.getItem('nara_theme') || 'dark';
  const btnThemeToggle = document.getElementById('btnThemeToggle');
  const themeToggleLabel = document.getElementById('themeToggleLabel');

  function applyTheme(theme) {
    currentTheme = theme;
    localStorage.setItem('nara_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);

    if (btnThemeToggle) {
      if (theme === 'light') {
        btnThemeToggle.classList.add('is-light');
        btnThemeToggle.classList.remove('is-dark');
      } else {
        btnThemeToggle.classList.add('is-dark');
        btnThemeToggle.classList.remove('is-light');
      }
    }
    if (themeToggleLabel) {
      themeToggleLabel.textContent = theme === 'light' ? t('themeLight') : t('themeDark');
    }
  }

  if (btnThemeToggle) {
    btnThemeToggle.addEventListener('click', () => {
      const targetTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(targetTheme);
      const themeLabel = targetTheme === 'light' ? t('themeLight') : t('themeDark');
      addTerminalLog('', 'normal', 'logThemeChanged', themeLabel);
    });
  }

  applyTheme(currentTheme);

  // ==========================================================================
  // Render Completion Audio Synthesizer (Web Audio API - 100% Offline)
  // ==========================================================================

  let isSoundEnabled = localStorage.getItem('nara_sound_enabled') !== 'false'; // Default enabled
  let audioCtx = null;

  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  }

  /**
   * Play crystal clear, harmonic chime when batch render finishes
   * @param {'success' | 'warning'} type
   */
  function playNotificationSound(type = 'success') {
    if (!isSoundEnabled) return;

    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      if (type === 'success') {
        // Uplifting 4-tone harmonic arpeggio (C5 -> E5 -> G5 -> C6)
        const notes = [
          { freq: 523.25, time: 0.00, dur: 0.35, gain: 0.22 }, // C5
          { freq: 659.25, time: 0.11, dur: 0.40, gain: 0.28 }, // E5
          { freq: 783.99, time: 0.22, dur: 0.45, gain: 0.32 }, // G5
          { freq: 1046.50, time: 0.34, dur: 0.70, gain: 0.38 } // C6
        ];

        notes.forEach(({ freq, time, dur, gain: targetGain }) => {
          const osc = ctx.createOscillator();
          const gainNode = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + time);

          // Smooth envelope: soft attack, exponential decay release
          gainNode.gain.setValueAtTime(0.0001, now + time);
          gainNode.gain.exponentialRampToValueAtTime(targetGain, now + time + 0.02);
          gainNode.gain.exponentialRampToValueAtTime(0.0001, now + time + dur);

          osc.connect(gainNode);
          gainNode.connect(ctx.destination);

          osc.start(now + time);
          osc.stop(now + time + dur + 0.05);
        });
      } else {
        // Warning chime: double alert tone
        const notes = [
          { freq: 440.00, time: 0.00, dur: 0.25, gain: 0.25 },
          { freq: 349.23, time: 0.14, dur: 0.40, gain: 0.25 }
        ];

        notes.forEach(({ freq, time, dur, gain: targetGain }) => {
          const osc = ctx.createOscillator();
          const gainNode = ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + time);

          gainNode.gain.setValueAtTime(0.0001, now + time);
          gainNode.gain.exponentialRampToValueAtTime(targetGain, now + time + 0.02);
          gainNode.gain.exponentialRampToValueAtTime(0.0001, now + time + dur);

          osc.connect(gainNode);
          gainNode.connect(ctx.destination);

          osc.start(now + time);
          osc.stop(now + time + dur + 0.05);
        });
      }
    } catch (e) {
      console.warn('AudioContext notification error:', e);
    }
  }

  function updateSoundToggleUI() {
    const btn = document.getElementById('btnSoundToggle');
    if (!btn) return;
    const label = document.getElementById('soundToggleLabel');

    const iconOn = btn.querySelector('.icon-sound-on');
    const iconOff = btn.querySelector('.icon-sound-off');
    const dict = Object.assign({}, translations.en, translations[currentLang] || translations.id);

    if (isSoundEnabled) {
      btn.classList.remove('is-muted');
      btn.classList.add('is-enabled');
      if (iconOn) iconOn.style.display = 'inline-flex';
      if (iconOff) iconOff.style.display = 'none';
      if (label) label.textContent = dict.soundEnabled || 'Sound: On';
      btn.title = dict.soundEnabled ? `Sound Notification (${dict.soundEnabled})` : 'Sound Notification (Active)';
    } else {
      btn.classList.add('is-muted');
      btn.classList.remove('is-enabled');
      if (iconOn) iconOn.style.display = 'none';
      if (iconOff) iconOff.style.display = 'inline-flex';
      if (label) label.textContent = dict.soundDisabled || 'Sound: Mute';
      btn.title = dict.soundDisabled ? `Sound Notification (${dict.soundDisabled})` : 'Sound Notification (Muted)';
    }
  }

  const btnSoundToggle = document.getElementById('btnSoundToggle');
  if (btnSoundToggle) {
    btnSoundToggle.addEventListener('click', () => {
      isSoundEnabled = !isSoundEnabled;
      localStorage.setItem('nara_sound_enabled', String(isSoundEnabled));
      updateSoundToggleUI();
      if (isSoundEnabled) {
        playNotificationSound('success');
        addTerminalLog('', 'info', 'logSoundActive');
      } else {
        addTerminalLog('', 'info', 'logSoundMuted');
      }
    });
  }

  updateSoundToggleUI();

  const btnHideToTray = document.getElementById('btnHideToTray');
  if (btnHideToTray) {
    btnHideToTray.addEventListener('click', async () => {
      if (window.api && window.api.hideToTray) {
        addTerminalLog('', 'info', 'logHiddenToTray');
        await window.api.hideToTray();
      }
    });
  }

  selectAppLanguage.value = currentLang;
  applyLanguage(currentLang);

  selectAppLanguage.addEventListener('change', (e) => {
    applyLanguage(e.target.value);
  });

  try {
    state.currentOutputDirectory = await window.api.getDefaultOutputDir();
    outputDirPath.textContent = state.currentOutputDirectory;
    outputDirPath.title = state.currentOutputDirectory;
  } catch (err) {
    outputDirPath.textContent = 'C:\\Nara Motions';
  }

  updateAlphaToggleVisibility();
  setAlphaBgMode(state.activeBgMode || 'checkerboard');

  // ==========================================================================
  // Global Settings Controls
  // ==========================================================================

  selectFps.addEventListener('change', () => {
    const fps = parseInt(selectFps.value, 10) || 60;
    state.fps = fps;
    previewFpsText.textContent = `${fps} ${t('previewFpsLabel')}`;

    let currentW = 3840;
    let currentH = 2160;

    // Update active video if present
    if (state.activePreviewIndex >= 0 && state.queue[state.activePreviewIndex]) {
      const activeItem = state.queue[state.activePreviewIndex];
      activeItem.metadata.fps = fps;
      currentW = activeItem.metadata.width || 3840;
      currentH = activeItem.metadata.height || 2160;
      updatePlaybackRange();
    } else if (state.activeStudioItem) {
      state.activeStudioItem.metadata.fps = fps;
      currentW = state.activeStudioItem.metadata.width || 3840;
      currentH = state.activeStudioItem.metadata.height || 2160;
      updatePlaybackRange();
    } else {
      const [w, h] = selectResolution.value.split('x').map(Number);
      currentW = w || 3840;
      currentH = h || 2160;
    }

    updatePreviewAspectRatio(currentW, currentH);

    // If currently playing, restart interval with new speed
    if (state.isPlaying) {
      clearInterval(state.playInterval);
      const intervalMs = 1000 / state.fps;
      state.playInterval = setInterval(() => {
        let cycleFrames = 180;
        let isLoop = true;
        let holdFrames = 0;
        if (state.activePreviewIndex >= 0 && state.queue[state.activePreviewIndex]) {
          const item = state.queue[state.activePreviewIndex];
          const meta = item.metadata;
          cycleFrames = meta.totalFrames || 180;
          isLoop = meta.isSeamlessLoop !== false;
          holdFrames = isLoop ? 0 : (meta.holdLastFrames || 0);
        } else if (state.activeStudioItem) {
          cycleFrames = state.activeStudioItem.metadata.totalFrames || 180;
          isLoop = true;
          holdFrames = 0;
        }
        const totalPlaybackFrames = cycleFrames + holdFrames;

        let nextFrame = state.currentFrame + 1;
        if (nextFrame >= totalPlaybackFrames) {
          nextFrame = 0;
        }
        seekToFrame(nextFrame);
      }, intervalMs);
    } else {
      seekToFrame(state.currentFrame);
    }

    updateQueueDisplay();
  });

  // Preset Format & Codec Change Listener
  selectPreset.addEventListener('change', () => {
    const newPreset = selectPreset.value;
    updateAlphaToggleVisibility();
    state.queue.forEach((item) => {
      item.metadata.preset = newPreset;
    });
    const presetLabel = newPreset === 'prores4444'
      ? t('presetProres')
      : (newPreset === 'mp4_4k' ? t('presetMp44k') : t('presetMp4Sosmed'));
    addTerminalLog('', 'info', 'logPresetChanged', presetLabel);
  });

  // Apply Defaults to All items in queue (Preset, Resolution, FPS - frames follow each file)
  btnApplyDefaultsToAll.addEventListener('click', () => {
    if (state.queue.length === 0) return;
    const fps = parseInt(selectFps.value, 10) || 60;
    const [w, h] = selectResolution.value.split('x').map(Number);
    const preset = selectPreset.value;

    state.queue.forEach((item) => {
      item.metadata.fps = fps;
      // Total frames is NOT overridden; it strictly follows each file's metadata
      item.metadata.width = w;
      item.metadata.height = h;
      item.metadata.preset = preset;
      item.metadata.bgMode = state.activeBgMode;
    });

    if (state.activePreviewIndex >= 0) {
      loadActiveVideoToEditor(state.activePreviewIndex);
    }
    updateQueueDisplay();
    addTerminalLog('', 'info', 'logDefaultsApplied');
  });

  // ==========================================================================
  // Alpha Inspection & Background Render Mode Controller
  // ==========================================================================

  function updateAlphaToggleVisibility() {
    if (!alphaToggleGroup) return;
    let activePreset = selectPreset.value;
    if (state.activePreviewIndex >= 0 && state.queue[state.activePreviewIndex]) {
      const item = state.queue[state.activePreviewIndex];
      activePreset = item.metadata.preset || activePreset;
    }
    const isProResAlpha = (activePreset === 'prores4444' || activePreset === 'prores' || activePreset === 'mov');
    
    // Background toggle group stays visible for all presets
    alphaToggleGroup.style.display = 'inline-flex';

    // Transparency / Grid button only appears if ProRes 4444 is selected
    const gridBtn = alphaToggleGroup.querySelector('[data-bg="checkerboard"]');
    if (gridBtn) {
      gridBtn.style.display = isProResAlpha ? 'inline-flex' : 'none';
    }

    // If not ProRes 4444 and checkerboard was selected, automatically fallback to dark background
    if (!isProResAlpha && state.activeBgMode === 'checkerboard') {
      setAlphaBgMode('dark');
    }
  }

  function setAlphaBgMode(bgMode) {
    let mode = bgMode || 'checkerboard';
    let activePreset = selectPreset.value;
    if (state.activePreviewIndex >= 0 && state.queue[state.activePreviewIndex]) {
      const item = state.queue[state.activePreviewIndex];
      activePreset = item.metadata.preset || activePreset;
    }
    const isProResAlpha = (activePreset === 'prores4444' || activePreset === 'prores' || activePreset === 'mov');
    if (!isProResAlpha && mode === 'checkerboard') {
      mode = 'dark';
    }

    state.activeBgMode = mode;

    if (alphaToggleGroup) {
      alphaToggleGroup.querySelectorAll('.toggle-btn').forEach((b) => {
        if (b.dataset.bg === mode) {
          b.classList.add('active');
        } else {
          b.classList.remove('active');
        }
      });
    }

    if (previewViewport) {
      previewViewport.classList.remove('checkerboard', 'bg-dark', 'bg-light', 'bg-green');
      if (mode === 'checkerboard') {
        previewViewport.classList.add('checkerboard');
      } else if (mode === 'dark') {
        previewViewport.classList.add('bg-dark');
      } else if (mode === 'light') {
        previewViewport.classList.add('bg-light');
      } else if (mode === 'green') {
        previewViewport.classList.add('bg-green');
      }
    }

    if (state.activePreviewIndex >= 0 && state.queue[state.activePreviewIndex]) {
      state.queue[state.activePreviewIndex].metadata.bgMode = mode;
    }
  }

  if (alphaToggleGroup) {
    alphaToggleGroup.querySelectorAll('.toggle-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const bg = btn.dataset.bg || 'checkerboard';
        setAlphaBgMode(bg);
      });
    });
  }

  // ==========================================================================
  // 1:1 Aspect Ratio Match & Live Preview Player
  // ==========================================================================

  function updatePreviewAspectRatio(width, height) {
    const w = Number(width) || 3840;
    const h = Number(height) || 2160;
    const aspect = w / h;

    // Constrain aspect box inside preview container
    const container = previewStageContainer.getBoundingClientRect();
    const pad = 24;
    const maxW = Math.max(100, (container.width || 600) - pad);
    const maxH = Math.max(100, (container.height || 360) - pad);

    let targetW = maxW;
    let targetH = targetW / aspect;

    if (targetH > maxH) {
      targetH = maxH;
      targetW = targetH * aspect;
    }

    targetW = Math.round(targetW);
    targetH = Math.round(targetH);

    previewAspectBox.style.width = `${targetW}px`;
    previewAspectBox.style.height = `${targetH}px`;
    previewAspectBox.style.aspectRatio = `${w} / ${h}`;

    // Fit and center preview iframe perfectly at native resolution with GPU scale transform
    if (previewIframe) {
      const scale = targetW / w;
      previewIframe.style.width = `${w}px`;
      previewIframe.style.height = `${h}px`;
      previewIframe.style.transform = `translate(-50%, -50%) scale(${scale})`;
    }

    // Ratio label calculation
    let ratioLabel = `${w}:${h}`;
    if (Math.abs(aspect - 16 / 9) < 0.05) {
      ratioLabel = '16:9';
    } else if (Math.abs(aspect - 9 / 16) < 0.05) {
      ratioLabel = '9:16';
    } else if (Math.abs(aspect - 1) < 0.02) {
      ratioLabel = '1:1';
    } else if (Math.abs(aspect - 4 / 3) < 0.05) {
      ratioLabel = '4:3';
    } else if (Math.abs(aspect - 21 / 9) < 0.05) {
      ratioLabel = '21:9';
    }

    // Scale overlay tag
    previewResolutionTag.textContent = `${w}x${h} (${ratioLabel}) | ${state.fps} FPS`;
  }

  window.addEventListener('resize', () => {
    if (state.activePreviewIndex >= 0 && state.queue[state.activePreviewIndex]) {
      const item = state.queue[state.activePreviewIndex];
      updatePreviewAspectRatio(item.metadata.width || 3840, item.metadata.height || 2160);
    } else if (state.activeStudioItem) {
      updatePreviewAspectRatio(state.activeStudioItem.metadata.width || 3840, state.activeStudioItem.metadata.height || 2160);
    } else {
      const [w, h] = selectResolution.value.split('x').map(Number);
      updatePreviewAspectRatio(w || 3840, h || 2160);
    }
  });

  selectResolution.addEventListener('change', () => {
    const [w, h] = selectResolution.value.split('x').map(Number);
    if (state.activePreviewIndex >= 0 && state.queue[state.activePreviewIndex]) {
      const item = state.queue[state.activePreviewIndex];
      item.metadata.width = w;
      item.metadata.height = h;
      updatePreviewAspectRatio(w, h);
      seekToFrame(state.currentFrame);
      updateQueueDisplay();
    } else if (state.activeStudioItem) {
      state.activeStudioItem.metadata.width = w;
      state.activeStudioItem.metadata.height = h;
      updatePreviewAspectRatio(w, h);
      seekToFrame(state.currentFrame);
    } else {
      updatePreviewAspectRatio(w, h);
    }

    if (previewIframe && previewIframe.contentWindow) {
      try {
        previewIframe.contentWindow.dispatchEvent(new Event('resize'));
      } catch (e) {}
    }
  });

  // ==========================================================================
  // Per-Video Metadata Interactive Editor Sync
  // ==========================================================================

  function loadActiveVideoToEditor(index) {
    if (index < 0 || index >= state.queue.length) {
      metadataCard.style.opacity = '0.5';
      return;
    }
    metadataCard.style.opacity = '1';
    const item = state.queue[index];
    const meta = item.metadata;

    metaActiveFileTitle.textContent = `${meta.title || item.filename}`;
    metaActiveFileTitle.title = item.filePath;
    metaTitleInput.value = meta.title || '';
    metaCategoryInput.value = meta.category || 'Motion Graphics & Backgrounds';

    metaFramesInput.value = meta.totalFrames || 180;

    const kw = Array.isArray(meta.keywords) ? meta.keywords.join(', ') : (meta.keywords || '');
    metaKeywordsInput.value = kw;

    metaChkLoop.checked = meta.isSeamlessLoop !== false;
    metaHoldFrameContainer.style.display = metaChkLoop.checked ? 'none' : 'flex';
    metaHoldFrameInput.value = meta.holdLastFrames !== undefined ? meta.holdLastFrames : 30;

    metaTypeBadge.textContent = metaChkLoop.checked ? t('loopReady') : t('oneShotReady');
    metaTypeBadge.className = `meta-tag ${metaChkLoop.checked ? 'badge-loop' : 'badge-oneshot'}`;
    previewModeTag.textContent = metaChkLoop.checked ? '[LOOP]' : '[ONE-SHOT]';
    previewModeTag.className = `preview-mode-tag ${metaChkLoop.checked ? 'badge-loop' : 'badge-oneshot'}`;

    // Synchronize resolution dropdown and preview aspect ratio to HTML metadata if present
    if (meta.width && meta.height) {
      const resVal = `${meta.width}x${meta.height}`;
      let optionExists = false;
      for (let i = 0; i < selectResolution.options.length; i++) {
        if (selectResolution.options[i].value === resVal) {
          optionExists = true;
          break;
        }
      }
      if (!optionExists) {
        const opt = document.createElement('option');
        opt.value = resVal;
        opt.textContent = `${meta.width} x ${meta.height} (HTML Auto-Detect)`;
        selectResolution.appendChild(opt);
      }
      selectResolution.value = resVal;
      updatePreviewAspectRatio(meta.width, meta.height);
    } else {
      const [w, h] = selectResolution.value.split('x').map(Number);
      updatePreviewAspectRatio(w || 3840, h || 2160);
    }

    if (meta.fps) {
      state.fps = parseInt(meta.fps, 10) || 60;
      selectFps.value = String(state.fps);
      previewFpsText.textContent = `${state.fps} ${t('previewFpsLabel')}`;
    }

    updatePlaybackRange();
    updateAlphaToggleVisibility();
    setAlphaBgMode(meta.bgMode || state.activeBgMode || 'checkerboard');
  }

  // Per-Video Total Frames Input
  metaFramesInput.addEventListener('input', () => {
    if (state.activePreviewIndex < 0) return;
    const frames = parseInt(metaFramesInput.value, 10);
    const item = state.queue[state.activePreviewIndex];

    if (!isNaN(frames) && frames > 0) {
      item.metadata.totalFrames = frames;
      updatePlaybackRange();
      updateQueueDisplay();
    }
  });

  metaTitleInput.addEventListener('input', () => {
    if (state.activePreviewIndex < 0) return;
    const item = state.queue[state.activePreviewIndex];
    item.metadata.title = metaTitleInput.value.trim();
    metaActiveFileTitle.textContent = item.metadata.title || item.filename;
    updateQueueDisplay();
  });

  metaCategoryInput.addEventListener('input', () => {
    if (state.activePreviewIndex < 0) return;
    state.queue[state.activePreviewIndex].metadata.category = metaCategoryInput.value.trim();
  });

  metaKeywordsInput.addEventListener('input', () => {
    if (state.activePreviewIndex < 0) return;
    const val = metaKeywordsInput.value;
    state.queue[state.activePreviewIndex].metadata.keywords = val.split(',').map(k => k.trim()).filter(Boolean);
  });

  metaChkLoop.addEventListener('change', () => {
    if (state.activePreviewIndex < 0) return;
    const item = state.queue[state.activePreviewIndex];
    const isLoop = metaChkLoop.checked;
    item.metadata.isSeamlessLoop = isLoop;
    metaHoldFrameContainer.style.display = isLoop ? 'none' : 'flex';

    metaTypeBadge.textContent = isLoop ? t('loopReady') : t('oneShotReady');
    metaTypeBadge.className = `meta-tag ${isLoop ? 'badge-loop' : 'badge-oneshot'}`;
    previewModeTag.textContent = isLoop ? '[LOOP]' : '[ONE-SHOT]';
    previewModeTag.className = `preview-mode-tag ${isLoop ? 'badge-loop' : 'badge-oneshot'}`;

    updatePlaybackRange();
    updateQueueDisplay();
  });

  metaHoldFrameInput.addEventListener('input', () => {
    if (state.activePreviewIndex < 0) return;
    const val = parseInt(metaHoldFrameInput.value, 10);
    state.queue[state.activePreviewIndex].metadata.holdLastFrames = isNaN(val) ? 0 : Math.max(0, val);
    updatePlaybackRange();
  });

  // ==========================================================================
  // Playback Range & Virtual Clock Sync
  // ==========================================================================

  function updatePlaybackRange() {
    if (state.activePreviewIndex < 0 && !state.activeStudioItem) return;

    let cycleFrames = 180;
    let isLoop = true;
    let holdFrames = 0;

    if (state.activePreviewIndex >= 0 && state.queue[state.activePreviewIndex]) {
      const item = state.queue[state.activePreviewIndex];
      const meta = item.metadata;
      cycleFrames = meta.totalFrames || 180;
      isLoop = meta.isSeamlessLoop !== false;
      holdFrames = isLoop ? 0 : (meta.holdLastFrames || 0);
      state.fps = meta.fps || state.fps || 60;
    } else if (state.activeStudioItem) {
      const meta = state.activeStudioItem.metadata;
      cycleFrames = meta.totalFrames || 180;
      isLoop = true;
      holdFrames = 0;
      state.fps = meta.fps || state.fps || 60;
    }

    const totalPlaybackFrames = cycleFrames + holdFrames;
    frameScrubber.max = Math.max(0, totalPlaybackFrames - 1);

    // Hold Zone Visual Indicator on Scrubber
    if (holdFrames > 0) {
      const holdRatio = holdFrames / totalPlaybackFrames;
      holdIndicatorZone.style.display = 'block';
      holdIndicatorZone.style.width = `${(holdRatio * 100).toFixed(1)}%`;
      holdIndicatorZone.title = `${t('holdZoneTitle')} (${holdFrames} frames)`;
    } else {
      holdIndicatorZone.style.display = 'none';
    }

    if (state.currentFrame >= totalPlaybackFrames) {
      state.currentFrame = 0;
    }
    frameScrubber.value = state.currentFrame;
    updatePlaybackDisplay();
  }

  function updatePlaybackDisplay() {
    if (state.activePreviewIndex < 0 && !state.activeStudioItem) {
      currentTimecode.textContent = 'Frame: 0';
      totalTimecode.textContent = 'Total: 180 F';
      return;
    }

    let cycleFrames = 180;
    let totalPlaybackFrames = 180;
    let isLoop = true;

    if (state.activePreviewIndex >= 0 && state.queue[state.activePreviewIndex]) {
      const item = state.queue[state.activePreviewIndex];
      const meta = item.metadata;
      cycleFrames = meta.totalFrames || 180;
      isLoop = meta.isSeamlessLoop !== false;
      const holdFrames = isLoop ? 0 : (meta.holdLastFrames || 0);
      totalPlaybackFrames = cycleFrames + holdFrames;
    } else if (state.activeStudioItem) {
      cycleFrames = state.activeStudioItem.metadata.totalFrames || 180;
      totalPlaybackFrames = cycleFrames;
      isLoop = true;
    }

    let displayTimeStr = `Frame: ${state.currentFrame}`;
    // If in hold frame zone, add tag
    if (!isLoop && state.currentFrame >= cycleFrames) {
      displayTimeStr += ' [HOLD]';
    }

    currentTimecode.textContent = displayTimeStr;
    totalTimecode.textContent = `Total: ${totalPlaybackFrames} F`;
  }

  // ==========================================================================
  // Preview File Loading with 1:1 Headless Virtual Clock
  // ==========================================================================

  async function loadPreviewFile(index) {
    if (index < 0 || index >= state.queue.length) return;

    state.activePreviewIndex = index;
    const item = state.queue[index];

    const res = await window.api.readHtmlFile(item.filePath);
    if (!res.success) {
      addTerminalLog(`[Error] Gagal membaca preview: ${res.error}`, 'error');
      return;
    }

    pausePlayback();

    // 1:1 Match Virtual Clock Script for Iframe Sandbox
    const injectionScript = `
      <script>
        (function() {
          let __virtualTime = 0;
          let __rafCallbacks = new Map();
          let __rafCounter = 0;

          Date.now = () => Math.round(__virtualTime);
          performance.now = () => __virtualTime;

          window.requestAnimationFrame = (callback) => {
            const id = ++__rafCounter;
            __rafCallbacks.set(id, callback);
            return id;
          };

          window.cancelAnimationFrame = (id) => {
            __rafCallbacks.delete(id);
          };

          // Deterministic virtual clock tick (identical to render-engine.js)
          window.__renderTick = (frameIndex, targetFps) => {
            const fps = targetFps || 60;
            __virtualTime = (frameIndex / fps) * 1000;
            const callbacks = Array.from(__rafCallbacks.values());
            __rafCallbacks.clear();
            for (const cb of callbacks) {
              try { cb(__virtualTime); } catch(e) {}
            }
            if (typeof window.__onFrameUpdate === 'function') {
              try { window.__onFrameUpdate(frameIndex, __virtualTime, fps); } catch(e) {}
            }
          };

          // Override styling for full page centering
          const style = document.createElement('style');
          style.innerHTML = 'html, body { background: transparent !important; background-color: transparent !important; margin: 0 !important; padding: 0 !important; overflow: hidden !important; width: 100% !important; height: 100% !important; display: flex !important; align-items: center !important; justify-content: center !important; } canvas, svg, #stage, .stage, .canvas-container { max-width: 100% !important; max-height: 100% !important; object-fit: contain !important; }';
          document.head.appendChild(style);

          function fitStage() {
            const curW = window.innerWidth;
            const curH = window.innerHeight;
            const target = document.getElementById('stage') ||
                           document.querySelector('.stage') ||
                           document.querySelector('.canvas-container') ||
                           document.getElementById('container') ||
                           document.querySelector('canvas') ||
                           document.querySelector('svg');
            if (target) {
              const cs = window.getComputedStyle(target);
              const origW = parseFloat(target.dataset.width) || parseFloat(target.style.width) || (target.width ? target.width : null) || parseFloat(cs.width) || curW;
              const origH = parseFloat(target.dataset.height) || parseFloat(target.style.height) || (target.height ? target.height : null) || parseFloat(cs.height) || curH;
              if (origW > 0 && origH > 0) {
                const scale = Math.min(curW / origW, curH / origH);
                target.style.position = 'absolute';
                target.style.left = '50%';
                target.style.top = '50%';
                target.style.transformOrigin = 'center center';
                target.style.transform = 'translate(-50%, -50%) scale(' + scale + ')';
                target.style.margin = '0';
              }
            }
          }
          window.addEventListener('resize', fitStage);
          window.addEventListener('DOMContentLoaded', fitStage);
          setTimeout(fitStage, 50);
        })();
      <\/script>
    `;

    let injectedHtml = res.content;
    if (injectedHtml.includes('<head>')) {
      injectedHtml = injectedHtml.replace('<head>', `<head>${injectionScript}`);
    } else {
      injectedHtml = `${injectionScript}${injectedHtml}`;
    }

    previewPlaceholder.style.display = 'none';
    previewIframe.style.display = 'block';
    previewIframe.srcdoc = injectedHtml;

    updatePreviewAspectRatio(item.metadata.width || 3840, item.metadata.height || 2160);
    loadActiveVideoToEditor(index);

    frameScrubber.disabled = false;
    btnPlayPause.disabled = false;
    btnRestart.disabled = false;
    btnStepPrev.disabled = false;
    btnStepNext.disabled = false;

    previewIframe.onload = () => {
      seekToFrame(0);
    };

    updateQueueDisplay();
  }

  function seekToFrame(frameIndex) {
    if (state.activePreviewIndex < 0 && !state.activeStudioItem) return;

    let cycleFrames = 180;
    let totalPlaybackFrames = 180;

    if (state.activePreviewIndex >= 0 && state.queue[state.activePreviewIndex]) {
      const item = state.queue[state.activePreviewIndex];
      const meta = item.metadata;
      cycleFrames = meta.totalFrames || 180;
      const isLoop = meta.isSeamlessLoop !== false;
      const holdFrames = isLoop ? 0 : (meta.holdLastFrames || 0);
      totalPlaybackFrames = cycleFrames + holdFrames;
    } else if (state.activeStudioItem) {
      cycleFrames = state.activeStudioItem.metadata.totalFrames || 180;
      totalPlaybackFrames = cycleFrames;
    }

    state.currentFrame = Math.max(0, Math.min(frameIndex, totalPlaybackFrames - 1));
    frameScrubber.value = state.currentFrame;

    // Determine virtual animation tick frame:
    // If in cycle: frameIndex
    // If in hold frames zone: clamp to final frame (cycleFrames - 1)
    const tickFrame = state.currentFrame < cycleFrames ? state.currentFrame : cycleFrames - 1;

    if (previewIframe.contentWindow && typeof previewIframe.contentWindow.__renderTick === 'function') {
      try {
        previewIframe.contentWindow.__renderTick(tickFrame, state.fps);
      } catch (e) {}
    }

    updatePlaybackDisplay();
  }

  function togglePlayPause() {
    if (state.isPlaying) {
      pausePlayback();
    } else {
      startPlayback();
    }
  }

  function startPlayback() {
    if (state.isRendering || (state.activePreviewIndex < 0 && !state.activeStudioItem)) return;
    state.isPlaying = true;
    iconPlay.style.display = 'none';
    iconPause.style.display = 'block';
    playbackDot.style.backgroundColor = 'var(--accent-emerald)';

    const intervalMs = 1000 / state.fps;
    state.playInterval = setInterval(() => {
      let cycleFrames = 180;
      let isLoop = true;
      let holdFrames = 0;

      if (state.activePreviewIndex >= 0 && state.queue[state.activePreviewIndex]) {
        const item = state.queue[state.activePreviewIndex];
        const meta = item.metadata;
        cycleFrames = meta.totalFrames || 180;
        isLoop = meta.isSeamlessLoop !== false;
        holdFrames = isLoop ? 0 : (meta.holdLastFrames || 0);
      } else if (state.activeStudioItem) {
        cycleFrames = state.activeStudioItem.metadata.totalFrames || 180;
        isLoop = true;
        holdFrames = 0;
      }
      const totalPlaybackFrames = cycleFrames + holdFrames;

      let nextFrame = state.currentFrame + 1;
      if (nextFrame >= totalPlaybackFrames) {
        nextFrame = 0; // Wrap around for preview
      }
      seekToFrame(nextFrame);
    }, intervalMs);
  }

  function pausePlayback() {
    state.isPlaying = false;
    iconPlay.style.display = 'block';
    iconPause.style.display = 'none';
    playbackDot.style.backgroundColor = 'var(--text-muted)';
    if (state.playInterval) {
      clearInterval(state.playInterval);
      state.playInterval = null;
    }
  }

  // Playback Control Buttons
  btnPlayPause.addEventListener('click', togglePlayPause);
  btnRestart.addEventListener('click', () => {
    pausePlayback();
    seekToFrame(0);
  });
  btnStepPrev.addEventListener('click', () => {
    pausePlayback();
    seekToFrame(state.currentFrame - 1);
  });
  btnStepNext.addEventListener('click', () => {
    pausePlayback();
    seekToFrame(state.currentFrame + 1);
  });
  frameScrubber.addEventListener('input', (e) => {
    pausePlayback();
    seekToFrame(parseInt(e.target.value, 10));
  });

  // ==========================================================================
  // Fullscreen Preview Controls
  // ==========================================================================

  function toggleFullscreenPreview() {
    const isFs = Boolean(document.fullscreenElement) || previewStageContainer.classList.contains('fullscreen-active');
    if (!isFs) {
      if (previewStageContainer.requestFullscreen) {
        previewStageContainer.requestFullscreen().catch(() => {
          previewStageContainer.classList.add('fullscreen-active');
          updateFullscreenUI(true);
        });
      } else {
        previewStageContainer.classList.add('fullscreen-active');
        updateFullscreenUI(true);
      }
    } else {
      if (document.exitFullscreen && document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      previewStageContainer.classList.remove('fullscreen-active');
      updateFullscreenUI(false);
    }
  }

  function updateFullscreenUI(isFullscreen) {
    if (iconEnterFullscreen && iconExitFullscreen) {
      iconEnterFullscreen.style.display = isFullscreen ? 'none' : 'block';
      iconExitFullscreen.style.display = isFullscreen ? 'block' : 'none';
    }
    if (btnExitFloatingFullscreen) {
      btnExitFloatingFullscreen.style.display = isFullscreen ? 'flex' : 'none';
    }
    let curW = 3840;
    let curH = 2160;
    if (state.activePreviewIndex >= 0 && state.queue[state.activePreviewIndex]) {
      const item = state.queue[state.activePreviewIndex];
      curW = item.metadata.width || 3840;
      curH = item.metadata.height || 2160;
    } else if (state.activeStudioItem) {
      curW = state.activeStudioItem.metadata.width || 3840;
      curH = state.activeStudioItem.metadata.height || 2160;
    } else {
      const [w, h] = selectResolution.value.split('x').map(Number);
      curW = w || 3840;
      curH = h || 2160;
    }
    setTimeout(() => {
      updatePreviewAspectRatio(curW, curH);
    }, 60);
  }

  document.addEventListener('fullscreenchange', () => {
    const isFs = Boolean(document.fullscreenElement);
    updateFullscreenUI(isFs);
  });

  if (btnFullscreenPreview) {
    btnFullscreenPreview.addEventListener('click', toggleFullscreenPreview);
  }
  if (btnExitFloatingFullscreen) {
    btnExitFloatingFullscreen.addEventListener('click', toggleFullscreenPreview);
  }

// Alpha background toggles handled centrally above

  // Keyboard Shortcuts: F for Fullscreen, ESC to exit fullscreen, Space for Play/Pause
  document.addEventListener('keydown', (e) => {
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
    if (e.key === 'f' || e.key === 'F') {
      e.preventDefault();
      toggleFullscreenPreview();
    } else if (e.key === 'Escape' && previewStageContainer.classList.contains('fullscreen-active')) {
      toggleFullscreenPreview();
    } else if (e.code === 'Space') {
      e.preventDefault();
      togglePlayPause();
    }
  });

  // ==========================================================================
  // Queue & File Handling
  // ==========================================================================

  async function addFilesToQueue(filePaths) {
    if (!filePaths || !filePaths.length) return;

    const globalFps = parseInt(selectFps.value, 10) || 60;
    const [defW, defH] = selectResolution.value.split('x').map(Number);
    const defPreset = selectPreset.value;

    for (const filePath of filePaths) {
      if (state.queue.some(item => item.filePath === filePath)) continue;

      try {
        let rawMeta;
        if (window.api && typeof window.api.parseMetadata === 'function') {
          rawMeta = await window.api.parseMetadata(filePath);
        } else {
          rawMeta = {
            filePath,
            filename: filePath.split(/[/\\]/).pop() || 'animation.html',
            title: (filePath.split(/[/\\]/).pop() || 'animation.html').replace(/\.html?$/i, ''),
            category: 'Motion Graphics & Backgrounds',
            totalFrames: 180,
            fps: globalFps,
            loop: true,
            holdLastFrames: 0,
            width: defW,
            height: defH
          };
        }

        const fps = rawMeta.fps || globalFps;

        // Total frames strictly follows the HTML file itself directly (fallback 180)
        const totalFrames = rawMeta.totalFrames || 180;

        // Prioritize HTML file's loop setting if present
        const isSeamlessLoop = rawMeta.loop !== null ? Boolean(rawMeta.loop) : true;
        const holdLastFrames = rawMeta.holdLastFrames !== undefined ? rawMeta.holdLastFrames : (isSeamlessLoop ? 0 : 30);

        // Prioritize HTML file's width & height (size) if present
        const width = rawMeta.width || defW;
        const height = rawMeta.height || defH;

        const metadata = {
          ...rawMeta,
          title: rawMeta.title || '',
          category: rawMeta.category || 'Motion Graphics & Backgrounds',
          keywords: rawMeta.keywords || [],
          totalFrames,
          fps,
          isSeamlessLoop,
          holdLastFrames,
          width,
          height,
          preset: defPreset,
          bgMode: state.activeBgMode || 'checkerboard'
        };

        const item = {
          id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          filePath,
          filename: rawMeta.filename,
          metadata,
          status: 'pending',
          progress: 0,
          outputPath: '',
          error: null
        };

        state.queue.push(item);
        addTerminalLog('', 'info', 'logQueueAdded', `${metadata.filename} (${metadata.title || 'Untitled'})`);
      } catch (err) {
        addTerminalLog(`[Error] Failed to read ${filePath}: ${err.message}`, 'error');
      }
    }

    updateQueueDisplay();

    // Auto-select first item
    if (state.activePreviewIndex === -1 && state.queue.length > 0) {
      loadPreviewFile(0);
    }
  }

  function updateQueueDisplay() {
    queueSummaryBadge.textContent = `${state.queue.length} File`;
    btnStartRender.disabled = state.queue.length === 0 || state.isRendering;

    if (state.queue.length === 0) {
      queueItemsList.innerHTML = `
        <div class="empty-queue-message">
          <span>${t('queueEmptyText')}</span>
        </div>
      `;
      return;
    }

    queueItemsList.innerHTML = '';

    state.queue.forEach((item, index) => {
      const card = document.createElement('div');
      const isActive = index === state.activePreviewIndex;
      const isRenderingThis = item.status === 'rendering';
      card.className = `queue-item-card ${isActive ? 'active-preview' : ''} ${isRenderingThis ? 'is-rendering' : ''}`;

      const meta = item.metadata;
      const isLoop = meta.isSeamlessLoop !== false;
      const framesStr = `${meta.totalFrames || 180} Frames`;

      let statusBadge = '';
      if (item.status === 'pending') statusBadge = `<span class="status-pill pill-pending">${t('pillPending')}</span>`;
      else if (item.status === 'rendering') statusBadge = `<span class="status-pill pill-rendering">${item.progress}%</span>`;
      else if (item.status === 'done') statusBadge = `<span class="status-pill pill-done">${t('pillDone')}</span>`;
      else if (item.status === 'error') statusBadge = `<span class="status-pill pill-error">${t('pillError')}</span>`;

      card.innerHTML = `
        <div class="queue-item-info">
          <span class="queue-badge ${isLoop ? 'badge-loop' : 'badge-oneshot'}">
            ${isLoop ? '[LOOP]' : '[ONE-SHOT]'}
          </span>
          <div>
            <div class="queue-file-title" title="${item.filePath}">${meta.title || item.filename}</div>
            <div class="queue-file-meta">
              <span>${item.filename}</span> • <span class="queue-duration-tag">${framesStr}</span>
            </div>
          </div>
        </div>
        <div class="queue-item-status">
          ${statusBadge}
          <button class="btn-item-delete" title="${t('btnDeleteItem')}" aria-label="Delete item">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      `;

      // Select item on card click
      card.addEventListener('click', () => {
        loadPreviewFile(index);
      });

      // Individual item delete button
      const delBtn = card.querySelector('.btn-item-delete');
      if (delBtn) {
        delBtn.addEventListener('click', (e) => {
          e.stopPropagation(); // Do not trigger loadPreviewFile
          deleteQueueItem(index);
        });
      }

      queueItemsList.appendChild(card);
    });
  }

  // Delete Individual Item from Queue
  function deleteQueueItem(index) {
    if (state.isRendering) return;
    if (index < 0 || index >= state.queue.length) return;

    const removed = state.queue.splice(index, 1)[0];
    addTerminalLog('', 'info', 'logItemDeleted', removed.filename);

    if (state.queue.length === 0) {
      clearAllQueueState();
    } else {
      if (state.activePreviewIndex === index) {
        const newIndex = Math.min(index, state.queue.length - 1);
        loadPreviewFile(newIndex);
      } else if (state.activePreviewIndex > index) {
        state.activePreviewIndex--;
      }
      updateQueueDisplay();
    }
  }

  // Reset/Clear All Queue State
  function clearAllQueueState() {
    state.queue = [];
    state.activePreviewIndex = -1;
    pausePlayback();
    previewIframe.style.display = 'none';
    previewPlaceholder.style.display = 'flex';
    previewResolutionTag.textContent = '3840x2160 (16:9)';
    frameScrubber.disabled = true;
    btnPlayPause.disabled = true;
    btnRestart.disabled = true;
    btnStepPrev.disabled = true;
    btnStepNext.disabled = true;
    metadataCard.style.opacity = '0.5';
    updateQueueDisplay();
    updatePlaybackDisplay();
    updateAlphaToggleVisibility();
  }

  // Clear Entire Queue Button
  btnClearQueue.addEventListener('click', () => {
    if (state.isRendering || state.queue.length === 0) return;
    clearAllQueueState();
    addTerminalLog('', 'info', 'logQueueCleared');
  });

  // Browse Files & Folders
  btnBrowseFiles.addEventListener('click', async () => {
    const files = await window.api.selectHtmlFiles();
    if (files && files.length) {
      await addFilesToQueue(files);
    }
  });

  btnBrowseFolder.addEventListener('click', async () => {
    const files = await window.api.selectHtmlDirectory();
    if (files && files.length) {
      await addFilesToQueue(files);
    }
  });

  // Drag & Drop
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
  });

  dropZone.addEventListener('drop', async (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');

    const files = Array.from(e.dataTransfer.files)
      .filter(f => f.name.toLowerCase().endsWith('.html') || f.name.toLowerCase().endsWith('.htm'))
      .map(f => f.path);

    if (files.length) {
      await addFilesToQueue(files);
    } else {
      addTerminalLog('', 'error', 'alertSelectValidHtml');
    }
  });

  // Change Output Directory
  btnChangeOutputDir.addEventListener('click', async () => {
    const dir = await window.api.selectOutputDirectory();
    if (dir) {
      state.currentOutputDirectory = dir;
      outputDirPath.textContent = dir;
      outputDirPath.title = dir;
      addTerminalLog('', 'info', 'logTargetFolder', dir);
    }
  });

  // Open Output Folder
  btnOpenOutputDir.addEventListener('click', async () => {
    if (state.currentOutputDirectory) {
      await window.api.openFolder(state.currentOutputDirectory);
    }
  });

  // Clear Terminal Logs
  btnClearLog.addEventListener('click', () => {
    terminalLogs.innerHTML = '';
  });

  // ==========================================================================
  // Batch Render Pipeline with Per-Video Metadata
  // ==========================================================================

  btnStartRender.addEventListener('click', async () => {
    if (state.queue.length === 0 || state.isRendering) return;

    // 1. Pause preview to free CPU/GPU
    pausePlayback();

    // 2. Prepare payload honoring per-video metadata & settings
    const [wStr, hStr] = selectResolution.value.split('x');
    const globalWidth = parseInt(wStr, 10);
    const globalHeight = parseInt(hStr, 10);
    const globalFps = parseInt(selectFps.value, 10);
    const globalPreset = selectPreset.value;

    const payload = {
      items: state.queue.map(item => {
        const meta = item.metadata;
        const fps = meta.fps || globalFps;
        const totalFrames = meta.totalFrames || 180;
        const isSeamlessLoop = meta.isSeamlessLoop !== false;
        const holdLastFrames = isSeamlessLoop ? 0 : (meta.holdLastFrames || 0);

        return {
          filePath: item.filePath,
          width: meta.width || globalWidth,
          height: meta.height || globalHeight,
          fps,
          preset: item.metadata.preset || globalPreset,
          isSeamlessLoop,
          holdLastFrames,
          totalFrames,
          bgMode: meta.bgMode || state.activeBgMode || 'checkerboard',
          // Carry full customized metadata for CSV export
          metadata: {
            title: meta.title,
            category: meta.category,
            keywords: meta.keywords
          }
        };
      }),
      settings: {
        outputDir: state.currentOutputDirectory,
        preset: globalPreset,
        width: globalWidth,
        height: globalHeight,
        fps: globalFps,
        bgMode: state.activeBgMode || 'checkerboard'
      }
    };

    // UI state to Rendering
    state.isRendering = true;
    btnStartRender.style.display = 'none';
    btnCancelRender.style.display = 'inline-flex';
    btnBrowseFiles.disabled = true;
    btnBrowseFolder.disabled = true;
    btnClearQueue.disabled = true;

    state.queue.forEach(item => {
      item.status = 'pending';
      item.progress = 0;
    });
    updateQueueDisplay();

    batchProgressBar.style.width = '0%';
    batchPercentText.textContent = '0%';
    batchProgressText.textContent = `Starting batch render (0 / ${state.queue.length})...`;

    addTerminalLog('', 'info', 'logBatchStart', `${state.queue.length} files...`);

    try {
      const result = await window.api.startBatchRender(payload);
      if (!result.success) {
        addTerminalLog(`[Batch Error] ${result.error}`, 'error');
      }
    } catch (err) {
      addTerminalLog(`[Batch Exception] ${err.message}`, 'error');
    }
  });

  // Cancel Render
  btnCancelRender.addEventListener('click', async () => {
    await window.api.cancelBatchRender();
    addTerminalLog('', 'error', 'logBatchCancelling');
  });

  // ==========================================================================
  // Live Event Listeners from Main Process
  // ==========================================================================

  window.api.onRenderLog((msg) => {
    if (typeof msg !== 'string') {
      addTerminalLog(String(msg));
      return;
    }

    if (msg.startsWith('[Engine] Initializing render for: ')) {
      addTerminalLog('', 'info', 'logEngineInit', msg.slice(34));
    } else if (msg.startsWith('[Engine] Target resolution: ')) {
      addTerminalLog('', 'info', 'logEngineTarget', msg.slice(28));
    } else if (msg.startsWith('[Engine] Preset: ')) {
      addTerminalLog('', 'info', 'logEnginePreset', msg.slice(17));
    } else if (msg.startsWith('[Engine] Using FFmpeg binary: ')) {
      addTerminalLog('', 'info', 'logEngineFfmpeg', msg.slice(30));
    } else if (msg.startsWith('[Engine] Frames planned: ')) {
      addTerminalLog('', 'info', 'logEngineFrames', msg.slice(24));
    } else if (msg.startsWith('[Engine] All frames piped. Closing FFmpeg stdin...')) {
      addTerminalLog('', 'info', 'logEnginePiped');
    } else if (msg.startsWith('[Engine] Render completed successfully: ')) {
      addTerminalLog('', 'success', 'logEngineSuccess', msg.slice(41));
    } else if (msg.includes('Render cancelled by user')) {
      addTerminalLog('', 'error', 'logRenderCancelled');
    } else if (msg.startsWith('[Engine Error] Render failed: ')) {
      addTerminalLog('', 'error', 'logEngineFailed', msg.slice(30));
    } else {
      addTerminalLog(msg);
    }
  });

  window.api.onRenderStatusChange((statusData) => {
    if (statusData.status === 'rendering') {
      batchProgressText.textContent = `Rendering (${statusData.queueIndex || 1} / ${statusData.totalQueue}): ${statusData.activeFile || ''}`;
      if (statusData.queueIndex !== undefined && state.queue[statusData.queueIndex - 1]) {
        state.queue.forEach(q => { if (q.status === 'rendering') q.status = 'pending'; });
        state.queue[statusData.queueIndex - 1].status = 'rendering';
        updateQueueDisplay();
      }
    } else if (statusData.status === 'cancelled') {
      finishRenderUI();
      batchProgressText.textContent = t('logRenderCancelled');
      addTerminalLog('', 'error', 'logRenderCancelled');
    }
  });

  window.api.onRenderProgress((data) => {
    if (data.fileIndex !== undefined && state.queue[data.fileIndex]) {
      state.queue[data.fileIndex].progress = data.percent;
      state.queue[data.fileIndex].status = 'rendering';
    }

    const totalFiles = state.queue.length;
    const fileContribution = 100 / totalFiles;
    const currentFileContribution = (data.percent / 100) * fileContribution;
    const completedContribution = (data.fileIndex || 0) * fileContribution;
    const overallPercent = Math.min(100, Math.round(completedContribution + currentFileContribution));

    batchProgressBar.style.width = `${overallPercent}%`;
    batchPercentText.textContent = `${overallPercent}%`;
    batchProgressText.textContent = `[${data.filename}] Frame ${data.currentFrame}/${data.totalFrames} (${data.renderFps} fps | ETA: ${data.etaSec}s)`;

    updateQueueDisplay();
  });

  window.api.onFileRenderComplete((res) => {
    if (res.fileIndex !== undefined && state.queue[res.fileIndex]) {
      state.queue[res.fileIndex].status = res.success ? 'done' : 'error';
      state.queue[res.fileIndex].progress = res.success ? 100 : 0;
      state.queue[res.fileIndex].outputPath = res.outputPath;
      state.queue[res.fileIndex].error = res.error;
    }
    updateQueueDisplay();
  });

  window.api.onBatchComplete((summary) => {
    finishRenderUI();
    batchProgressBar.style.width = '100%';
    batchPercentText.textContent = '100%';
    batchProgressText.textContent = `Complete! ${summary.successful} OK, ${summary.failed} Failed.`;

    addTerminalLog(`==================================================`, 'success');
    addTerminalLog('', 'success', 'logBatchComplete', `${summary.total} | OK: ${summary.successful} | Failed: ${summary.failed}`);
    if (summary.csvPath) {
      addTerminalLog('', 'info', 'logCsvExport', summary.csvPath);
    }

    // Play notification sound on completion
    playNotificationSound(summary.failed === 0 ? 'success' : 'warning');
  });


  // ==========================================================================
  // Studio Generator Controller
  // ==========================================================================

  let studioSelectedCategory = 'kinetic-typography';
  const studioParamsStore = {
    'kinetic-typography': (window.GeneratorCatalog && window.GeneratorCatalog.getDefaultParams('kinetic-typography')) || {
      text: 'KINETIC TYPOGRAPHY',
      subtitle: 'FUTURE IS NOW',
      motif: 'cyberpunk',
      palette: 'neonCyan'
    },
    'particle-fx': (window.GeneratorCatalog && window.GeneratorCatalog.getDefaultParams('particle-fx')) || {
      motif: 'cosmic-swirl',
      particleCount: 120,
      speed: 1.0,
      palette: 'electric'
    },
    'isometric-3d': (window.GeneratorCatalog && window.GeneratorCatalog.getDefaultParams('isometric-3d')) || {
      motif: 'geometric-matrix',
      gridSize: 9,
      elevation: 80,
      palette: 'cyber'
    },
    'data-visualization': (window.GeneratorCatalog && window.GeneratorCatalog.getDefaultParams('data-visualization')) || {
      headline: 'GLOBAL ANALYTICS HUD',
      value: '$8,492,100',
      motif: 'fintech-hud',
      palette: 'emerald'
    },
    'abstract-motion': (window.GeneratorCatalog && window.GeneratorCatalog.getDefaultParams('abstract-motion')) || {
      motif: 'fluid-ribbons',
      waveCount: 5,
      speed: 1.0,
      palette: 'iridescent'
    },
    'flat-animation': (window.GeneratorCatalog && window.GeneratorCatalog.getDefaultParams('flat-animation')) || {
      title: 'SUCCESSFUL TRANSACTION',
      subtitle: 'VERIFIED & CONFIRMED',
      motif: 'badge-check',
      palette: 'vibrant'
    }
  };

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderStudioCategoryForm() {
    if (!studioDynamicFields) return;
    const cat = studioSelectedCategory;
    const p = studioParamsStore[cat] || {};

    const catNames = {
      'kinetic-typography': 'Kinetic Typography Parameters',
      'particle-fx': 'Particle FX Parameters',
      'isometric-3d': 'Isometric 3D Parameters',
      'data-visualization': 'Data Visualization Parameters',
      'abstract-motion': 'Abstract Motion Parameters',
      'flat-animation': 'Flat Animation Parameters'
    };
    if (studioCategoryLabelName) {
      studioCategoryLabelName.textContent = catNames[cat] || `${cat} Parameters`;
    }

    studioDynamicFields.innerHTML = '';

    if (cat === 'kinetic-typography') {
      studioDynamicFields.innerHTML = `
        <div class="meta-field-group">
          <label>Headline Text:</label>
          <input type="text" id="sf_text" class="form-input" value="${escapeHtml(p.text || 'KINETIC TYPOGRAPHY')}">
        </div>
        <div class="meta-field-group">
          <label>Subtitle / Tagline:</label>
          <input type="text" id="sf_subtitle" class="form-input" value="${escapeHtml(p.subtitle || 'FUTURE IS NOW')}">
        </div>
        <div class="meta-fields-two-col">
          <div class="meta-field-group">
            <label>Visual Style:</label>
            <select id="sf_motif" class="form-select">
              <option value="cyberpunk" ${p.motif === 'cyberpunk' ? 'selected' : ''}>Cyberpunk HUD</option>
              <option value="minimal" ${p.motif === 'minimal' ? 'selected' : ''}>Swiss Modernist</option>
              <option value="glitch" ${p.motif === 'glitch' ? 'selected' : ''}>Digital Telemetry</option>
            </select>
          </div>
          <div class="meta-field-group">
            <label>Color Palette:</label>
            <select id="sf_palette" class="form-select">
              <option value="neonCyan" ${p.palette === 'neonCyan' ? 'selected' : ''}>Neon Cyan & Violet</option>
              <option value="magma" ${p.palette === 'magma' ? 'selected' : ''}>Magma Orange & Gold</option>
              <option value="electricPurple" ${p.palette === 'electricPurple' ? 'selected' : ''}>Electric Purple & Lime</option>
              <option value="matrixGreen" ${p.palette === 'matrixGreen' ? 'selected' : ''}>Matrix Cyber Green</option>
            </select>
          </div>
        </div>
      `;
    } else if (cat === 'particle-fx') {
      studioDynamicFields.innerHTML = `
        <div class="meta-fields-two-col">
          <div class="meta-field-group">
            <label>Motion Motif:</label>
            <select id="sf_motif" class="form-select">
              <option value="cosmic-swirl" ${p.motif === 'cosmic-swirl' ? 'selected' : ''}>Cosmic Swirl Galaxy</option>
              <option value="quantum-sparks" ${p.motif === 'quantum-sparks' ? 'selected' : ''}>Quantum Sparks Stream</option>
              <option value="bokeh-flow" ${p.motif === 'bokeh-flow' ? 'selected' : ''}>Cinematic Bokeh Flow</option>
            </select>
          </div>
          <div class="meta-field-group">
            <label>Color Theme:</label>
            <select id="sf_palette" class="form-select">
              <option value="electric" ${p.palette === 'electric' ? 'selected' : ''}>Electric Cyan & Magenta</option>
              <option value="cosmicGold" ${p.palette === 'cosmicGold' ? 'selected' : ''}>Cosmic Gold & Solar Amber</option>
              <option value="deepEmerald" ${p.palette === 'deepEmerald' ? 'selected' : ''}>Deep Emerald & Mint</option>
              <option value="neonPink" ${p.palette === 'neonPink' ? 'selected' : ''}>Neon Pink & Violet</option>
            </select>
          </div>
        </div>
        <div class="meta-fields-two-col">
          <div class="meta-field-group">
            <label>Particle Count (30 - 300):</label>
            <input type="number" id="sf_particleCount" class="form-input" min="30" max="300" value="${p.particleCount || 120}">
          </div>
          <div class="meta-field-group">
            <label>Orbit Speed:</label>
            <select id="sf_speed" class="form-select">
              <option value="0.75" ${p.speed == 0.75 ? 'selected' : ''}>0.75x (Ambient Slow)</option>
              <option value="1.0" ${p.speed == 1.0 || !p.speed ? 'selected' : ''}>1.0x (Standard Stock)</option>
              <option value="1.5" ${p.speed == 1.5 ? 'selected' : ''}>1.5x (Dynamic Fast)</option>
            </select>
          </div>
        </div>
      `;
    } else if (cat === 'isometric-3d') {
      studioDynamicFields.innerHTML = `
        <div class="meta-fields-two-col">
          <div class="meta-field-group">
            <label>Isometric Motif:</label>
            <select id="sf_motif" class="form-select">
              <option value="geometric-matrix" ${p.motif === 'geometric-matrix' ? 'selected' : ''}>2.5D Ripple Matrix</option>
              <option value="circuit-pillars" ${p.motif === 'circuit-pillars' ? 'selected' : ''}>Cyber Circuit Pillars</option>
              <option value="pulse-blocks" ${p.motif === 'pulse-blocks' ? 'selected' : ''}>Equalizer Blocks</option>
            </select>
          </div>
          <div class="meta-field-group">
            <label>Color Theme:</label>
            <select id="sf_palette" class="form-select">
              <option value="cyber" ${p.palette === 'cyber' ? 'selected' : ''}>Cyber Neon Cyan & Purple</option>
              <option value="goldHorizon" ${p.palette === 'goldHorizon' ? 'selected' : ''}>Gold Horizon & Bronze</option>
              <option value="royalAmethyst" ${p.palette === 'royalAmethyst' ? 'selected' : ''}>Royal Amethyst</option>
              <option value="emeraldCity" ${p.palette === 'emeraldCity' ? 'selected' : ''}>Emerald Data Grid</option>
            </select>
          </div>
        </div>
        <div class="meta-fields-two-col">
          <div class="meta-field-group">
            <label>Matrix Grid Size (7x7 to 11x11):</label>
            <input type="number" id="sf_gridSize" class="form-input" min="5" max="13" step="2" value="${p.gridSize || 9}">
          </div>
          <div class="meta-field-group">
            <label>Wave Elevation (Height):</label>
            <input type="number" id="sf_elevation" class="form-input" min="30" max="150" value="${p.elevation || 80}">
          </div>
        </div>
      `;
    } else if (cat === 'data-visualization') {
      studioDynamicFields.innerHTML = `
        <div class="meta-fields-two-col">
          <div class="meta-field-group">
            <label>Dashboard Title:</label>
            <input type="text" id="sf_headline" class="form-input" value="${escapeHtml(p.headline || 'GLOBAL ANALYTICS HUD')}">
          </div>
          <div class="meta-field-group">
            <label>Metric Value:</label>
            <input type="text" id="sf_value" class="form-input" value="${escapeHtml(p.value || '$8,492,100')}">
          </div>
        </div>
        <div class="meta-fields-two-col">
          <div class="meta-field-group">
            <label>Visualization Widget:</label>
            <select id="sf_motif" class="form-select">
              <option value="fintech-hud" ${p.motif === 'fintech-hud' ? 'selected' : ''}>FinTech HUD Dashboard</option>
              <option value="radial-gauge" ${p.motif === 'radial-gauge' ? 'selected' : ''}>Radial Gauge Speedometer</option>
              <option value="telemetry-bars" ${p.motif === 'telemetry-bars' ? 'selected' : ''}>Telemetry Bar Race</option>
            </select>
          </div>
          <div class="meta-field-group">
            <label>Color Theme:</label>
            <select id="sf_palette" class="form-select">
              <option value="emerald" ${p.palette === 'emerald' ? 'selected' : ''}>FinTech Emerald Bull</option>
              <option value="cyan" ${p.palette === 'cyan' ? 'selected' : ''}>Hi-Tech Neon Cyan</option>
              <option value="neonOrange" ${p.palette === 'neonOrange' ? 'selected' : ''}>Solar Gold & Orange</option>
              <option value="deepBlue" ${p.palette === 'deepBlue' ? 'selected' : ''}>Deep Royal Blue</option>
            </select>
          </div>
        </div>
      `;
    } else if (cat === 'abstract-motion') {
      studioDynamicFields.innerHTML = `
        <div class="meta-fields-two-col">
          <div class="meta-field-group">
            <label>Flow Motif:</label>
            <select id="sf_motif" class="form-select">
              <option value="fluid-ribbons" ${p.motif === 'fluid-ribbons' ? 'selected' : ''}>Fluid Wave Ribbons</option>
              <option value="neon-waves" ${p.motif === 'neon-waves' ? 'selected' : ''}>Hypnotic Neon Waves</option>
              <option value="chromatic-drift" ${p.motif === 'chromatic-drift' ? 'selected' : ''}>Chromatic Drift</option>
            </select>
          </div>
          <div class="meta-field-group">
            <label>Color Palette:</label>
            <select id="sf_palette" class="form-select">
              <option value="iridescent" ${p.palette === 'iridescent' ? 'selected' : ''}>Iridescent Holographic</option>
              <option value="sunsetVapor" ${p.palette === 'sunsetVapor' ? 'selected' : ''}>Sunset Vaporwave</option>
              <option value="darkNebula" ${p.palette === 'darkNebula' ? 'selected' : ''}>Dark Space Nebula</option>
              <option value="oceanBreeze" ${p.palette === 'oceanBreeze' ? 'selected' : ''}>Ocean Breeze Turquoise</option>
            </select>
          </div>
        </div>
        <div class="meta-fields-two-col">
          <div class="meta-field-group">
            <label>Wave Layers (Ribbons):</label>
            <input type="number" id="sf_waveCount" class="form-input" min="3" max="8" value="${p.waveCount || 5}">
          </div>
          <div class="meta-field-group">
            <label>Flow Speed:</label>
            <select id="sf_speed" class="form-select">
              <option value="0.8" ${p.speed == 0.8 ? 'selected' : ''}>0.8x (Hypnotic Slow)</option>
              <option value="1.0" ${p.speed == 1.0 || !p.speed ? 'selected' : ''}>1.0x (Standard Smooth)</option>
              <option value="1.4" ${p.speed == 1.4 ? 'selected' : ''}>1.4x (Fast Flow)</option>
            </select>
          </div>
        </div>
      `;
    } else if (cat === 'flat-animation') {
      studioDynamicFields.innerHTML = `
        <div class="meta-field-group">
          <label>Badge Headline:</label>
          <input type="text" id="sf_title" class="form-input" value="${escapeHtml(p.title || 'SUCCESSFUL TRANSACTION')}">
        </div>
        <div class="meta-field-group">
          <label>Sub-Label / Details:</label>
          <input type="text" id="sf_subtitle" class="form-input" value="${escapeHtml(p.subtitle || 'VERIFIED & CONFIRMED')}">
        </div>
        <div class="meta-fields-two-col">
          <div class="meta-field-group">
            <label>Explainer Motif:</label>
            <select id="sf_motif" class="form-select">
              <option value="badge-check" ${p.motif === 'badge-check' ? 'selected' : ''}>Success Badge & Confetti</option>
              <option value="shield-secure" ${p.motif === 'shield-secure' ? 'selected' : ''}>Shield Security Verified</option>
              <option value="rocket-launch" ${p.motif === 'rocket-launch' ? 'selected' : ''}>Growth Rocket Burst</option>
            </select>
          </div>
          <div class="meta-field-group">
            <label>Color Theme:</label>
            <select id="sf_palette" class="form-select">
              <option value="vibrant" ${p.palette === 'vibrant' ? 'selected' : ''}>Vibrant Modern Emerald</option>
              <option value="corporateBlue" ${p.palette === 'corporateBlue' ? 'selected' : ''}>Corporate Tech Blue</option>
              <option value="freshMint" ${p.palette === 'freshMint' ? 'selected' : ''}>Fresh Mint & Teal</option>
              <option value="coralWarm" ${p.palette === 'coralWarm' ? 'selected' : ''}>Warm Coral & Violet</option>
            </select>
          </div>
        </div>
      `;
    }

    // Attach input listeners
    studioDynamicFields.querySelectorAll('input, select').forEach((elem) => {
      const fieldId = elem.id.replace('sf_', '');
      elem.addEventListener('input', () => {
        let val = elem.value;
        if (elem.type === 'number') val = Number(val);
        studioParamsStore[cat][fieldId] = val;
      });
    });
  }

  function getStudioCurrentParams() {
    const cat = studioSelectedCategory;
    const p = { ...(studioParamsStore[cat] || {}) };

    if (studioDynamicFields) {
      studioDynamicFields.querySelectorAll('input, select, textarea').forEach((elem) => {
        const fieldId = elem.id.replace('sf_', '');
        let val = elem.value;
        if (elem.type === 'number') val = Number(val);
        p[fieldId] = val;
      });
    }

    const totalFrames = parseInt(studioFramesInput ? studioFramesInput.value : 180, 10) || 180;
    const isTransparent = Boolean(studioChkAlpha && studioChkAlpha.checked);

    return {
      ...p,
      totalFrames,
      isTransparent,
      isLoop: true,
      fps: 60
    };
  }

  function loadStudioGeneratedPreview(htmlContent, meta) {
    pausePlayback();
    state.activePreviewIndex = -99;
    state.activeStudioItem = { metadata: meta, content: htmlContent };

    const injectionScript = `
      <script>
        (function() {
          let __virtualTime = 0;
          let __rafCallbacks = new Map();
          let __rafCounter = 0;
          performance.now = () => __virtualTime;
          window.requestAnimationFrame = (callback) => {
            const id = ++__rafCounter;
            __rafCallbacks.set(id, callback);
            return id;
          };
          window.cancelAnimationFrame = (id) => {
            __rafCallbacks.delete(id);
          };
          const origRenderTick = window.__renderTick;
          window.__renderTick = (frameIndex, targetFps) => {
            const fps = targetFps || 60;
            __virtualTime = (frameIndex / fps) * 1000;
            const callbacks = Array.from(__rafCallbacks.values());
            __rafCallbacks.clear();
            for (const cb of callbacks) {
              try { cb(__virtualTime); } catch(e) {}
            }
            if (typeof origRenderTick === 'function') {
              try { origRenderTick(frameIndex, targetFps); } catch(e) {}
            } else if (typeof window.__onFrameUpdate === 'function') {
              try { window.__onFrameUpdate(frameIndex, __virtualTime, fps); } catch(e) {}
            }
          };
          const style = document.createElement('style');
          style.innerHTML = 'html, body { background: transparent !important; background-color: transparent !important; margin: 0 !important; padding: 0 !important; overflow: hidden !important; width: 100% !important; height: 100% !important; display: flex !important; align-items: center !important; justify-content: center !important; } canvas, svg, #stage, .stage, .canvas-container { max-width: 100% !important; max-height: 100% !important; object-fit: contain !important; }';
          document.head.appendChild(style);

          function fitStage() {
            const curW = window.innerWidth;
            const curH = window.innerHeight;
            const target = document.getElementById('stage') ||
                           document.querySelector('.stage') ||
                           document.querySelector('.canvas-container') ||
                           document.getElementById('container') ||
                           document.querySelector('canvas') ||
                           document.querySelector('svg');
            if (target) {
              const cs = window.getComputedStyle(target);
              const origW = parseFloat(target.dataset.width) || parseFloat(target.style.width) || (target.width ? target.width : null) || parseFloat(cs.width) || curW;
              const origH = parseFloat(target.dataset.height) || parseFloat(target.style.height) || (target.height ? target.height : null) || parseFloat(cs.height) || curH;
              if (origW > 0 && origH > 0) {
                const scale = Math.min(curW / origW, curH / origH);
                target.style.position = 'absolute';
                target.style.left = '50%';
                target.style.top = '50%';
                target.style.transformOrigin = 'center center';
                target.style.transform = 'translate(-50%, -50%) scale(' + scale + ')';
                target.style.margin = '0';
              }
            }
          }
          window.addEventListener('resize', fitStage);
          window.addEventListener('DOMContentLoaded', fitStage);
          setTimeout(fitStage, 50);
        })();
      </script>
    `;

    let injectedHtml = htmlContent;
    if (injectedHtml.includes('<head>')) {
      injectedHtml = injectedHtml.replace('<head>', `<head>${injectionScript}`);
    } else {
      injectedHtml = `${injectionScript}${injectedHtml}`;
    }

    previewPlaceholder.style.display = 'none';
    previewIframe.style.display = 'block';
    previewIframe.srcdoc = injectedHtml;

    const targetW = meta.width || 3840;
    const targetH = meta.height || 2160;
    const resVal = `${targetW}x${targetH}`;
    let optionExists = false;
    for (let i = 0; i < selectResolution.options.length; i++) {
      if (selectResolution.options[i].value === resVal) {
        optionExists = true;
        break;
      }
    }
    if (!optionExists) {
      const opt = document.createElement('option');
      opt.value = resVal;
      opt.textContent = `${targetW} x ${targetH} (Studio Custom)`;
      selectResolution.appendChild(opt);
    }
    selectResolution.value = resVal;

    state.fps = parseInt(meta.fps, 10) || 60;
    selectFps.value = String(state.fps);
    previewFpsText.textContent = `${state.fps} ${t('previewFpsLabel')}`;

    updatePreviewAspectRatio(targetW, targetH);

    const totalPlaybackFrames = meta.totalFrames || 180;
    frameScrubber.max = Math.max(0, totalPlaybackFrames - 1);
    frameScrubber.disabled = false;
    btnPlayPause.disabled = false;
    btnRestart.disabled = false;
    btnStepPrev.disabled = false;
    btnStepNext.disabled = false;
    holdIndicatorZone.style.display = 'none';

    state.currentFrame = 0;
    frameScrubber.value = 0;
    currentTimecode.textContent = 'Frame: 0';
    totalTimecode.textContent = `Total: ${totalPlaybackFrames} F`;

    metaActiveFileTitle.textContent = `[STUDIO PREVIEW] ${meta.title}`;
    metaActiveFileTitle.title = 'Generated Studio Template';
    metadataCard.style.opacity = '1';
    metaTitleInput.value = meta.title || '';
    metaCategoryInput.value = meta.category || '';
    metaFramesInput.value = totalPlaybackFrames;
    metaKeywordsInput.value = (meta.keywords || []).join(', ');
    metaChkLoop.checked = true;
    metaHoldFrameContainer.style.display = 'none';

    previewIframe.onload = () => {
      seekToFrame(0);
    };
  }

  // Bind Tab Mode Switcher
  if (tabQueueMode && tabStudioMode) {
    tabQueueMode.addEventListener('click', () => {
      tabQueueMode.classList.add('active');
      tabStudioMode.classList.remove('active');
      viewQueueContainer.style.display = 'flex';
      viewStudioContainer.style.display = 'none';
    });

    tabStudioMode.addEventListener('click', () => {
      tabStudioMode.classList.add('active');
      tabQueueMode.classList.remove('active');
      viewQueueContainer.style.display = 'none';
      viewStudioContainer.style.display = 'flex';
      renderStudioCategoryForm();
    });
  }

  // Bind Category Cards
  if (studioCategoryGrid) {
    studioCategoryGrid.querySelectorAll('.category-card').forEach((card) => {
      card.addEventListener('click', () => {
        studioCategoryGrid.querySelectorAll('.category-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        studioSelectedCategory = card.dataset.category;
        renderStudioCategoryForm();
      });
    });
  }

  // Live Preview Sandbox Button
  if (btnStudioPreview) {
    btnStudioPreview.addEventListener('click', () => {
      if (!window.GeneratorCatalog) {
        addTerminalLog('[Studio Error] GeneratorCatalog not loaded.', 'error');
        return;
      }
      const params = getStudioCurrentParams();
      const htmlContent = window.GeneratorCatalog.generate(studioSelectedCategory, params);
      const meta = {
        title: params.text || params.headline || params.title || studioSelectedCategory,
        category: studioSelectedCategory,
        width: 3840,
        height: 2160,
        fps: 60,
        totalFrames: params.totalFrames,
        isSeamlessLoop: true,
        keywords: [studioSelectedCategory, 'motion graphics', '4k', 'loop', 'commercial']
      };

      loadStudioGeneratedPreview(htmlContent, meta);
      addTerminalLog('', 'info', 'logStudioPreview', `${studioSelectedCategory} (${params.totalFrames} frames)`);
    });
  }

  // Generate & Add to Render Queue Button
  if (btnStudioGenerateQueue) {
    btnStudioGenerateQueue.addEventListener('click', async () => {
      try {
        if (!window.GeneratorCatalog) {
          addTerminalLog('[Studio Error] GeneratorCatalog belum siap dimuat.', 'error');
          return;
        }
        const params = getStudioCurrentParams();
        const htmlContent = window.GeneratorCatalog.generate(studioSelectedCategory, params);
        if (!htmlContent || htmlContent.length < 50) {
          addTerminalLog('[Studio Error] Gagal membuat konten template animasi.', 'error');
          return;
        }

        const safePrefix = studioSelectedCategory.replace(/[^a-z0-9_-]/gi, '_');
        const filename = `${safePrefix}_${Date.now()}.html`;

        btnStudioGenerateQueue.disabled = true;

        let targetFilePath = '';

        if (window.api && typeof window.api.saveGeneratedAnimation === 'function') {
          const saveRes = await window.api.saveGeneratedAnimation({ filename, content: htmlContent });
          if (!saveRes || !saveRes.success) {
            addTerminalLog(`[Studio Error] Gagal menyimpan file animasi: ${(saveRes && saveRes.error) || 'Unknown error'}`, 'error');
            btnStudioGenerateQueue.disabled = false;
            return;
          }
          targetFilePath = saveRes.filePath;
        } else {
          // Fallback if running outside Electron
          const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
          targetFilePath = URL.createObjectURL(blob);
        }

        // Add saved file to queue
        await addFilesToQueue([targetFilePath]);

        // Switch to Queue tab
        if (tabQueueMode) {
          tabQueueMode.click();
        }

        // Select the newly generated item
        if (state.queue.length > 0) {
          loadPreviewFile(state.queue.length - 1);
        }

        addTerminalLog('', 'success', 'logStudioGenerated', filename);
      } catch (err) {
        addTerminalLog(`[Studio Error] ${err.message}`, 'error');
      } finally {
        btnStudioGenerateQueue.disabled = false;
      }
    });
  }

  // Save Standalone HTML File Button
  if (btnStudioSaveHtml) {
    btnStudioSaveHtml.addEventListener('click', async () => {
      try {
        if (!window.GeneratorCatalog) {
          addTerminalLog('[Studio Error] GeneratorCatalog belum siap dimuat.', 'error');
          return;
        }
        const params = getStudioCurrentParams();
        const htmlContent = window.GeneratorCatalog.generate(studioSelectedCategory, params);
        if (!htmlContent || htmlContent.length < 50) {
          addTerminalLog('[Studio Error] Gagal membuat konten template animasi.', 'error');
          return;
        }

        const defaultFilename = `${studioSelectedCategory}_motion.html`;

        // If Electron API is available, try Save Dialog
        if (window.api && typeof window.api.saveHtmlWithDialog === 'function') {
          const res = await window.api.saveHtmlWithDialog({
            defaultFilename,
            content: htmlContent
          });

          if (res && res.success) {
            addTerminalLog('', 'success', 'logStudioSaved', res.filePath);
            return;
          } else if (res && res.canceled) {
            addTerminalLog('', 'info', 'logStudioCancel');
            return;
          } else if (res && res.error) {
            addTerminalLog(`[Studio Error] Dialog gagal: ${res.error}`, 'error');
          }
        }

        // Reliable Fallback: Browser Blob download
        const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = defaultFilename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        addTerminalLog('', 'success', 'logStudioSaved', `${defaultFilename} (Download)`);
      } catch (err) {
        addTerminalLog(`[Studio Error] Gagal menyimpan HTML: ${err.message}`, 'error');
      }
    });
  }

  // Initial render of studio parameters
  renderStudioCategoryForm();

  function finishRenderUI() {
    state.isRendering = false;
    btnStartRender.style.display = 'inline-flex';
    btnCancelRender.style.display = 'none';
    btnBrowseFiles.disabled = false;
    btnBrowseFolder.disabled = false;
    btnClearQueue.disabled = false;
    updateQueueDisplay();
  }
});
