# Objektermittlungs-App

Browser-App für iPad- und Android-Tablets. Die Nutzer öffnen einen Web-Link, melden sich mit ihrem Microsoft-Konto an, suchen ihre freigegebene Excel-Potenzialliste und arbeiten direkt in dieser Datei weiter. Der Dateiname und der OneDrive-Pfad dürfen je Nutzer unterschiedlich sein.

## Was die Nutzer auf dem Tablet tun

1. Den bereitgestellten HTTPS-Link in Safari (iPad) oder Chrome (Android) öffnen.
2. Einmalig am Startbildschirm ablegen: auf dem iPad in Safari **Teilen → Zum Home-Bildschirm** wählen; in Chrome **Menü → App installieren** oder **Zum Startbildschirm hinzufügen**.
3. **Excel-Datei aus OneDrive laden** antippen, sich bei Bedarf mit dem Microsoft-Konto anmelden und den OneDrive-Freigabe-Link einfügen. Führt er zu einem Ordner, wird darin die Excel-Datei ausgewählt; führt er direkt zu einer Excel-Datei, wird diese geöffnet.
5. Objekte bearbeiten. Änderungen werden automatisch in derselben OneDrive-Datei gespeichert.

Der gemeinsame Ordner oder die Datei muss den Nutzern Bearbeitungsrechte geben. Das erste Laden aus OneDrive und die Microsoft-Anmeldung benötigen eine Internetverbindung. Anschließend lässt sich die zuletzt geladene Liste ohne Internet öffnen und bearbeiten.

## Einmalige Bereitstellung

Diese Dateien müssen gemeinsam auf einem Webserver mit HTTPS liegen. Die App kann nicht per Doppelklick auf `index.html` gestartet werden: Browser erlauben Anmeldung und Service Worker nur über eine sichere Webadresse. Die Dateien können auf einem vorhandenen Firmen-Webserver oder einem statischen Webhosting bereitgestellt werden.

Für den Microsoft-Zugriff muss ein Administrator oder App-Betreiber einmalig:

1. Eine Microsoft-Entra-App-Registrierung für die verwendeten Kontotypen erstellen.
2. Als Plattform **Single-page application (SPA)** wählen und die genaue Webadresse der bereitgestellten App als Redirect-URI eintragen. Die App-Adresse sollte auf der obersten Ebene der Website liegen, zum Beispiel `https://firma.example/`.
3. Delegierte Microsoft-Graph-Berechtigungen `User.Read` und `Files.ReadWrite` hinzufügen.
4. Die **Application (client) ID** in `config.js` eintragen.
5. Den Nutzern im OneDrive-Ordner mindestens Bearbeitungsrechte geben.

In `config.js` steht nur eine Client-ID, kein Kennwort und kein Client-Secret. Die Client-ID wird beim Veröffentlichen der App absichtlich an den Browser ausgeliefert.

## Projektdateien

- `index.html` – Oberfläche, Excel-Import, Bearbeitung und OneDrive-Speicherung
- `config.js` – öffentliche Microsoft-Client-ID
- `manifest.json`, `service-worker.js`, `icons/` – Installation am Startbildschirm und App-Symbol

Beim Excel-Import wird das passende Datenblatt anhand seiner Spaltenüberschriften erkannt. Eingelesen wird bis zur ersten vollständig leeren Tabellenzeile; weitere Inhalte darunter werden ignoriert. Andere Datenblätter bleiben beim Speichern erhalten.

## Microsoft-Einrichtung

