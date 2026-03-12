import { useState, useRef } from "react";

const T = {
  en: {
    title: "StockScan", subtitle: "Inventory Manager",
    addItem: "Add Item", name: "Item Name", category: "Category",
    qty: "Quantity", unit: "Unit", location: "Location",
    save: "Save", cancel: "Cancel", search: "Search items…",
    report: "Export Report", voice: "Voice Input", listening: "Listening…",
    items: "Items", total: "Total Units", categories: "Categories",
    delete: "Delete", edit: "Edit", noItems: "No items yet. Add your first item!",
    confirmDelete: "Delete this item?", reportTitle: "Inventory Report", lang: "Language",
    camera: "Scan with Camera", analyzing: "Analyzing image…",
    scanResult: "AI detected these items — review & add:",
    addAll: "Add All to Inventory", takePhoto: "Take Photo / Upload",
    scanHint: "Point your camera at shelves, bottles, or glassware",
    confidence: "confidence",
    categories_list: ["Glassware","Bottles","Liquids","Equipment","Other"],
    units_list: ["pcs","bottles","L","mL","kg","g","boxes"],
    voiceHint: "Say something like: 'Add 5 wine glasses in Kitchen'",
  },
  fr: {
    title: "StockScan", subtitle: "Gestionnaire d'inventaire",
    addItem: "Ajouter", name: "Nom de l'article", category: "Catégorie",
    qty: "Quantité", unit: "Unité", location: "Emplacement",
    save: "Enregistrer", cancel: "Annuler", search: "Rechercher…",
    report: "Exporter rapport", voice: "Saisie vocale", listening: "Écoute…",
    items: "Articles", total: "Unités totales", categories: "Catégories",
    delete: "Supprimer", edit: "Modifier", noItems: "Aucun article. Ajoutez le premier!",
    confirmDelete: "Supprimer cet article?", reportTitle: "Rapport d'inventaire", lang: "Langue",
    camera: "Scanner avec caméra", analyzing: "Analyse en cours…",
    scanResult: "L'IA a détecté ces articles — vérifiez et ajoutez:",
    addAll: "Tout ajouter", takePhoto: "Prendre photo / Télécharger",
    scanHint: "Pointez votre caméra vers des étagères, bouteilles ou verrerie",
    confidence: "confiance",
    categories_list: ["Verrerie","Bouteilles","Liquides","Équipement","Autre"],
    units_list: ["pcs","bouteilles","L","mL","kg","g","boîtes"],
    voiceHint: "Dites: 'Ajouter 5 verres à vin dans Cave'",
  },
  ar: {
    title: "ستوك سكان", subtitle: "مدير المخزون",
    addItem: "إضافة", name: "اسم الصنف", category: "الفئة",
    qty: "الكمية", unit: "الوحدة", location: "الموقع",
    save: "حفظ", cancel: "إلغاء", search: "بحث…",
    report: "تصدير تقرير", voice: "إدخال صوتي", listening: "جارٍ الاستماع…",
    items: "أصناف", total: "إجمالي الوحدات", categories: "فئات",
    delete: "حذف", edit: "تعديل", noItems: "لا توجد أصناف. أضف أول صنف!",
    confirmDelete: "حذف هذا الصنف؟", reportTitle: "تقرير المخزون", lang: "اللغة",
    camera: "مسح بالكاميرا", analyzing: "جارٍ تحليل الصورة…",
    scanResult: "اكتشف الذكاء الاصطناعي هذه الأصناف — راجع وأضف:",
    addAll: "إضافة الكل", takePhoto: "التقط صورة / تحميل",
    scanHint: "وجّه كاميرتك نحو الرفوف أو الزجاجات",
    confidence: "دقة",
    categories_list: ["زجاجيات","زجاجات","سوائل","معدات","أخرى"],
    units_list: ["قطع","زجاجات","ل","مل","كجم","جم","صناديق"],
    voiceHint: "قل: 'أضف 5 كؤوس في المطبخ'",
  },
};

const LANG_LABELS = { en: "English", fr: "Français", ar: "العربية" };
const CATEGORY_ICONS = { 0:"🍷", 1:"🍾", 2:"💧", 3:"⚙️", 4:"📦" };

const SAMPLE_ITEMS = [
  { id: 1, name: "Wine Glasses", category: 0, qty: 24, unit: 0, location: "Bar" },
  { id: 2, name: "Olive Oil", category: 2, qty: 6, unit: 1, location: "Kitchen" },
  { id: 3, name: "Whisky Bottles", category: 1, qty: 12, unit: 1, location: "Cellar" },
  { id: 4, name: "Beer Mugs", category: 0, qty: 18, unit: 0, location: "Bar" },
];

