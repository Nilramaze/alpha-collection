export default function ImpressumPage() {
  return (
    <div className="max-w-3xl space-y-10">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tighter text-ink font-headline mb-1">Impressum</h1>
        <p className="text-sm text-ink-variant">Rechtliche Angaben gemäß §5 DDG</p>
      </div>

      {/* Impressum */}
      <section className="bg-white p-8 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-ink font-headline mb-3">Angaben gemäß §5 DDG</h2>
          <p className="text-sm text-ink leading-relaxed">
            Alpha Collection<br />
            Glarner Str. 3<br />
            12205 Berlin
          </p>
          <p className="text-sm text-ink leading-relaxed mt-3">
            <span className="font-semibold">Geschäftsführer:</span> Dr. Schuzhang HUANG
          </p>
        </div>

        <div>
          <h3 className="text-sm font-bold text-ink mb-2">Inhaltlich verantwortlich</h3>
          <p className="text-sm text-ink-variant">Dr. Schuzhang HUANG</p>
        </div>

        <div>
          <h3 className="text-sm font-bold text-ink mb-2">Kontakt</h3>
          <p className="text-sm text-ink-variant leading-relaxed">
            Tel. +49 30 8322 5031<br />
            Fax +49 30 8322 5032<br />
            alpha.optics@gmx.net
          </p>
        </div>

        <div>
          <h3 className="text-sm font-bold text-ink mb-2">Umsatzsteuer-Identifikationsnummer</h3>
          <p className="text-sm text-ink-variant">
            USt-IdNr. gemäß §27a Umsatzsteuergesetz: DE253861264<br />
            Steuernummer: 20/355/00480
          </p>
        </div>

        <div>
          <h3 className="text-sm font-bold text-ink mb-2">Haftungshinweis</h3>
          <p className="text-sm text-ink-variant leading-relaxed">
            Trotz sorgfältiger inhaltlicher Kontrolle übernehmen wir keine Haftung für die Inhalte externer Links.
            Für den Inhalt der verlinkten Seiten sind ausschließlich deren Betreiber verantwortlich.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-bold text-ink mb-2">Urheberrecht</h3>
          <p className="text-sm text-ink-variant leading-relaxed">
            Das alleinige Urheberrecht der verwendeten Grafiken und Bilder liegt bei der Alpha Collection,
            Glarner Str. 3, 12205 Berlin, soweit nicht anderweitig angegeben.
          </p>
        </div>
      </section>

      {/* Datenschutz */}
      <section className="bg-white p-8 space-y-6">
        <h2 className="text-lg font-bold text-ink font-headline">Datenschutzerklärung</h2>

        <div>
          <h3 className="text-sm font-bold text-ink mb-2">Name und Kontakt des Verantwortlichen gemäß Art. 4 Abs. 7 DSGVO</h3>
          <p className="text-sm text-ink-variant leading-relaxed">
            Dr. Schuzhang Huang<br />
            Glarner Str. 3, 12205 Berlin<br />
            Tel. +49 30 8322 5031 · Fax +49 30 8322 5032<br />
            alpha.optics@gmx.net
          </p>
        </div>

        <div>
          <h3 className="text-sm font-bold text-ink mb-2">Sicherheit und Schutz Ihrer personenbezogenen Daten</h3>
          <p className="text-sm text-ink-variant leading-relaxed">
            Wir betrachten es als unsere vorrangige Aufgabe, die Vertraulichkeit der von Ihnen bereitgestellten
            personenbezogenen Daten zu wahren und diese vor unbefugten Zugriffen zu schützen. Wir wenden modernste
            Sicherheitsstandards an und haben technische sowie organisatorische Maßnahmen getroffen, die die Einhaltung
            der Datenschutzvorschriften sicherstellen.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-bold text-ink mb-2">Erhebung personenbezogener Daten bei Besuch unseres Portals</h3>
          <p className="text-sm text-ink-variant leading-relaxed">
            Bei der Nutzung unseres B2B-Bestellportals erheben wir folgende technisch erforderliche Daten
            (Rechtsgrundlage Art. 6 Abs. 1 S. 1 lit. f DSGVO):
          </p>
          <ul className="text-sm text-ink-variant mt-2 ml-4 space-y-0.5 list-disc">
            <li>IP-Adresse</li>
            <li>Datum und Uhrzeit der Anfrage</li>
            <li>Zugriffsstatus / HTTP-Statuscode</li>
            <li>Browser und Betriebssystem</li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold text-ink mb-2">Nutzung unseres Bestellportals</h3>
          <p className="text-sm text-ink-variant leading-relaxed">
            Dieses Portal ist ein geschlossenes B2B-Bestellsystem ausschließlich für registrierte Händler.
            Zur Nutzung des Portals ist eine Registrierung erforderlich. Dabei erheben wir Name, E-Mail-Adresse,
            Liefer- und Rechnungsadresse. Diese Daten werden auf unserem Server gespeichert und ausschließlich
            zur Abwicklung von Bestellungen verwendet (Rechtsgrundlage Art. 6 Abs. 1 S. 1 lit. b DSGVO).
            Bestelldaten werden gemäß handels- und steuerrechtlicher Vorgaben für die Dauer von zehn Jahren
            aufbewahrt. Die Übertragung erfolgt TLS-verschlüsselt.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-bold text-ink mb-2">Einsatz von Cookies / Authentifizierung</h3>
          <p className="text-sm text-ink-variant leading-relaxed">
            Zur Authentifizierung werden Sitzungs-Tokens verwendet, die im lokalen Speicher Ihres Browsers
            (localStorage) abgelegt werden. Diese Tokens dienen ausschließlich der sicheren Anmeldung und
            enthalten keine personenbezogenen Daten. Es werden keine Tracking-Cookies eingesetzt.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-bold text-ink mb-2">Kinder</h3>
          <p className="text-sm text-ink-variant leading-relaxed">
            Unser Angebot richtet sich ausschließlich an gewerbliche Kunden (B2B). Personen unter 18 Jahren
            sollten ohne Zustimmung der Eltern oder Erziehungsberechtigten keine personenbezogenen Daten übermitteln.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-bold text-ink mb-3">Ihre Rechte als betroffene Person</h3>
          <div className="space-y-3 text-sm text-ink-variant">
            {[
              ['Auskunftsrecht (Art. 15 DSGVO)', 'Sie können Auskunft über die von uns gespeicherten personenbezogenen Daten verlangen.'],
              ['Recht auf Berichtigung (Art. 16 DSGVO)', 'Sie können die Berichtigung unrichtiger Daten verlangen.'],
              ['Recht auf Löschung (Art. 17 DSGVO)', 'Sie können unter bestimmten Voraussetzungen die Löschung Ihrer Daten verlangen.'],
              ['Recht auf Einschränkung (Art. 18 DSGVO)', 'Sie können die Einschränkung der Verarbeitung Ihrer Daten verlangen.'],
              ['Recht auf Datenübertragbarkeit (Art. 20 DSGVO)', 'Sie haben das Recht, Ihre Daten in einem maschinenlesbaren Format zu erhalten.'],
              ['Widerspruchsrecht (Art. 21 DSGVO)', 'Sie können der Verarbeitung Ihrer Daten widersprechen.'],
              ['Beschwerderecht', 'Sie haben das Recht, sich bei einer Aufsichtsbehörde zu beschweren.'],
            ].map(([title, desc]) => (
              <div key={title}>
                <span className="font-semibold text-ink">{title}: </span>
                {desc}
              </div>
            ))}
          </div>
          <p className="text-sm text-ink-variant mt-4">
            Zur Ausübung Ihrer Rechte wenden Sie sich an: <span className="font-medium text-ink">alpha.optics@gmx.net</span>
          </p>
        </div>
      </section>
    </div>
  );
}
