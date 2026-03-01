import { useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

// ⚙️ VITE ENV VARS — zet deze in je .env bestand
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function dbGet(key) {
  const { data } = await supabase.from("moestuin_storage").select("value").eq("key", key).single();
  return data ? JSON.parse(data.value) : null;
}
async function dbSet(key, value) {
  await supabase.from("moestuin_storage").upsert({ key, value: JSON.stringify(value) }, { onConflict: "key" });
}

const MONTHS = ["jan","feb","mrt","apr","mei","jun","jul","aug","sep","okt","nov","dec"];
const TODAY = new Date();
const CURRENT_MONTH = TODAY.getMonth();

const PLANT_DATABASE = {
  "Aardbei":         { emoji:"🍓", color:"#f28b82", bg:"#fde8e6", tasks:{ 0:["Controleer of planten de vorst overleefd hebben","Verwijder dood blad"], 1:["Geef eerste mest (stikstofrijk)","Controleer op onkruid"], 2:["Mulch aanbrengen rond planten","Controleer op bloei"], 3:["Regelmatig water geven","Verwijder uitlopers"], 4:["Oogsten zodra rood en rijp","Verwijder zieke vruchten"], 5:["Blijf oogsten","Geef water bij droogte"], 6:["Oogst bijna klaar","Snoei na oogst"], 7:["Snoei oude bladeren weg","Geef bemesting na oogst"], 8:["Plant nieuwe uitlopers","Onkruid verwijderen"], 9:["Mulch aanbrengen voor winter"], 10:["Afdekken met stro bij vorst"], 11:["Controleer winterbescherming"] }},
  "Tomaat":          { emoji:"🍅", color:"#e8735a", bg:"#fde8e2", tasks:{ 1:["Start zaailingen binnen"], 2:["Zaai binnen op warme plek (>20°C)"], 3:["Verseel zaailingen naar grotere pot","Begin met verharden"], 4:["Plant buiten na laatste vorst","Steun plaatsen"], 5:["Diefscheuten verwijderen","Geef water aan voet"], 6:["Blijf diefscheuten verwijderen","Geef tomatenmest"], 7:["Oogsten bij rode kleur","Geef regelmatig water"], 8:["Oogsten","Verwijder zieke bladeren"], 9:["Laatste tomaten oogsten of naar binnen halen"], 10:["Ruim plantenresten op"] }},
  "Courgette":       { emoji:"🥒", color:"#6abf8a", bg:"#e4f5ec", tasks:{ 2:["Zaai binnen op warme plek"], 3:["Verspeel zaailingen"], 4:["Plant buiten na vorst"], 5:["Geef ruim water","Verwijder eerste vrouwelijke bloemen"], 6:["Oogst regelmatig kleine courgettes"], 7:["Blijf oogsten, laat niet te groot worden"], 8:["Laatste oogst"], 9:["Ruim af"] }},
  "Sla":             { emoji:"🥗", color:"#82c96e", bg:"#e8f8e2", tasks:{ 1:["Zaai binnen voor vroege oogst"], 2:["Plant buiten onder vliesdoek"], 3:["Dunnen op 5cm afstand","Water geven"], 4:["Oogst buitenste bladeren","Zaai nieuwe rij"], 5:["Blijf oogsten","Zaai voor herfstteelt"], 6:["Pas op voor schieten bij hitte"], 7:["Herfstteelt zaaien"], 8:["Plant herfst-sla buiten"], 9:["Oogst herfst-sla"], 10:["Laatste sla oogsten"] }},
  "Zoete aardappel": { emoji:"🍠", color:"#f0a060", bg:"#fef0e2", tasks:{ 2:["Bestel pootgoed (slips)"], 3:["Prepareer slips op warme plek (>20°C)"], 4:["Plant slips na laatste vorst"], 5:["Plant slips buiten, geef veel ruimte","Water geven"], 6:["Wied onkruid rondom ranken"], 7:["Geef water bij droogte"], 8:["Oogst als bladeren geel worden"], 9:["Oogst vóór eerste vorst!","Laat knollen drogen in de zon"], 10:["Bewaar op droge warme plek (13°C)"] }},
  "Pompoen":         { emoji:"🎃", color:"#e8924a", bg:"#fdeee0", tasks:{ 2:["Zaai binnen op warme plek"], 3:["Verspeel naar grotere pot"], 4:["Plant buiten na vorst, veel ruimte nodig"], 5:["Geef veel water, ruimte voor ranken"], 6:["Bestuif bloemen met kwastje"], 7:["Geef kaliummest voor vruchtvorming"], 8:["Oogst als steel verdroogd is"], 9:["Bewaar op koele droge plek"] }},
  "Wortel":          { emoji:"🥕", color:"#f0a060", bg:"#fef0e2", tasks:{ 2:["Zaai direct in de grond (min. 5°C)"], 3:["Dunnen op 5cm afstand","Onkruid verwijderen"], 4:["Regelmatig water geven"], 5:["Controleer op wortelvlieg"], 6:["Begin met oogsten als dik genoeg"], 7:["Oogsten","Zaai voor herfst"], 8:["Herfst zaai"], 9:["Oogst herfst-wortels"], 10:["Bewaar wortels in zand in kelder"] }},
  "Bloemkool":       { emoji:"🥦", color:"#a0b8a0", bg:"#eaf2ea", tasks:{ 0:["Zaai binnen voor vroege teelt"], 1:["Verspeel zaailingen"], 2:["Verharden en buiten plaatsen"], 3:["Plant in koele periode buiten"], 4:["Geef regelmatig water","Mulch aanbrengen"], 5:["Bind bladeren over kool voor witte kleur"], 6:["Oogst als kool compact is"], 7:["Zaai voor herfstteelt"], 8:["Plant herfstteelt buiten"], 9:["Oogst herfstbloemkool"] }},
  "Kruid":           { emoji:"🌿", color:"#5ab898", bg:"#e0f5ee", tasks:{ 2:["Zaai kruiden binnen"], 3:["Verspeel en begin te verharden"], 4:["Plant buiten"], 5:["Oogst regelmatig voor compacte groei"], 6:["Zaai 2e ronde"], 7:["Laat niet bloeien (tenzij zaad gewenst)"], 8:["Oogst en droog voor winter"], 9:["Bescherm delicate kruiden"], 10:["Snoei terug voor winter"] }},
  "Bloemen":         { emoji:"🌸", color:"#c9a0d8", bg:"#f5edfb", tasks:{ 1:["Zaai eenjarigen binnen"], 2:["Verspeel zaailingen"], 3:["Verharden"], 4:["Plant buiten na vorst"], 5:["Geef water en mest","Verwijder verwelkte bloemen"], 6:["Oogst bloemen voor vaas"], 7:["Blijf oogsten"], 8:["Zaad verzamelen"], 9:["Bollen planten (tulp, narcis)"], 10:["Ruim eenjarigen op"] }},
  "Ui / Prei":       { emoji:"🧅", color:"#d4a844", bg:"#faf0d8", tasks:{ 1:["Zaai ui/prei binnen"], 2:["Verspeel zaailingen"], 3:["Plant buiten (prei)"], 4:["Geef mest","Onkruid wieden"], 5:["Geef water bij droogte"], 6:["Controleer op trips (insect)"], 7:["Begin oogsten van uien als loof omvalt"], 8:["Oogst uien","Droog goed voor bewaring"], 9:["Plant prei voor herfst/winter"] }},
  "Boon":            { emoji:"🫘", color:"#a080c8", bg:"#ede0f8", tasks:{ 3:["Zaai bonen direct buiten na vorst"], 4:["Dunnen en steun plaatsen (stokboon)"], 5:["Geef water bij droogte"], 6:["Oogst regelmatig voor meer productie"], 7:["Blijf oogsten","Geef water"], 8:["Laatste oogst"], 9:["Ruim plantenresten op"] }},
};

// Determine emoji and color locally based on plant name keywords
function getPlantStyle(name) {
  const n = name.toLowerCase();
  // Bloemen
  if (n.includes("dahlia")) return { emoji:"🌸", color:"#c050a0", bg:"#faeaf6" };
  if (n.includes("roos") || n.includes("rose")) return { emoji:"🌹", color:"#c03060", bg:"#fde8ef" };
  if (n.includes("tulp") || n.includes("tulip")) return { emoji:"🌷", color:"#e05878", bg:"#fdeef2" };
  if (n.includes("zonnebloem") || n.includes("sunflower")) return { emoji:"🌻", color:"#e8a820", bg:"#fef8e2" };
  if (n.includes("lavendel") || n.includes("lavender")) return { emoji:"💜", color:"#8060b0", bg:"#f0eaf8" };
  if (n.includes("hortensia") || n.includes("hydrangea")) return { emoji:"💐", color:"#7080c8", bg:"#eaecf8" };
  if (n.includes("pioenroos") || n.includes("peony")) return { emoji:"🌸", color:"#e070a0", bg:"#faeef6" };
  if (n.includes("narcis") || n.includes("daffodil")) return { emoji:"🌼", color:"#e8c020", bg:"#fef9e0" };
  if (n.includes("krokus") || n.includes("crocus")) return { emoji:"🌷", color:"#9060c0", bg:"#f2eaf8" };
  if (n.includes("hyacint") || n.includes("hyacinth")) return { emoji:"💐", color:"#6070c8", bg:"#eaecf8" };
  if (n.includes("margri") || n.includes("daisy") || n.includes("madelie")) return { emoji:"🌼", color:"#e8d840", bg:"#fefce0" };
  if (n.includes("aster")) return { emoji:"🌸", color:"#a060c0", bg:"#f2eaf8" };
  if (n.includes("geranium") || n.includes("pelargonium")) return { emoji:"🌺", color:"#e05050", bg:"#fdeaea" };
  if (n.includes("begonia")) return { emoji:"🌺", color:"#e06070", bg:"#fde8ef" };
  if (n.includes("fuchsia")) return { emoji:"🌸", color:"#c030a0", bg:"#f8eaf6" };
  if (n.includes("marigold") || n.includes("goudsbloem")) return { emoji:"🌼", color:"#e89020", bg:"#fef5e0" };
  if (n.includes("cosmea") || n.includes("cosmos")) return { emoji:"🌸", color:"#d870b0", bg:"#faeef8" };
  if (n.includes("leeuwenbek") || n.includes("snapdragon")) return { emoji:"🌸", color:"#e06080", bg:"#fde8ef" };
  if (n.includes("verbena")) return { emoji:"💜", color:"#9050c0", bg:"#f2eaf8" };
  if (n.includes("lobelia")) return { emoji:"💙", color:"#4060c8", bg:"#eaeef8" };
  if (n.includes("petunia")) return { emoji:"🌸", color:"#c040b0", bg:"#f8eaf6" };
  if (n.includes("zinnia")) return { emoji:"🌺", color:"#e05030", bg:"#fde8e4" };
  if (n.includes("sweetpea") || n.includes("lathyrus") || n.includes("lathirus")) return { emoji:"🌸", color:"#d080c0", bg:"#f8eef8" };
  if (n.includes("vergeet") || n.includes("forget")) return { emoji:"💙", color:"#5080d0", bg:"#eaf0f8" };
  if (n.includes("alium") || n.includes("sierui")) return { emoji:"💜", color:"#9060b0", bg:"#f2eaf8" };
  if (n.includes("bloem") || n.includes("flower")) return { emoji:"🌸", color:"#c9a0d8", bg:"#f5edfb" };
  // Groenten
  if (n.includes("tomaat") || n.includes("tomato")) return { emoji:"🍅", color:"#e8735a", bg:"#fde8e2" };
  if (n.includes("aardbei") || n.includes("strawberry")) return { emoji:"🍓", color:"#f28b82", bg:"#fde8e6" };
  if (n.includes("pompoen") || n.includes("pumpkin")) return { emoji:"🎃", color:"#e8924a", bg:"#fdeee0" };
  if (n.includes("wortel") || n.includes("carrot")) return { emoji:"🥕", color:"#f0a060", bg:"#fef0e2" };
  if (n.includes("sla") || n.includes("lettuce")) return { emoji:"🥗", color:"#82c96e", bg:"#e8f8e2" };
  if (n.includes("courgette") || n.includes("zucchini")) return { emoji:"🥒", color:"#6abf8a", bg:"#e4f5ec" };
  if (n.includes("komkommer") || n.includes("cucumber")) return { emoji:"🥒", color:"#5aaf7a", bg:"#e4f5ec" };
  if (n.includes("broccoli")) return { emoji:"🥦", color:"#4a9a60", bg:"#e4f5ec" };
  if (n.includes("bloemkool") || n.includes("cauliflower")) return { emoji:"🥦", color:"#a0b8a0", bg:"#eaf2ea" };
  if (n.includes("spruitjes") || n.includes("brussels")) return { emoji:"🥦", color:"#5aaa70", bg:"#e4f5ec" };
  if (n.includes("spinazie") || n.includes("spinach")) return { emoji:"🌿", color:"#4a9850", bg:"#e4f5ec" };
  if (n.includes("snijbiet") || n.includes("chard")) return { emoji:"🌿", color:"#c03030", bg:"#fde8e8" };
  if (n.includes("boerenkool") || n.includes("kale")) return { emoji:"🥬", color:"#3a8848", bg:"#e4f5ec" };
  if (n.includes("andijvie") || n.includes("endive")) return { emoji:"🥬", color:"#70a858", bg:"#eaf5e4" };
  if (n.includes("venkel") || n.includes("fennel")) return { emoji:"🌿", color:"#60b880", bg:"#e4f5ec" };
  if (n.includes("paprika") || n.includes("pepper") || n.includes("peper")) return { emoji:"🫑", color:"#e84830", bg:"#fdeaea" };
  if (n.includes("aubergine") || n.includes("eggplant")) return { emoji:"🍆", color:"#6030a0", bg:"#ede8f8" };
  if (n.includes("radijs") || n.includes("radish")) return { emoji:"🌸", color:"#e03050", bg:"#fde8ef" };
  if (n.includes("kool") || n.includes("cabbage")) return { emoji:"🥬", color:"#60a050", bg:"#eaf5e4" };
  if (n.includes("erwt") || n.includes("pea")) return { emoji:"🫛", color:"#70b840", bg:"#eef8e0" };
  if (n.includes("boon") || n.includes("bean")) return { emoji:"🫘", color:"#a080c8", bg:"#ede0f8" };
  if (n.includes("mais") || n.includes("corn")) return { emoji:"🌽", color:"#e8c030", bg:"#fef8e0" };
  if (n.includes("zoete aardappel") || n.includes("sweet potato")) return { emoji:"🍠", color:"#e07840", bg:"#fef0e2" };
  if (n.includes("aardappel") || n.includes("potato")) return { emoji:"🥔", color:"#c8a050", bg:"#faf0d8" };
  if (n.includes("ui") || n.includes("onion")) return { emoji:"🧅", color:"#d4a844", bg:"#faf0d8" };
  if (n.includes("prei") || n.includes("leek")) return { emoji:"🧅", color:"#70a840", bg:"#eaf5e4" };
  if (n.includes("knoflook") || n.includes("garlic")) return { emoji:"🧄", color:"#c0b080", bg:"#f8f5e8" };
  if (n.includes("asperge") || n.includes("asparagus")) return { emoji:"🌿", color:"#60a860", bg:"#e4f5ec" };
  if (n.includes("selderij") || n.includes("celery")) return { emoji:"🌿", color:"#70b060", bg:"#eaf5e4" };
  if (n.includes("pastinaak") || n.includes("parsnip")) return { emoji:"🥕", color:"#e0c080", bg:"#faf5e0" };
  if (n.includes("biet") || n.includes("beet")) return { emoji:"🫚", color:"#b03060", bg:"#fde8ef" };
  // Kruiden
  if (n.includes("basilicum") || n.includes("basil")) return { emoji:"🌿", color:"#4aaa68", bg:"#e4f5ec" };
  if (n.includes("peterselie") || n.includes("parsley")) return { emoji:"🌿", color:"#58b060", bg:"#e4f5ec" };
  if (n.includes("munt") || n.includes("mint")) return { emoji:"🌿", color:"#40c080", bg:"#e0f8f0" };
  if (n.includes("rozemarijn") || n.includes("rosemary")) return { emoji:"🌿", color:"#5890a0", bg:"#e4f0f5" };
  if (n.includes("tijm") || n.includes("thyme")) return { emoji:"🌿", color:"#808040", bg:"#f0f0e0" };
  if (n.includes("oregano")) return { emoji:"🌿", color:"#888040", bg:"#f0f0e0" };
  if (n.includes("dille") || n.includes("dill")) return { emoji:"🌿", color:"#70a850", bg:"#eaf5e4" };
  if (n.includes("bieslook") || n.includes("chive")) return { emoji:"🌿", color:"#609840", bg:"#eaf5e4" };
  if (n.includes("salie") || n.includes("sage")) return { emoji:"🌿", color:"#90a870", bg:"#eef2ea" };
  if (n.includes("kruid") || n.includes("herb")) return { emoji:"🌿", color:"#5ab898", bg:"#e0f5ee" };
  // Fruit
  if (n.includes("appel") || n.includes("apple")) return { emoji:"🍎", color:"#d04040", bg:"#fdeaea" };
  if (n.includes("peer") || n.includes("pear")) return { emoji:"🍐", color:"#90b840", bg:"#f0f8e0" };
  if (n.includes("kers") || n.includes("cherry")) return { emoji:"🍒", color:"#c03050", bg:"#fde8ec" };
  if (n.includes("pruim") || n.includes("plum")) return { emoji:"🍑", color:"#8050a0", bg:"#f0e8f8" };
  if (n.includes("perzik") || n.includes("peach") || n.includes("nectarine")) return { emoji:"🍑", color:"#e89060", bg:"#fef0e8" };
  if (n.includes("druif") || n.includes("grape") || n.includes("wijnstok")) return { emoji:"🍇", color:"#8050a0", bg:"#f0e8f8" };
  if (n.includes("blauwe") && n.includes("bes")) return { emoji:"🫐", color:"#5060c0", bg:"#eaeef8" };
  if (n.includes("blueberry")) return { emoji:"🫐", color:"#5060c0", bg:"#eaeef8" };
  if (n.includes("framboos") || n.includes("raspberry")) return { emoji:"🍓", color:"#e05070", bg:"#fde8ef" };
  if (n.includes("braam") || n.includes("blackberry")) return { emoji:"🍇", color:"#602080", bg:"#ede8f8" };
  if (n.includes("bes") || n.includes("berry") || n.includes("aalbes") || n.includes("kruisbes")) return { emoji:"🍓", color:"#c04060", bg:"#fde8ef" };
  if (n.includes("vijg") || n.includes("fig")) return { emoji:"🍑", color:"#904080", bg:"#f2e8f5" };
  if (n.includes("citroen") || n.includes("lemon")) return { emoji:"🍋", color:"#d8c020", bg:"#fefce0" };
  if (n.includes("boom") || n.includes("tree")) return { emoji:"🌳", color:"#5a8a40", bg:"#e8f4e0" };
  if (n.includes("fruit")) return { emoji:"🍎", color:"#d04040", bg:"#fdeaea" };
  // Meer bloemen
  if (n.includes("wisteria") || n.includes("blauweregen")) return { emoji:"💜", color:"#7050b8", bg:"#eeeaf8" };
  if (n.includes("clematis")) return { emoji:"🌸", color:"#9060c0", bg:"#f2eaf8" };
  if (n.includes("campanula") || n.includes("klokje")) return { emoji:"💙", color:"#5070c0", bg:"#eaecf8" };
  if (n.includes("ridderspoor") || n.includes("delphinium")) return { emoji:"💙", color:"#4060c0", bg:"#eaecf8" };
  if (n.includes("agapanthus")) return { emoji:"💙", color:"#5070c8", bg:"#eaecf8" };
  if (n.includes("helenium")) return { emoji:"🌼", color:"#e07020", bg:"#fef0e0" };
  if (n.includes("heuchera")) return { emoji:"🍂", color:"#a04030", bg:"#f8eae8" };
  if (n.includes("hosta")) return { emoji:"🌿", color:"#508858", bg:"#eaf4ec" };
  if (n.includes("phlox")) return { emoji:"🌸", color:"#d060a0", bg:"#f8eef6" };
  if (n.includes("salvia")) return { emoji:"💜", color:"#7050a8", bg:"#eeeaf8" };
  if (n.includes("echinacea") || n.includes("zonnehoed")) return { emoji:"🌸", color:"#d05080", bg:"#fde8ef" };
  if (n.includes("rudbeckia") || n.includes("rudbecia")) return { emoji:"🌻", color:"#d09020", bg:"#fef5e0" };
  if (n.includes("lupine") || n.includes("lupin")) return { emoji:"💜", color:"#8050b0", bg:"#f0eaf8" };
  if (n.includes("anjer") || n.includes("carnation") || n.includes("dianthus")) return { emoji:"🌸", color:"#e04080", bg:"#fde8ef" };
  if (n.includes("gladiool") || n.includes("gladiolus")) return { emoji:"🌸", color:"#e05090", bg:"#fde8f4" };
  if (n.includes("iris")) return { emoji:"💜", color:"#7050c0", bg:"#eeecf8" };
  if (n.includes("flox") || n.includes("vlambloem")) return { emoji:"🌸", color:"#d060b0", bg:"#f8eef6" };
  if (n.includes("anemoon") || n.includes("anemone")) return { emoji:"🌸", color:"#c04080", bg:"#fde8ef" };
  if (n.includes("heide") || n.includes("heather") || n.includes("erica")) return { emoji:"🌸", color:"#b060a0", bg:"#f5eaf6" };
  if (n.includes("viooltje") || n.includes("viola") || n.includes("pansy")) return { emoji:"💜", color:"#8040b0", bg:"#f0eaf8" };
  if (n.includes("lelie") || n.includes("lily")) return { emoji:"🌸", color:"#e06090", bg:"#fde8f2" };
  if (n.includes("amaryllis")) return { emoji:"🌺", color:"#c03040", bg:"#fde8ea" };
  if (n.includes("primula") || n.includes("sleutelbloem")) return { emoji:"🌼", color:"#d08020", bg:"#fef5e0" };
  if (n.includes("stokroos") || n.includes("hollyhock") || n.includes("alcea")) return { emoji:"🌸", color:"#e05070", bg:"#fde8ef" };
  if (n.includes("wederik") || n.includes("loosestrife") || n.includes("lythrum")) return { emoji:"💜", color:"#a040a0", bg:"#f5eaf8" };
  if (n.includes("bleeding heart") || n.includes("gebroken hartje") || n.includes("lamprocapnos")) return { emoji:"🩷", color:"#e060a0", bg:"#fde8f5" };
  if (n.includes("digitalis") || n.includes("vingerhoedskruid")) return { emoji:"🌸", color:"#c060a0", bg:"#f8eaf6" };
  if (n.includes("klaproos") || n.includes("papaver") || n.includes("poppy")) return { emoji:"🌺", color:"#e03030", bg:"#fde8e8" };
  if (n.includes("agastache") || n.includes("dropplant")) return { emoji:"💜", color:"#9060b0", bg:"#f2eaf8" };
  if (n.includes("astilbe")) return { emoji:"🌸", color:"#d050a0", bg:"#f8eaf6" };
  if (n.includes("veronica") || n.includes("ereprijs")) return { emoji:"💙", color:"#5060c0", bg:"#eaecf8" };
  if (n.includes("achillea") || n.includes("duizendblad")) return { emoji:"🌼", color:"#e8c040", bg:"#fef8e0" };
  if (n.includes("gypsophila") || n.includes("gipskruid")) return { emoji:"🤍", color:"#c0b8c0", bg:"#f5f2f5" };
  if (n.includes("kniphofia") || n.includes("fakkellelie")) return { emoji:"🌺", color:"#e06020", bg:"#feeee0" };
  if (n.includes("crocosmia") || n.includes("montbretia")) return { emoji:"🌺", color:"#e07020", bg:"#fef0e0" };
  // Meer groenten
  if (n.includes("rucola") || n.includes("rocket") || n.includes("rakket")) return { emoji:"🥗", color:"#70b050", bg:"#eaf5e4" };
  if (n.includes("postelein") || n.includes("purslane")) return { emoji:"🌿", color:"#60a860", bg:"#e4f5ec" };
  if (n.includes("waterkers") || n.includes("watercress")) return { emoji:"🌿", color:"#50b070", bg:"#e4f5ec" };
  if (n.includes("veldsla") || n.includes("lamb")) return { emoji:"🥗", color:"#78b860", bg:"#eaf5e4" };
  if (n.includes("raapsteel") || n.includes("turnip")) return { emoji:"🌿", color:"#80b040", bg:"#eaf5e4" };
  if (n.includes("paksoi") || n.includes("bok choy")) return { emoji:"🥬", color:"#60a858", bg:"#eaf5e4" };
  if (n.includes("chinese kool")) return { emoji:"🥬", color:"#70b050", bg:"#eaf5e4" };
  if (n.includes("witlof") || n.includes("chicory")) return { emoji:"🥬", color:"#c8c090", bg:"#f8f5e8" };
  if (n.includes("rabarber") || n.includes("rhubarb")) return { emoji:"🌿", color:"#c04060", bg:"#fde8ef" };
  if (n.includes("artisjok") || n.includes("artichoke")) return { emoji:"🥦", color:"#6090a0", bg:"#e8f2f5" };
  if (n.includes("zoete") && n.includes("paprika")) return { emoji:"🫑", color:"#e84830", bg:"#fdeaea" };
  if (n.includes("chilipeper") || n.includes("chili") || n.includes("cayenne")) return { emoji:"🌶️", color:"#e02020", bg:"#fde8e8" };
  if (n.includes("lente-ui") || n.includes("bosui") || n.includes("scallion") || n.includes("spring onion")) return { emoji:"🧅", color:"#80b040", bg:"#eaf5e4" };
  if (n.includes("sjalot") || n.includes("shallot") || n.includes("echalot")) return { emoji:"🧅", color:"#c08040", bg:"#f8f0e0" };
  if (n.includes("knolvenkel") || n.includes("florence")) return { emoji:"🌿", color:"#70b870", bg:"#eaf5ec" };
  if (n.includes("meerjarige") || n.includes("perennial")) return { emoji:"🌿", color:"#60a860", bg:"#e4f5ec" };
  if (n.includes("rettich") || n.includes("daikon")) return { emoji:"🌿", color:"#d0d0d0", bg:"#f5f5f5" };
  if (n.includes("suikererwt") || n.includes("peultje") || n.includes("snap pea")) return { emoji:"🫛", color:"#60b840", bg:"#eef8e0" };
  if (n.includes("tuinboon") || n.includes("broad bean") || n.includes("fava")) return { emoji:"🫘", color:"#80a040", bg:"#eef5e0" };
  if (n.includes("runner bean") || n.includes("stokboon")) return { emoji:"🫘", color:"#90b060", bg:"#eef5e4" };
  if (n.includes("doperwt") || n.includes("garden pea")) return { emoji:"🫛", color:"#70b840", bg:"#eef8e0" };
  // Meer fruit & bomen
  if (n.includes("watermeloen") || n.includes("watermelon")) return { emoji:"🍉", color:"#e04060", bg:"#fde8ef" };
  if (n.includes("meloen") || n.includes("melon") || n.includes("cantaloupe")) return { emoji:"🍈", color:"#d0c060", bg:"#fef8e0" };
  if (n.includes("vijgenboom") || n.includes("fig tree")) return { emoji:"🌳", color:"#806040", bg:"#f0ece0" };
  if (n.includes("kiwi")) return { emoji:"🥝", color:"#70a840", bg:"#eaf5e4" };
  if (n.includes("passievrucht") || n.includes("passion")) return { emoji:"🌸", color:"#8040a0", bg:"#f0eaf8" };
  if (n.includes("granaatappel") || n.includes("pomegranate")) return { emoji:"🍎", color:"#c02040", bg:"#fde8ea" };
  if (n.includes("moerbei") || n.includes("mulberry")) return { emoji:"🍇", color:"#700880", bg:"#f0e8f8" };
  if (n.includes("kriek") || n.includes("morello")) return { emoji:"🍒", color:"#a02040", bg:"#fde8ea" };
  if (n.includes("mispel") || n.includes("medlar")) return { emoji:"🍐", color:"#a07840", bg:"#f5ece0" };
  if (n.includes("walnoot") || n.includes("walnut")) return { emoji:"🌰", color:"#806030", bg:"#f5ece0" };
  if (n.includes("hazelnoot") || n.includes("hazelnut")) return { emoji:"🌰", color:"#906840", bg:"#f5ece0" };
  if (n.includes("kastanje") || n.includes("chestnut")) return { emoji:"🌰", color:"#804828", bg:"#f5e8e0" };
  if (n.includes("aalbes") || n.includes("currant")) return { emoji:"🍇", color:"#800040", bg:"#f0e8f0" };
  if (n.includes("kruisbes") || n.includes("gooseberry")) return { emoji:"🍈", color:"#80a040", bg:"#eef5e0" };
  if (n.includes("vlierbes") || n.includes("elderberry") || n.includes("vlier")) return { emoji:"🫐", color:"#403080", bg:"#eae8f5" };
  if (n.includes("bosbes") || n.includes("bilberry")) return { emoji:"🫐", color:"#4858b8", bg:"#eaeef8" };
  if (n.includes("goji")) return { emoji:"🍓", color:"#d03050", bg:"#fde8ea" };
  // Meer kruiden & specerijen
  if (n.includes("koriander") || n.includes("coriander") || n.includes("cilantro")) return { emoji:"🌿", color:"#68b060", bg:"#e8f5e4" };
  if (n.includes("kervel") || n.includes("chervil")) return { emoji:"🌿", color:"#70b868", bg:"#eaf5e4" };
  if (n.includes("dragon") || n.includes("tarragon") || n.includes("estragón")) return { emoji:"🌿", color:"#789858", bg:"#eaf2e4" };
  if (n.includes("bonenkruid") || n.includes("savory")) return { emoji:"🌿", color:"#888858", bg:"#f0f0e4" };
  if (n.includes("citroenmelisse") || n.includes("lemon balm") || n.includes("melisse")) return { emoji:"🌿", color:"#a0b840", bg:"#f0f8e0" };
  if (n.includes("lovage") || n.includes("lavas")) return { emoji:"🌿", color:"#609848", bg:"#e8f5e4" };
  if (n.includes("angelica") || n.includes("engelwortel")) return { emoji:"🌿", color:"#70a860", bg:"#eaf5e4" };
  if (n.includes("bernagie") || n.includes("borage")) return { emoji:"💙", color:"#5070c8", bg:"#eaecf8" };
  if (n.includes("kamille") || n.includes("chamomile")) return { emoji:"🌼", color:"#e8c828", bg:"#fef8e0" };
  if (n.includes("vlier")) return { emoji:"🌸", color:"#c0c0e0", bg:"#f5f5fa" };
  if (n.includes("stevia")) return { emoji:"🌿", color:"#50b060", bg:"#e4f5ec" };
  // Default
  return { emoji:"🪴", color:"#70a858", bg:"#eaf5e4" };
}

const INITIAL_ZONES = [
  { id:1,  label:"Vak 1",      plants:[] },
  { id:2,  label:"Vak 2",      plants:[] },
  { id:3,  label:"Vak 3",      plants:[] },
  { id:4,  label:"Vak 4",      plants:["Aardbei"] },
  { id:"box", label:"Opbergbox", plants:[], isStructure:true },
  { id:5,  label:"Vak 5",      plants:[] },
  { id:6,  label:"Vak 6",      plants:[] },
  { id:7,  label:"Rand onder", plants:[] },
  { id:8,  label:"Rand rechts",plants:[] },
];

function buildTasks(zones) {
  const result = [];
  zones.forEach(zone => {
    if (zone.isStructure) return;
    zone.plants.forEach(plantName => {
      const data = PLANT_DATABASE[plantName];
      if (!data) return;
      (data.tasks[CURRENT_MONTH] || []).forEach((text, i) => {
        result.push({ id:`${zone.id}-${plantName}-${CURRENT_MONTH}-${i}`, zone:zone.label, plant:plantName, emoji:data.emoji, color:data.color, bg:data.bg, text, done:false, doneDate:null, isCustom:false });
      });
      const next = (CURRENT_MONTH + 1) % 12;
      (data.tasks[next] || []).forEach((text, i) => {
        result.push({ id:`${zone.id}-${plantName}-next-${next}-${i}`, zone:zone.label, plant:plantName, emoji:data.emoji, color:data.color, bg:data.bg, text, done:false, doneDate:null, isCustom:false, isUpcoming:true, upcomingMonth:MONTHS[next] });
      });
    });
  });
  return result;
}

export default function App() {
  const [zones, setZones] = useState(INITIAL_ZONES);
  const [tasks, setTasks] = useState(() => buildTasks(INITIAL_ZONES));
  const [customPlantData, setCustomPlantData] = useState({});
  const [storageLoaded, setStorageLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState("tuin");
  const [pickingZone, setPickingZone] = useState(null);
  const [customText, setCustomText] = useState("");
  const [customZone, setCustomZone] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  // AI suggestions flow
  const [suggestScreen, setSuggestScreen] = useState(null); // {zoneId, plantName, plantData}
  const [suggestions, setSuggestions] = useState([]); // [{id, text, recurrence, keep}]
  const [loadingSuggest, setLoadingSuggest] = useState(false);

  // Load from Supabase on mount
  useEffect(() => {
    async function load() {
      try {
        const [z, t, p] = await Promise.all([
          dbGet("moestuin_zones"),
          dbGet("moestuin_tasks"),
          dbGet("moestuin_plantdata"),
        ]);
        if (z) setZones(z);
        if (t) setTasks(t);
        if (p) setCustomPlantData(p);
      } catch(e) { console.log("Eerste keer laden:", e); }
      setStorageLoaded(true);
    }
    load();
  }, []);

  // Save to Supabase whenever data changes (only after initial load)
  useEffect(() => {
    if (!storageLoaded) return;
    dbSet("moestuin_zones", zones);
  }, [zones, storageLoaded]);
  useEffect(() => {
    if (!storageLoaded) return;
    dbSet("moestuin_tasks", tasks);
  }, [tasks, storageLoaded]);
  useEffect(() => {
    if (!storageLoaded) return;
    dbSet("moestuin_plantdata", customPlantData);
  }, [customPlantData, storageLoaded]);

  useEffect(() => {
    const newBase = buildTasks(zones);
    setTasks(prev => {
      const customs = prev.filter(t => t.isCustom);
      const doneMap = {};
      prev.forEach(t => { if (t.done) doneMap[t.id] = t.doneDate; });
      return [...newBase.map(t => ({ ...t, done:!!doneMap[t.id], doneDate:doneMap[t.id]||null })), ...customs];
    });
  }, [zones]);

  const addPlant = async (zoneId, plantName) => {
    setPickingZone(null);
    setSearchQuery("");
    setLoadingSuggest(true);
    const plantData = PLANT_DATABASE[plantName] || getPlantStyle(plantName);
    setSuggestScreen({ zoneId, plantName, plantData });
    setSuggestions([]);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:1000,
          system:"Je bent een tuinexpert. Reageer ALLEEN met een JSON object, geen tekst erbuiten, geen markdown. Formaat: {emoji: \"meest passende emoji voor deze plant\", color: \"hex kleurcode passend bij de plant (bijv rood voor tomaat, paars voor dahlia)\", bg: \"zeer lichte versie van die kleur als hex\", tasks: [{text: taak, recurrence: eenmalig of wekelijks of tweewekelijks of maandelijks of seizoensgebonden}]}. Geef 4-7 taken.",
          messages:[{ role:"user", content:`Geef tuintaken voor: ${plantName}` }]
        })
      });
      const data = await response.json();
      const raw = data.content?.[0]?.text || "{}";
      const cleaned = raw.replace(/```json|```/g,"").trim();
      const parsed = JSON.parse(cleaned);
      // Update plantData with AI-suggested emoji and color
      if (parsed.emoji || parsed.color) {
        setSuggestScreen(prev => ({
          ...prev,
          plantData: {
            emoji: parsed.emoji || prev.plantData?.emoji || "🌱",
            color: parsed.color || prev.plantData?.color || "#82c96e",
            bg: parsed.bg || prev.plantData?.bg || "#e8f8e2",
          }
        }));
      }
      setSuggestions((parsed.tasks || []).map((s,i) => ({ ...s, id:i, keep:true })));
    } catch(e) {
      // Set style even on fallback
      setSuggestScreen(prev => ({ ...prev, plantData: { ...getPlantStyle(plantName), ...prev.plantData } }));
      // Fallback suggestions
      setSuggestions([
        { id:0, text:`${plantName} planten`, recurrence:"eenmalig", keep:true },
        { id:1, text:`Water geven`, recurrence:"wekelijks", keep:true },
        { id:2, text:`Onkruid verwijderen`, recurrence:"tweewekelijks", keep:true },
        { id:3, text:`Oogsten`, recurrence:"seizoensgebonden", keep:true },
      ]);
    }
    setLoadingSuggest(false);
  };

  const confirmSuggestions = () => {
    const zone = zones.find(z=>z.id===suggestScreen.zoneId);
    const plantData = suggestScreen.plantData;
    // Save custom emoji/color so ZoneCard can use it
    if (!PLANT_DATABASE[suggestScreen.plantName]) {
      setCustomPlantData(prev => ({
        ...prev,
        [suggestScreen.plantName]: {
          emoji: plantData?.emoji || getPlantStyle(suggestScreen.plantName).emoji,
          color: plantData?.color || getPlantStyle(suggestScreen.plantName).color,
          bg: plantData?.bg || getPlantStyle(suggestScreen.plantName).bg,
        }
      }));
    }
    // Add plant to zone
    setZones(prev => prev.map(z => z.id===suggestScreen.zoneId && !z.plants.includes(suggestScreen.plantName)
      ? {...z, plants:[...z.plants, suggestScreen.plantName]} : z));
    // Add kept suggestions as custom tasks
    const newTasks = suggestions.filter(s=>s.keep).map(s => ({
      id:`suggest-${suggestScreen.zoneId}-${suggestScreen.plantName}-${s.id}-${Date.now()}`,
      zone: zone?.label || "Tuin",
      plant: suggestScreen.plantName,
      emoji: suggestScreen.plantData?.emoji || "🌱",
      color: suggestScreen.plantData?.color || "#82c96e",
      bg: suggestScreen.plantData?.bg || "#e8f8e2",
      text: s.text,
      recurrence: s.recurrence,
      done: false,
      doneDate: null,
      isCustom: true,
      isSuggested: true,
    }));
    setTasks(prev => [...prev, ...newTasks]);
    setSuggestScreen(null);
    setSuggestions([]);
  };
  const removePlant = (zoneId, plant) => setZones(prev => prev.map(z => z.id===zoneId ? {...z, plants:z.plants.filter(p=>p!==plant)} : z));
  const toggleTask = id => setTasks(prev => prev.map(t => t.id!==id ? t : { ...t, done:!t.done, doneDate:!t.done ? TODAY.toLocaleDateString("nl-NL") : null }));
  const addCustomTask = () => {
    if (!customText.trim()) return;
    setTasks(prev => [...prev, { id:`custom-${Date.now()}`, zone:customZone||"Eigen taak", plant:"Notitie", emoji:"📝", color:"#b0b0b0", bg:"#f5f5f5", text:customText.trim(), done:false, doneDate:null, isCustom:true }]);
    setCustomText(""); setCustomZone("");
  };
  const deleteTask = id => setTasks(prev => prev.filter(t => t.id!==id));

  const nowTasks = tasks.filter(t => !t.isUpcoming && !t.done);
  const upcomingTasks = tasks.filter(t => t.isUpcoming && !t.done);
  const doneTasks = tasks.filter(t => t.done);

  return (
    <div style={{ minHeight:"100vh", background:"#f7f5f0", fontFamily:"'Georgia', 'Palatino', serif", color:"#2c2c2c" }}>

      {/* HEADER */}
      <div style={{ background:"#ffffff", borderBottom:"1px solid #ece8e0", padding:"10px 16px", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:"6px" }}>
        <div>
          <div style={{ fontSize:"17px", fontWeight:"600", color:"#2c2c2c", letterSpacing:"0.3px" }}>🌱 Mijn Moestuin</div>
          <div style={{ fontSize:"11px", color:"#9a9488", marginTop:"1px", letterSpacing:"0.5px" }}>
            {TODAY.toLocaleDateString("nl-NL",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}
          </div>
        </div>
        <div style={{ display:"flex", gap:"6px" }}>
          {[
            {key:"tuin",   label:"Plattegrond"},
            {key:"acties", label:`Acties${nowTasks.length>0?" · "+nowTasks.length:""}`},
            {key:"gedaan", label:`Gedaan${doneTasks.length>0?" · "+doneTasks.length:""}`},
          ].map(tab => (
            <button key={tab.key} onClick={()=>setActiveTab(tab.key)} style={{
              padding:"6px 10px", borderRadius:"20px", fontSize:"12px", fontFamily:"inherit",
              border: activeTab===tab.key ? "1.5px solid #b5a898" : "1.5px solid #e5e0d8",
              background: activeTab===tab.key ? "#2c2c2c" : "#ffffff",
              color: activeTab===tab.key ? "#ffffff" : "#6a6560",
              cursor:"pointer", fontWeight: activeTab===tab.key ? "600" : "400",
              transition:"all 0.15s",
            }}>{tab.label}</button>
          ))}
        </div>
      </div>

      <div style={{ padding:"10px", maxWidth:"100%", margin:"0 auto" }}>

        {/* ======= PLATTEGROND ======= */}
        {activeTab==="tuin" && (
          <div>

            {/* Garden layout: one brown container */}
            <div style={{
              background:"#c8a87a",
              borderRadius:"12px",
              padding:"8px",
              boxSizing:"border-box",
              display:"flex",
              gap:"6px",
            }}>

              {/* MAIN GARDEN — left column */}
              <div style={{ flex:1, minWidth:0, display:"flex", flexDirection:"column", gap:"0" }}>

                {/* ROW 1: vak 1 | vak 2 | vak 3 | vak 4 — brown gap = path */}
                <div style={{ display:"flex", gap:"6px" }}>
                  {[1,2,3,4].map((id) => (
                    <div key={id} style={{ flex:1, minWidth:0, height:"160px" }}>
                      {zones.filter(z=>z.id===id).map(z=>(
                        <ZoneCard key={z.id} zone={z} onAdd={()=>setPickingZone(z.id)} onRemove={p=>removePlant(z.id,p)} fill customPlantData={customPlantData}/>
                      ))}
                    </div>
                  ))}
                </div>

                {/* HORIZONTAL PATH */}
                <div style={{ height:"8px" }}/>

                {/* ROW 2: opbergbox + vak 5 + vak 6 */}
                <div style={{ display:"flex", gap:"6px" }}>
                  <div style={{ width:"44px", flexShrink:0, height:"70px" }}>
                    {zones.filter(z=>z.id==="box").map(z=>(
                      <ZoneCard key={z.id} zone={z} onAdd={()=>{}} onRemove={()=>{}} fill customPlantData={customPlantData}/>
                    ))}
                  </div>
                  <div style={{ flex:"0 0 28%", height:"70px" }}>
                    {zones.filter(z=>z.id===5).map(z=>(
                      <ZoneCard key={z.id} zone={z} onAdd={()=>setPickingZone(z.id)} onRemove={p=>removePlant(z.id,p)} fill customPlantData={customPlantData}/>
                    ))}
                  </div>
                  <div style={{ flex:1, minWidth:0, height:"70px" }}>
                    {zones.filter(z=>z.id===6).map(z=>(
                      <ZoneCard key={z.id} zone={z} onAdd={()=>setPickingZone(z.id)} onRemove={p=>removePlant(z.id,p)} fill customPlantData={customPlantData}/>
                    ))}
                  </div>
                </div>

                {/* HORIZONTAL PATH */}
                <div style={{ height:"8px" }}/>

                {/* ROW 3: rand onder */}
                <div style={{ height:"50px" }}>
                  {zones.filter(z=>z.id===7).map(z=>(
                    <ZoneCard key={z.id} zone={z} onAdd={()=>setPickingZone(z.id)} onRemove={p=>removePlant(z.id,p)} fill customPlantData={customPlantData}/>
                  ))}
                </div>

              </div>

              {/* RAND RECHTS — same brown container, just narrower white card */}
              <div style={{ width:"26px", flexShrink:0 }}>
                {zones.filter(z=>z.id===8).map(z=>(
                  <ZoneCard key={z.id} zone={z} onAdd={()=>setPickingZone(z.id)} onRemove={p=>removePlant(z.id,p)} fill customPlantData={customPlantData}/>
                ))}
              </div>

            </div>

            {/* Plant picker modal */}
            {pickingZone && (
              <div style={{ position:"fixed", top:0, left:0, right:0, bottom:0, background:"rgba(44,44,44,0.4)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center" }} onClick={()=>{setPickingZone(null);setSearchQuery("");setSearchResults([]);}}>
                <div style={{ background:"#ffffff", borderRadius:"20px", padding:"24px", maxWidth:"440px", width:"92%", maxHeight:"85vh", overflowY:"auto", boxShadow:"0 8px 40px rgba(0,0,0,0.15)" }} onClick={e=>e.stopPropagation()}>
                  
                  <div style={{ fontSize:"16px", fontWeight:"600", color:"#2c2c2c", marginBottom:"4px" }}>Plant toevoegen</div>
                  <div style={{ fontSize:"13px", color:"#a09888", marginBottom:"16px" }}>{zones.find(z=>z.id===pickingZone)?.label}</div>

                  {/* Search input */}
                  <div style={{ position:"relative", marginBottom:"16px" }}>
                    <input
                      autoFocus
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      onKeyDown={e => e.key==="Enter" && searchQuery.trim() && addPlant(pickingZone, searchQuery.trim())}
                      placeholder="Zoek op plant, groente of bloem..."
                      style={{
                        width:"100%", padding:"12px 16px", boxSizing:"border-box",
                        background:"#f7f5f0", border:"1.5px solid #e0dbd4",
                        borderRadius:"12px", fontSize:"14px", color:"#2c2c2c",
                        fontFamily:"inherit", outline:"none",
                      }}
                    />
                    {searchQuery && (
                      <button onClick={()=>{setSearchQuery("");}} style={{
                        position:"absolute", right:"12px", top:"50%", transform:"translateY(-50%)",
                        background:"none", border:"none", color:"#b0a898", cursor:"pointer", fontSize:"16px",
                      }}>✕</button>
                    )}
                  </div>

                  {/* Search results or suggestions */}
                  {searchQuery.trim() ? (
                    <div>
                      <button
                        onClick={() => addPlant(pickingZone, searchQuery.trim())}
                        style={{
                          width:"100%", padding:"12px 16px", borderRadius:"12px", marginBottom:"8px",
                          background:"#2c2c2c", border:"none", color:"#ffffff",
                          fontSize:"14px", fontWeight:"600", cursor:"pointer", fontFamily:"inherit",
                          display:"flex", alignItems:"center", gap:"10px",
                        }}>
                        <span>🌱</span>
                        <span>"{searchQuery}" toevoegen</span>
                        <span style={{marginLeft:"auto", fontSize:"11px", opacity:0.7}}>↵ Enter</span>
                      </button>
                      <div style={{fontSize:"11px", color:"#b0a898", textAlign:"center", marginBottom:"12px"}}>
                        Claude genereert automatisch de activiteiten
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{fontSize:"11px", color:"#b0a898", marginBottom:"10px", fontWeight:"600", letterSpacing:"0.5px", textTransform:"uppercase"}}>Veelgebruikt</div>
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"6px", marginBottom:"16px" }}>
                        {Object.entries(PLANT_DATABASE).map(([name, data])=>{
                          const zone = zones.find(z=>z.id===pickingZone);
                          const already = zone?.plants.includes(name);
                          return (
                            <button key={name} disabled={already} onClick={()=>addPlant(pickingZone, name)} style={{
                              padding:"9px 12px", borderRadius:"10px",
                              border:`1.5px solid ${data.color}60`,
                              background: already ? `${data.bg}80` : data.bg,
                              opacity: already ? 0.5 : 1,
                              cursor: already ? "default" : "pointer",
                              display:"flex", alignItems:"center", gap:"8px",
                              fontFamily:"inherit",
                            }}>
                              <span style={{fontSize:"16px"}}>{data.emoji}</span>
                              <span style={{fontSize:"12px", color:"#2c2c2c"}}>{name}</span>
                              {already && <span style={{fontSize:"10px", color:"#a09888", marginLeft:"auto"}}>✓</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <button onClick={()=>{setPickingZone(null);setSearchQuery("");}} style={{ width:"100%", padding:"10px", background:"#f7f5f0", border:"1px solid #e5e0d8", borderRadius:"12px", color:"#6a6560", cursor:"pointer", fontSize:"13px", fontFamily:"inherit" }}>
                    Sluiten
                  </button>
                </div>
              </div>
            )}

            {/* AI SUGGESTIONS SCREEN */}
            {suggestScreen && (
              <div style={{ position:"fixed", top:0, left:0, right:0, bottom:0, background:"rgba(44,44,44,0.5)", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <div style={{ background:"#ffffff", borderRadius:"20px", padding:"24px", maxWidth:"480px", width:"92%", maxHeight:"88vh", overflowY:"auto", boxShadow:"0 8px 40px rgba(0,0,0,0.18)", display:"flex", flexDirection:"column", gap:"16px" }}>
                  
                  {/* Header */}
                  <div>
                    <div style={{ fontSize:"18px", fontWeight:"600", color:"#2c2c2c" }}>
                      {suggestScreen.plantData?.emoji} {suggestScreen.plantName} toevoegen
                    </div>
                    <div style={{ fontSize:"13px", color:"#a09888", marginTop:"4px" }}>
                      Controleer de voorgestelde activiteiten en pas ze aan indien nodig.
                    </div>
                  </div>

                  {/* Loading */}
                  {loadingSuggest && (
                    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"12px", padding:"24px 0" }}>
                      <div style={{ fontSize:"28px", animation:"spin 1s linear infinite" }}>🌱</div>
                      <div style={{ fontSize:"13px", color:"#a09888" }}>Activiteiten ophalen...</div>
                      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
                    </div>
                  )}

                  {/* Suggestions list */}
                  {!loadingSuggest && suggestions.map((s, i) => (
                    <div key={s.id} style={{
                      background: s.keep ? (suggestScreen.plantData?.bg || "#f0faf0") : "#f7f5f0",
                      border:`1.5px solid ${s.keep ? (suggestScreen.plantData?.color+"60" || "#82c96e60") : "#e5e0d8"}`,
                      borderRadius:"12px", padding:"12px 14px",
                      opacity: s.keep ? 1 : 0.45,
                      transition:"all 0.15s",
                    }}>
                      <div style={{ display:"flex", alignItems:"flex-start", gap:"10px" }}>
                        {/* Toggle keep */}
                        <button onClick={() => setSuggestions(prev => prev.map(x => x.id===s.id ? {...x, keep:!x.keep} : x))} style={{
                          width:"22px", height:"22px", borderRadius:"50%", flexShrink:0, marginTop:"1px",
                          border:`1.5px solid ${s.keep ? suggestScreen.plantData?.color : "#c8c0b4"}`,
                          background: s.keep ? suggestScreen.plantData?.color : "transparent",
                          color:"#fff", fontSize:"11px", cursor:"pointer",
                          display:"flex", alignItems:"center", justifyContent:"center",
                        }}>{s.keep ? "✓" : ""}</button>

                        <div style={{ flex:1 }}>
                          {/* Task text — editable */}
                          <input
                            value={s.text}
                            onChange={e => setSuggestions(prev => prev.map(x => x.id===s.id ? {...x, text:e.target.value} : x))}
                            style={{
                              width:"100%", border:"none", background:"transparent",
                              fontSize:"14px", color:"#2c2c2c", fontFamily:"inherit",
                              outline:"none", padding:0, marginBottom:"6px",
                            }}
                          />
                          {/* Recurrence selector */}
                          <div style={{ display:"flex", gap:"4px", flexWrap:"wrap" }}>
                            {["eenmalig","wekelijks","tweewekelijks","maandelijks","seizoensgebonden"].map(r => (
                              <button key={r} onClick={() => setSuggestions(prev => prev.map(x => x.id===s.id ? {...x, recurrence:r} : x))} style={{
                                padding:"2px 8px", borderRadius:"10px", fontSize:"10px", cursor:"pointer", fontFamily:"inherit",
                                border:`1px solid ${s.recurrence===r ? suggestScreen.plantData?.color : "#e0dbd4"}`,
                                background: s.recurrence===r ? suggestScreen.plantData?.bg : "#ffffff",
                                color: s.recurrence===r ? "#2c2c2c" : "#a09888",
                                fontWeight: s.recurrence===r ? "600" : "400",
                              }}>{r}</button>
                            ))}
                          </div>
                        </div>

                        {/* Delete */}
                        <button onClick={() => setSuggestions(prev => prev.filter(x => x.id!==s.id))} style={{
                          background:"none", border:"none", color:"#c8b8b0", cursor:"pointer", fontSize:"16px", padding:"0 2px", flexShrink:0,
                        }}>✕</button>
                      </div>
                    </div>
                  ))}

                  {/* Add own task */}
                  {!loadingSuggest && (
                    <button onClick={() => setSuggestions(prev => [...prev, { id:Date.now(), text:"Nieuwe activiteit", recurrence:"eenmalig", keep:true }])} style={{
                      padding:"8px", background:"#f7f5f0", border:"1.5px dashed #c8c0b4", borderRadius:"12px",
                      color:"#a09888", cursor:"pointer", fontSize:"13px", fontFamily:"inherit",
                    }}>
                      + Activiteit toevoegen
                    </button>
                  )}

                  {/* Action buttons */}
                  {!loadingSuggest && (
                    <div style={{ display:"flex", gap:"8px", marginTop:"4px" }}>
                      <button onClick={() => { setSuggestScreen(null); setSuggestions([]); }} style={{
                        flex:1, padding:"11px", background:"#f7f5f0", border:"1px solid #e5e0d8",
                        borderRadius:"12px", color:"#6a6560", cursor:"pointer", fontSize:"13px", fontFamily:"inherit",
                      }}>Annuleren</button>
                      <button onClick={confirmSuggestions} style={{
                        flex:2, padding:"11px", background:"#2c2c2c", border:"none",
                        borderRadius:"12px", color:"#ffffff", cursor:"pointer", fontSize:"13px",
                        fontWeight:"600", fontFamily:"inherit",
                      }}>
                        ✓ Toevoegen aan tuin ({suggestions.filter(s=>s.keep).length} activiteiten)
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        )}

        {/* ======= ACTIES ======= */}
        {activeTab==="acties" && (
          <div>
            <div style={{ fontSize:"18px", fontWeight:"600", color:"#2c2c2c", marginBottom:"4px" }}>
              {MONTHS[CURRENT_MONTH].charAt(0).toUpperCase()+MONTHS[CURRENT_MONTH].slice(1)}
            </div>
            <div style={{ fontSize:"13px", color:"#a09888", marginBottom:"24px" }}>Taken op basis van jouw tuin</div>

            {nowTasks.length===0 && (
              <div style={{ fontSize:"14px", color:"#b0a898", fontStyle:"italic", marginBottom:"20px", padding:"20px", background:"#ffffff", borderRadius:"14px", border:"1px solid #ece8e0" }}>
                Geen taken voor deze maand. Voeg planten toe via de Plattegrond-tab.
              </div>
            )}
            {nowTasks.map(t=><TaskRow key={t.id} task={t} onToggle={toggleTask} onDelete={deleteTask}/>)}

            {upcomingTasks.length>0 && (
              <div style={{marginTop:"32px"}}>
                <div style={{fontSize:"15px", fontWeight:"600", color:"#c09060", marginBottom:"4px"}}>Volgende maand</div>
                <div style={{fontSize:"13px", color:"#a09888", marginBottom:"16px"}}>{upcomingTasks[0].upcomingMonth} — alvast vooruitkijken</div>
                {upcomingTasks.map(t=><TaskRow key={t.id} task={t} onToggle={toggleTask} onDelete={deleteTask} muted/>)}
              </div>
            )}

            {/* Custom task */}
            <div style={{ marginTop:"36px", background:"#ffffff", border:"1px solid #ece8e0", borderRadius:"16px", padding:"20px" }}>
              <div style={{fontSize:"15px", fontWeight:"600", color:"#2c2c2c", marginBottom:"14px"}}>Eigen taak toevoegen</div>
              <div style={{display:"flex", gap:"8px", flexWrap:"wrap"}}>
                <input value={customText} onChange={e=>setCustomText(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&addCustomTask()}
                  placeholder="Beschrijf de taak..."
                  style={{ flex:"1 1 200px", padding:"10px 14px", background:"#f7f5f0", border:"1px solid #e5e0d8", borderRadius:"10px", color:"#2c2c2c", fontSize:"14px", outline:"none", fontFamily:"inherit" }}/>
                <input value={customZone} onChange={e=>setCustomZone(e.target.value)}
                  placeholder="Locatie (optioneel)"
                  style={{ flex:"0 1 150px", padding:"10px 14px", background:"#f7f5f0", border:"1px solid #e5e0d8", borderRadius:"10px", color:"#2c2c2c", fontSize:"14px", outline:"none", fontFamily:"inherit" }}/>
                <button onClick={addCustomTask} style={{ padding:"10px 18px", background:"#2c2c2c", border:"none", borderRadius:"10px", color:"#ffffff", cursor:"pointer", fontWeight:"600", fontSize:"13px", fontFamily:"inherit" }}>
                  Toevoegen
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======= GEDAAN ======= */}
        {activeTab==="gedaan" && (
          <div>
            <div style={{fontSize:"18px", fontWeight:"600", color:"#2c2c2c", marginBottom:"4px"}}>Gedaan</div>
            <div style={{fontSize:"13px", color:"#a09888", marginBottom:"24px"}}>{doneTasks.length} taken afgevinkt</div>
            {doneTasks.length===0 && (
              <div style={{fontSize:"14px", color:"#b0a898", fontStyle:"italic", padding:"20px", background:"#ffffff", borderRadius:"14px", border:"1px solid #ece8e0"}}>
                Nog niets afgevinkt.
              </div>
            )}
            {doneTasks.map(t=><TaskRow key={t.id} task={t} onToggle={toggleTask} onDelete={deleteTask}/>)}
          </div>
        )}
      </div>
    </div>
  );
}

function ZoneCard({zone, onAdd, onRemove, fill, fullH, tall, customPlantData={}}) {
  const isNarrow = zone.id === 8;
  const isWide = zone.id === 7;

  if (zone.isStructure) return (
    <div style={{
      background:"#3a3530", borderRadius:"6px",
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      width:"100%", height:"100%", boxSizing:"border-box", gap:"2px", padding:"4px 2px",
    }}>
      <span style={{fontSize:"10px"}}>📦</span>
    </div>
  );



  return (
    <div style={{
      background:"#ffffff",
      border:"1px solid #ece8e0",
      borderRadius:"8px",
      padding: isNarrow ? "4px 2px" : "8px",
      display:"flex",
      flexDirection:"column",
      gap:"4px",
      width:"100%",
      height:"100%",
      boxSizing:"border-box",
      overflow:"hidden",
      boxShadow:"0 1px 3px rgba(0,0,0,0.06)",
    }}>
      {/* Header row: label + add button */}
      {!isNarrow && !isWide && (
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", flexShrink:0}}>
          <span style={{fontSize:"9px", color:"#b0a898", fontWeight:"700", letterSpacing:"0.4px", textTransform:"uppercase"}}>{zone.label}</span>
          <button onClick={onAdd} style={{
            background:"#f0ede8", border:"1px solid #ddd8d0", borderRadius:"50%",
            width:"16px", height:"16px", color:"#8a8070", cursor:"pointer",
            fontSize:"12px", display:"flex", alignItems:"center", justifyContent:"center",
            padding:0, flexShrink:0, lineHeight:1,
          }}>+</button>
        </div>
      )}

      {/* Wide strip (rand onder): horizontal compact display */}
      {isWide && (
        <div style={{display:"flex", alignItems:"center", gap:"4px", height:"100%", overflow:"hidden"}}>
          <button onClick={onAdd} style={{
            background:"#f0ede8", border:"1px solid #ddd8d0", borderRadius:"50%",
            width:"16px", height:"16px", color:"#8a8070", cursor:"pointer",
            fontSize:"12px", display:"flex", alignItems:"center", justifyContent:"center",
            padding:0, flexShrink:0, lineHeight:1,
          }}>+</button>
          {zone.plants.length===0 && (
            <span style={{fontSize:"9px", color:"#d0c8be", fontStyle:"italic"}}>leeg</span>
          )}
          {zone.plants.map(p => {
            const d = PLANT_DATABASE[p] || customPlantData[p] || { emoji:"🌱", color:"#82c96e", bg:"#e8f8e2" };
            return (
              <div key={p} style={{
                background:d.bg, border:`1px solid ${d.color}50`,
                borderRadius:"5px", padding:"2px 6px",
                display:"flex", alignItems:"center", gap:"3px", flexShrink:0,
              }}>
                <span style={{fontSize:"10px"}}>{d.emoji}</span>
                <span style={{fontSize:"9px", color:"#4a4440"}}>{p}</span>
                <button onClick={()=>onRemove(p)} style={{
                  background:"none", border:"none", color:d.color,
                  cursor:"pointer", fontSize:"8px", padding:"0 0 0 1px", lineHeight:1,
                }}>✕</button>
              </div>
            );
          })}
        </div>
      )}

      {/* Narrow strip: just show + and emoji stacked */}
      {isNarrow && (
        <div style={{display:"flex", flexDirection:"column", alignItems:"center", gap:"3px", height:"100%", justifyContent:"flex-start", paddingTop:"4px"}}>
          <button onClick={onAdd} style={{
            background:"#f0ede8", border:"1px solid #ddd8d0", borderRadius:"50%",
            width:"14px", height:"14px", color:"#8a8070", cursor:"pointer",
            fontSize:"10px", display:"flex", alignItems:"center", justifyContent:"center",
            padding:0, flexShrink:0, lineHeight:1,
          }}>+</button>
          <div style={{display:"flex", flexDirection:"column", gap:"2px", alignItems:"center"}}>
            {zone.plants.map(p => {
              const d = PLANT_DATABASE[p] || customPlantData[p] || { emoji:"🌱", color:"#82c96e", bg:"#e8f8e2" };
              return (
                <div key={p} style={{display:"flex", flexDirection:"column", alignItems:"center", gap:"1px"}}>
                  <span style={{fontSize:"10px"}}>{d.emoji}</span>
                  <button onClick={()=>onRemove(p)} style={{background:"none",border:"none",color:d.color,cursor:"pointer",fontSize:"8px",padding:0,lineHeight:1}}>✕</button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Normal vak: plants as tags */}
      {!isNarrow && !isWide && (
        <div style={{display:"flex", flexWrap:"wrap", gap:"3px", overflow:"hidden"}}>
          {zone.plants.length===0 && (
            <span style={{fontSize:"9px", color:"#d0c8be", fontStyle:"italic"}}>leeg</span>
          )}
          {zone.plants.map(p => {
            const d = PLANT_DATABASE[p] || customPlantData[p] || { emoji:"🌱", color:"#82c96e", bg:"#e8f8e2" };
            return (
              <div key={p} style={{
                background:d.bg, border:`1px solid ${d.color}50`,
                borderRadius:"5px", padding:"2px 5px",
                display:"flex", alignItems:"center", gap:"2px", flexShrink:0,
              }}>
                <span style={{fontSize:"10px"}}>{d.emoji}</span>
                <span style={{fontSize:"9px", color:"#4a4440"}}>{p}</span>
                <button onClick={()=>onRemove(p)} style={{
                  background:"none", border:"none", color:d.color,
                  cursor:"pointer", fontSize:"8px", padding:"0 0 0 1px", lineHeight:1,
                }}>✕</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TaskRow({task, onToggle, onDelete, muted}) {
  return (
    <div style={{
      background: task.done ? "#f7f5f0" : "#ffffff",
      border:`1px solid ${task.done ? "#ece8e0" : muted ? "#e8dfc8" : "#ece8e0"}`,
      borderLeft: `3px solid ${task.done ? "#d8d0c4" : task.color}`,
      borderRadius:"12px", padding:"14px 16px", marginBottom:"10px",
      display:"flex", alignItems:"flex-start", gap:"12px",
      opacity: task.done ? 0.6 : 1, transition:"opacity 0.2s",
      boxShadow:"0 1px 4px rgba(0,0,0,0.04)",
    }}>
      <button onClick={()=>onToggle(task.id)} style={{
        width:"22px", height:"22px", flexShrink:0, borderRadius:"50%", marginTop:"1px",
        border:`1.5px solid ${task.done ? task.color : "#c8c0b4"}`,
        background: task.done ? task.color : "transparent",
        color:"#ffffff", cursor:"pointer", fontSize:"11px", fontWeight:"bold",
        display:"flex", alignItems:"center", justifyContent:"center",
      }}>{task.done ? "✓" : ""}</button>

      <div style={{flex:1}}>
        <div style={{display:"flex", gap:"6px", alignItems:"center", marginBottom:"5px", flexWrap:"wrap"}}>
          <span style={{fontSize:"13px"}}>{task.emoji}</span>
          <span style={{
            fontSize:"11px", background:task.bg||"#f0ece8",
            border:`1px solid ${task.color}40`, borderRadius:"8px",
            padding:"1px 8px", color:"#6a6560"
          }}>{task.zone}</span>
          <span style={{fontSize:"11px", color:"#a09888"}}>{task.plant}</span>
          {muted && <span style={{fontSize:"10px", color:"#c09060", background:"#fef5e8", padding:"1px 7px", borderRadius:"8px"}}>volgende maand</span>}
          {task.recurrence && task.recurrence !== "eenmalig" && (
            <span style={{fontSize:"10px", color:"#7a9a6a", background:"#eef8e8", padding:"1px 7px", borderRadius:"8px"}}>🔁 {task.recurrence}</span>
          )}
          {task.recurrence === "eenmalig" && (
            <span style={{fontSize:"10px", color:"#a09888", background:"#f5f0ea", padding:"1px 7px", borderRadius:"8px"}}>eenmalig</span>
          )}
        </div>
        <div style={{
          fontSize:"14px", color: task.done ? "#a09888" : "#2c2c2c",
          textDecoration: task.done ? "line-through" : "none",
          lineHeight:"1.5",
        }}>{task.text}</div>
        {task.done && task.doneDate && (
          <div style={{fontSize:"11px", color:"#b0a898", marginTop:"4px"}}>Gedaan op {task.doneDate}</div>
        )}
      </div>

      {task.isCustom && (
        <button onClick={()=>onDelete(task.id)} style={{
          background:"none", border:"none", color:"#c8b8b0", cursor:"pointer", fontSize:"14px", padding:"2px",
        }} title="Verwijderen">✕</button>
      )}
    </div>
  );
}
