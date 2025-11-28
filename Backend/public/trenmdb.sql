-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1:3306
-- Tiempo de generación: 28-11-2025 a las 02:47:38
-- Versión del servidor: 11.4.5-MariaDB-ubu2404
-- Versión de PHP: 8.1.32

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `trenmdb`
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
(3, 2, 'media res capon', 10, 10, '2025-11-10 22:12:44', '2025-11-10 22:12:44', 1000, 52),
(4, 3, 'bondiolas congeladas brasil', 25, 0, '2025-11-10 22:23:33', '2025-11-10 22:23:33', 250, 9876),
(5, 4, 'media res capon', 5, 5, '2025-11-10 22:25:41', '2025-11-10 22:25:41', 560, 90),
(6, 5, 'media res capon', 3, 3, '2025-11-10 22:28:06', '2025-11-10 22:28:06', 250, 13),
(7, 6, 'media res capon', 1, 1, '2025-11-10 22:42:25', '2025-11-10 22:42:25', 109, 1111),
(8, 7, 'media res capon', 1, 1, '2025-11-17 11:13:09', '2025-11-17 11:13:09', 105, 1),
(9, 8, 'media res capon', 1, 1, '2025-11-18 20:47:29', '2025-11-18 20:47:29', 150, 1),
(10, 9, 'supremas congeladas', 10, 0, '2025-11-18 21:04:39', '2025-11-18 21:04:39', 100, 1),
(11, 10, 'media res capon', 1, 1, '2025-11-18 21:06:27', '2025-11-18 21:06:27', 90, 1),
(12, 11, 'supremas congeladas', 20, 0, '2025-11-19 22:47:15', '2025-11-19 22:47:15', 20, 140),
(13, 12, 'media res capon', 2, 2, '2025-11-26 22:25:42', '2025-11-26 22:25:42', 230, 0),
(14, 13, 'media res capon', 1, 1, '2025-11-26 22:31:37', '2025-11-26 22:31:37', 100, 10);

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
  `production_process` tinyint(1) NOT NULL DEFAULT 0,
  `bill_state` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `bill_suppliers`
--

