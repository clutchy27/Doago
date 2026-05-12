import Link from "next/link";

export const metadata = {
  title: "Pogoji uporabe · Doago",
  description: "Pogoji uporabe platforme Doago – slovenska platforma za storitve.",
};

const DATUM_VELJAVNOSTI = "1. junij 2025";
const DATUM_POSODOBITVE = "12. maj 2025";

function Section({ id, st, naslov, children }: { id: string; st: string; naslov: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="flex items-start gap-4 mb-4">
        <span className="text-orange-500 font-bold text-sm tabular-nums mt-0.5 shrink-0 w-6">{st}.</span>
        <h2 className="text-lg font-bold text-white">{naslov}</h2>
      </div>
      <div className="ml-10 flex flex-col gap-3 text-gray-400 text-sm leading-relaxed">
        {children}
      </div>
    </section>
  );
}

function Odstavek({ st, children }: { st: string; children: React.ReactNode }) {
  return (
    <p>
      <span className="text-gray-600 font-mono text-xs mr-2">{st}</span>
      {children}
    </p>
  );
}

function Opozorilo({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-orange-500/8 border border-orange-500/15 rounded-xl px-5 py-4 text-orange-200/70 text-sm leading-relaxed">
      {children}
    </div>
  );
}

const KAZALO = [
  { st: "1", id: "splosno", naslov: "Splošne določbe" },
  { st: "2", id: "storitev", naslov: "Opis storitve in vloga platforme" },
  { st: "3", id: "registracija", naslov: "Registracija in starostna omejitev" },
  { st: "4", id: "vloge", naslov: "Vloge uporabnikov" },
  { st: "5", id: "naloge", naslov: "Objava in sprejem nalog" },
  { st: "6", id: "placila", naslov: "Cene in plačila" },
  { st: "7", id: "odgovornost", naslov: "Omejena odgovornost platforme" },
  { st: "8", id: "spori", naslov: "Reševanje sporov" },
  { st: "9", id: "prepovedi", naslov: "Prepovedi in omejitve" },
  { st: "10", id: "varstvo", naslov: "Varstvo osebnih podatkov" },
  { st: "11", id: "spremembe", naslov: "Spremembe pogojev" },
  { st: "12", id: "kontakt", naslov: "Kontakt" },
];

