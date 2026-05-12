<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <title>Rechnung {{ $invoice['number'] }}</title>
    <style>
        @page { size: A4; margin: 20mm; }

        body {
            font-family: DejaVu Sans, Arial, sans-serif;
            color: #222;
            font-size: 12px;
            line-height: 1.4;
        }

        h1 { font-size: 20px; margin: 0 0 6px 0; }
        h3 { font-size: 13px; margin: 0 0 8px 0; }
        p { margin: 0 0 3px 0; }

        .invoice-wrapper { width: 100%; }

        .layout-table { width: 100%; border: 0; border-collapse: collapse; margin-bottom: 40px; }
        .layout-table td { vertical-align: top; padding: 0; border: 0; }

        .company-right { text-align: right; }

        .invoice-meta table { border-collapse: collapse; }
        .invoice-meta td { padding: 3px 8px 3px 0; vertical-align: top; }
        .invoice-meta td:first-child { color: #555; white-space: nowrap; }

        .products-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .products-table thead tr { background: #f0f0f0; }
        .products-table th,
        .products-table td { border-bottom: 1px solid #ccc; padding: 8px 6px; text-align: left; }
        .products-table th { font-weight: bold; }
        .products-table td:nth-child(4),
        .products-table td:nth-child(5),
        .products-table th:nth-child(4),
        .products-table th:nth-child(5) { text-align: right; }

        .totals-table { border-collapse: collapse; margin-left: auto; width: 320px; }
        .totals-table td { padding: 5px 0; border: 0; }
        .totals-table td:last-child { text-align: right; padding-left: 20px; white-space: nowrap; }
        .totals-table tr.separator td { border-top: 1px solid #ccc; }
        .totals-table tr.grand-total td { font-weight: bold; font-size: 13px; }
        .totals-table tr.discount-row td { color: #555; font-size: 11px; }
        .totals-table tr.final-total td { font-weight: bold; font-size: 14px; border-top: 2px solid #222; }

        .payment-section { margin-top: 40px; border-top: 1px solid #ccc; padding-top: 16px; font-size: 11px; color: #444; }
        .payment-section p { margin: 0 0 6px 0; }
    </style>
</head>
<body>

<div class="invoice-wrapper">

    {{-- Header --}}
    <table class="layout-table">
        <tr>
            <td style="width:50%;">
                <h1>Alpha Collection</h1>
                <p>Glarner Strasse 3</p>
                <p>12205 Berlin, Germany</p>
                <p>Tel. 0049-30-8322 5031</p>
                <p>alpha.optics@gmx.net</p>
            </td>
            <td style="width:50%;" class="company-right">
                <p><strong>IBAN:</strong> DE39 7601 0085 0707 3428 55</p>
                <p><strong>BIC:</strong> PBNKDEFF</p>
                <p><strong>USt-IdNr:</strong> DE253861264</p>
            </td>
        </tr>
    </table>

    {{-- Customer + Meta --}}
    <table class="layout-table">
        <tr>
            <td style="width:55%;">
                <h3>Rechnung an</h3>
                @if($customer['company'])
                    <p>{{ $customer['company'] }}</p>
                @endif
                <p>{{ $customer['name'] }}</p>
                <p>{{ $customer['street'] }}</p>
                <p>{{ $customer['zip'] }} {{ $customer['city'] }}</p>
                <p>{{ $customer['country'] }}</p>
            </td>
            <td style="width:45%;" class="invoice-meta">
                <table>
                    <tr>
                        <td>Rechnungsnummer:</td>
                        <td><strong>{{ $invoice['number'] }}</strong></td>
                    </tr>
                    <tr>
                        <td>Datum:</td>
                        <td>{{ $invoice['date'] }}</td>
                    </tr>
                    <tr>
                        <td>Kundennummer:</td>
                        <td>{{ $customer['number'] }}</td>
                    </tr>
                    <tr>
                        <td>Bestellnummer:</td>
                        <td>{{ $invoice['orderNumber'] }}</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    {{-- Products --}}
    <table class="products-table">
        <thead>
            <tr>
                <th>Menge</th>
                <th>Artikel</th>
                <th>Beschreibung</th>
                <th>Einzelpreis</th>
                <th>Summe</th>
            </tr>
        </thead>
        <tbody>
            @foreach($items as $item)
            <tr>
                <td>{{ $item['quantity'] }}</td>
                <td>{{ $item['sku'] }}</td>
                <td>{{ $item['description'] }}</td>
                <td>{{ $item['price'] }} €</td>
                <td>{{ $item['total'] }} €</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    {{-- Totals --}}
    <table class="totals-table">
        <tr>
            <td>Zwischensumme:</td>
            <td>{{ $totals['subtotal'] }} €</td>
        </tr>
        <tr>
            <td>Versand:</td>
            <td>{{ $totals['shipping'] }} €</td>
        </tr>
        <tr class="separator">
            <td>zzgl. MwSt. (19%):</td>
            <td>{{ $totals['tax'] }} €</td>
        </tr>
        <tr class="grand-total separator">
            <td>Gesamtbetrag (brutto):</td>
            <td>{{ $totals['grandTotal'] }} €</td>
        </tr>
        @if($totals['discount'] > 0)
        <tr class="discount-row">
            <td>{{ $totals['discountPercent'] }}% Skonto bei Zahlung bis {{ $invoice['discountDate'] }}:</td>
            <td>- {{ $totals['discount'] }} €</td>
        </tr>
        @endif
        <tr class="final-total">
            <td>Zu zahlender Betrag:</td>
            <td>{{ $totals['finalTotal'] }} €</td>
        </tr>
    </table>

    {{-- Payment instructions --}}
    <div class="payment-section">
        <p>
            Bitte überweisen Sie den Betrag von <strong>{{ $totals['finalTotal'] }} €</strong>
            innerhalb von 30 Tagen auf unser Konto:
        </p>
        <p>
            IBAN: DE39 7601 0085 0707 3428 55 &nbsp;|&nbsp; BIC: PBNKDEFF &nbsp;|&nbsp;
            Verwendungszweck: <strong>{{ $invoice['orderNumber'] }}</strong>
        </p>
        @if($totals['discount'] > 0)
        <p style="margin-top:6px;">
            Bei Zahlung bis {{ $invoice['discountDate'] }} gewähren wir {{ $totals['discountPercent'] }}% Skonto
            ({{ $totals['discount'] }} €). Zu zahlender Betrag dann: <strong>{{ $totals['finalTotal'] }} €</strong>.
        </p>
        @endif
    </div>

</div>

</body>
</html>
