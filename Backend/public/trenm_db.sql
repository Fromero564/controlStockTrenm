-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 17-03-2025 a las 22:49:52
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
-- Estructura de tabla para la tabla `meat_income`
--

CREATE TABLE `meat_income` (
  `id` int(11) NOT NULL,
  `id_received_suppliers` int(11) NOT NULL,
  `products_name` varchar(255) NOT NULL,
  `products_quantity` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `meat_income`
--

INSERT INTO `meat_income` (`id`, `id_received_suppliers`, `products_name`, `products_quantity`) VALUES
(3, 1, 'Capon', '0'),
(4, 1, 'Media Res Capon', '4'),
(5, 1, 'Media Res Chancha', '0'),
(6, 1, 'Media Res Padrillo', '0'),
(7, 1, 'Cabezas', '2');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `products_available`
--

CREATE TABLE `products_available` (
  `id` int(11) NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `product_category` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `products_available`
--

INSERT INTO `products_available` (`id`, `product_name`, `product_category`) VALUES
(1, 'Capon', 'primario'),
(2, 'Media Res Capon', 'primario'),
(3, 'Media Res Chancha', 'primario'),
(4, 'Media Res Padrillo', 'primario'),
(5, 'Cabezas', 'primario');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `providers`
--

CREATE TABLE `providers` (
  `id` int(11) NOT NULL,
  `provider_name` varchar(255) NOT NULL,
  `provider_code` varchar(255) NOT NULL,
  `provider_type_id` varchar(255) NOT NULL,
  `provider_id_number` int(11) NOT NULL,
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

INSERT INTO `providers` (`id`, `provider_name`, `provider_code`, `provider_type_id`, `provider_id_number`, `provider_iva_condition`, `provider_email`, `provider_phone`, `provider_adress`, `provider_country`, `provider_province`, `provider_location`) VALUES
(1, 'EMPRESASOFT', '24', 'CUIT', 32525, 'SUJETO NO CATEGORIZADO', 'empresasoft@soft', '35252', 'AV.SAVIO 545', 'ARGENTINA', 'BUENOS AIRES', 'SAN NICOLAS');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `received_suppliers`
--

CREATE TABLE `received_suppliers` (
  `id` int(11) NOT NULL,
  `supplier` varchar(255) NOT NULL,
  `total_weight` varchar(255) NOT NULL,
  `head_quantity` int(11) NOT NULL,
  `unit_weight` varchar(255) NOT NULL,
  `romaneo_number` int(255) NOT NULL,
  `internal_number` int(255) NOT NULL,
  `income_state` varchar(255) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `check_state` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `received_suppliers`
--

INSERT INTO `received_suppliers` (`id`, `supplier`, `total_weight`, `head_quantity`, `unit_weight`, `romaneo_number`, `internal_number`, `income_state`, `createdAt`, `updatedAt`, `check_state`) VALUES
(1, 'Proveedor_3', '961.49', 20, 'libra', 9986, 70559, 'romaneo', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 1),
(2, 'Proveedor_3', '925.63', 30, 'kg', 5913, 23249, 'manual', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 1),
(3, 'Proveedor_7', '26.17', 97, 'libra', 1406, 44918, 'romaneo', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 0),
(4, 'Proveedor_8', '521.39', 31, 'gramos', 9414, 95896, 'manual', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 1),
(5, 'Proveedor_6', '567.81', 17, 'gramos', 7571, 53299, 'manual', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 0),
(6, 'Proveedor_7', '141.43', 71, 'gramos', 6177, 85694, 'romaneo', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 0),
(7, 'Proveedor_5', '911.19', 42, 'kg', 6047, 77081, 'manual', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 0),
(8, 'Proveedor_8', '13.72', 55, 'libra', 4594, 59411, 'romaneo', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 1),
(9, 'Proveedor_1', '676.42', 24, 'gramos', 7242, 98974, 'manual', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 0),
(10, 'Proveedor_4', '85.29', 65, 'kg', 9977, 29840, 'manual', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 1),
(11, 'Proveedor_7', '42.34', 93, 'libra', 8215, 39187, 'manual', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 0),
(12, 'Proveedor_5', '624.08', 56, 'libra', 2610, 46352, 'romaneo', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 1),
(13, 'Proveedor_3', '748.05', 18, 'gramos', 6940, 22087, 'romaneo', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 1),
(14, 'Proveedor_1', '566.86', 66, 'libra', 9453, 85616, 'romaneo', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 1),
(15, 'Proveedor_1', '770.44', 99, 'libra', 8233, 22221, 'manual', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 1),
(16, 'Proveedor_8', '314.82', 86, 'gramos', 9832, 48805, 'manual', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 0),
(17, 'Proveedor_6', '568.45', 92, 'gramos', 1115, 45409, 'manual', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 1),
(18, 'Proveedor_3', '257.56', 63, 'kg', 2490, 23563, 'manual', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 0),
(19, 'Proveedor_3', '32.26', 96, 'kg', 2789, 28315, 'manual', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 0),
(20, 'Proveedor_10', '833.73', 16, 'libra', 6768, 97919, 'manual', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 1),
(21, 'Proveedor_8', '686.22', 69, 'kg', 1670, 51385, 'manual', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 1),
(22, 'Proveedor_2', '246.61', 92, 'gramos', 2690, 35950, 'romaneo', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 1),
(23, 'Proveedor_6', '38.52', 47, 'gramos', 6386, 78453, 'manual', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 0),
(24, 'Proveedor_7', '292.71', 58, 'libra', 7112, 81124, 'manual', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 1),
(25, 'Proveedor_5', '939.38', 31, 'libra', 9694, 28839, 'manual', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 1),
(26, 'Proveedor_1', '861.54', 89, 'libra', 2321, 26257, 'manual', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 1),
(27, 'Proveedor_6', '165.48', 38, 'libra', 9051, 62701, 'manual', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 0),
(28, 'Proveedor_9', '369.40', 97, 'libra', 4984, 42762, 'romaneo', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 1),
(29, 'Proveedor_6', '196.43', 11, 'libra', 5648, 63584, 'romaneo', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 0),
(30, 'Proveedor_1', '620.72', 62, 'gramos', 6764, 57068, 'romaneo', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 1),
(31, 'Proveedor_6', '963.30', 11, 'libra', 4276, 80298, 'manual', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 0),
(32, 'Proveedor_10', '535.11', 98, 'gramos', 2486, 90449, 'manual', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 1),
(33, 'Proveedor_2', '98.43', 67, 'libra', 6797, 44682, 'manual', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 0),
(34, 'Proveedor_6', '594.13', 18, 'libra', 7582, 51098, 'manual', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 1),
(35, 'Proveedor_8', '549.05', 20, 'gramos', 3908, 41833, 'romaneo', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 0),
(36, 'Proveedor_8', '513.03', 32, 'gramos', 9866, 34075, 'manual', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 0),
(37, 'Proveedor_9', '201.74', 85, 'libra', 5849, 34404, 'romaneo', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 1),
(38, 'Proveedor_8', '79.13', 47, 'gramos', 9333, 49371, 'romaneo', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 0),
(39, 'Proveedor_1', '280.99', 55, 'libra', 4002, 31999, 'manual', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 0),
(40, 'Proveedor_7', '282.87', 61, 'kg', 8395, 51344, 'romaneo', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 0),
(41, 'Proveedor_4', '72.30', 59, 'libra', 7284, 87766, 'romaneo', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 0),
(42, 'Proveedor_1', '456.97', 20, 'gramos', 3900, 39718, 'romaneo', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 1),
(43, 'Proveedor_5', '971.14', 23, 'kg', 5455, 22979, 'manual', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 0),
(44, 'Proveedor_1', '142.23', 99, 'libra', 7834, 83760, 'manual', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 0),
(45, 'Proveedor_10', '560.35', 34, 'gramos', 4467, 29419, 'romaneo', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 1),
(46, 'Proveedor_6', '364.39', 54, 'libra', 9531, 39591, 'romaneo', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 0),
(47, 'Proveedor_10', '12.89', 58, 'libra', 9591, 33111, 'manual', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 0),
(48, 'Proveedor_2', '977.85', 99, 'gramos', 4645, 23956, 'romaneo', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 0),
(49, 'Proveedor_10', '777.23', 65, 'libra', 2209, 84893, 'manual', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 1),
(50, 'Proveedor_8', '464.32', 32, 'kg', 1835, 76114, 'romaneo', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 0),
(51, 'Proveedor_6', '423.72', 63, 'gramos', 3352, 61980, 'manual', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 1),
(52, 'Proveedor_9', '148.30', 13, 'gramos', 5528, 52837, 'manual', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 0),
(53, 'Proveedor_1', '482.11', 74, 'libra', 5446, 45666, 'romaneo', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 1),
(54, 'Proveedor_5', '421.96', 17, 'libra', 9956, 79284, 'manual', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 0),
(55, 'Proveedor_3', '483.36', 72, 'libra', 8330, 98064, 'romaneo', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 0),
(56, 'Proveedor_1', '973.23', 31, 'libra', 1694, 74761, 'romaneo', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 1),
(57, 'Proveedor_1', '981.04', 56, 'libra', 3763, 98843, 'romaneo', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 0),
(58, 'Proveedor_9', '598.11', 63, 'gramos', 4079, 94437, 'manual', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 0),
(59, 'Proveedor_8', '42.71', 63, 'libra', 7739, 97252, 'manual', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 0),
(60, 'Proveedor_8', '548.51', 30, 'kg', 8247, 48426, 'romaneo', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 1),
(61, 'Proveedor_3', '821.47', 94, 'gramos', 8498, 49150, 'romaneo', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 1),
(62, 'Proveedor_1', '595.10', 59, 'gramos', 6154, 36179, 'romaneo', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 1),
(63, 'Proveedor_3', '503.22', 76, 'gramos', 9479, 60182, 'manual', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 1),
(64, 'Proveedor_1', '928.19', 42, 'gramos', 7315, 54994, 'romaneo', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 0),
(65, 'Proveedor_9', '914.83', 53, 'kg', 9144, 24693, 'manual', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 1),
(66, 'Proveedor_10', '99.16', 33, 'libra', 6255, 31057, 'manual', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 0),
(67, 'Proveedor_9', '124.70', 69, 'gramos', 9155, 63494, 'manual', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 0),
(68, 'Proveedor_10', '107.50', 60, 'libra', 8953, 79244, 'romaneo', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 0),
(69, 'Proveedor_1', '42.35', 36, 'kg', 2972, 37968, 'romaneo', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 1),
(70, 'Proveedor_4', '400.48', 65, 'libra', 9882, 27655, 'manual', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 0),
(71, 'Proveedor_6', '876.00', 91, 'libra', 9990, 42827, 'romaneo', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 0),
(72, 'Proveedor_6', '28.40', 73, 'kg', 8887, 40925, 'manual', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 1),
(73, 'Proveedor_1', '220.01', 59, 'kg', 6816, 66056, 'manual', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 1),
(74, 'Proveedor_4', '293.07', 71, 'kg', 5489, 55169, 'manual', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 0),
(75, 'Proveedor_7', '635.11', 36, 'libra', 6148, 97435, 'romaneo', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 1),
(76, 'Proveedor_7', '858.95', 87, 'kg', 3381, 78144, 'manual', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 0),
(77, 'Proveedor_5', '838.62', 75, 'gramos', 3498, 37367, 'romaneo', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 1),
(78, 'Proveedor_5', '670.77', 25, 'kg', 6182, 47945, 'romaneo', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 0),
(79, 'Proveedor_3', '754.71', 88, 'kg', 6982, 77594, 'manual', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 1),
(80, 'Proveedor_5', '14.81', 35, 'gramos', 1365, 48100, 'manual', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 0),
(81, 'Proveedor_4', '98.33', 66, 'libra', 1067, 31999, 'manual', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 0),
(82, 'Proveedor_9', '227.75', 53, 'libra', 9564, 43522, 'manual', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 0),
(83, 'Proveedor_9', '47.79', 98, 'kg', 4991, 42172, 'romaneo', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 0),
(84, 'Proveedor_7', '974.66', 55, 'kg', 5095, 81549, 'romaneo', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 0),
(85, 'Proveedor_7', '967.80', 53, 'kg', 4565, 61878, 'romaneo', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 1),
(86, 'Proveedor_2', '196.69', 47, 'gramos', 5572, 42442, 'manual', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 1),
(87, 'Proveedor_4', '946.89', 11, 'kg', 9886, 89992, 'romaneo', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 0),
(88, 'Proveedor_4', '443.63', 44, 'libra', 9144, 49599, 'romaneo', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 1),
(89, 'Proveedor_9', '435.30', 15, 'gramos', 7438, 50410, 'manual', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 1),
(90, 'Proveedor_3', '590.59', 50, 'libra', 5910, 49097, 'romaneo', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 1),
(91, 'Proveedor_7', '260.72', 51, 'gramos', 4192, 52226, 'manual', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 1),
(92, 'Proveedor_8', '663.07', 69, 'libra', 2120, 70950, 'manual', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 0),
(93, 'Proveedor_3', '28.15', 14, 'kg', 6108, 76084, 'manual', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 1),
(94, 'Proveedor_5', '975.43', 40, 'kg', 4107, 76259, 'romaneo', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 0),
(95, 'Proveedor_1', '230.56', 64, 'kg', 8673, 56299, 'manual', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 0),
(96, 'Proveedor_5', '591.54', 47, 'libra', 8195, 78506, 'romaneo', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 0),
(97, 'Proveedor_2', '273.08', 25, 'libra', 3573, 92690, 'manual', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 1),
(98, 'Proveedor_4', '142.88', 32, 'gramos', 3113, 55225, 'romaneo', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 0),
(99, 'Proveedor_8', '163.81', 52, 'kg', 1085, 69863, 'romaneo', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 1),
(100, 'Proveedor_3', '211.40', 76, 'gramos', 9135, 43199, 'manual', '2025-03-13 14:53:34', '2025-03-13 14:53:34', 1),
(101, 'Monsanto', '150', 3, 'kg', 25698, 32584, 'romaneo', '2025-03-15 15:55:43', '2025-03-15 15:55:43', 1),
(102, 'Monsanto', '50', 5, 'kg', 2978, 2978, 'romaneo', '2025-03-15 15:56:18', '2025-03-15 15:56:18', 1),
(103, 'Monsanto', '300', 4, 'kg', 2780, 2780, 'romaneo', '2025-03-15 15:58:09', '2025-03-15 15:58:09', 1),
(104, 'Monsanto', '120', 4, 'kg', 324235523, 2235235, 'romaneo', '2025-03-15 16:02:51', '2025-03-15 16:02:51', 1),
(105, 'Monsanto', '150', 30, 'kg', 25, 25, 'romaneo', '2025-03-15 16:05:29', '2025-03-15 16:05:29', 1),
(106, 'Monsanto', '150', 30, 'kg', 25, 25, 'romaneo', '2025-03-15 16:07:22', '2025-03-15 16:07:22', 1),
(107, 'Monsanto', '20', 20, 'kg', 20, 20, 'romaneo', '2025-03-15 16:07:43', '2025-03-15 16:07:43', 1),
(108, 'Monsanto', '20', 20, 'kg', 20, 20, 'romaneo', '2025-03-15 16:09:06', '2025-03-15 16:09:06', 1),
(109, 'Monsanto', '20', 20, 'kg', 20, 20, 'romaneo', '2025-03-15 16:10:12', '2025-03-15 16:10:12', 1),
(110, 'Otro', '960', 10, 'kg', 25346, 25346, 'manual', '2025-03-16 15:41:19', '2025-03-16 15:41:19', 0),
(111, 'Monsanto', '45', 45, 'kg', 45, 45, 'manual', '2025-03-16 16:31:24', '2025-03-16 16:31:24', 0),
(112, 'Monsanto', '963', 63, 'kg', 20, 20, 'manual', '2025-03-17 17:53:55', '2025-03-17 17:53:55', 0),
(113, 'Monsanto', '890', 890, 'kg', 890, 890, 'manual', '2025-03-17 17:59:00', '2025-03-17 17:59:00', 0),
(114, 'Monsanto', '780', 780, 'kg', 780, 780, 'manual', '2025-03-17 20:29:25', '2025-03-17 20:29:25', 0),
(115, 'Monsanto', '789', 789, 'kg', 79, 79, 'manual', '2025-03-17 21:09:11', '2025-03-17 21:09:11', 0);

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
(1, 'Pomelo', 'operario', '$2b$10$u6zZlv0TR18YrIKmHN7zx.4mX5/ri9LgxLPjUJtVYPJNy6HaxN2gu', '2025-02-15 16:45:07.000000', '2025-02-15 16:45:07'),
(2, 'prueba', 'operario', '$2b$10$nRnA3dW1xC/Uctd2LpFvA.DXKCBp.5M5g24GtKICc0QfOTTL19k1S', '2025-02-15 16:47:03.000000', '2025-02-15 16:47:03'),
(3, 'Pomelo564', 'administrativo', '$2b$10$Ykh1vjyAVrL80dZ6C5yZ/OkUQL5d.VqRajQ1SGSS4lIA5UhvJkq9S', '2025-02-15 17:03:18.000000', '2025-02-15 17:03:18'),
(4, 'Admin', 'administrativo', '$2b$10$gu02NCQf/uH4H.GBMh7awuBTHhetWHoX0F6WR9MGSI0PybQJhtKv.', '2025-02-24 18:20:55.000000', '2025-02-24 18:20:55'),
(5, 'Fernando', 'operario', '$2b$10$iKkoW5DWKE/QFZpuWjJHIuDRwTvKA.TGDyDeMhn5Mhzp2HtOOogJK', '2025-02-24 19:43:25.000000', '2025-02-24 19:43:25');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `meat_income`
--
ALTER TABLE `meat_income`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_received_suppliers` (`id_received_suppliers`);

--
-- Indices de la tabla `products_available`
--
ALTER TABLE `products_available`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `providers`
--
ALTER TABLE `providers`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `received_suppliers`
--
ALTER TABLE `received_suppliers`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `meat_income`
--
ALTER TABLE `meat_income`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `products_available`
--
ALTER TABLE `products_available`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `providers`
--
ALTER TABLE `providers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `received_suppliers`
--
ALTER TABLE `received_suppliers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=116;

--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `meat_income`
--
ALTER TABLE `meat_income`
  ADD CONSTRAINT `fk_meat_income_received_suppliers` FOREIGN KEY (`id_received_suppliers`) REFERENCES `received_suppliers` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