INSERT INTO `bill_suppliers` (`id`, `supplier`, `total_weight`, `head_quantity`, `quantity`, `romaneo_number`, `income_state`, `createdAt`, `updatedAt`, `check_state`, `fresh_quantity`, `fresh_weight`, `production_process`, `bill_state`) VALUES
(2, 'PRUEBA TREMN', '1000', 10, 10, 22222, 'manual', '2025-11-10 18:49:50', '2025-11-19 22:58:45', 0, 0, 0, 1, 1),
(3, 'PRUEBA TREMN', '250', 0, 0, 333, 'romaneo', '2025-11-10 22:23:33', '2025-11-18 20:48:58', 1, 25, 250, 1, 1),
(4, 'MAMASAF', '560', 5, 5, 7899848, 'romaneo', '2025-11-10 22:25:41', '2025-11-12 17:15:17', 1, 0, 0, 1, 1),
(5, 'PORCINOS', '250', 3, 3, 90, 'romaneo', '2025-11-10 22:28:06', '2025-11-10 22:37:10', 1, 0, 0, 1, 1),
(6, 'MAMASAF', '109', 1, 1, 1111, 'romaneo', '2025-11-10 22:42:25', '2025-11-10 22:44:40', 1, 0, 0, 1, 1),
(7, 'PORCINOS', '105', 1, 1, 3333, 'romaneo', '2025-11-17 11:13:09', '2025-11-18 21:08:53', 1, 0, 0, 1, 1),
(8, 'PRUEBA TREMN', '150', 1, 1, 77, 'romaneo', '2025-11-18 20:47:29', '2025-11-18 20:52:27', 1, 0, 0, 1, 1),
(9, 'CARREOFUR', '100', 0, 0, 90, 'romaneo', '2025-11-18 21:04:39', '2025-11-19 22:51:05', 1, 10, 100, 1, 1),
(10, 'MAMASAF', '90', 1, 1, 22, 'manual', '2025-11-18 21:06:27', '2025-11-18 21:08:53', 0, 0, 0, 1, 1),
(11, 'MAMASAF', '20', 0, 0, 230, 'romaneo', '2025-11-19 22:47:15', '2025-11-26 22:42:37', 1, 20, 20, 1, 1),
(12, 'PRUEBA TREMN', '230', 2, 2, 9090, 'romaneo', '2025-11-26 22:25:42', '2025-11-26 22:25:42', 1, 0, 0, 0, 1),
(13, 'CARREOFUR', '100', 1, 1, 2345, 'manual', '2025-11-26 22:31:37', '2025-11-26 22:35:48', 0, 0, 0, 1, 1);

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
(1, 'GIULIANA', 'CUIT', 36363636, 'CONSUMIDOR FINAL', 'giuliana@gmail.com', '33643636363', 'CALLE888', 'ARGENTINA', 'BUENOS AIRES', 'SAN NICOLAS', 1, 1, '7 dias de fecha factura', 'efectivo'),
(2, 'LAUREANO', 'CUIT', 8787878, 'RESPONSABLE MONOTRIBUTO', 'giuliana@gmail.com', '33643636363', 'CALLE888', 'ARGENTINA', 'BUENOS AIRES', 'SAN NICOLAS', 1, 2, 'cuenta corriente - 30 dias', 'efectivo');

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
(1, 1, 1, 1, 'bolsa', 5, '0', 1.00, 36.00, 35.00, '2025-11-18 22:11:00', '2025-11-18 22:11:00'),
(2, 1, 2, 1, 'caja', 1, '900', 1.00, 60.00, 59.00, '2025-11-18 22:11:00', '2025-11-18 22:11:00'),
(3, 1, 3, 1, 'bolsa', 2, '0', 1.00, 13.00, 12.00, '2025-11-18 22:11:00', '2025-11-18 22:11:00'),
(4, 4, 4, 1, 'bolsa', 1, '0', 1.00, 7.00, 6.00, '2025-11-26 22:49:41', '2025-11-26 22:49:41');

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
(1, 1, '1', 'pecho', 4900.00, 5, 5, 1.00, 36.00, 35.00, 7.00, 0, '2025-11-18 22:11:00', '2025-11-18 22:11:00'),
(2, 1, '6', 'bondiolas congeladas brasil', 9000.00, 1, 1, 1.00, 60.00, 59.00, 59.00, 0, '2025-11-18 22:11:00', '2025-11-18 22:11:00'),
(3, 1, '2', 'carre', 4950.00, 2, 2, 1.00, 13.00, 12.00, 6.00, 0, '2025-11-18 22:11:00', '2025-11-18 22:11:00'),
(4, 4, '1', 'pecho', 4900.00, 1, 1, 1.00, 7.00, 6.00, 6.00, 0, '2025-11-26 22:49:41', '2025-11-26 22:49:41');

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
(1, 'buenos aires', 1, '2025-11-18 21:34:22', '2025-11-18 21:34:22'),
(2, 'rosario', 1, '2025-11-18 21:34:26', '2025-11-18 21:34:26'),
(3, 'retiro en planta', 1, '2025-11-18 21:34:30', '2025-11-18 21:34:30');

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
(1, 'giuliana', 'finelli', 1),
(2, 'laureano', 'mujica', 1),
(3, 'prueba', 'gg', 1);

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
(1, 1, 1, 'GIULIANA', 'agustin', 'PREMIUM18.11', '7 dias de fecha factura', 'efectivo', 'system', 'prueba, salio bien!! ', 8, 761900.00, '2025-11-18 22:32:41', '2025-11-18 22:32:41'),
(2, 4, 4, 'LAUREANO', 'agustin', 'PREMIUM18.11', 'cuenta corriente - 30 dias', 'efectivo', 'system', 'prueba!', 1, 29400.00, '2025-11-26 22:51:20', '2025-11-26 22:51:20');

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
(1, 1, '1', 'pecho', 4900.00, 5.00, 'KG', 36.00, 35.00, 7.00, '2025-11-18 22:32:41', '2025-11-18 22:32:41'),
(2, 1, '6', 'bondiolas congeladas brasil', 9000.00, 1.00, 'KG', 60.00, 59.00, 59.00, '2025-11-18 22:32:41', '2025-11-18 22:32:41'),
(3, 1, '2', 'carre', 4950.00, 2.00, 'KG', 13.00, 12.00, 6.00, '2025-11-18 22:32:41', '2025-11-18 22:32:41'),
(4, 2, '1', 'pecho', 4900.00, 1.00, 'KG', 7.00, 6.00, 6.00, '2025-11-26 22:51:20', '2025-11-26 22:51:20');

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
(1, 2, 1017.50, '2025-11-10 22:21:01', '2025-11-10 22:21:01'),
(2, 10, 89.50, '2025-11-18 21:07:11', '2025-11-18 21:07:11'),
(3, 13, 103.50, '2025-11-26 22:32:48', '2025-11-26 22:32:48');

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
(1, 2, 'media res capon', 1, '1', 1, 100, 105, 2.5, 102.5, 2.50),
(2, 2, 'media res capon', 22, '1', 1, 105, 110, 5, 105, 0.00),
(3, 2, 'media res capon', 2, '1', 1, 110, 115, 1, 114, 3.64),
(4, 2, 'media res capon', 3, '1', 1, 100, 100, 2.5, 97.5, -2.50),
(5, 2, 'media res capon', 44, '1', 1, 102, 104, 2.5, 101.5, -0.49),
(6, 2, 'media res capon', 35, '1', 1, 99, 102, 2.5, 99.5, 0.51),
(7, 2, 'media res capon', 123, '1', 1, 90, 100, 5, 95, 5.56),
(8, 2, 'media res capon', 1111, '1', 1, 100, 103, 2.5, 100.5, 0.50),
(9, 2, 'media res capon', 55, '1', 1, 100.5, 103, 1.5, 101.5, 1.00),
(10, 2, 'media res capon', 57, '1', 1, 100, 102, 1.5, 100.5, 0.50),
(11, 10, 'media res capon', 1, '1', 1, 90, 92, 2.5, 89.5, -0.56),
(12, 13, 'media res capon', 90, '1', 1, 100, 106, 2.5, 103.5, 3.50);

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
(1, '2025-11-19', 'GIULIANA', 'agustin', 'PREMIUM18.11', '7 dias de fecha factura', 'efectivo', 'prueba', 1, 1, '2025-11-18 21:54:34', '2025-11-18 22:11:02'),
(2, '2025-11-19', 'LAUREANO', 'giuliana', 'PREMIUM18.11', 'cuenta corriente - 30 dias', 'efectivo', '', 1, 0, '2025-11-18 21:55:30', '2025-11-18 21:58:04'),
(3, '2025-11-18', 'GIULIANA', 'laureano', 'PREMIUM18.11', '7 dias de fecha factura', 'efectivo', '', 1, 0, '2025-11-18 21:57:26', '2025-11-18 21:58:12'),
(4, '2025-11-27', 'LAUREANO', 'agustin', 'PREMIUM18.11', 'cuenta corriente - 30 dias', 'efectivo', 'prueba de tipo de medida ', 1, 1, '2025-11-26 22:44:25', '2025-11-26 22:49:47');

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
(2, 'PRUEBA'),
(10, 'prueba!'),
(13, '');

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
(1, 1, '1', 'pecho', 4900.00, 5.00, 'UN'),
(2, 1, '6', 'bondiolas congeladas brasil', 9000.00, 1.00, 'UN'),
(3, 1, '2', 'carre', 4950.00, 2.00, 'UN'),
(4, 2, '1', 'pecho', 4900.00, 3.00, 'UN'),
(5, 2, '3', 'bondiola', 6500.00, 1.00, 'UN'),
(6, 3, '6', 'bondiolas congeladas brasil', 9000.00, 1.00, 'UN'),
(7, 4, '1', 'pecho', 4900.00, 1.00, 'UN');

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
(3, 'efectivo'),
(4, 'transferencia'),
(5, 'echeq al dia');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `preinvoices`
--

