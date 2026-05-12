<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; color: #222; font-size: 14px; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 24px; }
        h2 { color: #1a1a1a; }
        .order-box { background: #f9f9f9; border: 1px solid #e0e0e0; border-radius: 4px; padding: 16px; margin: 20px 0; }
        .order-box table { width: 100%; border-collapse: collapse; }
        .order-box td { padding: 4px 0; }
        .order-box td:last-child { text-align: right; font-weight: bold; }
        .footer { margin-top: 32px; font-size: 12px; color: #888; border-top: 1px solid #e0e0e0; padding-top: 16px; }
    </style>
</head>
<body>
<div class="container">

    <h2>Vielen Dank für Ihre Bestellung!</h2>

    <p>Hallo {{ $customerName }},</p>

    <p>
        Ihre Bestellung ist bei uns eingegangen und wird schnellstmöglich bearbeitet.
        Die Rechnung finden Sie als PDF im Anhang dieser E-Mail.
    </p>

    <div class="order-box">
        <table>
            <tr>
                <td>Bestellnummer:</td>
                <td>{{ $orderNumber }}</td>
            </tr>
            <tr>
                <td>Rechnungsnummer:</td>
                <td>{{ $invoiceNumber }}</td>
            </tr>
            <tr>
                <td>Zahlungsart:</td>
                <td>{{ $paymentMethod }}</td>
            </tr>
            <tr>
                <td>Gesamtbetrag:</td>
                <td>{{ $grandTotal }} €</td>
            </tr>
        </table>
    </div>

    @if($isSepa)
    <p>
        Der Betrag wird im Rahmen des SEPA-Lastschriftverfahrens von Ihrem Konto eingezogen.
        Bitte sorgen Sie für ausreichende Kontodeckung.
    </p>
    @else
    <p>
        Bitte überweisen Sie den Betrag auf unser Konto (IBAN: DE39 7601 0085 0707 3428 55).
        Als Verwendungszweck geben Sie bitte Ihre Bestellnummer an: <strong>{{ $orderNumber }}</strong>.
    </p>
    @if($hasSkonto)
    <p>
        Bei Zahlung bis {{ $discountDate }} gewähren wir {{ $discountPercent }}% Skonto.
        Zu zahlender Betrag dann: <strong>{{ $finalTotal }} €</strong>.
    </p>
    @endif
    @endif

    <p>
        Bei Fragen stehen wir Ihnen jederzeit unter <a href="mailto:alpha.optics@gmx.net">alpha.optics@gmx.net</a>
        oder telefonisch unter 0049-30-8322 5031 zur Verfügung.
    </p>

    <p>Mit freundlichen Grüßen,<br>Ihr Alpha Collection Team</p>

    <div class="footer">
        Alpha Collection &bull; Glarner Strasse 3 &bull; 12205 Berlin &bull; alpha.optics@gmx.net
    </div>
</div>
</body>
</html>
