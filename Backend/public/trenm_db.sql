-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 01-05-2025 a las 20:18:58
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
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `bill_details`
--

INSERT INTO `bill_details` (`id`, `bill_supplier_id`, `type`, `quantity`, `heads`, `createdAt`, `updatedAt`) VALUES
(1, 1, 'Capon', 5, 5, '2025-04-20 15:36:04', '2025-04-20 15:36:04'),
(2, 2, 'Capon', 1, 1, '2025-04-20 20:50:24', '2025-04-20 20:50:24'),
(3, 3, 'Capon', 10, 10, '2025-04-20 21:17:33', '2025-04-20 21:17:33'),
(4, 3, 'Media Res Padrillo', 101, 101, '2025-04-20 21:17:33', '2025-04-20 21:17:33'),
(5, 4, 'Media Res Capon', 50, 50, '2025-04-20 21:18:09', '2025-04-20 21:18:09'),
(6, 5, 'Capon', 1, 1, '2025-04-24 15:05:47', '2025-04-24 15:05:47'),
(7, 6, 'Capon', 3, 3, '2025-04-25 00:06:01', '2025-04-25 00:06:01'),
(8, 7, 'Media Res Capon', 1, 1, '2025-04-29 15:48:36', '2025-04-29 15:48:36'),
(9, 7, 'Media Res Capon', 4, 1, '2025-04-29 15:48:36', '2025-04-29 15:48:36'),
(10, 8, 'Media Res Capon', 1, 1, '2025-04-30 18:32:07', '2025-04-30 18:32:07');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `bill_suppliers`
--

CREATE TABLE `bill_suppliers` (
  `id` int(11) NOT NULL,
  `supplier` varchar(255) NOT NULL,
  `total_weight` varchar(255) NOT NULL,
  `head_quantity` int(11) NOT NULL,
  `romaneo_number` int(255) NOT NULL,
  `income_state` varchar(255) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `check_state` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `bill_suppliers`
--

INSERT INTO `bill_suppliers` (`id`, `supplier`, `total_weight`, `head_quantity`, `romaneo_number`, `income_state`, `createdAt`, `updatedAt`, `check_state`) VALUES
(1, 'EMPRESASOFT', '892', 5, 892, 'manual', '2025-04-20 15:36:04', '2025-04-20 15:36:04', 0),
(2, 'EMPRESASOFT', '456', 1, 456, 'manual', '2025-04-20 20:50:24', '2025-04-20 20:50:24', 0),
(3, 'EMPRESASOFT', '939', 111, 9654, 'romaneo', '2025-04-20 21:17:33', '2025-04-20 21:17:33', 1),
(4, 'EMPRESASOFT', '50000', 50, 968, 'manual', '2025-04-20 21:18:08', '2025-04-20 21:18:08', 0),
(5, 'EMPRESASOFT', '588', 1, 4563, 'manual', '2025-04-24 15:05:47', '2025-04-24 15:05:47', 0),
(6, 'EMPRESASOFT', '459', 3, 459, 'manual', '2025-04-25 00:06:00', '2025-04-25 00:06:00', 0),
(7, 'EMPRESASOFT', '1271', 2, 22528528, 'romaneo', '2025-04-29 15:48:36', '2025-04-29 15:48:36', 1),
(8, 'EMPRESASOFT', '120', 1, 2563, 'manual', '2025-04-30 18:32:07', '2025-04-30 18:32:07', 0);

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
  `net_weight` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `meat_manual_income`
--

INSERT INTO `meat_manual_income` (`id`, `id_bill_suppliers`, `products_name`, `products_garron`, `products_quantity`, `product_head`, `provider_weight`, `gross_weight`, `tare`, `net_weight`) VALUES
(1, 5, 'Media Res Chancha', 1, '1', 1, 11561, 1, 150.3, -149.3),
(10, 5, 'Media Res Capon', 10, '1', 1, 1546160, 11, 0, 11),
(120, 8, 'Capon', 120, '1', 1, 1515, 15616, 150.3, 15465.7),
(515, 5, 'Capon', 515, '515', 515, 515, 515, 2.5, 512.5),
(1256, 8, 'Capon', 1256, '1', 1, 11515, 1515, 150.3, 1364.7),
(6983, 8, 'Media Res Chancha', 6983, '1', 1, 12151, 1515, 2.5, 1512.5),
(12452, 8, 'Media Res Capon', 12452, '1', 1, 1, 1, 2.5, -1.5),
(15154, 8, 'Media Res Capon', 15154, '1', 1, 158652000, 15, 150.3, -135.3),
(15156, 8, 'Media Res Capon', 15156, '1', 1, 11181, 15, 0, 15),
(15615, 8, 'Media Res Capon', 15615, '151', 15156, 151, 151, 2.5, 148.5),
(21114, 8, 'Capon', 21114, '1', 1, 15151, 14145, 2.5, 14142.5),
(35235, 8, 'Media Res Capon', 35235, '1', 1, 1586180, 18518, 150.3, 18367.7);

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
(8, 'ewrwrwerwerwer');

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
  `net_weight` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `process_meats`
--

INSERT INTO `process_meats` (`id`, `type`, `average`, `quantity`, `gross_weight`, `tares`, `net_weight`) VALUES
(1, 'Capon', 36, 89, 8, 2.5, 5.5),
(2, 'Media Res Chancha', 789, 10, 789, 150.3, 638.7),
(3, 'Media Res Capon', 78, 78, 78, 2.5, 75.5),
(4, 'Media Res Capon', 8, 8, 8, 2.5, 5.5);

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
(5, 'Cabezas', 'primario'),
(9, 'Matambre', 'subproducto');

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
(1, 'Caja Plástica', 2.5),
(2, 'Tara2', 150.3);

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
-- Indices de la tabla `bill_details`
--
ALTER TABLE `bill_details`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_bill_details_supplier` (`bill_supplier_id`);

--
-- Indices de la tabla `bill_suppliers`
--
ALTER TABLE `bill_suppliers`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `meat_manual_income`
--
ALTER TABLE `meat_manual_income`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_received_suppliers` (`id_bill_suppliers`);

--
-- Indices de la tabla `observations_meatincome`
--
ALTER TABLE `observations_meatincome`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `process_meats`
--
ALTER TABLE `process_meats`
  ADD PRIMARY KEY (`id`);

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
-- Indices de la tabla `tares`
--
ALTER TABLE `tares`
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
-- AUTO_INCREMENT de la tabla `bill_details`
--
ALTER TABLE `bill_details`
  MODIFY `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `bill_suppliers`
--
ALTER TABLE `bill_suppliers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `process_meats`
--
ALTER TABLE `process_meats`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `products_available`
--
ALTER TABLE `products_available`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `providers`
--
ALTER TABLE `providers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `tares`
--
ALTER TABLE `tares`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `bill_details`
--
ALTER TABLE `bill_details`
  ADD CONSTRAINT `fk_bill_details_supplier` FOREIGN KEY (`bill_supplier_id`) REFERENCES `bill_suppliers` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `meat_manual_income`
--
ALTER TABLE `meat_manual_income`
  ADD CONSTRAINT `fk_meat_income_received_suppliers` FOREIGN KEY (`id_bill_suppliers`) REFERENCES `bill_suppliers` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
