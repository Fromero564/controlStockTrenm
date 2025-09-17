-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 17-09-2025 a las 21:50:54
-- Versión del servidor: 10.4.28-MariaDB
-- Versión de PHP: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `trenm_db`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `bill_details`
--

CREATE TABLE `bill_details` (
  `id` int(11) UNSIGNED NOT NULL,
  `bill_supplier_id` int(11) NOT NULL,
  `type` varchar(255) DEFAULT NULL,
  `quantity` int(11) DEFAULT NULL,
  `heads` int(11) DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  `weight` int(11) NOT NULL,
  `identification_product` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `bill_details`
--

INSERT INTO `bill_details` (`id`, `bill_supplier_id`, `type`, `quantity`, `heads`, `createdAt`, `updatedAt`, `weight`, `identification_product`) VALUES
(2, 1, 'Hamburguesas', 10, 0, '2025-09-09 19:11:55', '2025-09-09 19:11:55', 120, 10),
(3, 2, 'Media Res Capon', 1, 1, '2025-09-10 18:37:20', '2025-09-10 18:37:20', 1241, 152),
(4, 3, 'Media Res Chancha', 10, 10, '2025-09-15 00:29:29', '2025-09-15 00:29:29', 12550, 14),
(5, 4, 'Media Res Chancha', 10, 10, '2025-09-15 00:30:53', '2025-09-15 00:30:53', 15250, 25262);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `bill_suppliers`
--

CREATE TABLE `bill_suppliers` (
  `id` int(11) NOT NULL,
  `supplier` varchar(255) NOT NULL,
  `total_weight` varchar(255) NOT NULL,
  `head_quantity` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `romaneo_number` int(255) NOT NULL,
  `income_state` varchar(255) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `check_state` tinyint(1) NOT NULL,
  `fresh_quantity` int(11) NOT NULL,
  `fresh_weight` int(11) NOT NULL,
  `production_process` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `bill_suppliers`
--

INSERT INTO `bill_suppliers` (`id`, `supplier`, `total_weight`, `head_quantity`, `quantity`, `romaneo_number`, `income_state`, `createdAt`, `updatedAt`, `check_state`, `fresh_quantity`, `fresh_weight`, `production_process`) VALUES
(1, 'EMPRESASOFT', '120', 0, 0, 1200, 'manual', '2025-09-09 19:11:39', '2025-09-09 19:12:19', 0, 10, 116, 0),
(2, 'EMPRESASOFT', '1241', 1, 124, 10, 'manual', '2025-09-10 18:37:19', '2025-09-12 00:22:00', 0, 0, 0, 1),
(3, 'EMPRESASOFT', '12550', 10, 10, 10, 'romaneo', '2025-09-15 00:29:29', '2025-09-15 00:29:29', 1, 0, 0, 0),
(4, 'EMPRESASOFT', '15250', 10, 10, 1014, 'romaneo', '2025-09-15 00:30:53', '2025-09-15 00:30:53', 1, 0, 0, 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `clients`
--

CREATE TABLE `clients` (
  `id` int(11) NOT NULL,
  `client_name` varchar(255) NOT NULL,
  `client_type_id` varchar(255) NOT NULL,
  `client_id_number` int(11) NOT NULL,
  `client_iva_condition` varchar(255) NOT NULL,
  `client_email` varchar(255) NOT NULL,
  `client_phone` varchar(20) NOT NULL,
  `client_adress` varchar(255) NOT NULL,
  `client_country` varchar(255) NOT NULL,
  `client_province` varchar(255) NOT NULL,
  `client_location` varchar(255) NOT NULL,
  `client_state` tinyint(1) NOT NULL,
  `client_seller` int(11) DEFAULT NULL,
  `client_sale_condition` varchar(255) NOT NULL,
  `client_payment_condition` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `clients`
--

INSERT INTO `clients` (`id`, `client_name`, `client_type_id`, `client_id_number`, `client_iva_condition`, `client_email`, `client_phone`, `client_adress`, `client_country`, `client_province`, `client_location`, `client_state`, `client_seller`, `client_sale_condition`, `client_payment_condition`) VALUES
(1, 'FERNANDO', 'CUIT', 20200199, 'IVA RESPONSABLE INSCRIPTO', 'fer@fer', '3562', 'CALLE 123', 'ARGENTINA', 'BUENOS AIRES', 'SAN NICOLAS', 1, 1, '7 DIAS HABILES', 'EFECTIVO');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cuts_detail`
--

CREATE TABLE `cuts_detail` (
  `id` int(11) NOT NULL,
  `receipt_number` int(11) NOT NULL,
  `header_id` int(11) NOT NULL,
  `sub_item` int(11) NOT NULL,
  `packaging_type` varchar(100) DEFAULT NULL,
  `units_count` int(11) NOT NULL DEFAULT 1,
  `lot_number` varchar(50) DEFAULT NULL,
  `tare_weight` decimal(10,2) DEFAULT 0.00,
  `gross_weight` decimal(10,2) DEFAULT 0.00,
  `net_weight` decimal(10,2) DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `cuts_detail`
--

INSERT INTO `cuts_detail` (`id`, `receipt_number`, `header_id`, `sub_item`, `packaging_type`, `units_count`, `lot_number`, `tare_weight`, `gross_weight`, `net_weight`, `created_at`, `updated_at`) VALUES
(2, 2, 2, 1, 'Bolsa', 26, '10', 4.00, 1203.00, 1199.00, '2025-09-13 18:45:32', '2025-09-13 18:45:32'),
(3, 4, 3, 1, 'Bolsa', 4, '130', 4.00, 1520.00, 1516.00, '2025-09-15 00:56:16', '2025-09-15 00:56:16'),
(4, 4, 4, 1, 'bolsa', 3, '125', 6.00, 1252.00, 1246.00, '2025-09-15 00:56:16', '2025-09-15 00:56:16'),
(5, 5, 5, 1, '', 1, '100', 4.00, 11200.00, 11196.00, '2025-09-17 12:30:42', '2025-09-17 12:30:42'),
(6, 6, 6, 1, 'bolsa', 2, '134', 4.00, 1250.00, 1246.00, '2025-09-17 12:45:27', '2025-09-17 12:45:27');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cuts_header`
--

CREATE TABLE `cuts_header` (
  `id` int(11) NOT NULL,
  `receipt_number` int(11) NOT NULL,
  `product_code` varchar(50) NOT NULL,
  `product_name` varchar(100) NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `qty_requested` int(11) NOT NULL,
  `qty_weighed` int(11) DEFAULT 0,
  `total_tare_weight` decimal(10,2) DEFAULT 0.00,
  `total_gross_weight` decimal(10,2) DEFAULT 0.00,
  `total_net_weight` decimal(10,2) DEFAULT 0.00,
  `avg_weight` decimal(10,2) DEFAULT 0.00,
  `qty_pending` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `cuts_header`
--

INSERT INTO `cuts_header` (`id`, `receipt_number`, `product_code`, `product_name`, `unit_price`, `qty_requested`, `qty_weighed`, `total_tare_weight`, `total_gross_weight`, `total_net_weight`, `avg_weight`, `qty_pending`, `created_at`, `updated_at`) VALUES
(2, 2, '105', 'Matambre', 1480.70, 26, 26, 4.00, 1203.00, 1199.00, 46.12, 0, '2025-09-13 18:45:32', '2025-09-13 18:45:32'),
(3, 4, '105', 'Matambre', 1480.70, 4, 4, 4.00, 1520.00, 1516.00, 379.00, 0, '2025-09-15 00:56:16', '2025-09-15 00:56:16'),
(4, 4, '1', 'Media Res Chancha', 1359.15, 3, 3, 6.00, 1252.00, 1246.00, 415.33, 0, '2025-09-15 00:56:16', '2025-09-15 00:56:16'),
(5, 5, '105', 'Matambre', 1480.70, 1, 1, 4.00, 11200.00, 11196.00, 11196.00, 0, '2025-09-17 12:30:42', '2025-09-17 12:30:42'),
(6, 6, '105', 'Matambre', 1480.70, 2, 2, 4.00, 1250.00, 1246.00, 623.00, 0, '2025-09-17 12:45:27', '2025-09-17 12:45:27');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `destinations`
--

CREATE TABLE `destinations` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(120) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `destinations`
--

INSERT INTO `destinations` (`id`, `name`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'BUENOS AIRES', 1, '2025-09-15 02:02:22', '2025-09-15 02:02:22'),
(2, 'CÓRDOBA', 1, '2025-09-15 02:02:22', '2025-09-15 02:02:22'),
(3, 'MENDOZA', 1, '2025-09-15 02:02:22', '2025-09-15 02:02:22');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `drivers`
--

CREATE TABLE `drivers` (
  `id` int(11) NOT NULL,
  `driver_name` varchar(255) NOT NULL,
  `driver_surname` varchar(255) NOT NULL,
  `driver_state` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `drivers`
--

INSERT INTO `drivers` (`id`, `driver_name`, `driver_surname`, `driver_state`) VALUES
(1, 'Juan', 'Romero', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `final_remits`
--

CREATE TABLE `final_remits` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `receipt_number` int(11) NOT NULL,
  `client_name` varchar(150) NOT NULL,
  `salesman_name` varchar(150) DEFAULT NULL,
  `price_list` varchar(100) DEFAULT NULL,
  `sell_condition` varchar(100) DEFAULT NULL,
  `payment_condition` varchar(100) DEFAULT NULL,
  `generated_by` enum('system','afip') NOT NULL,
  `note` text DEFAULT NULL,
  `total_items` int(11) DEFAULT 0,
  `total_amount` decimal(10,2) DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `final_remits`
--

INSERT INTO `final_remits` (`id`, `order_id`, `receipt_number`, `client_name`, `salesman_name`, `price_list`, `sell_condition`, `payment_condition`, `generated_by`, `note`, `total_items`, `total_amount`, `created_at`, `updated_at`) VALUES
(1, 2, 2, 'FERNANDO', 'German', 'Premiun', '7 DIAS HABILES', 'EFECTIVO', 'system', '', 26, 38498.20, '2025-09-13 22:04:46', '2025-09-13 22:04:46'),
(2, 4, 4, 'FERNANDO', 'German', 'Premiun', '7 DIAS HABILES', 'EFECTIVO', 'system', '', 7, 10000.25, '2025-09-17 14:23:15', '2025-09-17 14:23:15');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `final_remit_products`
--

CREATE TABLE `final_remit_products` (
  `id` int(11) NOT NULL,
  `final_remit_id` int(11) NOT NULL,
  `product_id` varchar(50) DEFAULT NULL,
  `product_name` varchar(200) NOT NULL,
  `unit_price` decimal(10,2) DEFAULT 0.00,
  `qty` decimal(10,2) DEFAULT 0.00,
  `unit_measure` varchar(10) DEFAULT NULL,
  `gross_weight` decimal(10,2) DEFAULT 0.00,
  `net_weight` decimal(10,2) DEFAULT 0.00,
  `avg_weight` decimal(10,2) DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `final_remit_products`
--

INSERT INTO `final_remit_products` (`id`, `final_remit_id`, `product_id`, `product_name`, `unit_price`, `qty`, `unit_measure`, `gross_weight`, `net_weight`, `avg_weight`, `created_at`, `updated_at`) VALUES
(1, 1, '105', 'Matambre', 1480.70, 26.00, NULL, 0.00, 0.00, 0.00, '2025-09-13 22:04:46', '2025-09-13 22:04:46'),
(2, 2, '105', 'Matambre', 1480.70, 1516.00, 'KG', 1520.00, 1516.00, 379.00, '2025-09-17 14:23:15', '2025-09-17 14:23:15'),
(3, 2, '1', 'Media Res Chancha', 1359.15, 3.00, 'UN', 1252.00, 1246.00, 415.33, '2025-09-17 14:23:15', '2025-09-17 14:23:15');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `meat_income_manual_weight`
--

CREATE TABLE `meat_income_manual_weight` (
  `id` int(11) NOT NULL,
  `bill_supplier_id` int(11) NOT NULL,
  `total_weight` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `meat_income_manual_weight`
--

INSERT INTO `meat_income_manual_weight` (`id`, `bill_supplier_id`, `total_weight`, `created_at`, `updated_at`) VALUES
(1, 1, 116.00, '2025-09-09 19:12:19', '2025-09-09 19:12:19'),
(2, 2, 147.00, '2025-09-10 18:37:49', '2025-09-10 18:37:49');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `meat_manual_income`
--

CREATE TABLE `meat_manual_income` (
  `id` int(11) NOT NULL,
  `id_bill_suppliers` int(11) NOT NULL,
  `products_name` varchar(255) NOT NULL,
  `products_garron` int(11) NOT NULL,
  `products_quantity` varchar(255) NOT NULL,
  `product_head` int(11) NOT NULL,
  `provider_weight` float NOT NULL,
  `gross_weight` float NOT NULL,
  `tare` float NOT NULL,
  `net_weight` float NOT NULL,
  `decrease` decimal(8,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `meat_manual_income`
--

INSERT INTO `meat_manual_income` (`id`, `id_bill_suppliers`, `products_name`, `products_garron`, `products_quantity`, `product_head`, `provider_weight`, `gross_weight`, `tare`, `net_weight`, `decrease`) VALUES
(1, 2, 'Media Res Capon', 1, '124', 1, 1252, 151, 4, 147, -88.26);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `new_orders`
--

CREATE TABLE `new_orders` (
  `id` int(11) NOT NULL,
  `date_order` date NOT NULL,
  `client_name` varchar(255) NOT NULL,
  `salesman_name` varchar(255) NOT NULL,
  `price_list` varchar(255) DEFAULT NULL,
  `sell_condition` varchar(255) NOT NULL,
  `payment_condition` varchar(255) NOT NULL,
  `observation_order` varchar(255) DEFAULT NULL,
  `order_check` tinyint(1) NOT NULL DEFAULT 0,
  `order_weight_check` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `new_orders`
--

INSERT INTO `new_orders` (`id`, `date_order`, `client_name`, `salesman_name`, `price_list`, `sell_condition`, `payment_condition`, `observation_order`, `order_check`, `order_weight_check`, `created_at`, `updated_at`) VALUES
(1, '2025-09-04', 'FERNANDO', 'German', 'Premiun', '7 DIAS HABILES', 'EFECTIVO', '', 0, 0, '2025-09-04 00:06:30', '2025-09-04 00:06:30'),
(2, '2025-09-04', 'FERNANDO', 'German', 'Premiun', '7 DIAS HABILES', 'EFECTIVO', '', 1, 1, '2025-09-04 00:11:17', '2025-09-13 18:45:35'),
(3, '2025-09-04', 'FERNANDO', 'German', 'Premiun', '7 DIAS HABILES', 'EFECTIVO', '', 0, 0, '2025-09-04 00:14:18', '2025-09-04 00:14:18'),
(4, '2025-09-16', 'FERNANDO', 'German', 'Premiun', '7 DIAS HABILES', 'EFECTIVO', '', 1, 1, '2025-09-15 00:28:33', '2025-09-15 00:56:20'),
(5, '2025-09-17', 'FERNANDO', 'Francisco', 'Premiun', '7 DIAS HABILES', 'EFECTIVO', '', 1, 1, '2025-09-17 12:27:14', '2025-09-17 12:30:48'),
(6, '2025-09-17', 'FERNANDO', 'German', 'Premiun', '7 DIAS HABILES', 'EFECTIVO', '', 1, 1, '2025-09-17 12:37:26', '2025-09-17 12:45:30');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `observations_meatincome`
--

CREATE TABLE `observations_meatincome` (
  `id` int(11) NOT NULL,
  `observation` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `observations_meatincome`
--

INSERT INTO `observations_meatincome` (`id`, `observation`) VALUES
(1, ''),
(2, '');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `order_products_client`
--

CREATE TABLE `order_products_client` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `product_cod` varchar(50) NOT NULL,
  `product_name` varchar(100) NOT NULL,
  `precio` decimal(10,2) NOT NULL,
  `cantidad` decimal(10,2) NOT NULL,
  `tipo_medida` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `order_products_client`
--

INSERT INTO `order_products_client` (`id`, `order_id`, `product_cod`, `product_name`, `precio`, `cantidad`, `tipo_medida`) VALUES
(1, 4, '105', 'Matambre', 1480.70, 10.00, 'KG'),
(2, 4, '1', 'Media Res Chancha', 1359.15, 3.00, 'UN'),
(3, 5, '105', 'Matambre', 1480.70, 1.00, 'KG'),
(4, 6, '105', 'Matambre', 1480.70, 2.00, 'KG');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `other_product_manual`
--

CREATE TABLE `other_product_manual` (
  `id` int(11) NOT NULL,
  `product_portion` int(11) NOT NULL,
  `product_name` varchar(100) NOT NULL,
  `product_quantity` decimal(10,2) NOT NULL DEFAULT 0.00,
  `product_gross_weight` float NOT NULL,
  `product_net_weight` float NOT NULL,
  `decrease` float NOT NULL,
  `id_bill_suppliers` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `other_product_manual`
--

INSERT INTO `other_product_manual` (`id`, `product_portion`, `product_name`, `product_quantity`, `product_gross_weight`, `product_net_weight`, `decrease`, `id_bill_suppliers`, `created_at`, `updated_at`) VALUES
(1, 10, 'Hamburguesas', 10.00, 120, 116, -16, 1, '2025-09-09 19:12:19', '2025-09-09 19:12:19');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `payment_conditions`
--

CREATE TABLE `payment_conditions` (
  `id` int(11) NOT NULL,
  `payment_condition` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `payment_conditions`
--

INSERT INTO `payment_conditions` (`id`, `payment_condition`) VALUES
(1, 'EFECTIVO');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `price_lists`
--

CREATE TABLE `price_lists` (
  `id` int(11) NOT NULL,
  `list_number` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `client_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `price_lists`
--

INSERT INTO `price_lists` (`id`, `list_number`, `name`, `client_id`) VALUES
(1, 1, 'Premiun', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `price_list_products`
--

CREATE TABLE `price_list_products` (
  `id` int(11) NOT NULL,
  `price_list_number` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `product_name` varchar(100) NOT NULL,
  `unidad_venta` varchar(20) NOT NULL,
  `costo` decimal(12,2) DEFAULT 0.00,
  `precio_sin_iva` decimal(12,2) DEFAULT 0.00,
  `precio_con_iva` decimal(12,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `price_list_products`
--

INSERT INTO `price_list_products` (`id`, `price_list_number`, `product_id`, `product_name`, `unidad_venta`, `costo`, `precio_sin_iva`, `precio_con_iva`) VALUES
(1, 1, 1, 'Media Res Chancha', 'UN', 100.00, 1230.00, 1359.15),
(2, 1, 105, 'Matambre', 'KG', 330.00, 1340.00, 1480.70),
(3, 1, 108, 'Chinchulin', 'KG', 50.00, 100.00, 110.50);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `process_meats`
--

CREATE TABLE `process_meats` (
  `id` int(11) NOT NULL,
  `type` varchar(255) NOT NULL,
  `average` float NOT NULL,
  `quantity` int(11) NOT NULL,
  `gross_weight` float NOT NULL,
  `tares` float NOT NULL,
  `net_weight` float NOT NULL,
  `process_number` int(11) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `process_meats`
--

INSERT INTO `process_meats` (`id`, `type`, `average`, `quantity`, `gross_weight`, `tares`, `net_weight`, `process_number`, `createdAt`, `updatedAt`) VALUES
(1, 'Chinchulin', 1, 20, 24, 4, 20, 1, '2025-09-12 00:22:00', '2025-09-12 00:22:00'),
(2, 'Matambre', 3100.25, 4, 12405, 4, 12401, 2, '2025-09-15 00:30:10', '2025-09-15 00:30:10');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `process_number`
--

CREATE TABLE `process_number` (
  `id` int(11) NOT NULL,
  `process_number` int(11) NOT NULL,
  `bill_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `process_number`
--

INSERT INTO `process_number` (`id`, `process_number`, `bill_id`) VALUES
(1, 1, 2),
(2, 2, 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `products_available`
--

CREATE TABLE `products_available` (
  `id` int(11) NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `product_general_category` varchar(255) DEFAULT NULL,
  `category_id` int(11) DEFAULT NULL,
  `min_stock` int(11) DEFAULT NULL,
  `max_stock` int(11) DEFAULT NULL,
  `alicuota` decimal(5,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `products_available`
--

INSERT INTO `products_available` (`id`, `product_name`, `product_general_category`, `category_id`, `min_stock`, `max_stock`, `alicuota`) VALUES
(1, 'Media Res Chancha', 'externo', 1, 1, 100, 21.00),
(105, 'Matambre', 'propio', NULL, 1, 1999, 10.50),
(106, 'Media Res Capon', 'externo', 1, 1, 100, 10.50),
(107, 'Capon', 'externo', 1, 1, 100, 10.50),
(108, 'Chinchulin', 'propio', NULL, 1, 100000, 10.50),
(109, 'Patitas congeladas', 'ambos', 2, 1, 10000, 10.50),
(110, 'Hamburguesas', 'externo', NULL, 1, 98, 10.50);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `products_sell_order`
--

CREATE TABLE `products_sell_order` (
  `id` int(11) NOT NULL,
  `sell_order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `product_price` float NOT NULL,
  `product_quantity` int(11) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `products_sell_order`
--

INSERT INTO `products_sell_order` (`id`, `sell_order_id`, `product_id`, `product_name`, `product_price`, `product_quantity`, `created_at`, `updated_at`) VALUES
(1, 2, 105, 'Matambre', 1480.7, 26, '2025-09-04 00:22:51', '2025-09-04 00:22:51'),
(2, 4, 105, 'Matambre', 1480.7, 4, '2025-09-15 00:31:06', '2025-09-15 00:31:06'),
(3, 4, 1, 'Media Res Chancha', 1359.15, 3, '2025-09-15 00:31:06', '2025-09-15 00:31:06'),
(4, 5, 105, 'Matambre', 1480.7, 1, '2025-09-17 12:28:17', '2025-09-17 12:28:17'),
(5, 6, 105, 'Matambre', 1480.7, 2, '2025-09-17 12:37:42', '2025-09-17 12:37:42');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `product_categories`
--

CREATE TABLE `product_categories` (
  `id` int(11) NOT NULL,
  `category_name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `product_categories`
--

INSERT INTO `product_categories` (`id`, `category_name`) VALUES
(1, 'PRINCIPAL'),
(2, 'SECUNDARIA');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `product_stock`
--

CREATE TABLE `product_stock` (
  `id` int(11) NOT NULL,
  `product_name` varchar(160) NOT NULL,
  `product_quantity` int(11) NOT NULL,
  `product_cod` int(11) NOT NULL,
  `product_category` varchar(255) DEFAULT NULL,
  `product_total_weight` float DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `product_stock`
--

INSERT INTO `product_stock` (`id`, `product_name`, `product_quantity`, `product_cod`, `product_category`, `product_total_weight`) VALUES
(1, 'Hamburguesas', 10, 110, NULL, 116),
(2, 'Media Res Capon', 123, 106, 'PRINCIPAL', 137),
(3, 'Chinchulin', 20, 108, NULL, 20),
(4, 'Media Res Chancha', 16, 1, 'PRINCIPAL', 21599.5),
(5, 'Matambre', 4, 105, NULL, 12401);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `product_subproducts`
--

CREATE TABLE `product_subproducts` (
  `id` int(11) NOT NULL,
  `parent_product_id` int(11) NOT NULL,
  `subproduct_id` int(11) NOT NULL,
  `quantity` decimal(10,2) NOT NULL CHECK (`quantity` >= 0),
  `unit` varchar(200) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `product_subproducts`
--

INSERT INTO `product_subproducts` (`id`, `parent_product_id`, `subproduct_id`, `quantity`, `unit`) VALUES
(2, 107, 105, 1.00, 'unidad'),
(3, 107, 108, 20.00, 'kg'),
(4, 1, 105, 1.00, 'unidad'),
(5, 106, 108, 20.00, 'kg');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `providers`
--

CREATE TABLE `providers` (
  `id` int(11) NOT NULL,
  `provider_name` varchar(255) NOT NULL,
  `provider_type_id` varchar(255) NOT NULL,
  `provider_id_number` varchar(20) NOT NULL,
  `provider_iva_condition` varchar(255) NOT NULL,
  `provider_email` varchar(255) NOT NULL,
  `provider_phone` varchar(20) NOT NULL,
  `provider_adress` varchar(255) NOT NULL,
  `provider_country` varchar(255) NOT NULL,
  `provider_province` varchar(255) NOT NULL,
  `provider_location` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `providers`
--

INSERT INTO `providers` (`id`, `provider_name`, `provider_type_id`, `provider_id_number`, `provider_iva_condition`, `provider_email`, `provider_phone`, `provider_adress`, `provider_country`, `provider_province`, `provider_location`) VALUES
(1, 'EMPRESASOFT', 'CUIT', '202000', 'IVA RESPONSABLE INSCRIPTO', 'empresasoft@empresasoft', '24525', 'CALLE 123', 'ARGENTINA', 'BUENOS AIRES', 'SAN NICOLAS');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `roadmap_info`
--

CREATE TABLE `roadmap_info` (
  `id` int(11) NOT NULL,
  `client_name` varchar(255) NOT NULL,
  `delivery_date` date NOT NULL,
  `truck_license_plate` varchar(20) NOT NULL,
  `driver` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `roadmap_info_destinations`
--

CREATE TABLE `roadmap_info_destinations` (
  `id` int(11) NOT NULL,
  `roadmap_info_id` int(11) NOT NULL,
  `destination` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sale_conditions`
--

CREATE TABLE `sale_conditions` (
  `id` int(11) NOT NULL,
  `condition_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `sale_conditions`
--

INSERT INTO `sale_conditions` (`id`, `condition_name`) VALUES
(1, '7 DIAS HABILES');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sellers`
--

CREATE TABLE `sellers` (
  `id` int(11) NOT NULL,
  `code` varchar(32) NOT NULL,
  `name` varchar(128) NOT NULL,
  `province` varchar(64) DEFAULT NULL,
  `city` varchar(64) DEFAULT NULL,
  `street` varchar(80) DEFAULT NULL,
  `number` varchar(16) DEFAULT NULL,
  `floor` varchar(16) DEFAULT NULL,
  `office` varchar(32) DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `sellers`
--

INSERT INTO `sellers` (`id`, `code`, `name`, `province`, `city`, `street`, `number`, `floor`, `office`, `status`, `created_at`, `updated_at`) VALUES
(1, '1', 'Francisco', 'Buenos Aires', 'San Nicolas', 'Calle Siempre Viva', '123', '', '', 1, '2025-09-03 23:51:45', '2025-09-03 23:51:45'),
(2, '2', 'German', 'Buenos Aires', 'San Nicolas', '', '', '', '', 0, '2025-09-03 23:52:20', '2025-09-03 23:52:20');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tares`
--

CREATE TABLE `tares` (
  `id` int(11) NOT NULL,
  `tare_name` varchar(255) NOT NULL,
  `tare_weight` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tares`
--

INSERT INTO `tares` (`id`, `tare_name`, `tare_weight`) VALUES
(1, 'Tara 1', 4),
(2, 'Tara 2', 6);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `trucks`
--

CREATE TABLE `trucks` (
  `id` int(10) UNSIGNED NOT NULL,
  `brand` varchar(80) NOT NULL,
  `model` varchar(120) NOT NULL,
  `plate` varchar(15) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `trucks`
--

INSERT INTO `trucks` (`id`, `brand`, `model`, `plate`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'IVECO', 'AT800 T26B', 'AA123ZZ', 1, '2025-09-15 04:32:57', '2025-09-15 04:32:57'),
(2, 'SCANIA', 'R 420', 'AC321AB', 1, '2025-09-15 04:32:57', '2025-09-15 04:32:57');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `user` varchar(255) NOT NULL,
  `rol` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `create_date` timestamp(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`id`, `user`, `rol`, `password`, `create_date`, `updated_at`) VALUES
(4, 'Admin', 'administrativo', '$2b$10$gu02NCQf/uH4H.GBMh7awuBTHhetWHoX0F6WR9MGSI0PybQJhtKv.', '2025-02-24 18:20:55.000000', '2025-02-24 18:20:55');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `warehouses`
--

CREATE TABLE `warehouses` (
  `id` int(11) NOT NULL,
  `warehouse_name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `warehouse_stock`
--

CREATE TABLE `warehouse_stock` (
  `id` int(11) NOT NULL,
  `id_warehouse` int(11) NOT NULL,
  `product_name` varchar(100) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `bill_details`
--
ALTER TABLE `bill_details`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_bill_details_bill_supplier_id` (`bill_supplier_id`);

--
-- Indices de la tabla `bill_suppliers`
--
ALTER TABLE `bill_suppliers`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `clients`
--
ALTER TABLE `clients`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `cuts_detail`
--
ALTER TABLE `cuts_detail`
  ADD PRIMARY KEY (`id`),
  ADD KEY `header_id` (`header_id`);

--
-- Indices de la tabla `cuts_header`
--
ALTER TABLE `cuts_header`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `destinations`
--
ALTER TABLE `destinations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_destinations_name` (`name`);

--
-- Indices de la tabla `drivers`
--
ALTER TABLE `drivers`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `final_remits`
--
ALTER TABLE `final_remits`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_final_remits_order` (`order_id`),
  ADD UNIQUE KEY `uniq_final_remits_order` (`order_id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `receipt_number` (`receipt_number`);

--
-- Indices de la tabla `final_remit_products`
--
ALTER TABLE `final_remit_products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `final_remit_id` (`final_remit_id`);

--
-- Indices de la tabla `meat_income_manual_weight`
--
ALTER TABLE `meat_income_manual_weight`
  ADD PRIMARY KEY (`id`),
  ADD KEY `bill_supplier_id` (`bill_supplier_id`);

--
-- Indices de la tabla `meat_manual_income`
--
ALTER TABLE `meat_manual_income`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_received_suppliers` (`id_bill_suppliers`);

--
-- Indices de la tabla `new_orders`
--
ALTER TABLE `new_orders`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `observations_meatincome`
--
ALTER TABLE `observations_meatincome`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `order_products_client`
--
ALTER TABLE `order_products_client`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_order` (`order_id`);

--
-- Indices de la tabla `other_product_manual`
--
ALTER TABLE `other_product_manual`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_bill_suppliers` (`id_bill_suppliers`);

--
-- Indices de la tabla `payment_conditions`
--
ALTER TABLE `payment_conditions`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `price_lists`
--
ALTER TABLE `price_lists`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `price_list_products`
--
ALTER TABLE `price_list_products`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `process_meats`
--
ALTER TABLE `process_meats`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `process_number`
--
ALTER TABLE `process_number`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `products_available`
--
ALTER TABLE `products_available`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_products_available_category` (`category_id`);

--
-- Indices de la tabla `products_sell_order`
--
ALTER TABLE `products_sell_order`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `product_categories`
--
ALTER TABLE `product_categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `category_name` (`category_name`);

--
-- Indices de la tabla `product_stock`
--
ALTER TABLE `product_stock`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_product_cod` (`product_cod`);

--
-- Indices de la tabla `product_subproducts`
--
ALTER TABLE `product_subproducts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `parent_product_id` (`parent_product_id`),
  ADD KEY `subproduct_id` (`subproduct_id`);

--
-- Indices de la tabla `providers`
--
ALTER TABLE `providers`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `roadmap_info`
--
ALTER TABLE `roadmap_info`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `roadmap_info_destinations`
--
ALTER TABLE `roadmap_info_destinations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `roadmap_info_id` (`roadmap_info_id`);

--
-- Indices de la tabla `sale_conditions`
--
ALTER TABLE `sale_conditions`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `sellers`
--
ALTER TABLE `sellers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Indices de la tabla `tares`
--
ALTER TABLE `tares`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `trucks`
--
ALTER TABLE `trucks`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_trucks_plate` (`plate`);

--
-- Indices de la tabla `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `warehouses`
--
ALTER TABLE `warehouses`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `warehouse_stock`
--
ALTER TABLE `warehouse_stock`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id_warehouse` (`id_warehouse`,`product_name`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `bill_details`
--
ALTER TABLE `bill_details`
  MODIFY `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `bill_suppliers`
--
ALTER TABLE `bill_suppliers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `clients`
--
ALTER TABLE `clients`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `cuts_detail`
--
ALTER TABLE `cuts_detail`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `cuts_header`
--
ALTER TABLE `cuts_header`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `destinations`
--
ALTER TABLE `destinations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `drivers`
--
ALTER TABLE `drivers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `final_remits`
--
ALTER TABLE `final_remits`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `final_remit_products`
--
ALTER TABLE `final_remit_products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `meat_income_manual_weight`
--
ALTER TABLE `meat_income_manual_weight`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `meat_manual_income`
--
ALTER TABLE `meat_manual_income`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `new_orders`
--
ALTER TABLE `new_orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `order_products_client`
--
ALTER TABLE `order_products_client`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `other_product_manual`
--
ALTER TABLE `other_product_manual`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `payment_conditions`
--
ALTER TABLE `payment_conditions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `price_lists`
--
ALTER TABLE `price_lists`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `price_list_products`
--
ALTER TABLE `price_list_products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `process_meats`
--
ALTER TABLE `process_meats`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `process_number`
--
ALTER TABLE `process_number`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `products_sell_order`
--
ALTER TABLE `products_sell_order`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `product_categories`
--
ALTER TABLE `product_categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `product_stock`
--
ALTER TABLE `product_stock`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `product_subproducts`
--
ALTER TABLE `product_subproducts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `providers`
--
ALTER TABLE `providers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `roadmap_info`
--
ALTER TABLE `roadmap_info`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `roadmap_info_destinations`
--
ALTER TABLE `roadmap_info_destinations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `sale_conditions`
--
ALTER TABLE `sale_conditions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `sellers`
--
ALTER TABLE `sellers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `tares`
--
ALTER TABLE `tares`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `trucks`
--
ALTER TABLE `trucks`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `warehouses`
--
ALTER TABLE `warehouses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `warehouse_stock`
--
ALTER TABLE `warehouse_stock`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `bill_details`
--
ALTER TABLE `bill_details`
  ADD CONSTRAINT `fk_bill_details_bill_supplier_id` FOREIGN KEY (`bill_supplier_id`) REFERENCES `bill_suppliers` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `cuts_detail`
--
ALTER TABLE `cuts_detail`
  ADD CONSTRAINT `cuts_detail_ibfk_1` FOREIGN KEY (`header_id`) REFERENCES `cuts_header` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `meat_income_manual_weight`
--
ALTER TABLE `meat_income_manual_weight`
  ADD CONSTRAINT `meat_income_manual_weight_ibfk_1` FOREIGN KEY (`bill_supplier_id`) REFERENCES `bill_suppliers` (`id`);

--
-- Filtros para la tabla `meat_manual_income`
--
ALTER TABLE `meat_manual_income`
  ADD CONSTRAINT `fk_meat_income_received_suppliers` FOREIGN KEY (`id_bill_suppliers`) REFERENCES `bill_suppliers` (`id`);

--
-- Filtros para la tabla `order_products_client`
--
ALTER TABLE `order_products_client`
  ADD CONSTRAINT `fk_order` FOREIGN KEY (`order_id`) REFERENCES `new_orders` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `other_product_manual`
--
ALTER TABLE `other_product_manual`
  ADD CONSTRAINT `fk_bill_suppliers` FOREIGN KEY (`id_bill_suppliers`) REFERENCES `bill_suppliers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `products_available`
--
ALTER TABLE `products_available`
  ADD CONSTRAINT `fk_products_available_category` FOREIGN KEY (`category_id`) REFERENCES `product_categories` (`id`);

--
-- Filtros para la tabla `product_stock`
--
ALTER TABLE `product_stock`
  ADD CONSTRAINT `fk_product_cod` FOREIGN KEY (`product_cod`) REFERENCES `products_available` (`id`);

--
-- Filtros para la tabla `product_subproducts`
--
ALTER TABLE `product_subproducts`
  ADD CONSTRAINT `product_subproducts_ibfk_1` FOREIGN KEY (`parent_product_id`) REFERENCES `products_available` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `product_subproducts_ibfk_2` FOREIGN KEY (`subproduct_id`) REFERENCES `products_available` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `roadmap_info_destinations`
--
ALTER TABLE `roadmap_info_destinations`
  ADD CONSTRAINT `roadmap_info_destinations_ibfk_1` FOREIGN KEY (`roadmap_info_id`) REFERENCES `roadmap_info` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `warehouse_stock`
--
ALTER TABLE `warehouse_stock`
  ADD CONSTRAINT `warehouse_stock_ibfk_1` FOREIGN KEY (`id_warehouse`) REFERENCES `warehouses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