Die Microsoft-App-Registrierung wird pro bereitgestellter Web-App einmal vorgenommen, nicht von jedem Nutzer. Details und die aktuelle Anleitung stehen in der [Microsoft-Dokumentation für Single-Page-Apps](https://learn.microsoft.com/en-us/entra/identity-platform/scenario-spa-app-configuration).

## Offline arbeiten (Version 4)

1. Die aktualisierte App einmal mit Internet öffnen und die gewünschte Excel-Liste laden. Oben muss „Auf dem Gerät gespeichert“ stehen. Für den Offline-Start muss die Installation des Service Workers abgeschlossen sein.
2. Ohne Internet startet die App mit der zuletzt geladenen Liste. Änderungen, Notizentwürfe und die OneDrive-Dateizuordnung werden auf diesem Gerät gespeichert, auch beim normalen Schließen und erneuten Öffnen.
3. Sobald die App geöffnet ist und die Verbindung zurückkommt, startet der Abgleich automatisch. Die App prüft außerdem beim Zurückkehren in den Vordergrund und alle 30 Sekunden auf ausstehende Änderungen. „Jetzt synchronisieren“ startet den Abgleich manuell.
4. Falls eine Anmeldung erforderlich ist, mit demselben Microsoft-Konto anmelden und „Jetzt synchronisieren“ antippen. Automatische Versuche öffnen keine Anmeldefenster.
5. Die App lädt vor dem Upload den aktuellen Stand aus OneDrive und übernimmt die lokal geänderten Felder anhand der ADS-ID. Änderungen anderer Bearbeiter an anderen Feldern und anderen Tabellenblättern bleiben erhalten. Bei widersprüchlichen Änderungen desselben Feldes wählt der Nutzer den gewünschten Stand. Bei gelöschten Objekten oder doppelten ADS-IDs wird der Upload angehalten.
6. „Sicherung herunterladen“ erstellt bei Bedarf eine separate Excel-Datei mit dem lokalen Stand. Diese Sicherung ersetzt nicht automatisch die OneDrive-Datei.

Es wird jeweils eine zuletzt geöffnete Liste pro Browser und App-Adresse gespeichert. Ein Wechsel zu einer anderen Liste wird bei offenen Änderungen verhindert. „Liste schließen“ behält die Liste auf dem Gerät. Die Daten werden in IndexedDB (Arbeitsmappe) und einem lokalen Änderungsjournal gespeichert. Lokale Speicherfehler werden sichtbar angezeigt. Browserdaten nicht löschen und keinen privaten Browsermodus verwenden, wenn die Offline-Liste erhalten bleiben soll. Browser und Betriebssystem können Website-Daten entfernen; die Download-Sicherung ist eine zusätzliche unabhängige Kopie.

Die Synchronisation erfolgt bei laufender App. Für eine vollständig geschlossene App, insbesondere auf dem iPad, wird keine Hintergrund-Synchronisation zugesichert. Auch der App-Start und die Bearbeitung funktionieren offline; ein neuer Microsoft-Login und das Laden einer anderen OneDrive-Liste brauchen Internet. Die Installation am Home-Bildschirm allein lädt noch keine Objektdaten herunter.

### Aktualisierung der veröffentlichten App

`index.html` und `service-worker.js` auf dem bisherigen Webserver ersetzen. `config.js` und `manifest.json` werden unverändert mitgeliefert. Die vorhandenen Dateien im Ordner `icons/` bleiben bestehen. Danach die App einmal online neu öffnen und die Liste laden. Das Paket enthält keine neue OneDrive-Datei: gespeichert wird weiterhin in derselben Datei anhand ihrer OneDrive-ID.

### Prüfung

Die Offline-Speicherung, Wiederherstellung, Feldabgleich, Konfliktbehandlung und während eines Uploads neu eingegebenen Änderungen werden mit simuliertem Microsoft-Zugriff geprüft. Ein echter Login und Upload mit deinem Microsoft-Konto sowie das Verhalten auf deinem iPad müssen nach der Bereitstellung geprüft werden.

## Korrektur beim Laden (Version 5)

Ladefehler löschen den hinterlegten Ordnerlink nicht mehr. Die App zeigt stattdessen die Fehlermeldung mit „Erneut versuchen“ und „Andere Datei auswählen“. Nach einem erfolgreichen Import wird die Datei-ID zusammen mit dem Microsoft-Konto und Ordnerlink gespeichert. Beim nächsten Laden wird diese Datei direkt geöffnet. Falls ein Ordner genau eine Excel-Datei und keine Unterordner enthält, wird sie direkt geladen. Bei mehreren Einträgen können auch Unterordner durchsucht werden. Freigaben von OneDrive für Unternehmen über HTTPS auf sharepoint.com werden akzeptiert.

Um bewusst eine andere Liste zu wählen, „OneDrive-Ordner“ öffnen und den Ordnerlink erneut speichern oder bei einem Ladefehler „Andere Datei auswählen“ verwenden. Bei nicht synchronisierten Änderungen wird der Listenwechsel weiterhin verhindert.

Für diese Korrektur index.html und service-worker.js ersetzen. Die Offline-Funktionen aus Version 4 sind enthalten. Keine Browserdaten löschen: dort können nicht synchronisierte Änderungen liegen. Die App einmal online schließen und neu öffnen, damit die neue Version geladen wird. Ein echter Microsoft-Login und Upload auf dem iPad müssen nach dem Ersetzen geprüft werden.
