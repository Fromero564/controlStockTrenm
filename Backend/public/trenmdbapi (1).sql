-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1:3306
-- Tiempo de generación: 14-07-2026 a las 07:00:07
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
-- Base de datos: `trenmdbapi`
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
  `identification_product` int(11) NOT NULL,
  `unique_code` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `bill_details`
--

INSERT INTO `bill_details` (`id`, `bill_supplier_id`, `type`, `quantity`, `heads`, `createdAt`, `updatedAt`, `weight`, `identification_product`, `unique_code`) VALUES
(2, 2, 'Capon', 10, 10, '2026-03-19 14:12:50', '2026-03-19 14:12:50', 928, 4556, '0001-20260319-001'),
(3, 3, 'Capon', 10, 10, '2026-03-19 17:01:26', '2026-03-19 17:01:26', 876, 5882, '0003-20260319-001'),
(4, 4, 'Capon', 10, 10, '2026-03-26 21:13:22', '2026-03-26 21:13:22', 949, 58241, '0004-20260326-001'),
(7, 5, 'Capon', 1, 1, '2026-03-30 10:43:33', '2026-03-30 10:43:33', 115, 3333, '0005-20260330-002'),
(8, 5, 'Capon', 1, 1, '2026-03-30 10:43:33', '2026-03-30 10:43:33', 120, 3333, '0005-20260330-003'),
(9, 6, 'Capon', 2, 2, '2026-03-30 10:54:29', '2026-03-30 10:54:29', 230, 99, '0006-20260330-001'),
(10, 7, 'Capon', 6, 6, '2026-04-16 12:43:38', '2026-04-16 12:43:38', 500, 1253, NULL),
(11, 8, 'Capon', 3, 3, '2026-04-16 13:32:53', '2026-04-16 13:32:53', 350, 232323, NULL),
(13, 10, 'Capon', 5, 5, '2026-04-23 14:17:22', '2026-04-23 14:17:22', 500, 47526, NULL),
(14, 11, 'Capon', 1, 1, '2026-04-29 13:11:46', '2026-04-29 13:11:46', 120, 1, '0011-20260429-001'),
(15, 12, 'Capon', 1, 1, '2026-05-12 10:47:15', '2026-05-12 10:47:15', 1350, 15, NULL),
(16, 13, 'Capon', 4, 4, '2026-05-12 11:08:29', '2026-05-12 11:08:29', 650, 1212, NULL),
(20, 14, 'Capon', 1, 1, '2026-05-12 13:43:52', '2026-05-12 13:43:52', 100, 1, NULL),
(21, 15, 'Capon', 2, 2, '2026-05-12 16:29:21', '2026-05-12 16:29:21', 200, 22222, NULL),
(23, 17, 'Capon', 1, 1, '2026-05-15 01:20:44', '2026-05-15 01:20:44', 1, 1, NULL),
(26, 18, 'Capon', 1, 1, '2026-06-02 11:37:15', '2026-06-02 11:37:15', 150, 11111, NULL),
(27, 16, 'Capon', 1, 1, '2026-06-02 11:37:38', '2026-06-02 11:37:38', 100, 1000, NULL),
(30, 19, 'Capon', 1, 1, '2026-06-02 22:25:18', '2026-06-02 22:25:18', 130, 11, NULL),
(31, 19, 'Capon', 1, 1, '2026-06-02 22:25:18', '2026-06-02 22:25:18', 134, 111, NULL),
(32, 20, 'Capon', 3, 3, '2026-06-16 21:24:40', '2026-06-16 21:24:40', 450, 9999, NULL),
(33, 21, 'Capon', 3, 3, '2026-06-22 23:11:03', '2026-06-22 23:11:03', 350, 999, NULL),
(34, 22, 'Capon', 2, 2, '2026-06-23 18:12:31', '2026-06-23 18:12:31', 1200, 1230, NULL),
(35, 23, 'Capon', 4, 4, '2026-06-23 21:02:50', '2026-06-23 21:02:50', 420, 9, NULL),
(36, 24, 'Capon', 2, 2, '2026-06-28 15:08:23', '2026-06-28 15:08:23', 250, 0, NULL),
(37, 25, 'Capon', 2, 2, '2026-06-28 16:31:31', '2026-06-28 16:31:31', 350, 0, NULL),
(39, 27, 'Capon', 3, 3, '2026-06-29 17:13:47', '2026-06-29 17:13:47', 450, 4, NULL),
(40, 28, 'Capon', 1, 1, '2026-06-30 07:06:24', '2026-06-30 07:06:24', 250, 3, '0028-20260630-001'),
(41, 28, 'Capon', 1, 1, '2026-06-30 07:06:24', '2026-06-30 07:06:24', 125, 4, '0028-20260630-002'),
(43, 29, 'Capon', 1, 1, '2026-07-06 00:32:16', '2026-07-06 00:32:16', 140, 10, '0029-20260705-001'),
(44, 29, 'Capon', 1, 1, '2026-07-06 00:32:16', '2026-07-06 00:32:16', 124, 3, '0029-20260705-002'),
(45, 30, 'Capon', 3, 3, '2026-07-08 23:37:20', '2026-07-08 23:37:20', 360, 9, NULL);

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
(2, 'AGROPECUARIA LOS RETOÑOS', '928', 10, 10, 1223, 'manual', '2026-03-19 14:12:50', '2026-03-19 14:18:57', 0, 0, 0, 0, 1),
(3, 'AGROPECUARIA SUR SA', '876', 10, 10, 5886, 'manual', '2026-03-19 17:01:26', '2026-03-19 17:11:20', 0, 0, 0, 0, 1),
(4, 'LOS ODWYER SA', '949', 10, 10, 47553, 'manual', '2026-03-26 21:13:22', '2026-03-26 21:17:48', 0, 0, 0, 0, 1),
(5, 'FUMISEM SA', '235', 1, 1, 10000, 'manual', '2026-03-30 10:40:48', '2026-03-30 10:51:55', 0, 0, 0, 0, 1),
(6, 'FADEL SA', '230', 2, 2, 111, 'manual', '2026-03-30 10:54:29', '2026-03-30 10:57:01', 0, 0, 0, 0, 1),
(7, 'AGROPECUARIA LOS RETOÑOS', '500', 6, 6, 48563, 'manual', '2026-04-16 12:43:38', '2026-04-16 12:49:06', 0, 0, 0, 0, 1),
(8, 'FUMISEM SA', '350', 3, 3, 22, 'manual', '2026-04-16 13:32:53', '2026-04-16 13:35:37', 0, 0, 0, 0, 1),
(9, 'FADEL SA', '320', 3, 0, 44523, 'manual', '2026-04-23 14:01:01', '2026-04-23 14:03:47', 0, 0, 0, 0, 1),
(10, 'COOP. AGRICOLA GANADERA Y DE SERVICIOS PUBLICOS ARANGUREN', '500', 5, 5, 45823, 'manual', '2026-04-23 14:17:22', '2026-04-23 14:28:52', 0, 0, 0, 0, 1),
(11, 'COSTA RIO SRL', '120', 1, 1, 1, 'romaneo', '2026-04-29 13:11:46', '2026-04-29 13:11:46', 1, 0, 0, 0, 1),
(12, 'FUMISEM SA', '1350', 1, 1, 42, 'manual', '2026-05-12 10:47:15', '2026-05-12 10:48:33', 0, 0, 0, 0, 1),
(13, 'COTAGRO COOPERATIVA AGROPECUARIA LIMITADA', '650', 4, 4, 898989, 'manual', '2026-05-12 11:08:29', '2026-05-12 11:12:02', 0, 0, 0, 0, 1),
(14, 'COSTA RIO SRL', '100', 1, 1, 111111, 'manual', '2026-05-12 12:52:46', '2026-05-12 13:44:19', 0, 0, 0, 0, 1),
(15, 'NUTRIMAS SA', '200', 2, 2, 55555555, 'manual', '2026-05-12 16:29:21', '2026-05-12 16:30:11', 0, 0, 0, 0, 1),
(16, 'AGROPECUARIA LOS RETOÑOS', '100', 1, 1, 1, 'manual', '2026-05-14 22:58:29', '2026-06-02 11:37:38', 0, 0, 0, 0, 1),
(17, 'COSTA RIO SRL', '1', 1, 1, 1, 'manual', '2026-05-15 01:20:44', '2026-05-15 01:20:44', 0, 0, 0, 0, 1),
(18, 'AGROPECUARIA LOS RETOÑOS', '150', 1, 1, 15, 'manual', '2026-06-02 11:34:58', '2026-06-02 11:37:27', 0, 0, 0, 0, 1),
(19, 'FADEL SA', '264', 2, 2, 1111, 'manual', '2026-06-02 22:20:14', '2026-06-02 22:27:00', 0, 0, 0, 0, 1),
(20, 'CAMURRI SA', '450', 3, 3, 90, 'manual', '2026-06-16 21:24:40', '2026-06-16 21:26:41', 0, 0, 0, 0, 1),
(21, 'MAMASAF', '350', 3, 3, 111111, 'manual', '2026-06-22 23:11:03', '2026-06-22 23:11:03', 0, 0, 0, 0, 1),
(22, 'AGROPECUARIA LOS RETOÑOS', '1200', 2, 2, 10, 'manual', '2026-06-23 18:12:31', '2026-06-23 19:01:08', 0, 0, 0, 0, 1),
(23, 'LENA SCPA', '420', 4, 4, 67, 'manual', '2026-06-23 21:02:50', '2026-06-23 21:04:22', 0, 0, 0, 0, 1),
(24, 'AGROPECUARIA LOS RETOÑOS', '250', 2, 2, 15, 'manual', '2026-06-28 15:08:23', '2026-06-28 15:09:03', 0, 0, 0, 0, 1),
(25, 'AGROPECUARIA LOS RETOÑOS', '350', 2, 2, 50, 'manual', '2026-06-28 16:31:31', '2026-06-28 16:32:55', 0, 0, 0, 0, 1),
(27, 'MIGUEL A BENATTI Y ANA M CHAO OCA SH', '450', 3, 3, 5555, 'manual', '2026-06-29 17:13:47', '2026-06-29 17:16:55', 0, 0, 0, 0, 1),
(28, 'CAMURRI SA', '375', 2, 2, 56, 'romaneo', '2026-06-30 07:06:24', '2026-06-30 07:06:24', 1, 0, 0, 0, 1),
(29, 'CAMURRI SA', '264', 2, 2, 100, 'romaneo', '2026-07-06 00:31:35', '2026-07-06 01:09:58', 1, 0, 0, 1, 1),
(30, 'FADEL SA', '360', 3, 3, 888, 'manual', '2026-07-08 23:37:20', '2026-07-08 23:44:55', 0, 0, 0, 1, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `camara_manual_cuts`
--

CREATE TABLE `camara_manual_cuts` (
  `id` int(11) NOT NULL,
  `bill_supplier_id` int(11) NOT NULL,
  `product_name` varchar(120) NOT NULL,
  `garron` varchar(50) DEFAULT NULL,
  `head` int(11) NOT NULL DEFAULT 0,
  `quantity` decimal(10,2) NOT NULL DEFAULT 0.00,
  `provider_weight` decimal(10,2) NOT NULL DEFAULT 0.00,
  `gross_weight` decimal(10,2) NOT NULL DEFAULT 0.00,
  `tare_weight` decimal(10,2) NOT NULL DEFAULT 0.00,
  `tara_id` int(11) DEFAULT NULL,
  `net_weight` decimal(10,2) NOT NULL DEFAULT 0.00,
  `unique_code` varchar(80) DEFAULT NULL,
  `a_camara` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `camara_manual_cuts`
--

INSERT INTO `camara_manual_cuts` (`id`, `bill_supplier_id`, `product_name`, `garron`, `head`, `quantity`, `provider_weight`, `gross_weight`, `tare_weight`, `tara_id`, `net_weight`, `unique_code`, `a_camara`, `created_at`, `updated_at`) VALUES
(1, 4, 'Capon', '28', 1, 1.00, 79.00, 80.00, 2.40, NULL, 77.60, '0004-20260326-008', 1, '2026-03-26 21:17:48', '2026-03-26 21:17:48'),
(2, 4, 'Capon', '29', 1, 1.00, 100.00, 100.00, 2.40, NULL, 97.60, '0004-20260326-009', 1, '2026-03-26 21:17:48', '2026-03-26 21:17:48'),
(3, 4, 'Capon', '30', 1, 1.00, 105.00, 106.00, 2.40, NULL, 103.60, '0004-20260326-010', 1, '2026-03-26 21:17:48', '2026-03-26 21:17:48'),
(4, 6, 'Capon', '15', 1, 1.00, 130.00, 120.00, 4.50, NULL, 115.50, '0006-20260330-002', 0, '2026-03-30 10:57:01', '2026-05-12 05:06:37'),
(5, 7, 'Capon', '4', 1, 1.00, 105.00, 109.00, 2.40, NULL, 106.60, '0007-20260416-004', 1, '2026-04-16 12:49:06', '2026-04-16 12:49:06'),
(6, 7, 'Capon', '5', 1, 1.00, 88.00, 90.00, 2.40, NULL, 87.60, '0007-20260416-005', 1, '2026-04-16 12:49:06', '2026-04-16 12:49:06'),
(7, 7, 'Capon', '6', 1, 1.00, 99.00, 101.00, 2.40, NULL, 98.60, '0007-20260416-006', 1, '2026-04-16 12:49:06', '2026-04-16 12:49:06'),
(8, 8, 'Capon', '1', 1, 1.00, 100.00, 105.00, 2.40, NULL, 102.60, '0008-20260416-001', 1, '2026-04-16 13:35:37', '2026-04-16 13:35:37'),
(9, 8, 'Capon', '2', 1, 1.00, 103.00, 106.00, 2.40, NULL, 103.60, '0008-20260416-002', 1, '2026-04-16 13:35:37', '2026-04-16 13:35:37'),
(10, 9, 'Capon', '2', 1, 1.00, 100.00, 102.00, 2.40, NULL, 99.60, '0009-20260423-002', 1, '2026-04-23 14:02:37', '2026-04-23 14:02:37'),
(11, 9, 'Capon', '3', 1, 1.00, 105.00, 107.00, 2.40, NULL, 104.60, '0009-20260423-003', 1, '2026-04-23 14:02:37', '2026-04-23 14:02:37'),
(12, 12, 'Capon', '10', 1, 1.00, 1350.00, 1379.00, 29.00, NULL, 1350.00, '0012-20260512-001', 0, '2026-05-12 10:48:33', '2026-05-12 10:50:17'),
(13, 13, 'Capon', '2', 1, 1.00, 165.00, 172.00, 2.00, NULL, 170.00, '0013-20260512-002', 1, '2026-05-12 11:12:02', '2026-05-12 11:12:02'),
(14, 13, 'Capon', '3', 1, 1.00, 163.00, 170.00, 0.10, NULL, 169.90, '0013-20260512-003', 1, '2026-05-12 11:12:02', '2026-05-12 11:12:02'),
(15, 14, 'Capon', '1', 1, 1.00, 150.00, 156.00, 3.40, NULL, 152.60, '0014-20260512-001', 1, '2026-05-12 13:44:19', '2026-05-12 13:44:19'),
(16, 15, 'Capon', '101', 1, 1.00, 105.00, 101.00, 0.10, NULL, 100.90, '0015-20260512-002', 0, '2026-05-12 16:30:11', '2026-06-02 22:16:18'),
(18, 19, 'Capon', '1', 1, 1.00, 137.00, 140.00, 2.00, NULL, 138.00, '0019-20260602-003', 0, '2026-06-02 22:27:00', '2026-06-02 22:30:19'),
(19, 20, 'Capon', '1', 1, 1.00, 100.00, 105.00, 2.40, NULL, 102.60, '0020-20260616-002', 0, '2026-06-16 21:26:41', '2026-06-16 21:35:17'),
(20, 22, 'Capon', '1', 1, 1.00, 120.00, 125.00, 4.50, NULL, 120.50, '0022-20260623-001', 0, '2026-06-23 19:01:08', '2026-07-06 01:09:58'),
(21, 23, 'Capon', '2', 1, 1.00, 110.00, 115.00, 2.40, NULL, 112.60, '0023-20260623-002', 1, '2026-06-23 21:04:22', '2026-06-23 21:04:22'),
(22, 23, 'Capon', '3', 1, 1.00, 100.00, 98.00, 2.40, NULL, 95.60, '0023-20260623-003', 0, '2026-06-23 21:04:22', '2026-06-23 21:14:40'),
(23, 24, 'Capon', '1', 1, 1.00, 125.00, 159.00, 29.00, NULL, 130.00, '0024-20260628-001', 0, '2026-06-28 15:09:03', '2026-06-28 15:11:10'),
(24, 25, 'Capon', '1', 1, 1.00, 135.00, 159.00, 29.00, NULL, 130.00, '0025-20260628-001', 0, '2026-06-28 16:32:54', '2026-06-28 16:33:59'),
(25, 27, 'Capon', '2', 1, 1.00, 150.00, 149.00, 2.00, NULL, 147.00, '0027-20260629-002', 0, '2026-06-29 17:16:55', '2026-06-29 17:21:14'),
(26, 30, 'Capon', '2', 1, 1.00, 100.00, 102.00, 2.40, NULL, 99.60, '0030-20260708-002', 0, '2026-07-08 23:38:46', '2026-07-08 23:44:55');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `camara_romaneo_cuts`
--

CREATE TABLE `camara_romaneo_cuts` (
  `id` int(11) NOT NULL,
  `bill_supplier_id` int(11) NOT NULL,
  `product_name` varchar(120) NOT NULL,
  `quantity` decimal(10,2) NOT NULL DEFAULT 0.00,
  `heads` int(11) NOT NULL DEFAULT 0,
  `romaneo_weight` decimal(10,2) NOT NULL DEFAULT 0.00,
  `garron_number` int(11) NOT NULL DEFAULT 0,
  `unique_code` varchar(80) DEFAULT NULL,
  `a_camara` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `camara_romaneo_cuts`
--

INSERT INTO `camara_romaneo_cuts` (`id`, `bill_supplier_id`, `product_name`, `quantity`, `heads`, `romaneo_weight`, `garron_number`, `unique_code`, `a_camara`, `created_at`, `updated_at`) VALUES
(1, 28, 'Capon', 1.00, 1, 125.00, 4, '0028-20260630-002', 1, '2026-06-30 07:06:24', '2026-06-30 07:06:24'),
(2, 29, 'Capon', 1.00, 1, 124.00, 3, '0029-20260705-002', 0, '2026-07-06 00:32:16', '2026-07-06 00:34:33');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `clients`
--

CREATE TABLE `clients` (
  `id` int(11) NOT NULL,
  `client_name` varchar(255) NOT NULL,
  `client_type_id` varchar(255) NOT NULL,
  `client_id_number` varchar(20) NOT NULL,
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
(2, 'NORO AGUSTIN JOEL', 'CUIT', '20368992241', 'IVA RESPONSABLE INSCRIPTO', 'COMERCIAL@TREMNSRL.COM.AR', '1158057840	', 'AV.MITRE  2037		', 'ARGENTINA', 'BUENOS AIRES', 'BERAZATEGUI', 1, 1, 'EFECTIVO', '7 DIAS DE FECHA FACTURA'),
(3, 'ALEN', 'CUIT', '30578722986', 'IVA RESPONSABLE INSCRIPTO', 'COMERCIAL@TREMNSRL.COM.AR', '1151852875	', 'AV.EVA PERON 4112 ENTRE AV.12 DE OC,Y REP		', 'ARGENTINA', 'BUENOS AIRES', 'FLORENCIO VARELA', 1, 1, 'EFECTIVO', '7 DIAS DE FECHA FACTURA'),
(4, 'ALIMENTOS MORENO', 'CUIT', '30715160516', 'IVA RESPONSABLE INSCRIPTO', 'COMERCIAL@TREMNSRL.COM.AR', '...', '...', 'ARGENTINA', 'BUENOS AIRES', 'MORENO', 1, 1, 'EFECTIVO', '7 DIAS DE FECHA FACTURA'),
(5, 'AVICOLA BELGRANO', 'CUIT', '20296003671', 'IVA RESPONSABLE INSCRIPTO', 'COMERCIAL@TREMNSRL.COM.AR', '1128515161	', 'CAMINO GRAL.BELGRANO 2374		', 'ARGENTINA', 'BUENOS AIRES', 'MONTE CHINGOLO- LANUS	', 1, 1, 'EFECTIVO', '7 DIAS DE FECHA FACTURA'),
(6, 'BELLOTAS', 'CUIT', '20148249432', 'IVA RESPONSABLE INSCRIPTO', 'FRIGORIFICOLASBELLOTASARTE@GMAIL.COM', '1141958320	', 'LUIS CAMPOS 1024		', 'ARGENTINA', 'BUENOS AIRES', 'BERNAL', 1, 1, 'EFECTIVO', '7 DIAS DE FECHA FACTURA'),
(7, 'BOGS', 'CUIT', '30708521635', 'IVA RESPONSABLE INSCRIPTO', 'LEONARDONEGRETI@BOGS.COM.AR', '...', 'LUIS BRAILE 1434		', 'ARGENTINA', 'BUENOS AIRES', 'FLORENCIO VARELA', 1, 1, 'EFECTIVO', '7 DIAS DE FECHA FACTURA'),
(8, 'EL ANCLA', 'CUIT', '30684269093', 'IVA RESPONSABLE INSCRIPTO', 'DIEGOBUONO10@GMAIL.COM', '1122861755	', 'AV.SAN MARTIN 3153		', 'ARGENTINA', 'BUENOS AIRES', 'FLORENCIO VARELA', 1, 1, 'EFECTIVO', '7 DIAS DE FECHA FACTURA'),
(9, 'BIERZO', 'CUIT', '30505150372', 'IVA RESPONSABLE INSCRIPTO', 'DIEGOF@ELBIERZO.COM.AR', '...', 'BRAGADO 6745/81		', 'ARGENTINA', 'BUENOS AIRES', 'CABA', 1, 1, 'EFECTIVO', '7 DIAS DE FECHA FACTURA'),
(10, 'FRICH', 'CUIT', '27257784741', 'IVA RESPONSABLE INSCRIPTO', 'COMERCIAL@TREMNSRL.COM.AR', '...', '...', 'ARGENTINA', 'BUENOS AIRES', 'LUJAN', 1, 1, 'EFECTIVO', '7 DIAS DE FECHA FACTURA'),
(11, 'JERONA', 'CUIT', '30502557579', 'IVA RESPONSABLE INSCRIPTO', 'INFO@FRIGORIFICOJERONA.COM.AR', '...', '...', 'ARGENTINA', 'BUENOS AIRES', 'CABA', 1, 1, 'EFECTIVO', '7 DIAS DE FECHA FACTURA'),
(12, 'LEIZZA', 'CUIT', '271611280299', 'IVA RESPONSABLE INSCRIPTO', 'COMERCIAL@TREMNSRL.COM.AR', '...', '...', 'ARGENTINA', 'BUENOS AIRES', 'PILAR', 1, 1, 'EFECTIVO', '7 DIAS DE FECHA FACTURA'),
(13, 'OLIVENZA ', 'CUIT', '30717327671', 'IVA RESPONSABLE INSCRIPTO', 'MARIANOLIEVE@GMAIL.COM', '...', '...', 'ARGENTINA', 'BUENOS AIRES', 'CABA', 1, 1, 'EFECTIVO', '7 DIAS DE FECHA FACTURA'),
(14, 'PIRISMUNDI', 'CUIT', '30711972265', 'IVA RESPONSABLE INSCRIPTO', 'COMERCIAL@TREMNSRL.COM.AR', '...', '...', 'ARGENTINA', 'BUENOS AIRES', 'TORTUGUITAS', 1, 1, 'EFECTIVO', '7 DIAS DE FECHA FACTURA'),
(15, 'RANQUEL - VARELA', 'CUIT', '30712550364', 'IVA RESPONSABLE INSCRIPTO', 'COMERCIAL@TREMNSRL.COM.AR', '...', '...', 'ARGENTINA', 'BUENOS AIRES', 'FLORENCIO VARELA', 1, 1, 'EFECTIVO', '7 DIAS DE FECHA FACTURA'),
(16, 'RANQUEL - EZPELETA', 'CUIT', '30712550364', 'IVA RESPONSABLE INSCRIPTO', 'COMERCIAL@TREMNSRL.COM.AR', '...', '...', 'ARGENTINA', 'BUENOS AIRES', 'QUILMES', 1, 1, 'EFECTIVO', '7 DIAS DE FECHA FACTURA'),
(17, 'ROCCHETTI', 'CUIT', '20244394761', 'IVA RESPONSABLE INSCRIPTO', 'LIONELCARAMELO@GMAIL.COM', '...', '...', 'ARGENTINA', 'BUENOS AIRES', 'CABA', 1, 1, 'EFECTIVO', '7 DIAS DE FECHA FACTURA'),
(18, 'RUVIRA', 'CUIT', '27183499888', 'IVA RESPONSABLE INSCRIPTO', 'COMERCIAL@TREMNSRL.COM.AR', '...', 'AV.CONSTITUCION 3295	', 'ARGENTINA', 'BUENOS AIRES', 'PILAR', 1, 1, 'EFECTIVO', '7 DIAS DE FECHA FACTURA'),
(19, 'SABORES CAÑUELAS', 'CUIT', '30712162135', 'IVA RESPONSABLE INSCRIPTO', 'ADMINISTRACION@SABORESDECANUELAS.COM.AR', '...', 'GRAL.FREIRE 2028		', 'ARGENTINA', 'BUENOS AIRES', 'CAÑUELAS', 1, 1, 'EFECTIVO', '7 DIAS DE FECHA FACTURA'),
(20, 'VAES', 'CUIT', '33553547879', 'IVA RESPONSABLE INSCRIPTO', 'MLUNA@VAESSRL.COM.AR', '...', 'TAPALQUE 5926', 'ARGENTINA', 'BUENOS AIRES', 'MATADEROS', 1, 1, 'EFECTIVO', '7 DIAS DE FECHA FACTURA'),
(21, 'DALQUIE', 'CUIT', '20327808436', 'IVA RESPONSABLE INSCRIPTO', 'COMERCIAL@TREMNSRL.COM.AR', '3487664825	', 'MIGLIARO 1087		', 'ARGENTINA', 'BUENOS AIRES', 'CAPILLA DEL SEÑOR', 1, 1, 'EFECTIVO', '7 DIAS DE FECHA FACTURA'),
(22, 'BIANCO JUAN CARLOS', 'CUIT', '20206255464', 'IVA RESPONSABLE INSCRIPTO', 'JOSEFINARUGH@GMAIL.COM', '...', '...', 'ARGENTINA', 'BUENOS AIRES', 'SAN NICOLAS', 1, 1, 'EFECTIVO', '7 DIAS DE FECHA FACTURA'),
(23, 'RIS', 'CUIT', '30678224940', 'IVA RESPONSABLE INSCRIPTO', 'AFASOLIS@RISBIONUTRICION.COM.AR', '...', '...', 'ARGENTINA', 'BUENOS AIRES', 'VILLA ROSA', 1, 1, 'EFECTIVO', '7 DIAS DE FECHA FACTURA'),
(24, 'TRASLASIERRA', 'CUIT', '30717482499', 'IVA RESPONSABLE INSCRIPTO', 'ADMINISTRACION@TRASLASIERRA.COM.AR', '...', '...', 'ARGENTINA', 'BUENOS AIRES', 'SAN NICOLAS', 1, 1, 'EFECTIVO', '7 DIAS DE FECHA FACTURA'),
(25, 'AVIGLIANO', 'CUIT', '20272115574', 'IVA RESPONSABLE INSCRIPTO', 'AVIGLIANOCORTESPREMIUM@GMAIL.COM', '3416831296		', 'CHAPARRO 1221 ROSARIO		', 'ARGENTINA', 'SANTA FE', 'ROSARIO', 1, 1, 'EFECTIVO', '7 DIAS DE FECHA FACTURA'),
(26, 'BAGALONI', 'CUIT', '20361880146', 'IVA RESPONSABLE INSCRIPTO', 'COMERCIAL@TREMNSRL.COM.AR', '...', '...', 'ARGENTINA', 'SANTA FE', 'VILLA CONSTITUCION', 1, 1, 'EFECTIVO', '7 DIAS DE FECHA FACTURA'),
(27, 'DORONI', 'CUIT', '30562566798', 'IVA RESPONSABLE INSCRIPTO', 'FRIGDORONISRL@GMAIL.COM', '...', '...', 'ARGENTINA', 'SANTA FE', 'FIGHIERA', 1, 1, 'EFECTIVO', '7 DIAS DE FECHA FACTURA'),
(28, 'EL 73', 'CUIT', '30708195002', 'IVA RESPONSABLE INSCRIPTO', 'COMERCIAL@TREMNSRL.COM.AR', '...', '...', 'ARGENTINA', 'CÓRDOBA', 'NELSON', 1, 1, 'EFECTIVO', '7 DIAS DE FECHA FACTURA'),
(29, 'FIGHIERA', 'CUIT', '30710399375', 'IVA RESPONSABLE INSCRIPTO', 'FRIGORIFICOFIGHIERA64@YAHOO.COM.AR', '...', '...', 'ARGENTINA', 'SANTA FE', 'FIGHIERA', 1, 1, 'EFECTIVO', '7 DIAS DE FECHA FACTURA'),
(31, 'NATALI', 'CUIT', '30710774745', 'IVA RESPONSABLE INSCRIPTO', 'COMERCIAL@TREMNSRL.COM.AR', '...', '...', 'ARGENTINA', 'SANTA FE', 'ARROYO SECO', 1, 1, 'EFECTIVO', '7 DIAS DE FECHA FACTURA'),
(32, 'TRICER', 'CUIT', '30711989966', 'IVA RESPONSABLE INSCRIPTO', 'GERENCIA@TRICERSRL.COM', '...', '...', 'ARGENTINA', 'SANTA FE', 'ROSARIO', 1, 1, 'EFECTIVO', '7 DIAS DE FECHA FACTURA'),
(33, 'JUAN CARLOS', 'CUIT', '00000000', 'IVA RESPONSABLE INSCRIPTO', 'COMERCIAL@TREMNSRL.COM.AR', '...', '...', 'ARGENTINA', 'BUENOS AIRES', 'SAN NICOLAS', 1, 1, 'EFECTIVO', '7 DIAS DE FECHA FACTURA'),
(34, 'AVIGLIANO 2', 'CUIT', '00000000', 'IVA RESPONSABLE INSCRIPTO', 'COMERCIAL@TREMNSRL.COM.AR', '...', '...', 'ARGENTINA', 'SANTA FE', 'ROSARIO', 1, 1, 'EFECTIVO', '7 DIAS DE FECHA FACTURA'),
(35, 'BAGALONI 2', 'CUIT', '00000000', 'IVA RESPONSABLE INSCRIPTO', 'COMERCIAL@TREMNSRL.COM.AR', '...', '...', 'ARGENTINA', 'SANTA FE', 'VILLA CONSTITUCION', 1, 1, 'EFECTIVO', '7 DIAS DE FECHA FACTURA'),
(36, 'BELGRANO', 'CUIT', '00000000', 'IVA RESPONSABLE INSCRIPTO', 'COMERCIAL@TREMNSRL.COM.AR', '...', '...', 'ARGENTINA', 'BUENOS AIRES', 'BANFIELD', 1, 1, 'EFECTIVO', '7 DIAS DE FECHA FACTURA'),
(37, 'SEGAMARCHI', 'CUIT', '00000000', 'IVA RESPONSABLE INSCRIPTO', 'COMERCIAL@TREMNSRL.COM.AR', '...', '...', 'ARGENTINA', 'SANTA FE', 'ROSARIO', 1, 1, 'EFECTIVO', '7 DIAS DE FECHA FACTURA'),
(38, 'ARON', 'CUIT', '00000000', 'IVA RESPONSABLE INSCRIPTO', 'COMERCIAL@TREMNSRL.COM.AR', '...', '...', 'ARGENTINA', 'BUENOS AIRES', 'BERAZATEGUI', 1, 1, 'EFECTIVO', '7 DIAS DE FECHA FACTURA'),
(39, 'VIKY', 'CUIT', '00000000', 'IVA RESPONSABLE INSCRIPTO', 'COMERCIAL@TREMNSRL.COM.AR', '...', '...', 'ARGENTINA', 'SANTA FE', 'ROSARIO', 1, 1, 'EFECTIVO', '7 DIAS DE FECHA FACTURA'),
(40, 'DALQUIE 2', 'CUIT', '00000000', 'IVA RESPONSABLE INSCRIPTO', 'COMERCIAL@TREMNSRL.COM.AR', '...', '...', 'ARGENTINA', 'BUENOS AIRES', 'CAPILLA DEL SEÑOR', 1, 1, 'EFECTIVO', '7 DIAS DE FECHA FACTURA'),
(41, 'CARATTOLI', 'CUIT', '00000000', 'IVA RESPONSABLE INSCRIPTO', 'COMERCIAL@TREMNSRL.COM.AR', '...', '...', 'ARGENTINA', 'BUENOS AIRES', '...', 1, 1, 'EFECTIVO', '7 DIAS DE FECHA FACTURA'),
(42, 'PIRISMUNDI 2', 'CUIT', '00000000', 'IVA RESPONSABLE INSCRIPTO', 'COMERCIAL@TREMNSRL.COM.AR', '...', '...', 'ARGENTINA', 'BUENOS AIRES', 'TORTUGUITAS', 1, 1, 'EFECTIVO', '7 DIAS DE FECHA FACTURA'),
(43, 'INOCENTTI', 'CUIT', '00000000', 'IVA RESPONSABLE INSCRIPTO', 'COMERCIAL@TREMNSRL.COM.AR', '...', '...', 'ARGENTINA', 'BUENOS AIRES', 'MORENO', 1, 1, 'EFECTIVO', '7 DIAS DE FECHA FACTURA'),
(44, 'STOFLER', 'CUIT', '00000000', 'IVA RESPONSABLE INSCRIPTO', 'COMERCIAL@TREMNSRL.COM.AR', '...', '...', 'ARGENTINA', 'BUENOS AIRES', '...', 1, 1, 'EFECTIVO', '7 DIAS DE FECHA FACTURA'),
(45, 'MABEL', 'CUIT', '00000000', 'IVA RESPONSABLE INSCRIPTO', 'COMERCIAL@TREMNSRL.COM.AR', '...', '...', 'ARGENTINA', 'BUENOS AIRES', '...', 1, 1, 'EFECTIVO', '7 DIAS DE FECHA FACTURA'),
(46, 'TRASLASIERRA 2', 'CUIT', '00000000', 'IVA RESPONSABLE INSCRIPTO', 'COMERCIAL@TREMNSRL.COM.AR', '...', '...', 'ARGENTINA', 'BUENOS AIRES', 'SAN NICOLAS', 1, 1, 'EFECTIVO', '7 DIAS DE FECHA FACTURA'),
(47, 'PERSONAL', 'CUIT', '00000000', 'IVA RESPONSABLE INSCRIPTO', 'COMERCIAL@TREMNSRL.COM.AR', '...', '...', 'ARGENTINA', 'BUENOS AIRES', 'SAN NICOLAS', 1, 1, 'EFECTIVO', '7 DIAS DE FECHA FACTURA');

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
(1, 1, 1, 1, 'Cajon', 20, '0', 31.00, 1256.00, 1225.00, '2026-04-23 15:10:32', '2026-04-23 15:10:32'),
(2, 3, 2, 1, '', 5, '0', 26.50, 65.00, 38.50, '2026-04-28 20:58:05', '2026-04-28 20:58:05'),
(3, 3, 2, 2, '', 1, '0', 0.00, 0.00, 0.00, '2026-04-28 20:58:05', '2026-04-28 20:58:05'),
(4, 3, 2, 3, '', 1, '0', 0.00, 0.00, 0.00, '2026-04-28 20:58:05', '2026-04-28 20:58:05'),
(5, 3, 2, 4, '', 1, '0', 0.00, 0.00, 0.00, '2026-04-28 20:58:05', '2026-04-28 20:58:05'),
(6, 3, 2, 5, '', 1, '0', 0.00, 0.00, 0.00, '2026-04-28 20:58:05', '2026-04-28 20:58:05'),
(7, 3, 2, 6, '', 1, '0', 0.00, 0.00, 0.00, '2026-04-28 20:58:05', '2026-04-28 20:58:05'),
(8, 3, 3, 1, '', 2, '0', 27.00, 40.00, 13.00, '2026-04-28 20:58:05', '2026-04-28 20:58:05'),
(9, 5, 4, 1, '', 1, '0', 2.00, 11.00, 9.00, '2026-04-29 13:07:59', '2026-04-29 13:07:59');

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
(1, 1, '1', 'Pecho doble', 5800.00, 20, 20, 31.00, 1256.00, 1225.00, 61.25, 0, '2026-04-23 15:10:32', '2026-04-23 15:10:32'),
(2, 3, '1', 'Pecho doble', 5800.00, 5, 10, 26.50, 65.00, 38.50, 3.85, 0, '2026-04-28 20:58:05', '2026-04-28 20:58:05'),
(3, 3, '2', 'Carre', 5800.00, 2, 2, 27.00, 40.00, 13.00, 6.50, 0, '2026-04-28 20:58:05', '2026-04-28 20:58:05'),
(4, 5, '1', 'Pecho doble', 5800.00, 1, 1, 2.00, 11.00, 9.00, 9.00, 0, '2026-04-29 13:07:59', '2026-04-29 13:07:59'),
(5, 5, '1', 'Pecho doble', 5800.00, 1, 0, 0.00, 0.00, 0.00, 0.00, 1, '2026-04-29 13:07:59', '2026-04-29 13:07:59');

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
(1, 'Buenos aires', 1, '2026-04-29 13:15:28', '2026-04-29 13:15:28');

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
(1, 'Pablo', 'I', 1);

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
(1, 1, 1, 'BELLOTAS', 'AGUSTIN PRETTI', 'Lista premiun', 'EFECTIVO', '7 DIAS DE FECHA FACTURA', 'system', '', 20, 7105000.00, '2026-04-23 15:11:52', '2026-04-23 15:11:52'),
(2, 5, 5, 'BELLOTAS', 'AGUSTIN PRETTI', 'Lista premiun', 'EFECTIVO', '7 DIAS DE FECHA FACTURA', 'system', '', 4, 104400.00, '2026-04-29 13:13:01', '2026-04-29 13:13:01'),
(3, 3, 3, 'ALIMENTOS MORENO', 'AGUSTIN PRETTI', 'Lista premiun', 'EFECTIVO', '7 DIAS DE FECHA FACTURA', 'system', '', 7, 298700.00, '2026-04-29 13:13:11', '2026-04-29 13:13:11');

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
(1, 1, '1', 'Pecho doble', 5800.00, 20.00, 'KG', 1256.00, 1225.00, 61.25, '2026-04-23 15:11:52', '2026-04-23 15:11:52'),
(2, 2, '1', 'Pecho doble', 5800.00, 2.00, 'KG', 11.00, 9.00, 9.00, '2026-04-29 13:13:01', '2026-04-29 13:13:01'),
(3, 2, '1', 'Pecho doble', 5800.00, 2.00, 'KG', 11.00, 9.00, 9.00, '2026-04-29 13:13:01', '2026-04-29 13:13:01'),
(4, 3, '1', 'Pecho doble', 5800.00, 5.00, 'KG', 65.00, 38.50, 3.85, '2026-04-29 13:13:11', '2026-04-29 13:13:11'),
(5, 3, '2', 'Carre', 5800.00, 2.00, 'KG', 40.00, 13.00, 6.50, '2026-04-29 13:13:11', '2026-04-29 13:13:11');

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
(2, 2, 919.00, '2026-03-19 14:18:57', '2026-03-19 14:18:57'),
(3, 3, 870.00, '2026-03-19 17:11:20', '2026-03-19 17:11:20'),
(4, 4, 933.00, '2026-03-26 21:17:48', '2026-03-26 21:17:48'),
(5, 5, 112.60, '2026-03-30 10:51:55', '2026-03-30 10:51:55'),
(6, 6, 237.10, '2026-03-30 10:57:01', '2026-03-30 10:57:01'),
(7, 7, 569.60, '2026-04-16 12:49:06', '2026-04-16 12:49:06'),
(8, 8, 329.80, '2026-04-16 13:35:37', '2026-04-16 13:35:37'),
(9, 9, 297.80, '2026-04-23 14:02:37', '2026-04-23 14:02:37'),
(10, 10, 461.00, '2026-04-23 14:28:52', '2026-04-23 14:28:52'),
(11, 12, 1350.00, '2026-05-12 10:48:33', '2026-05-12 10:48:33'),
(12, 13, 682.40, '2026-05-12 11:12:02', '2026-05-12 11:12:02'),
(13, 14, 152.60, '2026-05-12 13:44:19', '2026-05-12 13:44:19'),
(14, 15, 200.90, '2026-05-12 16:30:11', '2026-05-12 16:30:11'),
(15, 18, 146.00, '2026-06-02 11:37:27', '2026-06-02 11:37:27'),
(16, 19, 286.00, '2026-06-02 22:20:50', '2026-06-02 22:27:00'),
(17, 20, 350.80, '2026-06-16 21:26:41', '2026-06-16 21:26:41'),
(18, 22, 263.50, '2026-06-23 19:01:08', '2026-06-23 19:01:08'),
(19, 23, 422.40, '2026-06-23 21:04:22', '2026-06-23 21:04:22'),
(20, 24, 251.00, '2026-06-28 15:09:03', '2026-06-28 15:09:03'),
(21, 25, 261.00, '2026-06-28 16:32:55', '2026-06-28 16:32:55'),
(22, 27, 354.00, '2026-06-29 17:16:55', '2026-06-29 17:16:55'),
(23, 30, 311.30, '2026-07-08 23:38:46', '2026-07-08 23:38:46');

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
  `tara_id` int(11) DEFAULT NULL,
  `net_weight` float NOT NULL,
  `decrease` decimal(8,2) DEFAULT NULL,
  `unique_code` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `meat_manual_income`
--

INSERT INTO `meat_manual_income` (`id`, `id_bill_suppliers`, `products_name`, `products_garron`, `products_quantity`, `product_head`, `provider_weight`, `gross_weight`, `tare`, `tara_id`, `net_weight`, `decrease`, `unique_code`) VALUES
(2, 2, 'Capon', 1, '1', 1, 95, 95, 2.4, NULL, 92.6, -2.53, '0002-20260319-001'),
(3, 2, 'Capon', 2, '1', 1, 88, 89, 2.4, NULL, 86.6, -1.59, '0002-20260319-002'),
(4, 2, 'Capon', 3, '1', 1, 90, 93, 2.4, NULL, 90.6, 0.67, '0002-20260319-003'),
(5, 2, 'Capon', 4, '1', 1, 101, 100, 2.4, NULL, 97.6, -3.37, '0002-20260319-004'),
(6, 2, 'Capon', 5, '1', 1, 110, 112, 2.4, NULL, 109.6, -0.36, '0002-20260319-005'),
(7, 2, 'Capon', 6, '1', 1, 97, 97, 2.4, NULL, 94.6, -2.47, '0002-20260319-006'),
(8, 2, 'Capon', 7, '1', 1, 75, 79, 2.4, NULL, 76.6, 2.13, '0002-20260319-007'),
(9, 2, 'Capon', 8, '1', 1, 80, 84, 2.4, NULL, 81.6, 2.00, '0002-20260319-008'),
(10, 2, 'Capon', 9, '1', 1, 100, 99, 2.4, NULL, 96.6, -3.40, '0002-20260319-009'),
(11, 2, 'Capon', 10, '1', 1, 92, 95, 2.4, NULL, 92.6, 0.65, '0002-20260319-010'),
(12, 3, 'Capon', 11, '1', 1, 102, 105, 2.4, NULL, 102.6, 0.59, '0003-20260319-001'),
(13, 3, 'Capon', 12, '1', 1, 64, 65, 2.4, NULL, 62.6, -2.19, '0003-20260319-002'),
(14, 3, 'Capon', 13, '1', 1, 83, 83, 2.4, NULL, 80.6, -2.89, '0003-20260319-003'),
(15, 3, 'Capon', 14, '1', 1, 80, 83, 2.4, NULL, 80.6, 0.75, '0003-20260319-004'),
(16, 3, 'Capon', 15, '1', 1, 95, 97, 2.4, NULL, 94.6, -0.42, '0003-20260319-005'),
(17, 3, 'Capon', 16, '1', 1, 95, 96, 2.4, NULL, 93.6, -1.47, '0003-20260319-006'),
(18, 3, 'Capon', 17, '1', 1, 100, 105, 2.4, NULL, 102.6, 2.60, '0003-20260319-007'),
(19, 3, 'Capon', 18, '1', 1, 91, 92, 2.4, NULL, 89.6, -1.54, '0003-20260319-008'),
(20, 3, 'Capon', 19, '1', 1, 89, 89, 2.4, NULL, 86.6, -2.70, '0003-20260319-009'),
(21, 3, 'Capon', 20, '1', 1, 77, 79, 2.4, NULL, 76.6, -0.52, '0003-20260319-010'),
(22, 4, 'Capon', 21, '1', 1, 100, 102, 2.4, NULL, 99.6, -0.40, '0004-20260326-001'),
(23, 4, 'Capon', 22, '1', 1, 89, 89, 2.4, NULL, 86.6, -2.70, '0004-20260326-002'),
(24, 4, 'Capon', 23, '1', 1, 93, 94, 2.4, NULL, 91.6, -1.51, '0004-20260326-003'),
(25, 4, 'Capon', 24, '1', 1, 90, 91, 2.4, NULL, 88.6, -1.56, '0004-20260326-004'),
(26, 4, 'Capon', 25, '1', 1, 95, 98, 2.4, NULL, 95.6, 0.63, '0004-20260326-005'),
(27, 4, 'Capon', 26, '1', 1, 110, 109, 2.4, NULL, 106.6, -3.09, '0004-20260326-006'),
(28, 4, 'Capon', 27, '1', 1, 88, 88, 2.4, NULL, 85.6, -2.73, '0004-20260326-007'),
(29, 4, 'Capon', 28, '1', 1, 79, 80, 2.4, NULL, 77.6, -1.77, '0004-20260326-008'),
(30, 4, 'Capon', 29, '1', 1, 100, 100, 2.4, NULL, 97.6, -2.40, '0004-20260326-009'),
(31, 4, 'Capon', 30, '1', 1, 105, 106, 2.4, NULL, 103.6, -1.33, '0004-20260326-010'),
(32, 5, 'Capon', 10, '1', 1, 115, 116, 3.4, NULL, 112.6, -2.09, '0005-20260330-001'),
(33, 6, 'Capon', 10, '1', 1, 120, 125, 3.4, NULL, 121.6, 1.33, '0006-20260330-001'),
(34, 6, 'Capon', 15, '1', 1, 130, 120, 4.5, NULL, 115.5, -11.15, '0006-20260330-002'),
(35, 7, 'Capon', 1, '1', 1, 95, 98, 2.4, NULL, 95.6, 0.63, '0007-20260416-001'),
(36, 7, 'Capon', 2, '1', 1, 85, 86, 2.4, NULL, 83.6, -1.65, '0007-20260416-002'),
(37, 7, 'Capon', 3, '1', 1, 100, 100, 2.4, NULL, 97.6, -2.40, '0007-20260416-003'),
(38, 7, 'Capon', 4, '1', 1, 105, 109, 2.4, NULL, 106.6, 1.52, '0007-20260416-004'),
(39, 7, 'Capon', 5, '1', 1, 88, 90, 2.4, NULL, 87.6, -0.45, '0007-20260416-005'),
(40, 7, 'Capon', 6, '1', 1, 99, 101, 2.4, NULL, 98.6, -0.40, '0007-20260416-006'),
(41, 8, 'Capon', 1, '1', 1, 100, 105, 2.4, NULL, 102.6, 2.60, '0008-20260416-001'),
(42, 8, 'Capon', 2, '1', 1, 103, 106, 2.4, NULL, 103.6, 0.58, '0008-20260416-002'),
(43, 8, 'Capon', 4, '1', 1, 130, 126, 2.4, NULL, 123.6, -4.92, '0008-20260416-003'),
(44, 9, 'Capon', 1, '1', 1, 95, 96, 2.4, NULL, 93.6, -1.47, '0009-20260423-001'),
(45, 9, 'Capon', 2, '1', 1, 100, 102, 2.4, NULL, 99.6, -0.40, '0009-20260423-002'),
(46, 9, 'Capon', 3, '1', 1, 105, 107, 2.4, NULL, 104.6, -0.38, '0009-20260423-003'),
(47, 10, 'Capon', 1, '1', 1, 95, 95, 2.4, NULL, 92.6, -2.53, '0010-20260423-001'),
(48, 10, 'Capon', 2, '1', 1, 100, 103, 2.4, NULL, 100.6, 0.60, '0010-20260423-002'),
(49, 10, 'Capon', 3, '1', 1, 98, 98, 2.4, NULL, 95.6, -2.45, '0010-20260423-003'),
(50, 10, 'Capon', 4, '1', 1, 75, 77, 2.4, NULL, 74.6, -0.53, '0010-20260423-004'),
(51, 10, 'Capon', 5, '1', 1, 100, 100, 2.4, NULL, 97.6, -2.40, '0010-20260423-005'),
(52, 12, 'Capon', 10, '1', 1, 1350, 1379, 29, NULL, 1350, 0.00, '0012-20260512-001'),
(53, 13, 'Capon', 1, '1', 1, 170, 175, 3.4, NULL, 171.6, 0.94, '0013-20260512-001'),
(54, 13, 'Capon', 2, '1', 1, 165, 172, 2, NULL, 170, 3.03, '0013-20260512-002'),
(55, 13, 'Capon', 3, '1', 1, 163, 170, 0.1, NULL, 169.9, 4.23, '0013-20260512-003'),
(56, 13, 'Capon', 4, '1', 1, 164, 171, 0.1, NULL, 170.9, 4.21, '0013-20260512-004'),
(57, 14, 'Capon', 1, '1', 1, 150, 156, 3.4, NULL, 152.6, 1.73, '0014-20260512-001'),
(58, 15, 'Capon', 150, '1', 1, 100, 102, 2, NULL, 100, 0.00, '0015-20260512-001'),
(59, 15, 'Capon', 101, '1', 1, 105, 101, 0.1, NULL, 100.9, -3.90, '0015-20260512-002'),
(60, 18, 'Capon', 1, '1', 1, 150, 148, 2, NULL, 146, -2.67, '0018-20260602-001'),
(63, 19, 'Capon', 12, '1', 1, 145, 150, 2, NULL, 148, 0.00, '0019-20260602-002'),
(64, 19, 'Capon', 1, '1', 1, 137, 140, 2, NULL, 138, 0.73, '0019-20260602-003'),
(65, 20, 'Capon', 1, '1', 1, 150, 154, 2.4, NULL, 151.6, 1.07, '0020-20260616-001'),
(66, 20, 'Capon', 1, '1', 1, 100, 105, 2.4, NULL, 102.6, 2.60, '0020-20260616-002'),
(67, 20, 'Capon', 1, '1', 1, 98, 99, 2.4, NULL, 96.6, -1.43, '0020-20260616-003'),
(68, 22, 'Capon', 1, '1', 1, 120, 125, 4.5, 79, 120.5, 0.42, '0022-20260623-001'),
(69, 22, 'Capon', 1, '1', 1, 130, 145, 2, 25, 143, 10.00, '0022-20260623-002'),
(70, 23, 'Capon', 1, '1', 1, 120, 123, 2.4, 23, 120.6, 0.50, '0023-20260623-001'),
(71, 23, 'Capon', 2, '1', 1, 110, 115, 2.4, 23, 112.6, 2.36, '0023-20260623-002'),
(72, 23, 'Capon', 3, '1', 1, 100, 98, 2.4, 23, 95.6, -4.40, '0023-20260623-003'),
(73, 23, 'Capon', 4, '1', 1, 100, 96, 2.4, 23, 93.6, -6.40, '0023-20260623-004'),
(74, 24, 'Capon', 1, '1', 1, 125, 159, 29, 1, 130, 4.00, '0024-20260628-001'),
(75, 24, 'Capon', 1, '1', 1, 110, 150, 29, 1, 121, 10.00, '0024-20260628-002'),
(76, 25, 'Capon', 1, '1', 1, 135, 159, 29, 1, 130, -3.70, '0025-20260628-001'),
(77, 25, 'Capon', 1, '1', 1, 135, 160, 29, 1, 131, -2.96, '0025-20260628-002'),
(78, 27, 'Capon', 1, '1', 1, 100, 105, 2, 25, 103, 3.00, '0027-20260629-001'),
(79, 27, 'Capon', 2, '1', 1, 150, 149, 2, 25, 147, -2.00, '0027-20260629-002'),
(80, 27, 'Capon', 3, '1', 1, 100, 106, 2, 25, 104, 4.00, '0027-20260629-003'),
(81, 30, 'Capon', 1, '1', 1, 120, 125, 2.4, 23, 122.6, 2.17, '0030-20260708-001'),
(82, 30, 'Capon', 2, '1', 1, 100, 102, 2.4, 23, 99.6, -0.40, '0030-20260708-002'),
(83, 30, 'Capon', 3, '1', 1, 90, 91.5, 2.4, 23, 89.1, -1.00, '0030-20260708-003');

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
(1, '2026-04-24', 'BELLOTAS', 'AGUSTIN PRETTI', 'Lista premiun', 'EFECTIVO', '7 DIAS DE FECHA FACTURA', '32r23rt', 1, 1, '2026-04-23 14:55:36', '2026-04-23 15:10:38'),
(2, '2026-04-24', 'BELLOTAS', 'AGUSTIN PRETTI', 'Lista premiun', 'EFECTIVO', '7 DIAS DE FECHA FACTURA', '', 0, 0, '2026-04-23 14:57:10', '2026-04-23 14:57:10'),
(3, '2026-04-29', 'ALIMENTOS MORENO', 'AGUSTIN PRETTI', 'Lista premiun', 'EFECTIVO', '7 DIAS DE FECHA FACTURA', '', 1, 1, '2026-04-28 20:50:40', '2026-04-28 20:58:12'),
(5, '2026-04-30', 'BELLOTAS', 'AGUSTIN PRETTI', 'Lista premiun', 'EFECTIVO', '7 DIAS DE FECHA FACTURA', '', 1, 1, '2026-04-29 13:04:08', '2026-04-29 13:08:02'),
(6, '2026-04-29', 'BELLOTAS', 'AGUSTIN PRETTI', 'Lista premiun', 'EFECTIVO', '7 DIAS DE FECHA FACTURA', '', 0, 0, '2026-04-29 13:10:09', '2026-04-29 13:10:09');

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
(2, ''),
(3, ''),
(4, ''),
(5, 'prueba'),
(6, 'prueba'),
(7, ''),
(8, ''),
(9, ''),
(10, ''),
(12, ''),
(13, 'prueba'),
(14, 'prueba 2'),
(15, 'prueba 3'),
(18, 'prueba'),
(19, ''),
(20, 'prueba'),
(21, 'prueba'),
(22, ''),
(23, ''),
(24, ''),
(25, ''),
(27, ''),
(30, 'pruebaaaaa');

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
(1, 1, '1', 'Pecho doble', 5800.00, 20.00, 'UN'),
(2, 2, '1', 'Pecho doble', 5800.00, 10.00, 'UN'),
(3, 3, '1', 'Pecho doble', 5800.00, 5.00, 'UN'),
(4, 3, '2', 'Carre', 5800.00, 2.00, 'UN'),
(10, 5, '1', 'Pecho doble', 5800.00, 1.00, 'UN'),
(11, 6, '5', 'Capon', 0.00, 1.00, 'UN');

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
(1, 'AL DIA'),
(2, 'CONTRA FACTURA'),
(3, '7 DIAS DE FECHA FACTURA'),
(4, '14 DIAS DE FECHA FACTURA'),
(5, '30 DIAS DE FECHA FACTURA'),
(6, 'CUENTA CORRIENTE - MAYOR A 30 DIAS');

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
  `missing_units` decimal(12,3) NOT NULL DEFAULT 0.000,
  `note` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
(6, 1, 'Lista premiun', 3),
(7, 1, 'Lista premiun', 4),
(8, 1, 'Lista premiun', 6),
(9, 2, 'Ranqueles', 16),
(10, 2, 'Ranqueles', 15);

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
(57, 1, 1, 'Pecho doble', 'KG', 5600.00, 4566.93, 5800.00),
(58, 1, 2, 'Carre', 'KG', 0.00, 5800.00, 5800.00),
(59, 1, 3, 'Jamon', 'KG', 0.00, 0.00, 0.00),
(60, 1, 4, 'Paletas', 'KG', 0.00, 0.00, 0.00),
(61, 1, 5, 'Capon', 'KG', 0.00, 0.00, 0.00),
(62, 1, 6, 'Cabezas', 'KG', 0.00, 0.00, 0.00),
(63, 1, 300, 'Bondiola', 'KG', 0.00, 0.00, 0.00),
(64, 1, 305, 'Jamon tubo', 'KG', 0.00, 0.00, 0.00),
(65, 1, 400, 'Tapa', 'KG', 0.00, 0.00, 0.00),
(66, 1, 600, 'Carne cabeza', 'KG', 0.00, 0.00, 0.00),
(67, 1, 900, 'Churrasco', 'KG', 0.00, 0.00, 0.00),
(68, 1, 1300, 'Cuero', 'KG', 0.00, 4500.00, 4500.00),
(69, 1, 1600, 'Grasa', 'KG', 0.00, 38700.00, 38700.00),
(70, 1, 1700, 'Huesos', 'KG', 0.00, 0.00, 0.00),
(71, 1, 2100, 'Lengua', 'KG', 0.00, 0.00, 0.00),
(72, 1, 2200, 'Matambre', 'KG', 0.00, 0.00, 0.00),
(73, 1, 3200, 'Patas', 'KG', 0.00, 0.00, 0.00),
(74, 1, 3301, 'Pecho simple', 'KG', 0.00, 0.00, 0.00),
(75, 1, 3302, 'Pecho simple + matambre', 'KG', 0.00, 0.00, 0.00),
(76, 1, 3900, 'Recortes', 'KG', 0.00, 0.00, 0.00),
(77, 1, 4100, 'Tocino', 'KG', 0.00, 0.00, 0.00),
(78, 1, 10106, 'Jamon crudo', 'KG', 0.00, 0.00, 0.00),
(79, 1, 10108, 'Unto', 'KG', 0.00, 0.00, 0.00),
(80, 1, 14401, 'Codillo', 'KG', 0.00, 0.00, 0.00),
(81, 1, 15000, 'Churrasco papada', 'KG', 0.00, 0.00, 0.00),
(82, 1, 17000, 'Anqueta', 'KG', 0.00, 0.00, 0.00),
(83, 1, 17001, 'Pulpa jamón 5M', 'KG', 0.00, 0.00, 0.00),
(84, 1, 17002, 'Pulpa paleta S/P', 'KG', 0.00, 0.00, 0.00),
(85, 2, 1, 'Pecho doble', 'KG', 0.00, 5690.00, 6287.45),
(86, 2, 2, 'Carre', 'KG', 0.00, 5690.00, 6287.45),
(87, 2, 3, 'Jamon', 'KG', 0.00, 44100.00, 48730.50),
(88, 2, 4, 'Paletas', 'KG', 0.00, 37100.00, 40995.50),
(89, 2, 5, 'Capon', 'KG', 0.00, 3780.00, 4176.90),
(90, 2, 6, 'Cabezas', 'KG', 0.00, 26700.00, 33909.00),
(91, 2, 300, 'Bondiola', 'KG', 0.00, 68400.00, 86868.00),
(92, 2, 305, 'Jamon tubo', 'KG', 0.00, 0.00, 0.00),
(93, 2, 400, 'Tapa', 'KG', 0.00, 920.00, 1168.40),
(94, 2, 600, 'Carne cabeza', 'KG', 0.00, 0.00, 0.00),
(95, 2, 900, 'Churrasco', 'KG', 0.00, 8640.00, 10972.80),
(96, 2, 1300, 'Cuero', 'KG', 0.00, 745.00, 946.15),
(97, 2, 1600, 'Grasa', 'KG', 0.00, 920.00, 1168.40),
(98, 2, 1700, 'Huesos', 'KG', 0.00, 580.00, 736.60),
(99, 2, 2100, 'Lengua', 'KG', 0.00, 1870.00, 2374.90),
(100, 2, 2200, 'Matambre', 'KG', 0.00, 8860.00, 11252.20),
(101, 2, 3200, 'Patas', 'KG', 0.00, 580.00, 736.60),
(102, 2, 3301, 'Pecho simple', 'KG', 0.00, 5690.00, 7226.30),
(103, 2, 3302, 'Pecho simple + matambre', 'KG', 0.00, 5690.00, 7226.30),
(104, 2, 3900, 'Recortes', 'KG', 0.00, 3610.00, 4584.70),
(105, 2, 4100, 'Tocino', 'KG', 0.00, 1720.00, 2184.40),
(106, 2, 10106, 'Jamon crudo', 'KG', 0.00, 0.00, 0.00),
(107, 2, 10108, 'Unto', 'KG', 0.00, 610.00, 774.70),
(108, 2, 14401, 'Codillo', 'KG', 0.00, 2095.00, 2660.65),
(109, 2, 15000, 'Churrasco papada', 'KG', 0.00, 0.00, 0.00),
(110, 2, 17000, 'Anqueta', 'KG', 0.00, 1980.00, 2514.60),
(111, 2, 17001, 'Pulpa jamón 5M', 'KG', 0.00, 0.00, 0.00),
(112, 2, 17002, 'Pulpa paleta S/P', 'KG', 0.00, 4900.00, 6223.00);

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
(1, 'Pecho doble', 5.45, 20, 138, 29, 109, 1, '2026-03-19 14:57:31', '2026-03-19 14:57:31'),
(2, 'Carre', 4.22, 20, 114, 29.5, 84.5, 1, '2026-03-19 14:57:31', '2026-03-19 14:57:31'),
(3, 'Jamon', 10.68, 20, 240, 26.5, 213.5, 1, '2026-03-19 14:57:31', '2026-03-19 14:57:31'),
(4, 'Paletas', 5.65, 20, 140, 27, 113, 1, '2026-03-19 14:57:31', '2026-03-19 14:57:31'),
(5, 'Cabezas', 5.35, 10, 80, 26.5, 53.5, 1, '2026-03-19 14:57:31', '2026-03-19 14:57:31'),
(6, 'Bondiola', 1.99, 20, 40, 0.1, 39.9, 1, '2026-03-19 14:57:31', '2026-03-19 14:57:31'),
(7, 'Tapa', 0, 0, 6, 2, 4, 1, '2026-03-19 14:57:31', '2026-03-19 14:57:31'),
(8, 'Churrasco', 0, 0, 60, 53.5, 6.5, 1, '2026-03-19 14:57:31', '2026-03-19 14:57:31'),
(9, 'Cuero', 0, 0, 400, 39, 361, 1, '2026-03-19 14:57:31', '2026-03-19 14:57:31'),
(10, 'Grasa', 0, 0, 400, 39.5, 360.5, 1, '2026-03-19 14:57:31', '2026-03-19 14:57:31'),
(11, 'Huesos', 0, 0, 350, 32.5, 317.5, 1, '2026-03-19 14:57:31', '2026-03-19 14:57:31'),
(12, 'Lengua', 0, 0, 1.5, 0.1, 1.4, 1, '2026-03-19 14:57:31', '2026-03-19 14:57:31'),
(13, 'Recortes', 0, 0, 100, 32.5, 67.5, 1, '2026-03-19 14:57:31', '2026-03-19 14:57:31'),
(14, 'Patas', 0.12, 40, 5, 0.1, 4.9, 1, '2026-03-19 14:57:31', '2026-03-19 14:57:31'),
(15, 'Churrasco papada', 0, 0, 60, 34, 26, 1, '2026-03-19 14:57:31', '2026-03-19 14:57:31'),
(16, 'Pecho doble', 5.85, 20, 150, 33, 117, 2, '2026-03-19 17:40:23', '2026-03-19 17:40:23'),
(17, 'Carre', 4.17, 20, 110, 26.5, 83.5, 2, '2026-03-19 17:40:23', '2026-03-19 17:40:23'),
(18, 'Jamon', 12.65, 20, 280, 27, 253, 2, '2026-03-19 17:40:23', '2026-03-19 17:40:23'),
(19, 'Paletas', 6.35, 20, 160, 33, 127, 2, '2026-03-19 17:40:23', '2026-03-19 17:40:23'),
(20, 'Cabezas', 3.1, 10, 70, 39, 31, 2, '2026-03-19 17:40:23', '2026-03-19 17:40:23'),
(21, 'Bondiola', 1.6, 20, 60, 28, 32, 2, '2026-03-19 17:40:23', '2026-03-19 17:40:23'),
(22, 'Tapa', 0, 0, 10, 0.1, 9.9, 2, '2026-03-19 17:40:23', '2026-03-19 17:40:23'),
(23, 'Churrasco', 0, 0, 80, 31, 49, 2, '2026-03-19 17:40:23', '2026-03-19 17:40:23'),
(24, 'Cuero', 0, 0, 350, 38, 312, 2, '2026-03-19 17:40:23', '2026-03-19 17:40:23'),
(25, 'Grasa', 0, 0, 400, 33, 367, 2, '2026-03-19 17:40:23', '2026-03-19 17:40:23'),
(26, 'Huesos', 0, 0, 480, 38.5, 441.5, 2, '2026-03-19 17:40:23', '2026-03-19 17:40:23'),
(27, 'Lengua', 0, 0, 2, 0.1, 1.9, 2, '2026-03-19 17:40:23', '2026-03-19 17:40:23'),
(28, 'Recortes', 0, 0, 1000, 38.5, 961.5, 2, '2026-03-19 17:40:23', '2026-03-19 17:40:23'),
(29, 'Patas', 0.2, 40, 8, 0.1, 7.9, 2, '2026-03-19 17:40:23', '2026-03-19 17:40:23'),
(30, 'Churrasco papada', 0, 0, 70, 31, 39, 2, '2026-03-19 17:40:23', '2026-03-19 17:40:23'),
(41, 'Jamon', 12.85, 14, 215.9, 36, 179.9, 3, '2026-04-03 18:07:16', '2026-04-03 18:07:16'),
(42, 'Paletas', 7.16, 14, 137.24, 37, 100.24, 3, '2026-04-03 18:07:16', '2026-04-03 18:07:16'),
(43, 'Pecho doble', 7.05, 14, 127.7, 29, 98.7, 3, '2026-04-03 18:07:16', '2026-04-03 18:07:16'),
(44, 'Carre', 6.06, 14, 117.84, 33, 84.84, 3, '2026-04-03 18:07:16', '2026-04-03 18:07:16'),
(45, 'Bondiola', 2.36, 14, 83.54, 50.5, 33.04, 3, '2026-04-03 18:07:16', '2026-04-03 18:07:16'),
(46, 'Pecho doble', 6.58, 6, 69, 29.5, 39.5, 4, '2026-04-16 13:23:14', '2026-04-16 13:23:14'),
(47, 'Carre', 5.17, 6, 60, 29, 31, 4, '2026-04-16 13:23:14', '2026-04-16 13:23:14'),
(48, 'Pecho doble', 9, 2, 20, 2, 18, 5, '2026-04-16 13:41:22', '2026-04-16 13:41:22'),
(49, 'Carre', 11.3, 2, 25, 2.4, 22.6, 5, '2026-04-16 13:41:22', '2026-04-16 13:41:22'),
(50, 'Jamon', 16.5, 2, 35, 2, 33, 5, '2026-04-16 13:41:22', '2026-04-16 13:41:22'),
(51, 'Pecho doble', 10.75, 4, 45, 2, 43, 5, '2026-04-16 13:41:22', '2026-04-16 13:41:22'),
(52, 'Carre', 10, 4, 42, 2, 40, 5, '2026-04-16 13:41:22', '2026-04-16 13:41:22'),
(53, 'Jamon', 20.75, 4, 85, 2, 83, 5, '2026-04-16 13:41:22', '2026-04-16 13:41:22'),
(54, 'Pecho doble', 13, 4, 85, 33, 52, 6, '2026-04-23 14:12:37', '2026-04-23 14:12:37'),
(55, 'Pecho doble', 11.8, 10, 120, 2, 118, 6, '2026-04-23 14:20:06', '2026-04-23 14:20:06'),
(56, 'Cabezas', 18.6, 5, 100, 7, 93, 6, '2026-04-23 14:20:06', '2026-04-23 14:20:06'),
(57, 'Jamon', 4.66, 10, 50, 3.4, 46.6, 6, '2026-04-23 14:20:06', '2026-04-23 14:20:06'),
(58, 'Jamon', 11.66, 10, 120, 3.4, 116.6, 6, '2026-04-23 14:30:08', '2026-04-23 14:30:08'),
(59, 'Pecho doble', 11.66, 10, 120, 3.4, 116.6, 7, '2026-04-23 15:01:46', '2026-04-23 15:01:46'),
(60, 'Grasa', 0, 0, 20, 0.1, 19.9, 7, '2026-05-12 05:06:37', '2026-05-12 05:06:37'),
(61, 'Huesos', 0, 0, 100, 7, 93, 7, '2026-05-12 10:50:17', '2026-05-12 10:50:17'),
(62, 'Pecho doble', 9, 2, 20, 2, 18, 7, '2026-06-02 22:16:18', '2026-06-02 22:16:18'),
(63, 'Carre', 11.5, 2, 25, 2, 23, 7, '2026-06-02 22:16:18', '2026-06-02 22:16:18'),
(64, 'Jamon', 11.5, 2, 25, 2, 23, 7, '2026-06-02 22:16:18', '2026-06-02 22:16:18'),
(65, 'Pecho doble', 11.5, 2, 25, 2, 23, 7, '2026-06-02 22:16:18', '2026-06-02 22:16:18'),
(66, 'Tapa', 0, 0, 10, 2, 8, 7, '2026-06-02 22:16:18', '2026-06-02 22:16:18'),
(67, 'Pecho doble', 11.5, 2, 25, 2, 23, 8, '2026-06-02 22:18:46', '2026-06-02 22:18:46'),
(68, 'Jamon', 19, 2, 40, 2, 38, 8, '2026-06-02 22:18:46', '2026-06-02 22:18:46'),
(69, 'Pecho doble', 9.5, 4, 40, 2, 38, 9, '2026-06-02 22:30:19', '2026-06-02 22:30:19'),
(70, 'Jamon', 10.75, 4, 45, 2, 43, 9, '2026-06-02 22:30:19', '2026-06-02 22:30:19'),
(71, 'Pecho doble', 9.5, 4, 40, 2, 38, 10, '2026-06-16 21:35:17', '2026-06-16 21:35:17'),
(72, 'Cabezas', 5.5, 2, 13, 2, 11, 10, '2026-06-16 21:35:17', '2026-06-16 21:35:17'),
(73, 'Grasa', 0, 0, 10, 2, 8, 10, '2026-06-16 21:35:17', '2026-06-16 21:35:17'),
(74, 'Pecho doble', 11.5, 2, 25, 2, 23, 10, '2026-06-16 21:35:17', '2026-06-16 21:35:17'),
(75, 'Pecho doble', 9.33, 6, 58, 2, 56, 11, '2026-06-23 21:14:40', '2026-06-23 21:14:40'),
(76, 'Carre', 10.5, 6, 65, 2, 63, 11, '2026-06-23 21:14:40', '2026-06-23 21:14:40'),
(77, 'Cabezas', 4.67, 3, 16, 2, 14, 11, '2026-06-23 21:14:40', '2026-06-23 21:14:40'),
(78, 'Pecho doble', 100, 1, 127, 27, 100, 12, '2026-06-28 15:11:10', '2026-06-28 15:11:10'),
(79, 'Bondiola', 100, 1, 129.5, 29.5, 100, 12, '2026-06-28 15:11:10', '2026-06-28 15:11:10'),
(80, 'Pecho doble', 100, 1, 129, 29, 100, 13, '2026-06-28 16:33:59', '2026-06-28 16:33:59'),
(81, 'Bondiola', 100, 1, 129, 29, 100, 13, '2026-06-28 16:33:59', '2026-06-28 16:33:59'),
(82, 'Pecho doble', 9.67, 6, 60, 2, 58, 14, '2026-06-29 17:21:14', '2026-06-29 17:21:14'),
(83, 'Carre', 12.17, 6, 75, 2, 73, 14, '2026-06-29 17:21:14', '2026-06-29 17:21:14'),
(84, 'Pecho doble', 46.6, 1, 50, 3.4, 46.6, 15, '2026-06-30 07:09:08', '2026-06-30 07:09:08'),
(85, 'Bondiola', 68, 1, 70, 2, 68, 15, '2026-06-30 07:09:08', '2026-06-30 07:09:08'),
(86, 'Jamon', 21, 1, 50, 29, 21, 16, '2026-07-06 00:34:33', '2026-07-06 00:34:33'),
(87, 'Pecho simple', 30.5, 1, 60, 29.5, 30.5, 16, '2026-07-06 00:34:33', '2026-07-06 00:34:33'),
(88, 'Jamon', 71, 1, 100, 29, 71, 16, '2026-07-06 01:09:58', '2026-07-06 01:09:58'),
(89, 'Pecho doble', 9.67, 6, 60, 2, 58, 17, '2026-07-08 23:44:55', '2026-07-08 23:44:55'),
(90, 'Carre', 10.83, 6, 67, 2, 65, 17, '2026-07-08 23:44:55', '2026-07-08 23:44:55');

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
(2, 2, 3),
(5, 3, 4),
(6, 4, 7),
(7, 5, 8),
(8, 6, 10),
(9, 7, 15),
(10, 8, 18),
(11, 9, 19),
(12, 10, 20),
(13, 11, 23),
(14, 12, 24),
(15, 13, 25),
(16, 14, 27),
(17, 15, 28),
(18, 16, 29),
(19, 17, 30);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productionprocess_subproduction`
--

CREATE TABLE `productionprocess_subproduction` (
  `id` int(11) NOT NULL,
  `process_number` int(11) NOT NULL,
  `cut_name` varchar(120) NOT NULL,
  `quantity` decimal(12,3) NOT NULL DEFAULT 0.000,
  `weight` decimal(12,3) NOT NULL DEFAULT 0.000,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `productionprocess_subproduction`
--

INSERT INTO `productionprocess_subproduction` (`id`, `process_number`, `cut_name`, `quantity`, `weight`, `created_at`, `updated_at`) VALUES
(5, 3, 'Paletas', 6.000, 60.000, '2026-04-03 18:07:16', '2026-04-03 18:07:16'),
(6, 3, 'Jamon', 6.000, 72.000, '2026-04-03 18:07:16', '2026-04-03 18:07:16'),
(7, 3, 'Carre', 6.000, 27.000, '2026-04-03 18:07:16', '2026-04-03 18:07:16'),
(8, 3, 'Pecho doble', 6.000, 42.000, '2026-04-03 18:07:16', '2026-04-03 18:07:16'),
(9, 3, 'Capon', 3.000, 349.700, '2026-04-03 18:07:16', '2026-04-03 18:07:16'),
(10, 4, 'Capon', 3.000, 292.800, '2026-04-16 13:23:14', '2026-04-16 13:23:14'),
(11, 4, 'Pecho doble', 6.000, 70.000, '2026-04-16 13:23:14', '2026-04-16 13:23:14'),
(12, 4, 'Carre', 6.000, 35.000, '2026-04-16 13:23:14', '2026-04-16 13:23:14'),
(13, 5, 'Capon', 2.000, 206.200, '2026-04-16 13:41:22', '2026-04-16 13:41:22'),
(14, 6, 'Capon', 2.000, 159.000, '2026-04-23 14:12:37', '2026-04-23 14:12:37'),
(15, 6, 'Capon', 1.000, 100.000, '2026-04-23 14:20:06', '2026-04-23 14:20:06'),
(16, 7, 'Capon', 1.000, 120.000, '2026-04-23 15:01:46', '2026-04-23 15:01:46'),
(17, 7, 'Capon', 1.000, 115.500, '2026-05-12 05:06:37', '2026-05-12 05:06:37'),
(18, 7, 'Capon', 1.000, 1350.000, '2026-05-12 10:50:17', '2026-05-12 10:50:17'),
(19, 7, 'Capon', 1.000, 100.900, '2026-06-02 22:16:18', '2026-06-02 22:16:18'),
(20, 9, 'Capon', 1.000, 138.000, '2026-06-02 22:30:19', '2026-06-02 22:30:19'),
(21, 10, 'Capon', 1.000, 102.600, '2026-06-16 21:35:17', '2026-06-16 21:35:17'),
(22, 11, 'Capon', 1.000, 95.600, '2026-06-23 21:14:40', '2026-06-23 21:14:40'),
(23, 12, 'Capon', 1.000, 130.000, '2026-06-28 15:11:10', '2026-06-28 15:11:10'),
(24, 13, 'Capon', 1.000, 130.000, '2026-06-28 16:33:59', '2026-06-28 16:33:59'),
(25, 14, 'Capon', 1.000, 147.000, '2026-06-29 17:21:14', '2026-06-29 17:21:14'),
(26, 16, 'Capon', 1.000, 124.000, '2026-07-06 00:34:33', '2026-07-06 00:34:33'),
(27, 16, 'Capon', 1.000, 120.500, '2026-07-06 01:09:58', '2026-07-06 01:09:58'),
(28, 17, 'Capon', 1.000, 99.600, '2026-07-08 23:44:55', '2026-07-08 23:44:55');

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
(1, 'Pecho doble', 'propio', 1, 1, 500, 10.50, 'UN'),
(2, 'Carre', 'propio', 1, 1, 500, 10.50, 'UN'),
(3, 'Jamon', 'propio', 1, 1, 500, 10.50, 'UN'),
(4, 'Paletas', 'propio', 1, 1, 500, 10.50, 'UN'),
(5, 'Capon', 'externo', 1, 1, 350, 10.50, 'UN'),
(6, 'Cabezas', 'propio', 1, 1, 350, 27.00, 'UN'),
(300, 'Bondiola', 'propio', 1, 1, 500, 27.00, 'UN'),
(305, 'Jamon tubo', 'propio', 1, 1, 250, 27.00, 'UN'),
(400, 'Tapa', 'propio', 1, 1, 500, 27.00, 'KG'),
(600, 'Carne cabeza', 'propio', 1, 1, 250, 27.00, 'KG'),
(900, 'Churrasco', 'propio', 1, 1, 250, 27.00, 'KG'),
(1000, 'Cinta lomo', 'propio', 1, 1, 100, 10.50, 'KG'),
(1300, 'Cuero', 'propio', 1, 1, 300, 27.00, 'KG'),
(1600, 'Grasa', 'propio', 1, 1, 500, 27.00, 'KG'),
(1700, 'Huesos', 'propio', 1, 1, 1000, 27.00, 'KG'),
(2100, 'Lengua', 'propio', 1, 1, 60, 27.00, 'KG'),
(2200, 'Matambre', 'propio', 1, 1, 500, 27.00, 'UN'),
(2400, 'Orejas', 'propio', 1, 1, 600, 10.50, 'KG'),
(3100, 'Papada', 'propio', 1, 1, 500, 10.50, 'KG'),
(3200, 'Patas', 'propio', 1, 1, 1000, 27.00, 'KG'),
(3301, 'Pecho simple', 'propio', 1, 1, 100, 27.00, 'UN'),
(3302, 'Pecho simple + matambre', 'propio', 1, 1, 200, 27.00, 'UN'),
(3304, 'Pecho mal cortado', 'propio', 1, 1, 100, 10.50, 'UN'),
(3700, 'Rabo', 'propio', 1, 1, 50, 10.50, 'KG'),
(3900, 'Recortes', 'propio', 1, 1, 1000, 27.00, 'KG'),
(4100, 'Tocino', 'propio', 1, 1, 1000, 27.00, 'KG'),
(10104, 'Solomillo', 'propio', 1, 1, 300, 10.50, 'KG'),
(10106, 'Jamon crudo', 'propio', 1, 1, 250, 27.00, 'UN'),
(10108, 'Unto', 'propio', 1, 1, 200, 27.00, 'KG'),
(14401, 'Codillo', 'propio', 1, 1, 150, 27.00, 'KG'),
(15000, 'Churrasco papada', 'propio', 1, 1, 250, 27.00, 'KG'),
(17000, 'Anqueta', 'propio', 1, 1, 100, 27.00, 'KG'),
(17001, 'Pulpa jamón 5M', 'propio', 1, 1, 2000, 27.00, 'KG'),
(17002, 'Pulpa paleta S/P', 'propio', 1, 1, 2000, 27.00, 'KG'),
(17003, 'Pecho con cuero', 'propio', 1, 1, 100, 10.50, 'UN'),
(17004, 'Garron', 'propio', 1, 1, 300, 10.50, 'KG'),
(17005, 'Careta', 'propio', 1, 1, 100, 10.50, 'KG'),
(17006, 'Pulpa jamon', 'propio', 1, 1, 1000, 10.50, 'KG'),
(17007, 'Pulpa paleta', 'propio', 1, 1, 1000, 10.50, 'KG'),
(17008, 'Panceta pianito', 'propio', 1, 1, 300, 10.50, 'UN'),
(17009, 'Panceta plana', 'propio', 1, 1, 300, 10.50, 'UN'),
(17010, 'Riñon', 'propio', 1, 1, 600, 10.50, 'KG'),
(17011, 'Ribs', 'propio', 1, 1, 300, 10.50, 'KG'),
(19500, 'Punta de pecho', 'propio', 1, 1, 300, 10.50, 'UN'),
(19501, 'Tapita paleta', 'propio', 1, 1, 500, 10.50, 'KG'),
(19502, 'Recorte congelado', 'propio', 2, 1, 500, 10.50, 'KG'),
(19503, 'Bondiola Cong Tremn', 'propio', 2, 1, 200, 10.50, 'UN'),
(19504, 'Papada Congelada', 'propio', 2, 1, 500, 10.50, 'KG'),
(19505, 'Carre Congelado', 'propio', 2, 1, 300, 10.50, 'UN'),
(19506, 'Bond BR CONG', 'externo', 2, 1, 2500, 10.50, 'UN'),
(19507, 'Bond BR CONG +10', 'externo', 2, 1, 2500, 10.50, 'UN'),
(19508, 'Bond BR CONG +1', 'externo', 2, 1, 2500, 10.50, 'UN'),
(19509, 'Bond BR CONG +20', 'externo', 2, 1, 2500, 10.50, 'UN'),
(19510, 'Suprema BR CONG', 'externo', 2, 1, 2000, 10.50, 'UN');

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
(1, 1, 1, 'Pecho doble', 5800, 20, 'UN', '2026-04-23 15:05:33', '2026-04-23 15:05:33'),
(2, 2, 1, 'Pecho doble', 5800, 10, 'UN', '2026-04-23 15:13:26', '2026-04-23 15:13:26'),
(3, 3, 1, 'Pecho doble', 5800, 5, 'UN', '2026-04-28 20:51:50', '2026-04-28 20:51:50'),
(4, 3, 2, 'Carre', 5800, 2, 'UN', '2026-04-28 20:51:50', '2026-04-28 20:51:50'),
(10, 5, 1, 'Pecho doble', 5800, 1, 'UN', '2026-04-29 13:04:19', '2026-04-29 13:04:19'),
(11, 5, 1, 'Pecho doble', 5800, 1, 'UN', '2026-04-29 13:05:11', '2026-04-29 13:05:11'),
(12, 6, 5, 'Capon', 0, 1, 'UN', '2026-04-29 13:11:58', '2026-04-29 13:11:58');

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
(1, 'FRESCOS');

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
(1, 'Capon', 0, 5, 'FRESCOS', 0.0000000000000568434),
(2, 'Pecho doble', 15, 1, 'FRESCOS', 362.6),
(3, 'Carre', 24, 2, 'FRESCOS', 273.6),
(4, 'Jamon', 36, 3, 'FRESCOS', 475.2),
(5, 'Paletas', 48, 4, 'FRESCOS', 280.24),
(6, 'Cabezas', 30, 6, 'FRESCOS', 202.5),
(7, 'Bondiola', 3, 300, 'FRESCOS', 268),
(8, 'Tapa', 0, 400, 'FRESCOS', 21.9),
(9, 'Churrasco', 0, 900, 'FRESCOS', 55.5),
(10, 'Cuero', 0, 1300, 'FRESCOS', 673),
(11, 'Grasa', 0, 1600, 'FRESCOS', 755.4),
(12, 'Huesos', 0, 1700, 'FRESCOS', 852),
(13, 'Lengua', 0, 2100, 'FRESCOS', 3.3),
(14, 'Recortes', 0, 3900, 'FRESCOS', 1029),
(15, 'Patas', 80, 3200, 'FRESCOS', 12.8),
(16, 'Churrasco papada', 0, 15000, 'FRESCOS', 65),
(17, 'Pecho simple', 1, 3301, 'FRESCOS', 30.5);

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
(69, 400, 2100, 0.02, 'kg'),
(70, 400, 600, 0.40, 'kg'),
(71, 400, 2400, 0.10, 'kg'),
(72, 700, 1000, 1.00, 'unidad'),
(73, 700, 10104, 0.80, 'kg'),
(74, 700, 19411, 0.80, 'kg'),
(75, 2000, 19506, 8.00, 'kg'),
(76, 2000, 16900, 8.00, 'kg'),
(77, 2700, 6300, 0.80, 'kg'),
(78, 2700, 19502, 0.50, 'kg'),
(79, 2700, 6301, 0.80, 'kg'),
(80, 3300, 3903, 1.00, 'unidad'),
(81, 3300, 19408, 1.00, 'unidad'),
(82, 3300, 2200, 1.50, 'kg'),
(83, 19400, 3300, 2.00, 'unidad'),
(84, 19400, 700, 2.00, 'unidad'),
(85, 19400, 300, 2.00, 'unidad'),
(86, 19400, 2000, 2.00, 'unidad'),
(87, 19400, 2700, 2.00, 'unidad'),
(88, 19400, 400, 1.00, 'unidad'),
(89, 19400, 900, 5.00, 'kg'),
(90, 19400, 15000, 5.00, 'kg'),
(91, 19400, 3900, 3.00, 'kg'),
(92, 19400, 19410, 0.40, 'kg'),
(93, 19400, 1300, 3.50, 'kg'),
(94, 19400, 3200, 1.80, 'kg'),
(95, 19400, 1700, 1.80, 'kg'),
(96, 19400, 4100, 3.20, 'kg'),
(97, 19400, 1600, 4.00, 'kg'),
(98, 19400, 10108, 1.80, 'kg'),
(117, 3, 17001, 5.50, 'kg'),
(118, 4, 17002, 4.50, 'kg'),
(119, 5, 1, 2.00, 'unidad'),
(120, 5, 2, 2.00, 'unidad'),
(121, 5, 3, 2.00, 'unidad'),
(122, 5, 4, 2.00, 'unidad'),
(123, 5, 6, 1.00, 'unidad'),
(124, 5, 300, 2.00, 'unidad'),
(125, 5, 400, 0.60, 'kg'),
(126, 5, 600, 0.60, 'kg'),
(127, 5, 1300, 10.00, 'kg'),
(128, 5, 1600, 20.00, 'kg'),
(129, 5, 1700, 100.00, 'kg'),
(130, 5, 2100, 0.14, 'kg'),
(131, 5, 3900, 5.00, 'kg'),
(132, 5, 15000, 5.00, 'kg'),
(133, 5, 4100, 2.00, 'kg'),
(134, 5, 900, 1.80, 'kg');

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
(1, 'AGROPECUARIA LOS RETOÑOS', 'CUIT', '30709138495', 'IVA RESPONSABLE INSCRIPTO', 'PORMAG@PORMAG.COM', '3513884691', '...', 'Argentina', 'Santa Fe', 'San Nicolas', 1),
(2, 'AGROPECUARIA SUR SA', 'CUIT', '30616031526', 'IVA RESPONSABLE INSCRIPTO', 'PORMAG@PORMAG.COM', '3513884691', '...', 'ARGENTINA', 'SANTA FE', '...', 1),
(3, 'CAMURRI SA', 'CUIT', '30615365153', 'IVA RESPONSABLE INSCRIPTO', 'PORMAG@PORMAG.COM', '3513884691', '...', 'ARGENTINA', 'SANTA FE', 'LANDETA', 1),
(4, 'COOP. AGRICOLA GANADERA Y DE SERVICIOS PUBLICOS ARANGUREN', 'CUIT', '30534003761', 'IVA RESPONSABLE INSCRIPTO', 'PORMAG@PORMAG.COM', '3513884691', '...', 'ARGENTINA', 'ENTRE RÍOS', 'VILLA ARANGUREN', 1),
(5, 'COSTA RIO SRL', 'CUIT', '30711315590', 'IVA RESPONSABLE INSCRIPTO', 'NACHOCIRACO@GMAIL.COM', '2474683204', '...', 'Argentina', 'Buenos Aires', 'SALTO', 1),
(6, 'ESTABLECIMIENTO QUEBRACHAL SA', 'CUIT', '30709902160', 'IVA RESPONSABLE INSCRIPTO', 'FMMASSELLO@LIVE.COM', '2477586532', '...', 'Argentina', 'Buenos Aires', 'PERGAMINO', 1),
(7, 'FUMISEM SA', 'CUIT', '30571702246', 'IVA RESPONSABLE INSCRIPTO', 'PORMAG@PORMAG.COM', '3513884691', '...', 'ARGENTINA', 'SANTA FE', 'VILLA CAÑA', 1),
(8, 'GERARDO Y SERGIO CARATTOLI', 'CUIT', '30668473179', 'IVA RESPONSABLE INSCRIPTO', 'JULIETAZARATE@CARNEB.COM.AR', '3468437589', '...', 'Argentina', 'Córdoba', 'MONTE MAIZ', 1),
(9, 'ISOWEAN SA', 'CUIT', '30710142781', 'IVA RESPONSABLE INSCRIPTO', 'PORMAG@PORMAG.COM', '3513884691', '...', 'ARGENTINA', 'SANTA FE', '...', 1),
(10, 'LENA SCPA', 'CUIT', '30561787243', 'IVA RESPONSABLE INSCRIPTO', 'PORMAG@PORMAG.COM', '3513884691', '...', 'ARGENTINA', 'BUENOS AIRES', 'PEHUAJO', 1),
(11, 'LOS ODWYER SA', 'CUIT', '30708036907', 'IVA RESPONSABLE INSCRIPTO', 'PORMAG@PORMAG.COM', '3513884691', '...', 'Argentina', 'Entre Ríos', 'COLON', 1),
(12, 'MIGUEL A BENATTI Y ANA M CHAO OCA SH', 'CUIT', '30693338979', 'IVA RESPONSABLE INSCRIPTO', 'PORMAG@PORMAG.COM', '3513884691', '...', 'ARGENTINA', 'BUENOS AIRES', 'LA VIOLETA', 1),
(13, 'NUTRIMAS SA', 'CUIT', '30711359091', 'IVA RESPONSABLE INSCRIPTO', 'PORMAG@PORMAG.COM', '3513884691', '...', 'ARGENTINA', 'SANTA FE', 'MURPHY', 1),
(14, 'FADEL SA', 'CUIT', '30708142677', 'IVA RESPONSABLE INSCRIPTO', 'PAGOS@TREMNSRL.COM.AR', '3447434545', '...', 'Argentina', 'Entre Ríos', 'COLON', 1),
(15, 'MAMASAF', 'CUIT', '...', 'SUJETO NO CATEGORIZADO', 'PAGOS@TREMNSRL.COM.AR', '2478503028', '...', 'Argentina', 'Buenos Aires', 'ARRECIFES', 1),
(16, 'COTAGRO COOPERATIVA AGROPECUARIA LIMITADA', 'CUIT', '30527151453', 'IVA RESPONSABLE INSCRIPTO', 'PORMAG@PORMAG.COM', '3513884691', '...', 'ARGENTINA', 'CÓRDOBA', 'CORDOBA', 1);

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
(1, '2026-04-29', 'M', 'Pablo I', '2026-04-29 13:16:50');

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
(1, 1, 3, 'ALIMENTOS MORENO', 'Buenos aires'),
(2, 1, 2, 'BELLOTAS', 'Buenos aires'),
(3, 1, 1, 'BELLOTAS', 'Buenos aires');

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
(1, 'EFECTIVO'),
(2, 'CHEQUE - ECHEQ'),
(3, 'TRANSFERENCIA');

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
(1, '1', 'AGUSTIN PRETTI', 'Buenos Aires', 'SAN NICOLAS', 'DAMASO VALDEZ ', '2005', '', '', 1, '2026-01-07 14:26:08', '2026-01-07 14:26:08');

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
(1, 'CARRO DE CORTES Nº1', 29),
(2, 'CARRO DE CORTE Nº2', 29.5),
(3, 'CARRO DE CORTE Nº3', 26.5),
(4, 'CARRO DE CORTE Nº4', 27),
(5, 'CARRO DE CORTE Nº5', 36.5),
(6, 'CARRO DE CORTE Nº6', 33),
(7, 'CARRO DE CORTE Nº7', 27.5),
(8, 'CARRO DE CORTE Nº8', 27),
(9, 'CARRO DE CORTE Nº9', 33),
(10, 'CARRO DE CORTE Nº10', 26.5),
(11, 'CARRO DE CORTE Nº11', 36),
(12, 'CARRO DE CORTE Nº12', 32.5),
(13, 'CARRO DE CORTE Nº13', 29),
(14, 'CARRO DE CORTE Nº14', 29),
(15, 'CARRO DE CORTE Nº15', 27),
(16, 'CARRO DE CORTE Nº16', 29),
(17, 'CARRO DE CORTE Nº17', 36),
(18, 'CARRO DE CORTE Nº18', 28),
(19, 'CARRO DE CORTE Nº19', 31.5),
(20, 'CARRO DE CORTE Nº20', 29),
(21, 'CARRO MANUAL Nº1', 77),
(22, 'CARRO MANUAL Nº2', 53.5),
(23, 'RONDANA CHICA', 2.4),
(24, 'RONDANA GRANDE', 3.4),
(25, 'BANDEJAS', 2),
(26, 'CARROS (BOND/TOC) Nº1', 50.5),
(27, 'CARROS (BOND/TOC) Nº2', 51.5),
(28, 'CARROS (BOND/TOC) Nº3', 50.5),
(29, 'CARROS (BOND/TOC) Nº4', 51),
(30, 'CARROS (BOND/TOC) Nº5', 50.5),
(31, 'CARROS (BOND/TOC) Nº6', 49.5),
(32, 'CARROS (BOND/TOC) Nº7', 50.5),
(33, 'CARROS (BOND/TOC) Nº8', 50.5),
(34, 'BIN Nº1', 39),
(35, 'BIN Nº2', 32.5),
(36, 'BIN Nº3', 37),
(37, 'BIN Nº4', 38.5),
(38, 'BIN Nº5', 38),
(39, 'BIN Nº6', 34),
(40, 'BIN Nº7', 36.5),
(41, 'BIN Nº8', 38),
(42, 'BIN Nº9', 33),
(43, 'BIN Nº10', 39.5),
(44, 'BIN Nº11', 36.5),
(45, 'BIN Nº12', 38.5),
(46, 'BIN Nº13', 36),
(47, 'BIN Nº14', 36),
(48, 'BIN Nº15', 38),
(49, 'BIN Nº16', 39),
(50, 'BIN Nº17', 38),
(51, 'BIN Nº18', 35),
(52, 'BIN Nº19', 38),
(53, 'BIN Nº20', 36),
(54, 'BIN Nº21', 38.5),
(55, 'BIN Nº22', 38.5),
(56, 'BIN Nº23', 38.5),
(57, 'BIN Nº24', 31),
(58, 'BIN Nº25', 31.5),
(59, 'BIN Nº26', 31.5),
(60, 'BIN Nº27', 31.5),
(61, 'BIN Nº28', 31),
(62, 'BIN Nº29', 31.5),
(63, 'BIN Nº30', 31.5),
(64, 'BIN Nº31', 31),
(65, 'BIN Nº32', 31),
(66, 'BIN Nº33', 31.5),
(67, 'BIN Nº34', 31.5),
(68, 'BIN Nº35', 31),
(69, 'BIN Nº36', 31.5),
(70, 'BIN Nº37', 31.5),
(71, 'BIN Nº38', 31),
(72, 'BIN Nº39', 42),
(73, 'BIN Nº40', 42),
(74, 'TACHO Nº1', 7),
(75, 'TACHO Nº2', 6),
(76, 'BOLSAS', 0.1),
(77, 'BOLSAS', 0.1),
(78, 'RONDA CHICA C/CADENA', 3.4),
(79, 'RONDA GRANDE C/CADENA', 4.5);

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
(1, 'Iveco', 'M', 'M', 1, '2026-04-29 13:15:43', '2026-04-29 13:15:43');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `user` varchar(255) NOT NULL,
  `rol` varchar(255) NOT NULL,
  `permissions` text DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `create_date` timestamp(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`id`, `user`, `rol`, `permissions`, `password`, `create_date`, `updated_at`) VALUES
(4, 'Admin', 'administrativo', 'dashboard.production,dashboard.sales,dashboard.admin,income.view,income.create,income.edit,income.delete,income.processFlag,process.view,process.create,stock.view,provider.view,provider.create,provider.edit,provider.delete,config.product,sales.orders.view,sales.orders.new,sales.finalOrders.view,sales.finalOrders.new,sales.remits.view,sales.remits.new,sales.clients.view,sales.clients.new,sales.sellers.view,sales.sellers.new,sales.pricelist.view,sales.pricelist.new,sales.routes.new,sales.reports.view,admin.invoices.view,admin.invoices.new,admin.users.view,admin.users.new,admin.reports.view', '$2b$10$gu02NCQf/uH4H.GBMh7awuBTHhetWHoX0F6WR9MGSI0PybQJhtKv.', '2025-12-09 18:32:00.833372', '2025-02-24 18:20:55');

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
-- Indices de la tabla `camara_manual_cuts`
--
ALTER TABLE `camara_manual_cuts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_camara_manual_bill_supplier` (`bill_supplier_id`);

--
-- Indices de la tabla `camara_romaneo_cuts`
--
ALTER TABLE `camara_romaneo_cuts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_camara_romaneo_bill_unique` (`bill_supplier_id`,`unique_code`),
  ADD KEY `idx_camara_romaneo_bill_supplier` (`bill_supplier_id`),
  ADD KEY `idx_camara_romaneo_unique_code` (`unique_code`);

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
  MODIFY `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=46;

--
-- AUTO_INCREMENT de la tabla `bill_suppliers`
--
ALTER TABLE `bill_suppliers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT de la tabla `camara_manual_cuts`
--
ALTER TABLE `camara_manual_cuts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT de la tabla `camara_romaneo_cuts`
--
ALTER TABLE `camara_romaneo_cuts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `clients`
--
ALTER TABLE `clients`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=48;

--
-- AUTO_INCREMENT de la tabla `cuts_detail`
--
ALTER TABLE `cuts_detail`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `cuts_header`
--
ALTER TABLE `cuts_header`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `destinations`
--
ALTER TABLE `destinations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `drivers`
--
ALTER TABLE `drivers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `final_remits`
--
ALTER TABLE `final_remits`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `final_remit_products`
--
ALTER TABLE `final_remit_products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `meat_income_manual_weight`
--
ALTER TABLE `meat_income_manual_weight`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT de la tabla `meat_manual_income`
--
ALTER TABLE `meat_manual_income`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=84;

--
-- AUTO_INCREMENT de la tabla `new_orders`
--
ALTER TABLE `new_orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `order_products_client`
--
ALTER TABLE `order_products_client`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `other_product_manual`
--
ALTER TABLE `other_product_manual`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `payment_conditions`
--
ALTER TABLE `payment_conditions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `preinvoices`
--
ALTER TABLE `preinvoices`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `preinvoice_returns`
--
ALTER TABLE `preinvoice_returns`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `price_lists`
--
ALTER TABLE `price_lists`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `price_list_products`
--
ALTER TABLE `price_list_products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=113;

--
-- AUTO_INCREMENT de la tabla `process_meats`
--
ALTER TABLE `process_meats`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=91;

--
-- AUTO_INCREMENT de la tabla `process_number`
--
ALTER TABLE `process_number`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT de la tabla `productionprocess_subproduction`
--
ALTER TABLE `productionprocess_subproduction`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT de la tabla `products_sell_order`
--
ALTER TABLE `products_sell_order`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `product_categories`
--
ALTER TABLE `product_categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `product_stock`
--
ALTER TABLE `product_stock`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT de la tabla `product_subproducts`
--
ALTER TABLE `product_subproducts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=135;

--
-- AUTO_INCREMENT de la tabla `providers`
--
ALTER TABLE `providers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT de la tabla `roadmap_info`
--
ALTER TABLE `roadmap_info`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `roadmap_info_destinations`
--
ALTER TABLE `roadmap_info_destinations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `sale_conditions`
--
ALTER TABLE `sale_conditions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `sellers`
--
ALTER TABLE `sellers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `tares`
--
ALTER TABLE `tares`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=80;

--
-- AUTO_INCREMENT de la tabla `trucks`
--
ALTER TABLE `trucks`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

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
-- Filtros para la tabla `camara_manual_cuts`
--
ALTER TABLE `camara_manual_cuts`
  ADD CONSTRAINT `fk_camara_manual_bill_supplier` FOREIGN KEY (`bill_supplier_id`) REFERENCES `bill_suppliers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `camara_romaneo_cuts`
--
ALTER TABLE `camara_romaneo_cuts`
  ADD CONSTRAINT `fk_camara_romaneo_bill_supplier` FOREIGN KEY (`bill_supplier_id`) REFERENCES `bill_suppliers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

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
