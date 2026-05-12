import Link from "next/link";

export const metadata = {
  title: "Politika zasebnosti · Doago",
  description: "Politika zasebnosti platforme Doago – obdelava osebnih podatkov v skladu z GDPR.",
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

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block bg-white/5 border border-white/8 text-gray-400 text-xs px-2.5 py-0.5 rounded-md mr-1.5 mb-1.5">
      {children}
    </span>
  );
}

function InfoBox({ naslov, children }: { naslov: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#111111] border border-white/5 rounded-xl px-5 py-4">
      <p className="text-white text-sm font-medium mb-2">{naslov}</p>
      <div className="text-gray-500 text-sm leading-relaxed">{children}</div>
    </div>
  );
}

const KAZALO = [
  { st: "1", id: "uvod", naslov: "Uvod in upravljavec podatkov" },
  { st: "2", id: "podatki", naslov: "Katere podatke zbiramo" },
  { st: "3", id: "namen", naslov: "Namen in pravna podlaga obdelave" },
  { st: "4", id: "hramba", naslov: "Hramba podatkov" },
  { st: "5", id: "deljenje", naslov: "Deljenje podatkov s tretjimi osebami" },
  { st: "6", id: "pravice", naslov: "Vaše pravice po GDPR" },
  { st: "7", id: "piskotki", naslov: "Piškotki in sledilne tehnologije" },
  { st: "8", id: "varnost", naslov: "Varnost podatkov" },
  { st: "9", id: "otroci", naslov: "Podatki mladoletnih oseb" },
  { st: "10", id: "prenosi", naslov: "Mednarodni prenosi podatkov" },
  { st: "11", id: "spremembe", naslov: "Spremembe politike zasebnosti" },
  { st: "12", id: "kontakt", naslov: "Kontakt in pritožbe" },
];