CREATE TABLE `preinvoices` (
  `id` int(10) UNSIGNED NOT NULL,
  `receipt_number` varchar(50) NOT NULL,
  `final_remit_id` int(10) UNSIGNED DEFAULT NULL,
  `final_remit_item_id` int(10) UNSIGNED DEFAULT NULL,
  `product_id` varchar(50) NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `unit_measure` varchar(10) NOT NULL,
  `expected_units` decimal(12,3) NOT NULL DEFAULT 0.000,
  `expected_kg` decimal(12,3) NOT NULL DEFAULT 0.000,
  `received_units` decimal(12,3) NOT NULL DEFAULT 0.000,
  `received_kg` decimal(12,3) NOT NULL DEFAULT 0.000,
  `note` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `preinvoices`
--

INSERT INTO `preinvoices` (`id`, `receipt_number`, `final_remit_id`, `final_remit_item_id`, `product_id`, `product_name`, `unit_measure`, `expected_units`, `expected_kg`, `received_units`, `received_kg`, `note`, `created_at`, `updated_at`) VALUES
(1, '1', 1, 1, '1', 'pecho', 'KG', 5.000, 35.000, 5.000, 34.550, NULL, '2025-11-18 22:39:55', '2025-11-18 22:39:55'),
(2, '1', 1, 2, '6', 'bondiolas congeladas brasil', 'KG', 1.000, 59.000, 1.000, 59.000, NULL, '2025-11-18 22:39:55', '2025-11-18 22:39:55'),
(3, '1', 1, 3, '2', 'carre', 'KG', 2.000, 12.000, 2.000, 12.500, NULL, '2025-11-18 22:39:55', '2025-11-18 22:39:55');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `preinvoice_returns`
--

CREATE TABLE `preinvoice_returns` (
  `id` int(10) UNSIGNED NOT NULL,
  `preinvoice_id` int(10) UNSIGNED NOT NULL,
  `client_id` int(10) UNSIGNED DEFAULT NULL,
  `client_name` varchar(255) DEFAULT NULL,
  `units_redirected` decimal(12,3) NOT NULL DEFAULT 0.000,
  `kg_redirected` decimal(12,3) NOT NULL DEFAULT 0.000,
  `reason` enum('REDIRECT','STOCK') NOT NULL DEFAULT 'REDIRECT',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
(1, 1, 'PREMIUM18.11', 1);

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
(1, 1, 1, 'pecho', 'KG', 0.00, 4434.39, 4900.00),
(2, 1, 2, 'carre', 'KG', 0.00, 4479.64, 4950.00),
(3, 1, 3, 'bondiola', 'KG', 0.00, 5882.35, 6500.00),
(4, 1, 4, 'jamones', 'KG', 0.00, 3610.86, 3990.00),
(5, 1, 5, 'paletas', 'KG', 0.00, 3493.21, 3860.00),
(6, 1, 6, 'bondiolas congeladas brasil', 'KG', 0.00, 0.00, 0.00),
(7, 1, 7, 'media res capon', 'KG', 0.00, 0.00, 0.00),
(8, 1, 8, 'media res chancha', 'KG', 0.00, 0.00, 0.00),
(9, 1, 9, 'huesos', 'KG', 0.00, 0.00, 0.00),
(10, 1, 10, 'carne cabeza', 'KG', 0.00, 0.00, 0.00),
(11, 1, 11, 'recortes A', 'KG', 0.00, 0.00, 0.00),
(12, 1, 12, 'cuero', 'KG', 0.00, 0.00, 0.00),
(13, 1, 13, 'supremas congeladas', 'KG', 0.00, 0.00, 0.00);

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
(1, 'pecho', 9.83, 6, 60, 1, 59, 1, '2025-11-10 22:37:10', '2025-11-10 22:37:10'),
(2, 'carre', 11.5, 6, 70, 1, 69, 1, '2025-11-10 22:37:10', '2025-11-10 22:37:10'),
(3, 'bondiola', 2.83, 6, 18, 1, 17, 1, '2025-11-10 22:37:10', '2025-11-10 22:37:10'),
(4, 'jamones', 12.5, 6, 80, 5, 75, 1, '2025-11-10 22:37:10', '2025-11-10 22:37:10'),
(5, 'paletas', 12.58, 6, 78, 2.5, 75.5, 1, '2025-11-10 22:37:10', '2025-11-10 22:37:10'),
(6, 'huesos', 15, 1, 16, 1, 15, 1, '2025-11-10 22:37:10', '2025-11-10 22:37:10'),
(7, 'carne cabeza', 11, 1, 12, 1, 11, 1, '2025-11-10 22:37:10', '2025-11-10 22:37:10'),
(8, 'recortes A', 29, 1, 30, 1, 29, 1, '2025-11-10 22:37:10', '2025-11-10 22:37:10'),
(9, 'cuero', 9.5, 1, 10.5, 1, 9.5, 1, '2025-11-10 22:37:10', '2025-11-10 22:37:10'),
(10, 'pecho', 9.5, 2, 20, 1, 19, 2, '2025-11-10 22:44:40', '2025-11-10 22:44:40'),
(11, 'carre', 10.25, 2, 23, 2.5, 20.5, 2, '2025-11-10 22:44:40', '2025-11-10 22:44:40'),
(12, 'bondiola', 2.75, 2, 8, 2.5, 5.5, 2, '2025-11-10 22:44:40', '2025-11-10 22:44:40'),
(13, 'jamones', 13.75, 2, 30, 2.5, 27.5, 2, '2025-11-10 22:44:40', '2025-11-10 22:44:40'),
(14, 'paletas', 13, 2, 27, 1, 26, 2, '2025-11-10 22:44:40', '2025-11-10 22:44:40'),
(15, 'huesos', 4.5, 1, 5.5, 1, 4.5, 2, '2025-11-10 22:44:40', '2025-11-10 22:44:40'),
(16, 'pecho', 9.5, 10, 100, 5, 95, 3, '2025-11-12 17:15:17', '2025-11-12 17:15:17'),
(17, 'carre', 9.85, 10, 100, 1.5, 98.5, 3, '2025-11-12 17:15:17', '2025-11-12 17:15:17'),
(21, 'pecho', 8.75, 2, 20, 2.5, 17.5, 4, '2025-11-18 20:56:03', '2025-11-18 20:56:03'),
(22, 'carre', 8.75, 2, 20, 2.5, 17.5, 4, '2025-11-18 20:56:03', '2025-11-18 20:56:03'),
(23, 'bondiola', 2.75, 2, 8, 2.5, 5.5, 4, '2025-11-18 20:56:03', '2025-11-18 20:56:03'),
(24, 'carne cabeza', 0, 0, 4, 1, 3, 4, '2025-11-18 20:56:03', '2025-11-18 20:56:03'),
(25, 'recortes A', 0, 0, 10, 1, 9, 4, '2025-11-18 20:56:03', '2025-11-18 20:56:03'),
(26, 'pecho', 9.38, 4, 40, 2.5, 37.5, 5, '2025-11-18 21:08:53', '2025-11-18 21:08:53'),
(27, 'bondiola', 2.5, 4, 15, 5, 10, 5, '2025-11-18 21:08:53', '2025-11-18 21:08:53'),
(28, 'paletas', 9.38, 4, 40, 2.5, 37.5, 5, '2025-11-18 21:08:53', '2025-11-18 21:08:53'),
(29, 'pecho', 5.99, 200, 1200, 2.5, 1197.5, 6, '2025-11-19 22:58:45', '2025-11-19 22:58:45'),
(30, 'carne cabeza', 0, 0, 36, 5, 31, 6, '2025-11-19 22:58:45', '2025-11-19 22:58:45'),
(31, 'pecho', 8.75, 2, 20, 2.5, 17.5, 7, '2025-11-26 22:35:48', '2025-11-26 22:35:48'),
(32, 'carre', 10.25, 2, 23, 2.5, 20.5, 7, '2025-11-26 22:35:48', '2025-11-26 22:35:48'),
(33, 'jamones', 13.75, 2, 30, 2.5, 27.5, 7, '2025-11-26 22:35:48', '2025-11-26 22:35:48'),
(34, 'paletas', 13.25, 2, 29, 2.5, 26.5, 7, '2025-11-26 22:35:48', '2025-11-26 22:35:48'),
(35, 'bondiola', 2, 2, 5, 1, 4, 7, '2025-11-26 22:35:48', '2025-11-26 22:35:48'),
(36, 'huesos', 0, 0, 5, 1.5, 3.5, 7, '2025-11-26 22:35:48', '2025-11-26 22:35:48'),
(37, 'recortes A', 0, 0, 10, 1, 9, 7, '2025-11-26 22:35:48', '2025-11-26 22:35:48');

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
(1, 1, 5),
(2, 2, 6),
(3, 3, 4),
(5, 4, 8),
(6, 5, 10),
(7, 5, 7),
(8, 6, 2),
(9, 7, 13);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productionprocess_subproduction`
--

CREATE TABLE `productionprocess_subproduction` (
  `id` int(11) NOT NULL,
  `process_number` int(11) NOT NULL,
  `cut_name` varchar(120) NOT NULL,
  `quantity` decimal(12,3) NOT NULL DEFAULT 0.000,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `alicuota` decimal(5,2) DEFAULT NULL,
  `unit_measure` varchar(10) NOT NULL DEFAULT 'UN'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `products_available`
--

INSERT INTO `products_available` (`id`, `product_name`, `product_general_category`, `category_id`, `min_stock`, `max_stock`, `alicuota`, `unit_measure`) VALUES
(1, 'pecho', 'propio', NULL, 1, 10, 10.50, 'UN'),
(2, 'carre', 'propio', NULL, 1, 10, 10.50, 'UN'),
(3, 'bondiola', 'propio', NULL, 1, 10, 10.50, 'UN'),
(4, 'jamones', 'propio', NULL, 1, 10, 10.50, 'UN'),
(5, 'paletas', 'propio', NULL, 1, 10, 10.50, 'UN'),
(6, 'bondiolas congeladas brasil', 'externo', 2, 1, 999997, 10.50, 'UN'),
(7, 'media res capon', 'externo', NULL, 1, 100000, 10.50, 'UN'),
(8, 'media res chancha', 'externo', NULL, 1, 1000, 10.50, 'UN'),
(9, 'huesos', 'propio', NULL, 1, 10, 10.50, 'UN'),
(10, 'carne cabeza', 'propio', NULL, 1, 100, 10.50, 'UN'),
(11, 'recortes A', 'propio', NULL, 1, 1000, 10.50, 'UN'),
(12, 'cuero', 'propio', NULL, 1, 10, 10.50, 'UN'),
(13, 'supremas congeladas', 'externo', 2, 0, 0, 10.50, 'UN'),
(14, 'producto prueba', 'propio', NULL, 0, 0, 10.50, 'UN');

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
  `tipo_medida` varchar(10) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `products_sell_order`
--

INSERT INTO `products_sell_order` (`id`, `sell_order_id`, `product_id`, `product_name`, `product_price`, `product_quantity`, `tipo_medida`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'pecho', 4900, 5, NULL, '2025-11-18 21:57:55', '2025-11-18 21:57:55'),
(2, 1, 6, 'bondiolas congeladas brasil', 9000, 1, NULL, '2025-11-18 21:57:55', '2025-11-18 21:57:55'),
(3, 1, 2, 'carre', 4950, 2, NULL, '2025-11-18 21:57:55', '2025-11-18 21:57:55'),
(4, 2, 1, 'pecho', 4900, 3, NULL, '2025-11-18 21:58:04', '2025-11-18 21:58:04'),
(5, 2, 3, 'bondiola', 6500, 1, NULL, '2025-11-18 21:58:04', '2025-11-18 21:58:04'),
(6, 3, 6, 'bondiolas congeladas brasil', 9000, 1, NULL, '2025-11-18 21:58:12', '2025-11-18 21:58:12'),
(7, 4, 1, 'pecho', 4900, 1, NULL, '2025-11-26 22:48:11', '2025-11-26 22:48:11');

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
(2, 'CONGELADOS'),
(1, 'OTROS PRODUCTOS');

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
(1, 'media res capon', 1, 7, '', 130),
(2, 'bondiolas congeladas brasil', 24, 6, 'CONGELADOS', 191),
(3, 'pecho', 220, 1, NULL, 1402),
(4, 'carre', 20, 2, NULL, 214),
(5, 'bondiola', 16, 3, NULL, 42),
(6, 'jamones', 10, 4, NULL, 130),
(7, 'paletas', 14, 5, NULL, 165.5),
(8, 'huesos', 2, 9, NULL, 23),
(9, 'carne cabeza', 0, 10, NULL, 42),
(10, 'recortes A', 0, 11, NULL, 38),
(11, 'cuero', 0, 12, NULL, 9.5),
(12, 'supremas congeladas', 30, 13, 'CONGELADOS', 120);

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
(6, 7, 1, 2.00, 'unidad'),
(7, 7, 2, 2.00, 'unidad'),
(8, 7, 3, 2.00, 'unidad'),
(9, 7, 5, 2.00, 'unidad'),
(10, 7, 4, 2.00, 'unidad'),
(11, 7, 10, 3.00, 'kg'),
(12, 7, 9, 5.00, 'kg'),
(13, 7, 11, 8.00, 'kg'),
(14, 7, 12, 3.00, 'kg');

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
  `provider_location` varchar(255) NOT NULL,
  `provider_state` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `providers`
--

INSERT INTO `providers` (`id`, `provider_name`, `provider_type_id`, `provider_id_number`, `provider_iva_condition`, `provider_email`, `provider_phone`, `provider_adress`, `provider_country`, `provider_province`, `provider_location`, `provider_state`) VALUES
(1, 'MAMASAF', 'CUIT', '2323232323', 'IVA RESPONSABLE INSCRIPTO', 'prueba@gmail.com', '3364111111', 'PRUEBA123', 'ARGENTINA', 'BUENOS AIRES', 'RAMALLO', 1),
(2, 'PRUEBA TREMN', 'CUIT', '234556789', 'IVA RESPONSABLE INSCRIPTO', 'prueba@gmail.com', '3364222222', 'PRUEBA SEGUNDA 78999', 'ARGENTINA', 'SANTA FE', 'ROSARIO', 1),
(4, 'PORCINOS', 'CUIT', '90909090', 'IVA RESPONSABLE INSCRIPTO', 'prueba@gmail.com', '3364778899', 'PRUEBA77', 'ARGENTINA', 'SALTA', 'DDDD', 1),
(5, 'CARREOFUR', 'CUIT', '998877766', 'IVA RESPONSABLE INSCRIPTO', 'ururr@gmail.com', '336475885', 'PRUEBA8999', 'AUSTRIA', 'PRUEBA', 'PRUEBA', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `roadmap_info`
--

CREATE TABLE `roadmap_info` (
  `id` int(11) NOT NULL,
  `delivery_date` date NOT NULL,
  `truck_license_plate` varchar(20) NOT NULL,
  `driver` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `roadmap_info`
--

INSERT INTO `roadmap_info` (`id`, `delivery_date`, `truck_license_plate`, `driver`, `created_at`) VALUES
(1, '2025-11-19', '009902', 'giuliana finelli', '2025-11-18 22:34:05');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `roadmap_info_destinations`
--

CREATE TABLE `roadmap_info_destinations` (
  `id` int(11) NOT NULL,
  `roadmap_info_id` int(11) NOT NULL,
  `id_remit` int(11) NOT NULL,
  `client_name` varchar(255) NOT NULL,
  `destination` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `roadmap_info_destinations`
--

INSERT INTO `roadmap_info_destinations` (`id`, `roadmap_info_id`, `id_remit`, `client_name`, `destination`) VALUES
(1, 1, 1, 'GIULIANA', 'rosario');

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
(3, 'contrafactura'),
(4, '7 dias de fecha factura'),
(5, 'cuenta corriente - 30 dias');

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
(1, '1', 'agustin', 'Buenos Aires', '', '', '', '', '', 1, '2025-11-18 21:11:55', '2025-11-18 21:11:55'),
(2, '2', 'giuliana', 'Buenos Aires', '', '', '', '', '', 1, '2025-11-18 21:12:03', '2025-11-18 21:12:03'),
(3, '3', 'laureano', 'Buenos Aires', '', '', '', '', '', 1, '2025-11-18 21:12:12', '2025-11-18 21:12:12');

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
(1, 'roldana chica', 2.5),
(2, 'bandeja', 1),
(3, 'roldana ingreso', 5),
(4, 'bin', 40),
(5, 'gancho', 1.5);

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
(1, 'iveco', 'iveco', '009902', 1, '2025-11-18 21:34:40', '2025-11-18 21:34:40');

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
-- Indices de la tabla `preinvoices`
--
ALTER TABLE `preinvoices`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_preinvoices_item` (`receipt_number`,`product_id`,`final_remit_item_id`),
  ADD KEY `idx_preinvoices_receipt` (`receipt_number`),
  ADD KEY `idx_preinvoices_remit` (`final_remit_id`);

--
-- Indices de la tabla `preinvoice_returns`
--
ALTER TABLE `preinvoice_returns`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_returns_preinvoice` (`preinvoice_id`);

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
-- Indices de la tabla `productionprocess_subproduction`
--
ALTER TABLE `productionprocess_subproduction`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_ppsub_procnum` (`process_number`),
  ADD KEY `idx_ppsub_cutname` (`cut_name`);

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
  ADD KEY `idx_rmd_roadmap` (`roadmap_info_id`),
  ADD KEY `idx_rmd_remit` (`id_remit`);

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
  MODIFY `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT de la tabla `bill_suppliers`
--
ALTER TABLE `bill_suppliers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT de la tabla `clients`
--
ALTER TABLE `clients`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `cuts_detail`
--
ALTER TABLE `cuts_detail`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `cuts_header`
--
ALTER TABLE `cuts_header`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `destinations`
--
ALTER TABLE `destinations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `drivers`
--
ALTER TABLE `drivers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `final_remits`
--
ALTER TABLE `final_remits`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `final_remit_products`
--
ALTER TABLE `final_remit_products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `meat_income_manual_weight`
--
ALTER TABLE `meat_income_manual_weight`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `meat_manual_income`
--
ALTER TABLE `meat_manual_income`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `new_orders`
--
ALTER TABLE `new_orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `order_products_client`
--
ALTER TABLE `order_products_client`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `other_product_manual`
--
ALTER TABLE `other_product_manual`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `payment_conditions`
--
ALTER TABLE `payment_conditions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `preinvoices`
--
ALTER TABLE `preinvoices`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `preinvoice_returns`
--
ALTER TABLE `preinvoice_returns`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `price_lists`
--
ALTER TABLE `price_lists`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `price_list_products`
--
ALTER TABLE `price_list_products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT de la tabla `process_meats`
--
ALTER TABLE `process_meats`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT de la tabla `process_number`
--
ALTER TABLE `process_number`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `productionprocess_subproduction`
--
ALTER TABLE `productionprocess_subproduction`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `products_sell_order`
--
ALTER TABLE `products_sell_order`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `product_categories`
--
ALTER TABLE `product_categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `product_stock`
--
ALTER TABLE `product_stock`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `product_subproducts`
--
ALTER TABLE `product_subproducts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT de la tabla `providers`
--
ALTER TABLE `providers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `roadmap_info`
--
ALTER TABLE `roadmap_info`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `roadmap_info_destinations`
--
ALTER TABLE `roadmap_info_destinations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `sale_conditions`
--
ALTER TABLE `sale_conditions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `sellers`
--
ALTER TABLE `sellers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `tares`
--
ALTER TABLE `tares`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `trucks`
--
ALTER TABLE `trucks`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

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
-- Filtros para la tabla `preinvoice_returns`
--
ALTER TABLE `preinvoice_returns`
  ADD CONSTRAINT `fk_returns_preinvoice` FOREIGN KEY (`preinvoice_id`) REFERENCES `preinvoices` (`id`) ON DELETE CASCADE;

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
