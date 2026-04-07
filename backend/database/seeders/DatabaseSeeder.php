<?php

namespace Database\Seeders;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Category;
use App\Models\Message;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\SkontoGroup;
use App\Models\SkontoTier;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ── Skonto Groups ──────────────────────────────────
        $bronze = SkontoGroup::create(['name' => 'Bronze Partner']);
        SkontoTier::create(['skonto_group_id' => $bronze->id, 'min_order_value' => 500, 'discount_percent' => 2]);
        SkontoTier::create(['skonto_group_id' => $bronze->id, 'min_order_value' => 2000, 'discount_percent' => 3]);

        $silver = SkontoGroup::create(['name' => 'Silber Partner']);
        SkontoTier::create(['skonto_group_id' => $silver->id, 'min_order_value' => 500, 'discount_percent' => 3]);
        SkontoTier::create(['skonto_group_id' => $silver->id, 'min_order_value' => 2000, 'discount_percent' => 5]);
        SkontoTier::create(['skonto_group_id' => $silver->id, 'min_order_value' => 5000, 'discount_percent' => 7]);

        $gold = SkontoGroup::create(['name' => 'Gold Partner']);
        SkontoTier::create(['skonto_group_id' => $gold->id, 'min_order_value' => 300, 'discount_percent' => 5]);
        SkontoTier::create(['skonto_group_id' => $gold->id, 'min_order_value' => 1000, 'discount_percent' => 8]);
        SkontoTier::create(['skonto_group_id' => $gold->id, 'min_order_value' => 5000, 'discount_percent' => 12]);

        // ── Users ──────────────────────────────────────────
        $admin = User::create([
            'name' => 'Admin',
            'email' => 'admin@alpha-collection.de',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        $user1 = User::create([
            'name' => 'Luxe Retail GmbH',
            'email' => 'einkauf@luxe-retail.de',
            'password' => Hash::make('password'),
            'role' => 'user',
            'skonto_group_id' => $gold->id,
        ]);

        $user2 = User::create([
            'name' => 'Vista Optik AG',
            'email' => 'bestellung@vista-optik.de',
            'password' => Hash::make('password'),
            'role' => 'user',
            'skonto_group_id' => $silver->id,
        ]);

        $user3 = User::create([
            'name' => 'Optic Elite SAS',
            'email' => 'order@optic-elite.fr',
            'password' => Hash::make('password'),
            'role' => 'user',
            'skonto_group_id' => $bronze->id,
        ]);

        $user4 = User::create([
            'name' => 'Global Clear Inc.',
            'email' => 'procurement@globalclear.jp',
            'password' => Hash::make('password'),
            'role' => 'user',
        ]);

        // ── Categories ─────────────────────────────────────
        $catAcetat   = Category::create(['name' => 'Acetat',            'slug' => 'acetat']);
        $catTitan    = Category::create(['name' => 'Titan',             'slug' => 'titan']);
        $catStahl    = Category::create(['name' => 'Edelstahl',         'slug' => 'edelstahl']);
        $catNylon    = Category::create(['name' => 'Nylon',             'slug' => 'nylon']);
        $catSonne    = Category::create(['name' => 'Sonnenbrillen',     'slug' => 'sonnenbrillen']);
        $catKorrektur = Category::create(['name' => 'Korrekturfassungen', 'slug' => 'korrekturfassungen']);

        // ── Products (mit Farben & Mengen pro Farbe) ───────
        $products = [
            [
                'name' => 'Milanese Tortoise', 'sku' => 'ALP-2024-TR', 'price' => 89.00,
                'cats' => [$catAcetat, $catKorrektur],
                'desc' => 'Klassische Havanna-Fassung aus italienischem Acetat. Handgefertigt in Cadore, Italien. Mittlere Passform (52mm).',
                'colors' => [
                    ['name' => 'Havanna Braun C01', 'stock_quantity' => 150],
                    ['name' => 'Schildpatt C02',    'stock_quantity' => 120],
                    ['name' => 'Schwarz C03',        'stock_quantity' => 90],
                    ['name' => 'Kristall C04',       'stock_quantity' => 60],
                ],
            ],
            [
                'name' => 'Ultraviolet Titanium', 'sku' => 'ALP-1190-TI', 'price' => 145.00,
                'cats' => [$catTitan, $catSonne],
                'desc' => 'Ultraleichte Pilotensonnenbrille aus Titanium Grade 5. UV400 Gläser. Große Passform (56mm).',
                'colors' => [
                    ['name' => 'M. Silber-Schwarz C24',  'stock_quantity' => 35],
                    ['name' => 'M. Gold-Braun C25',      'stock_quantity' => 28],
                    ['name' => 'M. Gunmetal-Grau C26',   'stock_quantity' => 22],
                ],
            ],
            [
                'name' => 'Noir Minimalist', 'sku' => 'ALP-5501-BL', 'price' => 72.00,
                'cats' => [$catAcetat, $catKorrektur],
                'desc' => 'Minimalistische schwarze Fassung. Japanisches Bio-Acetat. Kleine Passform (49mm).',
                'colors' => [
                    ['name' => 'Matt Schwarz C10',   'stock_quantity' => 480],
                    ['name' => 'Glanz Schwarz C11',  'stock_quantity' => 380],
                    ['name' => 'Dunkelblau C12',     'stock_quantity' => 210],
                    ['name' => 'Burgunder C13',      'stock_quantity' => 130],
                ],
            ],
            [
                'name' => 'Crystal Vapor', 'sku' => 'ALP-9003-CR', 'price' => 95.00,
                'cats' => [$catNylon, $catKorrektur],
                'desc' => 'Transparente Fassung aus hochfestem Nylon. Hypoallergen. Mittlere Passform (51mm).',
                'colors' => [
                    ['name' => 'Kristallklar C30',  'stock_quantity' => 8],
                    ['name' => 'Rauchgrau C31',      'stock_quantity' => 4],
                ],
            ],
            [
                'name' => 'Memory Titan Executive', 'sku' => 'MT-9920', 'price' => 42.50,
                'cats' => [$catTitan, $catKorrektur],
                'desc' => 'Flexible Erinnerungstitan-Fassung. Business-Styling. Flex-Legierung mit matter Oberfläche.',
                'colors' => [
                    ['name' => 'Silber matt C40',    'stock_quantity' => 210],
                    ['name' => 'Gunmetal C41',        'stock_quantity' => 180],
                    ['name' => 'Roségold C42',        'stock_quantity' => 160],
                    ['name' => 'Schwarz matt C43',    'stock_quantity' => 300],
                ],
            ],
            [
                'name' => 'Nordic Matte', 'sku' => 'MT-8121', 'price' => 38.00,
                'cats' => [$catStahl, $catKorrektur],
                'desc' => 'Skandinavisch inspirierte matte Edelstahlfassung. 6 Farbvarianten verfügbar.',
                'colors' => [
                    ['name' => 'Arktischweiß C50',   'stock_quantity' => 70],
                    ['name' => 'Fjordblau C51',       'stock_quantity' => 60],
                    ['name' => 'Steingrau C52',       'stock_quantity' => 80],
                    ['name' => 'Schwarz C53',         'stock_quantity' => 90],
                    ['name' => 'Sand C54',            'stock_quantity' => 25],
                    ['name' => 'Moosgrün C55',        'stock_quantity' => 15],
                ],
            ],
            [
                'name' => 'UltraLite Frame', 'sku' => 'MT-4402', 'price' => 55.00,
                'cats' => [$catTitan, $catKorrektur],
                'desc' => 'Premium Flex Serie. Federleichtes Titangestell mit Flexbügeln.',
                'colors' => [
                    ['name' => 'Titan Silber C60',   'stock_quantity' => 200],
                    ['name' => 'Titan Schwarz C61',  'stock_quantity' => 240],
                    ['name' => 'Titan Gold C62',     'stock_quantity' => 180],
                ],
            ],
            [
                'name' => 'Aviator Heritage', 'sku' => 'ALP-7701-AV', 'price' => 125.00,
                'cats' => [$catStahl, $catSonne],
                'desc' => 'Klassischer Aviator-Stil in gebürstetem Edelstahl. Polarisierte Mineralgläser.',
                'colors' => [
                    ['name' => 'Gold-Braun polarisiert C70',   'stock_quantity' => 80],
                    ['name' => 'Silber-Grau polarisiert C71',  'stock_quantity' => 75],
                    ['name' => 'Gunmetal-Grün polarisiert C72','stock_quantity' => 45],
                ],
            ],
            [
                'name' => 'Carbon Sport Pro', 'sku' => 'ALP-3310-SP', 'price' => 165.00,
                'cats' => [$catNylon, $catSonne],
                'desc' => 'Sportsonnenbrille mit Carbonverstärkung. Rutschfeste Nasenpolster. Große Passform.',
                'colors' => [
                    ['name' => 'Schwarz-Rot C80',   'stock_quantity' => 40],
                    ['name' => 'Schwarz-Blau C81',  'stock_quantity' => 35],
                    ['name' => 'Weiß-Schwarz C82',  'stock_quantity' => 20],
                ],
            ],
            [
                'name' => 'Vienna Round', 'sku' => 'ALP-6600-VR', 'price' => 78.00,
                'cats' => [$catAcetat, $catKorrektur],
                'desc' => 'Runde Retro-Fassung aus Mazzucchelli-Acetat. Schlüssellochsteg. Mittlere Passform.',
                'colors' => [
                    ['name' => 'Cognac C90',      'stock_quantity' => 140],
                    ['name' => 'Olivgrün C91',    'stock_quantity' => 110],
                    ['name' => 'Pflaume C92',     'stock_quantity' => 160],
                    ['name' => 'Schwarz C93',     'stock_quantity' => 140],
                ],
            ],
            [
                'name' => 'Berlin Edge', 'sku' => 'ALP-2200-BE', 'price' => 68.00,
                'cats' => [$catAcetat, $catKorrektur],
                'desc' => 'Eckige moderne Fassung. Zweifarbiges Acetat. Unisex. Kleine bis mittlere Passform.',
                'colors' => [
                    ['name' => 'Schwarz-Transparent C100', 'stock_quantity' => 200],
                    ['name' => 'Schildpatt-Creme C101',    'stock_quantity' => 180],
                    ['name' => 'Blau-Transparent C102',    'stock_quantity' => 220],
                    ['name' => 'Rotbraun-Schwarz C103',    'stock_quantity' => 180],
                ],
            ],
            [
                'name' => 'Monaco Shield', 'sku' => 'ALP-8800-MS', 'price' => 198.00,
                'cats' => [$catTitan, $catSonne],
                'desc' => 'Luxus-Sportschild aus gebogenem Titan. Verspiegelte Gläser. Limitierte Edition.',
                'colors' => [
                    ['name' => 'Titan-Blau verspiegelt C110',  'stock_quantity' => 18],
                    ['name' => 'Titan-Gold verspiegelt C111',  'stock_quantity' => 15],
                    ['name' => 'Titan-Rot verspiegelt C112',   'stock_quantity' => 12],
                ],
            ],
        ];

        $createdProducts = [];
        foreach ($products as $p) {
            $product = Product::create([
                'name'        => $p['name'],
                'slug'        => Str::slug($p['name']),
                'sku'         => $p['sku'],
                'description' => $p['desc'],
                'price'       => $p['price'],
                'is_active'   => true,
                'image_url'   => null,
            ]);
            $product->categories()->attach(array_map(fn($c) => $c->id, $p['cats']));
            $product->colors()->createMany($p['colors']);
            $createdProducts[] = $product->load('colors');
        }

        // ── Sample Orders ──────────────────────────────────
        // Farb-IDs der jeweiligen Produkte nachschlagen
        $p0colors = $createdProducts[0]->colors;  // Milanese Tortoise
        $p1colors = $createdProducts[1]->colors;  // Ultraviolet Titanium
        $p2colors = $createdProducts[2]->colors;  // Noir Minimalist
        $p4colors = $createdProducts[4]->colors;  // Memory Titan Executive
        $p5colors = $createdProducts[5]->colors;  // Nordic Matte
        $p6colors = $createdProducts[6]->colors;  // UltraLite Frame
        $p7colors = $createdProducts[7]->colors;  // Aviator Heritage
        $p8colors = $createdProducts[8]->colors;  // Carbon Sport Pro
        $p9colors = $createdProducts[9]->colors;  // Vienna Round

        $order1 = Order::create([
            'user_id' => $user1->id, 'status' => 'bearbeitet',
            'total_price' => 12450.00, 'skonto_discount' => 1494.00, 'final_price' => 10956.00,
            'notes' => 'Bitte Lieferung bis Ende des Monats.',
        ]);
        OrderItem::create(['order_id' => $order1->id, 'product_id' => $createdProducts[0]->id, 'product_color_id' => $p0colors[0]->id, 'quantity' => 30, 'price_snapshot' => 89.00]);
        OrderItem::create(['order_id' => $order1->id, 'product_id' => $createdProducts[0]->id, 'product_color_id' => $p0colors[1]->id, 'quantity' => 20, 'price_snapshot' => 89.00]);
        OrderItem::create(['order_id' => $order1->id, 'product_id' => $createdProducts[1]->id, 'product_color_id' => $p1colors[0]->id, 'quantity' => 30, 'price_snapshot' => 145.00]);
        OrderItem::create(['order_id' => $order1->id, 'product_id' => $createdProducts[4]->id, 'product_color_id' => $p4colors[3]->id, 'quantity' => 100, 'price_snapshot' => 42.50]);

        $order2 = Order::create([
            'user_id' => $user2->id, 'status' => 'versendet',
            'total_price' => 8120.50, 'skonto_discount' => 568.44, 'final_price' => 7552.06,
        ]);
        OrderItem::create(['order_id' => $order2->id, 'product_id' => $createdProducts[2]->id, 'product_color_id' => $p2colors[0]->id, 'quantity' => 40, 'price_snapshot' => 72.00]);
        OrderItem::create(['order_id' => $order2->id, 'product_id' => $createdProducts[2]->id, 'product_color_id' => $p2colors[1]->id, 'quantity' => 35, 'price_snapshot' => 72.00]);
        OrderItem::create(['order_id' => $order2->id, 'product_id' => $createdProducts[5]->id, 'product_color_id' => $p5colors[2]->id, 'quantity' => 50, 'price_snapshot' => 38.00]);
        OrderItem::create(['order_id' => $order2->id, 'product_id' => $createdProducts[9]->id, 'product_color_id' => $p9colors[0]->id, 'quantity' => 15, 'price_snapshot' => 78.00]);

        $order3 = Order::create([
            'user_id' => $user3->id, 'status' => 'eingegangen',
            'total_price' => 24900.00, 'skonto_discount' => 747.00, 'final_price' => 24153.00,
            'notes' => 'Dringende Bestellung – bitte priorisieren.',
        ]);
        OrderItem::create(['order_id' => $order3->id, 'product_id' => $createdProducts[7]->id, 'product_color_id' => $p7colors[0]->id, 'quantity' => 50, 'price_snapshot' => 125.00]);
        OrderItem::create(['order_id' => $order3->id, 'product_id' => $createdProducts[7]->id, 'product_color_id' => $p7colors[1]->id, 'quantity' => 50, 'price_snapshot' => 125.00]);
        OrderItem::create(['order_id' => $order3->id, 'product_id' => $createdProducts[8]->id, 'product_color_id' => $p8colors[0]->id, 'quantity' => 75, 'price_snapshot' => 165.00]);

        $order4 = Order::create([
            'user_id' => $user4->id, 'status' => 'eingegangen',
            'total_price' => 5400.00, 'skonto_discount' => 0, 'final_price' => 5400.00,
        ]);
        OrderItem::create(['order_id' => $order4->id, 'product_id' => $createdProducts[6]->id, 'product_color_id' => $p6colors[0]->id, 'quantity' => 30, 'price_snapshot' => 55.00]);
        OrderItem::create(['order_id' => $order4->id, 'product_id' => $createdProducts[6]->id, 'product_color_id' => $p6colors[1]->id, 'quantity' => 30, 'price_snapshot' => 55.00]);
        OrderItem::create(['order_id' => $order4->id, 'product_id' => $createdProducts[5]->id, 'product_color_id' => $p5colors[0]->id, 'quantity' => 60, 'price_snapshot' => 38.00]);

        // ── Sample Messages ────────────────────────────────
        Message::create([
            'user_id' => $user1->id,
            'subject' => 'Anfrage zu Großbestellung Q2',
            'content' => 'Wir möchten für das zweite Quartal eine größere Bestellung aufgeben. Können Sie uns ein individuelles Angebot für 500+ Einheiten des Milanese Tortoise machen?',
            'status' => 'open',
        ]);

        Message::create([
            'user_id' => $user2->id,
            'subject' => 'Lieferstatus Bestellung #2',
            'content' => 'Könnten Sie uns bitte die Tracking-Nummer für unsere letzte Bestellung mitteilen?',
            'status' => 'closed',
            'admin_reply' => 'Ihre Bestellung wurde mit DHL versendet. Tracking: DE4521897634. Voraussichtliche Lieferung in 2-3 Werktagen.',
        ]);

        Message::create([
            'user_id' => $user3->id,
            'subject' => 'Reklamation – Beschädigte Ware',
            'content' => 'Leider sind bei der letzten Lieferung 5 Stück der Aviator Heritage beschädigt angekommen. Bitte um Austausch.',
            'status' => 'open',
        ]);

        // ── Sample Cart ────────────────────────────────────
        $p10colors = $createdProducts[10]->colors; // Berlin Edge
        $p11colors = $createdProducts[11]->colors; // Monaco Shield

        $cart = Cart::create(['user_id' => $user1->id]);
        CartItem::create(['cart_id' => $cart->id, 'product_id' => $createdProducts[10]->id, 'product_color_id' => $p10colors[0]->id, 'quantity' => 25]);
        CartItem::create(['cart_id' => $cart->id, 'product_id' => $createdProducts[11]->id, 'product_color_id' => $p11colors[1]->id, 'quantity' => 10]);
    }
}