export default function PogojiPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">

      {/* Nav */}
      <header className="sticky top-0 z-40 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/5 px-4 sm:px-8 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-orange-500 hover:text-orange-400 transition-colors duration-150">
          Doago
        </Link>
        <Link href="/" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition-colors duration-150">
          ← Domov
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-8 py-12 sm:py-16">

        {/* Naslov */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-medium px-3 py-1 rounded-full mb-5">
            Pravni dokument
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Pogoji uporabe</h1>
          <p className="text-gray-500 text-sm">
            Datum veljavnosti: <span className="text-gray-300">{DATUM_VELJAVNOSTI}</span>
            <span className="mx-2 text-gray-700">·</span>
            Zadnja posodobitev: <span className="text-gray-300">{DATUM_POSODOBITVE}</span>
          </p>
        </div>

        {/* Uvod */}
        <div className="bg-[#111111] border border-white/5 rounded-2xl px-6 py-5 mb-10 text-gray-400 text-sm leading-relaxed">
          Ti pogoji uporabe (»Pogoji«) urejajo uporabo spletne platforme Doago, dostopne na naslovu{" "}
          <span className="text-white font-medium">doago.si</span> (»Platforma«), ki jo upravlja podjetje Doago d.o.o.
          Z registracijo ali uporabo Platforme potrjujete, da ste prebrali, razumeli in sprejeli te Pogoje v celoti.
          Če s Pogoji ne soglašate, Platforme ne smete uporabljati.
        </div>

        {/* Kazalo */}
        <div className="bg-[#111111] border border-white/5 rounded-2xl px-6 py-5 mb-12">
          <p className="text-xs text-gray-600 uppercase tracking-widest mb-4">Kazalo vsebine</p>
          <nav className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {KAZALO.map((k) => (
              <Link
                key={k.id}
                href={`#${k.id}`}
                className="flex items-center gap-2.5 text-sm text-gray-400 hover:text-orange-400 transition-colors duration-150 py-0.5"
              >
                <span className="text-orange-500/50 font-mono text-xs w-4 shrink-0">{k.st}.</span>
                {k.naslov}
              </Link>
            ))}
          </nav>
        </div>

        {/* Vsebina */}
        <div className="flex flex-col gap-10">

          <Section id="splosno" st="1" naslov="Splošne določbe">
            <Odstavek st="1.1">
              Platforma Doago (v nadaljevanju: »Doago« ali »Platforma«) je spletna storitev, ki omogoča
              posredovanje med naročniki storitev (»Naročniki«) in izvajalci storitev (»Izvajalci«).
            </Odstavek>
            <Odstavek st="1.2">
              Upravljavec Platforme je Doago d.o.o., s sedežem v Republiki Sloveniji (v nadaljevanju: »Doago d.o.o.«
              ali »mi«). Kontaktni podatki so navedeni v razdelku 12.
            </Odstavek>
            <Odstavek st="1.3">
              Ti Pogoji so zavezujoči za vse registrirane uporabnike in obiskovalce Platforme. Z registracijo
              uporabnik izjavlja, da je te Pogoje prebral, razumel in z njimi soglasil.
            </Odstavek>
            <Odstavek st="1.4">
              Za vprašanja varstva osebnih podatkov velja Politika zasebnosti, ki je dostopna na{" "}
              <Link href="/zasebnost" className="text-orange-400 hover:text-orange-300 transition-colors">
                doago.si/zasebnost
              </Link>{" "}
              in je sestavni del teh Pogojev.
            </Odstavek>
          </Section>

          <div className="border-t border-white/5" />

          <Section id="storitev" st="2" naslov="Opis storitve in vloga platforme">
            <Odstavek st="2.1">
              Doago je posredniška platforma, ki Naročnikom omogoča objavo nalog, Izvajalcem pa iskanje in
              sprejem teh nalog. Doago <span className="text-white font-medium">ni stranka</span> v pogodbenem
              razmerju med Naročnikom in Izvajalcem.
            </Odstavek>
            <Odstavek st="2.2">
              Doago zagotavlja zgolj tehnično infrastrukturo za komunikacijo in sklepanje poslov med
              Naročniki in Izvajalci. Doago ne preverja identitete, poklicnih kvalifikacij, dovoljjenj ali
              ustreznosti Izvajalcev, razen če je to izrecno navedeno.
            </Odstavek>
            <Odstavek st="2.3">
              Izvajalci nastopajo kot samostojni pogodbeni delavci oziroma pravne osebe in niso
              zaposlenci, zastopniki ali podizvajalci podjetja Doago d.o.o. Doago ne nosi odgovornosti za
              kakovost, varnost ali zakonitost opravljenih storitev.
            </Odstavek>
            <Odstavek st="2.4">
              Doago si prizadeva za nemoteno delovanje Platforme, a ne jamči za neprekinjeno dostopnost
              in si pridržuje pravico do vzdrževalnih prekinitev ter sprememb funkcionalnosti.
            </Odstavek>
          </Section>

          <div className="border-t border-white/5" />

          <Section id="registracija" st="3" naslov="Registracija in starostna omejitev">
            <Opozorilo>
              <strong className="text-orange-400">Starostna omejitev:</strong> Platforma Doago je namenjena
              osebam, starim 15 let ali več. Osebe, mlajše od 18 let, lahko Platformo uporabljajo izključno
              z izrecnim pisnim soglasjem starša ali zakonitega zastopnika.
            </Opozorilo>
            <Odstavek st="3.1">
              Za registracijo na Platformi mora biti uporabnik star najmanj 15 let. Osebe, mlajše od 15 let,
              nimajo pravice do registracije in uporabe Platforme.
            </Odstavek>
            <Odstavek st="3.2">
              Osebe med 15. in 18. letom starosti (»Mladoletni uporabniki«) se smejo registrirati in
              uporabljati Platformo zgolj s predhodnim pisnim soglasjem starša ali zakonitega zastopnika.
              Z registracijo Mladoletni uporabnik potrjuje, da razpolaga s takšnim soglasjem. Doago si
              pridržuje pravico, da kadarkoli zahteva predložitev dokazila o soglasju.
            </Odstavek>
            <Odstavek st="3.3">
              Starši oziroma zakoniti zastopniki Mladoletnih uporabnikov so skupaj z Mladoletnimi
              uporabniki odgovorni za vse aktivnosti teh uporabnikov na Platformi.
            </Odstavek>
            <Odstavek st="3.4">
              Vsak uporabnik sme imeti le en registriran račun. Registracija z lažnimi podatki je
              prepovedana in predstavlja podlago za takojšnjo prekinitev računa.
            </Odstavek>
            <Odstavek st="3.5">
              Uporabnik je dolžan varovati zaupnost svojih prijavnih podatkov. Za vse aktivnosti, ki
              so bile opravljene z njegovimi prijavnimi podatki, odgovarja uporabnik sam.
            </Odstavek>
          </Section>

          <div className="border-t border-white/5" />

          <Section id="vloge" st="4" naslov="Vloge uporabnikov">
            <Odstavek st="4.1">
              Platforma pozna dve vrsti registriranih uporabnikov:
            </Odstavek>
            <div className="ml-4 flex flex-col gap-3">
              <div className="bg-[#111111] border border-orange-500/15 rounded-xl px-4 py-3">
                <p className="text-white text-sm font-medium mb-1">Naročnik</p>
                <p className="text-gray-500 text-sm">
                  Fizična ali pravna oseba, ki na Platformi objavlja naloge in išče izvajalce za njihovo
                  izvedbo. Naročnik določi opis naloge, kategorijo in ceno ter sprejme ali zavrne ponudbe
                  Izvajalcev.
                </p>
              </div>
              <div className="bg-[#111111] border border-blue-500/15 rounded-xl px-4 py-3">
                <p className="text-white text-sm font-medium mb-1">Izvajalec</p>
                <p className="text-gray-500 text-sm">
                  Fizična ali pravna oseba, ki na Platformi išče in sprejema naloge Naročnikov ter jih
                  za dogovorjeno plačilo izvede. Izvajalec nastopa kot neodvisen subjekt in ni v
                  delovnem razmerju z Doago.
                </p>
              </div>
            </div>
            <Odstavek st="4.2">
              Izvajalci so sami odgovorni za pridobitev vseh potrebnih dovoljenj, licenc ali certifikatov,
              ki jih zahteva veljavna zakonodaja za opravljanje konkretne storitve.
            </Odstavek>
            <Odstavek st="4.3">
              Izvajalci so sami odgovorni za izpolnjevanje davčnih obveznosti, socialnih prispevkov in
              obveznega zavarovanja, ki izhajajo iz opravljanja storitev prek Platforme.
            </Odstavek>
          </Section>

          <div className="border-t border-white/5" />

          <Section id="naloge" st="5" naslov="Objava in sprejem nalog">
            <Odstavek st="5.1">
              Naročnik objavi nalogo z opisom dela, kategorijo in predlagano ceno. Objava naloge ne
              predstavlja zavezujoče ponudbe, temveč povabilo Izvajalcem k oddaji ponudbe.
            </Odstavek>
            <Odstavek st="5.2">
              S sprejemom naloge s strani Izvajalca nastane neposredno pogodbeno razmerje izključno
              med Naročnikom in Izvajalcem. Doago v to razmerje ni vključen in ni odgovoren za izpolnitev
              katerekoli pogodbene obveznosti.
            </Odstavek>
            <Odstavek st="5.3">
              Naročnik potrdi dokončanje naloge z označitvijo »Opravljeno« v aplikaciji, s čimer sproži
              postopek ocenjevanja. Naročnik ne sme brez utemeljenega razloga odreči potrditve opravljene
              naloge.
            </Odstavek>
            <Odstavek st="5.4">
              Objave nalog morajo biti v skladu z veljavno zakonodajo. Prepovedano je objavljati naloge,
              ki vključujejo nezakonite, neetične ali škodljive dejavnosti.
            </Odstavek>
            <Odstavek st="5.5">
              Doago si pridržuje pravico, da kadarkoli in brez predhodnega obvestila odstrani objave nalog,
              ki kršijo te Pogoje ali veljavno zakonodajo.
            </Odstavek>
          </Section>

          <div className="border-t border-white/5" />

          <Section id="placila" st="6" naslov="Cene in plačila">
            <Odstavek st="6.1">
              Cene za posamezne naloge določi Naročnik in so prikazane v eurih (€). Cene so okvirne in
              se lahko pred dokončno sklenitvijo dogovora med Naročnikom in Izvajalcem spremenijo.
            </Odstavek>
            <Odstavek st="6.2">
              Platforma Doago v trenutni različici ne obdeluje plačilnih transakcij neposredno. Plačila
              med Naročnikom in Izvajalcem se uredijo neposredno med strankama. Doago ne odgovarja za
              kakršnekoli plačilne spore.
            </Odstavek>
            <Odstavek st="6.3">
              Doago si pridržuje pravico do uvedbe provizije ali naročnine za uporabo Platforme. O
              morebitnih sprememb bo obvestil registrirane uporabnike vsaj 30 dni vnaprej.
            </Odstavek>
          </Section>

          <div className="border-t border-white/5" />

          <Section id="odgovornost" st="7" naslov="Omejena odgovornost platforme">
            <Opozorilo>
              <strong className="text-orange-400">Pomembno:</strong> Doago deluje kot tehnična posredniška
              platforma in ne prevzema odgovornosti za dejanja, opustitve ali škodo, ki izhaja iz pogodbenih
              razmerij med Naročniki in Izvajalci.
            </Opozorilo>
            <Odstavek st="7.1">
              Doago ne jamči za točnost, popolnost ali primernost informacij, ki jih objavljajo uporabniki
              na Platformi, vključno z opisi nalog, cenami in ocenami.
            </Odstavek>
            <Odstavek st="7.2">
              Doago ne prevzema odgovornosti za:
            </Odstavek>
            <ul className="list-disc list-inside ml-2 flex flex-col gap-1.5 text-gray-400 text-sm">
              <li>kakovost, varnost ali zakonitost opravljenih storitev;</li>
              <li>kakršnokoli škodo, nastalo pri ali v zvezi z izvedbo naloge;</li>
              <li>spore med Naročniki in Izvajalci;</li>
              <li>neizpolnitev pogodbenih obveznosti katere koli stranke;</li>
              <li>izgubo podatkov ali prekinitev delovanja Platforme;</li>
              <li>škodo, nastalo zaradi nepooblaščenega dostopa do računov uporabnikov.</li>
            </ul>
            <Odstavek st="7.3">
              Skupna odgovornost Doago d.o.o. do posameznega uporabnika v vsakem primeru ne presega
              zneska, ki ga je ta uporabnik v zadnjih 12 mesecih plačal za uporabo Platforme, oziroma
              100 EUR, kar je višje.
            </Odstavek>
            <Odstavek st="7.4">
              Navedene omejitve odgovornosti ne veljajo v primerih, ko zakon izrecno prepoveduje
              omejitev odgovornosti (npr. pri naklepnem ravnanju ali hudi malomarnosti).
            </Odstavek>
          </Section>

          <div className="border-t border-white/5" />

          <Section id="spori" st="8" naslov="Reševanje sporov">
            <Odstavek st="8.1">
              V primeru spora med Naročnikom in Izvajalcem sta stranki dolžni najprej poskusiti spor
              razrešiti sporazumno z neposredno komunikacijo.
            </Odstavek>
            <Odstavek st="8.2">
              Doago na zahtevo katerekoli stranke lahko deluje kot nevtralni posredovalec pri iskanju
              sporazumne rešitve, ne pa kot razsodnik ali arbitraža. Doagova vloga posredovalca je
              neobvezna in ne ustvarja pravnih obveznosti za nobeno stranko.
            </Odstavek>
            <Odstavek st="8.3">
              Doago si pridržuje pravico, da pri sumu na zlorabo ali kršitev teh Pogojev začasno
              omeji ali prekine dostop do računa kateregakoli uporabnika do razrešitve spora.
            </Odstavek>
            <Odstavek st="8.4">
              Za spore med uporabnikom in Doago d.o.o. velja slovensko pravo. Pristojno sodišče je
              sodišče v Republiki Sloveniji po sedežu Doago d.o.o.
            </Odstavek>
            <Odstavek st="8.5">
              Potrošniki imajo pravico do zunajsodnega reševanja sporov pri Arbitražnem centru pri
              Gospodarski zbornici Slovenije ali prek platforme za spletno reševanje potrošniških
              sporov Evropske komisije (ec.europa.eu/odr).
            </Odstavek>
          </Section>

          <div className="border-t border-white/5" />

          <Section id="prepovedi" st="9" naslov="Prepovedi in omejitve">
            <Odstavek st="9.1">
              Prepovedana je vsaka zloraba Platforme, vključno z, a ne omejeno na:
            </Odstavek>
            <ul className="list-disc list-inside ml-2 flex flex-col gap-1.5 text-gray-400 text-sm">
              <li>objavo lažnih, zavajajočih ali neprimernih vsebin;</li>
              <li>umetnim ustvarjanjem ocen ali manipulacijo sistema ocenjevanja;</li>
              <li>nadlegovanjem, grožnjami ali diskriminacijo do drugih uporabnikov;</li>
              <li>objavo nalog, ki vključujejo nezakonite storitve ali blago;</li>
              <li>poskusom nepooblaščenega dostopa do sistema ali podatkov;</li>
              <li>uporabo avtomatiziranih orodij brez predhodnega pisnega dovoljenja Doago;</li>
              <li>ponovni prodaji dostopa do Platforme tretjim osebam.</li>
            </ul>
            <Odstavek st="9.2">
              Kršitev teh prepovedi daje Doagu pravico do takojšnje prekinitve računa brez predhodnega
              opozorila ter uveljavljanja odškodninskih zahtevkov.
            </Odstavek>
          </Section>

          <div className="border-t border-white/5" />

          <Section id="varstvo" st="10" naslov="Varstvo osebnih podatkov">
            <Odstavek st="10.1">
              Doago obdeluje osebne podatke uporabnikov v skladu z Uredbo (EU) 2016/679 (GDPR) in
              veljavno slovensko zakonodajo o varstvu podatkov.
            </Odstavek>
            <Odstavek st="10.2">
              Podrobna pravila o obdelavi osebnih podatkov so določena v Politiki zasebnosti, ki je
              dostopna na{" "}
              <Link href="/zasebnost" className="text-orange-400 hover:text-orange-300 transition-colors">
                doago.si/zasebnost
              </Link>{" "}
              in je sestavni del teh Pogojev.
            </Odstavek>
          </Section>

          <div className="border-t border-white/5" />

          <Section id="spremembe" st="11" naslov="Spremembe pogojev">
            <Odstavek st="11.1">
              Doago si pridržuje pravico do spremembe teh Pogojev. O bistvenih spremembah bodo
              registrirani uporabniki obveščeni po elektronski pošti ali z obvestilom na Platformi
              najmanj 15 dni pred uveljavitvijo sprememb.
            </Odstavek>
            <Odstavek st="11.2">
              Nadaljnja uporaba Platforme po uveljavitvi sprememb pomeni sprejem posodobljenih Pogojev.
              Če uporabnik s sprembami ne soglasja, mora prenehat z uporabo Platforme in zapreti
              svoj račun.
            </Odstavek>
            <Odstavek st="11.3">
              Aktualna različica Pogojev je vedno dostopna na{" "}
              <Link href="/pogoji" className="text-orange-400 hover:text-orange-300 transition-colors">
                doago.si/pogoji
              </Link>.
            </Odstavek>
          </Section>

          <div className="border-t border-white/5" />

          <Section id="kontakt" st="12" naslov="Kontakt">
            <Odstavek st="12.1">
              Za vprašanja v zvezi s temi Pogoji ali delovanjem Platforme nas kontaktirajte:
            </Odstavek>
            <div className="bg-[#111111] border border-white/5 rounded-xl px-5 py-4">
              <p className="text-white font-medium mb-1">Doago d.o.o.</p>
              <p className="text-gray-500 text-sm">Republika Slovenija</p>
              <p className="text-gray-500 text-sm mt-2">
                E-pošta:{" "}
                <a href="mailto:info@doago.si" className="text-orange-400 hover:text-orange-300 transition-colors">
                  info@doago.si
                </a>
              </p>
            </div>
          </Section>

        </div>

        {/* Footer note */}
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-xs text-gray-700">
            © 2025 Doago d.o.o. · Veljavnost od {DATUM_VELJAVNOSTI}
          </p>
          <Link href="/zasebnost" className="text-xs text-gray-600 hover:text-orange-400 transition-colors">
            Politika zasebnosti →
          </Link>
        </div>

      </main>
    </div>
  );
}