function buildCSV(items, lang) {
  const t = T[lang];
  const date = new Date().toLocaleDateString(lang === "ar" ? "ar-SA" : lang === "fr" ? "fr-FR" : "en-US");
  const headers = ["Item Name", "Category", "Quantity", "Unit", "Location"];
  const rows = items.map(i => [
    `"${i.name}"`,
    `"${t.categories_list[i.category]}"`,
    i.qty,
    `"${t.units_list[i.unit]}"`,
    `"${i.location || ""}"`
  ].join(","));
  const csv = [headers.join(","), ...rows].join("\n");
  return { date, csv };
}

function downloadCSV(csv, date) {
  try {
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inventory-${date}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return true;
  } catch (e) {
    return false;
  }
}

function parseVoice(text, lang) {
  const t = T[lang];
  const numMatch = text.match(/(\d+)/);
  const qty = numMatch ? parseInt(numMatch[1]) : 1;
  let category = 4;
  const lower = text.toLowerCase();
  if (/glass|verre|كأس|gobelet|coupe|mug/.test(lower)) category = 0;
  else if (/bottle|bouteille|زجاجة/.test(lower)) category = 1;
  else if (/liquid|liquide|سائل|water|eau|ماء|oil|huile|زيت/.test(lower)) category = 2;
  else if (/equip|outil|معدة/.test(lower)) category = 3;
  const locMatch = text.match(/(?:in|dans|في)\s+(.+)/i);
  const location = locMatch ? locMatch[1].trim() : "";
  let name = text.replace(/\d+/g, "").replace(/(?:add|ajouter|أضف|in|dans|في)\s*/gi, "").replace(location, "").replace(/\s+/g, " ").trim();
  if (!name) name = t.categories_list[category];
  return { name: name || "Item", category, qty, unit: 0, location };
}

// Call Claude vision API with base64 image
async function analyzeImageWithClaude(base64Data, mediaType, lang) {
  const langNames = { en: "English", fr: "French", ar: "Arabic" };
  const prompt = `You are a world-class inventory counting specialist with expert training in visual item recognition and precise counting of glassware, bottles, and containers — including heavily cluttered, overlapping, and partially obscured items.

COUNTING METHODOLOGY — follow this exact process:
1. SCAN the full image left-to-right, top-to-bottom. Note every shelf, row, and cluster.
2. IDENTIFY distinct item types (e.g. cloche jars, wine glasses, bowls, bottles). Look for shape, rim style, base, lid, and silhouette — glass items may be nearly invisible but cast shadows and reflections.
3. COUNT each type using a grid/row method:
   - Divide each shelf into sections (left / middle / right)
   - Count visible items in each section
   - For stacked or overlapping items, count each base you can see or reasonably infer
   - For items partially behind others, count the visible portion + estimate hidden ones based on row depth
   - Round numbers (e.g. 12, 6, 8) are suspicious — recount if you get a round number
4. VERIFY by doing a second count from right-to-left. If counts differ by more than 1, use the average.
5. SET confidence based on visibility: clearly visible and countable = 90-99%, partially obscured = 70-89%, mostly hidden/inferred = 50-69%

IMPORTANT GLASSWARE NOTES:
- Glass cloches (dome lids with bases) count as 1 unit each (lid + base = 1 piece)
- Stacked glasses: count all glasses including those stacked inside each other
- Reflections and shadows are NOT items — do not count them
- If you see the same item type in multiple rows/shelves, report total count across ALL rows

Respond ONLY with a valid JSON array. No explanation, no markdown, no extra text:
[
  { "name": "Glass Cloches", "qty": 8, "category": 0, "unit": 0, "confidence": 92 },
  { "name": "Wine Glasses", "qty": 4, "category": 0, "unit": 0, "confidence": 88 }
]

Category codes: 0=Glassware, 1=Bottles, 2=Liquids/Containers, 3=Equipment, 4=Other
Unit codes: 0=pcs, 1=bottles, 2=L, 3=mL, 4=kg, 5=g, 6=boxes
Use ${langNames[lang]} for all item names.
If the image is too blurry or dark to count reliably, return [].`;

  const response = await fetch("/api/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: "You are a precise inventory counting specialist. Always think step by step before answering. Your counts must be as accurate as possible — recount every item type twice before responding.",
      messages: [{
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: mediaType, data: base64Data } },
          { type: "text", text: prompt }
        ]
      }]
    })
  });

  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  const text = data.content?.map(b => b.text || "").join("") || "[]";
  // Extract the JSON array even if the model added thinking text around it
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) return [];
  const clean = match[0].replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

