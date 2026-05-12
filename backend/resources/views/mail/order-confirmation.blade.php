<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; color: #222; font-size: 14px; line-height: 1.6; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 32px 24px; }
        h2 { color: #1a1a1a; margin-top: 0; }
        .highlight { font-weight: bold; }
        .footer { margin-top: 40px; font-size: 12px; color: #888; border-top: 1px solid #e0e0e0; padding-top: 16px; }
    </style>
</head>
<body>
<div class="container">

    <h2>Vielen Dank für Ihre Bestellung!</h2>

    <p>Hallo {{ $customerName }},</p>

    <p>
        Ihre Bestellung <span class="highlight">{{ $orderNumber }}</span> ist bei uns eingegangen
        und wird schnellstmöglich bearbeitet.
    </p>

    <p>
        Ihre Rechnung (<span class="highlight">{{ $invoiceNumber }}</span>) finden Sie als PDF im Anhang dieser E-Mail.
    </p>

    @if($isSepa)
    <p>
        Der Rechnungsbetrag wird im Rahmen des SEPA-Lastschriftverfahrens von Ihrem Konto eingezogen.
    </p>
    @else
    <p>
        Bitte überweisen Sie den Rechnungsbetrag unter Angabe der Bestellnummer
        <span class="highlight">{{ $orderNumber }}</span> auf unser Konto.
    </p>
    @endif

    <p>
        Bei Fragen stehen wir Ihnen unter
        <a href="mailto:alpha.optics@gmx.net">alpha.optics@gmx.net</a>
        oder telefonisch unter 0049-30-8322 5031 gerne zur Verfügung.
    </p>

    <p>Mit freundlichen Grüßen,<br>Ihr Alpha Collection Team</p>

    <div class="footer">
        Alpha Collection &bull; Glarner Strasse 3 &bull; 12205 Berlin &bull; alpha.optics@gmx.net
    </div>
</div>
</body>
</html>
