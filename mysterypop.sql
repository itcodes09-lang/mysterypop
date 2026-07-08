-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 08, 2026 at 02:25 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `mysterypop`
--

-- --------------------------------------------------------

--
-- Table structure for table `box_serials`
--

CREATE TABLE `box_serials` (
  `id` int(11) NOT NULL,
  `serial` varchar(255) NOT NULL,
  `item_id` int(11) DEFAULT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'available',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(120) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `id` int(11) NOT NULL,
  `fname` varchar(255) NOT NULL,
  `lname` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `zipcode` varchar(20) DEFAULT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `customers`
--

INSERT INTO `customers` (`id`, `fname`, `lname`, `address`, `zipcode`, `phone`, `image`, `created_at`, `updated_at`) VALUES
(2, 'John', 'Doe', '123 Vault Street, Metropolis', '00000', '(555) 123-4567', NULL, '2026-07-07 13:27:30', '2026-07-07 13:27:30');

-- --------------------------------------------------------

--
-- Table structure for table `items`
--

CREATE TABLE `items` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `stock` int(11) DEFAULT 0,
  `image` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `images` text DEFAULT NULL,
  `rarity` varchar(255) DEFAULT 'common',
  `character_percentages` text DEFAULT NULL,
  `brand` varchar(255) DEFAULT 'Mystery Pop',
  `theme` varchar(255) DEFAULT 'General',
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `items`
--

INSERT INTO `items` (`id`, `name`, `description`, `price`, `stock`, `image`, `created_at`, `updated_at`, `images`, `rarity`, `character_percentages`, `brand`, `theme`, `deleted_at`) VALUES
(11, 'Baby Tabby Series Figures', 'Bring home a dose of pure joy with the POP MART Baby Molly & Baby Tabby series! This adorable collection features the iconic Baby Molly in heartwarming, playful scenes with her feline friend, Tabby.', 1000.00, 100, '/uploads/1783437916574-863421333.png', '2026-07-07 15:25:16', '2026-07-07 15:25:16', '[\"/uploads/1783437916574-863421333.png\",\"/uploads/1783437916597-349841391.png\",\"/uploads/1783437916604-981405556.png\"]', 'common', NULL, 'Baby molly', 'Baby Tabby Series Figures', NULL),
(12, 'Buggy Roam Series - Vinyl Plush Pendant Blind Box', 'Add a touch of whimsy to your style with the Buggy Roam Series! This unique collection combines the soft, huggable texture of premium plush with the detailed, artistic flair of vinyl character design.\r\n\r\nDesigned as a functional pendant, these figures are perfect for personalizing your bag, keys, or backpack. Whether you are looking to complete your collection or just want a cute, high-quality accessory, these Buggy Roam figures are the perfect pick.', 1500.00, 100, '/uploads/1783438202914-607573893.WEBP', '2026-07-07 15:29:29', '2026-07-07 15:30:02', '[\"/uploads/1783438202914-607573893.WEBP\",\"/uploads/1783438202915-951391885.WEBP\",\"/uploads/1783438202917-368583705.WEBP\"]', 'common', NULL, 'Baby molly', 'Buggy Roam Series', NULL),
(13, 'Pocket Friends Series-Vinyl Plush Pendant Blind Box', 'Take your favorite companions with you wherever you go! The Pocket Friends Series brings a delightful mix of soft, premium plush and high-detail vinyl elements to create the ultimate wearable accessory.\r\n\r\nThese adorable pendants are the perfect blend of cozy and collectible. Whether you\'re dressing up your daily tote, adding a unique touch to your backpack, or looking for the perfect gift, these Pocket Friends are designed to bring a smile to your face.', 1500.00, 100, '/uploads/1783438381046-907325777.WEBP', '2026-07-07 15:33:01', '2026-07-07 15:33:01', '[\"/uploads/1783438381046-907325777.WEBP\",\"/uploads/1783438381047-183188152.WEBP\",\"/uploads/1783438381049-998898533.WEBP\"]', 'common', NULL, 'Baby molly', 'Pocket Friends Series', NULL),
(14, 'When I was Three！Series Figures', 'Take a trip down memory lane with the \"When I Was Three!\" Series. This charming collection captures the sweet, innocent, and imaginative world of early childhood. With intricate details and a soft, nostalgic color palette, these figures serve as a beautiful reminder of the little moments that define our earliest memories.\r\n\r\nWhether you are a long-time collector or looking to start a new display, these figures offer a whimsical, heartwarming aesthetic that stands out on any shelf.', 1500.00, 100, '/uploads/1783438485445-685290634.WEBP', '2026-07-07 15:34:45', '2026-07-07 15:34:45', '[\"/uploads/1783438485445-685290634.WEBP\",\"/uploads/1783438485447-608896708.WEBP\",\"/uploads/1783438485449-585347370.WEBP\"]', 'common', NULL, 'Baby molly', 'When I was Three！', NULL),
(15, 'Winter Fit Check Series-Vinyl Plush Pendant Blind Box', 'Elevate your accessory game with the Baby Molly Winter Fit Check Series! This collection perfectly blends the softness of premium plush with the iconic, detailed vinyl design that Pop Mart fans adore. Each figure is ready for the cold weather in a stylish winter outfit, making them the perfect companion to clip onto your favorite backpack, tote, or keys.', 1500.00, 100, '/uploads/1783438571483-929204212.WEBP', '2026-07-07 15:36:11', '2026-07-07 15:36:11', '[\"/uploads/1783438571483-929204212.WEBP\",\"/uploads/1783438571484-482752086.WEBP\",\"/uploads/1783438571485-476162545.WEBP\"]', 'common', NULL, 'Baby molly', 'Winter Fit Check Series', NULL),
(16, 'CHEER UP, BABY! SERIES-Plush Pendant Blind Box', 'Need a little pick-me-up? Meet the Crybaby “Cheer Up, Baby!” series! This highly sought-after collection turns the whimsical, emotional charm of the Crybaby character into a soft, cuddly pendant. Designed to be your little companion on the go, these pendants are the perfect way to add a touch of personality to your favorite bags or keychain sets.', 2000.00, 1000, '/uploads/1783438688447-911800852.WEBP', '2026-07-07 15:38:08', '2026-07-07 15:38:08', '[\"/uploads/1783438688447-911800852.WEBP\",\"/uploads/1783438688448-327834936.WEBP\",\"/uploads/1783438688451-481211276.WEBP\"]', 'common', NULL, 'Crybaby', 'CHEER UP, BABY!', NULL),
(17, 'CRYING TO THE MOON SERIES FIGURES', 'Embark on a celestial journey with the Crybaby: Crying to the Moon series. This stunning collection takes the iconic, emotional artistry of the Crybaby character and transports it into a dreamy, galactic realm. Each figure captures a delicate moment in space—from moon-gazing to starlit travels—blending feelings of solitude, wonder, and fantasy.\r\n\r\nPerfect for dedicated collectors and fans of unique art toys, these figures are renowned for their intricate details, high-quality finishes, and the gentle, storytelling aesthetic that Crybaby is famous for.', 2000.00, 100, '/uploads/1783438917780-600246274.WEBP', '2026-07-07 15:41:57', '2026-07-07 15:43:01', '[\"/uploads/1783438917780-600246274.WEBP\",\"/uploads/1783438917782-325134479.WEBP\",\"/uploads/1783438917785-362519692.WEBP\"]', 'common', NULL, 'Crybaby', 'CRYING TO THE MOON ', NULL),
(18, 'Powerpuff Girls Series-Vinyl Face Plush Blind Box', 'Get ready for a double dose of cuteness! The CRYBABY x Powerpuff Girls series reimagines the legendary trio—Blossom, Bubbles, and Buttercup—through the emotional, whimsical lens of the Crybaby artist. These unique figures combine a soft, high-quality plush body with a smooth, intricately detailed vinyl face, creating a collectible that is as tactile as it is artistic.', 2000.00, 100, '/uploads/1783439125893-846371870.WEBP', '2026-07-07 15:44:12', '2026-07-07 15:45:25', '[\"/uploads/1783439125893-846371870.WEBP\",\"/uploads/1783439125894-118863178.WEBP\",\"/uploads/1783439125895-208304638.WEBP\"]', 'common', NULL, 'Crybaby', 'Powerpuff Girls Series', NULL),
(19, 'SHINY SHINY Series-Luminous Pendant Blind Box', 'Light up your collection with the SHINY SHINY Series! These adorable, whimsical pendants are designed with a special luminous (glow-in-the-dark) finish, making them stand out whether it\'s day or night.\r\n\r\nWhether you’re looking to add a magical touch to your backpack, keys, or display shelf, these pendants bring a unique, glowing personality to any accessory. They are the perfect blend of trendy design and interactive fun.', 2000.00, 100, '/uploads/1783439221415-275509647.WEBP', '2026-07-07 15:47:01', '2026-07-07 15:47:01', '[\"/uploads/1783439221415-275509647.WEBP\",\"/uploads/1783439221416-919008684.WEBP\",\"/uploads/1783439221418-357745166.WEBP\"]', 'common', NULL, 'Crybaby', 'SHINY SHINY', NULL),
(20, 'Vacation Mode On Series-Vinyl Plush Pendant Blind Box', 'Get ready for your next adventure with the Vacation Mode On Series! This delightful collection captures the carefree spirit of summer travel, combining soft, huggable plush materials with detailed vinyl elements.\r\n\r\nWhether you\'re packing for a getaway or just want to bring some \"vacation vibes\" to your daily routine, these pendants are the perfect travel buddy. Clip them onto your suitcase, backpack, or tote bag to add a playful, adventurous touch to your style.', 2000.00, 100, '/uploads/1783439294966-946803005.WEBP', '2026-07-07 15:48:14', '2026-07-07 15:48:14', '[\"/uploads/1783439294966-946803005.WEBP\",\"/uploads/1783439294967-48243004.WEBP\",\"/uploads/1783439294969-631469413.WEBP\"]', 'common', NULL, 'Crybaby', 'Vacation Mode On', NULL),
(21, 'A Night of Fantasy Series Figures', 'Step into a world of wonder with the A Night of Fantasy Series. This collection is a beautiful, ethereal exploration of dreams, magic, and mystery. Featuring stunning, detailed artistry, these figures are designed to look like they’ve just stepped out of a fairytale.\r\n\r\nWhether you are looking to create a whimsical display, find the perfect centerpiece for your shelf, or add to your collection of high-end art toys, the \"A Night of Fantasy\" series brings a touch of magic to any space.', 2500.00, 100, '/uploads/1783439424982-701622143.WEBP', '2026-07-07 15:50:24', '2026-07-07 15:50:24', '[\"/uploads/1783439424982-701622143.WEBP\",\"/uploads/1783439424983-81549171.WEBP\",\"/uploads/1783439424991-875919733.WEBP\"]', 'common', NULL, 'Hacipupu', 'A Night of Fantasy ', NULL),
(22, 'Enchanted Realm Tales Series MINI Action Figure', 'Enter a world of pure imagination with the HACIPUPU: Enchanted Realm Tales series. Each figure in this collection is a masterpiece of design, blending the beloved, wide-eyed charm of Hacipupu with dreamy, fantasy-inspired attire. Featuring BJD (Ball-Jointed Doll) construction, these figures aren\'t just for display—they are poseable, interactive, and full of personality.\r\n\r\nWhether you\'re an avid Hacipupu fan or just starting your art-toy journey, these \"Enchanted Realm\" figures bring a touch of fairytale magic to any desk or shelf.', 2500.00, 100, '/uploads/1783439495376-35767554.WEBP', '2026-07-07 15:51:35', '2026-07-07 15:51:35', '[\"/uploads/1783439495376-35767554.WEBP\",\"/uploads/1783439495377-354322875.WEBP\",\"/uploads/1783439495378-816582502.WEBP\"]', 'common', NULL, 'Hacipupu', 'Enchanted Realm Tales ', NULL),
(23, 'Gummy Bear Series-Vinyl Plush Pendant Blind Box', 'Add a splash of color and sweetness to your daily routine with the Gummy Bear Series! This adorable collection combines the soft, irresistibly huggable texture of plush with a trendy, semi-translucent vinyl finish, giving these pendants the look of your favorite childhood gummy candies.\r\n\r\nWhether you want to personalize your favorite backpack, add a pop of color to your keys, or gift a little sweetness to a friend, these pendants are the perfect accessory to brighten up your day.', 2500.00, 100, '/uploads/1783439589640-773127235.WEBP', '2026-07-07 15:53:09', '2026-07-07 15:53:09', '[\"/uploads/1783439589640-773127235.WEBP\",\"/uploads/1783439589642-898458952.WEBP\",\"/uploads/1783439589649-140053868.WEBP\"]', 'common', NULL, 'Hacipupu', 'Gummy Bear ', NULL),
(24, 'Snuggle With You Series Figures', 'Bring home the feeling of comfort and warmth with the \"Snuggle With You\" Series. This collection is designed to capture the sweetest, most heart-melting moments of companionship. Whether it’s a quiet nap, a gentle hug, or a shared moment of peace, these figures embody the joy of being close to those we love.\r\n\r\nWith their soft aesthetics, gentle expressions, and heartwarming poses, these figures are perfect for adding a touch of tenderness and serenity to any desk, bedside table, or display case.', 2500.00, 100, '/uploads/1783439646088-195579644.WEBP', '2026-07-07 15:54:06', '2026-07-07 15:54:06', '[\"/uploads/1783439646088-195579644.WEBP\",\"/uploads/1783439646089-494410686.WEBP\",\"/uploads/1783439646091-611229398.WEBP\"]', 'common', NULL, 'Hacipupu', 'Snuggle With You ', NULL),
(25, 'The Constellation Series-Vinyl Plush Blind Box', 'Look to the stars with the HACIPUPU: The Constellation Series! This enchanting collection brings the wonder of the night sky to life, reimagining HACIPUPU as a celestial messenger. Each pendant features a unique design inspired by the zodiac and the stars, combining the cozy texture of premium plush with the detailed, artistic flair of vinyl.\r\n\r\nWhether you\'re looking to personalize your favorite bag or add a touch of cosmic magic to your display shelf, these pendants are the perfect way to carry a piece of the night sky with you.', 2500.00, 100, '/uploads/1783439747747-539306928.WEBP', '2026-07-07 15:55:47', '2026-07-07 15:55:47', '[\"/uploads/1783439747747-539306928.WEBP\",\"/uploads/1783439747748-724098406.WEBP\",\"/uploads/1783439747750-218723538.WEBP\"]', 'common', NULL, 'Hacipupu', 'The Constellation', NULL),
(26, 'Echo Series Figures', 'Discover the hauntingly beautiful artistry of the Echo Series. This collection captures the essence of reflection and resonance, bringing characters to life with a design language that feels both modern and timeless. With its unique color palette and intricate character details, each figure in the \"Echo\" series serves as a striking statement piece.\r\n\r\nWhether you are a dedicated collector looking to complete your set or an admirer of avant-garde art toys, these figures are designed to stand out. Their thoughtful craftsmanship and evocative designs make them a perfect addition to any curated display.', 1500.00, 100, '/uploads/1783439865785-25594417.WEBP', '2026-07-07 15:57:45', '2026-07-07 15:57:45', '[\"/uploads/1783439865785-25594417.WEBP\",\"/uploads/1783439865785-973347042.WEBP\",\"/uploads/1783439865787-343163211.WEBP\"]', 'common', NULL, 'Hirono', 'Echo', NULL),
(27, 'Le Petit Prince Series Figures', 'Rediscover the wonder of childhood with the Le Petit Prince Series. Based on the beloved literary masterpiece, this collection captures the gentle, philosophical, and whimsical essence of the Little Prince and his interplanetary friends.\r\n\r\nEach figure is a beautifully crafted tribute to the story\'s iconic scenes, featuring delicate details and a soft, artistic palette that feels like a page turned straight from the book. Whether you’re a long-time admirer of the story or an art-toy enthusiast who appreciates emotional storytelling, these figures are a beautiful, sentimental addition to any collection.', 1500.00, 100, '/uploads/1783439980895-208395673.WEBP', '2026-07-07 15:59:40', '2026-07-07 15:59:40', '[\"/uploads/1783439980895-208395673.WEBP\",\"/uploads/1783439980896-269553084.WEBP\",\"/uploads/1783439980898-408119928.WEBP\"]', 'common', NULL, 'Hirono', 'Le Petit Prince', NULL),
(28, 'Monsters_ Carnival Series Figures', 'Step right up to the most thrilling show in town! The Monsters, Carnival Series brings a vibrant, quirky, and slightly spooky twist to your collection. Each figure in this series is ready to perform, featuring bold designs, eccentric costumes, and all the whimsical flair you’d expect from a monster-filled carnival.\r\n\r\nWhether you love unique character designs or you’re looking for a standout piece to spice up your display, this series is all about bold colors and fun, twisted personalities.', 1500.00, 100, '/uploads/1783440095173-617673719.WEBP', '2026-07-07 16:01:35', '2026-07-07 16:01:35', '[\"/uploads/1783440095173-617673719.WEBP\",\"/uploads/1783440095175-92504130.WEBP\",\"/uploads/1783440095176-235108341.WEBP\"]', 'common', NULL, 'Hirono', 'Monsters Carnival', NULL),
(29, 'Road Journal Series-Plush Doll Pendant Blind Box', 'Capture the quiet, contemplative moments of a journey with the Hirono: Road Journal series. Unlike standard art toys, Hirono figures are celebrated for their ability to convey complex, raw emotions through their unique design. This pendant series takes that soulful artistry and turns it into a soft, tactile companion.\r\n\r\nWhether you are looking to add a touch of artistic depth to your daily carry or are a long-time Hirono collector who appreciates the series\' storytelling, these plush pendants are the perfect way to keep that \"Road Journal\" spirit with you wherever you go.', 1500.00, 100, '/uploads/1783440221092-217836632.WEBP', '2026-07-07 16:03:41', '2026-07-07 16:03:41', '[\"/uploads/1783440221092-217836632.WEBP\",\"/uploads/1783440221094-694761959.WEBP\",\"/uploads/1783440221098-677853128.WEBP\"]', 'common', NULL, 'Hirono', 'Road Journal', NULL),
(30, 'Shelter Series Figures', 'Find your quiet space with the \"Shelter\" Series. This collection is a beautiful exploration of the places—and feelings—that make us feel safe and at home. From cozy nooks to imaginative indoor sanctuaries, these figures are designed to remind us of the comfort found in our own private worlds.\r\n\r\nWith their intricate details, warm color palettes, and heartwarming focus on domestic comfort, these figures are perfect for anyone who loves art toys that tell a story of peace, solitude, and belonging.', 1500.00, 100, '/uploads/1783440326302-238733069.WEBP', '2026-07-07 16:05:26', '2026-07-07 16:05:26', '[\"/uploads/1783440326302-238733069.WEBP\",\"/uploads/1783440326303-181206673.WEBP\",\"/uploads/1783440326305-979109515.WEBP\"]', 'common', NULL, 'Hirono', 'Shelter Series', NULL),
(31, 'L’impressionnisme Series Plush Doll', 'Experience the gentle beauty of art history brought to life with the L’impressionnisme Series. Inspired by the soft light, delicate brushwork, and emotive colors of the Impressionist movement, this plush doll collection is a stunning fusion of classic art and modern design.\r\n\r\nWith their dreamlike aesthetics and high-quality textures, these figures capture the same atmosphere of peace and fleeting beauty found in famous Impressionist masterpieces. Whether you are an art enthusiast or a collector of unique plush toys, this series offers an elegant, thoughtful addition to any display.', 1500.00, 98, '/uploads/1783440419101-392182194.WEBP', '2026-07-07 16:06:59', '2026-07-07 17:17:25', '[\"/uploads/1783440419101-392182194.WEBP\",\"/uploads/1783440419102-749617115.WEBP\",\"/uploads/1783440419106-634687719.WEBP\"]', 'common', NULL, 'Skullpanda', 'L’impressionnisme ', NULL),
(32, 'My Little Pony Series Plush Doll Pendant', 'Get ready for the crossover you didn’t know you needed! The SKULLPANDA x My Little Pony series brings together the iconic, trend-setting aesthetic of SKULLPANDA with the playful, colorful world of My Little Pony. These pendants aren\'t just toys; they’re a statement piece, blending whimsical character traits with SKULLPANDA’s signature high-end artistic design.\r\n\r\nWhether you\'re a long-time My Little Pony fan, a die-hard SKULLPANDA collector, or just looking for the perfect, unique accessory for your bag, this series offers something truly special.', 1500.00, 99, '/uploads/1783440494273-275686664.WEBP', '2026-07-07 16:08:14', '2026-07-07 17:17:25', '[\"/uploads/1783440494273-275686664.WEBP\",\"/uploads/1783440494274-489467867.WEBP\",\"/uploads/1783440494275-466759576.WEBP\"]', 'common', NULL, 'Skullpanda', 'My Little Pony ', NULL),
(33, 'The Feast Begins Series Figures', 'Pull up a chair—it’s time to dine! The \"The Feast Begins\" Series celebrates the joy of shared meals, indulgent treats, and the culinary arts. Each figure is a miniature masterpiece, creatively reimagining characters as part of a delectable, fun-filled, and mouth-watering banquet.\r\n\r\nWhether you are a food lover, a collector of whimsical art toys, or just someone who appreciates imaginative design, this series brings a flavor of excitement to any shelf. From gourmet accessories to adorable culinary outfits, every piece in this collection is a \"chef-d\'oeuvre\" in its own right.', 1500.00, 100, '/uploads/1783440613433-73988211.WEBP', '2026-07-07 16:09:42', '2026-07-07 16:10:13', '[\"/uploads/1783440613433-73988211.WEBP\",\"/uploads/1783440613437-621371148.WEBP\",\"/uploads/1783440613438-579312336.WEBP\"]', 'common', NULL, 'Skullpanda ', 'The Feast Begins ', NULL),
(34, 'The Paradox Series Figures', 'Delve into the unknown with The Paradox Series. This collection is a masterclass in conceptual art, challenging perceptions and blending contrasting elements into a single, breathtaking figure. Designed for the collector who appreciates the unconventional, the mysterious, and the thought-provoking, each piece in this series is a puzzle waiting to be unraveled.\r\n\r\nWhether you are attracted to its intricate symbolism, its bold artistic vision, or its hauntingly beautiful aesthetic, this series is designed to stand out. \"The Paradox\" isn\'t just a figure—it’s a conversation piece that brings depth, mystery, and a touch of the avant-garde to any collection.', 1500.00, 100, '/uploads/1783440695670-692191807.WEBP', '2026-07-07 16:11:35', '2026-07-07 16:11:35', '[\"/uploads/1783440695670-692191807.WEBP\",\"/uploads/1783440695671-898735018.WEBP\",\"/uploads/1783440695675-772328564.WEBP\"]', 'common', NULL, 'Skullpanda', 'The Paradox ', NULL),
(35, 'You Found Me! Series Plush Doll Pendant', 'Surprise! The \"You Found Me!\" Series is here to brighten your day. This adorable collection features lovable characters caught in the middle of a playful game of hide-and-seek. With their curious expressions and charmingly cozy designs, these plush pendants are all about the joy of being \"found.\"\r\n\r\nWhether you want to add a whimsical touch to your daily bag, brighten up your keychain, or gift a little bit of happiness to someone special, these plush pendants are the perfect, huggable companions.', 1500.00, 100, '/uploads/1783440768391-715034316.WEBP', '2026-07-07 16:12:48', '2026-07-07 16:12:48', '[\"/uploads/1783440768391-715034316.WEBP\",\"/uploads/1783440768393-575603233.WEBP\",\"/uploads/1783440768395-140813232.WEBP\"]', 'common', NULL, 'Skullpanda', 'You Found Me! ', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `customer_name` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `total_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `status` varchar(255) NOT NULL DEFAULT 'pending',
  `payment_status` varchar(255) NOT NULL DEFAULT 'pending',
  `shipping_address` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `courier_name` varchar(255) DEFAULT NULL,
  `tracking_number` varchar(255) DEFAULT NULL,
  `shipped_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `user_id`, `customer_name`, `email`, `total_amount`, `status`, `payment_status`, `shipping_address`, `notes`, `created_at`, `updated_at`, `courier_name`, `tracking_number`, `shipped_at`) VALUES
(1, 1, 'Admin', 'admin@example.com', 9.99, 'delivered', 'paid', 'Test Address', NULL, '2026-07-05 17:20:21', '2026-07-07 13:46:02', NULL, NULL, NULL),
(2, 5, 'user', 'user@gmail.com', 22.49, 'delivered', 'paid', 'none, taguig city, Manila, 1630, Philippines', 'Contact: 09613214991 | Payment: Credit Card', '2026-07-06 17:37:06', '2026-07-07 13:46:03', NULL, NULL, NULL),
(3, 3, 'kim', 'kim@gmail.com', 34.97, 'delivered', 'pending', 'none, taguig city, Manila, 1630, Philippines', 'Contact: 09613214991 | Payment: COD | Note: qweqwe', '2026-07-07 08:34:21', '2026-07-07 13:46:04', NULL, NULL, NULL),
(4, 3, 'kim', 'kim@gmail.com', 24.49, 'delivered', 'paid', 'none, taguig city, Manila, 1630, Philippines', 'Contact: 09613214991 | Payment: COD', '2026-07-07 08:36:11', '2026-07-07 09:34:56', NULL, NULL, NULL),
(8, 7, 'kim12', 'kim12@gmail.com', 4500.00, 'delivered', 'paid', 'none, taguig city, Manila, 1630, Philippines', 'Contact: 09613214991 | Payment: COD', '2026-07-07 17:17:25', '2026-07-07 17:17:48', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `item_id` int(11) NOT NULL,
  `item_name` varchar(255) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `item_id`, `item_name`, `quantity`, `price`, `created_at`, `updated_at`) VALUES
(17, 8, 32, 'My Little Pony Series Plush Doll Pendant', 1, 1500.00, '2026-07-07 17:17:25', '2026-07-07 17:17:25'),
(18, 8, 31, 'L’impressionnisme Series Plush Doll', 2, 1500.00, '2026-07-07 17:17:25', '2026-07-07 17:17:25');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(180) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `stock` int(11) NOT NULL DEFAULT 0,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `category_id` int(10) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `product_images`
--

CREATE TABLE `product_images` (
  `id` int(10) UNSIGNED NOT NULL,
  `filename` varchar(255) NOT NULL,
  `path` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `product_id` int(10) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `item_id` int(11) NOT NULL,
  `rating` int(11) NOT NULL DEFAULT 5,
  `comment` text DEFAULT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'pending',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(255) NOT NULL DEFAULT 'user',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `auth_token` text DEFAULT NULL,
  `username` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `created_at`, `updated_at`, `is_active`, `auth_token`, `username`) VALUES
(1, 'Admin', 'admin@example.com', '$2b$10$K.lcfPFJ9H2O1XFnb2.8OeMMmXgDxnlglfJPl1Orl/2GQaddG45wG', 'admin', '2026-07-03 09:17:59', '2026-07-07 17:01:43', 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MzQ0MzcwMywiZXhwIjoxNzg0MDQ4NTAzfQ.QxVYYRERhJSBL5sQsIazO7pJOgcruQnvy8ILzUERnDk', NULL),
(2, 'kim', 'kimryan@gmail.com', '$2b$10$4g7Bnc7k001SJxb8wJyBROOwikqVZb3wnmM/6l15I1BboqBt7Z5IG', 'admin', '2026-07-03 12:53:04', '2026-07-07 14:05:31', 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJraW1yeWFuQGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MzQzMzEzMSwiZXhwIjoxNzg0MDM3OTMxfQ.GKQ2Vcs3AWQvRvKEeKNGTRowCndlH2utAug8O89cYhM', NULL),
(3, 'kim', 'kim@gmail.com', '$2b$10$NR.n0N5Gf6orVZo8gpIkyuxlFl.QEjg7xJpIcyhUgJaOWKnhYH5Q.', 'user', '2026-07-04 14:31:57', '2026-07-07 08:33:08', 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiZW1haWwiOiJraW1AZ21haWwuY29tIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3ODM0MTMxODgsImV4cCI6MTc4NDAxNzk4OH0.wln70mR7y9HbO1zK6rrRFOJYGI5cTyeBEZRslak1i-M', NULL),
(4, 'test', 'test@gmail.com', '$2b$10$LHrWpMX3R9EZ.HKRAtbb2eZKQ7UAEzpYDrxBGnNVhj7Pv09tO45qG', 'user', '2026-07-04 15:25:29', '2026-07-04 15:25:40', 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwiZW1haWwiOiJ0ZXN0QGdtYWlsLmNvbSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzgzMTc4NzQwLCJleHAiOjE3ODM3ODM1NDB9.f-2QTPSQyX3gIu4aEAnVuXk-rB4kDYMEJe09Cj_GFaY', NULL),
(5, 'user', 'user@gmail.com', '$2b$10$kN.L6gPfVDZc7iFohRgZYudM7o6VeD3IHUqhOPueIn/mmmd.wG1Vu', 'user', '2026-07-04 15:27:59', '2026-07-06 17:53:06', 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwiZW1haWwiOiJ1c2VyQGdtYWlsLmNvbSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzgzMzYwMzg2LCJleHAiOjE3ODM5NjUxODZ9.xTwPN0XLGHWFVFIlhq1L1BcoeFCd9e6u65vQDb0Q8_o', NULL),
(6, 'user2', 'user2@gmail.com', '$2a$10$np2hBQjfiQjVUMc26yXOfeOIAUOlWshpfGFL2WaNvrNLkAB4JgZ66', 'user', '2026-07-07 12:59:24', '2026-07-07 13:43:47', 0, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiZW1haWwiOiJ1c2VyMkBnbWFpbC5jb20iLCJyb2xlIjoidXNlciIsImlhdCI6MTc4MzQyOTE3MywiZXhwIjoxNzg0MDMzOTczfQ.u-Y_o8vY2MwhBP5g53AOTnnPwodxCO9SSk2lV96X3TE', 'user2'),
(7, 'kim12', 'kim12@gmail.com', '$2a$10$OllODC4vnireTtwE26lZ1ekx1G2yBEhon27XgZz9lqKb.eVQqs8kS', 'user', '2026-07-07 17:08:11', '2026-07-07 17:08:24', 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NywiZW1haWwiOiJraW0xMkBnbWFpbC5jb20iLCJyb2xlIjoidXNlciIsImlhdCI6MTc4MzQ0NDEwNCwiZXhwIjoxNzg0MDQ4OTA0fQ.TWYrQIOgeT1ejcH0-jXYbfQ8YDp3InGRRjalsCwf75Q', 'kim12');

-- --------------------------------------------------------

--
-- Table structure for table `users_backup_20260706_010551`
--

CREATE TABLE `users_backup_20260706_010551` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(255) NOT NULL DEFAULT 'user',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `auth_token` text DEFAULT NULL,
  `username` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users_backup_20260706_010551`
--

INSERT INTO `users_backup_20260706_010551` (`id`, `name`, `email`, `password`, `role`, `created_at`, `updated_at`, `is_active`, `auth_token`, `username`) VALUES
(1, 'Admin', 'admin@example.com', '$2b$10$K.lcfPFJ9H2O1XFnb2.8OeMMmXgDxnlglfJPl1Orl/2GQaddG45wG', 'admin', '2026-07-03 09:17:59', '2026-07-03 09:17:59', 1, NULL, NULL),
(2, 'kim', 'kimryan@gmail.com', '$2b$10$4g7Bnc7k001SJxb8wJyBROOwikqVZb3wnmM/6l15I1BboqBt7Z5IG', 'admin', '2026-07-03 12:53:04', '2026-07-04 19:31:37', 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJraW1yeWFuQGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MzE5MzQ5NywiZXhwIjoxNzgzNzk4Mjk3fQ.PJDgzxArNSmU7IP0LR4YKvoGGxnw3BFzDO0_AKYEOb0', NULL),
(3, 'kim', 'kim@gmail.com', '$2b$10$NR.n0N5Gf6orVZo8gpIkyuxlFl.QEjg7xJpIcyhUgJaOWKnhYH5Q.', 'user', '2026-07-04 14:31:57', '2026-07-05 14:21:56', 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiZW1haWwiOiJraW1AZ21haWwuY29tIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3ODMyNjEzMTYsImV4cCI6MTc4Mzg2NjExNn0.qW9HWjsgSEeMAr6YSfHMjNcI0EEnigcA0OyBDg4Ileg', NULL),
(4, 'test', 'test@gmail.com', '$2b$10$LHrWpMX3R9EZ.HKRAtbb2eZKQ7UAEzpYDrxBGnNVhj7Pv09tO45qG', 'user', '2026-07-04 15:25:29', '2026-07-04 15:25:40', 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwiZW1haWwiOiJ0ZXN0QGdtYWlsLmNvbSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzgzMTc4NzQwLCJleHAiOjE3ODM3ODM1NDB9.f-2QTPSQyX3gIu4aEAnVuXk-rB4kDYMEJe09Cj_GFaY', NULL),
(5, 'user', 'user@gmail.com', '$2b$10$kN.L6gPfVDZc7iFohRgZYudM7o6VeD3IHUqhOPueIn/mmmd.wG1Vu', 'user', '2026-07-04 15:27:59', '2026-07-04 15:28:09', 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwiZW1haWwiOiJ1c2VyQGdtYWlsLmNvbSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzgzMTc4ODg5LCJleHAiOjE3ODM3ODM2ODl9.l4_hQQgxc5bm74HguEnOJob-oiRvDRccC5NFTFoBVkA', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `box_serials`
--
ALTER TABLE `box_serials`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `serial` (`serial`),
  ADD UNIQUE KEY `serial_2` (`serial`),
  ADD UNIQUE KEY `serial_3` (`serial`),
  ADD UNIQUE KEY `serial_4` (`serial`),
  ADD UNIQUE KEY `serial_5` (`serial`),
  ADD UNIQUE KEY `serial_6` (`serial`),
  ADD UNIQUE KEY `serial_7` (`serial`),
  ADD UNIQUE KEY `serial_8` (`serial`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD UNIQUE KEY `name_2` (`name`),
  ADD UNIQUE KEY `name_3` (`name`),
  ADD UNIQUE KEY `name_4` (`name`),
  ADD UNIQUE KEY `name_5` (`name`),
  ADD UNIQUE KEY `name_6` (`name`),
  ADD UNIQUE KEY `name_7` (`name`),
  ADD UNIQUE KEY `name_8` (`name`),
  ADD UNIQUE KEY `name_9` (`name`);

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `items`
--
ALTER TABLE `items`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `item_id` (`item_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `category_id` (`category_id`);

--
-- Indexes for table `product_images`
--
ALTER TABLE `product_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `email_2` (`email`),
  ADD UNIQUE KEY `email_3` (`email`),
  ADD UNIQUE KEY `email_4` (`email`),
  ADD UNIQUE KEY `email_5` (`email`),
  ADD UNIQUE KEY `email_6` (`email`),
  ADD UNIQUE KEY `email_7` (`email`),
  ADD UNIQUE KEY `email_8` (`email`),
  ADD UNIQUE KEY `email_9` (`email`),
  ADD UNIQUE KEY `email_10` (`email`),
  ADD UNIQUE KEY `email_11` (`email`),
  ADD UNIQUE KEY `email_12` (`email`),
  ADD UNIQUE KEY `email_13` (`email`),
  ADD UNIQUE KEY `email_14` (`email`),
  ADD UNIQUE KEY `username_unique` (`username`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `username_2` (`username`),
  ADD UNIQUE KEY `username_3` (`username`),
  ADD UNIQUE KEY `username_4` (`username`),
  ADD UNIQUE KEY `username_5` (`username`),
  ADD UNIQUE KEY `username_6` (`username`),
  ADD UNIQUE KEY `username_7` (`username`),
  ADD UNIQUE KEY `username_8` (`username`),
  ADD UNIQUE KEY `username_9` (`username`),
  ADD UNIQUE KEY `username_10` (`username`),
  ADD UNIQUE KEY `username_11` (`username`),
  ADD UNIQUE KEY `username_12` (`username`),
  ADD UNIQUE KEY `username_13` (`username`);

--
-- Indexes for table `users_backup_20260706_010551`
--
ALTER TABLE `users_backup_20260706_010551`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `email_2` (`email`),
  ADD UNIQUE KEY `email_3` (`email`),
  ADD UNIQUE KEY `email_4` (`email`),
  ADD UNIQUE KEY `email_5` (`email`),
  ADD UNIQUE KEY `email_6` (`email`),
  ADD UNIQUE KEY `email_7` (`email`),
  ADD UNIQUE KEY `email_8` (`email`),
  ADD UNIQUE KEY `email_9` (`email`),
  ADD UNIQUE KEY `email_10` (`email`),
  ADD UNIQUE KEY `email_11` (`email`),
  ADD UNIQUE KEY `email_12` (`email`),
  ADD UNIQUE KEY `email_13` (`email`),
  ADD UNIQUE KEY `email_14` (`email`),
  ADD UNIQUE KEY `email_15` (`email`),
  ADD UNIQUE KEY `email_16` (`email`),
  ADD UNIQUE KEY `email_17` (`email`),
  ADD UNIQUE KEY `email_18` (`email`),
  ADD UNIQUE KEY `email_19` (`email`),
  ADD UNIQUE KEY `email_20` (`email`),
  ADD UNIQUE KEY `email_21` (`email`),
  ADD UNIQUE KEY `email_22` (`email`),
  ADD UNIQUE KEY `email_23` (`email`),
  ADD UNIQUE KEY `email_24` (`email`),
  ADD UNIQUE KEY `email_25` (`email`),
  ADD UNIQUE KEY `email_26` (`email`),
  ADD UNIQUE KEY `email_27` (`email`),
  ADD UNIQUE KEY `email_28` (`email`),
  ADD UNIQUE KEY `email_29` (`email`),
  ADD UNIQUE KEY `email_30` (`email`),
  ADD UNIQUE KEY `email_31` (`email`),
  ADD UNIQUE KEY `email_32` (`email`),
  ADD UNIQUE KEY `email_33` (`email`),
  ADD UNIQUE KEY `email_34` (`email`),
  ADD UNIQUE KEY `email_35` (`email`),
  ADD UNIQUE KEY `email_36` (`email`),
  ADD UNIQUE KEY `email_37` (`email`),
  ADD UNIQUE KEY `email_38` (`email`),
  ADD UNIQUE KEY `email_39` (`email`),
  ADD UNIQUE KEY `email_40` (`email`),
  ADD UNIQUE KEY `email_41` (`email`),
  ADD UNIQUE KEY `email_42` (`email`),
  ADD UNIQUE KEY `email_43` (`email`),
  ADD UNIQUE KEY `email_44` (`email`),
  ADD UNIQUE KEY `email_45` (`email`),
  ADD UNIQUE KEY `email_46` (`email`),
  ADD UNIQUE KEY `email_47` (`email`),
  ADD UNIQUE KEY `email_48` (`email`),
  ADD UNIQUE KEY `email_49` (`email`),
  ADD UNIQUE KEY `email_50` (`email`),
  ADD UNIQUE KEY `email_51` (`email`),
  ADD UNIQUE KEY `email_52` (`email`),
  ADD UNIQUE KEY `email_53` (`email`),
  ADD UNIQUE KEY `email_54` (`email`),
  ADD UNIQUE KEY `email_55` (`email`),
  ADD UNIQUE KEY `email_56` (`email`),
  ADD UNIQUE KEY `email_57` (`email`),
  ADD UNIQUE KEY `email_58` (`email`),
  ADD UNIQUE KEY `email_59` (`email`),
  ADD UNIQUE KEY `email_60` (`email`),
  ADD UNIQUE KEY `email_61` (`email`),
  ADD UNIQUE KEY `email_62` (`email`),
  ADD UNIQUE KEY `email_63` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `box_serials`
--
ALTER TABLE `box_serials`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `customers`
--
ALTER TABLE `customers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `items`
--
ALTER TABLE `items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `product_images`
--
ALTER TABLE `product_images`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `users_backup_20260706_010551`
--
ALTER TABLE `users_backup_20260706_010551`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_15` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_16` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `product_images`
--
ALTER TABLE `product_images`
  ADD CONSTRAINT `product_images_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