export default function InventoryApp() {
  const [lang, setLang] = useState("en");
  const [items, setItems] = useState(SAMPLE_ITEMS);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name:"", category:0, qty:1, unit:0, location:"" });
  const [listening, setListening] = useState(false);
  const [voiceText, setVoiceText] = useState("");
  const [showVoice, setShowVoice] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [activeTab, setActiveTab] = useState("inventory");
  // Camera scan state
  const [showReport, setShowReport] = useState(false);
  const [reportCSV, setReportCSV] = useState("");
  const [reportDate, setReportDate] = useState("");
  const [downloadOk, setDownloadOk] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [scanImage, setScanImage] = useState(null); // base64 preview url
  const [scanImageData, setScanImageData] = useState(null); // { data, mediaType }
  const [scanning, setScanning] = useState(false);
  const [scanResults, setScanResults] = useState(null);
  const [scanError, setScanError] = useState("");
  const [selectedResults, setSelectedResults] = useState({});

  const nextId = useRef(100);
  const fileInputRef = useRef(null);
  const t = T[lang];
  const isRTL = lang === "ar";

  const filtered = items.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    t.categories_list[i.category].toLowerCase().includes(search.toLowerCase()) ||
    i.location.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setEditItem(null); setForm({ name:"", category:0, qty:1, unit:0, location:"" }); setShowForm(true); };
  const openEdit = (item) => { setEditItem(item.id); setForm({ name:item.name, category:item.category, qty:item.qty, unit:item.unit, location:item.location }); setShowForm(true); };

  const saveForm = () => {
    if (!form.name.trim()) return;
    if (editItem) setItems(prev => prev.map(i => i.id === editItem ? { ...i, ...form } : i));
    else setItems(prev => [...prev, { id: nextId.current++, ...form }]);
    setShowForm(false);
  };

  const deleteItem = (id) => { setItems(prev => prev.filter(i => i.id !== id)); setDeleteId(null); };

  const startVoice = () => {
    setListening(true); setVoiceText("");
    setTimeout(() => {
      const demos = { en: "Add 8 champagne glasses in Dining Room", fr: "Ajouter 3 bouteilles de vin dans Cave", ar: "أضف 6 كؤوس في المطبخ" };
      const heard = demos[lang];
      setVoiceText(heard); setListening(false);
      const parsed = parseVoice(heard, lang);
      setForm({ name: parsed.name, category: parsed.category, qty: parsed.qty, unit: parsed.unit, location: parsed.location });
      setEditItem(null); setShowVoice(false);
      setTimeout(() => setShowForm(true), 200);
    }, 2000);
  };

  // Compress image to under 4MB using canvas, then set state
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setScanResults(null); setScanError(""); setSelectedResults({});

    const reader = new FileReader();
    reader.onload = (ev) => {
      const originalDataUrl = ev.target.result;
      const img = new Image();
      img.onload = () => {
        // Resize so longest side is max 1600px, then compress as JPEG
        const MAX = 1600;
        let { width, height } = img;
        if (width > MAX || height > MAX) {
          if (width > height) { height = Math.round(height * MAX / width); width = MAX; }
          else { width = Math.round(width * MAX / height); height = MAX; }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        // Try decreasing quality until under 4MB
        let quality = 0.85;
        let dataUrl = canvas.toDataURL("image/jpeg", quality);
        while (dataUrl.length * 0.75 > 4 * 1024 * 1024 && quality > 0.2) {
          quality -= 0.1;
          dataUrl = canvas.toDataURL("image/jpeg", quality);
        }

        const base64 = dataUrl.split(",")[1];
        setScanImage(dataUrl);
        setScanImageData({ data: base64, mediaType: "image/jpeg" });
      };
      img.src = originalDataUrl;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const runScan = async () => {
    if (!scanImageData) return;
    setScanning(true); setScanResults(null); setScanError("");
    try {
      const results = await analyzeImageWithClaude(scanImageData.data, scanImageData.mediaType, lang);
      setScanResults(results);
      // Pre-select all results
      const sel = {};
      results.forEach((_, i) => sel[i] = true);
      setSelectedResults(sel);
    } catch (err) {
      setScanError(err.message || "Analysis failed. Please try again.");
    }
    setScanning(false);
  };

  const addScannedItems = () => {
    const toAdd = scanResults.filter((_, i) => selectedResults[i]);
    setItems(prev => [...prev, ...toAdd.map(r => ({
      id: nextId.current++,
      name: r.name, category: r.category ?? 4,
      qty: r.qty ?? 1, unit: r.unit ?? 0, location: ""
    }))]);
    setShowCamera(false); setScanImage(null); setScanImageData(null); setScanResults(null);
  };

  const totalItems = items.reduce((s, i) => s + i.qty, 0);
  const uniqueCats = new Set(items.map(i => i.category)).size;
  const byCategory = t.categories_list.map((cat, idx) => ({
    name: cat, icon: CATEGORY_ICONS[idx],
    count: items.filter(i => i.category === idx).length,
    qty: items.filter(i => i.category === idx).reduce((s, i) => s + i.qty, 0),
  })).filter(c => c.count > 0);

  return (
    <div dir={isRTL ? "rtl" : "ltr"} style={{
      fontFamily: isRTL ? "'Noto Sans Arabic', sans-serif" : "'DM Sans', sans-serif",
      background: "#f0f4f8", minHeight: "100vh", maxWidth: 480,
      margin: "0 auto", display: "flex", flexDirection: "column",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Noto+Sans+Arabic:wght@400;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input, select { font-family: inherit; outline: none; }
        button { font-family: inherit; cursor: pointer; border: none; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: #cbd5e0; border-radius: 2px; }
        @keyframes slideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        .card { animation: slideUp 0.3s ease; }
        .mic-pulse { animation: pulse 0.8s ease infinite; }
        .fade { animation: fadeIn 0.2s ease; }
        .spin { animation: spin 1s linear infinite; }
        .shimmer {
          background: linear-gradient(90deg, #edf2f7 25%, #e2e8f0 50%, #edf2f7 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
      `}</style>

      {/* Top Bar */}
      <div style={{ background: "#1a202c", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" }}>{t.title}</div>
          <div style={{ fontSize: 11, color: "#718096", letterSpacing: "0.05em" }}>{t.subtitle}</div>
        </div>
        <div style={{ display: "flex", background: "#2d3748", borderRadius: 8, overflow: "hidden" }}>
          {Object.entries(LANG_LABELS).map(([code]) => (
            <button key={code} onClick={() => setLang(code)} style={{
              padding: "5px 10px", fontSize: 11, fontWeight: 600,
              background: lang === code ? "#4299e1" : "transparent",
              color: lang === code ? "#fff" : "#718096", transition: "all 0.15s",
            }}>{code.toUpperCase()}</button>
          ))}
        </div>
      </div>

      {/* Stats Bar */}
      <div style={{ background: "#2d3748", padding: "12px 20px", display: "flex", gap: 24, justifyContent: "center" }}>
        {[
          { label: t.items, val: items.length, color: "#63b3ed" },
          { label: t.total, val: totalItems, color: "#68d391" },
          { label: t.categories, val: uniqueCats, color: "#f6ad55" },
        ].map(({ label, val, color }) => (
          <div key={label} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 700, color }}>{val}</div>
            <div style={{ fontSize: 10, color: "#718096", letterSpacing: "0.05em" }}>{label.toUpperCase()}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", background: "#fff", borderBottom: "2px solid #e2e8f0" }}>
        {["inventory", "stats"].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            flex: 1, padding: "12px", fontSize: 13, fontWeight: 600, background: "transparent",
            color: activeTab === tab ? "#4299e1" : "#718096",
            borderBottom: activeTab === tab ? "2px solid #4299e1" : "2px solid transparent",
            marginBottom: -2, transition: "all 0.15s",
          }}>{tab === "inventory" ? t.items : "📊 Stats"}</button>
        ))}
      </div>

      {/* Search & Actions */}
      <div style={{ padding: "12px 16px", display: "flex", gap: 8, background: "#fff", borderBottom: "1px solid #e2e8f0" }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", background: "#f7fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "0 12px" }}>
          <span style={{ color: "#a0aec0", marginRight: 8 }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t.search}
            style={{ flex: 1, background: "transparent", border: "none", fontSize: 13, color: "#2d3748", padding: "9px 0" }} />
        </div>
        {/* Camera button */}
        <button onClick={() => { setShowCamera(true); setScanImage(null); setScanResults(null); setScanError(""); }} style={{
          background: "#e9d8fd", color: "#805ad5", borderRadius: 10, padding: "0 12px", fontSize: 18,
        }} title={t.camera}>📷</button>
        <button onClick={() => setShowVoice(true)} style={{
          background: "#ebf8ff", color: "#3182ce", borderRadius: 10, padding: "0 12px", fontSize: 18,
        }}>🎙</button>
        <button onClick={openAdd} style={{
          background: "#4299e1", color: "#fff", borderRadius: 10, padding: "0 14px", fontSize: 13, fontWeight: 600,
        }}>+ {t.addItem}</button>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {activeTab === "inventory" ? (
          filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 20px", color: "#a0aec0" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📦</div>
              <div style={{ fontSize: 14 }}>{t.noItems}</div>
            </div>
          ) : (
            filtered.map(item => (
              <div key={item.id} className="card" style={{
                background: "#fff", borderRadius: 14, padding: "14px 16px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.08)", display: "flex", alignItems: "center", gap: 14,
              }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "#ebf8ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                  {CATEGORY_ICONS[item.category]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 15, color: "#1a202c", marginBottom: 2 }}>{item.name}</div>
                  <div style={{ fontSize: 11, color: "#718096", display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <span>{t.categories_list[item.category]}</span>
                    {item.location && <><span>·</span><span>📍 {item.location}</span></>}
                  </div>
                </div>
                <div style={{ textAlign: "center", flexShrink: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 18, color: "#2b6cb0" }}>{item.qty}</div>
                  <div style={{ fontSize: 10, color: "#a0aec0" }}>{t.units_list[item.unit] || "pcs"}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
                  <button onClick={() => openEdit(item)} style={{ background: "#f7fafc", color: "#4299e1", borderRadius: 7, padding: "5px 10px", fontSize: 11, fontWeight: 600 }}>✏</button>
                  <button onClick={() => setDeleteId(item.id)} style={{ background: "#fff5f5", color: "#fc8181", borderRadius: 7, padding: "5px 10px", fontSize: 11 }}>🗑</button>
                </div>
              </div>
            ))
          )
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#4a5568", padding: "4px 0" }}>By Category</div>
            {byCategory.map(cat => (
              <div key={cat.name} className="card" style={{ background: "#fff", borderRadius: 14, padding: "14px 16px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "#2d3748" }}>{cat.icon} {cat.name}</div>
                  <div style={{ fontSize: 12, color: "#718096" }}>{cat.count} items · {cat.qty} units</div>
                </div>
                <div style={{ background: "#edf2f7", borderRadius: 6, height: 8, overflow: "hidden" }}>
                  <div style={{ width: `${Math.min(100,(cat.qty/totalItems)*100)}%`, height: "100%", background: "#4299e1", borderRadius: 6, transition: "width 0.5s ease" }} />
                </div>
              </div>
            ))}
            {byCategory.length === 0 && <div style={{ textAlign: "center", color: "#a0aec0", padding: 40 }}>No data yet</div>}
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div style={{ padding: "12px 16px", background: "#fff", borderTop: "1px solid #e2e8f0" }}>
        <button onClick={() => { const r = buildCSV(items, lang); setReportCSV(r.csv); setReportDate(r.date); setDownloadOk(null); setShowReport(true); }} style={{
          width: "100%", background: "#2d3748", color: "#fff", borderRadius: 12,
          padding: "13px", fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}>📄 {t.report}</button>
      </div>

      {/* ── CAMERA SCAN MODAL ── */}
      {showCamera && (
        <div className="fade" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", flexDirection: "column", zIndex: 60 }}>
          {/* Header */}
          <div style={{ background: "#1a202c", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontWeight: 700, fontSize: 16, color: "#fff" }}>📷 {t.camera}</div>
            <button onClick={() => setShowCamera(false)} style={{ background: "#2d3748", color: "#a0aec0", borderRadius: 8, padding: "6px 12px", fontSize: 13 }}>✕</button>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>

            {/* Upload zone */}
            {!scanImage ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: "2px dashed #4299e1", borderRadius: 16, padding: "48px 24px",
                  textAlign: "center", cursor: "pointer", background: "rgba(66,153,225,0.05)",
                  transition: "all 0.2s",
                }}
              >
                <div style={{ fontSize: 52, marginBottom: 16 }}>📷</div>
                <div style={{ fontWeight: 600, fontSize: 16, color: "#e2e8f0", marginBottom: 8 }}>{t.takePhoto}</div>
                <div style={{ fontSize: 12, color: "#718096" }}>{t.scanHint}</div>
                <div style={{ marginTop: 20, background: "#4299e1", color: "#fff", borderRadius: 10, padding: "12px 24px", display: "inline-block", fontWeight: 600, fontSize: 14 }}>
                  Choose File
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileSelect} style={{ display: "none" }} />
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {/* Preview */}
                <div style={{ borderRadius: 14, overflow: "hidden", position: "relative" }}>
                  <img src={scanImage} alt="scan" style={{ width: "100%", maxHeight: 280, objectFit: "cover", display: "block" }} />
                  <button
                    onClick={() => { setScanImage(null); setScanImageData(null); setScanResults(null); setScanError(""); }}
                    style={{ position: "absolute", top: 10, right: 10, background: "rgba(0,0,0,0.6)", color: "#fff", borderRadius: "50%", width: 30, height: 30, fontSize: 14 }}
                  >✕</button>
                </div>

                {/* Scan button */}
                {!scanResults && !scanning && (
                  <button onClick={runScan} style={{
                    background: "linear-gradient(135deg, #805ad5, #4299e1)",
                    color: "#fff", borderRadius: 12, padding: "14px",
                    fontWeight: 700, fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                  }}>
                    🔍 Analyze with AI
                  </button>
                )}

                {/* Scanning state */}
                {scanning && (
                  <div style={{ background: "#1a202c", borderRadius: 14, padding: "24px", textAlign: "center" }}>
                    <div className="spin" style={{ width: 40, height: 40, border: "3px solid #4299e1", borderTopColor: "transparent", borderRadius: "50%", margin: "0 auto 16px" }} />
                    <div style={{ fontSize: 14, color: "#e2e8f0", fontWeight: 600 }}>{t.analyzing}</div>
                    <div style={{ fontSize: 12, color: "#718096", marginTop: 6 }}>Claude Vision is scanning your image…</div>
                  </div>
                )}

                {/* Error */}
                {scanError && (
                  <div style={{ background: "#1a0a0a", border: "1px solid #fc8181", borderRadius: 12, padding: "14px 16px", color: "#fc8181", fontSize: 13 }}>
                    ⚠ {scanError}
                    <button onClick={runScan} style={{ marginLeft: 12, background: "transparent", border: "1px solid #fc8181", borderRadius: 6, padding: "4px 10px", color: "#fc8181", fontSize: 11, cursor: "pointer" }}>Retry</button>
                  </div>
                )}

                {/* Results */}
                {scanResults && scanResults.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ fontSize: 13, color: "#e2e8f0", fontWeight: 600 }}>{t.scanResult}</div>
                    <div style={{ fontSize: 11, color: "#718096", background: "#1a202c", borderRadius: 8, padding: "8px 12px", border: "1px solid #2d3748" }}>
                      🔍 AI used left-to-right grid counting with double verification. Green = high confidence, yellow = partially obscured, red = estimated.
                    </div>
                    {scanResults.map((r, i) => (
                      <div key={i} onClick={() => setSelectedResults(s => ({ ...s, [i]: !s[i] }))}
                        style={{
                          background: selectedResults[i] ? "#1a365d" : "#1a202c",
                          border: `2px solid ${selectedResults[i] ? "#4299e1" : "#2d3748"}`,
                          borderRadius: 12, padding: "12px 14px", cursor: "pointer",
                          display: "flex", alignItems: "center", gap: 12, transition: "all 0.15s",
                        }}>
                        <div style={{ width: 24, height: 24, borderRadius: 6, background: selectedResults[i] ? "#4299e1" : "#2d3748", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>
                          {selectedResults[i] ? "✓" : ""}
                        </div>
                        <div style={{ fontSize: 22, flexShrink: 0 }}>{CATEGORY_ICONS[r.category ?? 4]}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: 14, color: "#e2e8f0" }}>{r.name}</div>
                          <div style={{ fontSize: 11, color: "#718096", marginTop: 2 }}>
                            {r.qty} {t.units_list[r.unit ?? 0]} · {t.categories_list[r.category ?? 4]}
                          </div>
                        </div>
                        {/* Confidence badge */}
                        <div style={{
                          background: r.confidence >= 85 ? "#276749" : r.confidence >= 65 ? "#744210" : "#63171b",
                          color: r.confidence >= 85 ? "#9ae6b4" : r.confidence >= 65 ? "#fbd38d" : "#feb2b2",
                          borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700, flexShrink: 0,
                        }}>{r.confidence}%</div>
                      </div>
                    ))}

                    {/* Add selected */}
                    <button onClick={addScannedItems} disabled={!Object.values(selectedResults).some(Boolean)} style={{
                      background: Object.values(selectedResults).some(Boolean) ? "#38a169" : "#2d3748",
                      color: "#fff", borderRadius: 12, padding: "14px",
                      fontWeight: 700, fontSize: 14, marginTop: 4, transition: "background 0.2s",
                    }}>
                      ✅ {t.addAll} ({Object.values(selectedResults).filter(Boolean).length})
                    </button>
                  </div>
                )}

                {scanResults && scanResults.length === 0 && (
                  <div style={{ background: "#1a202c", borderRadius: 12, padding: "20px", textAlign: "center", color: "#718096", fontSize: 13 }}>
                    😕 No items detected. Try a clearer photo with better lighting.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fade" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "flex-end", zIndex: 50 }}
          onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div style={{ background: "#fff", borderRadius: "20px 20px 0 0", padding: "24px 20px", width: "100%", maxWidth: 480, margin: "0 auto" }}>
            <div style={{ fontWeight: 700, fontSize: 17, color: "#1a202c", marginBottom: 18 }}>{editItem ? t.edit : t.addItem}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} placeholder={t.name}
                style={{ background: "#f7fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "11px 14px", fontSize: 14 }} />
              <div style={{ display: "flex", gap: 10 }}>
                <select value={form.category} onChange={e => setForm(f=>({...f,category:+e.target.value}))}
                  style={{ flex: 1, background: "#f7fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "11px 14px", fontSize: 14 }}>
                  {t.categories_list.map((c,i) => <option key={i} value={i}>{CATEGORY_ICONS[i]} {c}</option>)}
                </select>
                <input type="number" value={form.qty} onChange={e => setForm(f=>({...f,qty:+e.target.value}))} placeholder={t.qty} min={1}
                  style={{ width: 80, background: "#f7fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "11px 14px", fontSize: 14 }} />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <select value={form.unit} onChange={e => setForm(f=>({...f,unit:+e.target.value}))}
                  style={{ flex: 1, background: "#f7fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "11px 14px", fontSize: 14 }}>
                  {t.units_list.map((u,i) => <option key={i} value={i}>{u}</option>)}
                </select>
                <input value={form.location} onChange={e => setForm(f=>({...f,location:e.target.value}))} placeholder={t.location}
                  style={{ flex: 1, background: "#f7fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "11px 14px", fontSize: 14 }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
              <button onClick={() => setShowForm(false)} style={{ flex: 1, background: "#edf2f7", color: "#718096", borderRadius: 10, padding: "13px", fontWeight: 600, fontSize: 14 }}>{t.cancel}</button>
              <button onClick={saveForm} style={{ flex: 2, background: "#4299e1", color: "#fff", borderRadius: 10, padding: "13px", fontWeight: 600, fontSize: 14 }}>{t.save}</button>
            </div>
          </div>
        </div>
      )}

      {/* Voice Modal */}
      {showVoice && (
        <div className="fade" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}
          onClick={e => e.target === e.currentTarget && !listening && setShowVoice(false)}>
          <div style={{ background: "#fff", borderRadius: 20, padding: "32px 24px", width: 320, textAlign: "center" }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#2d3748", marginBottom: 6 }}>{t.voice}</div>
            <div style={{ fontSize: 12, color: "#a0aec0", marginBottom: 24 }}>{t.voiceHint}</div>
            <button onClick={startVoice} disabled={listening} className={listening ? "mic-pulse" : ""} style={{
              width: 80, height: 80, borderRadius: "50%", background: listening ? "#fc8181" : "#4299e1",
              color: "#fff", fontSize: 32, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px",
            }}>🎙</button>
            <div style={{ fontSize: 13, color: listening ? "#e53e3e" : "#718096", fontWeight: listening ? 600 : 400 }}>
              {listening ? t.listening : "Tap to speak"}
            </div>
            {voiceText && <div style={{ marginTop: 12, fontSize: 12, color: "#4a5568", background: "#f7fafc", borderRadius: 8, padding: "8px 12px" }}>"{voiceText}"</div>}
            {!listening && <button onClick={() => setShowVoice(false)} style={{ marginTop: 16, background: "transparent", color: "#a0aec0", fontSize: 13 }}>{t.cancel}</button>}
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReport && (
        <div className="fade" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", flexDirection: "column", zIndex: 60 }}>
          {/* Header */}
          <div style={{ background: "#1a202c", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: "#fff" }}>📄 {t.reportTitle}</div>
              <div style={{ fontSize: 10, color: "#718096", marginTop: 2 }}>{reportDate} · {items.length} {t.items}</div>
            </div>
            <button onClick={() => setShowReport(false)} style={{ background: "#2d3748", color: "#a0aec0", borderRadius: 8, padding: "6px 12px", fontSize: 13 }}>✕</button>
          </div>

          {/* Table */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
            {/* Summary row */}
            <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
              {[
                { label: t.items, val: items.length, color: "#63b3ed" },
                { label: t.total, val: items.reduce((s,i)=>s+i.qty,0), color: "#68d391" },
                { label: t.categories, val: new Set(items.map(i=>i.category)).size, color: "#f6ad55" },
              ].map(({ label, val, color }) => (
                <div key={label} style={{ flex: 1, background: "#1a202c", borderRadius: 10, padding: "10px", textAlign: "center", border: `1px solid ${color}33` }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color }}>{val}</div>
                  <div style={{ fontSize: 9, color: "#718096", letterSpacing: "0.05em" }}>{label.toUpperCase()}</div>
                </div>
              ))}
            </div>

            {/* Column headers */}
            <div style={{
              display: "grid", gridTemplateColumns: "2fr 1.2fr 0.7fr 0.7fr 1fr",
              gap: 1, background: "#2d3748", borderRadius: "10px 10px 0 0",
              padding: "10px 14px", marginBottom: 1,
            }}>
              {["Item Name", "Category", "Qty", "Unit", "Location"].map(h => (
                <div key={h} style={{ fontSize: 10, fontWeight: 700, color: "#a0aec0", letterSpacing: "0.1em", textTransform: "uppercase" }}>{h}</div>
              ))}
            </div>

            {/* Rows */}
            <div style={{ borderRadius: "0 0 10px 10px", overflow: "hidden", border: "1px solid #2d3748" }}>
              {items.map((item, idx) => (
                <div key={item.id} style={{
                  display: "grid", gridTemplateColumns: "2fr 1.2fr 0.7fr 0.7fr 1fr",
                  gap: 1, padding: "11px 14px", alignItems: "center",
                  background: idx % 2 === 0 ? "#1a202c" : "#171e29",
                  borderBottom: idx < items.length - 1 ? "1px solid #2d3748" : "none",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 14 }}>{CATEGORY_ICONS[item.category]}</span>
                    <span style={{ fontSize: 13, color: "#e2e8f0", fontWeight: 500 }}>{item.name}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#718096" }}>{t.categories_list[item.category]}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#63b3ed" }}>{item.qty}</div>
                  <div style={{ fontSize: 11, color: "#718096" }}>{t.units_list[item.unit]}</div>
                  <div style={{ fontSize: 12, color: "#718096" }}>{item.location || "—"}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Download bar */}
          <div style={{ padding: "12px 16px", background: "#1a202c", borderTop: "1px solid #2d3748", display: "flex", flexDirection: "column", gap: 8 }}>
            <button
              onClick={() => {
                const ok = downloadCSV(reportCSV, reportDate);
                setDownloadOk(ok);
              }}
              style={{
                width: "100%", background: "linear-gradient(135deg, #2b6cb0, #4299e1)",
                color: "#fff", borderRadius: 12, padding: "13px", fontWeight: 700,
                fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}
            >⬇ Download CSV</button>
            {downloadOk === true && (
              <div style={{ textAlign: "center", fontSize: 12, color: "#68d391" }}>✓ Downloaded successfully — open in Excel or Google Sheets</div>
            )}
            {downloadOk === false && (
              <div style={{ fontSize: 11, color: "#718096", textAlign: "center" }}>
                Download blocked in preview. Copy the data below to use it:
                <textarea readOnly value={reportCSV} rows={4}
                  style={{ display: "block", width: "100%", marginTop: 8, background: "#0d1117", border: "1px solid #30363d", borderRadius: 8, padding: "8px", color: "#c9d1d9", fontSize: 11, fontFamily: "monospace", resize: "none" }}
                  onClick={e => e.target.select()}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fade" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: "24px", width: 280, textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🗑️</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#2d3748", marginBottom: 20 }}>{t.confirmDelete}</div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setDeleteId(null)} style={{ flex: 1, background: "#edf2f7", color: "#718096", borderRadius: 10, padding: "11px", fontWeight: 600, fontSize: 14 }}>{t.cancel}</button>
              <button onClick={() => deleteItem(deleteId)} style={{ flex: 1, background: "#fc8181", color: "#fff", borderRadius: 10, padding: "11px", fontWeight: 600, fontSize: 14 }}>{t.delete}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