export default function ZasebnostPage() {
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
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium px-3 py-1 rounded-full mb-5">
            GDPR · Uredba EU 2016/679
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Politika zasebnosti</h1>
          <p className="text-gray-500 text-sm">
            Datum veljavnosti: <span className="text-gray-300">{DATUM_VELJAVNOSTI}</span>
            <span className="mx-2 text-gray-700">·</span>
            Zadnja posodobitev: <span className="text-gray-300">{DATUM_POSODOBITVE}</span>
          </p>
        </div>

        {/* Uvod */}
        <div className="bg-[#111111] border border-white/5 rounded-2xl px-6 py-5 mb-10 text-gray-400 text-sm leading-relaxed">
          Doago d.o.o. (»Doago«, »mi«, »nas«) spoštuje vašo zasebnost in je zavezana k varstvu vaših
          osebnih podatkov. Ta Politika zasebnosti pojasnjuje, katere osebne podatke zbiramo, zakaj jih
          zbiramo, kako jih uporabljamo in katera so vaša zakonska pravica v zvezi z njimi.
          Obdelava poteka v skladu z{" "}
          <span className="text-white font-medium">Uredbo (EU) 2016/679 (GDPR)</span> in Zakonom
          o varstvu osebnih podatkov (ZVOP-2).
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

          <Section id="uvod" st="1" naslov="Uvod in upravljavec podatkov">
            <Odstavek st="1.1">
              Upravljavec vaših osebnih podatkov je:
            </Odstavek>
            <InfoBox naslov="Upravljavec podatkov">
              <p><strong className="text-gray-300">Doago d.o.o.</strong></p>
              <p className="mt-1">Sedež: Republika Slovenija</p>
              <p className="mt-1">
                E-pošta:{" "}
                <a href="mailto:zasebnost@doago.si" className="text-orange-400 hover:text-orange-300 transition-colors">
                  zasebnost@doago.si
                </a>
              </p>
            </InfoBox>
            <Odstavek st="1.2">
              Doago je posredniška platforma, ki Naročnikom omogoča objavo nalog, Izvajalcem pa iskanje
              in sprejem teh nalog. Pri tem neizogibno obdelujemo določene osebne podatke.
            </Odstavek>
          </Section>

          <div className="border-t border-white/5" />

          <Section id="podatki" st="2" naslov="Katere podatke zbiramo">
            <Odstavek st="2.1">
              <strong className="text-white">Podatki, ki jih posredujete neposredno:</strong>
            </Odstavek>
            <div className="flex flex-wrap gap-1">
              <Chip>Ime in priimek</Chip>
              <Chip>E-poštni naslov</Chip>
              <Chip>Zgoščeno geslo (hash)</Chip>
              <Chip>Vloga (Naročnik / Izvajalec)</Chip>
              <Chip>Vsebina objavljenih nalog</Chip>
              <Chip>Ocene in komentarji</Chip>
            </div>
            <Odstavek st="2.2">
              <strong className="text-white">Podatki, ki nastanejo z uporabo storitve:</strong>
            </Odstavek>
            <div className="flex flex-wrap gap-1">
              <Chip>Datum in čas registracije</Chip>
              <Chip>Datum objave nalog</Chip>
              <Chip>Zgodovina transakcij nalog</Chip>
              <Chip>Oddane in prejete ocene</Chip>
              <Chip>Obvestila in sporočila</Chip>
            </div>
            <Odstavek st="2.3">
              <strong className="text-white">Tehnični podatki (zbrani samodejno):</strong>
            </Odstavek>
            <div className="flex flex-wrap gap-1">
              <Chip>IP naslov</Chip>
              <Chip>Tip in verzija brskalnika</Chip>
              <Chip>Operacijski sistem</Chip>
              <Chip>Čas dostopa</Chip>
              <Chip>Piškotki seje</Chip>
            </div>
            <Odstavek st="2.4">
              Doago <span className="text-white font-medium">ne zbira</span> posebnih kategorij osebnih
              podatkov (zdravstveni podatki, biometrični podatki, podatki o rasnem poreklu ipd.) in take
              podatke ne sme vsebovati nobena objava na Platformi.
            </Odstavek>
          </Section>

          <div className="border-t border-white/5" />

          <Section id="namen" st="3" naslov="Namen in pravna podlaga obdelave">
            <div className="flex flex-col gap-4">
              {[
                {
                  namen: "Zagotavljanje storitve",
                  podlaga: "Izpolnitev pogodbe (čl. 6(1)(b) GDPR)",
                  opis: "Ustvarjanje in upravljanje računa, omogočanje objave in sprejema nalog, sistem ocenjevanja.",
                },
                {
                  namen: "E-poštna obvestila",
                  podlaga: "Izpolnitev pogodbe (čl. 6(1)(b) GDPR)",
                  opis: "Pošiljanje transakcijskih obvestil (potrditev objave naloge, obvestilo o sprejetju naloge).",
                },
                {
                  namen: "Varnost in preprečevanje goljufij",
                  podlaga: "Zakoniti interesi (čl. 6(1)(f) GDPR)",
                  opis: "Zaznavanje neobičajnih aktivnosti, preprečevanje zlorab in varovanje Platforme.",
                },
                {
                  namen: "Izpolnjevanje pravnih obveznosti",
                  podlaga: "Pravna obveznost (čl. 6(1)(c) GDPR)",
                  opis: "Hrambar podatkov v skladu z davčno in računovodsko zakonodajo.",
                },
                {
                  namen: "Izboljšanje storitve",
                  podlaga: "Zakoniti interesi (čl. 6(1)(f) GDPR)",
                  opis: "Analiza uporabe za namene izboljšanja funkcionalnosti Platforme (anonimizirani agregati).",
                },
              ].map((vrstica) => (
                <div key={vrstica.namen} className="bg-[#111111] border border-white/5 rounded-xl px-5 py-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                    <p className="text-white text-sm font-medium">{vrstica.namen}</p>
                    <span className="text-xs text-blue-400 bg-blue-500/10 border border-blue-500/15 px-2.5 py-0.5 rounded-full whitespace-nowrap shrink-0">
                      {vrstica.podlaga}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm">{vrstica.opis}</p>
                </div>
              ))}
            </div>
          </Section>

          <div className="border-t border-white/5" />

          <Section id="hramba" st="4" naslov="Hramba podatkov">
            <Odstavek st="4.1">
              Vaše osebne podatke hranimo le toliko časa, kolikor je potrebno za dosego namenov, za
              katere so bili zbrani, ali kolikor zahteva zakonodaja.
            </Odstavek>
            <div className="flex flex-col gap-2.5">
              {[
                { tip: "Podatki računa", cas: "Do izbrisa računa + 30 dni" },
                { tip: "Objavljene naloge", cas: "3 leta po zaključku naloge" },
                { tip: "Ocene in komentarji", cas: "3 leta od oddaje" },
                { tip: "Transakcijski emaili", cas: "1 leto" },
                { tip: "Varnostni dnevniki (IP, dostopi)", cas: "90 dni" },
                { tip: "Davčno relevantni podatki", cas: "10 let (davčna zakonodaja)" },
              ].map((v) => (
                <div key={v.tip} className="flex items-center justify-between bg-[#111111] border border-white/5 rounded-xl px-4 py-3">
                  <span className="text-gray-400 text-sm">{v.tip}</span>
                  <span className="text-orange-400 text-xs font-medium whitespace-nowrap ml-4">{v.cas}</span>
                </div>
              ))}
            </div>
            <Odstavek st="4.2">
              Po preteku roka hrambe podatke varno izbrišemo ali jih anonimiziramo, razen kadar zakon
              zahteva daljšo hrambo.
            </Odstavek>
          </Section>

          <div className="border-t border-white/5" />

          <Section id="deljenje" st="5" naslov="Deljenje podatkov s tretjimi osebami">
            <Odstavek st="5.1">
              Vaših osebnih podatkov ne prodajamo tretjim osebam. Podatke delimo izključno v naslednjih
              primerih:
            </Odstavek>
            <div className="flex flex-col gap-3">
              <InfoBox naslov="Pogodbeni obdelovalci">
                Podjetja, ki za nas opravljajo storitve (gostovanje baze podatkov, e-poštne storitve Resend,
                avtentikacija). Ti obdelovalci smejo podatke obdelovati izključno po naših navodilih in v
                skladu s pogodbo o obdelavi podatkov (DPA).
              </InfoBox>
              <InfoBox naslov="Drugi uporabniki Platforme">
                Določeni podatki (ime, ocena, vloga) so vidni drugim registriranim uporabnikom Platforme
                v okviru normalnega delovanja storitve.
              </InfoBox>
              <InfoBox naslov="Pristojni organi">
                Kadar to zahteva zakon ali odredba sodišča oziroma pristojnega organa.
              </InfoBox>
              <InfoBox naslov="Prenos podjetja">
                V primeru zlitja, prevzema ali prodaje podjetja, ob zagotovitvi enake ravni varstva podatkov.
              </InfoBox>
            </div>
          </Section>

          <div className="border-t border-white/5" />

          <Section id="pravice" st="6" naslov="Vaše pravice po GDPR">
            <Odstavek st="6.1">
              Kot posameznik, na katerega se nanašajo osebni podatki, imate naslednje pravice:
            </Odstavek>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { pravica: "Pravica do dostopa", opis: "Zahtevate lahko kopijo vaših osebnih podatkov, ki jih hranimo." },
                { pravica: "Pravica do popravka", opis: "Zahtevate lahko popravek netočnih ali dopolnitev nepopolnih podatkov." },
                { pravica: "Pravica do izbrisa", opis: "»Pravica do pozabe« – zahtevate lahko izbris vaših podatkov, kjer to dopušča zakon." },
                { pravica: "Pravica do omejitve", opis: "Zahtevate lahko omejitev obdelave vaših podatkov v določenih okoliščinah." },
                { pravica: "Pravica do prenosljivosti", opis: "Zahtevate lahko prenos vaših podatkov v strojno berljivi obliki." },
                { pravica: "Pravica do ugovora", opis: "Ugovorite lahko obdelavi na podlagi zakonitih interesov ali za namene neposrednega trženja." },
              ].map((p) => (
                <div key={p.pravica} className="bg-[#111111] border border-white/5 rounded-xl px-4 py-4">
                  <p className="text-white text-sm font-medium mb-1.5">{p.pravica}</p>
                  <p className="text-gray-500 text-xs leading-relaxed">{p.opis}</p>
                </div>
              ))}
            </div>
            <Odstavek st="6.2">
              Za uveljavljanje pravic nas kontaktirajte na{" "}
              <a href="mailto:zasebnost@doago.si" className="text-orange-400 hover:text-orange-300 transition-colors">
                zasebnost@doago.si
              </a>. Na vašo zahtevo bomo odgovorili v roku 30 dni. Identiteto prosilca lahko
              preverimo pred obdelavo zahteve.
            </Odstavek>
            <Odstavek st="6.3">
              Imate tudi pravico do vložitve pritožbe pri Informacijskem pooblaščencu Republike
              Slovenije:{" "}
              <span className="text-gray-300">ip-rs.si</span>, tel.{" "}
              <span className="text-gray-300">01 230 97 30</span>.
            </Odstavek>
          </Section>

          <div className="border-t border-white/5" />

          <Section id="piskotki" st="7" naslov="Piškotki in sledilne tehnologije">
            <Odstavek st="7.1">
              Platforma Doago uporablja piškotke in podobne tehnologije za zagotavljanje delovanja
              storitve in izboljšanje uporabniške izkušnje.
            </Odstavek>
            <div className="flex flex-col gap-2.5">
              {[
                {
                  tip: "Nujno potrebni piškotki",
                  barva: "green",
                  opis: "Piškotki za sejo in avtentikacijo (NextAuth session token). Brez teh Platforma ne deluje. Ne zahtevajo privolitve.",
                },
                {
                  tip: "Funkcionalni piškotki",
                  barva: "blue",
                  opis: "Shranjevanje nastavitev in preferenc uporabnika za boljšo izkušnjo.",
                },
                {
                  tip: "Analitični piškotki",
                  barva: "orange",
                  opis: "Anonimne statistike obiska za namen izboljšanja storitve. Zahtevajo vašo privolitev.",
                },
              ].map((p) => (
                <div key={p.tip} className={`bg-[#111111] border border-${p.barva}-500/15 rounded-xl px-5 py-4`}>
                  <p className={`text-${p.barva}-400 text-sm font-medium mb-1`}>{p.tip}</p>
                  <p className="text-gray-500 text-sm">{p.opis}</p>
                </div>
              ))}
            </div>
            <Odstavek st="7.2">
              Analitične in sledilne piškotke nastavimo šele po vaši privolitvi. Privolitev lahko
              kadarkoli umaknete v nastavitvah brskalnika ali prek možnosti upravljanja piškotkov
              na Platformi.
            </Odstavek>
          </Section>

          <div className="border-t border-white/5" />

          <Section id="varnost" st="8" naslov="Varnost podatkov">
            <Odstavek st="8.1">
              Doago izvaja ustrezne tehnične in organizacijske ukrepe za varstvo osebnih podatkov pred
              nepooblaščenim dostopom, izgubo, uničenjem ali spremembo.
            </Odstavek>
            <div className="flex flex-col gap-2">
              {[
                "Šifriranje gesel z bcrypt algoritmom (gesla niso nikoli shranjena v čisti obliki)",
                "Šifrirane povezave s podatkovno bazo (SSL/TLS)",
                "JWT piškotki z varno vrednostjo in časom veljavnosti",
                "Reden pregled dostopnih pravic in varnostnih nastavitev",
                "Gostovanje pri preverjenih ponudnikih (Supabase, Vercel)",
              ].map((u) => (
                <div key={u} className="flex items-start gap-3 text-gray-400 text-sm">
                  <span className="text-green-400 mt-0.5 shrink-0">✓</span>
                  {u}
                </div>
              ))}
            </div>
            <Odstavek st="8.2">
              Kljub vsem ukrepom nobena metoda prenosa ali shranjevanja podatkov ni 100 % varna.
              V primeru varnostnega incidenta, ki bi ogrozil vaše podatke, vas bomo obvestili v
              skladu z zahtevami GDPR (v roku 72 ur obveščamo Informacijskega pooblaščenca,
              prizadete posameznike pa brez nepotrebnega odlašanja).
            </Odstavek>
          </Section>

          <div className="border-t border-white/5" />

          <Section id="otroci" st="9" naslov="Podatki mladoletnih oseb">
            <Odstavek st="9.1">
              Platforma Doago ni namenjena osebam, mlajšim od 15 let. Zavestno ne zbiramo osebnih
              podatkov otrok, mlajših od 15 let.
            </Odstavek>
            <Odstavek st="9.2">
              Za osebe med 15. in 18. letom starosti je za registracijo in uporabo Platforme
              potrebno soglasje starša ali zakonitega zastopnika v skladu s 8. členom GDPR in
              določbami ZVOP-2. Starš ali zakoniti zastopnik s tem soglaša, da so osebni podatki
              mladoletne osebe obdelovani v skladu s to Politiko zasebnosti.
            </Odstavek>
            <Odstavek st="9.3">
              Če ugotovimo, da smo brez ustreznega soglasja zbrali podatke osebe, mlajše od 15 let,
              te podatke nemudoma izbrišemo. O morebitnih kršitvah nas obvestite na{" "}
              <a href="mailto:zasebnost@doago.si" className="text-orange-400 hover:text-orange-300 transition-colors">
                zasebnost@doago.si
              </a>.
            </Odstavek>
          </Section>

          <div className="border-t border-white/5" />

          <Section id="prenosi" st="10" naslov="Mednarodni prenosi podatkov">
            <Odstavek st="10.1">
              Vaši podatki se primarno obdelujejo in hranijo znotraj Evropskega gospodarskega prostora
              (EGP). Kadar pride do prenosa podatkov v tretje države (zunaj EGP), zagotovimo ustrezne
              zaščitne ukrepe v skladu s poglavjem V GDPR, kot so:
            </Odstavek>
            <ul className="list-disc list-inside ml-2 flex flex-col gap-1.5 text-gray-400 text-sm">
              <li>Standardne pogodbene klavzule Evropske komisije (SCC);</li>
              <li>Prenos v države z odločbo o ustreznosti varstva podatkov;</li>
              <li>Zavezujoča poslovna pravila (BCR) za znotrajskupinske prenose.</li>
            </ul>
            <Odstavek st="10.2">
              Naši ponudniki storitev (Supabase za bazo podatkov, Resend za e-pošto) so zavezani k
              upoštevanju GDPR in imajo vzpostavljene ustrezne mehanizme za mednarodne prenose podatkov.
            </Odstavek>
          </Section>

          <div className="border-t border-white/5" />

          <Section id="spremembe" st="11" naslov="Spremembe politike zasebnosti">
            <Odstavek st="11.1">
              To Politiko zasebnosti lahko kadar koli posodobimo. O bistvenih spremembah vas bomo
              obvestili po e-pošti ali z vidnim obvestilom na Platformi najmanj 15 dni pred
              uveljavitvijo sprememb.
            </Odstavek>
            <Odstavek st="11.2">
              Nadaljnja uporaba Platforme po uveljavitvi sprememb pomeni sprejem posodobljene Politike
              zasebnosti.
            </Odstavek>
            <Odstavek st="11.3">
              Aktualna različica Politike zasebnosti je vedno dostopna na{" "}
              <Link href="/zasebnost" className="text-orange-400 hover:text-orange-300 transition-colors">
                doago.si/zasebnost
              </Link>.
            </Odstavek>
          </Section>

          <div className="border-t border-white/5" />

          <Section id="kontakt" st="12" naslov="Kontakt in pritožbe">
            <Odstavek st="12.1">
              Za vsa vprašanja v zvezi z varstvom osebnih podatkov ali uveljavljanjem vaših pravic
              nas kontaktirajte:
            </Odstavek>
            <InfoBox naslov="Pooblaščena oseba za varstvo podatkov">
              <p>Doago d.o.o.</p>
              <p className="mt-1">
                E-pošta:{" "}
                <a href="mailto:zasebnost@doago.si" className="text-orange-400 hover:text-orange-300 transition-colors">
                  zasebnost@doago.si
                </a>
              </p>
              <p className="mt-1">Na vašo zahtevo odgovorimo v roku 30 dni od prejema.</p>
            </InfoBox>
            <Odstavek st="12.2">
              Imate pravico vložiti pritožbo pri nadzornem organu:
            </Odstavek>
            <InfoBox naslov="Informacijski pooblaščenec RS">
              <p>Dunajska cesta 22, 1000 Ljubljana</p>
              <p className="mt-1">Telefon: 01 230 97 30</p>
              <p className="mt-1">
                Spletna stran:{" "}
                <span className="text-orange-400">ip-rs.si</span>
              </p>
            </InfoBox>
          </Section>

        </div>

        {/* Footer note */}
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-xs text-gray-700">
            © 2025 Doago d.o.o. · GDPR skladnost · Veljavnost od {DATUM_VELJAVNOSTI}
          </p>
          <Link href="/pogoji" className="text-xs text-gray-600 hover:text-orange-400 transition-colors">
            Pogoji uporabe →
          </Link>
        </div>

      </main>
    </div>
  );
}
